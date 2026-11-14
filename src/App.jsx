import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import Home from "./pages/Home.jsx";
import Cases from "./pages/Cases.jsx";
import Verbs from "./pages/Verbs.jsx";
import Bank from "./pages/Bank.jsx";
import Phrases from "./pages/Phrases.jsx";
import Library from "./pages/Library.jsx";
import Dictation from "./pages/Dictation.jsx";
import Translation from "./pages/Translation.jsx";
import More from "./pages/More.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TabBar from "./components/TabBar.jsx";
import MobileTopBar from "./components/MobileTopBar.jsx";
import SearchPalette from "./components/SearchPalette.jsx";
import { useRoute, consumeIntent, savedScroll } from "./lib/router.jsx";
import {
  useXp, useTheme, readStorage, writeStorage,
  LAST_ROUTE_KEY, SIDEBAR_KEY,
} from "./lib/hooks.js";
import { usePwa } from "./lib/pwa.js";
import Toast from "./components/Toast.jsx";
import { describeRoute } from "./navigation.js";

// Nom affiché de l'application. Le nom "technique" du projet (package.json,
// manifest PWA) reste "freskorusse" en minuscules.
const APP_NAME = "FreskoRusse";

// Vrai si l'utilisateur est en train de saisir du texte : on ne détourne alors
// pas la touche « / » (raccourci de recherche).
function isTyping(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

// Orchestration uniquement : l'écran affiché est décidé par l'URL (routeur),
// la navigation vit dans des composants dédiés, l'état persistant dans des hooks.
export default function App() {
  const route = useRoute();
  const info = describeRoute(route);
  const [xp, addXp] = useXp();
  const [theme, toggleTheme] = useTheme();
  const pwa = usePwa();
  const [collapsed, setCollapsed] = useState(() => readStorage(SIDEBAR_KEY, "0") === "1");
  const [searchOpen, setSearchOpen] = useState(false);
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  function toggleCollapsed() {
    setCollapsed((c) => {
      writeStorage(SIDEBAR_KEY, c ? "0" : "1");
      return !c;
    });
  }

  // À chaque changement d'écran :
  //  - clic sur un lien  -> on repart en haut, et le focus passe au titre de la
  //    page (un lecteur d'écran annonce le nouvel écran) ;
  //  - Retour/Avant      -> on retrouve la position de défilement quittée ;
  //  - simple filtre     -> on ne touche à rien (le focus reste sur l'onglet cliqué).
  useLayoutEffect(() => {
    const intent = consumeIntent();
    if (intent === "keep") return;
    window.scrollTo(0, intent === "push" ? 0 : savedScroll(route.hash));
    if (firstRender.current) return;
    const heading = mainRef.current && mainRef.current.querySelector("h1");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }, [route.hash]);

  useEffect(() => {
    firstRender.current = false;
  }, []);

  // Titre d'onglet du navigateur + mémorisation du dernier écran (« Reprendre » sur l'accueil).
  useEffect(() => {
    document.title = route.module === "home" ? "FreskoRusse : cas, verbes, dictée, traduction" : `${info.title} | FreskoRusse`;
    if (info.resume) writeStorage(LAST_ROUTE_KEY, route.hash);
  }, [route.hash]);

  // Raccourcis de recherche : « / » ou Ctrl/Cmd + K.
  useEffect(() => {
    function onKeyDown(e) {
      const cmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      const slash = e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping(e.target);
      if (cmdK || slash) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openSearch = () => setSearchOpen(true);

  return (
    <div className={`app ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Lien d'évitement : un utilisateur clavier saute la navigation d'un appui.
          (Un <a href="#contenu"> casserait le routeur par hash : d'où le bouton.) */}
      <button type="button" className="skip-link" onClick={() => mainRef.current && mainRef.current.focus()}>
        Aller au contenu
      </button>

      <Sidebar
        module={route.module}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        onSearch={openSearch}
        xp={xp}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <MobileTopBar title={info.title} parent={info.parent} xp={xp} onSearch={openSearch} />

      <main id="contenu" ref={mainRef} tabIndex={-1}>
        {route.module === "home" && <Home appName={APP_NAME} />}
        {route.module === "cases" && <Cases selected={route.sub} addXp={addXp} />}
        {route.module === "verbs" && <Verbs selected={route.sub} addXp={addXp} />}
        {route.module === "bank" && <Bank addXp={addXp} />}
        {route.module === "phrases" && <Phrases />}
        {route.module === "library" && <Library />}
        {route.module === "dictation" && <Dictation addXp={addXp} />}
        {route.module === "translation" && <Translation addXp={addXp} />}
        {route.module === "more" && (
          <More xp={xp} theme={theme} onToggleTheme={toggleTheme} />
        )}
      </main>

      <TabBar module={route.module} />

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toast notice={pwa.notice} />
    </div>
  );
}
