import React, { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { speak } from "../lib/speech.js";

// Bouton « écouter » partagé (exemples des cas, phrases utiles, exercices de reconnaissance).
// Contrairement à un appel direct à speak(), il EXPLIQUE quand le son ne peut pas sortir
// (navigateur sans synthèse vocale, aucune voix russe installée) au lieu de rester muet.
export default function SpeakButton({ text, label = null, ariaLabel, className = "speak-btn" }) {
  const [note, setNote] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function show(message) {
    setNote(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(null), 5000);
  }

  function onClick(event) {
    event.stopPropagation();
    speak(text, (status) => {
      if (status === "no-support") show("Ton navigateur ne peut pas lire l'audio.");
      else if (status === "no-russian-voice") show("Aucune voix russe n'est installée sur cet appareil : la prononciation peut être approximative.");
      else if (status === "error") show("La lecture audio a échoué.");
    });
  }

  return (
    <>
      <button type="button" className={className} onClick={onClick} aria-label={ariaLabel || label || "Écouter"}>
        <Volume2 size={16} aria-hidden="true" />
        {label && <span>{label}</span>}
      </button>
      {note && <span className="speak-note" role="status">{note}</span>}
    </>
  );
}
