import { describe, it, expect, vi } from "vitest";
import { dayKey, computeStreak, weekDays, recordActivity, recordLesson, recordWordSeen, __resetStatsForTests } from "../src/lib/stats.js";

const d = (y, m, day, h = 12) => new Date(y, m - 1, day, h);

describe("série de jours", () => {
  it("dayKey : format AAAA-MM-JJ, fuseau local (même à 23h59)", () => {
    expect(dayKey(d(2026, 11, 5))).toBe("2026-11-05");
    expect(dayKey(d(2026, 1, 9, 23))).toBe("2026-01-09");
  });
  it("aucune activité : série de 0", () => expect(computeStreak([], d(2026, 11, 10))).toBe(0));
  it("aujourd'hui seulement : 1", () => expect(computeStreak(["2026-11-10"], d(2026, 11, 10))).toBe(1));
  it("jours consécutifs jusqu'à aujourd'hui", () => {
    expect(computeStreak(["2026-11-08", "2026-11-09", "2026-11-10"], d(2026, 11, 10))).toBe(3);
  });
  it("la série n'est pas perdue tant que la journée n'est pas finie (hier validé, pas encore aujourd'hui)", () => {
    expect(computeStreak(["2026-11-08", "2026-11-09"], d(2026, 11, 10))).toBe(2);
  });
  it("un jour manqué remet la série à zéro", () => {
    expect(computeStreak(["2026-11-07", "2026-11-08"], d(2026, 11, 10))).toBe(0);
  });
  it("une interruption dans le passé ne compte pas", () => {
    expect(computeStreak(["2026-11-05", "2026-11-08", "2026-11-09", "2026-11-10"], d(2026, 11, 10))).toBe(3);
  });
  it("traverse un changement de mois et d'année", () => {
    expect(computeStreak(["2026-12-31", "2027-01-01"], d(2027, 1, 1))).toBe(2);
  });
});

describe("semaine en cours (lundi en premier)", () => {
  it("7 jours, jours validés et jour courant repérés", () => {
    const week = weekDays(["2026-11-09", "2026-11-11"], d(2026, 11, 11)); // mercredi 11 novembre 2026
    expect(week.map((x) => x.label).join("")).toBe("LMMJVSD");
    expect(week[0].key).toBe("2026-11-09");
    expect(week.filter((x) => x.done).map((x) => x.name)).toEqual(["lundi", "mercredi"]);
    expect(week.find((x) => x.today).name).toBe("mercredi");
  });
  it("un dimanche appartient à la semaine qui finit ce jour-là", () => {
    const week = weekDays([], d(2026, 11, 15)); // dimanche
    expect(week[0].key).toBe("2026-11-09");
    expect(week[6].today).toBe(true);
  });
});

describe("enregistrement", () => {
  it("valider la journée est idempotent et persistant", () => {
    __resetStatsForTests();
    recordActivity(d(2026, 11, 10));
    recordActivity(d(2026, 11, 10, 20));
    expect(JSON.parse(localStorage.getItem("freskorusse_stats")).days).toEqual(["2026-11-10"]);
  });
  it("une leçon terminée valide aussi la journée", () => {
    __resetStatsForTests();
    recordLesson(d(2026, 11, 10));
    recordLesson(d(2026, 11, 10));
    const s = JSON.parse(localStorage.getItem("freskorusse_stats"));
    expect(s.lessons).toBe(2);
    expect(s.days).toEqual(["2026-11-10"]);
  });
  it("un mot n'est compté qu'une fois", () => {
    __resetStatsForTests();
    recordWordSeen(7, d(2026, 11, 10));
    recordWordSeen(7, d(2026, 11, 10));
    recordWordSeen(9, d(2026, 11, 10));
    expect(JSON.parse(localStorage.getItem("freskorusse_stats")).words).toEqual([7, 9]);
  });
  it("des données corrompues ne cassent pas l'app", async () => {
    localStorage.setItem("freskorusse_stats", "{ pas du json");
    vi.resetModules();
    const fresh = await import("../src/lib/stats.js");
    expect(() => fresh.recordActivity(d(2026, 11, 10))).not.toThrow();
    localStorage.setItem("freskorusse_stats", JSON.stringify({ days: "oups", lessons: "x", words: 3 }));
    vi.resetModules();
    const again = await import("../src/lib/stats.js");
    expect(() => again.recordLesson(d(2026, 11, 10))).not.toThrow();
  });
});
