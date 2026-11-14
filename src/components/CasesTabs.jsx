import React from "react";
import { Link } from "../lib/router.jsx";

// Trois vues du module « Les cas » : la liste des 6 cas, l'outil qui décline un mot,
// et le tableau « quelle préposition, quel cas ? ».
export default function CasesTabs({ current }) {
  const tabs = [
    { sub: null, label: "Les 6 cas", key: "list" },
    { sub: "mot", label: "Un mot dans les 6 cas", key: "word" },
    { sub: "prepositions", label: "Prépositions", key: "prepositions" },
  ];
  return (
    <nav className="cases-tabs" aria-label="Vues du module Les cas">
      {tabs.map((t) => (
        <Link key={t.key} to="cases" sub={t.sub} className={"cases-tab" + (current === t.key ? " active" : "")} aria-current={current === t.key ? "page" : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
