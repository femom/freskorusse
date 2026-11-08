import React from "react";
import { Link } from "../lib/router.jsx";
import { MODULE_BY_KEY, MORE_META, TAB_KEYS } from "../navigation.js";

// Barre d'onglets du bas (mobile). Notion : loi de Fitts + « zone du pouce » —
// les destinations principales sont à portée du pouce, en un seul tap, au lieu
// d'être cachées derrière un menu hamburger. 5 onglets maximum.
// « Plus » est active pour tous les modules qui n'ont pas leur propre onglet.
// Libellés courts : 5 onglets doivent tenir sur un écran de 320 px.
const SHORT = { home: "Accueil", cases: "Cas", verbs: "Verbes", bank: "Mots", more: "Plus" };

export default function TabBar({ module }) {
  const tabs = [...TAB_KEYS.map((k) => MODULE_BY_KEY[k]), MORE_META];
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {tabs.map((meta) => {
        const active = meta.key === "more" ? !TAB_KEYS.includes(module) : module === meta.key;
        return (
          <Link
            key={meta.key}
            to={meta.key}
            className={"tab" + (active ? " active" : "")}
            style={{ "--mod-color": meta.color }}
            aria-current={active ? "page" : undefined}
          >
            <span className="tab-icon">
              <meta.icon size={21} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
            </span>
            <span className="tab-label">{SHORT[meta.key] || meta.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
