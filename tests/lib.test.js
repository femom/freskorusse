import { describe, it, expect } from "vitest";
import { parseHash, hrefFor } from "../src/lib/router.jsx";
import { badgeColors, contrastRatio, legible } from "../src/lib/color.js";
import { normalize, foldForSearch, shuffle } from "../src/lib/text.js";
import { describeRoute } from "../src/navigation.js";
import { caseColors } from "../src/data/cases.js";
import { verbs } from "../src/data/verbs.js";

describe("routeur : parseHash / hrefFor", () => {
  it("aller-retour module + sous-élément", () => {
    expect(parseHash(hrefFor("verbs", "byt"))).toMatchObject({ module: "verbs", sub: "byt" });
    expect(parseHash(hrefFor("cases", "acc"))).toMatchObject({ module: "cases", sub: "acc" });
  });
  it("accueil et hash vide", () => {
    expect(parseHash("").module).toBe("home");
    expect(parseHash("#/").module).toBe("home");
    expect(hrefFor("home")).toBe("#/");
  });
  it("route inconnue -> accueil (pas de page blanche)", () => {
    expect(parseHash("#/nimportequoi").module).toBe("home");
  });
  it("l'identifiant 0 est conservé (premier texte / première phrase)", () => {
    expect(hrefFor("library", 0)).toBe("#/bibliotheque/0");
    expect(parseHash("#/bibliotheque/0").sub).toBe("0");
    expect(hrefFor("phrases", "visa", { id: 0 })).toBe("#/phrases/visa?id=0");
    expect(parseHash("#/phrases/visa?id=0").query.get("id")).toBe("0");
  });
  it("paramètre q encodé", () => {
    const h = hrefFor("bank", null, { q: "привет мир" });
    expect(parseHash(h).query.get("q")).toBe("привет мир");
  });
});

describe("couleurs : contraste WCAG", () => {
  it("badgeColors atteint 4,5:1 sur chaque couleur de cas et de groupe de verbes", () => {
    const colors = [
      ...Object.values(caseColors).map((c) => c.c),
      "#669f38", "#bf614a", "#196B5B",
    ];
    colors.forEach((bg) => {
      const b = badgeColors(bg);
      expect(contrastRatio(b.background, b.color)).toBeGreaterThanOrEqual(4.5);
    });
  });
  it("legible() produit un color-mix valide", () => {
    expect(legible("#abcdef", 60)).toBe("color-mix(in srgb, #abcdef 60%, var(--ink))");
  });
});

describe("texte", () => {
  it("normalize ignore casse, ё/е et ponctuation", () => {
    expect(normalize("  Ёлка! ")).toBe("елка");
  });
  it("foldForSearch ignore accents", () => {
    expect(foldForSearch("Dictée")).toBe("dictee");
  });
  it("shuffle ne modifie pas l'entrée et garde les éléments", () => {
    const a = [1, 2, 3, 4, 5];
    const b = shuffle(a);
    expect(a).toEqual([1, 2, 3, 4, 5]);
    expect([...b].sort()).toEqual(a);
  });
});

describe("describeRoute", () => {
  it("détail valide : titre + parent", () => {
    const d = describeRoute({ module: "cases", sub: "acc" });
    expect(d.parent).toMatchObject({ module: "cases" });
    expect(d.title).toBeTruthy();
  });
  it("détail invalide : pas de parent", () => {
    expect(describeRoute({ module: "verbs", sub: "zzz" }).parent).toBeNull();
  });
  it("tous les verbes ont un id unique (clé d'URL)", () => {
    const ids = verbs.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
