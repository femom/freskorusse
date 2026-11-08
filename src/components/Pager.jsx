import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "../lib/router.jsx";

// « Précédent / Suivant » en bas d'une page de détail : on enchaîne les cas ou
// les verbes sans repasser par la liste. `items` : [{key, label}] dans l'ordre.
export default function Pager({ to, items, currentKey }) {
  const i = items.findIndex((it) => it.key === currentKey);
  if (i === -1) return null;
  const prev = items[i - 1];
  const next = items[i + 1];
  return (
    <nav className="pager" aria-label="Navigation entre éléments">
      {prev ? (
        <Link to={to} sub={prev.key} className="pager-link prev" rel="prev">
          <ChevronLeft size={18} aria-hidden="true" />
          <span><small>Précédent</small>{prev.label}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link to={to} sub={next.key} className="pager-link next" rel="next">
          <span><small>Suivant</small>{next.label}</span>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      ) : <span />}
    </nav>
  );
}
