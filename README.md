# Blog zatsit

La coque du blog zatsit, construite avec [Astro](https://astro.build/). Site francophone, statique, sans framework côté client : le JavaScript embarqué se limite à quelques scripts inline (bascule de thème, bouton copier, recherche, tirage d'un article au hasard, sommaire, badge carbone), soit 2,5 ko pour tout le site.

**Le contenu vit ailleurs.** Les articles, les auteurs et leurs images sont dans [zats-blog-content](https://github.com/zatsit-oss/zats-blog-content). Ce dépôt ne contient que la coque : mise en page, thème, composants, build.

## Démarrer

Le dépôt de contenu doit être cloné **à côté** de celui-ci, pas dedans :

```
votre-espace-de-travail/
├── zats-blog/          ← ce dépôt
└── zats-blog-content/  ← les articles
```

```bash
git clone git@github.com:zatsit-oss/zats-blog-content.git
cd zats-blog
npm install
npm run dev
```

Aucune copie de fichiers n'est nécessaire : le loader lit le dépôt voisin sur place. Modifier un article s'y répercute immédiatement, sans synchronisation.

Le chemin `../zats-blog-content` est en dur à deux endroits, `src/consts.ts` et le glob des avatars dans `src/utils/avatars.ts`. Ce dernier ne peut pas être une variable, Vite n'analysant que les chemins littéraux : le dépôt doit donc porter ce nom exact.

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement, rechargement à chaud |
| `npm run build` | build de production dans `dist/`, index Pagefind compris |
| `npm run preview` | sert le build local, **seule façon de tester la recherche** |
| `npm run check` | vérification TypeScript |
| `npm run check:a11y` | contrastes WCAG 2.1 AA, deux thèmes, plus les couleurs du code |
| `npm run check:eco` | budgets de poids par page, sur `dist/` |
| `npm run check:axe` | axe-core sur **toutes** les pages de `dist/`, deux thèmes, deux largeurs |
| `npm run docs:referentiels` | régénère les deux fichiers `REFERENTIEL-*.md` depuis `src/data/` |

Les quatre commandes `check` sortent en erreur si un seuil est franchi. Les trois premières tournent en CI sur chaque pull request ; `check:axe` demande Chrome et reste donc une vérification locale, à lancer avant de considérer un travail d'interface terminé. Les règles sont dans [.claude/rules/quality.md](.claude/rules/quality.md).

**La recherche ne fonctionne pas avec `npm run dev`**, et c'est attendu : son index est produit par le build, dans `dist/pagefind/`. Il faut `npm run build` puis `npm run preview`, en forçant le rechargement de la page, le script de recherche étant inliné dans chacune.

Rien ne le signale à l'écran : le champ répond normalement et ne renvoie aucun résultat. L'erreur est dans la console, `[search] Pagefind n'a pas pu être chargé.`

## Publier un article

Rien à faire ici : tout se passe dans le dépôt de contenu, voir son `POSTING.md`. Une publication demande en revanche un rebuild de cette coque pour apparaître en ligne.

## Déploiement

Une pull request déclenche un build et une preview Firebase sur un canal dédié, dont l'URL est commentée sur la PR.

**La production n'est pas servie par Firebase.** `blog.zatsit.fr` est un bucket GCS, `zatsit-blog-prod`, alimenté par le pipeline du **dépôt de contenu** : celui-ci récupère cette coque, la construit et téléverse `dist/`. Conséquence pratique : une modification faite ici seule n'atteint pas la production tant que ce pipeline n'est pas déclenché, et une publication d'article reconstruit la coque au passage.

Un déploiement Firebase manuel reste possible pour vérifier un build :

```bash
firebase login
npm run build
firebase deploy
```

## Node

Node ≥ 22.12, exigé par Astro 7. La version est fixée dans [.node-version](.node-version) et la CI la lit de là.
