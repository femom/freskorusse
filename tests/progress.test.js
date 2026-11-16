import { describe, it, expect, vi } from "vitest";
import { recordScore, __resetStatsForTests, __reloadStatsForTests } from "../src/lib/stats.js";
import { ratioOf, isMastered, casesMastered, heroProgress, bestLabel, MASTERY } from "../src/lib/progress.js";
import { cases } from "../src/data/cases.js";

const stored = () => JSON.parse(localStorage.getItem("freskorusse_stats")).scores;

describe("scores par leçon", () => {
  it("garde le MEILLEUR score, pas le dernier", () => {
    __resetStatsForTests();
    recordScore("case:acc", 6, 10);
    recordScore("case:acc", 9, 10);
    recordScore("case:acc", 4, 10); // moins bon : ne remplace pas
    expect(stored()["case:acc"]).toEqual({ best: 9, total: 10, plays: 3 });
  });
  it("compare des ratios, pas des chiffres bruts (10 questions puis 12)", () => {
    __resetStatsForTests();
    recordScore("verbs", 8, 10); // 0,80
    recordScore("verbs", 9, 12); // 0,75 : moins bon
    expect(stored().verbs.best).toBe(8);
    recordScore("verbs", 11, 12); // 0,92 : meilleur
    expect(stored().verbs).toMatchObject({ best: 11, total: 12 });
  });
  it("ignore les valeurs impossibles", () => {
    __resetStatsForTests();
    recordScore(undefined, 1, 2);
    recordScore("x", 1, 0);
    recordScore("x", -1, 5);
    recordScore("x", 6, 5);
    recordScore("x", NaN, 5);
    expect(localStorage.getItem("freskorusse_stats")).toBeNull();
  });
  it("relit les scores au lancement et écarte les entrées corrompues", () => {
    localStorage.setItem("freskorusse_stats", JSON.stringify({ days: [], lessons: 0, words: [], scores: {
      ok: { best: 3, total: 4, plays: 2 }, trop: { best: 9, total: 4 }, texte: "oups", neg: { best: -1, total: 4 },
    } }));
    __reloadStatsForTests();
    recordScore("nouveau", 1, 2);
    expect(Object.keys(stored()).sort()).toEqual(["nouveau", "ok"]);
    localStorage.setItem("freskorusse_stats", JSON.stringify({ scores: [1, 2] }));
    expect(() => __reloadStatsForTests()).not.toThrow();
  });
});

describe("maîtrise et progression", () => {
  it("un cas est maîtrisé à partir de 80 % (8 sur 10 oui, 7 sur 10 non)", () => {
    expect(MASTERY).toBe(0.8);
    expect(isMastered({ a: { best: 8, total: 10 } }, "a")).toBe(true);
    expect(isMastered({ a: { best: 7, total: 10 } }, "a")).toBe(false);
    expect(isMastered({}, "a")).toBe(false);
    expect(ratioOf(undefined, "a")).toBe(0);
  });
  it("compte les cas maîtrisés parmi les 6", () => {
    const scores = { "case:nom": { best: 10, total: 10 }, "case:gen": { best: 8, total: 10 }, "case:dat": { best: 5, total: 10 }, recognition: { best: 12, total: 12 } };
    expect(casesMastered(scores)).toBe(2); // « recognition » n'est pas un cas
    expect(casesMastered({})).toBe(0);
  });
  it("barre de « Reprendre » : cas par défaut, score pour les autres modules, rien sinon", () => {
    const p = heroProgress("cases", { "case:nom": { best: 9, total: 10 } });
    expect(p.label).toBe(`1 cas maîtrisé sur ${cases.length}`);
    expect(p.ratio).toBeCloseTo(1 / cases.length);
    expect(heroProgress(undefined, {}).label).toBe(`0 cas maîtrisé sur ${cases.length}`);
    expect(heroProgress("verbs", { verbs: { best: 9, total: 12 } })).toEqual({ ratio: 0.75, label: "Meilleur score : 9 sur 12" });
    expect(heroProgress("bank", {}).ratio).toBe(0);
    expect(heroProgress("phrases", {})).toBeNull();
  });
  it("libellé du meilleur score", () => {
    expect(bestLabel({ x: { best: 7, total: 10 } }, "x")).toBe("Meilleur score : 7 sur 10");
    expect(bestLabel({}, "x")).toBeNull();
  });
});
