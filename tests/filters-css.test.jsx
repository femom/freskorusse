import React from "react";
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import App from "../src/App.jsx";
import { verbs } from "../src/data/verbs.js";

const css = fs.readFileSync("src/styles.css", "utf8");

describe("filtres", () => {
  it("verbes : champ avec icône, résultats filtrés, bouton d'effacement et Échap", async () => {
    render(<App />);
    window.location.hash = "#/verbes";
    const input = await screen.findByRole("searchbox", { name: "Filtrer les verbes" });
    expect(input.closest(".filter-field").querySelector("svg")).toBeTruthy(); // icône de recherche
    expect(screen.queryByRole("button", { name: "Effacer le filtre" })).toBeNull();

    const target = verbs[0];
    fireEvent.change(input, { target: { value: target.fr.slice(0, 3) } });
    const clear = await screen.findByRole("button", { name: "Effacer le filtre" });
    expect(document.querySelectorAll("a.verb-card").length).toBeLessThan(verbs.length);

    fireEvent.click(clear);
    await waitFor(() => expect(input.value).toBe(""));
    expect(document.querySelectorAll("a.verb-card")).toHaveLength(verbs.length);
    expect(document.activeElement).toBe(input); // le focus revient dans le champ

    fireEvent.change(input, { target: { value: "zzzz" } });
    expect(await screen.findByText(/Aucun verbe ne correspond/)).toBeTruthy();
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(input.value).toBe(""));
  });

  it("banque de mots : même composant de filtre", async () => {
    render(<App />);
    window.location.hash = "#/mots";
    const input = await screen.findByRole("searchbox", { name: "Chercher un mot" });
    expect(input.className).toContain("filter-input-el");
    fireEvent.change(input, { target: { value: "zzzz" } });
    expect(await screen.findByText(/Aucun mot ne correspond/)).toBeTruthy();
  });
});

describe("garde-fous CSS (affichage)", () => {
  it("le navigateur connaît le thème : plus de bandes blanches en thème sombre", () => {
    expect(css).toMatch(/:root\s*\{\s*color-scheme:\s*dark;/);
    expect(css).toMatch(/:root\[data-theme="light"\]\s*\{\s*color-scheme:\s*light;/);
    expect(css).toMatch(/html\s*\{\s*background:\s*var\(--bg\);/);
  });

  it("aucune barre de défilement visible (Firefox et Chrome/Safari)", () => {
    expect(css).toMatch(/scrollbar-width:\s*none/);
    expect(css).toMatch(/\*::-webkit-scrollbar\s*\{\s*display:\s*none/);
  });

  it("le thème est appliqué avant le premier affichage (pas d'éclair)", () => {
    const html = fs.readFileSync("index.html", "utf8");
    expect(html).toContain('localStorage.getItem("freskorusse_theme")');
  });

  it("aucune règle ne cible un défilement forcé visible (overflow: scroll)", () => {
    expect(css).not.toMatch(/overflow(-[xy])?:\s*scroll/);
  });
});
