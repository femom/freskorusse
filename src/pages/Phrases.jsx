import React, { useMemo, useEffect } from "react";
import {
  FileText, GraduationCap, Home as HomeIcon, ShoppingCart, Siren,
  CreditCard, LifeBuoy, HandMetal, UserCircle, Coffee, MapPin,
  ShoppingBag, MessageSquare, Puzzle,
} from "lucide-react";
import { phrases, phraseCategories } from "../data/phrases.js";
import SpeakButton from "../components/SpeakButton.jsx";
import { navigate, useRoute } from "../lib/router.jsx";

// Icône par catégorie (les données restent de simples chaînes/objets dans data/phrases.js ;
// le mapping vers un composant vectoriel se fait ici, côté affichage).
const CATEGORY_ICONS = {
  moules: Puzzle,
  secours: LifeBuoy,
  saluer: HandMetal,
  identite: UserCircle,
  univ: GraduationCap,
  restaurant: Coffee,
  deplacement: MapPin,
  courses: ShoppingBag,
  reactions: MessageSquare,
  visa: FileText,
  urgence: Siren,
  logement: HomeIcon,
  quotidien: ShoppingCart,
  argent: CreditCard,
};

// La catégorie active vient de l'URL (#/phrases/logement) : on peut partager ou
// retrouver une catégorie, et la recherche globale ouvre directement la bonne
// (avec ?id=… pour mettre la phrase trouvée en évidence).
export default function Phrases(){
  const route = useRoute();
  const activeCat = phraseCategories.some(c=> c.key === route.sub) ? route.sub : phraseCategories[0].key;
  const highlightId = route.query.get("id");

  const filtered = useMemo(()=> phrases.filter(p=> p.category === activeCat), [activeCat]);

  // Venue de la recherche : fait défiler jusqu'à la phrase trouvée.
  useEffect(()=>{
    if(!highlightId) return;
    const el = document.getElementById("phrase-" + highlightId);
    if(el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlightId, activeCat]);

  return (
    <section>
      <h1 className="title">Phrases utiles</h1>
      <p className="subtitle">{phraseCategories.length} catégories, {phrases.length} phrases pour ton arrivée en Russie : secours, salutations, café, transports, courses, administration et bien plus.</p>

      {/* Changer de catégorie = filtrer : on remplace l'entrée d'historique (le bouton
          Retour ne doit pas rejouer chaque clic d'onglet) et on garde le scroll. */}
      <div className="letter-tabs phrase-tabs" role="group" aria-label="Catégories de phrases">
        {phraseCategories.map(c=>{
          const Icon = CATEGORY_ICONS[c.key];
          const on = activeCat===c.key;
          return (
            <button type="button" key={c.key} aria-pressed={on} className={"letter-tab" + (on ? " active" : "")} onClick={()=> navigate("phrases", c.key, { replace:true, keepScroll:true })}>
              {Icon && <Icon size={14} aria-hidden="true"/>} {c.label}
            </button>
          );
        })}
      </div>

      <div className="phrase-list">
        {filtered.map(p=>(
          <div className={"card phrase-item" + (String(p.id)===highlightId ? " is-highlighted" : "")} id={"phrase-"+p.id} key={p.id}>
            <div className="phrase-ru" lang="ru">{p.ru}</div>
            <div className="phrase-fr">{p.fr}</div>
            {p.prononciation && <div className="phrase-prononciation">{p.prononciation}</div>}
            <SpeakButton text={p.ru} className="play-btn phrase-play" ariaLabel={`Écouter : ${p.fr}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
