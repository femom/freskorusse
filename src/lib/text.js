// Utilitaires de texte partagés par les leçons, la dictée et la recherche.

// Normalise une réponse avant comparaison : espaces superflus, casse, ё/е
// (souvent confondus à l'écrit) et ponctuation ignorés.
export function normalize(s) {
  return (s || "").trim().toLowerCase().replace(/ё/g, "е").replace(/[.,!?]/g, "");
}

// Normalisation « souple » pour la recherche : sans accents ni signes de
// ponctuation, ё = е. "Dictée" et "dictee" se valent.
export function foldForSearch(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Mélange un tableau sans le modifier (algorithme de Fisher-Yates).
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
