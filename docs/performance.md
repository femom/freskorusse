# Performance sur mobile

Notion : un site fluide se joue surtout dans le **rendu** (peinture et composition), pas seulement dans le poids du JavaScript.

## Mode léger (fin de `src/styles.css`)
Sur écran étroit (moins de 1024 px) ou tactile (`pointer: coarse`) :
- plus de `backdrop-filter` (flou du verre, très coûteux à chaque image du défilement) : fonds pleins à la place ;
- ombres larges remplacées par des ombres courtes (variable `--glass-shadow`) ;
- la mise en page, les couleurs et la version desktop ne changent pas.

## Mesure indicative (Chromium sans carte graphique, défilement scripté de la liste des verbes, 390 px)
- Travail de rastérisation : environ 80 ms avant, environ 24 ms après (environ -70 %).
- Ce n'est pas un test sur téléphone réel : à refaire sur ton appareil (Chrome DevTools, onglet Performance, ou Lighthouse en mode mobile).

## Pistes si ce n'est pas encore assez fluide
- Charger les pages à la demande (`React.lazy`) : le JavaScript fait environ 134 ko compressés, en un seul fichier.
- Limiter le nombre de cartes affichées d'un coup dans les longues listes (liste des verbes, banque de mots).
