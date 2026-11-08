import React from "react";

// Affiche une forme russe en mettant la terminaison en évidence (gras + couleur du cas).
// `form` = { stem, end } produit par le moteur ; `prefix` = préposition éventuelle.
// L'emphase ne repose pas que sur la couleur : le gras la porte aussi.
export default function FormText({ form, prefix = "" }) {
  return (
    <span className="form" lang="ru">
      {prefix}
      {form.stem}
      {form.end && <b className="end">{form.end}</b>}
    </span>
  );
}
