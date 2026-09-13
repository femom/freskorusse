import React, { useState, useEffect, useRef } from "react";

// Normalise une réponse avant comparaison (casse, espaces, ё/е, ponctuation).
function normalize(s){
  return (s||"").trim().toLowerCase().replace(/ё/g,"е").replace(/[.,!?]/g,"");
}
// Mélange un tableau sans le modifier (algorithme de Fisher-Yates).
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

// Moteur de leçon générique réutilisé par les cas ET les verbes : 3 vies, XP,
// questions "à trous" (type="type") ou à choix multiples (type="mcq").
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
    if(ok) setXpGain(x=>x+10); else setHearts(h=>h-1);
  }

  function advance(){
    if(hearts <= 0){ setFinished("lose"); return; }
    if(pos+1 >= order.length){ setFinished("win"); onFinish(xpGain); return; }
    setPos(p=>p+1);
  }

  function retry(){
    setPos(0); setHearts(3); setXpGain(0); setAnswered(false); setSelected(null); setCorrect(null); setFinished(null);
  }

  const progressPct = finished ? 100 : Math.round((pos/order.length)*100);

  return (
    <div className="game-overlay" style={{"--lesson-accent": accent}}>
      <div className="game-top">
        <button className="exit-btn" onClick={onClose}>✕</button>
        <div className="progress-track"><div className="progress-fill" style={{width:progressPct+"%"}}/></div>
        <div className="hearts">{[0,1,2].map(i=> <span key={i}>{i < hearts ? "♥" : "♡"}</span>)}</div>
      </div>

      {finished === "win" && (
        <div className="game-card">
          <div className="end-screen">
            <div className="big-emoji">🏆</div>
            <h3>Leçon terminée !</h3>
            <p>Tu as répondu à toutes les questions.</p>
            <div className="xp-earned">+{xpGain} XP</div>
            <div className="game-actions"><button className="btn-primary continue" onClick={onClose}>Continuer</button></div>
          </div>
        </div>
      )}

      {finished === "lose" && (
        <div className="game-card">
          <div className="end-screen">
            <div className="big-emoji">💔</div>
            <h3>Plus de vies</h3>
            <p>Pas grave — recommence, tu vas y arriver.</p>
            <div className="game-actions">
              <button className="btn-primary ready" onClick={retry}>Réessayer</button>
              <button className="btn-primary ghost" onClick={onClose}>Quitter</button>
            </div>
          </div>
        </div>
      )}

      {!finished && q && (
        <div className={"game-card" + (answered ? (correct ? " card-pop" : " card-shake") : "")}>
          <div className="type-label">{title}</div>
          <div className="q-ru">{q.prompt}<span className="b">{q.base}</span></div>

          {q.type === "mcq" ? (
            <div className="mcq-grid">
              {q.options.map(opt=>{
                let cls = "mcq-opt";
                if(answered){
                  if(normalize(opt) === normalize(q.answer[0])) cls += " correct";
                  else if(opt === selected) cls += " wrong";
                } else if(opt === selected) cls += " selected";
                return (
                  <button key={opt} className={cls} disabled={answered}
                    onClick={()=> setSelected(opt)}>
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <input ref={inputRef} type="text" className="answer-input" placeholder="ta réponse..." autoComplete="off"
              disabled={answered}
              onKeyDown={(e)=>{ if(e.key==="Enter"){ if(!answered && inputRef.current.value.trim()) check(inputRef.current.value); else if(answered) advance(); } }}
            />
          )}

          <div className={"game-feedback " + (answered ? (correct ? "ok" : "bad") : "")}>
            {answered ? (correct ? "✓ Correct !" : "✗ Pas tout à fait") : ""}
          </div>
          <div className="game-explain">
            {answered && !correct ? "Réponse attendue : " + q.answer[0] : ""}
          </div>

          <div className="game-actions">
            {!answered ? (
              <button className={"btn-primary" + (selected ? " ready" : "")}
                disabled={!selected}
                onClick={()=> check(selected)}>
                Vérifier
              </button>
            ) : (
              <button className="btn-primary continue" onClick={advance}>
                {hearts <= 0 ? "Voir le résultat" : "Continuer"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
