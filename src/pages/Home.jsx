import React, { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Link, parseHash } from "../lib/router.jsx";
import { readStorage, LAST_ROUTE_KEY } from "../lib/hooks.js";
import { MODULES, describeRoute } from "../navigation.js";

// Les modules présentés en cartes : même liste que la navigation (navigation.js).
const CARDS = MODULES.filter((m) => m.key !== "home");

// Page d'accueil : « Reprendre » (dernier écran visité), grille des modules et
// footer avec les infos de l'auteur. Chaque carte est un vrai lien.
export default function Home({ appName }) {
  // Dernier écran consulté, mémorisé par App : permet de reprendre en un tap.
  const resume = useMemo(() => {
    const hash = readStorage(LAST_ROUTE_KEY, "");
    if (!hash) return null;
    const route = parseHash(hash);
    const info = describeRoute(route);
    return info.resume ? { route, label: info.resume } : null;
  }, []);

  return (
    <section>
      <h1 className="title">{appName || "FreskoRusse"}</h1>
      <p className="subtitle">Ton espace d'entraînement complet : cas, conjugaison, vocabulaire, dictée et traduction.</p>

      {resume && (
        <Link to={resume.route.module} sub={resume.route.sub} className="card resume-card">
          <div>
            <div className="resume-kicker">Reprendre</div>
            <div className="resume-label">{resume.label}</div>
          </div>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      )}

      <div className="module-cards">
        {CARDS.map((m) => (
          <Link to={m.key} className="card module-card" key={m.key}>
            <span className="icon-lg" style={{ background: m.color }}>
              <m.icon size={22} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <div>
              <h2>{m.title}</h2>
              <p>{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} Ferol EBATA-MOMBOULI · Développeur web fullstack</p>
        <p className="links">
          <a href="https://www.linkedin.com/in/ferol-jeansmy-ebata-mombouli" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <span className="sep">·</span>
          <a href="mailto:fmombouli532@gmail.com">fmombouli532@gmail.com</a>
        </p>
      </footer>
    </section>
  );
}
