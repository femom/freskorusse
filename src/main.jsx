// Point d'entrée de l'application : monte le composant racine <App /> dans
// la div#root définie dans index.html, et charge la feuille de style globale.
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// Police Onest (latin + cyrillique) embarquée : aucune requête vers Google, donc hors-ligne garanti.
import "@fontsource/onest/latin-400.css";
import "@fontsource/onest/latin-600.css";
import "@fontsource/onest/latin-700.css";
import "@fontsource/onest/latin-800.css";
import "@fontsource/onest/cyrillic-400.css";
import "@fontsource/onest/cyrillic-600.css";
import "@fontsource/onest/cyrillic-700.css";
import "@fontsource/onest/cyrillic-800.css";
import "./styles.css";
import { initPwa } from "./lib/pwa.js";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

// Enregistre le service worker (hors-ligne + mises à jour automatiques) : version construite uniquement.
initPwa();
