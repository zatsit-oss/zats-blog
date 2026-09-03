# Plan de migration : Docusaurus → Astro

Ce document ne sert plus qu'à deux choses : dire **ce qui reste à faire** et rappeler **les décisions qui ne sont pas à rouvrir**. Le journal de la migration a été retiré, il est dans l'historique git ; les règles qui en découlent sont dans [CLAUDE.md](CLAUDE.md), le document lu avant d'écrire du code.

Branche : **`migration-astro`** dans les deux dépôts.

| Dépôt | Rôle |
|---|---|
| `zats-blog` | la coque : layouts, thème, schéma, build |
| `zats-blog-content` | les articles et leurs assets, aucun outillage Astro |
| `zats-websites` | référence d'implémentation Astro ; projet Tailwind, donc à relire et non à copier |
| [Zatsit Design System](https://claude.ai/design/p/34f5e88a-fa9f-49cc-9a99-1383413a3a3a) | jetons, assets de marque, règles éditoriales |

## Où en est la migration

**Terminée et en production depuis le 3 septembre 2026.** Astro 7.2, 21 articles chargés depuis le dépôt voisin, les 45 routes de référence servies en ligne, les quatre portes de qualité au vert.

Ce que la migration a changé, mesuré et non supposé :

| | Docusaurus | Astro |
|---|---|---|
| Poids initial, texte gzippé | 243 à 3 324 ko | **65 à 81 ko** |
| JS client | 135 ko gzip | **2,5 ko** |
| Pages sous le budget de 1 Mo au total | 0 / 45 | **72 / 72** |
| Contrastes vérifiés | aucun | 16 appariements et les couleurs Shiki, deux thèmes |

La ligne de base est conservée dans [`baseline-docusaurus.md`](.claude/skills/eco-check/references/baseline-docusaurus.md).

Une phase de mise en forme s'est ajoutée au plan d'origine, née de la relecture de la preview : le site était fonctionnellement complet et visuellement inabouti. Elle est faite.

## La bascule est faite

**Le 3 septembre 2026.** La coque est mergée, le contenu aussi, et `blog.zatsit.fr` sert la version Astro. Vérifié en ligne et non dans le build : les 45 routes de [`migration-routes-docusaurus.txt`](migration-routes-docusaurus.txt) répondent, la formule est rendue en MathML, l'index de recherche est servi.

Trois défauts de production sont apparus le jour même, tous dans la couche nginx et aucun dans ce dépôt. Deux sont corrigés, le troisième est en attente de relecture :

| Défaut | État |
|---|---|
| Une URL inconnue servait l'accueil en **200** | **corrigé**, vraie 404 |
| Aucune compression : 72 ko au lieu de 21 sur l'accueil | **corrigé**, `−71 %` |
| Aucun `Cache-Control` ni en-tête de sécurité | en attente, PR [#31](https://github.com/zatsit-oss/zatsit-terraform/pull/31) et [#32](https://github.com/zatsit-oss/zatsit-terraform/pull/32) du dépôt `zatsit-terraform` |

Les deux premiers ont été appliqués directement au secret pour arrêter l'hémorragie, ce qui est une dérive que la PR #31 résorbe. **Un `terraform apply` avant son merge peut les annuler**, `NGINX_CONF_VERSION` étant dérivé de la version du secret par Terraform.

La leçon qui compte est dans `CLAUDE.md` : `check:eco` mesurait le texte gzippé en supposant que l'hébergeur compresse, la porte est restée verte toute la migration, et les poids publiés décrivaient un site que personne ne recevait.

## Ce qui reste

| Sujet | État |
|---|---|
| `Cache-Control` et en-têtes de sécurité en production | dans les deux PR ci-dessus, à merger avant tout `apply` |
| Migration vers un Cellar Clever Cloud | reportée après la refonte technique, voir D3 bis |
| Audit RGAA | acquis sur le principe, à cadrer, voir D7 |
| `ECOINDEX_URL` et `MEASURED_PAGE_BYTES` | à rafraîchir : la production sert enfin de l'Astro compressé |
| Doublons SVG dans `dist/` | non traité |
| `migration-routes-docusaurus.txt` | supprimable, les 45 routes ayant été vérifiées en ligne |
| CSP de `sustainability.zatsit.fr` | aucune : ce site charge son badge carbone depuis `unpkg.com` là où le blog l'auto-héberge, donc lui donner celle du blog le casserait |

Deux points de référencement restent connus et non traités : la méta-description du site fait 75 caractères contre 120 à 160 attendus, et il manque un `BreadcrumbList`. Le reste est dans [REFERENCEMENT.md](REFERENCEMENT.md).

## Décisions à ne pas rouvrir

**D1. Dernière version stable d'Astro**, épinglée à l'installation. L'écart avec `zats-websites` est sans conséquence : aucun paquet Astro maison n'est utilisé.

**D2. Coque entièrement neuve**, remplacement en place, sans dossier `astro/` transitoire.

**D3. La production reste sur le bucket Google Cloud Storage**, les previews sur des canaux Firebase. Le corollaire d'architecture est tenu : **build et déploiement sont découplés**, l'étape de build ne sait rien de la cible, pour qu'un changement d'hébergeur soit un changement d'un fichier.

**D3 bis. Cellar : instruit, puis reporté** après la refonte technique. Tout est mesuré dans la section suivante.

**D4. Les maths sont conservées.** Une formule dans tout le corpus, rendue en MathML par `src/plugins/mdast-math.mjs`, sans feuille de style ni police. Les pièges que ça a coûtés sont dans CLAUDE.md.

**D5. Les jetons CSS viennent du design system**, copiés en CSS pur dans `src/styles/tokens/`, dans l'ordre primitives → sémantique. Ils sont donc figés : une resynchronisation est un geste explicite.

**D6. Une seule entrée de menu pour les deux taxonomies**, les tags en index alphabétique sans compteur sur `/categories/`, et le mot lu par le lecteur est **« tag »**. Les règles complètes, dont le refus de valider les tags et celui de les graduer par fréquence, sont dans les conventions de CLAUDE.md.

**D7. Un audit RGAA, plus tard.** Le principe est acquis : faire pour l'accessibilité ce que `/audits/` fait pour l'éco-conception. La source est exploitable, la DINUM publiant le RGAA 4.1 en JSON, 106 critères en 13 thématiques, donc la même mécanique que les deux référentiels déjà traités.

Trois limites à poser d'emblée, sinon l'audit mentira.

1. **Ne pas publier un rapport axe comme s'il valait audit.** axe couvre de l'ordre du tiers des critères : il voit un `alt` manquant, jamais un `alt` qui mente ; un contraste, jamais un ordre de lecture absurde. Son résultat prouve un critère donné, il ne remplace pas l'évaluation.
2. **Pas de lecteur d'écran ici.** Une dizaine de critères demandent une restitution réelle et devront être marqués « à vérifier ».
3. **Beaucoup de critères sans objet** sur ce site : formulaires, multimédia, cadres. Comme pour l'éco, c'est l'information la plus honnête du compte.

Reste à arbitrer si zatsit est légalement tenue de publier une déclaration d'accessibilité.

## Ce que Cellar ne sait pas faire

Mesuré sur un Cellar réel, celui de `greenscore.zatsit.fr`, fin août et début septembre 2026. Ce dossier existe pour que rien ne soit à refaire le jour où le sujet revient.

**Ce qui fonctionne.** L'index de répertoire : un objet `prefixe/index.html` est servi en 200 sur `/prefixe/`, donc les 45 routes, toutes en `/<slug>/`, passent tel quel. C'était le risque le plus lourd, il est levé. `Cache-Control` fonctionne, posé objet par objet à l'envoi. Et un CNAME vers `cellar-c2` déclenche bien l'émission d'un certificat Let's Encrypt au nom exact du domaine.

**Quatre choses que le Cellar seul ne fait pas :**

1. **Aucune page d'erreur.** Une clé absente rend le XML `AccessDenied` en 403, jamais le `/404.html` du build. Et un 403 n'a pas les conséquences d'un 404 pour un moteur, qui garde l'URL au lieu de la laisser tomber.
2. **Aucune redirection du chemin sans slash.** `/<slug>` répond 403, pas une 301. Le contrat des 45 routes est tenu, mais un lien recopié sans slash casse, là où l'hébergement actuel redirige.
3. **Aucune redirection par objet.** `--website-redirect-location` est accepté et stocké, mais jamais appliqué au GET : l'écriture silencieuse est le piège.
4. **Aucun en-tête de sécurité.** Un stockage S3 ne transmet que ses en-têtes système, et une métadonnée personnalisée ressort préfixée `x-amz-meta-`, inutilisable. Les cinq en-têtes de `firebase.json` ne couvrent donc que la preview.

**L'API de configuration de site statique n'existe pas** : `GET /bucket?website` répond 405, en lecture comme en écriture. Il n'y a rien à y régler, l'index de répertoire venant du proxy de Clever.

Deux constats qui ferment des pistes. Une policy accordant `s3:ListBucket` à l'anonyme fait bien passer le 403 en 404 `NoSuchKey`, mais rend le bucket **énumérable**, et la conditionner par `s3:prefix` ramène le 403 ; le corps reste du XML de toute façon. Et il n'y a **aucune policy de bucket** sur greenscore : la publication repose sur une ACL `public-read` posée objet par objet, si bien qu'un dépôt sans `--acl public-read` est écrit mais invisible, ce qui ressemble à une panne de droits plutôt qu'à un oubli. Pour le blog, une policy sur `/*` dans le Terraform serait plus robuste.

**Le comportement actuel n'est pas un modèle à reproduire.** Sur `blog.zatsit.fr`, une URL inconnue renvoie 200 avec la page d'accueil à l'octet près : le repli est réglé sur `index.html` et c'est le routeur client de Docusaurus qui affiche ensuite son erreur. Astro n'a pas de routeur client, donc le même réglage servirait l'accueil sur n'importe quelle URL fausse, en 200, sans le dire au lecteur. C'est pire que le XML, qui au moins ne mente pas.

L'arbitrage se réduit à trois options, sans rouvrir le refus de déployer une application frontale : assumer le XML sur les URLs inconnues, à coût nul ; ne pas déplacer l'hébergement, ce qui est la voie prise ; ou un CDN devant le bucket.

## Critères d'acceptation

| Critère | État |
|---|---|
| `npm run build` passe, 21 articles, zéro erreur Zod, toutes les dates résolues | ✅ |
| Les 45 routes de référence sont produites | ✅ 45 / 45 |
| Parité fonctionnelle : listing paginé, article, tags, recherche, RSS, sitemap, admonitions, bouton copier, temps de lecture | ✅ |
| Conformité au design system, aucun hexadécimal brut dans le code | ✅ |
| Double thème complet, bascule sans flash, `prefers-color-scheme` et `prefers-reduced-motion` respectés | ✅ |
| Poppins auto-hébergée en woff2 latin, aucune requête de police vers un tiers | ✅ 6 fichiers, 48,5 ko |
| `<head>` complet : canonical, Open Graph, carte Twitter, `article:published_time` | ✅ |
| Poids de page et JS client sous la ligne de base Docusaurus | ✅ `check:eco` au vert sur 72 pages |
| WCAG 2.1 AA vérifiée et non supposée | ✅ `check:a11y` et `check:axe` au vert |
| Aucun article modifié, ou modification documentée | ✅ |
| Aperçu de partage vérifié sur LinkedIn et X | ⬜ demande des URLs publiques |
| Badge EcoIndex revérifié en production | ⬜ dépend de la bascule |

Un seul écart assumé sur les URLs : `/markdown-page/` est servie en redirection vers la racine plutôt qu'en page, son contenu Docusaurus étant du remplissage de gabarit en anglais sur un blog francophone. L'URL continue de résoudre.

La vérification des routes est reproductible :

```bash
find dist -name "*.html" | sed 's|^dist||;s|/index.html$|/|;s|^/404.html$|/404|' | sort -u
```
