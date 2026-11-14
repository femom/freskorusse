import React, { useState, useRef, useEffect } from "react";
import { dictation } from "../data/dictation.js";
import { Trophy, HeartCrack, Volume2 } from "lucide-react";
import { normalize, shuffle } from "../lib/text.js";
import { speak } from "../lib/speech.js";
import GameShell, { Hearts, Feedback, EndScreen } from "../components/GameShell.jsx";
import { play } from "../lib/sound.js";

// Déroulé complet d'une session de dictée : tirage aléatoire des phrases, gestion
// des cœurs/XP, écoute + révélation du texte, saisie et vérification.
// (La synthèse vocale est dans lib/speech.js, partagée avec les Phrases utiles.)
function DictationGame({ onClose, onFinish }){
  const [order] = useState(()=> shuffle(dictation.map((_,i)=>i)));
  const [pos, setPos] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xpGain, setXpGain] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState("");
  const [audioStatus, setAudioStatus] = useState(null); // null | "no-support" | "no-russian-voice" | "error"
  const [audioErrorDetail, setAudioErrorDetail] = useState(null);
  const [finished, setFinished] = useState(null);
  const inputRef = useRef(null);

  const item = dictation[order[pos]];

  useEffect(()=>{
    setAnswered(false); setCorrect(null); setRevealed(false); setTyped("");
    if(inputRef.current) inputRef.current.value = "";
    if(inputRef.current) inputRef.current.focus();
  }, [pos]);

  function check(given){
    const ok = normalize(given) === normalize(item.ru);
    setAnswered(true); setCorrect(ok);
    play(ok ? "correct" : "wrong");
    if(ok) setXpGain(x=>x+10); else setHearts(h=>h-1);
  }
  function advance(){
    if(hearts <= 0){ setFinished("lose"); play("lose"); return; }
    if(pos+1 >= order.length){ setFinished("win"); play("win"); onFinish(xpGain); return; }
    setPos(p=>p+1);
  }
  function retry(){ setPos(0); setHearts(3); setXpGain(0); setAnswered(false); setCorrect(null); setRevealed(false); setTyped(""); setFinished(null); }

  const progressPct = finished ? 100 : Math.round((pos/order.length)*100);

  return (
    <GameShell
      title="Dictée"
      accent="var(--accent-dictation)"
      progress={progressPct}
      inProgress={!finished && (pos > 0 || answered || typed.trim().length > 0)}
      right={<Hearts count={hearts} />}
      onClose={onClose}
    >
      {finished === "win" && (
        <EndScreen
          icon={Trophy}
          title="Dictée terminée !"
          message={`Tu as fait les ${dictation.length} phrases.`}
          xp={xpGain}
          actions={[{ label: "Continuer", className: "continue", onClick: onClose }]}
        />
      )}
      {finished === "lose" && (
        <EndScreen
          icon={HeartCrack}
          title="Plus de vies"
          message="Pas grave, recommence."
          actions={[
            { label: "Réessayer", className: "ready", onClick: retry },
            { label: "Quitter", className: "ghost", onClick: onClose },
          ]}
        />
      )}

      {!finished && item && (
        <div className={"game-card" + (answered ? (correct ? " card-pop" : " card-shake") : "")}>
          <div className="type-label">Dictée : écris ce que tu entends (ou lis)</div>

          <button type="button" className="play-btn" onClick={()=> speak(item.ru, (status, detail)=>{ setAudioStatus(status); setAudioErrorDetail(detail||null); })}><Volume2 size={16} aria-hidden="true"/> Écouter la phrase</button>
          <button type="button" className="reveal-toggle" aria-expanded={revealed} onClick={()=> setRevealed(r=>!r)}>{revealed ? "Cacher le texte" : "Afficher le texte russe"}</button>
          <div role="status" aria-live="polite">
            {audioStatus === "no-support" && (
              <p className="fix-note audio-note">Ton navigateur ne supporte pas la lecture audio. Utilise « Afficher le texte russe ».</p>
            )}
            {audioStatus === "no-russian-voice" && (
              <p className="fix-note audio-note">Aucune voix russe n'est installée sur cet appareil : la prononciation peut être approximative. Utilise « Afficher le texte russe » en complément.</p>
            )}
            {audioStatus === "error" && (
              <p className="fix-note audio-note">
                La lecture audio a échoué{audioErrorDetail ? ` (code : ${audioErrorDetail})` : ""}. Utilise « Afficher le texte russe ».
              </p>
            )}
          </div>
          {revealed && <div className="revealed-text" lang="ru">{item.ru}</div>}

          <div className="q-ru dictation-prompt">{item.fr}<span className="b">Traduction : écris la phrase russe correspondante</span></div>

          <input ref={inputRef} type="text" className="answer-input" lang="ru" aria-label="Ta réponse en russe" placeholder="ta réponse en russe..." autoComplete="off" autoCapitalize="off" spellCheck={false}
            disabled={answered}
            onChange={(e)=> setTyped(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==="Enter"){ if(!answered && inputRef.current.value.trim()) check(inputRef.current.value); else if(answered) advance(); } }}
          />

          <Feedback answered={answered} correct={correct} expected={item.ru} />

          <div className="game-actions">
            {!answered ? (
              // Désactivé tant que le champ est vide : avant, un tap à vide coûtait une vie.
              <button type="button" className={"btn-primary" + (typed.trim() ? " ready" : "")} disabled={!typed.trim()} onClick={()=> check(inputRef.current.value)}>Vérifier</button>
            ) : (
              <button type="button" className="btn-primary continue" onClick={advance}>{hearts<=0 ? "Voir le résultat" : "Continuer"}</button>
            )}
          </div>
        </div>
      )}
    </GameShell>
  );
}

// Page "Dictée" : présentation du module + bouton pour démarrer une session
// (le jeu lui-même vit dans <DictationGame>, affiché en plein écran par-dessus).
export default function Dictation({ addXp }){
  const [open, setOpen] = useState(false);
  return (
    <section>
      <h1 className="title">Dictée</h1>
      <p className="subtitle">Écoute (ou lis) une phrase russe, puis écris-la en cyrillique.</p>

      <div className="card usage-card">
        <p>La voix utilise le moteur de synthèse vocale de ton navigateur ou téléphone : la qualité et la disponibilité d'une voix russe varient selon l'appareil. Si l'audio ne fonctionne pas ou ne te suffit pas, utilise « Afficher le texte russe » pour t'entraîner quand même.</p>
      </div>

      <div className="lesson-launch" style={{"--lesson-accent":"var(--accent-dictation)"}}>
        <div className="info">
          <h2>{dictation.length} phrases, premier lot</h2>
          <p>Écoute ou lis, puis transcris. 3 vies, XP à la clé.</p>
        </div>
        <button type="button" className="btn-start" onClick={()=> setOpen(true)}>Démarrer la dictée ▶</button>
      </div>

      {open && <DictationGame onClose={()=> setOpen(false)} onFinish={(xp)=> addXp(xp)} />}
    </section>
  );
}
