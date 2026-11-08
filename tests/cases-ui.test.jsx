import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import App from "../src/App.jsx";
import { cases } from "../src/data/cases.js";

const go = async (hash) => {
  window.location.hash = hash;
  await waitFor(() => expect(window.location.hash).toBe(hash));
};
const h1 = () => screen.getByRole("heading", { level: 1 });

describe("module Les cas : vue d'ensemble", () => {
  it("6 cartes colorées, onglets, récapitulatif et « À retenir »", async () => {
    render(<App />);
    await go("#/cas");
    await waitFor(() => expect(document.querySelectorAll("a.case-card")).toHaveLength(cases.length));

    const tabs = screen.getByRole("navigation", { name: "Vues du module Les cas" });
    expect(within(tabs).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(["#/cas", "#/cas/mot"]);

    const recap = screen.getByRole("table", { name: /Récapitulatif/ });
    expect(within(recap).getAllByRole("row")).toHaveLength(cases.length + 1); // + en-tête
    expect(screen.getByRole("heading", { name: "À retenir" })).toBeTruthy();
  });
});

describe("module Les cas : détail d'un cas", () => {
  it("accusatif : tableaux accessibles, terminaisons et cas particuliers", async () => {
    render(<App />);
    await go("#/cas/acc");
    await waitFor(() => expect(h1().textContent).toBe("Accusatif"));

    const main = screen.getByRole("table", { name: /Terminaisons du Accusatif/ });
    const rows = within(main).getAllByRole("row");
    expect(rows.length).toBe(1 + 6); // en-tête + masc. inanimé/animé, fém., neutre, plur. inanimé/animé
    // La forme animée copie bien le génitif : студента, et la terminaison est mise en évidence.
    expect(within(main).getByText("а", { selector: "b.end" })).toBeTruthy();

    expect(screen.getByRole("table", { name: /Cas particuliers/ })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Souvent utilisé avec" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Essaie avec ton propre mot/ }).getAttribute("href")).toBe("#/cas/mot");
  });

  it("le prépositionnel affiche le locatif en -у (лесу)", async () => {
    render(<App />);
    await go("#/cas/pre");
    await waitFor(() => expect(h1().textContent).toBe("Prépositionnel"));
    const special = screen.getByRole("table", { name: /Cas particuliers/ });
    expect(special.textContent).toContain("в лесу");
    expect(special.textContent).toContain("в санатории");
  });
});

describe("outil « Un mot dans les 6 cas »", () => {
  it("affiche les 6 cas pour le mot par défaut", async () => {
    render(<App />);
    await go("#/cas/mot");
    await waitFor(() => expect(h1().textContent).toBe("Un mot dans les 6 cas"));
    const table = screen.getByRole("table", { name: /Déclinaison de книга/ });
    expect(within(table).getAllByRole("row")).toHaveLength(7);
    expect(table.textContent).toContain("книги");
    expect(table.textContent).toContain("книгу");
    expect(table.textContent).toContain("книг");
  });

  it("saisie libre, validation et lien partageable", async () => {
    render(<App />);
    await go("#/cas/mot");
    const input = await screen.findByLabelText(/Nom russe/);
    fireEvent.change(input, { target: { value: "неделя" } });
    // Résultat en direct, sans attendre la validation.
    await waitFor(() => expect(screen.getByRole("table", { name: /Déclinaison de неделя/ }).textContent).toContain("неделю"));
    fireEvent.submit(input.closest("form"));
    await waitFor(() => expect(window.location.hash).toContain("m=%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F"));
  });

  it("un mot arrivé par l'adresse est déjà décliné (lien partagé)", async () => {
    render(<App />);
    await go("#/cas/mot?m=" + encodeURIComponent("город"));
    const table = await screen.findByRole("table", { name: /Déclinaison de город/ });
    expect(table.textContent).toContain("городе");
    expect(table.textContent).toContain("города");
  });

  it("le réglage « animé » change l'accusatif", async () => {
    render(<App />);
    await go("#/cas/mot?m=" + encodeURIComponent("брат"));
    const table = await screen.findByRole("table", { name: /Déclinaison de брат/ });
    const accRow = () => within(table).getAllByRole("row").find((r) => within(r).queryByText(/Accusatif/));
    await waitFor(() => expect(accRow().textContent).toContain("= génitif")); // брат est animé par défaut
    fireEvent.click(screen.getByLabelText(/inanimé/));
    await waitFor(() => expect(accRow().textContent).toContain("= nominatif"));
  });

  it("les réglages inutiles sont masqués, les utiles apparaissent", async () => {
    render(<App />);
    await go("#/cas/mot?m=" + encodeURIComponent("книга"));
    await screen.findByRole("table", { name: /Déclinaison de книга/ });
    expect(screen.queryByLabelText(/Genre du mot en -ь/)).toBeNull();
    expect(screen.queryByText(/La terminaison porte l'accent/)).toBeNull();

    const input = screen.getByLabelText(/Nom russe/);
    fireEvent.change(input, { target: { value: "словарь" } });
    await screen.findByText(/Genre du mot en -ь/);
    expect(screen.getByText(/La terminaison porte l'accent/)).toBeTruthy();
  });

  it("mots non pris en charge : message clair, pas de tableau", async () => {
    render(<App />);
    await go("#/cas/mot");
    const input = await screen.findByLabelText(/Nom russe/);
    fireEvent.change(input, { target: { value: "красный" } });
    expect(await screen.findByText(/ressemble à un adjectif/)).toBeTruthy();
    expect(screen.queryByRole("table", { name: /Déclinaison de/ })).toBeNull();

    fireEvent.change(input, { target: { value: "друзья" } });
    expect(await screen.findByText(/est un pluriel/)).toBeTruthy();
  });

  it("un mot à voyelle mobile incertaine affiche un avertissement", async () => {
    render(<App />);
    await go("#/cas/mot?m=" + encodeURIComponent("лампа"));
    await screen.findByRole("table", { name: /Déclinaison de лампа/ });
    expect(screen.getAllByRole("note").some((n) => /voyelle mobile/.test(n.textContent))).toBe(true);
  });

  it("la recherche globale propose l'outil", async () => {
    render(<App />);
    fireEvent.keyDown(window, { key: "/" });
    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "decliner" } });
    await screen.findAllByRole("option");
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(window.location.hash).toBe("#/cas/mot"));
  });

  it("sur mobile, la flèche de retour ramène à la liste des cas", async () => {
    render(<App />);
    await go("#/cas/mot");
    await screen.findByRole("heading", { level: 1, name: "Un mot dans les 6 cas" });
    expect(screen.getByRole("link", { name: /Retour : Les cas/ }).getAttribute("href")).toBe("#/cas");
  });
});
