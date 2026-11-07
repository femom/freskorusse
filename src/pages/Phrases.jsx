import React, { useState, useMemo } from "react";
import { Volume2, FileText, GraduationCap, Home as HomeIcon, ShoppingCart, Siren, CreditCard } from "lucide-react";
import { phrases, phraseCategories } from "../data/phrases.js";

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

// Réutilise le même moteur de synthèse vocale que la Dictée — voir ce fichier
// pour le détail des limites (voix russe non garantie selon l'appareil).
function speak(text){
  try{
    if(!("speechSynthesis" in window)) return false;
    window.speechSynthesis.cancel();
    // On retire les marques d'accent (́) avant de les donner à la synthèse vocale :
    // certains moteurs les prononcent comme un caractère à part.
    const clean = text.normalize("NFC").replace(/\u0301/g, "");
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "ru-RU";
    const voices = window.speechSynthesis.getVoices();
    const ruVoice = voices.find(v=> v.lang && v.lang.toLowerCase().startsWith("ru"));
    if(ruVoice) u.voice = ruVoice;
    window.speechSynthesis.speak(u);
    return true;
  }catch(e){ return false; }
}

export default function Phrases(){
  const [activeCat, setActiveCat] = useState(phraseCategories[0].key);

  const filtered = useMemo(()=> phrases.filter(p=> p.category === activeCat), [activeCat]);

  return (
    <section>
      <h1 className="title">Phrases utiles</h1>
      <p className="subtitle">Pour ton arrivée en Russie — visa, université, logement, vie de tous les jours. À consulter au besoin, comme un mini guide de voyage.</p>

      <div className="letter-tabs" style={{marginBottom:20}}>
        {phraseCategories.map(c=>{
          const Icon = CATEGORY_ICONS[c.key];
          return (
            <button key={c.key} className={"letter-tab" + (activeCat===c.key ? " active" : "")} onClick={()=> setActiveCat(c.key)} style={{display:"inline-flex", alignItems:"center", gap:6}}>
              {Icon && <Icon size={14}/>} {c.label}
            </button>
          );
        })}
      </div>

      <div className="phrase-list">
        {filtered.map(p=>(
          <div className="card phrase-item" key={p.id}>
            <div className="phrase-ru">{p.ru}</div>
            <div className="phrase-fr">{p.fr}</div>
            <button className="play-btn phrase-play" onClick={()=> speak(p.ru)}><Volume2 size={16}/></button>
          </div>
        ))}
      </div>
    </section>
  );
}
