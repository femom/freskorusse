# Application installable (PWA) : hors-ligne, installation, mises à jour, sons

Code : `src/lib/pwa.js`, `src/lib/sound.js`, `vite.config.js`, `scripts/verify-offline.mjs`.

## Hors-ligne
Le service worker (généré par vite-plugin-pwa) met en cache TOUS les fichiers de l'app à la première visite
en ligne : page, JavaScript, CSS, icônes, manifest. Ensuite, l'app s'ouvre sans réseau. Le routage se fait avec
`#`, donc toute adresse retombe sur `index.html`. Les voix de la dictée viennent de l'appareil (pas du réseau).

Règle : aucune ressource externe (polices Google, images distantes, API). Une seule suffirait à casser
le hors-ligne. `npm run verify:offline` le vérifie.

L'utilisateur est informé : notification « Prêt, fonctionne sans connexion » à la première installation,
état dans la page Plus et la barre latérale, pastille « Hors-ligne » quand la connexion est perdue.

## Bouton « Télécharger l'application »
Toujours visible (barre latérale à côté du thème sur PC, page Plus sur mobile), sauf si l'app est déjà installée.
- Le navigateur propose l'installation (Chrome, Edge, Android) : un clic lance l'invite native. L'événement
  `beforeinstallprompt` est capturé dès l'import du module, avant l'affichage de React, pour ne pas le perdre.
- Sinon (Safari, Firefox, invite pas encore disponible) : une fenêtre donne les étapes de l'appareil
  (iPhone, Android, ordinateur, Safari Mac, Firefox).

## Mises à jour automatiques
1. À chaque démarrage, au retour de la connexion (`online`), au retour au premier plan et toutes les 30 minutes,
   l'app demande au navigateur s'il existe une nouvelle version (jamais plus d'une fois toutes les 30 secondes).
2. Si oui, le service worker la télécharge et ATTEND (`registerType: "prompt"`).
3. `pwa.js` l'active dès qu'aucun exercice n'est ouvert, puis la page se recharge. Un exercice en cours
   n'est jamais interrompu : la mise à jour attend sa fermeture (délai de 400 ms pour laisser l'XP s'enregistrer).
4. Après le rechargement, une notification annonce « FreskoRusse vient d'être mis à jour ».

Hors connexion, rien n'est tenté. Au retour du réseau, la vérification repart. La progression (XP), le thème et
la dernière page sont dans `localStorage` : ils survivent aux mises à jour.

## Sons
Synthétisés avec Web Audio (aucun fichier audio : rien à télécharger ni à mettre en cache). Volume bas,
activés par défaut, interrupteur mémorisé (barre latérale à côté du thème, page Plus).
Événements : bonne réponse, mauvaise réponse, série réussie, plus de vies, début de série, carte retournée,
choix d'une réponse, interrupteurs. Ajouter un son : une entrée dans `SOUNDS` puis `play("nom")` dans un geste
de l'utilisateur (les navigateurs interdisent le son sans geste).

## Tester sur un vrai appareil (à faire après chaque déploiement important)
1. Ouvrir l'app en ligne, attendre la notification « Prêt, fonctionne sans connexion ».
2. Passer en mode avion, fermer puis rouvrir l'app, naviguer, lancer une leçon : tout doit marcher.
3. Déployer une nouvelle version, rouvrir l'app en ligne : elle se recharge seule et annonce la mise à jour.
4. Pendant un exercice, déployer : l'exercice n'est pas coupé ; la mise à jour s'applique à sa fermeture.

## Limites connues
- Safari (iPhone, Mac) et Firefox n'ont pas d'invite d'installation automatique : d'où la fenêtre d'aide.
- Firefox sur ordinateur n'installe pas les applications web (le hors-ligne fonctionne quand même après une visite).
- Le service worker n'existe que dans la version construite (`npm run build`), pas avec `npm run dev`.
- En l'ouvrant depuis un fichier (`file://`), aucun service worker : il faut un serveur (http, https ou localhost).
