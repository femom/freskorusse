import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import App from "../src/App.jsx";
import LessonEngine from "../src/components/LessonEngine.jsx";
import { recordScore } from "../src/lib/stats.js";

const go = async (hash) => { window.location.hash = hash; await waitFor(() => expect(window.location.hash).toBe(hash)); };
const QUESTIONS = ["один", "два", "три"].map((a, i) => ({ type: "type", prompt: `Question ${i + 1}`, base: "", answer: [a] }));
const scores = () => JSON.parse(localStorage.getItem("freskorusse_stats") || "{}").scores || {};

// Joue une série : `answers` donne ce qu'on tape à chaque question (dans l'ordre affiché).
async function play(answers) {
  const questions = QUESTIONS;
  render(<LessonEngine questions={questions} title="Test" accent="var(--accent-cases)" lessonId="test" onClose={() => {}} onFinish={() => {}} />);
  const dialog = await screen.findByRole("dialog", { name: "Test" }, { hidden: true });
  for (let i = 0; i < answers.length; i++) {
    const input = within(dialog).queryByLabelText("Ta réponse");
    if (!input) break;
    const label = within(dialog).getByText(/^Question \d$/).textContent;
    const expected = questions.find((q) => q.prompt === label).answer[0];
    fireEvent.change(input, { target: { value: answers[i] === "OK" ? expected : "zzz" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Vérifier" }));
    fireEvent.click(await within(dialog).findByRole("button", { name: /Continuer|Voir le résultat/ }));
  }
  return dialog;
}

describe("moteur de leçon : score, bulle, autocollant", () => {
  it("série réussie : bulle verte, autocollant citron, détail du score, meilleur score enregistré", async () => {
    const dialog = await play(["OK", "OK", "OK"]);
    expect(await within(dialog).findByText("Leçon terminée !")).toBeTruthy();
    expect(within(dialog).getByText("3 bonnes réponses sur 3")).toBeTruthy();
    expect(dialog.querySelector(".sticker.win")).toBeTruthy();
    expect(scores().test).toMatchObject({ best: 3, total: 3 });
  });

  it("série perdue (3 erreurs) : autocollant rose, score de 0 enregistré", async () => {
    const dialog = await play(["X", "X", "X"]);
    expect(await within(dialog).findByText("Plus de vies")).toBeTruthy();
    expect(within(dialog).getByText("0 bonne réponse sur 3")).toBeTruthy();
    expect(dialog.querySelector(".sticker.lose")).toBeTruthy();
    expect(scores().test).toMatchObject({ best: 0, total: 3 });
  });

  it("une mauvaise série ne remplace pas le meilleur score", async () => {
    recordScore("test", 3, 3);
    const dialog = await play(["X", "X", "X"]);
    await within(dialog).findByText("Plus de vies");
    expect(scores().test).toMatchObject({ best: 3, total: 3, plays: 2 });
  });

  it("la réponse s'affiche dans une bulle (juste ou fausse)", async () => {
    render(<LessonEngine questions={QUESTIONS} title="Test" accent="var(--accent-cases)" lessonId="test" onClose={() => {}} onFinish={() => {}} />);
    const dialog = await screen.findByRole("dialog", { name: "Test" }, { hidden: true });
    fireEvent.change(within(dialog).getByLabelText("Ta réponse"), { target: { value: "zzz" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Vérifier" }));
    expect(await within(dialog).findByText(/Pas tout à fait/)).toBeTruthy();
    expect(dialog.querySelector(".game-feedback.bad")).toBeTruthy();
  });

  it("sans lessonId, rien n'est enregistré (pas d'erreur)", async () => {
    render(<LessonEngine questions={QUESTIONS} title="Libre" accent="var(--accent-cases)" onClose={() => {}} onFinish={() => {}} />);
    const dialog = await screen.findByRole("dialog", { name: "Libre" }, { hidden: true });
    for (let i = 0; i < 3; i++) {
      fireEvent.change(within(dialog).getByLabelText("Ta réponse"), { target: { value: "zzz" } });
      fireEvent.click(within(dialog).getByRole("button", { name: "Vérifier" }));
      fireEvent.click(await within(dialog).findByRole("button", { name: /Continuer|Voir le résultat/ }));
    }
    await within(dialog).findByText("Plus de vies");
    expect(scores()).toEqual({});
  });
});

describe("progression visible", () => {
  it("la carte « Reprendre » montre la progression des cas (barre + libellé)", async () => {
    render(<App />);
    const bar = () => screen.getByRole("progressbar");
    expect(bar().getAttribute("aria-valuenow")).toBe("0");
    expect(screen.getByText(/0 cas maîtrisé sur 6/)).toBeTruthy();
    act(() => { recordScore("case:nom", 9, 10); recordScore("case:acc", 8, 10); });
    await waitFor(() => expect(screen.getByText("2 cas maîtrisés sur 6")).toBeTruthy());
    expect(bar().getAttribute("aria-valuenow")).toBe("33");
    expect(bar().getAttribute("aria-label")).toBe("2 cas maîtrisés sur 6");
  });

  it("les cartes des cas affichent le meilleur score, « Maîtrisé » à partir de 80 %", async () => {
    recordScore("case:nom", 9, 10);
    recordScore("case:gen", 6, 10);
    render(<App />);
    await go("#/cas");
    expect(await screen.findByText("Maîtrisé · 9/10")).toBeTruthy();
    expect(screen.getByText("6/10")).toBeTruthy();
    expect(document.querySelectorAll(".case-card .score-chip")).toHaveLength(2);
  });

  it("la leçon d'un cas rappelle le meilleur score", async () => {
    recordScore("case:acc", 7, 10);
    render(<App />);
    await go("#/cas/acc");
    expect(await screen.findByText(/Meilleur score : 7 sur 10/)).toBeTruthy();
  });

  it("le module verbes : la barre de l'accueil suit son propre score", async () => {
    localStorage.setItem("freskorusse_last_route", "#/verbes");
    recordScore("verbs", 9, 12);
    render(<App />);
    expect(screen.getByText("Meilleur score : 9 sur 12")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("75");
  });
});

describe("garde-fous CSS des nouveaux écrans", () => {
  it("bulle de réponse, autocollant, barre de progression et barre d'onglets flottante existent", async () => {
    const css = (await import("node:fs")).readFileSync("src/styles.css", "utf8");
    ["\\.game-feedback\\.ok::after", "\\.sticker\\.win", "\\.sticker\\.lose", "\\.hero-progress \\.bar", "\\.score-chip\\.ok"].forEach((re) => expect(css).toMatch(new RegExp(re)));
    expect(css).toMatch(/\.tabbar \{\s*left: 12px;/);
  });
  it("la barre de progression reste repérable : bordure de champ (3:1) autour de la piste", async () => {
    const css = (await import("node:fs")).readFileSync("src/styles.css", "utf8");
    expect(css).toMatch(/\.hero-progress \.bar \{[^}]*border: 1px solid var\(--field-border\)/);
  });
});
