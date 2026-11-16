import { useSyncExternalStore } from "react";
import { readStorage, writeStorage } from "./hooks.js";

// ---------------------------------------------------------------------------
// Statistiques d'apprentissage, stockées sur l'appareil (localStorage) : série de jours,
// leçons terminées, mots vus. Aucune donnée n'est envoyée nulle part.
//
// Règles :
//  - un jour est « validé » dès qu'on répond à une question, finit une leçon ou retourne un mot ;
//  - la série compte les jours validés consécutifs ; si aujourd'hui n'est pas encore validé mais
//    que hier l'était, la série n'est pas perdue (on a jusqu'à la fin de la journée).
// Les dates sont celles de l'appareil (fuseau local), au format AAAA-MM-JJ.
// ---------------------------------------------------------------------------

const KEY = "freskorusse_stats";
const MAX_DAYS = 400;

export function dayKey(date = new Date()) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

// Meilleurs scores par leçon : { "case:acc": { best: 8, total: 10, plays: 3 } }. Entrées invalides ignorées.
function cleanScores(raw) {
  const out = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    Object.entries(raw).forEach(([id, s]) => {
      if (s && Number.isFinite(s.best) && Number.isFinite(s.total) && s.total > 0 && s.best >= 0 && s.best <= s.total) {
        out[id] = { best: s.best, total: s.total, plays: Number.isFinite(s.plays) ? s.plays : 1 };
      }
    });
  }
  return out;
}

function load() {
  try {
    const parsed = JSON.parse(readStorage(KEY, "") || "{}");
    return {
      days: Array.isArray(parsed.days) ? parsed.days.filter((d) => typeof d === "string") : [],
      lessons: Number.isFinite(parsed.lessons) ? parsed.lessons : 0,
      words: Array.isArray(parsed.words) ? parsed.words : [],
      scores: cleanScores(parsed.scores),
    };
  } catch (e) {
    return { days: [], lessons: 0, words: [], scores: {} };
  }
}

let state = load();
const listeners = new Set();

function commit(next) {
  state = next;
  writeStorage(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

// Valide la journée (sans effet si elle l'est déjà).
export function recordActivity(now = new Date()) {
  const today = dayKey(now);
  if (!state.days.includes(today)) commit({ ...state, days: [...state.days, today].sort().slice(-MAX_DAYS) });
}

// Une leçon terminée avec succès.
export function recordLesson(now = new Date()) {
  const today = dayKey(now);
  const days = state.days.includes(today) ? state.days : [...state.days, today].sort().slice(-MAX_DAYS);
  commit({ ...state, lessons: state.lessons + 1, days });
}

// Un mot de la banque retourné (compté une seule fois par mot).
export function recordWordSeen(id, now = new Date()) {
  const today = dayKey(now);
  const days = state.days.includes(today) ? state.days : [...state.days, today].sort().slice(-MAX_DAYS);
  const words = state.words.includes(id) ? state.words : [...state.words, id];
  if (words !== state.words || days !== state.days) commit({ ...state, words, days });
}

// Enregistre le résultat d'une série (bonnes réponses sur total) : on garde le MEILLEUR score.
export function recordScore(id, correct, total) {
  if (!id || !(total > 0) || !(correct >= 0) || correct > total) return;
  const prev = state.scores[id];
  const better = !prev || correct / total > prev.best / prev.total;
  const next = { best: better ? correct : prev.best, total: better ? total : prev.total, plays: (prev ? prev.plays : 0) + 1 };
  commit({ ...state, scores: { ...state.scores, [id]: next } });
}

// Nombre de jours validés d'affilée (voir les règles en tête de fichier).
export function computeStreak(days, now = new Date()) {
  const set = new Set(days);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!set.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(dayKey(cursor))) return 0;
  }
  let count = 0;
  while (set.has(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

const LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const NAMES = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

// Les 7 jours de la semaine en cours (lundi en premier), avec ceux qui sont validés.
export function weekDays(days, now = new Date()) {
  const set = new Set(days);
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dayKey(d);
    return { label, name: NAMES[i], key, done: set.has(key), today: key === dayKey(now) };
  });
}

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
const getState = () => state;
export const useStats = () => useSyncExternalStore(subscribe, getState, getState);

// Relit le stockage (tests uniquement : simule un nouveau lancement de l'app).
export function __reloadStatsForTests() {
  state = load();
  listeners.forEach((l) => l());
}

// Réinitialise (tests uniquement).
export function __resetStatsForTests() {
  state = { days: [], lessons: 0, words: [], scores: {} };
  listeners.forEach((l) => l());
}
