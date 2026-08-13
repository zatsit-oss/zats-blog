# Où en est la migration

Note de reprise, mise à jour le 13 août 2026. À supprimer une fois la migration terminée.

Branche `migration-astro` dans **les deux** repos.

## Le prochain geste

Phase 3, les pages. Le gabarit Astro à régénérer (`[...slug].astro`, `rss.xml.js`, `BlogPost.astro`, `Header/Footer/HeaderLink.astro`) n'a jamais été commité :

```bash
npm create astro@latest /tmp/scaffold -- --template blog --no-install --no-git --skip-houston --yes
```

Dans l'ordre : listing paginé, article, tags, `/archive/`, `/authors/`, 404, admonitions, Pagefind, RSS, temps de lecture. Puis la vérification des URLs contre les 45 routes de `migration-routes-docusaurus.txt`.

Deux gestes à ne pas oublier en y arrivant :

1. **Déplacer `<ShareLinks />`** de la page de contrôle vers le layout d'article. Il y est branché uniquement pour prouver qu'il compile.
2. **Importer `base.css`** du design system, il porte `.btn-primary`, `.card`, `.tag`, `.glass`.

## Fait

- **Plan** : `PLAN-MIGRATION.md`, D1-D5 et P1-P6 tous arbitrés.
- **Référence** : les 45 routes dans `migration-routes-docusaurus.txt`, et le build complet archivé dans `/Users/emmanuelperu/dev/zatsit/blog/docusaurus-reference-build`. Seule référence visuelle restante. `npx serve` dessus pour comparer.
- **Contenu normalisé** : 19/19 articles en `YYYY-MM-DD-slug/index.md`, marqueurs `truncate` complets. Le build Docusaurus repassait et le diff des 45 routes était vide.
- **Socle Astro 7.2.0** : jetons du design system, Poppins via l'API Fonts native, `global.css` sans aucun hexadécimal brut, `BaseHead` avec OG complet et script de thème anti-flash.
- **Garde-fous qualité** : `.claude/rules/quality.md`, les skills `wcag-check`, `eco-check` et `accessibility-a11y`, et deux commandes qui sortent en erreur, `npm run check:a11y` et `npm run check:eco`. Ligne de base Docusaurus mesurée dans `.claude/skills/eco-check/references/baseline-docusaurus.md`.
- **Le build passe.** 19 articles, 19 dates résolues, 12 auteurs. `ShareLinks` remplace le boilerplate de partage, `POSTING.md` est à jour.

## Mesures du 13 août 2026

| | Docusaurus (45 pages) | Astro (page de contrôle) |
|---|---|---|
| Poids initial | 304 ko médian, 3 152 ko sur l'accueil | **120,7 ko** |
| Requêtes | 5 à 16 | 18, dont **14 polices** |
| Contrastes vérifiés | 0 | 16, deux thèmes, tous au vert |

La page de contrôle n'est pas une vraie page : le chiffre ne vaut que comme plancher. À refaire sur un article réel en phase 3.

## Trois pièges déjà payés, à ne pas réintroduire

1. **`glob()` dérive l'`id` du `slug` du frontmatter**, pas du chemin. Le repli de date doit lire `entry.filePath`. Avec `id`, les 12 articles sans date en frontmatter échouent.
2. **`authors.yml` est un seul document de 12 profils.** Il faut `file()` avec un parseur YAML ; `glob()` le charge comme une entrée unique et la validation Zod échoue sur `name: Required`.
3. **`context.store.set()` est ignoré si le digest de l'entrée n'a pas changé.** Modifier une donnée dérivée sans toucher au fichier source ne s'écrit donc pas. Faire `delete()` puis `set()`. Corollaire de méthode : une garde doit vérifier **l'état final du store**, pas le fait d'avoir tenté l'écriture.

## Deux dettes mesurées, à traiter en phase 3

1. **Polices** : `astro.config.mjs` déclare 7 graisses × 2 styles, soit 14 woff2. Sur la page de contrôle, elles représentent **112 ko sur 121 ko et 14 requêtes sur 18** : la quasi-totalité du poids. La règle éco en autorise 3. C'est le gain le plus rentable disponible.
2. **Images du repo contenu** : la ligne de base montre `devlille-2026` à 10,8 Mo et l'accueil à 6,7 Mo, des rasters non optimisés. La coque Astro ne les corrige pas toute seule, il faut les passer par `astro:assets`.

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
