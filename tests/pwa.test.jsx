import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import App from "../src/App.jsx";
import * as pwa from "../src/lib/pwa.js";

const go = async (hash) => {
  window.location.hash = hash;
  await waitFor(() => expect(window.location.hash).toBe(hash));
};

beforeEach(() => {
  pwa.__resetPwaForTests();
  delete globalThis.__pwaOptions;
  delete globalThis.__updateSW;
});
afterEach(() => vi.useRealTimers());

describe("mises à jour automatiques", () => {
  it("applique la nouvelle version quand aucun exercice n'est ouvert", () => {
    vi.useFakeTimers();
    pwa.initPwa({ force: true });
    globalThis.__pwaOptions.onNeedRefresh();
    expect(pwa.getPwaState().updatePending).toBe(true);
    vi.advanceTimersByTime(500);
    expect(globalThis.__updateSW).toHaveBeenCalledWith(true); // active la nouvelle version puis recharge
    expect(localStorage.getItem("freskorusse_updated")).toBe("1"); // pour l'annoncer après le rechargement
  });

  it("ne coupe JAMAIS un exercice : la mise à jour attend sa fermeture", () => {
    vi.useFakeTimers();
    pwa.initPwa({ force: true });
    pwa.setBusy(true); // un exercice s'ouvre
    globalThis.__pwaOptions.onNeedRefresh();
    vi.advanceTimersByTime(5000);
    expect(globalThis.__updateSW).not.toHaveBeenCalled();
    pwa.setBusy(false); // l'exercice se ferme
    vi.advanceTimersByTime(500);
    expect(globalThis.__updateSW).toHaveBeenCalledWith(true);
  });

  it("deux exercices imbriqués : on attend que les deux soient fermés", () => {
    vi.useFakeTimers();
    pwa.initPwa({ force: true });
    pwa.setBusy(true);
    pwa.setBusy(true);
    globalThis.__pwaOptions.onNeedRefresh();
    pwa.setBusy(false);
    vi.advanceTimersByTime(1000);
    expect(globalThis.__updateSW).not.toHaveBeenCalled();
    pwa.setBusy(false);
    vi.advanceTimersByTime(500);
    expect(globalThis.__updateSW).toHaveBeenCalled();
  });

  it("revérifie les mises à jour au retour de la connexion, sans harceler le serveur", () => {
    vi.useFakeTimers();
    pwa.initPwa({ force: true });
    const reg = { update: vi.fn(async () => {}) };
    globalThis.__pwaOptions.onRegisteredSW("sw.js", reg);
    expect(reg.update).toHaveBeenCalledTimes(1); // vérification au démarrage

    window.dispatchEvent(new Event("online"));
    expect(reg.update).toHaveBeenCalledTimes(1); // trop tôt (moins de 30 s)

    vi.advanceTimersByTime(31000);
    window.dispatchEvent(new Event("online"));
    expect(reg.update).toHaveBeenCalledTimes(2);
  });

  it("revérifie quand l'application revient au premier plan", () => {
    vi.useFakeTimers();
    pwa.initPwa({ force: true });
    const reg = { update: vi.fn(async () => {}) };
    globalThis.__pwaOptions.onRegisteredSW("sw.js", reg);
    vi.advanceTimersByTime(31000);
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(reg.update).toHaveBeenCalledTimes(2);
  });

  it("hors connexion, aucune vérification n'est tentée", () => {
    vi.useFakeTimers();
    pwa.initPwa({ force: true });
    const reg = { update: vi.fn(async () => {}) };
    globalThis.__pwaOptions.onRegisteredSW("sw.js", reg);
    vi.advanceTimersByTime(31000);
    window.dispatchEvent(new Event("offline"));
    pwa.checkForUpdate();
    expect(reg.update).toHaveBeenCalledTimes(1);
  });

  it("une vérification qui échoue ne casse rien", async () => {
    pwa.initPwa({ force: true });
    const reg = { update: vi.fn(() => Promise.reject(new Error("réseau"))) };
    expect(() => globalThis.__pwaOptions.onRegisteredSW("sw.js", reg)).not.toThrow();
  });

  it("après le rechargement, la mise à jour est annoncée une seule fois", async () => {
    localStorage.setItem("freskorusse_updated", "1");
    vi.resetModules();
    const fresh = await import("../src/lib/pwa.js");
    expect(fresh.getPwaState().notice).toMatchObject({ kind: "updated" });
    expect(localStorage.getItem("freskorusse_updated")).toBe("0");
    vi.resetModules();
    const again = await import("../src/lib/pwa.js");
    expect(again.getPwaState().notice).toBeNull();
  });
});

