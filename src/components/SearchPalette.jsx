import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cases } from "../data/cases.js";
import { verbs } from "../data/verbs.js";
import { wordBank } from "../data/wordbank.js";
import { phrases } from "../data/phrases.js";
import { libraryTexts } from "../data/library.js";
import { foldForSearch } from "../lib/text.js";
import { navigate } from "../lib/router.jsx";
import { MODULES } from "../navigation.js";

const PER_GROUP = 6;

// Index de recherche construit UNE fois (les données sont statiques). Chaque
// entrée sait où elle mène : un résultat ouvre l'élément trouvé, pas juste le module.
const INDEX = [
  ...cases.map((c) => ({
    group: "Cas", label: c.label, hint: c.ru,
    haystack: foldForSearch(`${c.label} ${c.ru}`),
    go: () => navigate("cases", c.key),
  })),
  ...verbs.map((v) => ({
    group: "Verbes", label: v.fr, hint: v.imp.ru + (v.perf ? ` / ${v.perf.ru}` : ""),
    haystack: foldForSearch(`${v.fr} ${v.imp.ru} ${v.perf ? v.perf.ru : ""}`),
    go: () => navigate("verbs", v.id),
  })),
  ...wordBank.map((w) => ({
    group: "Mots", label: w.ru, hint: w.fr,
    haystack: foldForSearch(`${w.ru} ${w.fr}`),
    go: () => navigate("bank", null, { query: { q: w.ru } }),
  })),
  ...phrases.map((p) => ({
    group: "Phrases", label: p.fr, hint: p.ru,
    haystack: foldForSearch(`${p.fr} ${p.ru}`),
    go: () => navigate("phrases", p.category, { query: { id: p.id } }),
  })),
  ...libraryTexts.map((t) => ({
    group: "Textes", label: t.titleFr, hint: t.title,
    haystack: foldForSearch(`${t.titleFr} ${t.title}`),
    go: () => navigate("library", t.id),
  })),
  {
    group: "Modules", label: "Décliner un mot", hint: "Un mot dans les 6 cas",
    haystack: foldForSearch("Décliner un mot declinaison un mot dans les 6 cas"),
    go: () => navigate("cases", "mot"),
  },
  ...MODULES.filter((m) => m.key !== "home").map((m) => ({
    group: "Modules", label: m.label, hint: "",
    haystack: foldForSearch(m.label),
    go: () => navigate(m.key),
  })),
];
const GROUP_ORDER = ["Modules", "Cas", "Verbes", "Mots", "Phrases", "Textes"];

// Palette de recherche globale (modale). Notion : pattern « combobox + listbox »
// ARIA — le focus reste dans le champ, les flèches déplacent la sélection
// (aria-activedescendant), Entrée ouvre, Échap ferme. <dialog> natif : piège de
// focus et Échap fournis par le navigateur.
export default function SearchPalette({ open, onClose }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      try { dialog.showModal(); } catch (e) { dialog.setAttribute("open", ""); }
      setQuery(""); setActive(0);
      requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Résultats aplatis dans l'ordre d'affichage (pour la navigation au clavier),
  // avec les groupes pour l'affichage.
  const { flat, groups } = useMemo(() => {
    const q = foldForSearch(query);
    if (!q) return { flat: [], groups: [] };
    const byGroup = {};
    INDEX.forEach((entry) => {
      if (entry.haystack.includes(q)) (byGroup[entry.group] = byGroup[entry.group] || []).push(entry);
    });
    const groupsOut = GROUP_ORDER.filter((g) => byGroup[g]).map((g) => ({
      name: g, total: byGroup[g].length, items: byGroup[g].slice(0, PER_GROUP),
    }));
    const flatOut = [];
    groupsOut.forEach((g) => g.items.forEach((it) => flatOut.push({ ...it, id: `sr-${flatOut.length}` })));
    // Rattache les ids aux items affichés.
    let n = 0;
    groupsOut.forEach((g) => { g.items = g.items.map((it) => flatOut[n++]); });
    return { flat: flatOut, groups: groupsOut };
  }, [query]);

  useEffect(() => { setActive(0); }, [query]);

  // Garde l'élément actif visible quand on parcourt la liste au clavier.
  useEffect(() => {
    const el = listRef.current && listRef.current.querySelector('[aria-selected="true"]');
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [active, flat]);

  function choose(entry) {
    onClose();
    entry.go();
  }

  function handleKeyDown(e) {
    if (!flat.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => (i + 1) % flat.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i - 1 + flat.length) % flat.length); }
    else if (e.key === "Enter") { e.preventDefault(); choose(flat[active]); }
  }

  const hasQuery = foldForSearch(query).length > 0;

  return (
    <dialog
      ref={dialogRef}
      className="search-dialog"
      aria-label="Recherche"
      onClose={onClose}
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
    >
      <div className="search-field">
        <Search size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={flat.length > 0}
          aria-controls="search-listbox"
          aria-activedescendant={flat[active] ? flat[active].id : undefined}
          aria-label="Rechercher un cas, un verbe, un mot, une phrase"
          placeholder="Un cas, un verbe, un mot…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" className="search-close" onClick={onClose} aria-label="Fermer la recherche">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="search-body" ref={listRef}>
        {!hasQuery && (
          <p className="search-empty">Tape un cas (« accusatif »), un verbe (« aller »), un mot russe ou français.</p>
        )}
        {hasQuery && flat.length === 0 && (
          <p className="search-empty" role="status">Aucun résultat pour « {query.trim()} ».</p>
        )}
        {flat.length > 0 && (
          <ul id="search-listbox" role="listbox" aria-label="Résultats" className="search-list">
            {groups.map((g) => (
              <li key={g.name} role="presentation">
                <div className="search-group-label" role="presentation">
                  {g.name}{g.total > g.items.length ? ` · ${g.total}` : ""}
                </div>
                <ul role="presentation" className="search-group">
                  {g.items.map((it) => (
                    <li
                      key={it.id}
                      id={it.id}
                      role="option"
                      aria-selected={flat[active] && flat[active].id === it.id}
                      className="search-option"
                      onMouseMove={() => setActive(flat.findIndex((f) => f.id === it.id))}
                      onClick={() => choose(it)}
                    >
                      <span className="search-option-label">{it.label}</span>
                      {it.hint && <span className="search-option-hint">{it.hint}</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
