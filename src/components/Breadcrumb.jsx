import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "../lib/router.jsx";

// Fil d'Ariane des pages de détail (desktop ; sur mobile c'est la flèche de la
// barre du haut qui joue ce rôle).
export default function Breadcrumb({ to, parentLabel, current }) {
  return (
    <nav className="breadcrumb" aria-label="Fil d'Ariane">
      <Link to={to}>{parentLabel}</Link>
      <ChevronRight size={14} aria-hidden="true" />
      <span aria-current="page">{current}</span>
    </nav>
  );
}
