// Point d'entrée de l'application : monte le composant racine <App /> dans
// la div#root définie dans index.html, et charge la feuille de style globale.
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import { initPwa } from "./lib/pwa.js";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

// Enregistre le service worker (hors-ligne + mises à jour automatiques) : version construite uniquement.
initPwa();
