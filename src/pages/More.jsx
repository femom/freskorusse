import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "../lib/router.jsx";
import { MODULE_BY_KEY, NAV_GROUPS, TAB_KEYS } from "../navigation.js";
import { XpBadge, ThemeToggle, InstallButton } from "../components/SettingsControls.jsx";

// Page « Plus » (surtout mobile) : les modules qui n'ont pas leur propre onglet,
// regroupés comme dans la barre latérale desktop, puis les réglages (progression,
// thème, installation). Remplace l'ancien tiroir hamburger.
export default function More({ xp, theme, onToggleTheme, install }) {
  const groups = NAV_GROUPS
    .map((g) => ({ ...g, keys: g.keys.filter((k) => !TAB_KEYS.includes(k)) }))
    .filter((g) => g.keys.length > 0);

  return (
    <section>
      <h1 className="title">Plus</h1>
      <p className="subtitle">Les autres modules et tes réglages.</p>

      {groups.map((g) => (
        <div key={g.label}>
          <h2 className="block-title">{g.label}</h2>
          <div className="card more-list">
            {g.keys.map((key) => {
              const m = MODULE_BY_KEY[key];
              return (
                <Link to={key} className="more-row" key={key}>
                  <span className="icon-lg" style={{ background: m.color }}>
                    <m.icon size={20} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span className="more-text">
                    <strong>{m.label}</strong>
                    <small>{m.desc}</small>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <h2 className="block-title">Réglages</h2>
      <div className="more-settings">
        <XpBadge xp={xp} />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <InstallButton install={install} />
      </div>
    </section>
  );
}
