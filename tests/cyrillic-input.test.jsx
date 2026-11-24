import React, { useState } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CyrillicInput from "../src/components/CyrillicInput.jsx";

function ControlledInput({ initialValue = "", showCyrillicKeyboard = true, disabled = false }) {
  const [value, setValue] = useState(initialValue);
  return (
    <CyrillicInput
      aria-label="Réponse"
      value={value}
      onValueChange={setValue}
      showCyrillicKeyboard={showCyrillicKeyboard}
      disabled={disabled}
    />
  );
}

function openKeyboard(input) {
  input.focus();
  fireEvent.click(screen.getByRole("button", { name: "Clavier russe" }));
}

describe("clavier cyrillique intégré", () => {
  it("insère une lettre à la place du texte sélectionné", () => {
    render(<ControlledInput initialValue="книга" />);
    const input = screen.getByRole("textbox", { name: "Réponse" });
    input.setSelectionRange(1, 4);
    fireEvent.select(input);
    openKeyboard(input);

    fireEvent.click(screen.getByRole("button", { name: "я", exact: true }));

    expect(input.value).toBe("кяа");
  });

  it("gère retour arrière, espace et effacement complet", () => {
    render(<ControlledInput initialValue="приве" />);
    const input = screen.getByRole("textbox", { name: "Réponse" });
    input.setSelectionRange(5, 5);
    fireEvent.select(input);
    openKeyboard(input);

    fireEvent.click(screen.getByRole("button", { name: "Retour arrière" }));
    expect(input.value).toBe("прив");

    fireEvent.click(screen.getByRole("button", { name: "Espace" }));
    expect(input.value).toBe("прив ");

    fireEvent.click(screen.getByRole("button", { name: "Tout effacer" }));
    expect(input.value).toBe("");
  });

  it("affiche les lettres sur trois rangées suivant le clavier russe ЙЦУКЕН", () => {
    render(<ControlledInput />);
    const input = screen.getByRole("textbox", { name: "Réponse" });
    openKeyboard(input);

    const rows = screen.getByRole("group", { name: "Clavier russe" }).querySelectorAll(".cyrillic-key-row");
    expect(rows).toHaveLength(3);
    expect([...rows[0].querySelectorAll(".cyrillic-key")].map((key) => key.textContent).join("")).toBe("ёйцукенгшщзхъ");
    expect([...rows[1].querySelectorAll(".cyrillic-key")].map((key) => key.textContent).join("")).toBe("фывапролджэ");
    expect([...rows[2].querySelectorAll(".cyrillic-key")].map((key) => key.textContent).join("")).toBe("ячсмитьбю");
  });

  it("retourne au champ et au clavier du téléphone", () => {
    render(<ControlledInput />);
    const input = screen.getByRole("textbox", { name: "Réponse" });
    openKeyboard(input);

    const switchButton = screen.getByRole("button", { name: "Clavier du téléphone" });
    expect(switchButton.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(switchButton);

    expect(document.activeElement).toBe(input);
    expect(screen.queryByRole("group", { name: "Clavier russe" })).toBeNull();
  });

  it("n'affiche pas le clavier intégré quand il n'est pas pertinent ou que la réponse est verrouillée", () => {
    const { rerender } = render(<ControlledInput showCyrillicKeyboard={false} />);
    expect(screen.queryByRole("button", { name: "Clavier russe" })).toBeNull();

    rerender(<ControlledInput />);
    const input = screen.getByRole("textbox", { name: "Réponse" });
    openKeyboard(input);
    expect(screen.getByRole("group", { name: "Clavier russe" })).toBeTruthy();

    rerender(<ControlledInput disabled />);
    expect(screen.queryByRole("group", { name: "Clavier russe" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Clavier du téléphone" })).toBeNull();
  });
});
