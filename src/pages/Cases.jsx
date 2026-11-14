import React, { useMemo, useState } from "react";
import { ArrowRight, Wand2 } from "lucide-react";
import { cases, caseColors, caseAbbr, caseInfo, fixNotes, hardSoftRule, takeaways } from "../data/cases.js";
import { extraExamples, recognitionItems } from "../data/caseExtras.js";
import LessonEngine from "../components/LessonEngine.jsx";
import RuleBox from "../components/RuleBox.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Pager from "../components/Pager.jsx";
import CasesTabs from "../components/CasesTabs.jsx";
import { EndingsTable, SpecialEndingsTable } from "../components/EndingsTable.jsx";
import WordDeclension from "./WordDeclension.jsx";
import Prepositions from "./Prepositions.jsx";
import SpeakButton from "../components/SpeakButton.jsx";
import { Link } from "../lib/router.jsx";
import { badgeColors } from "../lib/color.js";
import { shuffle } from "../lib/text.js";
import { buildRecognitionQuestions } from "../lib/recognition.js";

const RECOGNITION_SESSION = 12;

const PAGER_ITEMS = cases.map((c) => ({ key: c.key, label: c.label }));

// Les prépositions d'un cas, sous forme de texte court (« без, для, до... »).
const prepositionsText = (key) => {
  const list = caseInfo[key].oftenWith.prepositions;
  return list.length ? list.map((p) => p.ru).join(", ") : "Aucune";
};

