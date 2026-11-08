import React, { useMemo, useEffect } from "react";
import { Volume2, FileText, GraduationCap, Home as HomeIcon, ShoppingCart, Siren, CreditCard } from "lucide-react";
import { phrases, phraseCategories } from "../data/phrases.js";
import { speak } from "../lib/speech.js";
import { navigate, useRoute } from "../lib/router.jsx";

// Icône par catégorie (les données restent de simples chaînes/objets dans data/phrases.js ;
// le mapping vers un composant vectoriel se fait ici, côté affichage).
const CATEGORY_ICONS = {
  visa: FileText,
  univ: GraduationCap,
  logement: HomeIcon,
  quotidien: ShoppingCart,
  urgence: Siren,
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
      <p className="subtitle">Pour ton arrivée en Russie : visa, université, logement, vie de tous les jours. À consulter au besoin, comme un mini guide de voyage.</p>

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
            <button type="button" className="play-btn phrase-play" onClick={()=> speak(p.ru)} aria-label={`Écouter : ${p.fr}`}><Volume2 size={16} aria-hidden="true"/></button>
          </div>
        ))}
      </div>
    </section>
  );
}
