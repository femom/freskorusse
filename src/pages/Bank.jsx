import React, { useState, useMemo, useEffect } from "react";
import { Shuffle } from "lucide-react";
import { wordBank } from "../data/wordbank.js";
import LessonEngine from "../components/LessonEngine.jsx";
import { shuffle } from "../lib/text.js";
import { useRoute } from "../lib/router.jsx";

const QUIZ_SIZE = 15;

// Liste des lettres de départ réellement présentes dans la banque, dans l'ordre
// de l'alphabet cyrillique — calculée depuis les données plutôt qu'écrite en dur,
// pour rester juste si la banque est enrichie plus tard.
const CYRILLIC_ORDER = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");
const LETTERS = CYRILLIC_ORDER.filter(l => wordBank.some(w => w.ru[0].toUpperCase() === l));

// Carte qui se retourne au clic/tap/Entrée/Espace : recto = mot russe, verso =
// traduction. Non contrôlée par défaut (état local à la carte) ; contrôlée si
// `flipped` + `onToggle` sont fournis (mot du hasard, remis à zéro par le parent).
// Seule la face visible est exposée aux lecteurs d'écran (aria-hidden sur l'autre).
function FlipCard({ word, flipped, onToggle, className = "", faceClass = "" }){
  const [local, setLocal] = useState(false);
  const controlled = flipped !== undefined;
  const isFlipped = controlled ? flipped : local;
  const toggle = controlled ? onToggle : ()=> setLocal(f=>!f);
  return (
    <div
      className={"flip-card " + className + (isFlipped ? " flipped" : "")}
      onClick={toggle}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? `${word.fr} (traduction de ${word.ru})` : `${word.ru} : retourner pour voir la traduction`}
      onKeyDown={(e)=>{ if(e.key==="Enter" || e.key===" "){ e.preventDefault(); toggle(); } }}
    >
      <div className="flip-card-inner">
        <div className={"flip-card-face flip-card-front " + faceClass} lang="ru" aria-hidden={isFlipped}>{word.ru}</div>
        <div className={"flip-card-face flip-card-back " + faceClass} aria-hidden={!isFlipped}>{word.fr}</div>
      </div>
    </div>
  );
}

// Construit une question à choix multiples pour le mini-jeu : le mot russe comme
// énoncé, sa traduction comme bonne réponse, et 3 traductions d'autres mots de la
// banque comme leurres — générée à la volée, aucune question écrite à la main.
function buildQuizPool(){
  return wordBank.map(w=>{
    const distractors = shuffle(wordBank.filter(x=> x.id !== w.id)).slice(0,3).map(x=>x.fr);
    const options = shuffle([w.fr, ...distractors]);
    return { type:"mcq", prompt:w.ru, base:"Que veut dire ce mot ?", options, answer:[w.fr] };
  });
}
const quizPool = buildQuizPool();

export default function Bank({ addXp }){
  // Arrivée depuis la recherche globale : #/mots?q=mot pré-remplit le filtre.
  const route = useRoute();
  const incomingQuery = route.query.get("q") || "";
  const [search, setSearch] = useState(incomingQuery);
  useEffect(()=>{ if(incomingQuery) { setSearch(incomingQuery); setActiveLetter(null); } }, [incomingQuery]);
  const [activeLetter, setActiveLetter] = useState(null);
  const [spotlight, setSpotlight] = useState(()=> wordBank[Math.floor(Math.random()*wordBank.length)]);
  const [spotlightFlipped, setSpotlightFlipped] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);

  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    return wordBank.filter(w=>{
      const matchesSearch = !q || w.ru.toLowerCase().includes(q) || w.fr.toLowerCase().includes(q);
      const matchesLetter = !activeLetter || w.ru[0].toUpperCase() === activeLetter;
      return matchesSearch && matchesLetter;
    });
  }, [search, activeLetter]);

  function newSpotlight(){
    setSpotlight(wordBank[Math.floor(Math.random()*wordBank.length)]);
    setSpotlightFlipped(false);
  }

  const globalQuestions = useMemo(()=> shuffle(quizPool).slice(0,QUIZ_SIZE), [lessonOpen]);

  return (
    <section>
      <h1 className="title">Banque de mots</h1>
      <p className="subtitle">{wordBank.length} mots russes très proches du français. Parfaits pour lire et deviner du premier coup d'œil.</p>

      {/* Mot du jour : un petit moment ludique en arrivant sur la page, plutôt
          qu'une liste figée dès le départ. */}
      <div className="spotlight-card">
        <div className="spotlight-label">Mot du hasard</div>
        <FlipCard
          word={spotlight}
          className="spotlight-flip"
          faceClass="spotlight-front"
          flipped={spotlightFlipped}
          onToggle={()=> setSpotlightFlipped(f=>!f)}
        />
        <button type="button" className="btn-start spotlight-shuffle" onClick={newSpotlight}><Shuffle size={16}/> Un autre mot</button>
      </div>

      <div className="lesson-launch" style={{"--lesson-accent":"var(--accent-bank)"}}>
        <div className="info">
          <h2>Mini-jeu : devine le sens</h2>
          <p>{QUIZ_SIZE} mots au hasard, 4 choix, 3 vies. Aucune révision à faire : ce sont des mots que tu reconnais déjà.</p>
        </div>
        <button type="button" className="btn-start" onClick={()=> setLessonOpen(true)}>Démarrer ▶</button>
      </div>

      <h2 className="block-title">Parcourir</h2>
      <input type="search" className="search-box filter-input" aria-label="Chercher un mot" placeholder="Chercher un mot (russe ou français)…" value={search} onChange={e=>setSearch(e.target.value)}/>

      <div className="letter-tabs" role="group" aria-label="Filtrer par lettre">
        <button type="button" aria-pressed={activeLetter===null} className={"letter-tab" + (activeLetter===null ? " active" : "")} onClick={()=> setActiveLetter(null)}>Tout</button>
        {LETTERS.map(l=>(
          <button type="button" key={l} aria-pressed={activeLetter===l} className={"letter-tab" + (activeLetter===l ? " active" : "")} onClick={()=> setActiveLetter(l)}>{l}</button>
        ))}
      </div>
      <p className="results-count" role="status" aria-live="polite">{filtered.length} {filtered.length > 1 ? "mots" : "mot"}</p>

      <div className="flip-grid">
        {filtered.map(w=> <FlipCard key={w.id} word={w}/>)}
      </div>
      {filtered.length === 0 && <p className="full-note">Aucun mot ne correspond à ta recherche.</p>}

      {lessonOpen && (
        <LessonEngine
          questions={globalQuestions}
          title="Banque de mots"
          accent="var(--accent-bank)"
          onClose={()=> setLessonOpen(false)}
          onFinish={(xp)=> addXp(xp)}
        />
      )}
    </section>
  );
}
