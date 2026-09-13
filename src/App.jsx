import React, { useState, useMemo, useEffect, useRef } from "react";
import Home from "./pages/Home.jsx";
import Cases from "./pages/Cases.jsx";
import Verbs from "./pages/Verbs.jsx";
import Dictation from "./pages/Dictation.jsx";
import Translation from "./pages/Translation.jsx";
import { cases, caseColors, caseAbbr } from "./data/cases.js";
import { verbs, groupColor } from "./data/verbs.js";

// Nom affiché de l'application (utilisé dans la barre latérale). Le nom "technique"
// du projet (package.json, manifest PWA) reste "freskorusse" en minuscules, mais
// l'utilisateur voit toujours "FreskoRusse".
const APP_NAME = "FreskoRusse";

// Métadonnées de navigation pour chaque module : libellé affiché, icône (lettre/symbole)
// et couleur d'accent du badge. Chaque module a UNE seule couleur (via les variables CSS
// de thème, donc adaptée automatiquement en mode clair/sombre) plutôt qu'un dégradé —
// look plus sobre, et "home" reste neutre puisqu'il ne correspond à aucune catégorie.
const MODULE_META = {
  home: { label: "Accueil", icon: "◐", color: "var(--ink-faint)" },
  cases: { label: "Les cas", icon: "Ф", color: "var(--accent-cases)" },
  verbs: { label: "Conjugaison", icon: "Г", color: "var(--accent-verbs)" },
  dictation: { label: "Dictée", icon: "♪", color: "var(--accent-dictation)" },
  translation: {
    label: "Traduction",
    icon: "⇄",
    color: "var(--accent-translation)",
  },
};

// Clé localStorage utilisée pour retenir le thème choisi par l'utilisateur d'une visite à l'autre.
const THEME_KEY = "freskorusse_theme";

