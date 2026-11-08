import { describe, it, expect } from "vitest";
import { cases, caseInfo, caseColors, hardSoftRule } from "../src/data/cases.js";
import { computeExample } from "../src/lib/caseExamples.js";
import { decline } from "../src/lib/declension.js";

// Garde-fou central : les tableaux d'enseignement (texte écrit à la main) ne doivent
// jamais contredire le moteur de déclinaison. Chaque exemple est calculé, et sa
// terminaison réelle doit faire partie de celles annoncées.
const endsMatch = (form, ends) => ends.some((e) => (e === "" ? form.end === "" : form.text.endsWith(e)));

describe("données des cas : cohérence avec le moteur", () => {
  cases.forEach((c) => {
    const info = caseInfo[c.key];

    it(`${c.key} : informations de présentation complètes`, () => {
      expect(info.role).toBeTruthy();
      expect(info.shortRole).toBeTruthy();
      expect(info.questionsFr).toBeTruthy();
      expect(caseColors[c.key].c).toMatch(/^#[0-9A-F]{6}$/i);
      expect(info.rows.map((r) => r.g)).toEqual(expect.arrayContaining(["M", "F", "N", "P"]));
    });

    if (c.key !== "nom") {
      it(`${c.key} : tableau principal, chaque terminaison annoncée existe`, () => {
        info.rows.forEach((row) => {
          const ex = computeExample(row, c.key);
          expect(ex, `${row.word} (${row.g})`).not.toBeNull();
          expect(endsMatch(ex.form, row.ends), `${row.word} ${row.number} : ${ex.form.text} vs ${row.ends}`).toBe(true);
        });
      });

      it(`${c.key} : cas particuliers, chaque terminaison annoncée existe`, () => {
        info.special.forEach((row) => {
          row.examples.forEach((spec) => {
            if (spec.text) return; // exemple figé (pluriels irréguliers)
            const ex = computeExample(spec, c.key);
            expect(ex, spec.word).not.toBeNull();
            expect(endsMatch(ex.form, row.ends), `${spec.word} : ${ex.form.text} vs ${row.ends}`).toBe(true);
          });
        });
      });
    }

    it(`${c.key} : exercices intacts (10 questions, réponses non vides)`, () => {
      expect(c.exos).toHaveLength(10);
      c.exos.forEach((e) => expect(e.answer.length).toBeGreaterThan(0));
    });
  });

  it("l'accusatif : le tableau montre bien animé = génitif et inanimé = nominatif", () => {
    const rows = caseInfo.acc.rows;
    const inanimate = rows.find((r) => r.g === "M" && r.sub === "inanimé");
    const animate = rows.find((r) => r.g === "M" && r.sub === "animé");
    expect(decline(inanimate.word).sg.acc.text).toBe(decline(inanimate.word).sg.nom.text);
    expect(decline(animate.word, { animate: true }).sg.acc.text).toBe(decline(animate.word, { animate: true }).sg.gen.text);
  });

  it("le prépositionnel ne cite aucune préposition d'un autre cas", () => {
    const preps = caseInfo.pre.oftenWith.prepositions.map((p) => p.ru);
    ["с", "к", "от", "для"].forEach((wrong) => expect(preps).not.toContain(wrong));
    expect(preps.join(" ")).toMatch(/в/);
  });

  it("la règle dur/mou ne contient plus l'exemple confus d'origine", () => {
    expect(hardSoftRule.points.join(" ")).not.toMatch(/мужчиной/);
  });

  it("les exos n'utilisent plus de tiret cadratin", () => {
    cases.forEach((c) => c.exos.forEach((e) => expect(e.base).not.toMatch(/—/)));
  });
});
