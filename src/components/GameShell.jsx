import React, { useEffect, useRef, useState } from "react";
import { X, Heart, CheckCircle2, XCircle } from "lucide-react";
import { setBusy } from "../lib/pwa.js";
import { play } from "../lib/sound.js";

// Coque commune des trois jeux (leçons, dictée, traduction) : plein écran,
// barre de progression, bouton quitter.
//
// Notion : <dialog> natif + showModal(). Le navigateur fournit gratuitement le
// piège de focus (Tab ne sort pas du jeu), la couche « au-dessus de tout » et
// la touche Échap — sans bibliothèque ni code de gestion du focus.
// Quitter en cours de route demande confirmation : sinon un tap malheureux sur
// ✕ ou un Échap efface toute la progression de la série.
export default function GameShell({ title, accent, progress, inProgress, right, onClose, children }) {
  const dialogRef = useRef(null);
  const keepRef = useRef(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      try { dialog.showModal(); } catch (e) { dialog.setAttribute("open", ""); }
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // pas de défilement de la page derrière
    setBusy(true); // un exercice est ouvert : une mise à jour attendra sa fermeture
    play("start");
    return () => {
      setBusy(false);
      document.body.style.overflow = previousOverflow;
      if (dialog && dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    if (confirming && keepRef.current) keepRef.current.focus();
  }, [confirming]);

  function requestExit() {
    if (confirming) { setConfirming(false); return; }
    if (inProgress) setConfirming(true);
    else onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="game-overlay"
      aria-label={title}
      style={{ "--lesson-accent": accent }}
      onCancel={(e) => { e.preventDefault(); requestExit(); }}
    >
      <div className="game-top">
        <button type="button" className="exit-btn" onClick={requestExit} aria-label="Quitter l'exercice">
          <X size={18} aria-hidden="true" />
        </button>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Progression"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="progress-fill" style={{ width: progress + "%" }} />
        </div>
        {right}
      </div>

      {children}

      {confirming && (
        <div className="game-confirm">
          <div className="game-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text">
            <h3 id="confirm-title">Quitter la série ?</h3>
            <p id="confirm-text">Les XP de cette série ne seront pas comptés si tu quittes maintenant.</p>
            <div className="game-actions">
              <button type="button" ref={keepRef} className="btn-primary ready" onClick={() => setConfirming(false)}>Continuer</button>
              <button type="button" className="btn-primary ghost" onClick={onClose}>Quitter</button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

// Cœurs restants (3 vies).
export function Hearts({ count, max = 3 }) {
  return (
    <div className="hearts" role="img" aria-label={`${count} ${count > 1 ? "vies restantes" : "vie restante"}`}>
      {Array.from({ length: max }, (_, i) => (
        <Heart key={i} size={17} fill={i < count ? "currentColor" : "none"} aria-hidden="true" />
      ))}
    </div>
  );
}

// Retour après réponse (« Correct ! » / « Pas tout à fait » + réponse attendue).
// aria-live : les lecteurs d'écran l'annoncent sans qu'on ait à le chercher.
export function Feedback({ answered, correct, expected, hint = null }) {
  return (
    <>
      <div className={"game-feedback " + (answered ? (correct ? "ok" : "bad") : "")} role="status" aria-live="polite">
        {answered && (correct
          ? <><CheckCircle2 size={18} aria-hidden="true" /> Correct !</>
          : <><XCircle size={18} aria-hidden="true" /> Pas tout à fait</>)}
      </div>
      <div className="game-explain">
        {answered && !correct ? "Réponse attendue : " + expected : ""}
        {answered && hint && <span className="hint">{hint}</span>}
      </div>
    </>
  );
}

// Écran de fin (victoire / défaite). `actions` : [{label, onClick, className}]
export function EndScreen({ icon: Icon, title, message, xp, actions }) {
  return (
    <div className="game-card">
      <div className="end-screen">
        <div className="big-emoji"><Icon size={44} strokeWidth={1.8} aria-hidden="true" /></div>
        <h3>{title}</h3>
        <p>{message}</p>
        {xp != null && <div className="xp-earned">+{xp} XP</div>}
        <div className="game-actions">
          {actions.map((a) => (
            <button key={a.label} type="button" className={"btn-primary " + (a.className || "")} onClick={a.onClick}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
