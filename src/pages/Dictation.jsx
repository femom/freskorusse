import React, { useState, useRef, useEffect } from "react";
import { dictation } from "../data/dictation.js";

// Normalise une chaîne pour comparer les réponses sans être trop strict :
// espaces superflus, casse, ё/е (souvent confondus à l'écrit) et ponctuation ignorés.
function normalize(s){
  return (s||"").trim().toLowerCase().replace(/ё/g,"е").replace(/[.,!?]/g,"");
}
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

// Fait lire une phrase russe à voix haute via l'API du navigateur (Web Speech API).
// Ne nécessite pas internet, mais dépend des voix installées sur l'appareil.
//
// Deux pièges classiques corrigés ici :
// 1) `getVoices()` peut renvoyer un tableau VIDE au premier appel, le temps que
//    le navigateur charge sa liste de voix en arrière-plan (surtout Chrome/Edge).
//    On écoute donc l'évènement "voiceschanged" pour réessayer une fois prêtes.
// 2) Si aucune voix russe n'est installée sur l'appareil, on le signale
//    clairement (au lieu de laisser le bouton "Écouter" ne rien faire, ou pire,
//    de tenter une lecture incompréhensible avec une voix anglaise/française).
//
// `onStatus(status)` reçoit : "ok" | "no-support" | "no-russian-voice" | "error"
let cachedVoices = [];
if(typeof window !== "undefined" && "speechSynthesis" in window){
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

function speak(text, onStatus){
  if(!(typeof window !== "undefined" && "speechSynthesis" in window)){
    onStatus && onStatus("no-support");
    return;
  }
  try{
    // Contournement d'un bug connu de Chrome : appeler cancel() puis speak()
    // immédiatement dans le même tick peut faire échouer la NOUVELLE lecture
    // (l'utterance part en erreur "interrupted"/"canceled"). On n'annule donc
    // que s'il y a réellement quelque chose en cours.
    window.speechSynthesis.resume();
    if(window.speechSynthesis.speaking || window.speechSynthesis.pending){
      window.speechSynthesis.cancel();
    }

    const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
    const ruVoice = voices.find(v=> v.lang && v.lang.toLowerCase().startsWith("ru"));

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ru-RU";
    if(ruVoice) u.voice = ruVoice;
    u.onerror = (e) => onStatus && onStatus("error", e && e.error);
    u.onend = () => onStatus && onStatus("ok");

    // speak() doit être appelé de façon quasi synchrone après un clic pour ne
    // pas se faire bloquer par les navigateurs qui exigent un geste utilisateur.
    window.speechSynthesis.speak(u);
    onStatus && onStatus(ruVoice ? "ok" : "no-russian-voice");
  }catch(e){
    onStatus && onStatus("error");
  }
}

// Déroulé complet d'une session de dictée : tirage aléatoire des phrases, gestion
// des cœurs/XP, écoute + révélation du texte, saisie et vérification.
function DictationGame({ onClose, onFinish }){
  const [order] = useState(()=> shuffle(dictation.map((_,i)=>i)));
  const [pos, setPos] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xpGain, setXpGain] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [audioStatus, setAudioStatus] = useState(null); // null | "no-support" | "no-russian-voice" | "error"
  const [audioErrorDetail, setAudioErrorDetail] = useState(null);
  const [finished, setFinished] = useState(null);
  const inputRef = useRef(null);

  const item = dictation[order[pos]];

  useEffect(()=>{
    setAnswered(false); setCorrect(null); setRevealed(false);
    if(inputRef.current) inputRef.current.value = "";
    if(inputRef.current) inputRef.current.focus();
  }, [pos]);

  function check(given){
    const ok = normalize(given) === normalize(item.ru);
    setAnswered(true); setCorrect(ok);
    if(ok) setXpGain(x=>x+10); else setHearts(h=>h-1);
  }
  function advance(){
    if(hearts <= 0){ setFinished("lose"); return; }
    if(pos+1 >= order.length){ setFinished("win"); onFinish(xpGain); return; }
    setPos(p=>p+1);
  }
  function retry(){ setPos(0); setHearts(3); setXpGain(0); setAnswered(false); setCorrect(null); setRevealed(false); setFinished(null); }

  const progressPct = finished ? 100 : Math.round((pos/order.length)*100);

  return (
    <div className="game-overlay" style={{"--lesson-accent":"var(--accent-dictation)"}}>
      <div className="game-top">
        <button className="exit-btn" onClick={onClose}>✕</button>
        <div className="progress-track"><div className="progress-fill" style={{width:progressPct+"%"}}/></div>
        <div className="hearts">{[0,1,2].map(i=> <span key={i}>{i < hearts ? "♥" : "♡"}</span>)}</div>
      </div>

      {finished === "win" && (
        <div className="game-card">
          <div className="end-screen">
            <div className="big-emoji">🏆</div>
            <h3>Dictée terminée !</h3>
            <p>Tu as fait les {dictation.length} phrases.</p>
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
            <p>Pas grave — recommence.</p>
            <div className="game-actions">
              <button className="btn-primary ready" onClick={retry}>Réessayer</button>
              <button className="btn-primary ghost" onClick={onClose}>Quitter</button>
            </div>
          </div>
        </div>
      )}

      {!finished && item && (
        <div className={"game-card" + (answered ? (correct ? " card-pop" : " card-shake") : "")}>
          <div className="type-label">Dictée — écris ce que tu entends (ou lis)</div>

          <button className="play-btn" onClick={()=> speak(item.ru, (status, detail)=>{ setAudioStatus(status); setAudioErrorDetail(detail||null); })}>🔊 Écouter la phrase</button>
          <button className="reveal-toggle" onClick={()=> setRevealed(r=>!r)}>{revealed ? "Cacher le texte" : "Afficher le texte russe"}</button>
          {audioStatus === "no-support" && (
            <p className="fix-note" style={{marginTop:10}}>Ton navigateur ne supporte pas la lecture audio. Utilise « Afficher le texte russe ».</p>
          )}
          {audioStatus === "no-russian-voice" && (
            <p className="fix-note" style={{marginTop:10}}>Aucune voix russe installée sur cet appareil — la prononciation peut être approximative. Utilise « Afficher le texte russe » en complément.</p>
          )}
          {audioStatus === "error" && (
            <p className="fix-note" style={{marginTop:10}}>
              La lecture audio a échoué{audioErrorDetail ? ` (code : ${audioErrorDetail})` : ""}. Utilise « Afficher le texte russe ».
            </p>
          )}
          {revealed && <div className="revealed-text">{item.ru}</div>}

          <div className="q-ru" style={{marginTop:16}}>{item.fr}<span className="b">Traduction — écris la phrase russe correspondante</span></div>

          <input ref={inputRef} type="text" className="answer-input" placeholder="ta réponse en russe..." autoComplete="off"
            disabled={answered}
            onKeyDown={(e)=>{ if(e.key==="Enter"){ if(!answered && inputRef.current.value.trim()) check(inputRef.current.value); else if(answered) advance(); } }}
          />

          <div className={"game-feedback " + (answered ? (correct ? "ok" : "bad") : "")}>
            {answered ? (correct ? "✓ Correct !" : "✗ Pas tout à fait") : ""}
          </div>
          <div className="game-explain">{answered && !correct ? "Réponse attendue : " + item.ru : ""}</div>

          <div className="game-actions">
            {!answered ? (
              <button className="btn-primary ready" onClick={()=> check(inputRef.current.value)}>Vérifier</button>
            ) : (
              <button className="btn-primary continue" onClick={advance}>{hearts<=0 ? "Voir le résultat" : "Continuer"}</button>
            )}
          </div>
        </div>
      )}
    </div>
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
        <p>La voix utilise le moteur de synthèse vocale de ton navigateur/téléphone — la qualité et la disponibilité d'une voix russe varient selon l'appareil. Si l'audio ne fonctionne pas ou ne te suffit pas, utilise « Afficher le texte russe » pour t'entraîner quand même.</p>
      </div>

      <div className="lesson-launch" style={{"--lesson-accent":"var(--accent-dictation)"}}>
        <div className="info">
          <h4>{dictation.length} phrases — premier lot</h4>
          <p>Écoute ou lis, puis transcris. 3 vies, XP à la clé.</p>
        </div>
        <button className="btn-start" onClick={()=> setOpen(true)}>Démarrer la dictée ▶</button>
      </div>

      {open && <DictationGame onClose={()=> setOpen(false)} onFinish={(xp)=> addXp(xp)} />}
    </section>
  );
}
