import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { contrastRatio } from "../src/lib/color.js";

// Les couleurs viennent du CSS lui-même : si quelqu'un change une variable, ce test recalcule.
const css = fs.readFileSync("src/styles.css", "utf8");

function tokenBlock(selectorStart) {
  let from = 0;
  for (;;) {
    const i = css.indexOf(selectorStart, from);
    if (i === -1) throw new Error("bloc introuvable : " + selectorStart);
    const block = css.slice(i, css.indexOf("\n}", i));
    if (block.includes("--bg:")) return block;
    from = i + 1;
  }
}
const read = (block, name) => {
  const m = block.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!m) throw new Error("variable absente : --" + name);
  return m[1];
};
const themes = { "Nuit prune (sombre)": tokenBlock(":root {"), "Lavande (clair)": tokenBlock(':root[data-theme="light"] {') };

describe.each(Object.entries(themes))("palette %s", (_name, block) => {
  const c = Object.fromEntries(["bg", "card", "nav", "ink", "ink-soft", "ink-faint", "field-border", "btn", "on-btn", "on-pastel", "lime", "lilac", "butter", "pink", "mint"].map((k) => [k, read(block, k)]));
  const ratio = (a, b) => contrastRatio(c[a], c[b]);

  it("texte courant : AA (4,5:1) sur le fond ET sur les cartes", () => {
    ["ink", "ink-soft", "ink-faint"].forEach((t) => ["bg", "card"].forEach((s) => expect(ratio(t, s), `${t} sur ${s}`).toBeGreaterThanOrEqual(4.5)));
  });
  it("confort : le texte principal n'est ni trop faible ni agressif (9:1 à 13:1)", () => {
    // Demande produit : contrastes adoucis. AAA reste atteint (>= 7:1), sans la dureté du noir sur blanc.
    ["bg", "card"].forEach((s) => {
      expect(ratio("ink", s)).toBeGreaterThanOrEqual(9);
      expect(ratio("ink", s)).toBeLessThanOrEqual(13);
    });
  });
  it("la barre de navigation reste lisible", () => expect(ratio("ink", "nav")).toBeGreaterThanOrEqual(9));
  it("bordure des champs : visible (3:1) sur le fond et sur les cartes", () => {
    expect(ratio("field-border", "bg")).toBeGreaterThanOrEqual(3);
    expect(ratio("field-border", "card")).toBeGreaterThanOrEqual(3);
  });
  it("boutons principaux et texte sur pastels : très lisibles (7:1)", () => {
    expect(ratio("on-btn", "btn")).toBeGreaterThanOrEqual(7);
    ["lime", "lilac", "butter", "pink", "mint"].forEach((p) => expect(ratio("on-pastel", p), p).toBeGreaterThanOrEqual(7));
  });
});

describe("style verre : plus de contours noirs épais", () => {
  it("aucun contour de 2 px en couleur d'encre", () => {
    expect(css).not.toMatch(/border:\s*2px solid var\(--ink\)/);
    expect(css).not.toMatch(/--outline\s*:/);
  });
  it("le texte du défi reste lisible sur sa carte mobile dans les deux thèmes", () => {
    const mobileStyles = css.slice(css.lastIndexOf("@media (max-width: 1023px), (pointer: coarse)"));
    expect(mobileStyles).toMatch(/\.challenge-card,\s*\.challenge-card h2\s*\{\s*color:\s*var\(--ink\);/);
  });
  it("les variables du verre existent dans les deux thèmes", () => {
    Object.values(themes).forEach((b) => ["glass-line", "glass-hi", "glass-shadow", "glass-fill"].forEach((v) => expect(b).toContain(`--${v}:`)));
  });
  it("un repli est prévu quand le navigateur n'a pas de flou d'arrière-plan", () => {
    expect(css).toMatch(/@supports not \(\(backdrop-filter: blur\(1px\)\)/);
  });
});

describe("survol des cartes", () => {
  it("utilise une bordure du thème sans soulever les cartes", () => {
    expect(css).toMatch(/\.verb-card:hover,\s*\.module-card:hover,\s*\.case-card:hover,\s*\.pick:hover\s*\{\s*border-color:\s*var\(--ink-faint\);/);
    expect(css).not.toMatch(/\.(?:verb-card|module-card|case-card|pick):hover\s*\{[^}]*transform:\s*translateY/);
    expect(css).toMatch(/\.case-card\s*\{[^}]*border:\s*1px solid/);
  });
});

describe("police embarquée (hors-ligne)", () => {
  it("Onest latin + cyrillique est importée localement, et mise en cache par le service worker", () => {
    const main = fs.readFileSync("src/main.jsx", "utf8");
    ["latin", "cyrillic"].forEach((s) => [400, 600, 700, 800].forEach((w) => expect(main).toContain(`@fontsource/onest/${s}-${w}.css`)));
    expect(fs.readFileSync("vite.config.js", "utf8")).toMatch(/globPatterns:.*woff2/);
    expect(css).toContain('"Onest"');
  });
});
