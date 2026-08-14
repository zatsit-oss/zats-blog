# Blog zatsit

La coque du blog zatsit, construite avec [Astro](https://astro.build/) et déployée sur Firebase Hosting. Site francophone, statique, sans JavaScript côté client en dehors de la bascule de thème, du bouton copier et de la recherche.

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

La recherche ne fonctionne pas avec `npm run dev` : son index est produit par le build. C'est attendu, et le champ le dit.

Les deux dernières commandes sortent en erreur si un seuil est franchi, et la CI les exécute sur chaque pull request. Les règles sont dans [.claude/rules/quality.md](.claude/rules/quality.md).

## Publier un article

Rien à faire ici : tout se passe dans le dépôt de contenu, voir son `POSTING.md`. Une publication demande en revanche un rebuild de cette coque pour apparaître en ligne.

## Déploiement

Une pull request déclenche un build et une preview Firebase sur un canal dédié, l'URL est commentée sur la PR.

Un déploiement manuel reste possible :

```bash
firebase login
npm run build
firebase deploy
```

## Node

Node ≥ 22.12, exigé par Astro 7. La version est fixée dans [.node-version](.node-version) et la CI la lit de là.
