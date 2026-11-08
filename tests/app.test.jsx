import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import App from "../src/App.jsx";
import { cases } from "../src/data/cases.js";
import { verbs } from "../src/data/verbs.js";
import { libraryTexts } from "../src/data/library.js";

const go = async (hash) => {
  window.location.hash = hash;
  await waitFor(() => expect(window.location.hash).toBe(hash));
};
const h1 = () => screen.getByRole("heading", { level: 1 });

describe("navigation : de l'accueil aux détails", () => {
  it("l'accueil affiche des cartes qui sont de vrais liens", () => {
    render(<App />);
    expect(h1().textContent).toBe("FreskoRusse");
    const link = screen.getAllByRole("link").find((a) => a.getAttribute("href") === "#/cas" && a.className.includes("module-card"));
    expect(link).toBeTruthy();
  });

  it("liste des cas -> détail -> retour à la liste (bouton retour du navigateur ET lien)", async () => {
    render(<App />);
    await go("#/cas");
    await waitFor(() => expect(h1().textContent).toContain(String(cases.length)));

    const acc = cases.find((c) => c.key === "acc");
    const card = screen.getAllByRole("link").find((a) => a.getAttribute("href") === "#/cas/acc" && a.className.includes("case-card"));
    fireEvent.click(card);
    await waitFor(() => expect(h1().textContent).toBe(acc.label));

    // Fil d'Ariane (desktop) : vers la liste, ce qui n'existait pas avant.
    const crumb = within(screen.getByRole("navigation", { name: "Fil d'Ariane" })).getByRole("link");
    expect(crumb.getAttribute("href")).toBe("#/cas");
    // Flèche de la barre du haut (mobile) : toujours vers la liste du module.
    expect(screen.getByRole("link", { name: /Retour : Les cas/ }).getAttribute("href")).toBe("#/cas");

    // Bouton Retour natif : on remonte l'historique, on ne quitte pas l'app.
    window.history.back();
    await waitFor(() => expect(window.location.hash).toBe("#/cas"));
    await waitFor(() => expect(h1().textContent).toContain(String(cases.length)));
  });

  it("précédent / suivant entre les cas", async () => {
    render(<App />);
    await go("#/cas/acc");
    const pager = screen.getByRole("navigation", { name: "Navigation entre éléments" });
    const links = within(pager).getAllByRole("link");
    const i = cases.findIndex((c) => c.key === "acc");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([`#/cas/${cases[i - 1].key}`, `#/cas/${cases[i + 1].key}`]);
  });

  it("un identifiant de verbe inconnu retombe sur la liste, sans bouton retour fantôme", async () => {
    render(<App />);
    await go("#/verbes/zzz");
    expect(screen.queryByRole("link", { name: /Retour :/ })).toBeNull();
    expect(h1().textContent.toLowerCase()).toContain("verbes");
  });

  it("la dernière page visitée alimente « Reprendre » sur l'accueil", async () => {
    const { unmount } = render(<App />);
    await go("#/cas/acc");
    await waitFor(() => expect(localStorage.getItem("freskorusse_last_route")).toBe("#/cas/acc"));
    unmount();
    await go("#/");
    render(<App />);
    expect(screen.getByText("Reprendre")).toBeTruthy();
  });
});

describe("barre d'onglets (mobile)", () => {
  it("5 onglets, l'onglet courant est signalé", async () => {
    render(<App />);
    await go("#/verbes");
    const bar = screen.getAllByRole("navigation", { name: "Navigation principale" }).find((n) => n.className === "tabbar");
    const tabs = within(bar).getAllByRole("link");
    expect(tabs).toHaveLength(5);
    expect(tabs.filter((t) => t.getAttribute("aria-current") === "page").map((t) => t.getAttribute("href"))).toEqual(["#/verbes"]);
  });

  it("« Plus » est actif pour les modules sans onglet (dictée, phrases...)", async () => {
    render(<App />);
    await go("#/dictee");
    const bar = screen.getAllByRole("navigation", { name: "Navigation principale" }).find((n) => n.className === "tabbar");
    const current = within(bar).getAllByRole("link").find((t) => t.getAttribute("aria-current") === "page");
    expect(current.getAttribute("href")).toBe("#/plus");
  });

  it("la page Plus mène à tous les modules restants", async () => {
    render(<App />);
    await go("#/plus");
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    ["#/dictee", "#/traduction", "#/phrases", "#/bibliotheque"].forEach((h) => expect(hrefs).toContain(h));
  });
});

