import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import App from "../src/App.jsx";
import { cases } from "../src/data/cases.js";
import { extraExamples, recognitionItems, prepositionTable } from "../src/data/caseExtras.js";
import { CASE_LABELS } from "../src/lib/recognition.js";

const go = async (hash) => {
  window.location.hash = hash;
  await waitFor(() => expect(window.location.hash).toBe(hash));
};
const h1 = () => screen.getByRole("heading", { level: 1 });
const labelOf = (key) => cases.find((c) => c.key === key).label;

async function openRecognition() {
  render(<App />);
  await go("#/cas");
  await waitFor(() => expect(h1().textContent).toContain("cas russes"));
  fireEvent.click(screen.getByRole("heading", { name: /Entraînement : reconnaître le cas/ }).nextElementSibling.querySelector("button"));
  return screen.findByRole("dialog", { name: "Reconnaître le cas" }, { hidden: true });
}

// Trouve la phrase affichée dans le jeu, puis le cas attendu d'après les données.
function currentItem(dialog) {
  const sentence = dialog.querySelector(".q-ru.recognize span[lang='ru']").textContent;
  return recognitionItems.find((i) => i.before + i.word + i.after === sentence);
}

describe("exercice : reconnaître le cas", () => {
  it("affiche une vraie phrase, le mot souligné et les 6 cas dans l'ordre canonique", async () => {
    const dialog = await openRecognition();
    const item = currentItem(dialog);
    expect(item).toBeTruthy();
    expect(dialog.querySelector("u.target").textContent).toBe(item.word);
    expect(within(dialog).getByText("Dans quel cas est le mot souligné ?")).toBeTruthy();
    const options = within(dialog).getAllByRole("button").filter((b) => CASE_LABELS.includes(b.textContent));
    expect(options.map((b) => b.textContent)).toEqual(CASE_LABELS);
    expect(within(dialog).getByRole("button", { name: /Écouter la phrase/ })).toBeTruthy();
  });

  it("bonne réponse : « Correct ! » et l'indice explique pourquoi", async () => {
    const dialog = await openRecognition();
    const item = currentItem(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: labelOf(item.case) }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Vérifier" }));
    expect(await within(dialog).findByText(/Correct !/)).toBeTruthy();
    expect(within(dialog).getByText(item.hint)).toBeTruthy();
  });

  it("mauvaise réponse : la bonne est donnée, avec l'indice", async () => {
    const dialog = await openRecognition();
    const item = currentItem(dialog);
    const wrong = CASE_LABELS.find((l) => l !== labelOf(item.case));
    fireEvent.click(within(dialog).getByRole("button", { name: wrong }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Vérifier" }));
    expect(await within(dialog).findByText(/Pas tout à fait/)).toBeTruthy();
    expect(within(dialog).getByText(`Réponse attendue : ${labelOf(item.case)}`)).toBeTruthy();
    expect(within(dialog).getByText(item.hint)).toBeTruthy();
  });

  it("répondre juste à toute la série donne de l'XP (12 phrases)", async () => {
    const dialog = await openRecognition();
    for (let i = 0; i < 12; i++) {
      const item = currentItem(dialog);
      fireEvent.click(within(dialog).getByRole("button", { name: labelOf(item.case) }));
      fireEvent.click(within(dialog).getByRole("button", { name: "Vérifier" }));
      fireEvent.click(await within(dialog).findByRole("button", { name: "Continuer" }));
    }
    expect(await within(dialog).findByText("Leçon terminée !")).toBeTruthy();
    expect(within(dialog).getByText("+120 XP")).toBeTruthy();
  });
});

describe("exemples des cas : plus nombreux, avec audio", () => {
  cases.forEach((c) => {
    it(`${c.key} : exemples d'origine + ${extraExamples[c.key].length} nouveaux, chacun avec un bouton audio`, async () => {
      render(<App />);
      await go(`#/cas/${c.key}`);
      await waitFor(() => expect(h1().textContent).toBe(c.label));
      const cards = document.querySelectorAll(".example-grid .example");
      expect(cards).toHaveLength(c.examples.length + extraExamples[c.key].length);
      cards.forEach((card) => expect(card.querySelector("button.speak-btn")).toBeTruthy());
    });
  });

  it("sans synthèse vocale, le bouton l'explique au lieu de rester muet", async () => {
    render(<App />);
    await go("#/cas/acc");
    await waitFor(() => expect(h1().textContent).toBe("Accusatif"));
    fireEvent.click(document.querySelector(".example .speak-btn"));
    expect(await screen.findByText("Ton navigateur ne peut pas lire l'audio.")).toBeTruthy();
  });

  it("avec une synthèse vocale : lit la phrase en russe, et prévient s'il n'y a pas de voix russe", async () => {
    const spoken = [];
    window.speechSynthesis = {
      speak: (u) => spoken.push(u), cancel: vi.fn(), resume: vi.fn(), getVoices: () => [], speaking: false, pending: false,
    };
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    try {
      vi.resetModules();
      const { default: SpeakButton } = await import("../src/components/SpeakButton.jsx");
      render(<SpeakButton text="Я читаю кни́гу." ariaLabel="Écouter" />);
      fireEvent.click(screen.getByRole("button", { name: "Écouter" }));
      expect(spoken).toHaveLength(1);
      expect(spoken[0].text).toBe("Я читаю книгу."); // l'accent tonique est retiré avant la lecture
      expect(spoken[0].lang).toBe("ru-RU");
      expect(await screen.findByText(/Aucune voix russe/)).toBeTruthy();
    } finally {
      delete window.speechSynthesis;
      delete window.SpeechSynthesisUtterance;
    }
  });
});

describe("page Prépositions et cas", () => {
  const total = prepositionTable.flatMap((p) => p.uses).length;

  it("trois onglets, toutes les associations préposition + cas, exemples avec terminaison en évidence", async () => {
    render(<App />);
    await go("#/cas/prepositions");
    await waitFor(() => expect(h1().textContent).toBe("Prépositions et cas"));
    const tabs = screen.getByRole("navigation", { name: "Vues du module Les cas" });
    expect(within(tabs).getAllByRole("link")).toHaveLength(3);
    expect(within(tabs).getByRole("link", { name: "Prépositions" }).getAttribute("aria-current")).toBe("page");

    const table = screen.getByRole("table", { name: /Prépositions russes/ });
    expect(within(table).getAllByRole("row")).toHaveLength(total + 1);
    expect(table.querySelectorAll("b.end").length).toBeGreaterThan(10);
    expect(screen.getByText(/Mouvement ou lieu/)).toBeTruthy();
  });

  it("taper une préposition n'affiche que celle-ci (en: les deux cas), pas toutes les lignes qui contiennent la lettre", async () => {
    render(<App />);
    await go("#/cas/prepositions");
    const input = await screen.findByRole("searchbox", { name: "Filtrer les prépositions" });
    fireEvent.change(input, { target: { value: "в" } });
    const table = screen.getByRole("table", { name: /Prépositions russes/ });
    await waitFor(() => expect(within(table).getAllByRole("row")).toHaveLength(3)); // en-tête + в (acc) + в (pre)
    expect(table.textContent).toContain("в школу");
    expect(table.textContent).toContain("в школе");
  });

  it("recherche libre par cas ou par sens", async () => {
    render(<App />);
    await go("#/cas/prepositions");
    const input = await screen.findByRole("searchbox", { name: "Filtrer les prépositions" });
    fireEvent.change(input, { target: { value: "instrumental" } });
    const table = screen.getByRole("table", { name: /Prépositions russes/ });
    const ins = prepositionTable.flatMap((p) => p.uses).filter((u) => u.case === "ins").length;
    await waitFor(() => expect(within(table).getAllByRole("row")).toHaveLength(ins + 1));
    fireEvent.change(input, { target: { value: "zzzz" } });
    expect(await screen.findByText(/Aucune préposition ne correspond/)).toBeTruthy();
  });

  it("arrivée depuis la recherche globale : la préposition est déjà filtrée", async () => {
    render(<App />);
    fireEvent.keyDown(window, { key: "/" });
    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "без" } });
    await screen.findAllByRole("option");
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(window.location.hash).toContain("#/cas/prepositions?q="));
    const field = await screen.findByRole("searchbox", { name: "Filtrer les prépositions" });
    await waitFor(() => expect(field.value).toBe("без"));
    expect(screen.getByRole("table", { name: /Prépositions russes/ }).textContent).toContain("без сахара");
  });

  it("la recherche propose la page, et sur mobile la flèche revient à la liste des cas", async () => {
    render(<App />);
    fireEvent.keyDown(window, { key: "/" });
    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "quel cas" } });
    await screen.findAllByRole("option");
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(window.location.hash).toBe("#/cas/prepositions"));
    expect(await screen.findByRole("link", { name: /Retour : Les cas/ })).toBeTruthy();
  });
});
