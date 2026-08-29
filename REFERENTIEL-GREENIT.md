# Le blog zatsit face aux 119 bonnes pratiques du collectif Green IT

Évaluation du référentiel [cnumr/best-practices](https://github.com/cnumr/best-practices) appliquée à ce dépôt.

Le référentiel est souvent cité comme « les 115 règles » ; sa version publiée en compte **119 en français**, et c'est ce nombre qui est repris ici. Chaque verdict s'appuie sur une mesure du build ou sur un fichier du dépôt, jamais sur une intention.

Ce document a un pendant, [`REFERENTIEL-W3C-WSG.md`](REFERENTIEL-W3C-WSG.md), et une version en ligne sur [/audits/](https://blog.zatsit.fr/audits/). Les trois sont générés depuis `src/data/referentiel-greenit.json` : ne pas les modifier à la main, lancer `npm run docs:referentiels`.

## Résultat

| Statut | Nombre |
|---|---:|
| ✅ Respectée | 66 |
| 🟡 Partielle | 18 |
| ❌ Non respectée | 1 |
| ⬜ Sans objet | 34 |
| **Total** | **119** |

**66 règles respectées sur 85 qui engagent ce dépôt**, soit 78 %, plus 18 partielles et 1 non respectée.

### Ce qui reste à faire

Les seuls écarts qui coûtent quelque chose au lecteur, par ordre d'effort croissant :

1. **`robots.txt` absent** (BP_4008). Le sitemap est généré et segmenté, mais rien ne le déclare aux robots. Cinq lignes à écrire.
2. **Aucune feuille d'impression** (BP_027). C'est la seule règle en échec franc, et un article technique est typiquement ce qu'on imprime ou passe en PDF.
3. **La page 404 n'est pas servie** (BP_096). Le fichier existe, mais la production répond aujourd'hui par la page d'accueil en 200 sur une URL inconnue. Mesuré, inscrit au plan.
4. **Pas de stratégie de fin de vie des contenus** (BP_4031, BP_085). Rien n'est jamais dépublié et aucune règle d'archivage n'existe.

### Les trois quarts du travail sont structurels

La majorité des règles sont respectées non par optimisation mais par choix d'architecture : site statique, aucun CMS, aucune base de données, aucun traceur, aucun cookie, aucun framework côté client. Les règles sans objet le sont pour cette raison, et ce n'est pas une facilité : c'est le résultat de la décision de quitter Docusaurus, qui envoyait 135 ko de JavaScript compressé là où ce site en envoie 1,1.

---

## Spécification

*5 règles : 4 respectées, 1 sans objet.*

| Règle | Intitulé | Statut | Comment |
|---|---|---|---|
| `001` | Éliminer les fonctionnalités non essentielles | ✅ Respectée | Aucune fonctionnalité décorative : pas de carrousel, pas de commentaires, pas de partage automatisé. La recherche et le sommaire sont les deux seules briques interactives, chacune argumentée. |
| `002` | Quantifier précisément le besoin | ✅ Respectée | Le besoin est écrit dans `PLAN-MIGRATION.md` avec ses critères de sortie chiffrés, et la parité fonctionnelle avec Docusaurus est la borne : 45 routes, pas une de plus au départ. |
| `004` | Préférer la saisie assistée à l'autocomplétion | ⬜ Sans objet | Aucun formulaire de saisie sur le site. Le seul champ est la recherche, qui interroge un index local. |
| `4014` | S'assurer que les parcours utilisateurs permettent de réaliser leur action prévue | ✅ Respectée | Les parcours ont été vérifiés dans un navigateur réel plutôt que dans le HTML : recherche, tirage au hasard, navigation par catégorie, par tag et par auteur. |
| `4018` | Éliminer les fonctionnalités non utilisées | ✅ Respectée | Le pruneur Pagefind retire 408 ko d'interfaces inutilisées à chaque build, et une illustration du hero non retenue a été laissée hors du dépôt plutôt que gardée au cas où. |

## Conception

*23 règles : 15 respectées, 3 partielles, 5 sans objet.*

| Règle | Intitulé | Statut | Comment |
|---|---|---|---|
| `003` | Optimiser le parcours utilisateur | ✅ Respectée | Trois niveaux au plus depuis l'accueil : liste, article. Les taxonomies sont sur une page unique, `/categories/`, plutôt que dans un menu déroulant. |
| `005` | Favoriser un design simple, épuré, adapté au web | ✅ Respectée | Design sobre, deux thèmes, aucune image décorative en dehors de l'illustration du hero, qui est un SVG inline sans requête. |
| `006` | Privilégier une approche "mobile first", à défaut un chargement adaptatif | ✅ Respectée | Grilles en `auto-fit` et unités relatives, une seule feuille pour toutes les largeurs. Vérifié sans débordement horizontal sur les 68 pages à 390 px. |
| `007` | Respecter le principe de navigation rapide dans l’historique | ✅ Respectée | Navigation par liens classiques, aucun routeur client : le retour arrière du navigateur restitue la page depuis son cache. |
| `008` | Proposer un traitement asynchrone lorsque c'est possible | ⬜ Sans objet | Aucun traitement long côté client ni serveur : le site est entièrement généré à la publication. |
| `011` | Favoriser un développement sur-mesure à l'usage d'un CMS | ✅ Respectée | Aucun CMS : les articles sont des fichiers Markdown dans un dépôt git, lus en place par le loader. |
| `013` | Favoriser les pages statiques | ✅ Respectée | Toutes les pages sont statiques, générées au build. Aucun serveur n'exécute quoi que ce soit pendant la lecture, ce que la page d'éco-conception affirme au lecteur. |
| `014` | Créer une architecture applicative modulaire | ✅ Respectée | Composants Astro à responsabilité unique, un `PostCard` partagé par cinq surfaces, les jetons de style dans une couche à part. |
| `039` | Éviter les animations JavaScript / CSS | 🟡 Partielle | Une seule animation, l'arrivée du nuage du hero, en une passe et non en boucle, mesurée à 158 recalculs contre 720 pour une boucle. Toutes les transitions sont neutralisées sous `prefers-reduced-motion`. |
| `040` | N'utilisez que les portions indispensables des bibliothèques JavaScript et frameworks CSS | ✅ Respectée | Aucun framework CSS, aucune bibliothèque JavaScript côté client. Le seul script partagé pèse 4 ko non compressé pour tout le site. |
| `064` | Mettre en cache les données calculées souvent utilisées | ✅ Respectée | Le temps de lecture, les extraits et les décomptes sont calculés une fois au build, pas à chaque affichage. |
| `073` | Ne se connecter à une base de données que si nécessaire | ⬜ Sans objet | Aucune base de données. |
| `076` | Éviter le transfert d'une grande quantité de données pour réaliser un traitement | ✅ Respectée | Le contenu est lu en place dans le dépôt voisin par le loader, sans copie ni synchronisation, ce qui évite de déplacer les fichiers à chaque build. |
| `096` | Afficher des pages d'erreurs statiques | 🟡 Partielle | `404.html` est bien généré, statique, 37 ko. Mais la production actuelle sert la page d'accueil en 200 sur une URL inconnue, ce qui est pire qu'une 404 : c'est mesuré et inscrit au plan. |
| `110` | N'utiliser que des fichiers double opt-in | ⬜ Sans objet | Aucune liste de diffusion. |
| `4011` | Réduire le volume de données stockées au strict nécessaire | ✅ Respectée | Le dépôt ne stocke que le nécessaire : les images des auteurs sont redimensionnées à 512 px, et une photo de 1,2 Mo a été ramenée à 12 ko. |
| `4015` | Avoir un titre de page et une metadescription pertinents avec le contenu de la page | ✅ Respectée | Titre et méta-description propres à chaque page, la description d'un article étant dérivée de son texte plutôt que dupliquée. |
| `4016` | Utiliser la version la plus récente du langage | ✅ Respectée | Astro 7.2, Node 22.12 minimum, dépendances à jour. Le dépôt suit les mises à jour et refuse celles qui cassent, cas documenté du bump webpack. |
| `4019` | Préférer une PWA à une application mobile native similaire au site web | ⬜ Sans objet | Aucune application mobile : le site est une page web. |
| `4021` | Mettre en place une architecture élastique | ⬜ Sans objet | Site statique : pas d'architecture à dimensionner. |
| `4022` | Limiter le nombre d'appels aux API HTTP | 🟡 Partielle | Deux appels d'API par page, ceux des badges, dont l'un est mis en cache un jour côté navigateur. C'est le prix assumé d'une mesure vérifiable par le lecteur. |
| `4030` | Limiter le recours aux carrousels | ✅ Respectée | Aucun carrousel, et c'est une règle explicite du projet. |
| `4035` | Préférer la pagination au défilement infini | ✅ Respectée | Pagination classique, jamais de défilement infini : 10 articles sur la première page, 9 sur les suivantes. |

## Réalisation

*43 règles : 29 respectées, 5 partielles, 1 non respectée, 8 sans objet.*

| Règle | Intitulé | Statut | Comment |
|---|---|---|---|
| `009` | Limiter le nombre de requêtes HTTP | ✅ Respectée | 9 à 11 requêtes initiales selon la page, pour un budget interne de 25. Docusaurus en faisait 5 à 16 pour un poids 3 à 40 fois supérieur. |
| `010` | Stocker les données statiques localement | ✅ Respectée | L'index de recherche Pagefind est chargé à la demande et mis en cache par le navigateur ; la préférence de thème est en `localStorage` ; le badge carbone met son résultat en cache un jour. |
| `015` | Choisir les technologies les plus adaptées | ✅ Respectée | Astro en génération statique, choisi contre Docusaurus précisément pour ne pas embarquer React côté client. 135 ko de JS gzip deviennent 1,1 ko. |
| `016` | Utiliser certains forks applicatifs orientés "performance" | ⬜ Sans objet | Aucun fork applicatif : Astro et Sätteri sont utilisés dans leur version publiée. |
| `017` | Choisir un format de données adapté | ✅ Respectée | WebP pour les images matricielles, SVG pour les tracés, Markdown pour le contenu, YAML pour les auteurs. Aucun format propriétaire. |
| `019` | Remplacer les boutons officiels de partage des réseaux sociaux | ✅ Respectée | Les boutons officiels sont refusés : le partage est une ancre vers l'URL d'intention de LinkedIn, sans script tiers. Le bouton X a été retiré le 28 août faute d'usage. |
| `021` | Découper les CSS | ✅ Respectée | Astro découpe la CSS par composant et n'envoie que celle des composants rendus ; la feuille d'un article ne part pas sur la page des auteurs. |
| `022` | Limiter le nombre de CSS | ✅ Respectée | 5 fichiers CSS au total dans le build, dont la plupart inlinés sous 4 ko. Une page en charge 1 à 2. |
| `023` | Préférer les CSS aux images | ✅ Respectée | Aucune image d'interface : bordures, rayons et couches tonales sont en CSS. Les icônes sont des SVG inline. |
| `024` | Écrire des sélecteurs CSS efficaces | ✅ Respectée | Sélecteurs de classe à un niveau, portés par Astro. Aucun sélecteur descendant profond ni `*` en dehors du reset. |
| `025` | Grouper les déclarations CSS similaires | ✅ Respectée | Les valeurs communes passent par des variables CSS dans `src/styles/tokens/`, ce qui factorise les déclarations au lieu de les répéter. |
| `026` | Utiliser les notations CSS abrégées | 🟡 Partielle | Les propriétés logiques (`margin-block`, `padding-inline`) sont utilisées, mais lisibilité privilégiée sur l'abréviation systématique. L'écart est marginal après minification. |
| `027` | Fournir une CSS print | ❌ Non respectée | Aucune feuille d'impression. Un article de blog technique est un candidat légitime à l'impression ou au PDF, et rien n'est prévu. |
| `029` | Favoriser les polices standards | 🟡 Partielle | Poppins est auto-hébergée en woff2 latin, sous-ensemble et préchargée, avec 3 graisses seulement. Ce n'est pas une police standard, mais c'est la police de la marque et son coût est mesuré à 48,5 ko pour 6 fichiers. |
| `030` | Préférer les glyphes aux images | ✅ Respectée | Toutes les icônes sont des SVG dessinés au trait, aucune image matricielle d'interface, aucune police d'icônes. |
| `031` | Valider les pages auprès du W3C | 🟡 Partielle | Aucune validation W3C automatisée dans la CI. En revanche `astro check` (TypeScript) et axe-core sur 68 pages couvrent la structure et l'accessibilité. |
| `032` | Externaliser les CSS et JavaScript | 🟡 Partielle | La CSS partagée est externalisée et mise en cache ; celle sous 4 ko est inlinée par choix d'Astro, ce qui économise une requête sur une première visite. Le seul script de page est inline pour la même raison. |
| `034` | Ne pas redimensionner les images coté navigateur | ✅ Respectée | `astro:assets` produit chaque image aux dimensions utiles, avec `width` et `height` explicites. Un service maison plafonne à 1366 px ce que personne n'a dimensionné. |
| `037` | Utiliser le chargement paresseux | ✅ Respectée | `loading="lazy"` sur toutes les images sous la ligne de flottaison, et l'index de recherche n'est chargé qu'à la première frappe. |
| `038` | Utiliser le rechargement partiel d'une zone de contenu | ⬜ Sans objet | Pas de rechargement partiel : les pages sont statiques et le navigateur les met en cache. |
| `041` | Ne pas faire de modification du DOM lorsqu’on le traverse | ✅ Respectée | Les rares scripts (thème, copie de code, recherche) ne parcourent pas le DOM en le modifiant ; la copie utilise une délégation d'évènement. |
| `042` | Rendre les éléments du DOM invisibles lors de leur modification | ⬜ Sans objet | Aucune modification massive du DOM : les pages sont rendues au build. |
| `043` | Réduire au maximum le repaint (appearence) et le reflow (layout) | ✅ Respectée | Piège déjà payé et documenté : animer une transformation sur un élément SVG repasse par la mise en page à chaque image. Les animations retenues sont composées, en une passe. |
| `044` | Utiliser la délégation d'évènements | ✅ Respectée | Le bouton de copie utilise un seul écouteur délégué pour toute la page, précisément parce que les articles les plus fournis ont des dizaines de blocs de code. |
| `045` | Modifier plusieurs propriétés CSS en 1 seule fois | ✅ Respectée | Les changements d'apparence passent par une classe ou un attribut `data-theme`, jamais par des écritures de style successives. |
| `046` | Valider votre code avec un Linter | ✅ Respectée | `astro check` sur 52 fichiers à zéro erreur, plus trois portes de qualité : contraste, poids et axe-core. Toutes échouent avec un code de sortie non nul. |
| `049` | Mettre en cache les objets souvent accédés en JavaScript | ✅ Respectée | Les scripts mémorisent leurs références (`link`, `status`) plutôt que de réinterroger le DOM. |
| `054` | Réduire les accès au DOM via JavaScript | ✅ Respectée | Même réponse : quatre scripts au total, chacun avec un accès au DOM minimal et mémorisé. |
| `072` | Éviter d'effectuer des requêtes SQL à l’intérieur d’une boucle | ⬜ Sans objet | Aucune base de données. |
| `075` | Optimiser les requêtes aux bases de données | ⬜ Sans objet | Aucune base de données. |
| `078` | Compresser les fichiers CSS, JavaScript, HTML et SVG | ✅ Respectée | Compression assurée par la couche d'hébergement. Le gate de poids mesure d'ailleurs le texte gzippé, ce qui est la mesure honnête. |
| `080` | Optimiser les images | ✅ Respectée | Toutes les images passent par `astro:assets` : WebP, dimensions plafonnées, `srcset` de six paliers calé sur les largeurs réellement mesurées, ce qui a divisé par deux le poids d'images d'un article sur téléphone. |
| `082` | Optimiser la taille des cookies | ✅ Respectée | Aucun cookie n'est posé par le site. |
| `4004` | Utiliser les compartiments CSS | 🟡 Partielle | `content-visibility` n'est pas utilisé. Les pages sont assez courtes pour que le gain soit théorique, mais la piste n'a pas été mesurée. |
| `4005` | Fournir une alternative textuelle aux contenus multimédias | ✅ Respectée | `alt` sur chaque image, vide pour les décoratives, et les icônes en `aria-hidden` puisque le texte voisin les nomme. Vérifié par axe sur les 68 pages. |
| `4007` | Économiser de la bande passante grâce à un Service Worker | ⬜ Sans objet | Aucun service worker, et c'est cohérent : un site statique avec un bon cache HTTP n'a pas besoin d'un script pour rejouer ce que le navigateur fait déjà. |
| `4009` | Assurer la compatibilité avec les plus anciens appareils et logiciels du parc | ✅ Respectée | HTML sémantique sans framework client : la page reste lisible sans JavaScript, y compris la navigation, les articles et le bouton de tirage au hasard. |
| `4013` | Limiter le recours aux canvas | ✅ Respectée | Aucun élément `canvas`. |
| `4017` | Ne charger des données/du code que lorsqu'elles sont/il est nécessaire | ✅ Respectée | L'index de recherche n'est chargé qu'à la première interaction, et les images sous la ligne de flottaison en différé. |
| `4020` | Éviter les temps de blocages par des traitements JavaScript trop longs | ✅ Respectée | 4 ko de JavaScript pour tout le site, aucun traitement long. Rien ne peut bloquer le fil principal de façon perceptible. |
| `4037` | Bien choisir son thème et limiter le nombre d'extensions dans un CMS | ⬜ Sans objet | Aucun CMS, aucune extension. |
| `4038` | Sécuriser l'accès à l'administration | ⬜ Sans objet | Aucune interface d'administration : la publication passe par une revue de pull request. |
| `4039` | Ne pas afficher les documents à l'intérieur des pages | ✅ Respectée | Aucun document intégré dans une page : ni PDF, ni iframe de visionneuse. |

## Production

*26 règles : 10 respectées, 5 partielles, 11 sans objet.*

| Règle | Intitulé | Statut | Comment |
|---|---|---|---|
| `018` | Limiter le nombre de domaines servant les ressources | 🟡 Partielle | Un seul domaine sert le site et ses ressources. Deux exceptions assumées et documentées : `api.websitecarbon.com` et `bff.ecoindex.fr`, tous deux pour un badge que le lecteur doit pouvoir vérifier. |
| `057` | Utiliser tous les niveaux de cache du CMS | ⬜ Sans objet | Aucun CMS. |
| `070` | Supprimer tous les warnings et toutes les notices | ✅ Respectée | Le build et `astro check` sont à zéro avertissement, et la console est vérifiée vide sur les 68 pages lors du balayage axe. |
| `077` | Minifier les fichiers CSS, JavaScript, HTML et SVG | ✅ Respectée | `compressHTML: true`, et Astro minifie CSS et JavaScript en production. |
| `079` | Combiner les fichiers CSS et JavaScript | ✅ Respectée | Un seul fichier JavaScript pour tout le site, et la CSS regroupée par composant partagé plutôt qu'éclatée par page. |
| `084` | Favoriser HSTS Preload list aux redirections 301 | 🟡 Partielle | Deux redirections servies par `meta refresh` généré par Astro, faute d'API de redirection chez l'hébergeur cible. HSTS relève de la couche d'hébergement, non traitée ici. |
| `086` | Choisir un hébergeur "éco-responsable" | 🟡 Partielle | Hébergement Google Cloud Storage aujourd'hui, migration vers Clever Cloud prévue après la refonte. Le badge CO2.js suppose volontairement un hébergement non renouvelable, ce qui est la lecture pessimiste. |
| `087` | Privilégier un fournisseur d'électricité écoresponsable | ⬜ Sans objet | Le choix du fournisseur d'électricité ne relève pas de ce dépôt. |
| `088` | Adapter la qualité de service et le niveau de disponibilité | ✅ Respectée | Site statique servi par un stockage d'objets : le niveau de service est celui d'un fichier, sans processus applicatif à maintenir disponible. |
| `089` | Utiliser des serveurs virtualisés | ⬜ Sans objet | Aucun serveur : le site est servi depuis un stockage d'objets. |
| `090` | Optimiser l'efficacité énergétique des serveurs | ⬜ Sans objet | Ne relève pas de ce dépôt. |
| `091` | Installer le minimum requis sur le serveur | ✅ Respectée | Rien n'est installé pour servir le site : ce sont des fichiers statiques derrière un nginx partagé par les six sites externes. |
| `092` | Mettre les caches entièrement en RAM (opcode et kvs) | ⬜ Sans objet | Aucun cache applicatif : pas d'application. |
| `093` | Stocker les données dans le cloud | ✅ Respectée | Les fichiers sont dans un stockage d'objets, sans serveur dédié allumé pour les servir. |
| `094` | Héberger les ressources (CSS/JS) sur un domaine sans cookie | ✅ Respectée | Aucun cookie n'est posé, donc aucune ressource n'en transporte. |
| `097` | Utiliser un serveur asynchrone | ⬜ Sans objet | Aucun serveur applicatif. |
| `098` | Utiliser un CDN | 🟡 Partielle | Aucun CDN aujourd'hui, ce qui est un choix : la règle vise la latence, et l'audience est nationale. La question est ouverte pour la bascule. |
| `099` | Utiliser un cache HTTP | ✅ Respectée | Cache HTTP réglé par famille de ressources dans `firebase.json` : un an immuable pour les actifs hachés, revalidation pour l'index de recherche, dix minutes pour les pages. |
| `101` | Ajouter des entêtes Expires ou Cache-Control | ✅ Respectée | Quatre règles `Cache-Control` explicites, avec le raisonnement de chacune en commentaire dans le fichier. |
| `102` | Mettre en cache les réponses AJAX | ⬜ Sans objet | Aucune requête AJAX en dehors des deux badges, dont l'un met son résultat en cache un jour. |
| `103` | Réduire au nécessaire les logs des serveurs | ⬜ Sans objet | Les journaux relèvent de la couche d'hébergement. |
| `104` | Désactiver le DNS lookup d’Apache | ⬜ Sans objet | Aucun Apache. |
| `105` | Apache Vhost : désactiver le AllowOverride | ⬜ Sans objet | Aucun Apache. |
| `4006` | Privilégier HTTP/2 à HTTP/1 | ✅ Respectée | HTTP/2 confirmé en production : la réponse de `blog.zatsit.fr` est en HTTP/2. |
| `4008` | Mettre en place un sitemap efficient | 🟡 Partielle | Le sitemap est généré et segmenté (`sitemap-index.xml` et `sitemap-0.xml`), mais **aucun `robots.txt` ne le référence**, ce qui est un manque réel et facile à combler. |
| `4012` | Mettre en place une politique d'expiration et suppression des données | ⬜ Sans objet | Aucune donnée personnelle collectée, donc aucune politique d'expiration à écrire. |

## Utilisation

*15 règles : 7 respectées, 2 partielles, 6 sans objet.*

| Règle | Intitulé | Statut | Comment |
|---|---|---|---|
| `035` | Eviter d'utiliser des images matricielles pour l'interface | ✅ Respectée | Aucune image matricielle dans l'interface. Les 6 PNG et JPEG du build sont des logos tiers et des illustrations d'articles. |
| `036` | Optimiser les images vectorielles | 🟡 Partielle | Les SVG d'interface sont écrits à la main, donc minimaux. Ceux qui viennent des articles ne passent pas par un optimiseur type SVGO. |
| `058` | Optimiser et générer les médias avant importation sur un CMS | ⬜ Sans objet | Aucun CMS. Les médias sont optimisés au build par `astro:assets`. |
| `060` | Encoder les sons en dehors du CMS | ⬜ Sans objet | Aucun contenu sonore. |
| `107` | Compresser les documents | ✅ Respectée | Aucun document téléchargeable n'est publié par le site. |
| `108` | Optimiser les PDF | ⬜ Sans objet | Aucun PDF publié. |
| `109` | Limiter les e-mails lourds et redondants | ⬜ Sans objet | Le site n'envoie aucun courriel. |
| `111` | Limiter la taille des e-mails envoyés | ⬜ Sans objet | Le site n'envoie aucun courriel. |
| `112` | Adapter les sons aux contextes d'écoute | ⬜ Sans objet | Aucun contenu sonore. |
| `113` | Adapter les textes au web | ✅ Respectée | Justification en `ch` pour tenir la ligne entre 65 et 75 caractères, chapô, sommaire à deux niveaux, temps de lecture affiché. Le texte est le contenu du site. |
| `114` | Adapter les vidéos aux contextes de visualisation | 🟡 Partielle | Aucune vidéo hébergée. Un article intègre des vidéos de conférence, hors de notre maîtrise. |
| `4001` | Limiter les outils d'analytics et les données collectées | ✅ Respectée | Aucun outil d'analytique, aucun traceur, aucun cookie. La charte l'interdit explicitement et le build le confirme. |
| `4002` | Limiter l'utilisation des GIFs animés | ✅ Respectée | Aucun GIF animé dans le corpus : les illustrations sont en WebP ou en SVG. |
| `4003` | Éviter la lecture et le chargement automatique des vidéos et des sons | ✅ Respectée | Aucune lecture automatique : le site ne porte ni son ni vidéo en propre. |
| `4036` | Entretenir son site régulièrement | ✅ Respectée | Le dépôt est entretenu en continu, avec un journal des décisions et des pièges dans `CLAUDE.md` et `PLAN-MIGRATION.md`. |

## Support et maintenance

*2 règles : 1 partielle, 1 sans objet.*

| Règle | Intitulé | Statut | Comment |
|---|---|---|---|
| `095` | Éviter les redirections | 🟡 Partielle | Deux redirections seulement, toutes deux voulues, `/markdown-page/` et `/tags/`, et aucune chaîne de redirection. Elles sont des `meta refresh` plutôt que des 301, ce qui reste à porter par la couche d'hébergement. |
| `106` | Désactiver les logs binaires | ⬜ Sans objet | Aucun Apache. |

## Fin de vie

*1 règles : 1 partielle.*

| Règle | Intitulé | Statut | Comment |
|---|---|---|---|
| `085` | Mettre en place un plan de fin de vie du site | 🟡 Partielle | Le plan de migration prévoit la fin de vie de la coque Docusaurus, mais aucun plan de fin de vie n'est écrit pour le blog lui-même. |

## Non classées par le référentiel

*4 règles : 1 respectée, 1 partielle, 2 sans objet.*

| Règle | Intitulé | Statut | Comment |
|---|---|---|---|
| `4031` | Avoir une stratégie de fin de vie des contenus | 🟡 Partielle | Les articles ne sont jamais dépubliés et aucune règle d'archivage n'existe. La page `/archive/` liste tout, ce qui est le contraire d'une stratégie de fin de vie. |
| `4032` | Mettre en place un "Circuit breaker" | ⬜ Sans objet | Aucun appel serveur à protéger. Les deux badges dégradent proprement si leur API ne répond pas. |
| `4033` | Favoriser le "Request collapsing" | ⬜ Sans objet | Aucune requête concurrente à regrouper. |
| `4034` | S’appuyer sur les services managés | ✅ Respectée | Hébergement en stockage d'objets managé, sans serveur à administrer. |

---

## Méthode

Chaque verdict a été posé en relisant le code concerné et, quand la règle porte sur un comportement, en mesurant le build : `npm run check:eco` pour les poids et les requêtes, `npm run check:axe` pour l'accessibilité sur toutes les pages dans les deux thèmes et aux deux largeurs, et Chrome piloté en CDP pour ce qui ne se lit pas dans le HTML.

Source : [https://github.com/cnumr/best-practices](https://github.com/cnumr/best-practices), 119 règles, version française publiée. Évalué le 29/08/2026.

*Fichier généré par `npm run docs:referentiels`. Ne pas le modifier à la main.*
