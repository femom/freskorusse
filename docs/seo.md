# SEO de FreskoRusse

Notion : le **SEO** (Search Engine Optimization) aide les moteurs de recherche et les IA à comprendre
de quoi parle une page, pour la proposer à la bonne requête. Aucun réglage ne garantit un classement.

## Ce qui est en place (`index.html`, `public/`)
- `title` et `meta description` : annoncent « application pour apprendre le russe » (le mot « Fresko » seul évoque une fresque).
- `link rel="canonical"` : l'adresse officielle du site. **À changer** quand le domaine `freskorusse.com` sera acheté.
- Open Graph et Twitter Card : aperçu lors d'un partage de lien.
- JSON-LD `WebApplication` : dit explicitement aux moteurs et aux IA ce qu'est FreskoRusse.
- Contenu de secours dans `#root` : texte lisible par les robots sans JavaScript, remplacé par React au démarrage.
- `robots.txt` et `sitemap.xml` : à déclarer dans Google Search Console.
- Balise `google-site-verification` : preuve de propriété du site pour la Search Console.

## Limite connue
Le routage par `#` (`#/verbes`) donne **une seule adresse indexable**. Pour que chaque module ait sa
propre page dans Google, il faudra des chemins réels (`/verbes`) et une pré-génération (SSG).

## Après chaque mise en ligne
1. Search Console : « Inspection de l'URL » puis « Demander une indexation ».
2. Soumettre `sitemap.xml` (Indexation, Sitemaps).
3. Au changement de domaine : mettre à jour `canonical`, `og:url`, `og:image`, JSON-LD, `robots.txt`, `sitemap.xml`.
