import { useSyncExternalStore } from "react";
import { readStorage, writeStorage } from "./hooks.js";

// ---------------------------------------------------------------------------
// Effets sonores synthétisés avec l'API Web Audio : pas de fichier audio, donc
// rien à télécharger ni à mettre en cache, et ça marche hors-ligne.
//
// Notion : un son = un oscillateur (onde sinus, triangle...) + une enveloppe de
// volume (montée très rapide, puis descente douce). Sans enveloppe, le son claque.
//
// Règles :
//  - volume volontairement bas, jamais agressif ;
//  - les navigateurs interdisent le son avant un geste de l'utilisateur : tous nos
//    sons répondent à un clic ou une touche, donc c'est respecté ;
//  - un interrupteur (barre latérale, page « Plus ») coupe tout, et le choix est mémorisé.
// ---------------------------------------------------------------------------

const KEY = "freskorusse_sound";
let enabled = readStorage(KEY, "1") !== "0"; // sons activés par défaut
let ctx = null;
let master = null;
const listeners = new Set();

function audioContext() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended" && ctx.resume) ctx.resume().catch(() => {});
  return ctx;
}

// Une note : fréquence (Hz), départ et durée (s), forme d'onde, volume, glissando éventuel.
function tone({ freq, start = 0, dur = 0.15, type = "sine", gain = 0.2, slideTo = null }) {
  const c = audioContext();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.linearRampToValueAtTime(gain, t0 + 0.012); // attaque rapide
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); // extinction douce
  osc.connect(env);
  env.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

// Notes (Hz) utilisées par les mélodies.
const N = { G4: 392.0, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, C6: 1046.5 };

const SOUNDS = {
  // Bonne réponse : deux notes montantes, claires.
  correct() {
    tone({ freq: N.E5, dur: 0.12, type: "triangle", gain: 0.22 });
    tone({ freq: N.A5, start: 0.09, dur: 0.22, type: "triangle", gain: 0.22 });
  },
  // Mauvaise réponse : une note grave qui descend, douce (pas un buzzer).
  wrong() {
    tone({ freq: 220, dur: 0.26, type: "triangle", gain: 0.2, slideTo: 150 });
  },
  // Série réussie : arpège ascendant.
  win() {
    [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone({ freq: f, start: i * 0.11, dur: i === 3 ? 0.5 : 0.18, type: "triangle", gain: 0.22 }));
  },
  // Plus de vies : trois notes descendantes.
  lose() {
    [N.G4, 330, 262].forEach((f, i) => tone({ freq: f, start: i * 0.16, dur: i === 2 ? 0.45 : 0.2, type: "triangle", gain: 0.2 }));
  },
  // Début d'une série.
  start() {
    tone({ freq: N.G4, dur: 0.1, type: "sine", gain: 0.18 });
    tone({ freq: N.D5, start: 0.08, dur: 0.16, type: "sine", gain: 0.18 });
  },
  // Carte retournée.
  flip() {
    tone({ freq: 700, dur: 0.07, type: "sine", gain: 0.14, slideTo: 1000 });
  },
  // Choix d'une réponse.
  select() {
    tone({ freq: 520, dur: 0.05, type: "sine", gain: 0.12 });
  },
  // Interrupteur, petite confirmation.
  tap() {
    tone({ freq: 600, dur: 0.05, type: "sine", gain: 0.12 });
  },
};

export function play(name) {
  if (!enabled) return;
  try {
    if (SOUNDS[name]) SOUNDS[name]();
  } catch (e) {
    // Un son qui échoue ne doit jamais casser l'application.
  }
}

export const isSoundEnabled = () => enabled;

export function setSoundEnabled(value) {
  enabled = !!value;
  writeStorage(KEY, enabled ? "1" : "0");
  listeners.forEach((l) => l());
  if (enabled) play("tap"); // confirmation audible quand on réactive
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const useSoundEnabled = () => useSyncExternalStore(subscribe, isSoundEnabled, isSoundEnabled);
