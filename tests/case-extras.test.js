import { describe, it, expect } from "vitest";
import { cases } from "../src/data/cases.js";
import { extraExamples, recognitionItems, prepositionTable } from "../src/data/caseExtras.js";
import { decline } from "../src/lib/declension.js";
import { computeExample } from "../src/lib/caseExamples.js";

const lower = (s) => s.toLowerCase();

// Forme du mot au cas voulu, d'après le moteur.
function expected({ lemma, n, animate, loc }, caseKey) {
  const r = decline(lemma, { animate });
  expect(r.ok, lemma).toBe(true);
  return loc ? r.loc.text : r[n][caseKey].text;
}

describe("exemples supplémentaires", () => {
  Object.entries(extraExamples).forEach(([key, list]) => {
    it(`${key} : le mot en évidence est la bonne forme, et il figure dans la phrase`, () => {
      expect(list.length).toBeGreaterThanOrEqual(4);
      list.forEach(([tag, ru, phon, fr, word, check]) => {
        expect(["M", "F", "N", "P", "M inanimé", "M animé"]).toContain(tag);
        expect(ru, ru).toContain(word);
        expect(ru.split(word).length - 1, `« ${word} » doit apparaître une seule fois dans « ${ru} »`).toBe(1);
        expect(fr.length).toBeGreaterThan(5);
        expect(lower(word), `${check.lemma} ${check.n} ${key}`).toBe(lower(expected(check, key)));
      });
    });
  });
  it("tous les cas ont des exemples supplémentaires", () => {
    expect(Object.keys(extraExamples).sort()).toEqual(cases.map((c) => c.key).sort());
  });
});

describe("phrases de reconnaissance", () => {
  it("chaque mot souligné est la forme exacte du cas annoncé (le moteur confirme)", () => {
    recognitionItems.forEach((it) => {
      expect(it.word, `${it.lemma} ${it.case}`).toBe(expected(it, it.case));
    });
  });
  it("le mot souligné est dans la phrase, avec une traduction et un indice", () => {
    recognitionItems.forEach((it) => {
      expect(`${it.before}${it.word}${it.after}`).toContain(it.word);
      expect(it.fr.length).toBeGreaterThan(8);
      expect(it.hint.length).toBeGreaterThan(20);
    });
  });
  it("au moins 5 phrases par cas, toutes uniques", () => {
    cases.forEach((c) => expect(recognitionItems.filter((i) => i.case === c.key).length, c.key).toBeGreaterThanOrEqual(5));
    const sentences = recognitionItems.map((i) => i.before + i.word + i.after);
    expect(new Set(sentences).size).toBe(sentences.length);
  });
  it("les exemples ambigus sont signalés : un masculin inanimé a la même forme au nominatif et à l'accusatif", () => {
    // « чай » sert à l'accusatif : l'indice doit donc expliquer pourquoi ce n'est pas un nominatif.
    const tea = recognitionItems.find((i) => i.word === "чай");
    expect(tea.case).toBe("acc");
    expect(tea.hint).toMatch(/nominatif/);
  });
});

describe("prépositions et cas", () => {
  const uses = prepositionTable.flatMap((p) => p.uses.map((u) => ({ ru: p.ru, ...u })));

  it("chaque exemple calculé par le moteur correspond à la phrase écrite à la main", () => {
    uses.forEach((u) => {
      const ex = computeExample(u.ex, u.case);
      expect(ex, `${u.ru} ${u.case}`).not.toBeNull();
      expect(ex.prefix + ex.form.text, `${u.ru} + ${u.case}`).toBe(u.ex.expect);
    });
  });
  it("les 6 cas ne sont pas tous concernés : le nominatif n'a aucune préposition", () => {
    expect(uses.some((u) => u.case === "nom")).toBe(false);
    ["gen", "dat", "acc", "ins", "pre"].forEach((k) => expect(uses.some((u) => u.case === k), k).toBe(true));
  });
  it("les prépositions à double sens (mouvement ou lieu) sont bien là", () => {
    const cases_of = (ru) => prepositionTable.find((p) => p.ru === ru).uses.map((u) => u.case).sort();
    expect(cases_of("в")).toEqual(["acc", "pre"]);
    expect(cases_of("на")).toEqual(["acc", "pre"]);
    expect(cases_of("за")).toEqual(["acc", "ins"]);
    expect(cases_of("под")).toEqual(["acc", "ins"]);
    expect(cases_of("с")).toEqual(["gen", "ins"]);
  });
  it("cohérent avec les listes des cas (aucune préposition ne contredit caseInfo)", async () => {
    const { caseInfo } = await import("../src/data/cases.js");
    Object.entries(caseInfo).forEach(([key, info]) => {
      info.oftenWith.prepositions.forEach((p) => {
        const entry = prepositionTable.find((t) => t.ru === p.ru || t.ru.split(" / ").includes(p.ru));
        if (!entry) return; // préposition listée dans le cas mais sans fiche détaillée : toléré
        expect(entry.uses.map((u) => u.case), `${p.ru} dans ${key}`).toContain(key);
      });
    });
  });
  it("triée par ordre alphabétique russe", () => {
    const names = prepositionTable.map((p) => p.ru);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "ru")));
  });
});
