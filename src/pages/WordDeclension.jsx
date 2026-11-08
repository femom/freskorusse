import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Info, Search } from "lucide-react";
import { cases, caseColors, caseAbbr } from "../data/cases.js";
import { decline, CASES } from "../lib/declension.js";
import { Link, navigate, useRoute } from "../lib/router.jsx";
import { badgeColors } from "../lib/color.js";
import FormText from "../components/FormText.jsx";
import CasesTabs from "../components/CasesTabs.jsx";

const QUICK_WORDS = ["книга", "студент", "окно", "неделя", "дверь", "учитель", "брат", "сестра", "дом", "лес", "время", "человек"];
const DEFAULT_WORD = "книга";
const NO_OVERRIDE = { animate: null, gender: null, stressed: null, fleeting: null };

// Lit les réglages mémorisés dans l'adresse (#/cas/mot?m=книга&a=1...).
function readQuery(query) {
  const flag = (k) => (query.get(k) === "1" ? true : query.get(k) === "0" ? false : null);
  const g = query.get("g");
  return {
    word: query.get("m") || DEFAULT_WORD,
    ov: { animate: flag("a"), gender: g === "M" || g === "F" ? g : null, stressed: flag("s"), fleeting: flag("f") },
  };
}

function buildQuery(word, ov) {
  const q = { m: word };
  if (ov.animate !== null) q.a = ov.animate ? "1" : "0";
  if (ov.gender !== null) q.g = ov.gender;
  if (ov.stressed !== null) q.s = ov.stressed ? "1" : "0";
  if (ov.fleeting !== null) q.f = ov.fleeting ? "1" : "0";
  return q;
}

const ACC_BADGE = { nom: "= nominatif", gen: "= génitif" };

function Cell({ form, badge, children }) {
  if (!form) return <span className="muted">peu employé</span>;
  return (
    <div className="decl-cell">
      <FormText form={form} />
      {badge && <small className="decl-badge">{badge}</small>}
      {children}
    </div>
  );
}

