import React, { useState, useMemo } from "react";
import { Shuffle } from "lucide-react";
import { wordBank } from "../data/wordbank.js";
import LessonEngine from "../components/LessonEngine.jsx";

// Mélange un tableau sans le modifier (Fisher-Yates) — même utilitaire que dans
// les autres pages, dupliqué ici pour garder chaque page indépendante.
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

// Liste des lettres de départ réellement présentes dans la banque, dans l'ordre
// de l'alphabet cyrillique — calculée depuis les données plutôt qu'écrite en dur,
// pour rester juste si la banque est enrichie plus tard.
const CYRILLIC_ORDER = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");
const LETTERS = CYRILLIC_ORDER.filter(l => wordBank.some(w => w.ru[0].toUpperCase() === l));

// Une carte-mot qui se retourne au clic/tap : recto = mot russe, verso = traduction.
// L'état "retournée" est local à la carte (pas besoin de le remonter plus haut).
function FlipCard({ word }){
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={"flip-card" + (flipped ? " flipped" : "")}
      onClick={()=> setFlipped(f=>!f)}
      role="button"
      tabIndex={0}
      onKeyDown={(e)=>{ if(e.key==="Enter" || e.key===" ") setFlipped(f=>!f); }}
    >
      <div className="flip-card-inner">
        <div className="flip-card-face flip-card-front">{word.ru}</div>
        <div className="flip-card-face flip-card-back">{word.fr}</div>
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
  const [search, setSearch] = useState("");
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

  const globalQuestions = useMemo(()=> shuffle(quizPool).slice(0,15), [lessonOpen]);

  return (
    <section>
      <h1 className="title">Banque de mots</h1>
      <p className="subtitle">{wordBank.length} mots russes très proches du français — parfaits pour lire et deviner du premier coup d'œil.</p>

      {/* Mot du jour : un petit moment ludique en arrivant sur la page, plutôt
          qu'une liste figée dès le départ. */}
      <div className="spotlight-card">
        <div className="spotlight-label">Mot du hasard</div>
        <div className={"flip-card spotlight-flip" + (spotlightFlipped ? " flipped" : "")} onClick={()=> setSpotlightFlipped(f=>!f)}>
          <div className="flip-card-inner">
            <div className="flip-card-face flip-card-front spotlight-front">{spotlight.ru}</div>
            <div className="flip-card-face flip-card-back spotlight-front">{spotlight.fr}</div>
          </div>
        </div>
        <button className="btn-start spotlight-shuffle" onClick={newSpotlight}><Shuffle size={16}/> Un autre mot</button>
      </div>

      <div className="lesson-launch" style={{"--lesson-accent":"var(--accent-bank)"}}>
        <div className="info">
          <h4>Mini-jeu — Devine le sens</h4>
          <p>15 mots au hasard, 4 choix, 3 vies. Aucune révision à faire : ce sont des mots que tu reconnais déjà.</p>
        </div>
        <button className="btn-start" onClick={()=> setLessonOpen(true)}>Démarrer ▶</button>
      </div>

      <h3 className="block-title">Parcourir</h3>
      <input className="search-box" style={{marginBottom:14, maxWidth:320}} placeholder="Chercher un mot (russe ou français)..." value={search} onChange={e=>setSearch(e.target.value)}/>

      <div className="letter-tabs">
        <button className={"letter-tab" + (activeLetter===null ? " active" : "")} onClick={()=> setActiveLetter(null)}>Tout</button>
        {LETTERS.map(l=>(
          <button key={l} className={"letter-tab" + (activeLetter===l ? " active" : "")} onClick={()=> setActiveLetter(l)}>{l}</button>
        ))}
      </div>

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
