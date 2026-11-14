import React, { useState, useEffect, useRef } from "react";
import { Trophy, HeartCrack } from "lucide-react";
import { normalize, shuffle } from "../lib/text.js";
import GameShell, { Hearts, Feedback, EndScreen } from "./GameShell.jsx";
import { play } from "../lib/sound.js";
import SpeakButton from "./SpeakButton.jsx";

// Moteur de leçon générique réutilisé par les cas, les verbes ET la banque de
// mots : 3 vies, XP, questions "à trous" (type="type") ou à choix multiples
// (type="mcq").
// `questions` : tableau de {type, prompt, base, options?, answer:[...]}
// `onFinish(xpGagné)` est appelé une seule fois, quand la leçon est réussie.
export default function LessonEngine({ questions, onClose, onFinish, title, accent }){
  const [order] = useState(()=> shuffle(questions.map((_,i)=>i)));
  const [pos, setPos] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xpGain, setXpGain] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(null);
  const [finished, setFinished] = useState(null); // null | "win" | "lose"
  const inputRef = useRef(null);

  const q = questions[order[pos]];

  useEffect(()=>{
    setAnswered(false); setSelected(null); setCorrect(null);
    if(inputRef.current) inputRef.current.value = "";
    if(q && q.type === "type" && inputRef.current) inputRef.current.focus();
  }, [pos]);

  function check(given){
    const ok = q.answer.map(normalize).includes(normalize(given));
    setAnswered(true); setCorrect(ok); setSelected(given);
    play(ok ? "correct" : "wrong");
    if(ok) setXpGain(x=>x+10); else setHearts(h=>h-1);
  }

  function advance(){
    if(hearts <= 0){ setFinished("lose"); play("lose"); return; }
    if(pos+1 >= order.length){ setFinished("win"); play("win"); onFinish(xpGain); return; }
    setPos(p=>p+1);
  }

  function retry(){
    setPos(0); setHearts(3); setXpGain(0); setAnswered(false); setSelected(null); setCorrect(null); setFinished(null);
  }

  const progressPct = finished ? 100 : Math.round((pos/order.length)*100);

  return (
    <GameShell
      title={title}
      accent={accent}
      progress={progressPct}
      inProgress={!finished && (pos > 0 || answered)}
      right={<Hearts count={hearts} />}
      onClose={onClose}
    >
      {finished === "win" && (
        <EndScreen
          icon={Trophy}
          title="Leçon terminée !"
          message="Tu as répondu à toutes les questions."
          xp={xpGain}
          actions={[{ label: "Continuer", className: "continue", onClick: onClose }]}
        />
      )}

      {finished === "lose" && (
        <EndScreen
          icon={HeartCrack}
          title="Plus de vies"
          message="Pas grave, recommence : tu vas y arriver."
          actions={[
            { label: "Réessayer", className: "ready", onClick: retry },
            { label: "Quitter", className: "ghost", onClick: onClose },
          ]}
        />
      )}

      {!finished && q && (
        <div className={"game-card" + (answered ? (correct ? " card-pop" : " card-shake") : "")}>
          <div className="type-label">{title}</div>
          {q.sentence ? (
            // Exercice de reconnaissance : le mot à analyser est souligné dans une vraie phrase.
            <>
              <div className="q-ru recognize">
                <span lang="ru">{q.sentence.before}<u className="target">{q.sentence.word}</u>{q.sentence.after}</span>
                <span className="b">{q.base}</span>
              </div>
              <SpeakButton text={q.sentence.before + q.sentence.word + q.sentence.after} label="Écouter la phrase" className="play-btn" />
              <p className="recognize-question">Dans quel cas est le mot souligné ?</p>
            </>
          ) : (
            <div className="q-ru">{q.prompt}<span className="b">{q.base}</span></div>
          )}

          {q.type === "mcq" ? (
            <div className="mcq-grid">
              {q.options.map(opt=>{
                let cls = "mcq-opt";
                if(answered){
                  if(normalize(opt) === normalize(q.answer[0])) cls += " correct";
                  else if(opt === selected) cls += " wrong";
                } else if(opt === selected) cls += " selected";
                return (
                  <button type="button" key={opt} className={cls} disabled={answered}
                    aria-pressed={!answered && opt === selected}
                    onClick={()=> { play("select"); setSelected(opt); }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <input ref={inputRef} type="text" className="answer-input" aria-label="Ta réponse" placeholder="ta réponse..." autoComplete="off" autoCapitalize="off" spellCheck={false}
              disabled={answered}
              onChange={(e)=> setSelected(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==="Enter"){ if(!answered && inputRef.current.value.trim()) check(inputRef.current.value); else if(answered) advance(); } }}
            />
          )}

          <Feedback answered={answered} correct={correct} expected={q.answer[0]} hint={q.hint} />

          <div className="game-actions">
            {!answered ? (
              <button type="button" className={"btn-primary" + (selected && selected.trim() ? " ready" : "")}
                disabled={!selected || !selected.trim()}
                onClick={()=> check(selected)}>
                Vérifier
              </button>
            ) : (
              <button type="button" className="btn-primary continue" onClick={advance}>
                {hearts <= 0 ? "Voir le résultat" : "Continuer"}
              </button>
            )}
          </div>
        </div>
      )}
    </GameShell>
  );
}
