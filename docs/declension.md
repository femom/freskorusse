# Moteur de déclinaison

Fichier : `src/lib/declension.js`. Il décline un nom russe (nominatif singulier) aux 6 cas, au singulier
et au pluriel. Il sert à deux endroits : l'outil « Un mot dans les 6 cas » et les exemples des tableaux.

## Principe en trois niveaux
1. **Mots irréguliers** (`IRREGULAR`) : formes écrites à la main (человек, друг, мать, сестра, день...).
2. **Règles par type de déclinaison** : masculin dur, masculin en -й, -ий, -ь, féminin en -а, -я, -ья,
   -ия, -ь, neutre en -о, -е, -ие, -мя. Avec les règles d'orthographe (ы devient и après г, к, х, ж, ш, ч, щ ;
   -ем ou -ом après ж, ш, ч, щ, ц selon l'accent ; -ам/-ами/-ах pour les féminins en -жь, -шь, -чь, -щь).
3. **Avertissements** quand aucune règle ne permet de trancher.

## Ce que le moteur ne peut pas deviner
| Point | Pourquoi | Ce que fait l'outil |
|---|---|---|
| Accent tonique | врач donne врачом, мужем donne мужем | Réglage « la terminaison porte l'accent » (par défaut pour une courte liste de mots courants) |
| Voyelle mobile | отец donne отца, урок donne урока | Réglage proposé pour les mots en -ок, -ек, -ец, -ёк, -ень (valeur devinée) |
| Genre des mots en -ь | дверь est féminin, словарь masculin | Réglage « genre » (valeur devinée) |
| Animé ou inanimé | change l'accusatif | Réglage « personne ou objet » |
| Génitif pluriel avec voyelle mobile | окон, девушек, mais книг | Avertissement quand un groupe de consonnes final est possible |
| Pluriels irréguliers | друзья, дети, люди | Table `IRREGULAR` ; sinon le moteur applique la règle régulière |

## Mots refusés avec un message
Adjectifs (красный, новая), invariables (кофе, метро), pluriels connus (друзья renvoie vers друг),
mots autres que des lettres cyrilliques, mots en -ы, -и, -у, -ю, -э.

## Ajouter un mot irrégulier
Dans `IRREGULAR`, ajouter une entrée : le `type` de base, `animate` si le mot désigne un être animé,
et seulement les formes à corriger (`sg` et/ou `pl`). Le moteur génère le reste, puis calcule l'accusatif.
Ajouter ensuite le mot dans `tests/declension.test.js` avec ses formes complètes, vérifiées dans un dictionnaire.

## Fiabilité
Les 43 mots du tableau de `tests/declension.test.js` ont des formes relues une par une. Le moteur n'est pas
un dictionnaire : pour un mot hors de cette liste, l'outil affiche toujours un rappel de vérifier
dans un dictionnaire. Une relecture par un enseignant ou un locuteur natif reste recommandée avant diffusion large.
