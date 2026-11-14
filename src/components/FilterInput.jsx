import React, { useRef } from "react";
import { Search, X } from "lucide-react";

// Champ de filtre commun (verbes, banque de mots) : icône de recherche, bouton
// d'effacement, focus bien visible, Échap pour vider. Police de 16 px minimum :
// en dessous, iOS zoome sur la page au moment de taper.
// `label` sert de nom accessible (le placeholder seul n'en est pas un).
export default function FilterInput({ label, placeholder, value, onChange, summary }) {
  const inputRef = useRef(null);

  function clear() {
    onChange("");
    if (inputRef.current) inputRef.current.focus();
  }

  return (
    <div className="filter">
      <div className="filter-field">
        <Search size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          className="filter-input-el"
          aria-label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && value) {
              e.preventDefault();
              onChange("");
            }
          }}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {value && (
          <button type="button" className="filter-clear" onClick={clear} aria-label="Effacer le filtre">
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      {summary && <p className="filter-summary" role="status" aria-live="polite">{summary}</p>}
    </div>
  );
}