export default function App() {
  // --- Navigation ---------------------------------------------------------
  // `module` = onglet actif (home / cases / verbs / dictation / translation).
  // `caseSelected` / `verbSelected` = élément actuellement ouvert dans ces modules (ou null).
  const [module, setModule] = useState("home");
  const [caseSelected, setCaseSelected] = useState(null);
  const [verbSelected, setVerbSelected] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState("cases");

  // --- Recherche globale ---------------------------------------------------
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // --- Progression (XP) ----------------------------------------------------
  // Persistée dans localStorage pour survivre à une fermeture du navigateur.
  const [xp, setXp] = useState(() => {
    try {
      return parseInt(localStorage.getItem("russe_app_xp") || "0", 10) || 0;
    } catch (e) {
      return 0;
    }
  });

  // --- Thème clair/sombre ---------------------------------------------------
  // Par défaut : sombre. On relit le choix précédent de l'utilisateur s'il existe.
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || "dark";
    } catch (e) {
      return "dark";
    }
  });

  // On applique le thème sur <html data-theme="..."> : c'est ce sélecteur que
  // src/styles.css utilise pour basculer toutes les couleurs (voir la section
  // "THEME" du fichier CSS).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    try {
      localStorage.setItem("russe_app_xp", String(xp));
    } catch (e) {}
  }, [xp]);

  useEffect(() => {
    if (module === "cases" || module === "verbs") {
      setExpandedSection(module);
    } else {
      setExpandedSection(null);
    }
  }, [module]);

  // Ajoute de l'XP gagné à la fin d'une leçon (cas, verbes, dictée...).
  function addXp(n) {
    setXp((x) => x + n);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function handleModuleClick(key) {
    if (module === key && (key === "cases" || key === "verbs")) {
      setExpandedSection((prev) => (prev === key ? null : key));
      return;
    }

    setModule(key);
    if (key === "cases") setCaseSelected(caseSelected);
    if (key === "verbs") setVerbSelected(verbSelected);
    if (key === "cases" || key === "verbs") setExpandedSection(key);
    else setExpandedSection(null);
    setSearch("");
    setSearchFocused(false);
    closeMobileMenu();
  }

  // Change de module et, éventuellement, sélectionne directement un sous-élément
  // (un cas précis ou un verbe précis) — utilisé par la recherche et les pages elles-mêmes.
  function navigate(mod, subKey) {
    setModule(mod);
    if (mod === "cases") setCaseSelected(subKey || null);
    if (mod === "verbs") setVerbSelected(subKey || null);
    if (mod === "cases" || mod === "verbs") setExpandedSection(mod);
    else setExpandedSection(null);
    setSearch("");
    setSearchFocused(false);
    closeMobileMenu();
  }

  function handleSubItemClick(mod, subKey) {
    navigate(mod, subKey);
  }

  // Résultats de la recherche globale : on cherche dans les libellés des cas,
  // des verbes (français ou russe), et on propose aussi les modules dictée/traduction
  // si leur nom correspond à la saisie.
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const res = [];
    cases.forEach((c) => {
      if (c.label.toLowerCase().includes(q) || c.ru.toLowerCase().includes(q)) {
        res.push({
          cat: "Cas",
          label: c.label,
          action: () => navigate("cases", c.key),
        });
      }
    });
    verbs.forEach((v) => {
      if (
        v.fr.toLowerCase().includes(q) ||
        v.imp.ru.toLowerCase().includes(q) ||
        (v.perf && v.perf.ru.toLowerCase().includes(q))
      ) {
        res.push({
          cat: "Verbe",
          label: `${v.fr} (${v.imp.ru})`,
          action: () => navigate("verbs", v.id),
        });
      }
    });
    if ("dictée".includes(q) || "dictee".includes(q) || "écoute".includes(q)) {
      res.push({
        cat: "Module",
        label: "Dictée",
        action: () => navigate("dictation"),
      });
    }
    if ("traduction".includes(q) || "translate".includes(q)) {
      res.push({
        cat: "Module",
        label: "Traduction",
        action: () => navigate("translation"),
      });
    }
    return res.slice(0, 12);
  }, [search]);

  const renderNavContent = (opts = {}) => {
    const { compact = false, mobile = false } = opts;
    const showSublist = !mobile || expandedSection === module;

    return (
      <>
        <div className="nav-header">
          <div
            className={`brand ${compact ? "compact" : ""}`}
            onClick={() => {
              navigate("home");
            }}
          >
            <div className="logo">РУ</div>
            {!compact && (
              <div className="txt">
                <strong>{APP_NAME}</strong>
                <span>Cas · Verbes · Dictée · Traduction</span>
              </div>
            )}
          </div>

          {mobile ? (
            <button
              type="button"
              className="drawer-close"
              onClick={closeMobileMenu}
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          ) : (
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed((v) => !v)}
              aria-label={
                sidebarCollapsed
                  ? "Agrandir la navigation"
                  : "Réduire la navigation"
              }
              title={
                sidebarCollapsed
                  ? "Agrandir la navigation"
                  : "Réduire la navigation"
              }
            >
              {sidebarCollapsed ? "→" : "←"}
            </button>
          )}
        </div>

        {!compact && (
          <>
            <div className="xp-badge">
              <span className="lbl">Progression</span>
              <span>⭐ {xp} XP</span>
            </div>

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title="Changer de thème"
              aria-label={
                theme === "dark"
                  ? "Passer en mode clair"
                  : "Passer en mode sombre"
              }
            >
              <span>{theme === "dark" ? "☾ Mode sombre" : "☀ Mode clair"}</span>
              <span className="theme-toggle-dot" />
            </button>

            <div className="search-wrap">
              <input
                ref={searchRef}
                className="search-box"
                placeholder="Rechercher un cas, un verbe..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              />
              {searchFocused && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((r, i) => (
                    <div
                      className="search-result-item"
                      key={i}
                      onMouseDown={r.action}
                    >
                      <div className="cat">{r.cat}</div>
                      <div>{r.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <ul className={`module-nav ${compact ? "compact" : ""}`}>
          {Object.keys(MODULE_META).map((key) => {
            const m = MODULE_META[key];
            const isActive = module === key;
            return (
              <li key={key}>
                <button
                  className={"module-btn" + (isActive ? " active" : "")}
                  onClick={() => handleModuleClick(key)}
                  aria-current={isActive ? "page" : undefined}
                  title={m.label}
                >
                  <span className="icon" style={{ background: m.color }}>
                    {m.icon}
                  </span>
                  {!compact && <span>{m.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        {showSublist && module === "cases" && (
          <ul className="sublist">
            {cases.map((c) => (
              <li key={c.key}>
                <button
                  className={
                    "subbtn" + (caseSelected === c.key ? " active" : "")
                  }
                  onClick={() => handleSubItemClick("cases", c.key)}
                >
                  <span
                    className="dot"
                    style={{ background: caseColors[c.key].c }}
                  />
                  <span>{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {showSublist && module === "verbs" && (
          <ul className="sublist">
            {verbs.map((v) => (
              <li key={v.id}>
                <button
                  className={
                    "subbtn" + (verbSelected === v.id ? " active" : "")
                  }
                  onClick={() => handleSubItemClick("verbs", v.id)}
                >
                  <span
                    className="dot"
                    style={{ background: groupColor[v.imp.group] }}
                  />
                  <span>{v.fr}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  };

  return (
    <div className={`app ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <nav className="side" aria-label="Navigation principale desktop">
        {renderNavContent({ compact: sidebarCollapsed, mobile: false })}
      </nav>

      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-menu-button"
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className="mobile-brand"
          onClick={() => {
            navigate("home");
            setMobileMenuOpen(false);
          }}
        >
          <span className="mobile-brand-logo">РУ</span>
          <span>FreskoRusse</span>
        </div>

        <button
          type="button"
          className="mobile-options"
          aria-label="Options du profil"
        >
          ⋯
        </button>
      </header>

      <div
        className={`mobile-drawer-backdrop ${mobileMenuOpen ? "open" : ""}`}
        onClick={closeMobileMenu}
        aria-hidden={!mobileMenuOpen}
      />

      <aside
        id="mobile-navigation-drawer"
        className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation principal"
      >
        {renderNavContent({ compact: false, mobile: true })}
      </aside>

      <main className={mobileMenuOpen ? "main-dimmed" : ""}>
        {module === "home" && <Home navigate={navigate} appName={APP_NAME} />}
        {module === "cases" && (
          <Cases
            selected={caseSelected}
            onSelect={(k) => navigate("cases", k)}
            addXp={addXp}
          />
        )}
        {module === "verbs" && (
          <Verbs
            selected={verbSelected}
            onSelect={(k) => navigate("verbs", k)}
            addXp={addXp}
          />
        )}
        {module === "dictation" && <Dictation addXp={addXp} />}
        {module === "translation" && <Translation addXp={addXp} />}
      </main>
    </div>
  );
}
