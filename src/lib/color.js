// Aides de lisibilité des couleurs (contraste WCAG).
// Notion : ratio de contraste. AA exige 4,5:1 pour du texte courant et 3:1
// pour les éléments graphiques (icônes, bordures utiles).

function channel(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function luminance(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const LIGHT_INK = "#ffffff";
const DARK_INK = "#10151f";

// Couleur de texte (blanc ou encre foncée) la plus lisible sur un fond donné.
export function readableText(bgHex) {
  return contrastRatio(bgHex, LIGHT_INK) >= contrastRatio(bgHex, DARK_INK) ? LIGHT_INK : DARK_INK;
}

function toHex(r, g, b) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}
// Mélange `hex` avec `target` à `ratio` (0 = hex, 1 = target).
function mixHex(hex, target, ratio) {
  const parse = (h) => [0, 2, 4].map((i) => parseInt(h.replace("#", "").slice(i, i + 2), 16));
  const a = parse(hex);
  const b = parse(target);
  return toHex(...a.map((v, i) => v + (b[i] - v) * ratio));
}

// Couleurs d'un badge (fond + texte) garanties à ≥ 4,5:1. On garde la couleur
// d'origine si un texte blanc ou foncé suffit ; sinon on la rapproche
// progressivement du noir (texte blanc) ou du blanc (texte foncé) : la teinte
// reste reconnaissable, le texte devient lisible.
export function badgeColors(bgHex, min = 4.5) {
  const text = readableText(bgHex);
  const toward = text === LIGHT_INK ? "#000000" : "#ffffff";
  let bg = bgHex;
  for (let step = 1; contrastRatio(bg, text) < min && step <= 20; step++) {
    bg = mixHex(bgHex, toward, step * 0.04);
  }
  return { background: bg, color: text };
}

// Version « texte » d'une couleur d'accent : on la rapproche de l'encre du
// thème courant (claire en sombre, foncée en clair). Marche dans les deux
// thèmes sans connaître le fond, grâce à color-mix et à la variable --ink.
export function legible(color, pct = 65) {
  return `color-mix(in srgb, ${color} ${pct}%, var(--ink))`;
}
