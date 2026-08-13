# Où en est la migration

Note de reprise, mise à jour le 13 août 2026. À supprimer une fois la migration terminée.

Branche `migration-astro` dans **les deux** repos.

## Le prochain geste

Phase 3, suite. La route d'article est faite ; l'ossature du site ne l'est pas.

Dans l'ordre :

1. **`Header` et `Footer`**, absents. C'est ce qui manque le plus visiblement en local : aucune navigation, aucun pied de page, et la bascule de thème n'existe pas (le thème suit `prefers-color-scheme` sans pouvoir être changé à la main).
2. **Le listing paginé**, qui remplace `src/pages/index.astro`, aujourd'hui une simple table de contrôle.
3. Tags, `/archive/`, `/authors/`, 404.
4. Admonitions (`:::info`, rendues en texte brut pour l'instant), thème Shiki accordé aux jetons, bouton copier.
5. RSS, Pagefind.

Puis la vérification des URLs contre les 45 routes de `migration-routes-docusaurus.txt`.

À ne pas oublier : **importer `base.css`** du design system, il porte `.btn-primary`, `.card`, `.tag`, `.glass`.

Le gabarit de référence, si besoin (à lire, pas à copier : il vient avec ses propres styles) :

```bash
npm create astro@latest /tmp/scaffold -- --template blog --no-install --no-git --skip-houston --yes
```

## Fait

- **Plan** : `PLAN-MIGRATION.md`, D1-D5 et P1-P6 tous arbitrés.
- **Référence** : les 45 routes dans `migration-routes-docusaurus.txt`, et le build complet archivé dans `/Users/emmanuelperu/dev/zatsit/blog/docusaurus-reference-build`. Seule référence visuelle restante. `npx serve` dessus pour comparer.
- **Contenu normalisé** : 19/19 articles en `YYYY-MM-DD-slug/index.md`, marqueurs `truncate` complets. Le build Docusaurus repassait et le diff des 45 routes était vide.
- **Socle Astro 7.2.0** : jetons du design system, Poppins via l'API Fonts native, `global.css` sans aucun hexadécimal brut, `BaseHead` avec OG complet et script de thème anti-flash.
- **Garde-fous qualité** : `.claude/rules/quality.md`, les skills `wcag-check`, `eco-check` et `accessibility-a11y`, et deux commandes qui sortent en erreur, `npm run check:a11y` et `npm run check:eco`. Ligne de base Docusaurus mesurée dans `.claude/skills/eco-check/references/baseline-docusaurus.md`.
- **Le build passe.** 19 articles, 19 dates résolues, 12 auteurs. `ShareLinks` remplace le boilerplate de partage, `POSTING.md` est à jour.
- **Route d'article** (`src/pages/[...slug].astro` + `src/layouts/BlogPost.astro`) : les 19 articles sont rendus à la racine, en `/<slug>/`. En-tête avec date française, temps de lecture, auteurs résolus depuis `authors.yml`, tags cliquables ; `<head>` avec `article:published_time`, `article:author`, `article:tag` et une description dérivée du bloc `<!-- truncate -->`. Utilitaires partagés dans `src/utils/posts.ts`, que le listing et le RSS réutiliseront.
- **`astro check` installé et au vert.** Il n'était pas dans les dépendances, donc jamais exécuté. Trois erreurs réelles à sa première exécution : `z.record()` exige désormais les schémas de clé et de valeur, et `Astro.props` n'était pas typé dans la route.

## Mesures du 13 août 2026, sur les 19 articles rendus

| | Docusaurus (45 pages) | Astro (20 pages) |
|---|---|---|
| Poids initial | 243 à 3 324 ko | **56,5 à 68,0 ko** |
| Requêtes | 5 à 16 | **10 partout** |
| Pages sous le budget de 1 Mo au total | 0 / 45 | **16 / 20** |
| Contrastes vérifiés | 0 | 16, deux thèmes, au vert |

L'écart qui compte n'est pas la médiane mais l'amplitude : 12 ko de dispersion sur tout le corpus, contre un facteur 13 sous Docusaurus. Le plancher du framework a disparu.

Les quatre pages hors budget total le sont à cause d'images non redimensionnées. Voir la dette 2 plus bas.

## Trois pièges déjà payés, à ne pas réintroduire

1. **`glob()` dérive l'`id` du `slug` du frontmatter**, pas du chemin. Le repli de date doit lire `entry.filePath`. Avec `id`, les 12 articles sans date en frontmatter échouent.
2. **`authors.yml` est un seul document de 12 profils.** Il faut `file()` avec un parseur YAML ; `glob()` le charge comme une entrée unique et la validation Zod échoue sur `name: Required`.
3. **`context.store.set()` est ignoré si le digest de l'entrée n'a pas changé.** Modifier une donnée dérivée sans toucher au fichier source ne s'écrit donc pas. Faire `delete()` puis `set()`. Corollaire de méthode : une garde doit vérifier **l'état final du store**, pas le fait d'avoir tenté l'écriture.

## Deux dettes mesurées, à traiter en phase 3

1. **Polices** : `astro.config.mjs` déclare 7 graisses × 2 styles, soit 14 woff2. Sur la page de contrôle, elles représentent **112 ko sur 121 ko et 14 requêtes sur 18** : la quasi-totalité du poids. La règle éco en autorise 3. C'est le gain le plus rentable disponible.
2. **Images du repo contenu.** `astro:assets` les réencode automatiquement (`devlille-2026` passe de 10,8 à 5,5 Mo) mais **ne les redimensionne pas** : sans largeur déclarée, une photo de 4 000 px reste une photo de 4 000 px. Quatre pages restent hors du budget de 1 Mo : `devlille-2026` (5 515 ko), `green-exploitation-miniere` (2 849 ko), `ia-et-consommation-energetique` (1 977 ko), `entreprise-a-mission` (1 287 ko). Le correctif est des images responsives avec largeurs explicites, ou des sources plus petites dans le dépôt de contenu. Atténuation en place : ces images sont en `loading="lazy"`, donc hors du poids de première visite.

3. **Les helpers locaux `dev.sh`, `sync-content.sh` et `watch-content.mjs` sont devenus dangereux.** Ils copient le contenu dans `blog/`, `docs/` et `static/`, c'est-à-dire le modèle Docusaurus que la migration abandonne. Les lancer par réflexe repollue le repo. Avec Astro, `npm run dev` suffit. À supprimer en phase 6.

## Deux points en attente d'arbitrage

- **L'icône X** (`public/img/icon-x.svg`) est une conversion raster de 4,4 ko, trois tracés superposés avec un carré noir en fond. Elle rendra mal en thème sombre. À remplacer par le glyphe officiel.
- **Coquilles dans un `shareText`** repris verbatim depuis l'ancien boilerplate (`bundlephobia`) : « appplications », « plus rapide et moins energivore ». Conservées telles quelles pour ne pas modifier la copie sans accord.

## Récupérer les fichiers Docusaurus à porter

L'historique git est la source fiable. Attention, le commit de référence est `5772d1c~1`, pas `HEAD~1` :

```bash
git show 5772d1c~1:src/pages/mentions-legales.md
git show 5772d1c~1:src/pages/blog-conception.js
git show 5772d1c~1:src/components/zatsCO2JSBadge.js
git show 5772d1c~1:src/components/zatsWebsiteCarbonBadge.js
git show 5772d1c~1:src/css/custom.css
```
