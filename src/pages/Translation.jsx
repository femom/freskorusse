import React, { useState } from "react";
import { translation } from "../data/translation.js";
import { Trophy, CheckCircle2, RotateCcw, Star } from "lucide-react";
import { shuffle } from "../lib/text.js";
import GameShell, { EndScreen } from "../components/GameShell.jsx";
import { play } from "../lib/sound.js";

const SESSION_SIZE = Math.min(15, translation.length);

// Session de traduction en mode "flashcard auto-évaluée" : on tire SESSION_SIZE
// phrases au hasard, chacune dans un sens aléatoire (FR->RU ou RU->FR). Comme une
// traduction a souvent plusieurs formulations correctes, il n'y a pas de correction
// automatique stricte : l'utilisateur compare lui-même sa tentative à la référence.
function TranslationGame({ onClose, onFinish }){
  const [order] = useState(()=> shuffle(translation.map((_,i)=>i)).slice(0, SESSION_SIZE));
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
    play(g === "ok" ? "correct" : "wrong");
    if(g === "ok") setXpGain(x=>x+8);
  }
  function next(){
    if(pos+1 >= order.length){ setFinished(true); play("win"); onFinish(xpGain); return; }
    setPos(p=>p+1); setRevealed(false); setGraded(null); setAttempt("");
  }

  const progressPct = finished ? 100 : Math.round((pos/order.length)*100);

  return (
    <GameShell
      title="Traduction"
      accent="var(--accent-translation)"
      progress={progressPct}
      inProgress={!finished && (pos > 0 || revealed || attempt.trim().length > 0)}
      right={<div className="xp-live" aria-label={`${xpGain} XP gagnés`}><Star size={14} fill="currentColor" aria-hidden="true"/> +{xpGain}</div>}
      onClose={onClose}
    >
      {finished ? (
        <EndScreen
          icon={Trophy}
          title="Série terminée !"
          message={`${order.length} phrases traduites et auto-évaluées.`}
          xp={xpGain}
          actions={[{ label: "Continuer", className: "continue", onClick: onClose }]}
        />
      ) : (
        <div className="game-card">
          <div className="flash-side">{dirLabel}</div>
          <div className="flash-prompt" lang={dir === "fr2ru" ? "fr" : "ru"}>{prompt}</div>

          {!revealed && (
            <>
              <input type="text" className="answer-input" aria-label="Ta traduction" lang={dir === "fr2ru" ? "ru" : "fr"} placeholder="ta traduction (à l'oral ou à l'écrit)..." autoComplete="off" autoCapitalize="off" spellCheck={false}
                value={attempt} onChange={e=>setAttempt(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==="Enter") reveal(); }}
              />
              <div className="game-actions"><button type="button" className="btn-primary ready" onClick={reveal}>Voir la traduction</button></div>
            </>
          )}

          {revealed && (
            <>
              <div className="flash-answer" lang={dir === "fr2ru" ? "ru" : "fr"}>{answer}</div>
              {!graded ? (
                <>
                  <p className="grade-hint">Compare avec ta réponse et sois honnête, c'est pour toi.</p>
                  <div className="game-actions">
                    <button type="button" className="btn-primary btn-ok" onClick={()=> grade("ok")}><CheckCircle2 size={16} aria-hidden="true"/> J'avais juste</button>
                    <button type="button" className="btn-primary btn-bad" onClick={()=> grade("bad")}><RotateCcw size={16} aria-hidden="true"/> À revoir</button>
                  </div>
                </>
              ) : (
                <div className="game-actions"><button type="button" className="btn-primary continue" onClick={next}>Continuer</button></div>
              )}
            </>
          )}
        </div>
      )}
    </GameShell>
  );
}

// Page "Traduction" : présentation du module + bouton pour démarrer une série.
export default function Translation({ addXp }){
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1 className="title">Traduction</h1>
      <p className="subtitle">{translation.length} phrases du quotidien, français ↔ russe, tirées au hasard.</p>

      <div className="card usage-card">
        <p>Pas de correcteur automatique strict ici : une traduction a souvent plusieurs formulations valables. Tu tapes ton essai, tu vois la référence, et tu t'auto-évalues honnêtement.</p>
      </div>

      <div className="lesson-launch" style={{"--lesson-accent":"var(--accent-translation)"}}>
        <div className="info">
          <h2>{SESSION_SIZE} phrases, sens aléatoire</h2>
          <p>Français→russe ou russe→français, mélangés à chaque série.</p>
        </div>
        <button type="button" className="btn-start" onClick={()=> setOpen(true)}>Démarrer la série ▶</button>
      </div>

      {open && <TranslationGame onClose={()=> setOpen(false)} onFinish={(xp)=> addXp(xp)} />}
    </section>
  );
}
