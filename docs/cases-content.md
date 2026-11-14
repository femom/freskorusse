# Module « Les cas » : contenus et garde-fous

## Où est quoi
| Fichier | Contenu |
|---|---|
| `src/data/cases.js` | Contenu d'origine : usages, phrases d'exemple (une par genre), exercices de la leçon de chaque cas, description des tableaux. |
| `src/data/caseExtras.js` | Ajouts : exemples supplémentaires, phrases de reconnaissance, table des prépositions. |
| `src/lib/declension.js` | Moteur de déclinaison (voir `docs/declension.md`). |
| `src/lib/recognition.js` | Transforme les phrases de reconnaissance en questions du moteur de leçon. |

Vues : `#/cas` (cartes, entraînement, récapitulatif), `#/cas/<cas>` (détail), `#/cas/mot` (un mot dans les 6 cas),
`#/cas/prepositions` (quelle préposition, quel cas ?, avec `?q=` pour pré-filtrer).

## Les trois entraînements
1. **Produire** : leçon de chaque cas (texte à trous, QCM de forme). Contenu d'origine.
2. **Reconnaître** : « dans quel cas est le mot souligné ? », 6 choix toujours dans l'ordre canonique,
   12 phrases tirées au hasard, chaque réponse expliquée par un indice.
3. **Retrouver** : depuis une préposition lue dans une phrase vers le cas qu'elle demande.

## Ajouter une phrase de reconnaissance
Dans `recognitionItems` : `case`, `lemma`, `n`, `before`, `word`, `after`, `fr`, `hint`.
Règles :
- Le contexte doit déterminer le cas **sans ambiguïté** (préposition, verbe, rôle de sujet). Beaucoup de formes
  se ressemblent (книги, окна, чай...), c'est le contexte qui tranche : l'indice doit le dire.
- Le mot souligné est la forme exacte du cas annoncé : `tests/case-extras.test.js` la recalcule avec le moteur.
- Pour un locatif (в лесу), ajouter `loc: true`. Pour un être animé à l'accusatif, `animate: true`.
- Vocabulaire simple, déjà vu dans l'app autant que possible.

## Ajouter un exemple ou une préposition
`extraExamples` : même format que `cases[].examples`, plus un objet de vérification `{ lemma, n, animate? }`.
`prepositionTable` : `ex` décrit un exemple calculé par le moteur et `expect` la phrase attendue, écrite à la main.
Si le moteur et la phrase écrite à la main divergent, le test échoue : l'un des deux est faux, il faut trancher
avec un dictionnaire.

## Ce que les tests garantissent (et ne garantissent pas)
Garanti : chaque forme affichée est cohérente avec le moteur, chaque terminaison annoncée existe, aucune préposition
d'un cas ne contredit la table, aucun tiret cadratin. Non garanti : le sens et le naturel d'une phrase russe.
Les phrases ajoutées sont volontairement simples, mais une relecture par un enseignant ou un locuteur natif reste
recommandée avant diffusion large.
