import React, { useState } from "react";
import { cases, caseColors, caseAbbr, endings, fixNotes, hardSoftRule } from "../data/cases.js";
import LessonEngine from "../components/LessonEngine.jsx";
import RuleBox from "../components/RuleBox.jsx";

// Page "Les cas russes". Deux affichages possibles :
// 1) `selected` est vide  -> on montre la liste des 6 cas + la règle générale dur/mou.
// 2) `selected` est un cas -> on montre le détail complet de ce cas (usage, terminaisons,
//    exemples, puis le lancement de la leçon interactive).
export default function Cases({ selected, onSelect, addXp }){
  const [lessonOpen, setLessonOpen] = useState(false);
  const active = cases.find(c=>c.key===selected);

  // --- Vue d'ensemble (aucun cas sélectionné) ---------------------------------
  if(!active){
    return (
      <section>
        <h1 className="title">Les 6 cas russes</h1>
        <p className="subtitle">Choisis un cas pour ses explications, ses terminaisons, ses exemples et sa leçon.</p>

        {/* Grille de cartes cliquables, une par cas */}
        <div className="verb-cards">
          {cases.map(c=>{
            const col = caseColors[c.key];
            return (
              <div className="card verb-card" key={c.key} onClick={()=> onSelect(c.key)}>
                <span className="badge" style={{background:col.c}}>{caseAbbr[c.key]}</span>
                <div><div className="fr">{c.label}</div><div className="ru">{c.questions}</div></div>
              </div>
            );
          })}
        </div>

        <h3 className="block-title">Logique générale</h3>
        <div className="card usage-card">
          <p><b>Nominatif</b> → celui qui agit (sujet). <b>Accusatif</b> → ce qu'on fait/regarde/lit directement (COD). <b>Génitif</b> → ce qui appartient, manque, ou se compte. <b>Datif</b> → à qui on donne, dit, ou destine quelque chose. <b>Instrumental</b> → avec quoi ou avec qui on fait l'action. <b>Prépositionnel</b> → de quoi on parle, ou où l'on se trouve (jamais de mouvement).</p>
        </div>

        {/* Règle transversale : explique le choix entre les 2 variantes de chaque terminaison
            (ex: -a ou -я). C'est la question la plus fréquente des débutants, donc elle est
            affichée en clair ici plutôt que cachée dans un détail replié. */}
        <h3 className="block-title">{hardSoftRule.title}</h3>
        <RuleBox points={hardSoftRule.points} />
      </section>
    );
  }

  // --- Détail d'un cas précis --------------------------------------------------
  const col = caseColors[active.key];
  const genders = ["M","F","N","P"];
  const genderLabels = {M:"Masculin",F:"Féminin",N:"Neutre",P:"Pluriel"};

  return (
    <section>
      <div className="verb-header">
        <span className="badge-lg" style={{background:col.c}}>{caseAbbr[active.key]}</span>
        <div>
          <h2 className="verb-name">{active.label}</h2>
          <div className="verb-sub">{active.ru} — {active.questions}</div>
        </div>
      </div>

      {/* Explication de l'usage du cas (contenu HTML statique, pas de saisie utilisateur) */}
      <div className="card usage-card">
        {active.usage.map((p,i)=> <p key={i} dangerouslySetInnerHTML={{__html:p}}/>)}
      </div>

      {/* Rappel replié de la règle dur/mou, disponible sur chaque cas sans répéter
          le texte en entier à chaque fois (voir RuleBox avec collapsible=true) */}
      <RuleBox title={hardSoftRule.title} points={hardSoftRule.points} collapsible />

      <h3 className="block-title">Terminaisons</h3>
      <div className="ending-grid">
        {genders.map(g=>(
          <div className="card ending-card" key={g}>
            <div className="gender">{genderLabels[g]}</div>
            <div className="end" style={{color:col.c}}>
              {endings[active.key][g].map((e,i)=> <div key={i}>{e}</div>)}
            </div>
          </div>
        ))}
      </div>
      {/* Note corrective ponctuelle (seuls acc/ins en ont une pour l'instant) */}
      {fixNotes[active.key] && <div className="fix-note">{fixNotes[active.key]}</div>}

      <h3 className="block-title">Exemples</h3>
      <div className="example-grid">
        {active.examples.map((ex,i)=>{
          // ex = [étiquette de genre, phrase russe, phonétique (non affichée ici),
          //       traduction française, mot mis en évidence]
          const word = ex[4];
          const parts = ex[1].split(word); // on découpe la phrase autour du mot à surligner
          return (
            <div className="card example" key={i}>
              <span className="tag" style={{color:col.c, background:col.bg}}>{ex[0]}</span>
              <div className="ru">{parts[0]}<span className="hl" style={{color:col.c}}>{word}</span>{parts.slice(1).join(word)}</div>
              <div className="fr">{ex[3]} <span style={{color:"var(--ink-faint)"}}>— {word}</span></div>
            </div>
          );
        })}
      </div>

      <h3 className="block-title">Leçon interactive</h3>
      <div className="lesson-launch" style={{"--lesson-accent":"var(--accent-cases)"}}>
        <div className="info">
          <h4>10 exercices — {active.label}</h4>
          <p>Réponses à trous et choix multiples, sur les 4 genres. Attention : 3 vies.</p>
        </div>
        <button className="btn-start" onClick={()=> setLessonOpen(true)}>Démarrer la leçon ▶</button>
      </div>

      {/* Le moteur de leçon est un composant partagé (aussi utilisé par les verbes) :
          il gère les cœurs, l'XP et l'enchaînement des questions. */}
      {lessonOpen && (
        <LessonEngine
          questions={active.exos}
          title={active.label}
          accent="var(--accent-cases)"
          onClose={()=> setLessonOpen(false)}
          onFinish={(xp)=> addXp(xp)}
        />
      )}
    </section>
  );
}
