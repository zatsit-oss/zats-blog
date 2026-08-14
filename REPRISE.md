# Où en est la migration

Note de reprise, mise à jour le 14 août 2026. À supprimer une fois la migration terminée.

Branche `migration-astro` dans **les deux** repos. PR en brouillon : [#82](https://github.com/zatsit-oss/zats-blog/pull/82).

**Preview en ligne et validée** : https://zatsit-blog--pr82-migration-astro-9gtho1s6.web.app

## Le prochain geste

**Reprendre la mise en forme.** C'est la demande explicite du 14 août : l'outillage attend, le rendu passe d'abord. Le site est fonctionnellement complet, il n'est pas fini visuellement.

Ensuite seulement, dans l'ordre de risque croissant :

1. **CI du dépôt contenu.** Aujourd'hui, publier un article ne le met pas en ligne : rien ne déclenche le build de la coque. C'est la lacune la plus structurante et elle se teste sans rien casser.
2. **Images des deux pages hors budget** (`devlille-2026`, `green-exploitation-miniere`). Inscrites comme dette nommée dans `check:eco`. Le correctif est `width`/`height` déclarés, pas une conversion de format : `astro:assets` réencode mais ne redimensionne que si les dimensions sont connues.
3. **Bascule de la production.** `publish-on-merge.yml` utilise toujours l'action Docusaurus, volontairement. Le jour où on le migre, le premier merge remplace le blog en ligne.

## État

| | |
|---|---|
| Routes | **45 / 45**, zéro divergence avec la référence Docusaurus |
| `astro check` | 0 erreur |
| Gate a11y | verte, jetons et couleurs Shiki, deux thèmes |
| Gate éco | verte, 2 dettes connues inscrites |
| CI de preview | verte, déploie sur un canal Firebase |
| Production | **intacte, toujours Docusaurus** |

| Mesure | Docusaurus | Astro |
|---|---|---|
| Poids initial | 243 à 3 324 ko | 56 à 77 ko |
| JS par page | 135 ko gzip | 1,1 ko, plus 1,7 ko si recherche |
| Paquets | 1 478 | 299 |

## Fait

Phases 0 à 4 terminées, phase 5 à moitié, phase 6 aux trois quarts. Le détail ligne par ligne est dans la section 0 de `PLAN-MIGRATION.md`.

En bref : socle et jetons, loader lisant le dépôt voisin en place, les 19 articles à leurs URLs d'origine, header, footer aligné sur le corporate avec badge carbone auto-hébergé, bascule de thème, listing paginé, hero, tags, archive, auteurs, 404, pages portées, admonitions, Shiki vérifié AA, bouton copier, RSS, recherche Pagefind, CI de preview, documentation.

## Six pièges déjà payés, un par session perdue

Ils sont écrits dans `CLAUDE.md`, section « The traps this codebase has already paid for ». Les relire coûte moins cher que les redécouvrir.

Le plus vicieux : **le store de contenu met en cache le Markdown rendu**. Après toute modification du pipeline Markdown, écarter `node_modules/.astro/data-store.json`, sinon on diagnostique des problèmes qui n'existent plus.

## Deux erreurs de méthode à ne pas refaire

**Lire la sortie complète d'`astro check`.** La ligne du décompte est au-dessus des warnings ; un `tail -3` la coupe et laisse croire à un succès. J'ai annoncé « zéro erreur » plusieurs tours de suite alors qu'il y en avait deux, et c'est la CI qui les a trouvées.

**Ne pas faire confiance à `AGENTS.md` d'avant le 14 août.** Il décrivait un `src/pages/index.js` absent de tout l'historique, ce qui m'a fait affirmer que la home Docusaurus avait un hero. Elle n'en avait pas : c'était le listing, seul.

## En attente d'arbitrage

- **Le hero est un placeholder assumé**, tout est dans `HERO` de `src/consts.ts`. La home Docusaurus n'avait pas de hero, il n'y a donc rien à restaurer.
- **La recherche prend une ligne de header en plus sur mobile.** L'alternative est une icône ouvrant un panneau plein écran, avec la machinerie de focus que ça implique.
- **Les mentions légales ont deux corrections dans du texte juridique** : titres de section en `h2`, et le siège de Google Ireland qui n'est plus « Royaume-Uni ». À faire relire.
- **Coquilles dans le `shareText` de `bundlephobia`**, reprises verbatim de l'ancien boilerplate.

## Récupérer les fichiers Docusaurus

Le commit de référence est **`5772d1c~1`**, pas `HEAD~1` :

```bash
git show 5772d1c~1:src/css/custom.css
git show 5772d1c~1:docusaurus.config.js
```

## Helpers locaux à supprimer

`dev.sh`, `sync-content.sh` et `watch-content.mjs` recopient le contenu dans la coque, modèle abandonné. Ils sont gitignorés, donc seulement sur ta machine. `npm run dev` suffit.
