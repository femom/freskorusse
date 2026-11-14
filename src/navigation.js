import {
  Home as HomeIcon, BookOpen, Repeat, Star, MessageCircle, BookMarked,
  Volume2, Languages, MoreHorizontal,
} from "lucide-react";
import { cases } from "./data/cases.js";
import { verbs } from "./data/verbs.js";
import { wordBank } from "./data/wordbank.js";
import { phrases, phraseCategories } from "./data/phrases.js";

// Source unique de vérité pour la navigation : la barre latérale (desktop), la
// barre d'onglets (mobile), l'accueil, la page « Plus » et la recherche lisent
// tous cette liste. Ajouter un module = une seule ligne ici.
//
// `color`  : couleur d'accent du module (variables CSS de thème, donc adaptée
//            automatiquement en clair/sombre).
// Les chiffres des descriptions sont calculés depuis les données : ils ne
// peuvent plus se désynchroniser si on ajoute un verbe ou un mot.
export const MODULES = [
  { key: "home", label: "Accueil", icon: HomeIcon, color: "var(--ink-faint)",
    desc: "Retour à l'accueil." },
  { key: "cases", label: "Les cas", icon: BookOpen, color: "var(--accent-cases)",
    title: "Les cas russes",
    desc: `${cases.length} cas, terminaisons, exemples et leçons interactives.` },
  { key: "verbs", label: "Les verbes", icon: Repeat, color: "var(--accent-verbs)",
    title: "Les verbes russes",
    desc: `${verbs.length} verbes essentiels : présent, passé, futur, 2 aspects.` },
  { key: "bank", label: "Banque de mots", icon: Star, color: "var(--accent-bank)",
    title: "Banque de mots",
    desc: `${wordBank.length} mots russes proches du français, en flashcards à retourner.` },
  { key: "phrases", label: "Phrases utiles", icon: MessageCircle, color: "var(--accent-phrases)",
    title: "Phrases utiles",
    desc: `${phrases.length} phrases en ${phraseCategories.length} catégories pour ton arrivée en Russie.` },
  { key: "library", label: "Bibliothèque", icon: BookMarked, color: "var(--accent-library-b)",
    title: "Bibliothèque",
    desc: "Un texte tiré au hasard, niveau surprise, du débutant à l'avancé." },
  { key: "dictation", label: "Dictée", icon: Volume2, color: "var(--accent-dictation)",
    title: "Dictée",
    desc: "Écoute ou lis une phrase russe, écris ce que tu entends." },
  { key: "translation", label: "Traduction", icon: Languages, color: "var(--accent-translation)",
    title: "Traduction",
    desc: "Phrases FR ↔ RU, à ton rythme, auto-évaluées." },
];
export const MODULE_BY_KEY = Object.fromEntries(MODULES.map((m) => [m.key, m]));

// Page « Plus » (mobile) : ce qui ne tient pas dans la barre d'onglets.
export const MORE_META = { key: "more", label: "Plus", icon: MoreHorizontal, color: "var(--ink-faint)" };

// Regroupement logique des modules (barre latérale + page « Plus »).
// Notion : architecture de l'information — regrouper par intention de
// l'utilisateur (apprendre / pratiquer / consulter) plutôt que par ordre d'ajout.
export const NAV_GROUPS = [
  { label: "Apprendre", keys: ["cases", "verbs", "bank"] },
  { label: "Pratiquer", keys: ["dictation", "translation"] },
  { label: "Consulter", keys: ["phrases", "library"] },
];

// Onglets de la barre du bas (mobile) : les 4 modules les plus fréquents + « Plus ».
// Règle : 5 onglets maximum (au-delà, cibles trop petites).
export const TAB_KEYS = ["home", "cases", "verbs", "bank"];

// Décrit une route pour l'interface : titre affiché, parent (pour le bouton
// retour) et libellé de reprise. Valide aussi le sous-élément : "#/cas/zzz" n'a pas de parent.
export function describeRoute({ module, sub }) {
  if (module === "more") return { title: "Plus", parent: null, resume: null };
  const meta = MODULE_BY_KEY[module] || MODULE_BY_KEY.home;
  if (module === "cases" && sub === "mot") {
    return { title: "Un mot dans les cas", parent: { module: "cases", label: meta.label }, resume: `${meta.label} · Un mot dans les cas` };
  }
  if (module === "cases" && sub === "prepositions") {
    return { title: "Prépositions et cas", parent: { module: "cases", label: meta.label }, resume: `${meta.label} · Prépositions` };
  }
  if (module === "cases" && sub) {
    const c = cases.find((x) => x.key === sub);
    if (c) return { title: c.label, parent: { module: "cases", label: meta.label }, resume: `${meta.label} · ${c.label}` };
  }
  if (module === "verbs" && sub) {
    const v = verbs.find((x) => x.id === sub);
    if (v) return { title: v.fr, parent: { module: "verbs", label: meta.label }, resume: `${meta.label} · ${v.fr}` };
  }
  return { title: meta.label, parent: null, resume: module === "home" ? null : meta.label };
}
