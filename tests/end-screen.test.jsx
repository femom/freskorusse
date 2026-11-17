import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Trophy } from "lucide-react";
import { EndScreen } from "../src/components/GameShell.jsx";

// Écran de fin : la mascotte Fresko réagit au résultat, avec un repli sur l'icône.
describe("EndScreen : mascotte Fresko", () => {
  const base = { icon: Trophy, title: "Titre", message: "Message", actions: [] };

  it("victoire : Fresko content", () => {
    render(<EndScreen {...base} tone="win" />);
    expect(screen.getByAltText("Fresko, content")).toBeTruthy();
  });

  it("défaite : Fresko triste", () => {
    render(<EndScreen {...base} tone="lose" />);
    expect(screen.getByAltText("Fresko, triste")).toBeTruthy();
  });

  it("mascot={false} : retombe sur l'autocollant avec icône", () => {
    const { container } = render(<EndScreen {...base} tone="win" mascot={false} />);
    expect(screen.queryByAltText("Fresko, content")).toBeNull();
    expect(container.querySelector(".sticker.win")).toBeTruthy();
  });
});
