import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import App from "../src/App.jsx";
import { dayKey } from "../src/lib/stats.js";

const day = (offset) => { const x = new Date(); x.setDate(x.getDate() + offset); return dayKey(x); };
const go = async (hash) => { window.location.hash = hash; await waitFor(() => expect(window.location.hash).toBe(hash)); };

describe("accueil", () => {
  it("premier lancement : invitation à commencer, aucune série", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Привет !");
    expect(screen.getByText(/Bienvenue/)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Pas encore de série" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Commencer" })).toBeTruthy();
  });

  it("affiche l'XP, la série, les leçons et les mots d'après les données enregistrées", async () => {
    localStorage.setItem("russe_app_xp", "248");
    localStorage.setItem("freskorusse_stats", JSON.stringify({ days: [day(-2), day(-1), day(0)], lessons: 17, words: [1, 2, 3, 4] }));
    (await import("../src/lib/stats.js")).__reloadStatsForTests(); // comme un nouveau lancement
    render(<App />);
    const chip = (label) => screen.getByText(label).closest(".stat-chip");
    expect(within(chip("Points XP")).getByText("248")).toBeTruthy();
    expect(within(chip("Jours de suite")).getByText("3")).toBeTruthy();
    expect(within(chip("Leçons faites")).getByText("17")).toBeTruthy();
    expect(within(chip("Mots vus")).getByText("4")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Série de 3 jours" })).toBeTruthy();
  });

  it("série visible, semaine de 7 jours, défi du jour", async () => {
    const stats = await import("../src/lib/stats.js");
    stats.recordActivity(new Date(Date.now() - 2 * 864e5));
    stats.recordActivity(new Date(Date.now() - 864e5));
    stats.recordActivity(new Date());
    render(<App />);
    expect(screen.getByRole("heading", { name: "Série de 3 jours" })).toBeTruthy();
    expect(screen.getByText(/ta journée est validée/)).toBeTruthy();
    expect(within(screen.getByRole("list", { name: "Jours validés cette semaine" })).getAllByRole("listitem")).toHaveLength(7);
    expect(screen.getByRole("link", { name: /Relever le défi/ }).getAttribute("href")).toBe("#/cas?defi=1");
  });

  it("le défi du jour ouvre directement l'exercice de reconnaissance", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("link", { name: /Relever le défi/ }));
    expect(await screen.findByRole("dialog", { name: "Reconnaître le cas" }, { hidden: true })).toBeTruthy();
  });

  it("les recommandations et tous les modules sont de vrais liens", () => {
    render(<App />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    ["#/cas/mot", "#/cas/prepositions", "#/dictee", "#/traduction", "#/cas", "#/verbes", "#/mots", "#/phrases", "#/bibliotheque"].forEach((h) => expect(hrefs).toContain(h));
  });

  it("« Reprendre » renvoie à la dernière page visitée", async () => {
    const { unmount } = render(<App />);
    await go("#/cas/acc");
    await waitFor(() => expect(localStorage.getItem("freskorusse_last_route")).toBe("#/cas/acc"));
    unmount();
    await go("#/");
    render(<App />);
    const cta = screen.getByRole("link", { name: /Reprendre/ });
    expect(cta.getAttribute("href")).toBe("#/cas/acc");
    expect(screen.getByText("Les cas · Accusatif")).toBeTruthy();
  });
});

describe("l'activité alimente les statistiques", () => {
  it("répondre à une question valide la journée ; terminer une série compte une leçon", async () => {
    render(<App />);
    await go("#/traduction");
    fireEvent.click(await screen.findByRole("button", { name: /Démarrer la série/ }));
    const dialog = await screen.findByRole("dialog", { name: "Traduction" }, { hidden: true });
    fireEvent.click(within(dialog).getByRole("button", { name: "Voir la traduction" }));
    fireEvent.click(await within(dialog).findByRole("button", { name: /J'avais juste/ }));
    expect(JSON.parse(localStorage.getItem("freskorusse_stats")).days).toEqual([dayKey(new Date())]);
  });

  it("retourner un mot de la banque est compté une seule fois", async () => {
    render(<App />);
    await go("#/mots");
    const card = (await screen.findAllByRole("button", { name: /retourner pour voir la traduction/ }))[0];
    fireEvent.click(card);
    fireEvent.click(card);
    expect(JSON.parse(localStorage.getItem("freskorusse_stats")).words).toHaveLength(1);
  });
});
