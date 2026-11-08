import { decline } from "./declension.js";

// Calcule l'exemple d'une ligne de tableau (voir caseInfo dans data/cases.js).
// La forme vient du moteur de déclinaison : le tableau ne peut pas contredire l'outil « un mot ».
//   spec = { word, number: "sg"|"pl", animate?, stressed?, loc?, prefix?, fr }  (exemple calculé)
//       ou { text, fr }                                                          (exemple figé)
export function computeExample(spec, caseKey) {
  if (spec.text) return { fixed: true, text: spec.text, fr: spec.fr };
  const result = decline(spec.word, { animate: spec.animate, stressed: spec.stressed });
  if (!result.ok) return null;
  const form = spec.loc ? result.loc : result[spec.number || "sg"][caseKey];
  if (!form) return null;
  return { form, prefix: spec.prefix || "", fr: spec.fr };
}