describe("hors-ligne : information de l'utilisateur", () => {
  it("annonce le mode hors-ligne prêt, une seule fois par appareil", () => {
    pwa.initPwa({ force: true });
    globalThis.__pwaOptions.onOfflineReady();
    expect(pwa.getPwaState()).toMatchObject({ offlineReady: true, notice: { kind: "offline" } });
    pwa.dismissNotice();
    pwa.initPwa({ force: true });
    globalThis.__pwaOptions.onOfflineReady();
    expect(pwa.getPwaState().notice).toBeNull(); // déjà annoncé
  });

  it("la notification s'affiche et se ferme", async () => {
    render(<App />);
    pwa.initPwa({ force: true });
    act(() => globalThis.__pwaOptions.onOfflineReady());
    expect(await screen.findByText(/fonctionne maintenant sans connexion/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Fermer la notification" }));
    await waitFor(() => expect(screen.queryByText(/fonctionne maintenant sans connexion/)).toBeNull());
  });

  it("la pastille « Hors-ligne » apparaît quand la connexion est perdue", async () => {
    render(<App />);
    expect(screen.queryByText("Hors-ligne")).toBeNull();
    act(() => window.dispatchEvent(new Event("offline")));
    expect((await screen.findAllByText("Hors-ligne")).length).toBeGreaterThan(0);
    act(() => window.dispatchEvent(new Event("online")));
    await waitFor(() => expect(screen.queryByText("Hors-ligne")).toBeNull());
  });

  it("la page Plus indique l'état du mode hors-ligne (préparation, puis prêt)", async () => {
    Object.defineProperty(navigator, "serviceWorker", { value: { controller: null }, configurable: true });
    try {
      render(<App />);
      await go("#/plus");
      expect((await screen.findAllByText(/Préparation du mode hors-ligne/)).length).toBeGreaterThan(0);
      pwa.initPwa({ force: true });
      act(() => globalThis.__pwaOptions.onOfflineReady());
      await waitFor(() => expect(screen.getAllByText("Fonctionne sans connexion.").length).toBeGreaterThan(0));
    } finally {
      delete navigator.serviceWorker;
    }
  });

  it("un navigateur sans service worker le dit clairement", async () => {
    render(<App />);
    await go("#/plus");
    expect((await screen.findAllByText(/pas disponible sur ce navigateur/)).length).toBeGreaterThan(0);
  });
});

describe("bouton « Télécharger l'application »", () => {
  it("est visible sur la page Plus (mobile) et dans la barre latérale (PC) à côté du thème", async () => {
    render(<App />);
    await go("#/plus");
    expect((await screen.findAllByRole("button", { name: "Télécharger l'application" })).length).toBe(2);
    const sidebarRow = document.querySelector("nav.side .settings-row");
    expect(sidebarRow.querySelector(".theme-toggle")).toBeTruthy();
    expect(document.querySelector("nav.side .install-btn")).toBeTruthy();
  });

  it("sans invite native, ouvre l'aide avec les étapes de l'appareil", async () => {
    render(<App />);
    await go("#/plus");
    fireEvent.click((await screen.findAllByRole("button", { name: "Télécharger l'application" }))[0]);
    const dialog = await screen.findByRole("dialog", {}, { hidden: true });
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(dialog.textContent).toMatch(/Installer/);
    fireEvent.click(screen.getByRole("button", { name: "J'ai compris" }));
    await waitFor(() => expect(dialog.hasAttribute("open")).toBe(false));
  });

  it("avec l'invite native du navigateur : l'installation se lance directement", async () => {
    render(<App />);
    await go("#/plus");
    const prompt = vi.fn();
    const event = new Event("beforeinstallprompt", { cancelable: true });
    event.prompt = prompt;
    event.userChoice = Promise.resolve({ outcome: "accepted" });
    act(() => window.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true); // l'infobar automatique est remplacée par notre bouton

    fireEvent.click((await screen.findAllByRole("button", { name: "Télécharger l'application" }))[0]);
    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getAllByText("Application installée").length).toBeGreaterThan(0));
    expect(screen.queryByRole("button", { name: "Télécharger l'application" })).toBeNull();
  });

  it("l'événement d'installation arrivé avant l'affichage n'est pas perdu", async () => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    event.prompt = vi.fn();
    event.userChoice = Promise.resolve({ outcome: "dismissed" });
    window.dispatchEvent(event); // avant tout rendu React
    expect(pwa.getPwaState().installPrompt).toBe(event);
  });

  it("une installation refusée laisse le bouton disponible", async () => {
    render(<App />);
    await go("#/plus");
    const event = new Event("beforeinstallprompt", { cancelable: true });
    event.prompt = vi.fn();
    event.userChoice = Promise.resolve({ outcome: "dismissed" });
    act(() => window.dispatchEvent(event));
    fireEvent.click((await screen.findAllByRole("button", { name: "Télécharger l'application" }))[0]);
    await waitFor(() => expect(event.prompt).toHaveBeenCalled());
    expect(screen.getAllByRole("button", { name: "Télécharger l'application" }).length).toBeGreaterThan(0);
  });
});

describe("détection de l'appareil pour l'aide à l'installation", () => {
  const UA = {
    iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
    ipadOs: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
    android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36",
    androidFirefox: "Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0",
    firefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    safariMac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
    chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
    edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36 Edg/120.0",
  };
  it("reconnaît les principaux navigateurs", () => {
    expect(pwa.detectPlatform(UA.iphone, 5)).toBe("ios");
    expect(pwa.detectPlatform(UA.ipadOs, 5)).toBe("ios"); // iPad qui se présente comme un Mac
    expect(pwa.detectPlatform(UA.android, 5)).toBe("android");
    expect(pwa.detectPlatform(UA.androidFirefox, 5)).toBe("android-firefox");
    expect(pwa.detectPlatform(UA.firefox, 0)).toBe("firefox-desktop");
    expect(pwa.detectPlatform(UA.safariMac, 0)).toBe("safari-mac");
    expect(pwa.detectPlatform(UA.chrome, 0)).toBe("desktop-chromium");
    expect(pwa.detectPlatform(UA.edge, 0)).toBe("desktop-chromium");
  });
});
