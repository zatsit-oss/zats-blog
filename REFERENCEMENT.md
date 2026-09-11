# Ce que le blog coche en SEO, AEO et GEO

État au 11 septembre 2026. Trois sigles pour trois lecteurs différents : **SEO** pour un moteur de recherche, **AEO** pour un moteur de réponse qui cite, **GEO** pour un modèle génératif qui reformule. Les trois demandent en grande partie la même chose, du HTML sémantique et du texte lisible sans exécuter de script, ce qui explique que ce site parte avec une avance.

Chaque ligne ci-dessous est vérifiable sur le site ou dans le dépôt. Le dernier audit externe, [seoscore.tools](https://seoscore.tools) le 3 septembre, donne **73/100, grade B** : SEO 77, AEO 72, GEO 67, contre des moyennes de 52, 28 et 13 sur deux mille sites scannés. 145 contrôles passés, 59 échoués, 19 sans objet.

## Un seul éditeur pour les trois sites

Le 11 septembre, les données structurées du blog ont été alignées sur celles que `zatsit.fr` et `sustainability.zatsit.fr` publient depuis le 9. L'écart tenait en une ligne et il coûtait cher : l'identifiant de l'organisation était dérivé du domaine du site, donc le blog publiait sa propre `Organization` à `blog.zatsit.fr/#organization` pendant que les deux autres s'ancraient sur `zatsit.fr/#organization`. Un moteur de réponse voyait deux entreprises homonymes au lieu d'un éditeur. Les trois sites partagent maintenant le même `@id`, le même logo et les mêmes profils.

Tout cela pèse **289 octets gzippés** sur l'accueil, mesurés : 21 452 contre 21 163 avant.

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
| Sitemap segmenté, généré au build | `sitemap-index.xml` et `sitemap-0.xml`, copiés sur `/sitemap.xml` |
| Directives d'indexation explicites | `index, follow, max-image-preview:large`, et `noindex` sur la 404 |
| Flux RSS | `/rss.xml` |
| Open Graph et carte Twitter complets sur 70 pages | titre, description, image absolue et dimensionnée, `og:type` correct |
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
| JSON-LD sur **69 pages sur 72**, émis au build | `src/utils/schema.ts` |
| `Organization` partagée avec les autres sites zatsit | `https://zatsit.fr/#organization`, le même identifiant partout |
| Ses faits vérifiables : adresse, contact, B Corp, EcoVadis | ceux que le pied de page imprime déjà, et rien d'autre |
| `BlogPosting` par article : titre, description, date, auteurs, mots-clés | et `publisher` par référence, pas dupliqué |
| `WebSite` du blog, et `WebPage` par page qui n'est pas un article | une page de liste ne se décrit plus comme le site entier |
| `BreadcrumbList` sur toutes les pages sous la racine | la catégorie sert de parent à l'article, qui est à la racine |
| Les 23 agents d'IA recensés ont accès | aucune règle par agent dans `robots.txt` |
| `llms.txt`, généré depuis la collection | `/llms.txt`, jamais périmé |
| Et il ouvre le reste du domaine | liens vers `zatsit.fr`, le portail, LinkedIn et GitHub |
| Signature d'auteur sur chaque article, et une page par auteur | `/authors/<prénom-nom>/` |
| Date de publication en `<time>` lisible par une machine | |
| Titres de section explicites, listes, tableaux, définitions | ce que le rapport relève comme « bien structuré pour l'IA » |
| Chiffres sourcés et liens externes vers les sources | 20 liens externes sur l'accueil |
| Contenu de fond : 1 559 mots sur un article récent | |

Les trois pages sans JSON-LD sont les redirections `/tags/` et `/markdown-page/`, qui n'ont rien à décrire, et la 404, qui porte `noindex` : une page qui existe sans être du contenu n'a pas à se décrire à un moteur de réponse.

## GEO

Ce qu'un modèle génératif attend pour **reformuler sans se tromper**. C'est la catégorie la plus jeune et la plus discutable des trois, et c'est là que les outils demandent le plus de choses contestables.

| Ce qui est en place | Vérifiable |
|---|---|
| Langue déclarée, site monolingue assumé | `lang="fr"` sur `<html>` |
| Un sujet par page, titre et contenu alignés | |
| Marque nommée de façon constante | titre, Open Graph et schema disent « zatsit » |
| Une seule organisation pour les trois sites | le blog, `zatsit.fr` et le portail partagent un identifiant |
| Deux liens `sameAs` faisant autorité | LinkedIn et GitHub de l'organisation |
| Taxonomies explicites et navigables | `/categories/` et 17 pages de tags |
| Fraîcheur datée et visible | date de publication, et les mesures portent la leur |
| Aucun contenu masqué, aucun mur, aucune interstitielle | rien à contourner pour lire |
| Nos propres chiffres publiés et vérifiables | `/blog-conception/` et `/audits/` |

## Ce qui reste à faire

Par ordre d'utilité réelle, non par ordre de score.

0. ~~Le *soft 404*~~ **corrigé le 3 septembre**, et c'était le défaut le plus coûteux de la liste, apparu le jour même de la bascule sans figurer dans aucun audit. Toute URL inconnue renvoyait **la page d'accueil avec un statut 200**, à l'octet près : `nginx` repliait sur `index.html`, motif d'une single-page application. Sous Docusaurus le routeur client affichait ensuite son écran d'erreur, ce qui masquait le mauvais statut ; Astro n'a pas de routeur client, donc un moteur était libre d'indexer une infinité de doublons de l'accueil et gardait chaque URL fausse au lieu de la laisser tomber. La vraie `404.html` était pourtant déployée depuis le début, elle n'était jamais choisie.

1. **Les en-têtes de sécurité, en attente de relecture** dans la PR [#32](https://github.com/zatsit-oss/zatsit-terraform/pull/32) du dépôt `zatsit-terraform`, et non ici : la production est servie par nginx sur Cloud Run, dont la configuration est générée par Terraform. Le `firebase.json` de ce dépôt les applique depuis le 3 septembre, mais **il ne sert que les canaux de preview**, ce qui est précisément le genre de confusion à ne pas entretenir. La CSP y est déclarée par site : `sustainability.zatsit.fr`, servi par le même nginx, charge son badge carbone depuis `unpkg.com` là où le blog l'auto-héberge, donc lui donner celle du blog casserait son badge.

   La CSP a été testée avant d'être posée, et ce test a évité une régression : sans `'wasm-unsafe-eval'`, la recherche mourait sur un `CompileError` de WebAssembly que seule la console du navigateur montre. Pagefind compile son index en WebAssembly.
2. **La méta-description du site, 75 caractères**, contre 120 à 160 attendus.
3. **Le titre de l'accueil, 22 caractères**, contre une cible de 50 à 60. Attention, les deux outils se contredisent sur ce point : l'un veut 10 à 70, l'autre 30 à 60.
4. ~~**`BreadcrumbList`**~~ **fait le 11 septembre**, sur l'implémentation que le site corporate avait éprouvée d'abord. Reste la part que cet item recouvrait aussi : **une identité stable pour les auteurs dans le schema**, que le `BlogPosting` ne donne toujours pas ; il nomme une `Person` sans l'ancrer sur `/authors/<prénom-nom>/#person`, donc rien ne relie deux articles du même auteur.
5. ~~**Un alias `/sitemap.xml`**~~ **fait le 11 septembre.** `@astrojs/sitemap` écrit toujours `<base>-index.xml` et le suffixe n'est pas configurable, donc un crochet de build recopie l'index sous le chemin littéral. Une redirection aurait été pire : Astro y répond par une page HTML à méta-rafraîchissement, et `text/html` n'est pas le type d'une réponse à un crawler qui demande un sitemap.
6. ~~Le cache HTTP~~ **corrigé le 3 septembre**, et ce n'était dans aucun audit : aucune règle de `firebase.json` ne s'appliquait, les actifs hachés recevaient 24 h au lieu d'un an et les pages 24 h au lieu de dix minutes. Pour les en-têtes, Firebase applique toutes les règles correspondantes et **la dernière écrase** : l'attrape-tout `**`, placé en fin de liste, annulait les trois autres. Il est désormais en tête. Un audit avait même compté ce `max-age=86400` comme une réussite.

   En production, c'était plus simple et plus grave : **aucun `Cache-Control` n'était envoyé du tout**, chaque navigateur décidait seul. Corrigé dans la PR [#31](https://github.com/zatsit-oss/zatsit-terraform/pull/31), qui porte les quatre durées dans la configuration nginx.

   Et c'est là qu'on a trouvé bien pire, que ce document lui-même affirmait sans le vérifier : **la production ne compressait rien.** `gzip on` était commenté, donc l'accueil partait à 72 407 octets au lieu de 21 163, un facteur 3,4. Or les poids annoncés dans ce document sont mesurés **gzippés**, sur l'hypothèse que l'hébergeur compresse. Ils décrivaient donc un site que personne ne recevait, sur le seul site où une revendication d'éco-conception est censée être vérifiable par le lecteur. Compression activée le 3 septembre, chiffres redevenus vrais.

   La cause était une ligne : `gzip_proxied` vaut `off` par défaut, donc nginx renonce à compresser dès qu'une requête porte un en-tête `Via`, et le load balancer estampille tout avec `Via: 1.1 google`.

7. **La carte sociale, 350x304 sur un fond transparent.** Ce n'est pas une carte, c'est un export de logo : le sigle au-dessus du nom, très en dessous des 1200x630 qu'attend `summary_large_image`, et sans fond, donc LinkedIn et Meta composent le bleu sur ce qu'ils veulent. Les dimensions annoncées sont désormais les vraies, ce qui est honnête sans être suffisant : l'asset est à refaire, et c'est un travail de design. Le site corporate porte exactement le même défaut sur le sien.

8. **L'organisation reste décrite trois fois.** Les trois sites pointent le même `@id`, ce qui était le but, mais chacun émet le nœud complet et le corporate comme le portail y ajoutent leur propre `description`, en français ici et en anglais là. Le blog n'en met aucune, pour ne pas décrire l'entreprise comme un blog. À trancher côté `@zatsit/components` plutôt qu'ici.

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
