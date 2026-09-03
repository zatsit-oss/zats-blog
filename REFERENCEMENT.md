# Ce que le blog coche en SEO, AEO et GEO

État au 3 septembre 2026. Trois sigles pour trois lecteurs différents : **SEO** pour un moteur de recherche, **AEO** pour un moteur de réponse qui cite, **GEO** pour un modèle génératif qui reformule. Les trois demandent en grande partie la même chose, du HTML sémantique et du texte lisible sans exécuter de script, ce qui explique que ce site parte avec une avance.

Chaque ligne ci-dessous est vérifiable sur le site ou dans le dépôt. Le dernier audit externe, [seoscore.tools](https://seoscore.tools) le 3 septembre, donne **73/100, grade B** : SEO 77, AEO 72, GEO 67, contre des moyennes de 52, 28 et 13 sur deux mille sites scannés. 145 contrôles passés, 59 échoués, 19 sans objet.

## Le chiffre qu'aucun scanner ne met en avant

**15 539 caractères de texte rendus sur l'accueil sans exécuter une ligne de JavaScript**, 9 443 sur un article, et 2,5 ko de script pour tout le site.

C'est la mesure qui compte le plus pour un agent, et c'est la seule qu'aucun outil ne note. Un moteur de réponse ou un modèle qui parcourt le web ne garantit pas d'exécuter votre JavaScript ; beaucoup ne le font pas du tout. Un site rendu côté client peut donc afficher une page riche à un humain et une page vide à une machine. Ici il n'y a rien à exécuter : le HTML contient le texte.

Le reste de ce document décrit des réglages. Celui-là est structurel, il découle du choix de la génération statique, et il ne se rattrape par aucune balise.

## SEO

Ce qu'un moteur de recherche attend, et où c'est fait.

| Ce qui est en place | Vérifiable |
|---|---|
| Un titre et une méta-description propres à chaque page | `src/components/BaseHead.astro` |
| `<link rel="canonical">` sur les **72 pages** | absolue, dérivée de `site` dans `astro.config.mjs` |
| `robots.txt` ouvert, déclarant le sitemap | `public/robots.txt` |
| Sitemap segmenté, généré au build | `sitemap-index.xml` et `sitemap-0.xml` |
| Flux RSS | `/rss.xml` |
| Open Graph et carte Twitter complets sur 70 pages | titre, description, image absolue, `og:type` correct |
| Une seule `<h1>` par page, hiérarchie sans saut | vérifié par axe-core sur toutes les pages |
| HTML sémantique | `<nav>`, `<main>`, `<article>`, `<time>`, `<figure>` |
| URLs stables et lisibles | `/mon-article/`, tirets, pas de paramètre |
| Les 45 routes de l'ancien site préservées | `migration-routes-docusaurus.txt`, contrôlé au build |
| HTTPS, HSTS, compression Brotli | couche d'hébergement |
| Images en WebP ou AVIF, dimensions déclarées, `srcset` | `src/plugins/capped-image-service.mjs` |
| Chargement différé sous la ligne de flottaison | `loading="lazy"` |
| Polices auto-hébergées, `font-display: swap` | API Fonts d'Astro, 6 fichiers, 48,5 ko |
| Zéro script tiers bloquant, zéro traceur, zéro cookie | mesuré à chaque build |
| DOM sous 500 éléments sur l'accueil | porte `check:eco`, budget 1500 |

## AEO

Ce qu'un moteur de réponse attend pour **citer** une page, c'est-à-dire en extraire un passage attribuable.

| Ce qui est en place | Vérifiable |
|---|---|
| JSON-LD sur **70 pages sur 72**, émis au build | `src/utils/schema.ts` |
| `Organization` avec nom, logo, `sameAs`, référencée par identité | `/#organization` |
| `BlogPosting` par article : titre, description, date, auteurs, mots-clés | et `publisher` par référence, pas dupliqué |
| `WebSite` sur les pages qui ne sont pas des articles | |
| Les 23 agents d'IA recensés ont accès | aucune règle par agent dans `robots.txt` |
| `llms.txt`, généré depuis la collection | `/llms.txt`, 6,5 ko, jamais périmé |
| Signature d'auteur sur chaque article, et une page par auteur | `/authors/<prénom-nom>/` |
| Date de publication en `<time>` lisible par une machine | |
| Titres de section explicites, listes, tableaux, définitions | ce que le rapport relève comme « bien structuré pour l'IA » |
| Chiffres sourcés et liens externes vers les sources | 20 liens externes sur l'accueil |
| Contenu de fond : 1 559 mots sur un article récent | |

Les deux pages sans JSON-LD sont les redirections `/tags/` et `/markdown-page/`, qui n'ont rien à décrire.

## GEO

Ce qu'un modèle génératif attend pour **reformuler sans se tromper**. C'est la catégorie la plus jeune et la plus discutable des trois, et c'est là que les outils demandent le plus de choses contestables.

| Ce qui est en place | Vérifiable |
|---|---|
| Langue déclarée, site monolingue assumé | `lang="fr"` sur `<html>` |
| Un sujet par page, titre et contenu alignés | |
| Marque nommée de façon constante | titre, Open Graph et schema disent « zatsit » |
| Deux liens `sameAs` faisant autorité | LinkedIn et GitHub de l'organisation |
| Taxonomies explicites et navigables | `/categories/` et 17 pages de tags |
| Fraîcheur datée et visible | date de publication, et les mesures portent la leur |
| Aucun contenu masqué, aucun mur, aucune interstitielle | rien à contourner pour lire |
| Nos propres chiffres publiés et vérifiables | `/blog-conception/` et `/audits/` |

## Ce qui reste à faire

Par ordre d'utilité réelle, non par ordre de score.

1. **Les en-têtes de sécurité.** La production n'envoie ni `Content-Security-Policy`, ni `X-Content-Type-Options`, ni `X-Frame-Options`, ni `Referrer-Policy`, ni `Permissions-Policy`. Vérifié le 3 septembre. C'est le seul point du dernier audit qui soit à la fois solide, mesurable et sans contrepartie.
2. **La méta-description du site, 75 caractères**, contre 120 à 160 attendus.
3. **Le titre de l'accueil, 22 caractères**, contre une cible de 50 à 60. Attention, les deux outils se contredisent sur ce point : l'un veut 10 à 70, l'autre 30 à 60.
4. **`BreadcrumbList`**, et une identité stable pour les auteurs dans le schema, ce que le `BlogPosting` ne fait pas encore.
5. **Un alias `/sitemap.xml`.** Le sitemap existe sous son nom segmenté et il est déclaré partout, mais plusieurs outils cherchent ce chemin littéral.
6. **Le cache HTTP, et ce n'est pas dans les audits.** Mesuré le 3 septembre : aucune règle de `firebase.json` n'est appliquée, les actifs hachés reçoivent 24 h au lieu d'un an et les pages HTML 24 h au lieu de dix minutes. La cause est l'ordre des règles, l'attrape-tout `**` écrasant les précédentes. Un audit a même compté ce `max-age=86400` comme un point positif.

## Ce que nous refusons, et pourquoi

Cette section est la plus utile du document : elle évite qu'un prochain rapport fasse rouvrir des questions déjà tranchées.

**Le script tiers qui injecte le balisage.** Recommandé par un des outils pour « corriger automatiquement » la plupart des points. Le JSON-LD est du texte : il s'émet à la construction. Charger une bibliothèque tierce dans le navigateur du lecteur pour écrire du balisage sur un site qui envoie 2,5 ko de script serait une régression sur tous nos budgets, et une contradiction sur une page qui parle de sobriété.

**Le schema `FAQPage` fabriqué.** Proposé « pour augmenter le taux de citation jusqu'à 40 % ». Un blog n'est pas une foire aux questions, et inventer ce balisage est le genre de manipulation de données structurées que les moteurs sanctionnent. Le second rapport le reconnaît d'ailleurs : Google a retiré les résultats enrichis FAQ en mai 2026.

**Les `alt` sur les images décoratives.** Deux outils comptent `alt=""` comme un texte alternatif manquant. C'est un contresens : c'est le marquage correct d'une image qui n'apporte rien, un avatar à côté d'un nom déjà écrit, une icône dont le libellé est dans le texte. Y mettre du texte ferait lire deux fois la même chose par un lecteur d'écran, et axe-core le signalerait. Nous garderons donc un point « incomplet » sur cette ligne, en connaissance de cause.

**Le formatage rhétorique pour plaire à un modèle.** Une quarantaine de points demandent d'ajouter « d'un autre côté » pour paraître équilibré, des blocs question-réponse, des « vous devriez », des « notre étude montre », des témoignages, de la vidéo. Ce sont des recettes d'optimisation, pas des améliorations pour le lecteur. Nos articles sont écrits par des consultantes et des consultants sur ce qu'ils pratiquent ; c'est cela qui les rend citables.

**`hreflang`.** Sans objet, le site est monolingue et l'assume.

**Un service worker pour l'accès hors ligne.** Un site statique avec un cache HTTP correct n'a pas besoin d'un script pour rejouer ce que le navigateur fait déjà.

## Méthode

Les chiffres de ce document viennent du build, pas d'un score : `npm run build` puis lecture du `dist/`, `npm run check:eco` pour les poids et les requêtes, `npm run check:axe` pour la structure et l'accessibilité sur toutes les pages, et `curl` pour les en-têtes réellement servis.

Les audits externes sont utiles pour ce qu'ils trouvent, pas pour la note qu'ils donnent. Deux d'entre eux se contredisent sur la longueur du titre, deux comptent une image décorative comme un défaut, et l'un a noté un réglage de cache défaillant comme une réussite. Un rapport se lit, il ne s'applique pas.

Voir aussi [`REFERENTIEL-GREENIT.md`](REFERENTIEL-GREENIT.md) et [`REFERENTIEL-W3C-WSG.md`](REFERENTIEL-W3C-WSG.md) pour l'éco-conception, dont plusieurs règles servent aussi le référencement : ce qui est léger et bien structuré est lu plus facilement, par un humain comme par une machine.