describe("recherche globale", () => {
  const openSearch = () => fireEvent.keyDown(window, { key: "/" });

  it("« / » ouvre la palette ; un verbe trouvé ouvre SON écran", async () => {
    render(<App />);
    openSearch();
    const input = await screen.findByRole("combobox");
    expect(input.closest("dialog").hasAttribute("open")).toBe(true);
    const aller = verbs.find((v) => v.fr.toLowerCase() === "aller") || verbs[0];
    fireEvent.change(input, { target: { value: aller.fr } });
    const option = await screen.findAllByRole("option");
    expect(option.length).toBeGreaterThan(0);
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(window.location.hash).toMatch(/^#\/(verbes|cas|mots|phrases|bibliotheque|dictee|traduction)/));
  });

  it("recherche insensible aux accents : « dictee » trouve la Dictée", async () => {
    render(<App />);
    openSearch();
    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "dictee" } });
    await screen.findAllByRole("option");
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(window.location.hash).toBe("#/dictee"));
  });

  it("les flèches déplacent la sélection (aria-activedescendant)", async () => {
    render(<App />);
    openSearch();
    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "a" } });
    await screen.findAllByRole("option");
    const first = input.getAttribute("aria-activedescendant");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).not.toBe(first);
  });

  it("aucun résultat : message clair", async () => {
    render(<App />);
    openSearch();
    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "zzzzqqq" } });
    expect(await screen.findByText(/Aucun résultat/)).toBeTruthy();
  });

  it("« / » dans un champ de saisie ne détourne pas la frappe", () => {
    render(<App />);
    const field = document.createElement("input");
    document.body.appendChild(field);
    fireEvent.keyDown(field, { key: "/" });
    expect(document.querySelector("dialog.search-dialog").hasAttribute("open")).toBe(false);
    field.remove();
  });
});

describe("pages pilotées par l'URL", () => {
  it("bibliothèque : l'id 0 (premier texte) s'affiche", async () => {
    render(<App />);
    await go("#/bibliotheque/0");
    const t = libraryTexts.find((x) => x.id === 0);
    await waitFor(() => expect(screen.getByRole("heading", { level: 2, name: t.title })).toBeTruthy());
  });

  it("phrases : la catégorie vient de l'URL et un changement d'onglet remplace l'historique", async () => {
    render(<App />);
    await go("#/phrases/logement");
    const tab = screen.getByRole("button", { name: /Logement/ });
    expect(tab.getAttribute("aria-pressed")).toBe("true");
    const before = window.history.length;
    fireEvent.click(screen.getByRole("button", { name: /Université/ }));
    await waitFor(() => expect(window.location.hash).toBe("#/phrases/univ"));
    expect(window.history.length).toBe(before); // replace, pas push
    expect(screen.getByRole("button", { name: /Université/ }).getAttribute("aria-pressed")).toBe("true");
  });

  it("mots : ?q= pré-remplit le filtre (arrivée depuis la recherche)", async () => {
    render(<App />);
    await go("#/mots?q=zzz");
    const field = await screen.findByRole("searchbox", { name: "Chercher un mot" });
    await waitFor(() => expect(field.value).toBe("zzz"));
  });
});

describe("jeux : sortie confirmée", () => {
  it("quitter en cours de série demande confirmation ; Continuer reprend", async () => {
    render(<App />);
    await go("#/dictee");
    fireEvent.click(screen.getByRole("button", { name: /Démarrer la dictée/ }));
    const dialog = await screen.findByRole("dialog", { name: "Dictée" }, { hidden: true });

    // Rien à perdre au départ : « Vérifier » est désactivé tant que le champ est vide.
    const verify = within(dialog).getByRole("button", { name: "Vérifier" });
    expect(verify.disabled).toBe(true);

    fireEvent.change(within(dialog).getByLabelText("Ta réponse en russe"), { target: { value: "привет" } });
    expect(within(dialog).getByRole("button", { name: "Vérifier" }).disabled).toBe(false);

    fireEvent.click(within(dialog).getByRole("button", { name: "Quitter l'exercice" }));
    const confirm = await screen.findByRole("alertdialog", {}, { hidden: true });
    expect(confirm.textContent).toContain("Quitter la série ?");

    fireEvent.click(within(confirm).getByRole("button", { name: "Continuer" }));
    expect(screen.queryByRole("alertdialog", {}, { hidden: true })).toBeNull();

    fireEvent.click(within(dialog).getByRole("button", { name: "Quitter l'exercice" }));
    fireEvent.click(within(await screen.findByRole("alertdialog", {}, { hidden: true })).getByRole("button", { name: "Quitter" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Dictée" }, { hidden: true })).toBeNull());
  });

  it("sans progression, la croix quitte directement", async () => {
    render(<App />);
    await go("#/traduction");
    fireEvent.click(screen.getByRole("button", { name: /Démarrer la série/ }));
    const dialog = await screen.findByRole("dialog", { name: "Traduction" }, { hidden: true });
    fireEvent.click(within(dialog).getByRole("button", { name: "Quitter l'exercice" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Traduction" }, { hidden: true })).toBeNull());
  });
});
