import React, { useState } from "react";
import { translation } from "../data/translation.js";

// Mélange un tableau sans le modifier (algorithme de Fisher-Yates).
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

// Session de traduction en mode "flashcard auto-évaluée" : on tire 15 phrases au
// hasard, chacune dans un sens aléatoire (FR->RU ou RU->FR). Comme une traduction a
// souvent plusieurs formulations correctes, il n'y a pas de correction automatique
// stricte : l'utilisateur compare lui-même sa tentative à la référence affichée.
function TranslationGame({ onClose, onFinish }){
  const [order] = useState(()=> shuffle(translation.map((_,i)=>i)).slice(0, 15));
  const [directions] = useState(()=> order.map(()=> Math.random() < 0.5 ? "fr2ru" : "ru2fr"));
  const [pos, setPos] = useState(0);
  const [xpGain, setXpGain] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState(null); // null | "ok" | "bad"
  const [attempt, setAttempt] = useState("");
  const [finished, setFinished] = useState(false);

  const item = translation[order[pos]];
  const dir = directions[pos];
  const prompt = dir === "fr2ru" ? item.fr : item.ru;
  const answer = dir === "fr2ru" ? item.ru : item.fr;
  const dirLabel = dir === "fr2ru" ? "Français → Russe" : "Русский → Français";

  function reveal(){ setRevealed(true); }
  function grade(g){
    setGraded(g);
    if(g === "ok") setXpGain(x=>x+8);
  }
  function next(){
    if(pos+1 >= order.length){ setFinished(true); onFinish(xpGain); return; }
    setPos(p=>p+1); setRevealed(false); setGraded(null); setAttempt("");
  }

  const progressPct = finished ? 100 : Math.round((pos/order.length)*100);

  return (
    <div className="game-overlay" style={{"--lesson-accent":"var(--accent-translation)"}}>
      <div className="game-top">
        <button className="exit-btn" onClick={onClose}>✕</button>
        <div className="progress-track"><div className="progress-fill" style={{width:progressPct+"%"}}/></div>
        <div style={{fontSize:"0.85rem", color:"var(--amber)", fontWeight:700}}>⭐ +{xpGain}</div>
      </div>

      {finished ? (
        <div className="game-card">
          <div className="end-screen">
            <div className="big-emoji">🏆</div>
            <h3>Série terminée !</h3>
            <p>15 phrases traduites et auto-évaluées.</p>
            <div className="xp-earned">+{xpGain} XP</div>
            <div className="game-actions"><button className="btn-primary continue" onClick={onClose}>Continuer</button></div>
          </div>
        </div>
      ) : (
        <div className="game-card">
          <div className="flash-side">{dirLabel}</div>
          <div className="flash-prompt">{prompt}</div>

          {!revealed && (
            <>
              <input type="text" className="answer-input" placeholder="ta traduction (à l'oral ou à l'écrit)..." autoComplete="off"
                value={attempt} onChange={e=>setAttempt(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==="Enter") reveal(); }}
              />
              <div className="game-actions"><button className="btn-primary ready" onClick={reveal}>Voir la traduction</button></div>
            </>
          )}

          {revealed && (
            <>
              <div className="flash-answer">{answer}</div>
              {!graded ? (
                <>
                  <p style={{fontSize:"0.85rem", color:"var(--ink-soft)"}}>Compare avec ta réponse — sois honnête, c'est pour toi.</p>
                  <div className="game-actions">
                    <button className="btn-primary" style={{background:"var(--green)"}} onClick={()=> grade("ok")}>✓ J'avais juste</button>
                    <button className="btn-primary" style={{background:"var(--red)"}} onClick={()=> grade("bad")}>✗ À revoir</button>
                  </div>
                </>
              ) : (
                <div className="game-actions"><button className="btn-primary continue" onClick={next}>Continuer</button></div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Page "Traduction" : présentation du module + bouton pour démarrer une série.
export default function Translation({ addXp }){
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1 className="title">Traduction</h1>
      <p className="subtitle">50 phrases du quotidien, français ↔ russe, tirées au hasard.</p>

      <div className="card usage-card">
        <p>Pas de correcteur automatique strict ici — une traduction a souvent plusieurs formulations valables. Tu tapes ton essai, tu vois la référence, et tu t'auto-évalues honnêtement.</p>
      </div>

      <div className="lesson-launch" style={{"--lesson-accent":"var(--accent-translation)"}}>
        <div className="info">
          <h4>15 phrases — sens aléatoire</h4>
          <p>Français→russe ou russe→français, mélangés à chaque série.</p>
        </div>
        <button className="btn-start" onClick={()=> setOpen(true)}>Démarrer la série ▶</button>
      </div>

      {open && <TranslationGame onClose={()=> setOpen(false)} onFinish={(xp)=> addXp(xp)} />}
    </section>
  );
}
