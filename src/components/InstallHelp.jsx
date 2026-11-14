import React, { useEffect, useRef } from "react";
import { detectPlatform } from "../lib/pwa.js";

// Étapes d'installation pour les navigateurs qui n'ont pas de bouton d'installation
// automatique (ou quand il n'est pas disponible). Les libellés suivent les menus réels.
const HELP = {
  ios: {
    title: "Installer sur iPhone ou iPad",
    steps: [
      "Ouvre cette page dans Safari.",
      "Touche le bouton Partager (le carré avec une flèche vers le haut).",
      "Choisis « Sur l'écran d'accueil », puis « Ajouter ».",
    ],
  },
  android: {
    title: "Installer sur Android",
    steps: [
      "Ouvre le menu du navigateur (les trois points).",
      "Choisis « Installer l'application » ou « Ajouter à l'écran d'accueil ».",
      "Confirme.",
    ],
  },
  "android-firefox": {
    title: "Installer sur Firefox pour Android",
    steps: ["Ouvre le menu (les trois points).", "Choisis « Installer »."],
  },
  "desktop-chromium": {
    title: "Installer sur ordinateur",
    steps: [
      "Regarde à droite de la barre d'adresse : clique sur l'icône d'installation (un écran avec une flèche).",
      "Sinon, ouvre le menu (les trois points) puis choisis « Installer FreskoRusse ».",
      "Confirme.",
    ],
  },
  "safari-mac": {
    title: "Installer avec Safari sur Mac",
    steps: ["Dans le menu Fichier, choisis « Ajouter au Dock ».", "Confirme le nom, puis « Ajouter »."],
  },
  "firefox-desktop": {
    title: "Firefox sur ordinateur",
    steps: [],
    text: "Firefox sur ordinateur n'installe pas les applications web. Ouvre cette page dans Chrome ou Edge pour l'installer. Tu peux aussi la garder en favori : après une première visite, elle fonctionne aussi sans connexion.",
  },
};

// Fenêtre d'aide à l'installation. <dialog> natif : piège de focus et touche Échap fournis par le navigateur.
export default function InstallHelp({ open, onClose, platform }) {
  const ref = useRef(null);
  const info = HELP[platform || detectPlatform()] || HELP["desktop-chromium"];

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      try { dialog.showModal(); } catch (e) { dialog.setAttribute("open", ""); }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="install-dialog"
      aria-labelledby="install-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <div className="install-dialog-body">
        <h2 id="install-title">{info.title}</h2>
        {info.text && <p>{info.text}</p>}
        {info.steps.length > 0 && <ol>{info.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>}
        <p>Après l'installation, l'application s'ouvre dans sa propre fenêtre et fonctionne sans connexion.</p>
        <button type="button" className="btn-primary ready" onClick={onClose}>J'ai compris</button>
      </div>
    </dialog>
  );
}
