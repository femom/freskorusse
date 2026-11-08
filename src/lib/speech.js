// Synthèse vocale (Web Speech API), partagée par la Dictée et les Phrases utiles.
// Ne nécessite pas internet, mais dépend des voix installées sur l'appareil.
//
// Deux pièges classiques corrigés ici :
// 1) `getVoices()` peut renvoyer un tableau VIDE au premier appel, le temps que
//    le navigateur charge sa liste de voix (surtout Chrome/Edge). On écoute
//    donc "voiceschanged" pour réessayer une fois la liste prête.
// 2) Si aucune voix russe n'est installée, on le signale clairement au lieu de
//    laisser le bouton « Écouter » ne rien faire ou lire avec une voix française.
//
// `onStatus(status, detail)` reçoit : "ok" | "no-support" | "no-russian-voice" | "error"
const supported = typeof window !== "undefined" && "speechSynthesis" in window;

let cachedVoices = [];
if (supported) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export function speak(text, onStatus) {
  if (!supported) {
    onStatus && onStatus("no-support");
    return;
  }
  try {
    // Contournement d'un bug de Chrome : cancel() puis speak() dans le même tick
    // peut faire échouer la nouvelle lecture. On n'annule que si quelque chose est en cours.
    window.speechSynthesis.resume();
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
    const ruVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("ru"));

    // Les marques d'accent tonique (U+0301) sont retirées : certains moteurs les
    // prononcent comme un caractère à part.
    const clean = text.normalize("NFC").replace(/\u0301/g, "");
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "ru-RU";
    if (ruVoice) u.voice = ruVoice;
    u.onerror = (e) => onStatus && onStatus("error", e && e.error);
    u.onend = () => onStatus && onStatus("ok");

    // speak() doit suivre le clic de près pour ne pas être bloqué par les
    // navigateurs qui exigent un geste utilisateur.
    window.speechSynthesis.speak(u);
    onStatus && onStatus(ruVoice ? "ok" : "no-russian-voice");
  } catch (e) {
    onStatus && onStatus("error");
  }
}
