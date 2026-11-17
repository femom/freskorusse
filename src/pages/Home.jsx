import React, { useMemo } from "react";
import { ArrowRight, Zap, Star, Swords } from "lucide-react";
import { Link, parseHash } from "../lib/router.jsx";
import { readStorage, LAST_ROUTE_KEY } from "../lib/hooks.js";
import { MODULES, MODULE_BY_KEY, describeRoute } from "../navigation.js";
import { useStats, computeStreak, weekDays, dayKey } from "../lib/stats.js";
import { heroProgress } from "../lib/progress.js";

// Les modules présentés en cartes : même liste que la navigation (navigation.js).
const CARDS = MODULES.filter((m) => m.key !== "home");

// Recommandations de la page d'accueil (le défi du jour a sa propre carte).
const PICKS = [
  { to: "cases", sub: "mot", tag: "Outil", title: "Un mot dans les 6 cas", text: "Tape ton mot, vois ses 12 formes.", letter: "Ж", tone: "pink" },
  { to: "cases", sub: "prepositions", tag: "Référence", title: "Prépositions et cas", text: "Quelle préposition, quel cas ?", letter: "П", tone: "mint" },
  { to: "dictation", tag: "Pratique", title: "Dictée", text: "Écoute, puis écris en russe.", letter: "Ч", tone: "butter" },
  { to: "translation", tag: "Pratique", title: "Traduction", text: "Français et russe, à ton rythme.", letter: "Я", tone: "lilac" },
];

// Cubes de l'alphabet : la signature visuelle de FreskoRusse (décoratif, masqué pour les lecteurs d'écran).
function LetterBlocks() {
  return (
    <div className="letter-art" aria-hidden="true">
      <span className="lb a">А</span>
      <span className="lb b">Б</span>
      <span className="lb v">В</span>
    </div>
  );
}

function StatChip({ tone, icon, value, label }) {
  return (
    <div className={"stat-chip " + tone}>
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <div>
        <b>{value}</b>
        <span>{label}</span>
      </div>
    </div>
  );
}

// Page d'accueil : salutation, statistiques, reprise, recommandations, série de jours, défi, tous les modules.
export default function Home({ xp = 0 }) {
  const stats = useStats();
  const now = new Date();
  const streak = computeStreak(stats.days, now);
  const week = weekDays(stats.days, now);
  const todayDone = stats.days.includes(dayKey(now));

  // Dernier écran consulté, mémorisé par App : permet de reprendre en un tap.
  const resume = useMemo(() => {
    const hash = readStorage(LAST_ROUTE_KEY, "");
    if (!hash) return null;
    const route = parseHash(hash);
    const info = describeRoute(route);
    return info.resume ? { route, label: info.resume } : null;
  }, []);

  const progress = heroProgress(resume ? resume.route.module : "cases", stats.scores);

  const subtitle = stats.days.length === 0
    ? "Bienvenue ! Choisis un module pour commencer."
    : todayDone
      ? "Bravo, ta journée est validée. Tu peux continuer si tu veux."
      : "Fais un exercice aujourd'hui pour valider ta journée.";

  return (
    <section className="home page-wide">
      <h1 className="title">Привет !</h1>
      <p className="subtitle">{subtitle}</p>

      <div className="home-grid">
        <div className="home-main">
          <div className="stat-row">
            <StatChip tone="butter" icon={<Star size={26} fill="currentColor" />} value={xp} label="Points XP" />
            <StatChip tone="lilac" icon={<Zap size={26} fill="currentColor" />} value={streak} label={streak > 1 ? "Jours de suite" : "Jour de suite"} />
            <StatChip tone="mint" icon="Б" value={stats.lessons} label={stats.lessons > 1 ? "Leçons faites" : "Leçon faite"} />
            <StatChip tone="pink" icon="Я" value={stats.words.length} label={stats.words.length > 1 ? "Mots vus" : "Mot vu"} />
          </div>

          <section className="home-resume" aria-labelledby="home-resume">
            <h2 className="block-title" id="home-resume">{resume ? "Reprendre" : "Commencer"}</h2>
            <div className="card glass home-hero">
              <LetterBlocks />
              <div className="hero-text">
                <span className="pick-tag">{resume ? "Dernière visite" : "Pour débuter"}</span>
                <h3>{resume ? resume.label : "Les cas russes"}</h3>
                <p>{resume ? "Retrouve l'endroit où tu t'étais arrêté." : "Les 6 cas, un par un, avec des exercices."}</p>
                {progress && (
                  <div className="hero-progress">
                    <div
                      className="bar"
                      role="progressbar"
                      aria-label={progress.label}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progress.ratio * 100)}
                    >
                      <i style={{ width: `${Math.round(progress.ratio * 100)}%` }} />
                    </div>
                    <span>{progress.label}</span>
                  </div>
                )}
                <Link
                  to={resume ? resume.route.module : "cases"}
                  sub={resume ? resume.route.sub : undefined}
                  className="btn-home"
                >
                  {resume ? "Reprendre" : "Commencer"} <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          <section className="home-picks" aria-labelledby="home-picks">
            <h2 className="block-title" id="home-picks">Pour toi</h2>
            <div className="pick-grid">
              {PICKS.map((p) => (
                <Link key={p.title} to={p.to} sub={p.sub} className={"card glass pick " + p.tone}>
                  <span className="pick-letter" aria-hidden="true">{p.letter}</span>
                  <span className="pick-tag">{p.tag}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="home-side" aria-label="Série et défi">
          <h2 className="block-title">Aujourd'hui</h2>
          <div className="side-stack">
          <section className="card glass streak-card" aria-labelledby="home-streak">
            <h2 id="home-streak">{streak > 0 ? `Série de ${streak} ${streak > 1 ? "jours" : "jour"}` : "Pas encore de série"}</h2>
            <ul className="week" aria-label="Jours validés cette semaine">
              {week.map((d) => (
                <li key={d.key} className={(d.done ? "done " : "") + (d.today ? "today" : "")} aria-label={`${d.name}${d.done ? ", validé" : ""}${d.today ? ", aujourd'hui" : ""}`}>
                  {d.done ? <Zap size={15} fill="currentColor" aria-hidden="true" /> : d.label}
                </li>
              ))}
            </ul>
            <p>{todayDone ? "Journée validée. À demain !" : "Réponds à une question pour valider ta journée."}</p>
          </section>

          <section className="card glass challenge-card" aria-labelledby="home-challenge">
            <h2 id="home-challenge"><Swords size={20} aria-hidden="true" /> Défi du jour</h2>
            <p>Reconnaître le cas : 12 phrases, 3 vies.</p>
            <Link to="cases" query={{ defi: "1" }} className="btn-home on-pastel">Relever le défi <ArrowRight size={18} aria-hidden="true" /></Link>
          </section>
          </div>
        </aside>
      </div>

      <h2 className="block-title">Tous les modules</h2>
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
