import React from "react";

// Affiche un encadré "règle" : un titre et une liste de points expliqués en français.
// Utilisé pour la règle dur/mou sur la page des cas, mais réutilisable ailleurs
// si on ajoute d'autres explications transversales plus tard.
export default function RuleBox({ title, points, collapsible }){
  const content = (
    <div className="card usage-card rule-box">
      {title && <h4 className="rule-title">{title}</h4>}
      {points.map((p,i)=>(
        // Le HTML est autorisé ici (balises <b>) car le contenu vient de nos propres
        // données statiques, jamais d'une saisie utilisateur.
        <p key={i} dangerouslySetInnerHTML={{__html:p}}/>
      ))}
    </div>
  );

  if(!collapsible) return content;

  // Version repliable : pratique pour rappeler la règle sur chaque page de cas
  // sans répéter tout le texte à l'écran par défaut.
  return (
    <details className="rule-details">
      <summary>{title}</summary>
      {content}
    </details>
  );
}
