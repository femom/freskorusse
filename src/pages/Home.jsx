import React from "react";
import { BookOpen, Repeat, Star, MessageCircle, BookMarked, Volume2, Languages } from "lucide-react";

// Les 7 modules présentés en cartes sur la page d'accueil.
// "key" doit correspondre aux clés utilisées dans App.jsx (MODULE_META) pour la navigation.
const MODULES = [
  {key:"cases", icon:BookOpen, color:"var(--accent-cases)", title:"Les cas russes", desc:"6 cas, terminaisons, exemples et leçons interactives."},
  {key:"verbs", icon:Repeat, color:"var(--accent-verbs)", title:"Conjugaison", desc:"62 verbes essentiels — présent, passé, futur, 2 aspects."},
  {key:"bank", icon:Star, color:"var(--accent-bank)", title:"Banque de mots", desc:"285 mots russes proches du français, en flashcards à retourner."},
  {key:"phrases", icon:MessageCircle, color:"var(--accent-phrases)", title:"Phrases utiles", desc:"Visa, université, logement, vie quotidienne — pour ton arrivée."},
  {key:"library", icon:BookMarked, color:"var(--accent-library-b)", title:"Bibliothèque", desc:"Un texte tiré au hasard, niveau surprise — débutant à avancé."},
  {key:"dictation", icon:Volume2, color:"var(--accent-dictation)", title:"Dictée", desc:"Écoute ou lis une phrase russe, écris ce que tu entends."},
  {key:"translation", icon:Languages, color:"var(--accent-translation)", title:"Traduction", desc:"Phrases FR ↔ RU, à ton rythme, auto-évaluées."},
];

// Page d'accueil : titre, grille des modules cliquables, et footer avec les infos de l'auteur.
export default function Home({ navigate, appName }){
  return (
    <section>
      <h1 className="title">{appName || "FreskoRusse"}</h1>
      <p className="subtitle">Ton espace d'entraînement complet : cas, conjugaison, dictée et traduction.</p>

      <div className="module-cards">
        {MODULES.map(m=>(
          <div className="card module-card" key={m.key} onClick={()=> navigate(m.key)}>
            <span className="icon-lg" style={{background:m.color}}>
              <m.icon size={22} color="#fff" strokeWidth={2.2} />
            </span>
            <div>
              <h4>{m.title}</h4>
              <p>{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} Ferol EBATA-MOMBOULI — Développeur web fullstack</p>
        <p className="links">
          <a href="https://www.linkedin.com/in/ferol-jeansmy-ebata-mombouli" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <span className="sep">·</span>
          <a href="mailto:fmombouli532@gmail.com">fmombouli532@gmail.com</a>
        </p>
      </footer>
    </section>
  );
}