// Outil « Un mot dans les 6 cas » : on saisit un nom, on voit ses 12 formes (6 cas x 2 nombres)
// avec la terminaison mise en évidence, les règles appliquées et les points à vérifier.
export default function WordDeclension() {
  const route = useRoute();
  const fromUrl = useMemo(() => readQuery(route.query), [route.hash]);
  const [word, setWord] = useState(fromUrl.word);
  const [ov, setOv] = useState(fromUrl.ov);

  // Retour arrière / lien partagé : l'adresse redevient la source de vérité.
  useEffect(() => {
    setWord(fromUrl.word);
    setOv(fromUrl.ov);
  }, [fromUrl]);

  const result = useMemo(() => decline(word, ov), [word, ov]);

  // L'adresse n'est mise à jour qu'à la validation : on ne pollue pas l'historique à chaque lettre.
  function commit(nextWord, nextOv) {
    navigate("cases", "mot", { replace: true, keepScroll: true, query: buildQuery(nextWord.trim(), nextOv) });
  }
  function submit(e) {
    e.preventDefault();
    commit(word, ov);
  }
  function pick(w) {
    setWord(w);
    setOv(NO_OVERRIDE);
    commit(w, NO_OVERRIDE);
  }
  function change(patch) {
    const next = { ...ov, ...patch };
    setOv(next);
    commit(word, next);
  }
  // Changer de mot remet les réglages à leurs valeurs par défaut (elles dépendent du mot).
  function onWordChange(value) {
    setWord(value);
    setOv(NO_OVERRIDE);
  }

  const options = result.ok ? result.options : null;

  return (
    <section>
      <h1 className="title">Un mot dans les 6 cas</h1>
      <p className="subtitle">Écris un nom russe et vois comment il change à chaque cas, au singulier et au pluriel.</p>
      <CasesTabs current="word" />

      <form className="word-form card" onSubmit={submit}>
        <label htmlFor="word-input" className="field-label">Nom russe au nominatif singulier</label>
        <div className="word-input-row">
          <input
            id="word-input"
            className="answer-input word-input"
            lang="ru"
            type="text"
            value={word}
            onChange={(e) => onWordChange(e.target.value)}
            placeholder="par exemple : книга"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button type="submit" className="btn-primary ready word-submit"><Search size={16} aria-hidden="true" /> Décliner</button>
        </div>
        <div className="quick-words" role="group" aria-label="Mots à essayer">
          <span className="quick-label">Essaie :</span>
          {QUICK_WORDS.map((w) => (
            <button type="button" key={w} className="chip chip-button" lang="ru" onClick={() => pick(w)}>{w}</button>
          ))}
        </div>

        {result.ok && (
          <div className="word-options">
            <fieldset className="seg">
              <legend>Ce mot désigne</legend>
              <label className={!options.animate ? "on" : ""}>
                <input type="radio" name="animate" checked={!options.animate} onChange={() => change({ animate: false })} /> un objet, une idée (inanimé)
              </label>
              <label className={options.animate ? "on" : ""}>
                <input type="radio" name="animate" checked={!!options.animate} onChange={() => change({ animate: true })} /> une personne, un animal (animé)
              </label>
            </fieldset>

            {result.controls.gender && (
              <fieldset className="seg">
                <legend>Genre du mot en -ь</legend>
                <label className={options.gender === "F" ? "on" : ""}>
                  <input type="radio" name="gender" checked={options.gender === "F"} onChange={() => change({ gender: "F" })} /> féminin (дверь, ночь)
                </label>
                <label className={options.gender === "M" ? "on" : ""}>
                  <input type="radio" name="gender" checked={options.gender === "M"} onChange={() => change({ gender: "M" })} /> masculin (словарь, учитель)
                </label>
              </fieldset>
            )}

            {result.controls.stressed && (
              <label className="check">
                <input type="checkbox" checked={!!options.stressed} onChange={(e) => change({ stressed: e.target.checked })} />
                <span>La terminaison porte l'accent (врачом, словарём, землёй)</span>
              </label>
            )}
            {result.controls.fleeting && (
              <label className="check">
                <input type="checkbox" checked={!!options.fleeting} onChange={(e) => change({ fleeting: e.target.checked })} />
                <span>Le mot perd sa voyelle quand on ajoute une terminaison (отец → отца)</span>
              </label>
            )}
          </div>
        )}
      </form>

      <div aria-live="polite">
        {!result.ok && (
          <div className="word-message" role="status">
            <Info size={18} aria-hidden="true" />
            <p>{result.message}</p>
          </div>
        )}
      </div>

      {result.ok && (
        <>
          <div className="word-head">
            <h2 className="word-title" lang="ru">{result.word}</h2>
            <p className="word-type">{result.typeLabel}</p>
          </div>

          <div className="table-wrap">
            <table className="case-table decl-table">
              <caption className="sr-only">Déclinaison de {result.word} aux six cas</caption>
              <thead>
                <tr>
                  <th scope="col">Cas</th>
                  <th scope="col">Singulier</th>
                  <th scope="col">Pluriel</th>
                </tr>
              </thead>
              <tbody>
                {CASES.map((c) => {
                  const meta = cases.find((x) => x.key === c);
                  const col = caseColors[c].c;
                  return (
                    <tr key={c} className="case-scope" style={{ "--case-c": col }}>
                      <th scope="row" className="case-name-cell">
                        <span className="case-pill" style={badgeColors(col)} aria-hidden="true">{caseAbbr[c]}</span>
                        <span className="case-name">
                          <Link to="cases" sub={c}>{meta.label}</Link>
                          <small lang="ru">{meta.questions}</small>
                        </span>
                      </th>
                      <td>
                        <Cell form={result.sg[c]} badge={c === "acc" && result.accSgFrom ? ACC_BADGE[result.accSgFrom] : null}>
                          {c === "pre" && result.loc && (
                            <div className="ex-line"><small>Après в ou на :</small> <FormText form={result.loc} /></div>
                          )}
                        </Cell>
                      </td>
                      <td>
                        <Cell form={result.pl[c]} badge={c === "acc" && result.pl[c] ? ACC_BADGE[result.accPlFrom] : null} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {result.warnings.map((w, i) => (
            <div className="word-note warn" role="note" key={i}>
              <AlertTriangle size={18} aria-hidden="true" />
              <p>{w}</p>
            </div>
          ))}
          {result.notes.map((n, i) => (
            <div className="word-note" role="note" key={i}>
              <Info size={18} aria-hidden="true" />
              <p>{n}</p>
            </div>
          ))}

          {result.rules.length > 0 && (
            <div className="card usage-card">
              <h3 className="mini-title">Pourquoi ces terminaisons ?</h3>
              <ul className="plain-list">
                {result.rules.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </>
      )}

      <p className="disclaimer">
        Cet outil applique les règles de la grammaire russe. Il peut se tromper sur les mots irréguliers
        (accent tonique, voyelle mobile, pluriels particuliers) : en cas de doute, vérifie dans un dictionnaire.
      </p>
    </section>
  );
}
