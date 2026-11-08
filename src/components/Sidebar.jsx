import React from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Link } from "../lib/router.jsx";
import { MODULE_BY_KEY, NAV_GROUPS } from "../navigation.js";
import { XpBadge, ThemeToggle, InstallButton } from "./SettingsControls.jsx";

// Une entrée de navigation. C'est un vrai lien (<a href="#/...">) : on peut
// l'ouvrir dans un nouvel onglet et les lecteurs d'écran l'annoncent comme tel.
function NavItem({ meta, active, compact }) {
  return (
    <li>
      <Link
        to={meta.key}
        className={"module-btn" + (active ? " active" : "")}
        style={{ "--mod-color": meta.color }}
        aria-current={active ? "page" : undefined}
        title={compact ? meta.label : undefined}
        aria-label={compact ? meta.label : undefined}
      >
        <span className="icon" style={{ background: meta.color }}>
          <meta.icon size={15} strokeWidth={2.4} aria-hidden="true" />
        </span>
        {!compact && <span>{meta.label}</span>}
      </Link>
    </li>
  );
}

// Barre latérale desktop : modules regroupés par intention (Apprendre /
// Pratiquer / Consulter). Plus de sous-liste des 62 verbes : la page du module
// affiche déjà cette liste, avec filtre.
export default function Sidebar({
  module, collapsed, onToggleCollapsed, onSearch, xp, theme, onToggleTheme, install,
}) {
  return (
    <nav className="side" aria-label="Navigation principale">
      <div className="nav-header">
        <Link to="home" className={"brand" + (collapsed ? " compact" : "")} aria-label="FreskoRusse, accueil">
          <div className="logo" aria-hidden="true">РУ</div>
          {!collapsed && (
            <div className="txt">
              <strong>FreskoRusse</strong>
              <span>Apprendre le russe, pas à pas</span>
            </div>
          )}
        </Link>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Agrandir la navigation" : "Réduire la navigation"}
          aria-expanded={!collapsed}
          title={collapsed ? "Agrandir la navigation" : "Réduire la navigation"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <button
        type="button"
        className={"search-trigger" + (collapsed ? " compact" : "")}
        onClick={onSearch}
        aria-label="Rechercher (raccourci : touche /)"
        title="Rechercher"
      >
        <Search size={15} aria-hidden="true" />
        {!collapsed && <span className="grow">Rechercher…</span>}
        {!collapsed && <kbd aria-hidden="true">/</kbd>}
      </button>

      <ul className="module-nav">
        <NavItem meta={MODULE_BY_KEY.home} active={module === "home"} compact={collapsed} />
      </ul>

      {NAV_GROUPS.map((group) => (
        <div className="nav-group" key={group.label}>
          {collapsed ? (
            <hr className="nav-sep" />
          ) : (
            <div className="nav-group-label" id={`grp-${group.label}`}>{group.label}</div>
          )}
          <ul className="module-nav" aria-labelledby={collapsed ? undefined : `grp-${group.label}`}>
            {group.keys.map((key) => (
              <NavItem key={key} meta={MODULE_BY_KEY[key]} active={module === key} compact={collapsed} />
            ))}
          </ul>
        </div>
      ))}

      <div className="side-footer">
        {!collapsed && <XpBadge xp={xp} />}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} compact={collapsed} />
        <InstallButton install={install} compact={collapsed} />
      </div>
    </nav>
  );
}
