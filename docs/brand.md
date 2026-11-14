# Direction artistique : FreskoRusse

## Concept
Ludique mais adulte. Une app d'apprentissage moderne et colorée, avec une signature : **les cubes de l'alphabet russe**
(А, Б, В...) sur des taches pastel. Deux thèmes qui se répondent (même famille de teintes) :
- **Lavande** (clair, thème principal) ;
- **Nuit prune** (sombre).

Le style de surface est le **verre** (façon iOS) : liseré fin translucide, reflet lumineux en haut, ombre douce,
flou de ce qui passe derrière. Il remplace les contours noirs épais de la première maquette.
Ce qui ne change pas : formes très arrondies, pastels, cubes de lettres, cartes colorées, ton enjoué.

## Confort visuel (demande produit)
Contrastes volontairement adoucis, sans jamais descendre sous l'AA :
| Élément | Clair (Lavande) | Sombre (Nuit prune) |
|---|---|---|
| Texte principal / fond | 10,7:1 | 12,2:1 |
| Texte secondaire | 5,7:1 | 8,3:1 |
| Texte pâle (petites mentions) | 4,7:1 | 5,9:1 |
| Texte sur pastels et boutons | 7:1 et plus | 7:1 et plus |
Le blanc pur et le noir pur sont bannis : blanc cassé `#FAF8FF`, encre indigo `#2E2A47`, crème `#E6DFEC`.
`tests/theme.test.js` fixe ces seuils : AA minimum (4,5:1) ET plafond de 13:1 pour le texte principal (pas d'agressivité).

## Palette
| Rôle | Lavande | Nuit prune |
|---|---|---|
| Fond | `#ECE8F7` | `#211B2E` |
| Carte | `#FAF8FF` | `#2E2740` |
| Barre de navigation | `#FAF8FF` | `#282135` |
| Texte | `#2E2A47` | `#E6DFEC` |
| Texte secondaire | `#5C5878` | `#B4A9C7` |
| Texte pâle | `#68647F` | `#9A8EB0` |
| Bouton principal | encre sur blanc cassé | crème sur prune |
| Bordure de champ (3:1) | `#7F799C` | `#9488B0` |
| Citron | `#D8EA55` | `#D3E563` |
| Lilas | `#C2B6F2` | `#B4A5EC` |
| Beurre | `#F6E0A4` | `#F0DA9C` |
| Rose | `#F5C6DB` | `#F2C0D6` |
| Menthe | `#B8E3CB` | `#B0DCC3` |
Couleurs des 6 cas (inchangées) : bleu, vert, orange, rouge, violet, turquoise. Leur version « texte » est
dérivée par `color-mix` avec l'encre du thème, au pourcentage `--mix` (50 %) : contraste minimum 4,76:1.

## Verre : recette
`border: 1px solid var(--glass-line)` + `box-shadow: var(--glass-hi), var(--glass-shadow)`. Flou
(`backdrop-filter`) réservé aux surfaces qui ont quelque chose derrière : barres du haut et du bas, boîtes de dialogue,
notifications, cartes de l'accueil. Pas de flou sur les tableaux ni les longues listes (lisibilité et performance).
Repli sans flou pour les navigateurs qui ne le gèrent pas. Les champs de saisie gardent une bordure plus marquée
(`--field-border`, 3:1) : un champ doit rester repérable.

## Typographie
**Onest** (latin + cyrillique), poids 400, 600, 700, 800, embarquée via `@fontsource/onest` (88 Ko, précachée par
le service worker : le design est identique hors-ligne). Le russe d'apprentissage est toujours en police d'impression :
jamais de police manuscrite pour le contenu à apprendre.

## Accueil
Salutation « Привет ! », 4 pastilles (XP, jours de suite, leçons faites, mots vus), carte « Reprendre » (dernier écran
visité) avec les cubes de lettres, « Pour toi » (4 recommandations), carte « Série » (7 jours de la semaine), « Défi du
jour » (ouvre l'exercice de reconnaissance), puis tous les modules. Statistiques : `src/lib/stats.js`, stockées
sur l'appareil seulement.

## À faire ensuite (phases suivantes)
1. Habiller les autres écrans (leçons, tableaux, outil « un mot ») avec les mêmes surfaces en verre et les cubes de lettres.
2. Barre de progression sur « Reprendre » : demande d'enregistrer la progression par leçon (non suivie aujourd'hui).
3. Illustrations de fin de série (autocollants, « Correct ! » façon bulle) : touches comics supplémentaires.
