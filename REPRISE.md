# Où en est la migration

Note de reprise, mise à jour le 28 août 2026. À supprimer une fois la migration terminée.

**Rien en cours.** Arbre de travail propre. Le 27 août : taxonomies, `srcset` des images, correctif a11y du pied de page. Le 28 août : la décision D6, une seule entrée de menu et le nuage de tags sur `/categories/`, plus la bascule du mot lu par le lecteur, de « thème » vers **« tag »**. `astro check` à zéro erreur, 52 pages dans les budgets, axe-core à zéro violation sur `/categories/` dans les deux thèmes. Reprendre par le prochain geste ci-dessous, il n'y a pas d'état intermédiaire à retrouver.

Branche `migration-astro` dans **les deux** repos. PR en brouillon : [#82](https://github.com/zatsit-oss/zats-blog/pull/82).

**Preview en ligne et validée** : https://zatsit-blog--pr82-migration-astro-9gtho1s6.web.app

## À faire après la bascule de production

Trois points qui n'ont de sens, ou d'urgence, qu'une fois le site en ligne sur sa vraie adresse, notés ici parce qu'ils seront invisibles autrement :

1. **`ECOINDEX_URL` dans `src/consts.ts`.** Le résultat pointé a été mesuré sur le blog Docusaurus, donc il note un site que celui-ci remplace. Relancer l'analyse sur le build Astro en ligne et remplacer l'identifiant, sinon le lien du pied de page et la bande « construit, déployé et mesuré avec » de l'accueil affichent les chiffres de quelqu'un d'autre. Un `TODO` est posé à côté de la constante.
2. **Les doublons de SVG dans `dist/`.** Deux SVG d'article sont émis deux fois, 51,5 ko que rien ne référence : le HTML ne pointe que la copie sortie du service d'images, l'autre est l'émission de l'import par Astro lui-même, en amont, donc `capped-image-service.mjs` ne peut rien y faire. Zéro octet sur le réseau, du poids d'artefact de déploiement seulement, d'où le report. Reporté sciemment le 27 août.
3. **`MEASURED_PAGE_BYTES`**, même fichier, à rafraîchir après tout changement qui déplace le poids : le chiffre est imprimé au lecteur sur `/blog-conception/`. Il vaut 91,6 ko au 27 août.

## Le prochain geste

**La CI du dépôt contenu.** Aujourd'hui, publier un article ne le met pas en ligne : rien ne déclenche le build de la coque. C'est le seul manque **fonctionnel** restant. Techniquement : un workflow côté contenu qui envoie un `repository_dispatch` vers la coque, et le déclencheur correspondant ici. Demande un token inter-dépôts, seul point à préparer avec Emmanuel.

Ensuite, dans l'ordre de risque croissant :

1. **Le texte du hero.** Sa forme est tranchée, ses mots non : `HERO` dans `src/consts.ts` est toujours un placeholder. Le titre est en deux voix, une clause en romain puis une en italique dans l'accent, et le mécanisme (`counterpoint`) accepte n'importe quel découpage.
2. **Bascule de la production.** `publish-on-merge.yml` utilise toujours l'action Docusaurus, volontairement. Le jour où on le migre, le premier merge remplace le blog en ligne. À faire dans une séance dédiée.

## État

| | |
|---|---|
| Routes | **45 / 45** de la référence Docusaurus, plus les 7 nouvelles de `/categories/` |
| `astro check` | 0 erreur |
| Gate a11y | verte, jetons et couleurs Shiki, deux thèmes |
| Gate éco | verte, **52 pages sur 52 dans les budgets** |
| CI de preview | verte, déploie sur un canal Firebase |
| Production | **intacte, toujours Docusaurus** |

| Mesure | Docusaurus | Astro |
|---|---|---|
| Poids initial | 243 à 3 324 ko | 63 à 81 ko |
| JS par page | 135 ko gzip | 1,1 ko, plus 1,7 ko si recherche |
| Paquets | 1 478 | 299 |

## Fait

Phases 0 à 4 terminées, phase 5 à moitié, phase 6 aux trois quarts. Le détail ligne par ligne est dans la section 0 de `PLAN-MIGRATION.md`.

En bref : socle et jetons, loader lisant le dépôt voisin en place, les 19 articles à leurs URLs d'origine, header, footer aligné sur le corporate avec badge carbone auto-hébergé, bascule de thème, listing paginé, hero, tags, archive, auteurs, 404, pages portées, admonitions, Shiki vérifié AA, bouton copier, RSS, recherche Pagefind, CI de preview, documentation.

Puis une passe de mise en forme, née de la preview : justification de l'article en `ch`, rythme des titres asymétrique, chapô, entête fusionnée en une signature, cartes du listing avec l'interaction signature du design system (lift, filet d'accent, ombre), article mis en avant sur la page 1, et sommaire à deux niveaux qui suit la lecture.

Puis, le 21 août, deux chantiers mécaniques. **Le rythme vertical** : quatre jetons en fin de `src/styles/tokens/spacing.css` et deux règles dans `global.css` remplacent les neuf `padding-block` posés page par page ; `main` ouvre et ferme la page, ses enfants sont séparés par `--section-gap`, qui servait à rien jusque-là. Mesuré dans Chrome sur les dix formes de page : 48/64 en mobile, 64/96 en desktop, partout pareil. **Les images** : `src/plugins/capped-image-service.mjs` plafonne à 1366 px ce que personne n'a dimensionné, sans toucher aux 30 images sur 73 déjà plus petites. Les deux articles hors budget sont revenus dedans (5228 ko à 874 ko, 2844 ko à 982 ko) et `KNOWN_OVER_BUDGET` est vide.

Puis, l'après-midi du 21, la page d'accueil. Le titre du hero passe **en deux voix**, une clause en romain et une en italique dans l'accent, en Poppins italique déjà embarquée donc à coût nul. Les **illustrations du hero** viennent du projet Claude Design « Illustrations hero banner Zatsit », qui livrait les deux planches en composants Astro : le nuage des dix-sept tags est câblé, l'onde est disponible, et leur import a exigé un jeton nouveau, `--color-eco-text`, parce que `--color-eco` mesure 2,01:1 sur la bande claire et ne peut pas porter de texte. Le nuage **se condense à l'arrivée**, une seule passe, ce qui le sort du critère 2.2.2 et coûte 158 recalculs contre 720 par tranche de six secondes pour une boucle. Enfin **deux bandes filetées** entre le hero et les articles, l'une avec trois faits calculés depuis le contenu, l'autre avec les briques du site, marques officielles en une couleur. Et la médaille EcoVadis remonte à côté de l'adresse en mobile.

Puis, du 22 au 25 août, l'**en-tête et le pied de page alignés sur le corporate** : rangée d'icônes complète, badge B Corp, disques sociaux, sigle pleine taille dès 768 px, recherche calée sur la rangée d'icônes.

Puis, le 27 août, **les deux taxonomies**. Le dépôt contenu portait depuis toujours deux axes, une catégorie par article (le dossier où il vit, tiré de la liste fermée de son `config.json`) et des thèmes libres ; seuls les thèmes étaient publiés, derrière un menu qui les appelait catégories, sur une page dont le titre les appelait tags et un chapô qui les appelait thèmes. Le loader dérive maintenant la catégorie du dossier comme il dérive la date, six catégories sur dix reçoivent une page, et le mot « catégorie » est réservé à cet axe : un tag est un **thème** partout où le lecteur le voit, seule l'URL reste `tags` parce que ces dix-sept routes font partie des 45. Plus le **`srcset` des images d'article**, échelle de six candidats de 390 à 1366 calée sur les largeurs réellement mesurées, ce qui a obligé le service à réécrire lui-même `widths` et `sizes` (le piège est dans `CLAUDE.md`). Et un correctif a11y sur le lien de la ligne de copyright.

Puis, le 28 août, **la fusion des deux entrées de menu** (D6 du plan). Le header ne garde que « Catégories » ; `src/components/TagCloud.astro` pose les dix-sept tags sous les six cartes, dimensionnés sur le **rang** du nombre d'articles et non sur le nombre (6, 3, 2, 1 est trop tassé pour une interpolation linéaire, qui laissait un palier inutilisé), quatre paliers de 16 à 24 px, poids 400/600/700, ordre alphabétique puisque la taille dit déjà lesquels sont les plus écrits. `/tags/` redirige vers `/categories/`. Et **le mot lu par le lecteur devient « tag »** : c'est celui du frontmatter et de l'URL, « thème » aura tenu trois jours. La règle qui compte est intacte, un tag n'est jamais appelé une catégorie.

Vérifié dans Chrome sur ce dernier lot, et c'est ce qui a servi : dix-sept mots cliquables une fois la section à l'écran, cibles de 40 px de haut, tailles monotones avec le nombre d'articles, focus clavier à 2 px pleins avec soulignement, aucun débordement à 390 px, axe-core à zéro violation dans les deux thèmes avec `target-size` demandée par son nom, contrastes de 5,86:1 à 16,71:1, aucune erreur console.

Une tentative jetée en cours de route, gardée dans l'historique : la marque zatsit en filigrane dans la moitié droite du hero (`9c5f1d9`, annulée par `3fc9a64`).

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
