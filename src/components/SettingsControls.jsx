import React, { useState } from "react";
import { Star, Moon, Sun, Download, Volume2, VolumeX, CheckCircle2, WifiOff } from "lucide-react";
import { usePwa, promptInstall } from "../lib/pwa.js";
import { play, setSoundEnabled, useSoundEnabled } from "../lib/sound.js";
import InstallHelp from "./InstallHelp.jsx";

// Contrôles de réglages partagés par la barre latérale (desktop) et la page « Plus »
// (mobile) : un seul composant, un seul comportement.

export function XpBadge({ xp }) {
  return (
    <div className="xp-badge">
      <span className="lbl">Progression</span>
      <span>
        <Star size={13} className="xp-star" fill="currentColor" aria-hidden="true" />
        {xp} XP
      </span>
    </div>
  );
}

export function ThemeToggle({ theme, onToggle, compact = false }) {
  const dark = theme === "dark";
  const next = dark ? "Passer en mode clair" : "Passer en mode sombre";
  return (
    <button
      type="button"
      className={"theme-toggle" + (compact ? " compact" : "")}
      onClick={() => { play("tap"); onToggle(); }}
      title={next}
      aria-label={next}
    >
      <span className="theme-toggle-label">
        {dark ? <Moon size={15} aria-hidden="true" /> : <Sun size={15} aria-hidden="true" />}
        {!compact && (dark ? "Mode sombre" : "Mode clair")}
      </span>
      {!compact && <span className="theme-toggle-dot" aria-hidden="true" />}
    </button>
  );
}

// Interrupteur des sons (mémorisé). `compact` : icône seule, pour la barre latérale.
export function SoundToggle({ compact = false }) {
  const on = useSoundEnabled();
  const Icon = on ? Volume2 : VolumeX;
  const label = on ? "Sons activés" : "Sons coupés";
  if (compact) {
    return (
      <button
        type="button"
        className="icon-toggle"
        aria-pressed={on}
        aria-label="Sons"
        title={label}
        onClick={() => setSoundEnabled(!on)}
      >
        <Icon size={16} aria-hidden="true" />
      </button>
    );
  }
  return (
    <button type="button" className="theme-toggle" aria-pressed={on} aria-label="Sons" onClick={() => setSoundEnabled(!on)}>
      <span className="theme-toggle-label">
        <Icon size={15} aria-hidden="true" />
        {label}
      </span>
      <span className="theme-toggle-dot" aria-hidden="true" />
    </button>
  );
}

// Bouton « Télécharger l'application », TOUJOURS visible (sauf si déjà installée).
//  - le navigateur propose l'installation : un clic lance l'invite native ;
//  - sinon (Safari, Firefox, invite pas encore disponible) : fenêtre avec les étapes de l'appareil.
export function InstallButton({ compact = false }) {
  const pwa = usePwa();
  const [helpOpen, setHelpOpen] = useState(false);

  if (pwa.installed) {
    return (
      <div className="installed-pill" role="status">
        <CheckCircle2 size={15} aria-hidden="true" />
        {!compact && <span>Application installée</span>}
        {compact && <span className="sr-only">Application installée</span>}
      </div>
    );
  }

  async function onClick() {
    const result = await promptInstall();
    if (result === "unavailable") setHelpOpen(true);
  }

  return (
    <>
      <button
        type="button"
        className={"install-btn" + (compact ? " compact" : "")}
        onClick={onClick}
        title="Télécharger l'application"
        aria-label="Télécharger l'application"
      >
        <Download size={15} aria-hidden="true" />
        {!compact && <span>Télécharger l'application</span>}
      </button>
      <InstallHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

// État du mode hors-ligne : rassure l'utilisateur (ou lui dit d'attendre la fin de la préparation).
export function OfflineStatus() {
  const { offlineReady } = usePwa();
  const supported = typeof navigator !== "undefined" && "serviceWorker" in navigator;
  if (!supported) return <p className="offline-status">Le mode hors-ligne n'est pas disponible sur ce navigateur.</p>;
  return offlineReady ? (
    <p className="offline-status ready">Fonctionne sans connexion.</p>
  ) : (
    <p className="offline-status">Préparation du mode hors-ligne : reste connecté quelques secondes.</p>
  );
}

// Pastille « Hors-ligne », visible seulement quand la connexion est perdue.
export function NetPill({ className = "" }) {
  const { online } = usePwa();
  if (online) return null;
  return (
    <span className={"net-pill " + className} role="status">
      <WifiOff size={14} aria-hidden="true" />
      Hors-ligne
    </span>
  );
}
