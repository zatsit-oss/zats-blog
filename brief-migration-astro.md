# Migration blog Zatsit : Docusaurus → Astro

## Contexte

Le blog https://blog.zatsit.fr est aujourd'hui un Docusaurus découpé en deux repos :

- **Repo coque** : le projet Docusaurus (thème, config, layouts, pipeline de build).
- **Repo contenu** : uniquement les articles Markdown écrits par les consultants.

Un mécanisme de preview build le site complet (coque + contenu) et le déploie sur Firebase Hosting (canaux de preview par PR). Ce workflow doit être conservé à l'identique.

**Objectif** : migrer la coque vers Astro (version stable courante, ≥ 6) en gardant le découpage deux repos. Créer une branche `migration-astro` dans chacun des deux repos. Il faudra s'inspirer du projet zats-websites en local /Users/emmanuelperu/dev/zatsit/zats-websites

## Architecture cible

- **Repo coque** → projet Astro complet : layouts, composants, thème Zatsit, `content.config.ts` avec schémas Zod, intégrations, build et déploiement Firebase.
- **Repo contenu** → inchangé dans son rôle : uniquement `.md` + assets d'articles, zéro tooling Astro. Ajouter éventuellement une CI de validation du frontmatter (JSON Schema exporté depuis le schéma Zod de la coque).
- **Liaison** : checkout côte à côte en CI et en local. La collection utilise le loader `glob()` pointant vers `../<repo-contenu>/…`. Pas de submodule, pas de loader distant.
- **Preview** : PR sur le repo contenu → pipeline qui clone les deux repos, build la coque avec la branche de contenu, déploie via `firebase hosting:channel:deploy pr-<id>`.

## Stack blog (repo coque)

- Base : template blog officiel Astro (`npm create astro@latest -- --template blog`), habillé aux couleurs Zatsit.
- Content collections (Content Layer API) avec schéma Zod strict du frontmatter : `title`, `description`, `pubDate`, `author`, `tags`, `cover`, `draft`.
- `@astrojs/rss` + `@astrojs/sitemap`.
- `astro-expressive-code` : bouton copier, titres de fichiers, highlight de lignes, diff (parité avec Docusaurus).
- Pagefind : recherche statique indexée au build (remplace la recherche Docusaurus).
- `remark-reading-time` (ou plugin remark maison) : temps de lecture affiché.
- Images d'articles via `astro:assets` / `<Image>` (chemins relatifs depuis le repo contenu).
- Fonts via l'API Fonts native d'Astro 6+.
- Markdown pur (pas de MDX) pour garder les articles portables.

## Points de migration critiques

1. **Admonitions** : les articles utilisent la syntaxe Docusaurus `:::tip` / `:::warning` / `:::info` / `:::danger`. Implémenter `remark-directive` + un plugin remark custom qui transforme ces directives en HTML stylé. La syntaxe `:::` des articles existants doit rester valide telle quelle — ne PAS réécrire les articles.
2. **URLs / SEO** : conserver le mapping d'URLs Docusaurus (`/blog/<slug>` etc.). Vérifier les slugs générés par Astro et poser des redirects Firebase (`firebase.json`) pour toute URL qui change. Aucun lien existant ne doit casser.
3. **Pages à recréer** : listing paginé (via `paginate()`), pages tags (`/tags/[tag]`), pages auteurs si existantes, liens précédent/suivant entre articles, flux RSS, sitemap.
4. **Drafts** : champ `draft: true` filtré en build de prod, visible en preview.
5. **Frontmatter existant** : inventorier le frontmatter réel des articles du repo contenu et aligner le schéma Zod dessus (le schéma doit valider 100 % des articles existants sans modification de contenu, sinon documenter les corrections nécessaires).

## Travail attendu par repo (branches `migration-astro`)

**Repo coque :**
- Nouveau projet Astro remplaçant Docusaurus (ou dans un dossier dédié le temps de la transition, à ta discrétion).
- `content.config.ts` avec loader glob vers le repo contenu adjacent + schéma Zod.
- Layouts, pages, composants, styles Zatsit, intégrations listées ci-dessus.
- Plugin remark admonitions.
- Adaptation de la pipeline CI : build + deploy Firebase (prod et canaux de preview), en clonant les deux repos.
- README de dev : comment cloner les deux repos côte à côte et lancer le dev server.

**Repo contenu :**
- Aucune modification des articles sauf nécessité absolue (à documenter).
- CI de validation frontmatter (JSON Schema) sur PR.
- Adaptation du déclencheur de preview vers la nouvelle pipeline.

## Critères d'acceptation

- `npm run build` passe avec l'intégralité des articles existants, zéro erreur de schéma.
- Parité visuelle et fonctionnelle raisonnable avec le blog actuel (listing, article, tags, recherche, RSS, admonitions, code blocks avec copier).
- Toutes les URLs actuelles répondent (directement ou via redirect 301).
- Preview Firebase fonctionnelle sur PR de contenu.
- Aucun JS client superflu : uniquement Pagefind et les éventuels îlots nécessaires (objectif GreenIT, le poids de page doit être très inférieur à Docusaurus).
