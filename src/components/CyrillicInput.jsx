import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";

const CYRILLIC_ROWS = ["ёйцукенгшщзхъ", "фывапролджэ", "ячсмитьбю"].map((row) => row.split(""));

const CyrillicInput = forwardRef(function CyrillicInput({
  value,
  onValueChange,
  showCyrillicKeyboard = false,
  onKeyDown,
  disabled = false,
  ...inputProps
}, forwardedRef) {
  const inputRef = useRef(null);
  const selectionRef = useRef({ start: value.length, end: value.length });
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useImperativeHandle(forwardedRef, () => inputRef.current);

  function rememberSelection(input = inputRef.current) {
    if (!input) return;
    selectionRef.current = {
      start: input.selectionStart ?? input.value.length,
      end: input.selectionEnd ?? input.value.length,
    };
  }

  function handleChange(event) {
    rememberSelection(event.currentTarget);
    onValueChange(event.currentTarget.value);
  }

  function insert(text) {
    const start = Math.min(selectionRef.current.start, value.length);
    const end = Math.min(selectionRef.current.end, value.length);
    const next = value.slice(0, start) + text + value.slice(end);
    const cursor = start + text.length;
    selectionRef.current = { start: cursor, end: cursor };
    onValueChange(next);
  }

  function erase() {
    const start = Math.min(selectionRef.current.start, value.length);
    const end = Math.min(selectionRef.current.end, value.length);
    const from = start === end ? Math.max(0, start - 1) : start;
    const next = value.slice(0, from) + value.slice(end);
    selectionRef.current = { start: from, end: from };
    onValueChange(next);
  }

  function clear() {
    selectionRef.current = { start: 0, end: 0 };
    onValueChange("");
  }

  function toggleKeyboard() {
    if (keyboardOpen) {
      setKeyboardOpen(false);
      inputRef.current?.focus();
      return;
    }

    rememberSelection();
    inputRef.current?.blur();
    setKeyboardOpen(true);
  }

  return (
    <div className="cyrillic-input">
      <input
        {...inputProps}
        ref={inputRef}
        type="text"
        className={`answer-input${inputProps.className ? ` ${inputProps.className}` : ""}`}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        onSelect={(event) => rememberSelection(event.currentTarget)}
        onKeyUp={(event) => rememberSelection(event.currentTarget)}
        onBlur={(event) => rememberSelection(event.currentTarget)}
        onKeyDown={onKeyDown}
      />

      {showCyrillicKeyboard && !disabled && (
        <button
          type="button"
          className="cyrillic-toggle"
          aria-expanded={keyboardOpen}
          onClick={toggleKeyboard}
        >
          <span className="cyrillic-toggle-mark" lang="ru" aria-hidden="true">Я</span>
          {keyboardOpen ? "Clavier du téléphone" : "Clavier russe"}
        </button>
      )}

      {keyboardOpen && !disabled && (
        <div className="cyrillic-keyboard" role="group" aria-label="Clavier russe">
          <div className="cyrillic-keyboard-rows">
            {CYRILLIC_ROWS.map((row, index) => (
              <div className={`cyrillic-key-row row-${index + 1}`} key={index}>
                {row.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    className="cyrillic-key"
                    lang="ru"
                    onClick={() => insert(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="cyrillic-key-actions">
            <button type="button" className="cyrillic-key action" onClick={erase} aria-label="Retour arrière">⌫</button>
            <button type="button" className="cyrillic-key space" onClick={() => insert(" ")}>Espace</button>
            <button type="button" className="cyrillic-key action" onClick={clear} disabled={!value} aria-label="Tout effacer">Effacer</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default CyrillicInput;
