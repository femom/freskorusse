import React, { useState } from "react";
import { Shuffle } from "lucide-react";
import { libraryTexts, libraryLevels } from "../data/library.js";

function randomText(excludeId){
  const pool = excludeId == null ? libraryTexts : libraryTexts.filter(t=> t.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Library(){
  const [current, setCurrent] = useState(()=> randomText());
  const [showFr, setShowFr] = useState(false);

  function drawNew(){
    setCurrent(t=> randomText(t.id));
    setShowFr(false);
  }

  const level = libraryLevels[current.level];

  return (
    <section>
      <h1 className="title">Bibliothèque</h1>
      <p className="subtitle">Un texte tiré au hasard, sans savoir à l'avance s'il sera facile ou difficile — comme une vraie lecture.</p>

      <div className="card library-card">
        <div className="library-level-badge" style={{color: level.color, background: "var(--card-soft, transparent)", borderColor: level.color}}>
          {level.label}
        </div>
        <h3 className="library-title">{current.title}</h3>
        <p className="library-title-fr">{current.titleFr}</p>
        <p className="library-text">{current.ru}</p>

        {!showFr ? (
          <button className="btn-primary ready" onClick={()=> setShowFr(true)}>Voir la traduction</button>
        ) : (
          <p className="library-text-fr">{current.fr}</p>
        )}
      </div>

      <div className="lesson-launch" style={{"--lesson-accent":"var(--accent-library-b)"}}>
        <div className="info">
          <h4>Un autre texte</h4>
          <p>Le niveau (débutant, intermédiaire, avancé) sort au hasard — c'est voulu.</p>
        </div>
        <button className="btn-start" onClick={drawNew}><Shuffle size={16}/> Nouveau texte</button>
      </div>
    </section>
  );
}
