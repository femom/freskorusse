import { cases } from "../data/cases.js";
import { recognitionItems } from "../data/caseExtras.js";

// Transforme les phrases de reconnaissance en questions pour le moteur de leçon (LessonEngine).
// Les 6 choix sont toujours dans le même ordre (Nominatif ... Prépositionnel) : l'œil retrouve
// vite la bonne case, et on apprend l'ordre canonique des cas.
export const CASE_LABELS = cases.map((c) => c.label);
const labelOf = (key) => cases.find((c) => c.key === key).label;

export function buildRecognitionQuestions(items = recognitionItems) {
  return items.map((it) => ({
    type: "mcq",
    sentence: { before: it.before, word: it.word, after: it.after },
    base: `« ${it.fr} »`,
    hint: it.hint,
    options: CASE_LABELS,
    answer: [labelOf(it.case)],
  }));
}
