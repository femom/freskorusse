import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { dismissNotice } from "../lib/pwa.js";

// Notification discrète (« Prêt hors-ligne », « Mis à jour »). role="status" : les
// lecteurs d'écran l'annoncent sans voler le focus. Disparaît seule après 6 secondes.
export default function Toast({ notice }) {
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(dismissNotice, 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!notice) return null;
  return (
    <div className="toast" role="status">
      <CheckCircle2 size={18} aria-hidden="true" />
      <span>{notice.text}</span>
      <button type="button" className="toast-close" onClick={dismissNotice} aria-label="Fermer la notification">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
