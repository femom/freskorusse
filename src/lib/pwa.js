import { useSyncExternalStore } from "react";
import { registerSW } from "virtual:pwa-register";
import { readStorage, writeStorage } from "./hooks.js";

// ---------------------------------------------------------------------------
// Tout ce qui touche à l'application installable (PWA) :
//   1. capture de l'invite d'installation (avant même que React s'affiche) ;
//   2. mises à jour : l'app se met à jour toute seule dès qu'elle est en ligne,
//      sans jamais interrompre un exercice en cours ;
//   3. état du réseau et du mode hors-ligne.
//
// Notion : le « service worker » est un script que le navigateur garde en arrière-plan.
// Il met en cache tous les fichiers de l'app à la première visite (c'est lui qui
// rend le hors-ligne possible) et il détecte les nouvelles versions publiées.
// ---------------------------------------------------------------------------

const UPDATED_KEY = "freskorusse_updated";
const OFFLINE_NOTICE_KEY = "freskorusse_offline_notice_done";
const CHECK_EVERY_MS = 30 * 60 * 1000; // vérification périodique si l'app reste ouverte
const MIN_GAP_MS = 30 * 1000; // pas deux vérifications à moins de 30 s d'écart

function detectStandalone() {
  try {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  } catch (e) {
    return false;
  }
}

let state = {
  installPrompt: null, // événement natif « beforeinstallprompt » quand le navigateur le propose
  installed: detectStandalone(),
  updatePending: false, // une nouvelle version est téléchargée et attend d'être activée
  offlineReady: typeof navigator !== "undefined" && !!(navigator.serviceWorker && navigator.serviceWorker.controller),
  online: typeof navigator === "undefined" ? true : navigator.onLine !== false,
  notice: null, // message à afficher une fois : { kind, text }
};

// Si la page vient de se recharger pour une mise à jour, on l'annonce une fois.
if (readStorage(UPDATED_KEY, "") === "1") {
  writeStorage(UPDATED_KEY, "0");
  state = { ...state, notice: { kind: "updated", text: "FreskoRusse vient d'être mis à jour." } };
}

const listeners = new Set();
function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
export const getPwaState = () => state;
export const subscribePwa = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const usePwa = () => useSyncExternalStore(subscribePwa, getPwaState, getPwaState);
export const dismissNotice = () => setState({ notice: null });

// --- Installation -----------------------------------------------------------

// L'événement peut arriver très tôt : on l'écoute dès l'import de ce module.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // on garde l'invite pour NOTRE bouton
    setState({ installPrompt: event });
  });
  window.addEventListener("appinstalled", () => setState({ installPrompt: null, installed: true }));
}

// Lance l'installation native si le navigateur la propose. Renvoie "accepted",
// "dismissed" ou "unavailable" (dans ce cas, l'interface montre les étapes manuelles).
export async function promptInstall() {
  const event = state.installPrompt;
  if (!event) return "unavailable";
  event.prompt();
  const choice = await event.userChoice;
  setState({ installPrompt: null, installed: choice.outcome === "accepted" });
  return choice.outcome;
}

// Étapes d'installation selon l'appareil, pour les navigateurs qui n'ont pas d'invite
// (Safari, Firefox...) ou quand l'invite n'est pas (encore) disponible.
export function detectPlatform(ua = navigator.userAgent, touchPoints = navigator.maxTouchPoints || 0) {
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/.test(ua)) return /Firefox/.test(ua) ? "android-firefox" : "android";
  if (/Firefox/.test(ua)) return "firefox-desktop";
  if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua)) return "safari-mac";
  return "desktop-chromium";
}

// --- Mises à jour -----------------------------------------------------------

let registration = null;
let updateSW = null;
let busyCount = 0; // nombre d'exercices ouverts : tant qu'il y en a, on n'interrompt pas
let lastCheck = 0;
let applyTimer = null;

// Demande au navigateur s'il existe une nouvelle version (sans effet hors connexion).
export function checkForUpdate() {
  if (!registration || state.online === false) return;
  const now = Date.now();
  if (now - lastCheck < MIN_GAP_MS) return;
  lastCheck = now;
  Promise.resolve(registration.update()).catch(() => {});
}

function applyUpdate() {
  if (!updateSW) return;
  writeStorage(UPDATED_KEY, "1"); // pour annoncer la mise à jour après le rechargement
  updateSW(true); // active la nouvelle version puis recharge la page
}

// Applique la mise à jour dès que c'est sans risque (aucun exercice ouvert).
function maybeApply() {
  if (!state.updatePending || busyCount > 0) return;
  clearTimeout(applyTimer);
  // Petit délai : laisse le temps d'enregistrer l'XP qu'on vient de gagner.
  applyTimer = setTimeout(() => {
    if (state.updatePending && busyCount === 0) applyUpdate();
  }, 400);
}

// Appelé par les écrans d'exercice : ouverts = occupé, fermés = on peut mettre à jour.
export function setBusy(flag) {
  busyCount = Math.max(0, busyCount + (flag ? 1 : -1));
  if (busyCount === 0) maybeApply();
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    setState({ online: true });
    checkForUpdate(); // on vient de retrouver le réseau : c'est le bon moment
  });
  window.addEventListener("offline", () => setState({ online: false }));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkForUpdate(); // retour dans l'app
  });
}

// À appeler une fois au démarrage (main.jsx). Ne fait rien en développement : le
// service worker n'existe que dans la version construite (npm run build).
export function initPwa({ force = false } = {}) {
  if (!force && !import.meta.env.PROD) return;
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      setState({ updatePending: true });
      maybeApply();
    },
    onOfflineReady() {
      // Première installation : tout est en cache. On l'annonce une seule fois par appareil.
      const firstTime = readStorage(OFFLINE_NOTICE_KEY, "") !== "1";
      writeStorage(OFFLINE_NOTICE_KEY, "1");
      setState({
        offlineReady: true,
        notice: firstTime ? { kind: "offline", text: "Prêt : FreskoRusse fonctionne maintenant sans connexion." } : state.notice,
      });
    },
    onRegisteredSW(_url, reg) {
      registration = reg || null;
      if (registration) {
        setInterval(checkForUpdate, CHECK_EVERY_MS);
        checkForUpdate();
      }
    },
  });
}

// Réinitialise l'état interne (tests uniquement).
export function __resetPwaForTests() {
  clearTimeout(applyTimer);
  registration = null;
  updateSW = null;
  busyCount = 0;
  lastCheck = 0;
  state = { ...state, installPrompt: null, installed: false, updatePending: false, offlineReady: false, online: true, notice: null };
  listeners.forEach((l) => l());
}
