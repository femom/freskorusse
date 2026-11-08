import React from "react";
import { ArrowLeft, Search, Star } from "lucide-react";
import { Link } from "../lib/router.jsx";

// Barre du haut (mobile). Sur une page de détail (un cas, un verbe), la flèche
// ramène TOUJOURS à la liste du module — jamais hors de l'app. Ailleurs, on
// montre le logo. À droite : recherche et progression, visibles sans ouvrir de menu.
export default function MobileTopBar({ title, parent, xp, onSearch }) {
  return (
    <header className="mobile-topbar">
      {parent ? (
        <Link to={parent.module} className="topbar-btn" aria-label={`Retour : ${parent.label}`}>
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
      ) : (
        <Link to="home" className="topbar-logo" aria-label="FreskoRusse, accueil">РУ</Link>
      )}
      <div className="topbar-title">{title}</div>
      <div className="topbar-xp" aria-label={`${xp} points d'expérience`}>
        <Star size={13} fill="currentColor" aria-hidden="true" />
        {xp}
      </div>
      <button type="button" className="topbar-btn" onClick={onSearch} aria-label="Rechercher">
        <Search size={20} aria-hidden="true" />
      </button>
    </header>
  );
}
