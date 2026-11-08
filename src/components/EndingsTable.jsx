import React from "react";
import { genderLabels } from "../data/cases.js";
import { computeExample } from "../lib/caseExamples.js";
import FormText from "./FormText.jsx";

function Example({ spec, caseKey }) {
  const ex = computeExample(spec, caseKey);
  if (!ex) return null;
  return (
    <div className="ex-line">
      {ex.fixed ? <span className="form" lang="ru">{ex.text}</span> : <FormText form={ex.form} prefix={ex.prefix} />}
      <small className="ex-fr">({ex.fr})</small>
    </div>
  );
}

// Tableau principal d'un cas : Genre | Terminaison | Exemple.
// Une vraie <table> : les lecteurs d'écran annoncent la colonne et la ligne de chaque cellule.
export function EndingsTable({ caseKey, rows, caseLabel }) {
  return (
    <div className="table-wrap">
      <table className="case-table">
        <caption className="sr-only">Terminaisons du {caseLabel}, par genre et par nombre</caption>
        <thead>
          <tr>
            <th scope="col">Genre</th>
            <th scope="col">Terminaison</th>
            <th scope="col">Exemple</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <th scope="row" className={"gender-cell g-" + row.g}>
                {genderLabels[row.g]}
                {row.sub && <small>{row.sub}</small>}
              </th>
              <td className="ending-cell">{row.endsText}</td>
              <td><Example spec={{ ...row }} caseKey={caseKey} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// « Cas particuliers » : les terminaisons qui sortent du tableau principal,
// avec la raison (quand ?) et un exemple calculé.
export function SpecialEndingsTable({ caseKey, rows, caseLabel }) {
  return (
    <div className="table-wrap">
      <table className="case-table stack-mobile">
        <caption className="sr-only">Cas particuliers du {caseLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Terminaison</th>
            <th scope="col">Quand ?</th>
            <th scope="col">Exemples</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <th scope="row" className="ending-cell strong" data-label="Terminaison">{row.endsText}</th>
              <td data-label="Quand ?">{row.when}</td>
              <td data-label="Exemples">
                {row.examples.map((ex, j) => <Example key={j} spec={ex} caseKey={caseKey} />)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
