# Où en est la migration

Note de reprise, 7 août 2026. À supprimer une fois la migration terminée.

Branche `migration-astro` dans **les deux** repos. Tout est commité.

## Le prochain geste

Le build est bloqué sur **une seule** erreur :

```
[ImageNotFound] Could not find requested image `../../../static/img/icon-linkedin.webp`
```

**Cause.** 8 des 19 articles codent en dur les liens de partage LinkedIn/X documentés dans `POSTING.md`, avec un chemin relatif qui remontait de `blog/<cat>/<article>/` vers le `static/` de la coque. Ce chemin supposait le vieux modèle, où le contenu était *copié dans* la coque. Le loader lit désormais le repo voisin sur place : `../../../static/` n'existe plus.

**Décision prise** : remplacer ce boilerplate par un composant de layout.

1. Créer `src/components/ShareLinks.astro`, qui prend `slug` et `title` et génère les deux liens (icônes déjà présentes dans `public/img/icon-linkedin.webp` et `public/img/icon-x.webp`).
2. Retirer les 15 lignes de partage des 8 articles du repo contenu :
   - `blog/ai/2023-12-21-Gemini-on-vertex-ai`
   - `blog/architecture/2023-12-10-redpanda-introduction`
   - `blog/architecture/2024-10-29-Realworld-app`
   - `blog/dev/2024-07-18-bundlephobia`
   - `blog/dev/2024-11-04-hacktoberfest-2024--nos-retours`
   - `blog/dev/2024-12-19-ai-assistant-vscode`
   - `blog/general/2025-07-10-entreprise-a-mission`
   - `blog/green/2024-06-21-greenIT-introduction-1`
3. Appeler `<ShareLinks />` depuis le layout d'article.
4. Retirer la section correspondante de `POSTING.md` (phase C).

## Fait

- **Plan** : `PLAN-MIGRATION.md`, 500 lignes, D1-D5 et P1-P6 tous arbitrés.
- **Référence** : les 45 routes Docusaurus dans `migration-routes-docusaurus.txt`, et le build complet archivé dans `/Users/emmanuelperu/dev/zatsit/blog/docusaurus-reference-build`. C'est la seule référence visuelle restante, Docusaurus étant supprimé. `npx serve` dessus pour comparer.
- **Contenu normalisé** : 19/19 articles en `YYYY-MM-DD-slug/index.md`, marqueurs `truncate` complets. Vérifié : le build Docusaurus repassait et le diff des 45 routes était vide.
- **Socle Astro 7.2.0** : jetons du design system, Poppins via l'API Fonts native, `global.css` sans aucun hexadécimal brut, `BaseHead` avec OG complet et script de thème anti-flash.
- **Loader** : les 19 articles chargés, les 19 dates résolues, les 12 auteurs chargés.

## Deux pièges déjà payés, à ne pas réintroduire

1. **`glob()` dérive l'`id` du `slug` du frontmatter**, pas du chemin. Le repli de date doit lire `entry.filePath`. Avec `id`, les 12 articles sans date en frontmatter échouent.
2. **`authors.yml` est un seul document de 12 profils.** Il faut `file()` avec un parseur YAML ; `glob()` le charge comme une entrée unique et la validation Zod échoue sur `name: Required`.

## Mis de côté, à réintégrer

**Les fichiers Docusaurus à porter** sont dans l'historique git, c'est la source fiable (le scratchpad de session, lui, disparaît) :

```bash
git show HEAD~1:src/pages/mentions-legales.md
git show HEAD~1:src/pages/blog-conception.js
git show HEAD~1:src/components/zatsCO2JSBadge.js
git show HEAD~1:src/components/zatsWebsiteCarbonBadge.js
git show HEAD~1:src/css/custom.css
```

**Les fichiers du gabarit Astro** non encore habillés (`[...slug].astro`, `rss.xml.js`, `BlogPost.astro`, `Header/Footer/HeaderLink.astro`) n'ont jamais été commités. Inutile de les chercher : ils se régénèrent en une commande.

```bash
npm create astro@latest /tmp/scaffold -- --template blog --no-install --no-git --skip-houston --yes
```

## Reste à faire

Phases 3 à 6 de `PLAN-MIGRATION.md`. Dans l'ordre : pages et parité (listing paginé, article, tags, `/archive/`, `/authors/`, 404, admonitions, Pagefind, RSS, temps de lecture), vérification des URLs contre les 45 routes, CI/CD, documentation.

Ne pas oublier : `base.css` du design system n'est pas encore importé, il porte `.btn-primary`, `.card`, `.tag`, `.glass`.
