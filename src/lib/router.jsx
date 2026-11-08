import React, { useMemo, useSyncExternalStore } from "react";

// ---------------------------------------------------------------------------
// Routeur par hash, sans dépendance.
//
// Pourquoi un hash (#/cas/acc) plutôt que l'historique « propre » (/cas/acc) ?
// L'app est statique, installable (PWA) et doit rester déployable dans
// n'importe quel sous-dossier (base: "./" dans vite.config.js) : avec un hash,
// aucune règle de réécriture serveur n'est nécessaire et le hors-ligne marche.
//
// Notion : « état dans l'URL » (deep linking). Chaque écran a une adresse :
// le bouton Retour du navigateur/téléphone remonte l'historique au lieu de
// quitter l'app, un rafraîchissement retombe au même endroit, un lien se
// partage.
// ---------------------------------------------------------------------------

// Clé interne de module  <->  segment d'URL.
export const ROUTES = {
  home: "",
  cases: "cas",
  verbs: "verbes",
  bank: "mots",
  phrases: "phrases",
  library: "bibliotheque",
  dictation: "dictee",
  translation: "traduction",
  more: "plus",
};
const SLUG_TO_MODULE = Object.fromEntries(
  Object.entries(ROUTES).map(([key, slug]) => [slug, key])
);

// "#/cas/acc?q=x" -> { module: "cases", sub: "acc", query: URLSearchParams }
export function parseHash(hash) {
  const raw = (hash || "").replace(/^#\/?/, "");
  const [pathPart, queryPart = ""] = raw.split("?");
  const segments = pathPart.split("/").filter(Boolean).map(decodeURIComponent);
  const module = SLUG_TO_MODULE[segments[0] || ""] || "home";
  return {
    module,
    sub: segments[1] || null,
    query: new URLSearchParams(queryPart),
  };
}

// Construit l'adresse d'un écran : hrefFor("verbs", "byt") -> "#/verbes/byt"
export function hrefFor(module, sub, query) {
  let href = "#/" + (ROUTES[module] ?? "");
  // Attention : un identifiant peut valoir 0 (premier texte, première phrase) — on teste donc explicitement.
  if (sub !== null && sub !== undefined && sub !== "") href += "/" + encodeURIComponent(sub);
  if (query) {
    const qs = new URLSearchParams(query).toString();
    if (qs) href += "?" + qs;
  }
  return href;
}

// --- Intention de navigation + mémoire du scroll -----------------------------
// Une navigation « normale » (clic sur un lien) repart en haut de page ; un
// retour arrière doit retrouver la position de défilement qu'on avait quittée ;
// un simple changement de filtre (onglet de catégorie) ne doit pas bouger la page.
// Le routeur note donc l'intention juste avant de changer le hash.
let intent = { type: "history", at: 0 };
const scrollMemory = new Map();

function setIntent(type) {
  intent = { type, at: performance.now() };
}
// Lu une seule fois par App après chaque changement de route. Au-delà d'une
// seconde, l'intention est périmée (ex. clic sur un lien déjà actif).
export function consumeIntent() {
  const type = performance.now() - intent.at < 1000 ? intent.type : "history";
  intent = { type: "history", at: 0 };
  return type;
}
export function savedScroll(hash) {
  return scrollMemory.get(hash) ?? 0;
}

if (typeof window !== "undefined") {
  // On gère nous-mêmes le scroll : sinon le navigateur et React se disputent la position.
  try { window.history.scrollRestoration = "manual"; } catch (e) {}
  // Déclenché avant le rendu de la nouvelle page : window.scrollY est encore
  // celui de l'écran que l'on quitte.
  window.addEventListener("hashchange", (event) => {
    try {
      scrollMemory.set(new URL(event.oldURL).hash, window.scrollY);
    } catch (e) {}
  });
}

function subscribe(callback) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
const getHash = () => window.location.hash;

// Hook : renvoie la route courante et son hash brut.
export function useRoute() {
  const hash = useSyncExternalStore(subscribe, getHash, () => "");
  return useMemo(() => ({ ...parseHash(hash), hash }), [hash]);
}

// Navigation programmatique (résultats de recherche, onglets-filtres...).
//   replace    : remplace l'entrée d'historique au lieu d'en ajouter une
//   keepScroll : ne touche ni au scroll ni au focus (changement de filtre)
export function navigate(module, sub, { replace = false, keepScroll = false, query } = {}) {
  setIntent(keepScroll ? "keep" : "push");
  const href = hrefFor(module, sub, query);
  if (replace) {
    const oldURL = window.location.href;
    const url = window.location.pathname + window.location.search + href;
    window.history.replaceState(null, "", url);
    // replaceState ne déclenche pas « hashchange » : on le simule pour que le routeur réagisse.
    window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL: window.location.href }));
  } else {
    window.location.hash = href;
  }
}

// Lien interne : un vrai <a href>, donc focusable, annoncé comme lien, ouvrable
// dans un nouvel onglet, et le clic remet la page en haut.
export function Link({ to, sub, query, className, children, onClick, ...rest }) {
  function handleClick(event) {
    if (onClick) onClick(event);
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (!modified) setIntent("push");
  }
  return (
    <a href={hrefFor(to, sub, query)} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
