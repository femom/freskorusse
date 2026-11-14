import { useState, useEffect, useCallback } from "react";

// Clés localStorage : inchangées depuis la v1 pour ne pas perdre la progression
// ni le thème déjà enregistrés sur les appareils.
const XP_KEY = "russe_app_xp";
const THEME_KEY = "freskorusse_theme";
export const LAST_ROUTE_KEY = "freskorusse_last_route";
export const SIDEBAR_KEY = "freskorusse_sidebar_collapsed";

export function readStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}
export function writeStorage(key, value) {
  try { localStorage.setItem(key, String(value)); } catch (e) {}
}

// Progression (XP) persistée.
export function useXp() {
  const [xp, setXp] = useState(() => parseInt(readStorage(XP_KEY, "0"), 10) || 0);
  useEffect(() => writeStorage(XP_KEY, xp), [xp]);
  const addXp = useCallback((n) => setXp((x) => x + n), []);
  return [xp, addXp];
}

// Thème clair/sombre (sombre par défaut). On l'applique sur <html data-theme>,
// sélecteur utilisé par styles.css, et on accorde la barre du navigateur mobile.
export function useTheme() {
  const [theme, setTheme] = useState(() => readStorage(THEME_KEY, "dark"));
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    writeStorage(THEME_KEY, theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#10151F" : "#F5F4F1");
  }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return [theme, toggle];
}
