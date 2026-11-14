import React, { useEffect, useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { cases, caseColors } from "../data/cases.js";
import { prepositionTable } from "../data/caseExtras.js";
import { computeExample } from "../lib/caseExamples.js";
import { foldForSearch } from "../lib/text.js";
import { badgeColors } from "../lib/color.js";
import { Link, useRoute } from "../lib/router.jsx";
import CasesTabs from "../components/CasesTabs.jsx";
import FilterInput from "../components/FilterInput.jsx";
import FormText from "../components/FormText.jsx";

// Une ligne par couple (préposition, cas) : « в + accusatif », « в + prépositionnel »...
const ROWS = prepositionTable.flatMap((p) => p.uses.map((use) => ({ prep: p, use })));
const caseMeta = (key) => cases.find((c) => c.key === key);
// « о / об » devient ["о", "об"] : taper l'une ou l'autre retrouve la fiche.
const prepNames = (p) => p.ru.split(" / ").map(foldForSearch);

// Page « Prépositions et cas » : on part de la préposition vue dans une phrase et on trouve le cas.
// C'est le sens inverse des fiches de cas (qui listent les prépositions de CHAQUE cas).
export default function Prepositions() {
  const route = useRoute();
  const incoming = route.query.get("q") || "";
  const [filter, setFilter] = useState(incoming);
  // Arrivée depuis la recherche globale : #/cas/prepositions?q=в pré-remplit le filtre.
  useEffect(() => { if (incoming) setFilter(incoming); }, [incoming]);

  const q = foldForSearch(filter);
  // Si le texte saisi est exactement une préposition (« в »), on ne montre QUE celle-ci : sinon
  // la lettre « в » correspondrait à presque toutes les lignes. Sinon, recherche libre.
  const exactPreposition = !!q && prepositionTable.some((p) => prepNames(p).includes(q));
  const rows = useMemo(
    () =>
      ROWS.filter(({ prep, use }) => {
        if (!q) return true;
        if (exactPreposition) return prepNames(prep).includes(q);
        return foldForSearch(`${prep.ru} ${caseMeta(use.case).label} ${use.meaning} ${use.ex.fr}`).includes(q);
      }),
    [q, exactPreposition]
  );

  return (
    <section>
      <h1 className="title">Prépositions et cas</h1>
      <p className="subtitle">Tu lis une préposition dans une phrase ? Trouve ici le cas qu'elle demande.</p>
      <CasesTabs current="prepositions" />

      <div className="card often-with tip-card">
        <Lightbulb size={20} aria-hidden="true" />
        <div>
          <h2 className="mini-title">Mouvement ou lieu ?</h2>
          <p>
            Plusieurs prépositions (<b lang="ru">в, на, за, под</b>) changent de cas selon la question :
            <b> où va-t-on ?</b> (mouvement) demande l'accusatif, alors que <b>où est-on ?</b> (lieu) demande le prépositionnel
            avec <b lang="ru">в</b> et <b lang="ru">на</b>, et l'instrumental avec <b lang="ru">за</b> et <b lang="ru">под</b>.
          </p>
        </div>
      </div>

      <FilterInput
        label="Filtrer les prépositions"
        placeholder="Une préposition, un cas, un sens…"
        value={filter}
        onChange={setFilter}
        summary={`${rows.length} sur ${ROWS.length} associations préposition et cas`}
      />

      <div className="table-wrap">
        <table className="case-table prep-table stack-mobile">
          <caption className="sr-only">Prépositions russes, cas demandé, sens et exemple</caption>
          <thead>
            <tr>
              <th scope="col">Préposition</th>
              <th scope="col">Cas</th>
              <th scope="col">Sens</th>
              <th scope="col">Exemple</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ prep, use }) => {
              const meta = caseMeta(use.case);
              const col = caseColors[use.case].c;
              const ex = computeExample(use.ex, use.case);
              return (
                <tr key={prep.ru + use.case} className="case-scope" style={{ "--case-c": col }}>
                  <th scope="row" className="prep-cell" lang="ru" data-label="Préposition">{prep.ru}</th>
                  <td data-label="Cas">
                    <span className="case-pill" style={badgeColors(col)} aria-hidden="true">{meta.label.slice(0, 3)}.</span>
                    <Link to="cases" sub={use.case} className="case-link">{meta.label}</Link>
                  </td>
                  <td data-label="Sens">{use.meaning}</td>
                  <td data-label="Exemple">
                    <div className="ex-line">
                      <FormText form={ex.form} prefix={ex.prefix} />
                      <small className="ex-fr">({ex.fr})</small>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="full-note" role="status">Aucune préposition ne correspond à « {filter.trim()} ».</p>}
    </section>
  );
}