// Pastilles « souvent utilisé avec » : le russe en gras, la traduction en petit.
function ChipList({ items, label }) {
  if (!items.length) return null;
  return (
    <div className="chip-group">
      <h3 className="mini-title">{label}</h3>
      <ul className="chip-list">
        {items.map((it) => (
          <li className="chip" key={it.ru}>
            <b lang="ru">{it.ru}</b>
            <small>{it.fr}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Carte d'un cas sur la vue d'ensemble (calquée sur l'affiche de référence) :
// un bandeau coloré, le rôle en une phrase, les questions, un exemple.
function CaseCard({ c, index }) {
  const info = caseInfo[c.key];
  const col = caseColors[c.key].c;
  const first = c.examples[0];
  const prepositions = info.oftenWith.prepositions;
  return (
    <Link to="cases" sub={c.key} className="case-card case-scope" style={{ "--case-c": col }}>
      <span className="case-card-head" style={badgeColors(col)}>
        <span className="case-num" aria-hidden="true">{index + 1}</span>
        <span className="case-card-title">
          <strong>{c.label}</strong>
          <small lang="ru">{c.ru}</small>
        </span>
      </span>
      <span className="case-card-body">
        <span className="case-role">{info.role}</span>
        <span className="case-q">
          <b lang="ru">{c.questions}</b> <small>({info.questionsFr})</small>
        </span>
        {prepositions.length > 0 && (
          <span className="case-with">
            <small>Souvent avec :</small> <span lang="ru">{prepositions.slice(0, 5).map((p) => p.ru).join(", ")}</span>
          </span>
        )}
        <span className="case-example">
          <span lang="ru">{first[1]}</span>
          <small>{first[3]}</small>
        </span>
        <span className="case-more">Voir le détail <ArrowRight size={14} aria-hidden="true" /></span>
      </span>
    </Link>
  );
}

// Page « Les cas ». Trois affichages, décidés par l'adresse :
//   #/cas       : vue d'ensemble (cartes, récapitulatif, à retenir)
//   #/cas/mot   : outil « un mot dans les 6 cas »
//   #/cas/prepositions : « quelle préposition, quel cas ? »
//   #/cas/acc   : détail d'un cas (rôle, terminaisons, cas particuliers, exemples, leçon)
export default function Cases({ selected, addXp }) {
  const [lessonOpen, setLessonOpen] = useState(false);
  const [recognitionOpen, setRecognitionOpen] = useState(false);
  // 12 phrases tirées au hasard à chaque ouverture de l'exercice de reconnaissance.
  const recognitionQuestions = useMemo(
    () => shuffle(buildRecognitionQuestions()).slice(0, RECOGNITION_SESSION),
    [recognitionOpen]
  );

  if (selected === "mot") return <WordDeclension />;
  if (selected === "prepositions") return <Prepositions />;

  const active = cases.find((c) => c.key === selected);

  // --- Vue d'ensemble ---------------------------------------------------------
  if (!active) {
    return (
      <section>
        <h1 className="title">Les {cases.length} cas russes</h1>
        <p className="subtitle">En russe, un nom change de terminaison selon son rôle dans la phrase : ce sont les cas. Ouvre un cas pour voir ses terminaisons, ses exemples et sa leçon.</p>
        <CasesTabs current="list" />

        <div className="case-grid">
          {cases.map((c, i) => <CaseCard key={c.key} c={c} index={i} />)}
        </div>

        <h2 className="block-title">Entraînement : reconnaître le cas</h2>
        <div className="lesson-launch" style={{ "--lesson-accent": "var(--accent-cases)" }}>
          <div className="info">
            <h3>{RECOGNITION_SESSION} phrases au hasard sur {recognitionItems.length}</h3>
            <p>Un mot est souligné dans une vraie phrase : dis dans quel cas il est. Chaque réponse est expliquée. 3 vies.</p>
          </div>
          <button type="button" className="btn-start" onClick={() => setRecognitionOpen(true)}>Démarrer ▶</button>
        </div>

        <h2 className="block-title">Récapitulatif des {cases.length} cas</h2>
        <div className="table-wrap">
          <table className="case-table recap-table stack-mobile">
            <caption className="sr-only">Récapitulatif : question, prépositions fréquentes et rôle de chaque cas</caption>
            <thead>
              <tr>
                <th scope="col">Cas</th>
                <th scope="col">Question</th>
                <th scope="col">Prépositions fréquentes</th>
                <th scope="col">Rôle principal</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c, i) => {
                const col = caseColors[c.key].c;
                return (
                  <tr key={c.key} className="case-scope" style={{ "--case-c": col }}>
                    <th scope="row" className="case-name-cell" data-label="Cas">
                      <span className="case-pill" style={badgeColors(col)} aria-hidden="true">{i + 1}</span>
                      <Link to="cases" sub={c.key}>{c.label}</Link>
                    </th>
                    <td lang="ru" data-label="Question">{c.questions}</td>
                    <td lang="ru" data-label="Prépositions">{prepositionsText(c.key)}</td>
                    <td data-label="Rôle">{caseInfo[c.key].shortRole}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card takeaways">
          <h2 className="mini-title">À retenir</h2>
          <ul className="plain-list">
            {takeaways.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>

        <h2 className="block-title">{hardSoftRule.title}</h2>
        <RuleBox points={hardSoftRule.points} />

        {recognitionOpen && (
          <LessonEngine
            questions={recognitionQuestions}
            title="Reconnaître le cas"
            accent="var(--accent-cases)"
            onClose={() => setRecognitionOpen(false)}
            onFinish={(xp) => addXp(xp)}
          />
        )}
      </section>
    );
  }

  // --- Détail d'un cas ----------------------------------------------------------
  const info = caseInfo[active.key];
  const col = caseColors[active.key].c;

  return (
    // --case-c : couleur du cas ; le CSS en dérive une version lisible dans les
    // deux thèmes (texte, terminaisons en évidence).
    <section className="case-scope" style={{ "--case-c": col }}>
      <Breadcrumb to="cases" parentLabel="Les cas" current={active.label} />

      <div className="verb-header">
        <span className="badge-lg" style={badgeColors(col)} aria-hidden="true">{caseAbbr[active.key]}</span>
        <div>
          <h1 className="verb-name">{active.label}</h1>
          <div className="verb-sub"><span lang="ru">{active.ru}</span> · <span lang="ru">{active.questions}</span> ({info.questionsFr})</div>
        </div>
      </div>

      <div className="card usage-card">
        <p className="case-lead">{info.role}</p>
        {active.usage.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
      </div>

      {(info.oftenWith.prepositions.length > 0 || info.oftenWith.words.length > 0) ? (
        <div className="card often-with">
          <h2 className="mini-title">Souvent utilisé avec</h2>
          <ChipList items={info.oftenWith.prepositions} label="Prépositions" />
          <ChipList items={info.oftenWith.words} label="Verbes et mots" />
        </div>
      ) : (
        <div className="card often-with"><p className="muted-text">{info.oftenWith.note}</p></div>
      )}

      <h2 className="block-title">Terminaisons principales</h2>
      <p className="table-hint">La partie qui change est en couleur et en gras. Les cas qui sortent de ce tableau sont dans « Cas particuliers ».</p>
      <EndingsTable caseKey={active.key} rows={info.rows} caseLabel={active.label} />
      {fixNotes[active.key] && <div className="fix-note">{fixNotes[active.key]}</div>}

      <h2 className="block-title">Cas particuliers</h2>
      <SpecialEndingsTable caseKey={active.key} rows={info.special} caseLabel={active.label} />

      {/* Rappel replié de la règle dur/mou, disponible sur chaque cas */}
      <RuleBox title={hardSoftRule.title} points={hardSoftRule.points} collapsible />

      <h2 className="block-title">Exemples</h2>
      <div className="example-grid">
        {[...active.examples, ...(extraExamples[active.key] || [])].map((ex, i) => {
          // ex = [genre, phrase russe, phonétique (non affichée), traduction, mot mis en évidence]
          const word = ex[4];
          const parts = ex[1].split(word); // on découpe la phrase autour du mot à surligner
          return (
            <div className="card example" key={i}>
              <span className="tag">{ex[0]}</span>
              <div className="ru" lang="ru">{parts[0]}<span className="hl">{word}</span>{parts.slice(1).join(word)}</div>
              <div className="fr">{ex[3]} <span className="word-ref">({word})</span></div>
              <SpeakButton text={ex[1]} ariaLabel={`Écouter : ${ex[3]}`} />
            </div>
          );
        })}
      </div>

      <Link to="cases" sub="mot" className="card word-cta">
        <Wand2 size={20} aria-hidden="true" />
        <span>
          <strong>Essaie avec ton propre mot</strong>
          <small>Vois un mot de ton choix dans les 6 cas, au singulier et au pluriel.</small>
        </span>
        <ArrowRight size={18} aria-hidden="true" />
      </Link>

      <h2 className="block-title">Leçon interactive</h2>
      <div className="lesson-launch" style={{ "--lesson-accent": "var(--accent-cases)" }}>
        <div className="info">
          <h3>{active.exos.length} exercices : {active.label}</h3>
          <p>Réponses à trous et choix multiples, sur les 4 genres. Attention : 3 vies.</p>
        </div>
        <button type="button" className="btn-start" onClick={() => setLessonOpen(true)}>Démarrer la leçon ▶</button>
      </div>

      <Pager to="cases" items={PAGER_ITEMS} currentKey={active.key} />

      {/* Le moteur de leçon est partagé (aussi utilisé par les verbes) : cœurs, XP, enchaînement. */}
      {lessonOpen && (
        <LessonEngine
          questions={active.exos}
          title={active.label}
          accent="var(--accent-cases)"
          onClose={() => setLessonOpen(false)}
          onFinish={(xp) => addXp(xp)}
        />
      )}
    </section>
  );
}
