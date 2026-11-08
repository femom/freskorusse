import React from "react";
import { Star, Moon, Sun, Download } from "lucide-react";

// Petits contrôles de réglages partagés par la barre latérale (desktop) et la
// page « Plus » (mobile) : un seul composant, un seul comportement.

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
      onClick={onToggle}
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

export function InstallButton({ install, compact = false }) {
  if (!install.canInstall) return null;
  return (
    <button
      type="button"
      className={"install-btn" + (compact ? " compact" : "")}
      onClick={install.install}
      title="Installer FreskoRusse sur cet appareil"
      aria-label="Installer l'application"
    >
      <Download size={15} aria-hidden="true" />
      {!compact && <span>Installer l'application</span>}
    </button>
  );
}
