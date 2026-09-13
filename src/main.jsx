// Point d'entrée de l'application : monte le composant racine <App /> dans
// la div#root définie dans index.html, et charge la feuille de style globale.
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
