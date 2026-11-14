# AGENTS.md : FreskoRusse

Application web statique et installable (PWA) pour apprendre le russe : cas, conjugaison,
banque de mots, phrases utiles, bibliothèque, dictée, traduction. 100 % hors-ligne.

## Stack
React 18, Vite 5, vite-plugin-pwa, lucide-react. Tests : Vitest + jsdom + Testing Library.
Aucune dépendance de routage ni d'UI : toute nouvelle dépendance doit être justifiée.

## Commandes
- `npm run dev` : serveur de développement
- `npm test` : tests (à lancer après CHAQUE modification)
- `npm run build` : build de production (vérifie aussi que tout compile)
- `npm run verify:offline` : contrôle le build (cache hors-ligne complet, aucune ressource externe, manifest)
- `npm run check` : tests + build + contrôle hors-ligne, à lancer avant de livrer

## Architecture en couches (ne pas sauter de couche)
| Couche | Dossier | Rôle |
|---|---|---|
| Données | `src/data/` | Contenu pédagogique. Ne jamais modifier sans demande explicite. |
| Logique | `src/lib/` | Routeur, hooks, couleurs, texte, voix, moteur de déclinaison. Aucun JSX métier. |
| Navigation | `src/navigation.js` | Source unique des modules (libellés, icônes, groupes, onglets). |
| Composants | `src/components/` | Éléments réutilisables (Sidebar, TabBar, GameShell, tableaux de cas...). |
| Pages | `src/pages/` | Un écran par module ; lit l'URL, affiche. |
| Orchestration | `src/App.jsx` | Assemble le tout. Pas de logique métier. |

## Règles
1. **Navigation = URL.** Chaque écran a une adresse `#/module/sous-élément` (voir `docs/navigation.md`).
   Un lien interne est un `<Link>` (vrai `<a href>`), jamais un `<div onClick>`.
2. **Ajouter un module** : une entrée dans `MODULES` (`navigation.js`), une route dans `ROUTES`
   (`lib/router.jsx`) et un cas dans `App.jsx`. Barre latérale, accueil, page « Plus » et recherche suivent seuls.
3. **DRY** : `shuffle`, `normalize`, `speak`, `GameShell`, `computeExample` existent déjà. Les réutiliser.
4. **Chiffres affichés** (nombre de verbes, de mots...) : dérivés des données, jamais écrits en dur.
5. **Pas de tiret cadratin (—) dans les textes français.** Utiliser « : », « , », « . » ou des parenthèses.
   Seule exception : la ponctuation russe entre deux mots cyrilliques. `tests/no-em-dash.test.js` le vérifie.
6. **Déclinaisons** : une seule source de vérité, `src/lib/declension.js`. Les tableaux des cas
   (`caseInfo` dans `src/data/cases.js`) décrivent des mots exemples que l'interface décline avec ce moteur ;
   `tests/cases-data.test.js` échoue si une terminaison annoncée n'existe pas dans la forme calculée.
   Voir `docs/declension.md` pour les limites et pour ajouter un mot irrégulier.
7. **Accessibilité** : contraste AA (texte 4,5:1, icônes 3:1), cibles tactiles >= 44 px, tout contrôle
   atteignable au clavier, tableaux avec `<caption>` et `<th scope>`, `prefers-reduced-motion` respecté.
   Pour du texte coloré, utiliser les variables CSS `--*-text`, `--case-text`, `--on-accent` ou les fonctions
   `badgeColors()` / `legible()`, jamais une couleur d'accent brute.
8. **États d'écran** : toute liste filtrable gère « aucun résultat » ; toute série de jeu gère victoire,
   défaite et abandon (confirmation). Les données étant locales, il n'y a ni chargement ni erreur réseau.
9. **Sécurité** : pas de secret dans le code ; `dangerouslySetInnerHTML` uniquement sur du contenu statique
   de `src/data/` (jamais sur une saisie utilisateur ni sur l'URL). La saisie de l'outil « un mot » est
   normalisée et validée (lettres cyrilliques seulement) avant tout calcul.
10. **Stockage** : clés `localStorage` existantes (`russe_app_xp`, `freskorusse_theme`) à ne pas renommer.
11. **PWA** : tout passe par `src/lib/pwa.js` (installation, mises à jour, réseau). Aucune ressource externe
    (police, image, API) : elle casserait le hors-ligne. Une mise à jour ne doit jamais interrompre un exercice
    (`setBusy` dans `GameShell`). Voir `docs/pwa.md`.
12. **Sons** : `src/lib/sound.js` uniquement, synthétisés (pas de fichier audio), volume bas, toujours
    déclenchés par un geste de l'utilisateur, toujours coupables.
13. **Affichage** : ne pas retirer `color-scheme` (bandes blanches en thème sombre) ni le masquage des barres de
    défilement (demande produit : aucune barre visible). Les champs de filtre passent par `FilterInput`.
14. **Contenu des cas** : le contenu d'origine (`cases.js`) ne se modifie pas ; les ajouts vont dans
    `caseExtras.js` et sont vérifiés par `tests/case-extras.test.js`. Une phrase de reconnaissance doit avoir un
    cas déterminé sans ambiguïté par le contexte, avec un indice. Voir `docs/cases-content.md`.
15. **Audio** : tout bouton « écouter » passe par `SpeakButton` (il explique quand le son est impossible).
16. **Commits** : Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).

## Avant de rendre un travail
`npm test` vert, `npm run build` OK, parcours manuel sur mobile (barre d'onglets, retour arrière) et sur desktop.
