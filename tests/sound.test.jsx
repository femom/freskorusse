import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../src/App.jsx";
import { play, setSoundEnabled, isSoundEnabled } from "../src/lib/sound.js";

// Faux AudioContext : compte les oscillateurs créés, donc les notes jouées.
function installFakeAudio() {
  const log = { oscillators: 0, started: 0, contexts: 0 };
  const param = () => ({ setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), value: 0 });
  class FakeAudioContext {
    constructor() { log.contexts++; this.currentTime = 0; this.state = "running"; this.destination = {}; }
    createGain() { return { gain: param(), connect: vi.fn() }; }
    createOscillator() {
      log.oscillators++;
      return { type: "", frequency: param(), connect: vi.fn(), start: () => { log.started++; }, stop: vi.fn() };
    }
    resume() { return Promise.resolve(); }
  }
  window.AudioContext = FakeAudioContext;
  return log;
}

// Le module de sons garde son AudioContext une fois créé (comme dans un vrai navigateur) :
// on installe donc UN faux contexte pour toute la suite, et on remet les compteurs à zéro avant chaque test.
const log = installFakeAudio();
beforeEach(() => {
  setSoundEnabled(true);
  log.oscillators = 0;
  log.started = 0;
});

describe("effets sonores", () => {
  it("chaque effet joue au moins une note", () => {
    ["correct", "wrong", "win", "lose", "start", "flip", "select", "tap"].forEach((name) => {
      const before = log.started;
      play(name);
      expect(log.started, name).toBeGreaterThan(before);
    });
  });

  it("une bonne réponse (2 notes) et une victoire (4 notes) sont des sons distincts", () => {
    log.started = 0; play("correct"); expect(log.started).toBe(2);
    log.started = 0; play("win"); expect(log.started).toBe(4);
  });

  it("coupés : aucun son, et le choix est mémorisé", () => {
    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
    expect(localStorage.getItem("freskorusse_sound")).toBe("0");
    log.started = 0;
    play("correct");
    expect(log.started).toBe(0);
    setSoundEnabled(true);
    expect(localStorage.getItem("freskorusse_sound")).toBe("1");
  });

  it("un son inconnu ne casse rien", () => {
    expect(() => play("inconnu")).not.toThrow();
  });

  it("un navigateur sans Web Audio ne casse rien (l'app reste muette)", async () => {
    const saved = window.AudioContext;
    delete window.AudioContext;
    delete window.webkitAudioContext;
    vi.resetModules();
    try {
      const fresh = await import("../src/lib/sound.js");
      expect(() => fresh.play("correct")).not.toThrow();
      expect(() => fresh.setSoundEnabled(true)).not.toThrow();
    } finally {
      window.AudioContext = saved;
    }
  });

  it("le choix « sons coupés » est relu au démarrage", async () => {
    localStorage.setItem("freskorusse_sound", "0");
    vi.resetModules();
    const fresh = await import("../src/lib/sound.js");
    expect(fresh.isSoundEnabled()).toBe(false);
    localStorage.removeItem("freskorusse_sound");
    vi.resetModules();
    const def = await import("../src/lib/sound.js");
    expect(def.isSoundEnabled()).toBe(true); // activés par défaut
  });
});

describe("sons : interface", () => {
  it("l'interrupteur de la page Plus active et coupe les sons", async () => {
    render(<App />);
    window.location.hash = "#/plus";
    const full = (await screen.findByText("Sons activés")).closest("button");
    expect(full.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(full);
    await waitFor(() => expect(isSoundEnabled()).toBe(false));
    expect((await screen.findByText("Sons coupés")).closest("button").getAttribute("aria-pressed")).toBe("false");
  });

  it("la barre latérale propose l'interrupteur à côté du thème", () => {
    render(<App />);
    const row = document.querySelector("nav.side .settings-row");
    expect(row.querySelector(".theme-toggle")).toBeTruthy();
    expect(row.querySelector(".icon-toggle")).toBeTruthy();
  });

  it("une série de traduction joue : départ, bonne réponse, et rien une fois coupé", async () => {
    render(<App />);
    window.location.hash = "#/traduction";
    fireEvent.click(await screen.findByRole("button", { name: /Démarrer la série/ }));
    const dialog = await screen.findByRole("dialog", { name: "Traduction" }, { hidden: true });
    expect(log.started).toBeGreaterThan(0); // son de départ
    fireEvent.click(screen.getByRole("button", { name: "Voir la traduction" }));
    log.started = 0;
    fireEvent.click(await screen.findByRole("button", { name: /J'avais juste/ }));
    expect(log.started).toBe(2); // « correct »

    setSoundEnabled(false);
    log.started = 0;
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(log.started).toBe(0);
    expect(dialog).toBeTruthy();
  });

  it("une carte retournée joue le son « flip »", async () => {
    render(<App />);
    window.location.hash = "#/mots";
    const card = (await screen.findAllByRole("button", { name: /retourner pour voir la traduction/ }))[0];
    log.started = 0;
    fireEvent.click(card);
    expect(log.started).toBe(1);
  });
});
