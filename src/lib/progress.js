import { cases } from "../data/cases.js";

// Progression d'apprentissage, calculée à partir des meilleurs scores (lib/stats.js).
// Un cas est « maîtrisé » à partir de 80 % de bonnes réponses à sa leçon.
export const MASTERY = 0.8;

export const ratioOf = (scores, id) => {
  const s = scores && scores[id];
  return s && s.total > 0 ? s.best / s.total : 0;
};
export const isMastered = (scores, id) => ratioOf(scores, id) >= MASTERY;
export const casesMastered = (scores) => cases.filter((c) => isMastered(scores, `case:${c.key}`)).length;

const SIMPLE = { verbs: "verbs", bank: "bank", dictation: "dictation", translation: "translation" };

// Barre de progression de la carte « Reprendre » : { ratio (0 à 1), label } ou null si le module n'en a pas.
export function heroProgress(module, scores) {
  if (!module || module === "cases") {
    const n = casesMastered(scores);
    return { ratio: n / cases.length, label: `${n} ${n > 1 ? "cas maîtrisés" : "cas maîtrisé"} sur ${cases.length}` };
  }
  const id = SIMPLE[module];
  if (!id) return null;
  const s = scores && scores[id];
  return s
    ? { ratio: s.best / s.total, label: `Meilleur score : ${s.best} sur ${s.total}` }
    : { ratio: 0, label: "Pas encore de score : lance une série." };
}

// Texte « Meilleur score : 8 sur 10 » pour une leçon, ou null.
export function bestLabel(scores, id) {
  const s = scores && scores[id];
  return s ? `Meilleur score : ${s.best} sur ${s.total}` : null;
}
