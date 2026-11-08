# Navigation : décisions et fonctionnement

## Problèmes de la v2 (avant refonte)
- Impossible de revenir à la liste depuis un cas/verbe sur desktop.
- Aucune URL : le bouton Retour (navigateur/téléphone) quittait l'app, un rafraîchissement renvoyait à l'accueil.
- Mobile : tout derrière un menu hamburger ; bouton « ⋯ » inutile ; progression cachée.
- Cartes cliquables en `<div>` (invisibles au clavier et aux lecteurs d'écran).
- Recherche limitée à la barre latérale, résultats menant au module et non à l'élément.

## Solution
| Besoin | Mécanisme | Notion |
|---|---|---|
| Retour natif, liens partageables, rafraîchissement | Routeur par hash maison (`src/lib/router.jsx`) | État dans l'URL (deep linking) |
| Navigation à portée du pouce | Barre d'onglets en bas : Accueil · Cas · Verbes · Mots · Plus | Loi de Fitts, zone du pouce |
| Orientation sur desktop | Barre latérale regroupée (Apprendre / Pratiquer / Consulter) + fil d'Ariane + Précédent/Suivant | Architecture de l'information |
| Trouver vite | Palette de recherche (`/` ou Ctrl/Cmd+K), résultats groupés qui ouvrent l'élément | Pattern ARIA combobox + listbox |
| Jeux sans perte accidentelle | `<dialog>` natif + confirmation de sortie | Piège de focus natif, prévention d'erreur |

## Adresses
| Écran | URL |
|---|---|
| Accueil | `#/` |
| Cas / un cas | `#/cas` · `#/cas/acc` |
| Verbes / un verbe | `#/verbes` · `#/verbes/byt` |
| Mots (avec filtre) | `#/mots` · `#/mots?q=привет` |
| Phrases (catégorie, phrase) | `#/phrases/logement` · `#/phrases/logement?id=3` |
| Bibliothèque (texte) | `#/bibliotheque` · `#/bibliotheque/0` |
| Un mot dans les 6 cas | `#/cas/mot` · `#/cas/mot?m=книга&a=0` |
| Dictée · Traduction · Plus | `#/dictee` · `#/traduction` · `#/plus` |

Une route inconnue retombe sur l'accueil. Un sous-élément inconnu affiche la liste du module.

## Défilement et focus
Après chaque changement d'écran (voir `App.jsx`) :
- clic sur un lien → haut de page, focus sur le titre (annonce lecteur d'écran) ;
- Retour/Avant → position de défilement retrouvée ;
- changement de filtre (onglets de catégories) → rien ne bouge, l'historique est remplacé.

## Pourquoi un hash plutôt que `/cas/acc` ?
App statique et installable, déployable dans n'importe quel sous-dossier (`base: "./"`) : le hash ne
demande aucune règle de réécriture serveur et fonctionne hors-ligne.

## Tests
`tests/app.test.jsx` rejoue les parcours critiques (liste → détail → retour natif, onglets, recherche,
URL de bibliothèque/phrases/mots, confirmation de sortie des jeux). `tests/lib.test.js` couvre le routeur,
les contrastes et les utilitaires.
