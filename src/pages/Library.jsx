import React, { useState, useEffect } from "react";
import { Shuffle } from "lucide-react";
import { libraryTexts, libraryLevels } from "../data/library.js";
import { navigate, useRoute } from "../lib/router.jsx";
import { legible } from "../lib/color.js";

function randomText(excludeId){
  const pool = excludeId == null ? libraryTexts : libraryTexts.filter(t=> t.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Le texte affiché peut être désigné par l'URL (#/bibliotheque/<id>) : la recherche
// globale y mène directement, et « Nouveau texte » met à jour l'adresse. Sans id
// dans l'URL, on tire un texte au hasard à l'ouverture (comportement d'origine).
export default function Library(){
  const route = useRoute();
  const fromUrl = libraryTexts.find(t=> String(t.id) === route.sub);
  const [initial] = useState(()=> randomText());
  const [showFr, setShowFr] = useState(false);
  const current = fromUrl || initial;

  function drawNew(){
    navigate("library", String(randomText(current.id).id));
    setShowFr(false);
  }

  // Un nouveau texte (via l'URL ou le bouton) repart masqué.
  useEffect(()=>{ setShowFr(false); }, [current.id]);

  const level = libraryLevels[current.level];
  const levelColor = legible(level.color, 70);

  return (
    <section>
      <h1 className="title">Bibliothèque</h1>
      <p className="subtitle">Un texte tiré au hasard, sans savoir à l'avance s'il sera facile ou difficile, comme une vraie lecture.</p>

      <article className="card library-card">
        <div className="library-level-badge" style={{color: levelColor, borderColor: levelColor}}>
          {level.label}
        </div>
        <h2 className="library-title" lang="ru">{current.title}</h2>
        <p className="library-title-fr">{current.titleFr}</p>
        <p className="library-text" lang="ru">{current.ru}</p>

        {!showFr ? (
          <button type="button" className="btn-primary ready" onClick={()=> setShowFr(true)}>Voir la traduction</button>
        ) : (
          <p className="library-text-fr">{current.fr}</p>
        )}
      </article>

      <div className="lesson-launch" style={{"--lesson-accent":"var(--accent-library-b)"}}>
        <div className="info">
          <h2>Un autre texte</h2>
          <p>Le niveau (débutant, intermédiaire, avancé) sort au hasard : c'est voulu.</p>
        </div>
        <button type="button" className="btn-start" onClick={drawNew}><Shuffle size={16} aria-hidden="true"/> Nouveau texte</button>
      </div>
    </section>
  );
}
