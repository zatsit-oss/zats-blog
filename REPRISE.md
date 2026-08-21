# Où en est la migration

Note de reprise, mise à jour le 21 août 2026. À supprimer une fois la migration terminée.

**Rien en cours.** Le rythme vertical et le plafonnement des images sont faits et commités, les trois gates sont vertes. Reprendre par le prochain geste ci-dessous, il n'y a pas d'état intermédiaire à retrouver. Les commits du jour ne sont pas encore poussés.

Branche `migration-astro` dans **les deux** repos. PR en brouillon : [#82](https://github.com/zatsit-oss/zats-blog/pull/82).

**Preview en ligne et validée** : https://zatsit-blog--pr82-migration-astro-9gtho1s6.web.app

## Le prochain geste

**La CI du dépôt contenu.** Aujourd'hui, publier un article ne le met pas en ligne : rien ne déclenche le build de la coque. C'est le seul manque **fonctionnel** restant. Techniquement : un workflow côté contenu qui envoie un `repository_dispatch` vers la coque, et le déclencheur correspondant ici. Demande un token inter-dépôts, seul point à préparer avec Emmanuel.

Ensuite, dans l'ordre de risque croissant :

1. **Un `srcset` sur les images d'article.** Mesuré : un téléphone de 390 px télécharge le fichier de 1366 px, soit 4,19 fois ce qu'il affiche. Le plafond a réglé le budget, pas ce gaspillage. `layout: 'constrained'` d'Astro le donnerait, mais il ajoute des attributs et des styles globaux qui peuvent entrer en conflit avec l'échappée de colonne des images d'article : à faire avec une vérification navigateur.
2. **Le texte du hero**, en attente d'Emmanuel, tout est dans `HERO` de `src/consts.ts`. Sa forme n'a pas été retravaillée exprès : la refaire avant de savoir ce qu'elle dit reviendrait à la faire deux fois.
3. **Bascule de la production.** `publish-on-merge.yml` utilise toujours l'action Docusaurus, volontairement. Le jour où on le migre, le premier merge remplace le blog en ligne. À faire dans une séance dédiée.

**Le hero est délibérément mis de côté.** Son texte est un placeholder non tranché ; retravailler sa forme avant de savoir ce qu'il dit reviendrait à le refaire deux fois.

## État

| | |
|---|---|
| Routes | **45 / 45**, zéro divergence avec la référence Docusaurus |
| `astro check` | 0 erreur |
| Gate a11y | verte, jetons et couleurs Shiki, deux thèmes |
| Gate éco | verte, **plus aucune dette inscrite** |
| CI de preview | verte, déploie sur un canal Firebase |
| Production | **intacte, toujours Docusaurus** |

| Mesure | Docusaurus | Astro |
|---|---|---|
| Poids initial | 243 à 3 324 ko | 65 à 79 ko |
| JS par page | 135 ko gzip | 1,1 ko, plus 1,7 ko si recherche |
| Paquets | 1 478 | 299 |

## Fait

Phases 0 à 4 terminées, phase 5 à moitié, phase 6 aux trois quarts. Le détail ligne par ligne est dans la section 0 de `PLAN-MIGRATION.md`.

En bref : socle et jetons, loader lisant le dépôt voisin en place, les 19 articles à leurs URLs d'origine, header, footer aligné sur le corporate avec badge carbone auto-hébergé, bascule de thème, listing paginé, hero, tags, archive, auteurs, 404, pages portées, admonitions, Shiki vérifié AA, bouton copier, RSS, recherche Pagefind, CI de preview, documentation.

Puis une passe de mise en forme, née de la preview : justification de l'article en `ch`, rythme des titres asymétrique, chapô, entête fusionnée en une signature, cartes du listing avec l'interaction signature du design system (lift, filet d'accent, ombre), article mis en avant sur la page 1, et sommaire à deux niveaux qui suit la lecture.

Puis, le 21 août, deux chantiers mécaniques. **Le rythme vertical** : quatre jetons en fin de `src/styles/tokens/spacing.css` et deux règles dans `global.css` remplacent les neuf `padding-block` posés page par page ; `main` ouvre et ferme la page, ses enfants sont séparés par `--section-gap`, qui servait à rien jusque-là. Mesuré dans Chrome sur les dix formes de page : 48/64 en mobile, 64/96 en desktop, partout pareil. **Les images** : `src/plugins/capped-image-service.mjs` plafonne à 1366 px ce que personne n'a dimensionné, sans toucher aux 30 images sur 73 déjà plus petites. Les deux articles hors budget sont revenus dedans (5228 ko à 874 ko, 2844 ko à 982 ko) et `KNOWN_OVER_BUDGET` est vide.

Le diagnostic qui a motivé cette passe vaut d'être retenu : **`--shadow-lift`, `--shadow-glow` et `--section-gap` étaient définis dans les jetons et référencés nulle part**, et l'échelle typographique était écrasée vers le bas, 17 usages de `--text-sm` contre un seul de `--text-3xl`. Vérifier ce genre d'écart entre ce que le système offre et ce que le code utilise est plus rapide que de discuter du rendu.

## Six pièges déjà payés, un par session perdue

Ils sont écrits dans `CLAUDE.md`, section « The traps this codebase has already paid for ». Les relire coûte moins cher que les redécouvrir.

Le plus vicieux : **le store de contenu met en cache le Markdown rendu**. Après toute modification du pipeline Markdown, écarter `node_modules/.astro/data-store.json`, sinon on diagnostique des problèmes qui n'existent plus.

## Trois erreurs de méthode à ne pas refaire

**Tester le comportement dans un navigateur, pas dans le HTML statique.** J'ai passé trois échanges à affirmer « tout est bon d'ici » pendant que la recherche était cassée pour l'utilisateur. Chrome est installé sur la machine : le piloter en CDP donne la frappe clavier, le DOM après exécution, la géométrie des éléments et les erreurs console. La marche à suivre est dans `CLAUDE.md`, section « Testing behaviour ».

Corollaire : le script de recherche est **inliné dans chaque page**, donc un onglet ouvert avant le dernier build sert l'ancien code. Recharger en forçant le cache avant de conclure. C'était la cause du dernier « ça ne marche plus ».

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
