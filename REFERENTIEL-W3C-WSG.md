# Le blog zatsit face aux Web Sustainability Guidelines du W3C

Évaluation des [Web Sustainability Guidelines](https://www.w3.org/TR/web-sustainability-guidelines/) appliquée à ce dépôt.

Le référentiel compte **71 lignes directrices** regroupant **196 critères de succès**, en quatre domaines. Ce document évalue les 71 lignes directrices, chacune couvrant ses critères ; c'est l'unité lisible, et le nombre de critères de chaque ligne figure dans la colonne « Critères ».

Ce document a un pendant, [`REFERENTIEL-GREENIT.md`](REFERENTIEL-GREENIT.md), et une version en ligne sur [/audits/](https://blog.zatsit.fr/audits/). Les trois sont générés depuis `src/data/referentiel-wsg.json` : ne pas les modifier à la main, lancer `npm run docs:referentiels`.

## Résultat

| Statut | Nombre |
|---|---:|
| ✅ Respectée | 46 |
| 🟡 Partielle | 14 |
| ❌ Non respectée | 1 |
| ⬜ Sans objet | 1 |
| 🔍 En cours d’analyse | 9 |
| **Total** | **71** |

**46 lignes directrices respectées sur 61 qui engagent ce dépôt**, soit 75 %, plus 14 partielles et 1 non respectée.

### Une distinction que le référentiel Green IT n'imposait pas

Neuf lignes directrices portent sur l'entreprise et non sur le site : stratégie de produit, modèles d'impact, pratiques financières, philanthropie, partage de la valeur, gestion des déchets électroniques. Elles sont marquées **En cours d'analyse** plutôt que respectées ou non : la question se pose, mais elle se tranche au niveau de l'entreprise et non depuis un dépôt de code. Un « sans objet » laisserait croire qu'elle ne se pose pas.

### Ce qui manque

1. **Aucun plan de fin de vie**, ni pour le site ni pour ses contenus. C'est la seule ligne en échec franc, et les deux référentiels la relèvent.
2. **`robots.txt` absent**, alors que le sitemap est généré et segmenté.
3. **Aucune donnée structurée `schema.org`** sur les articles, alors que le reste des métadonnées est complet.
4. **Aucune feuille d'impression**, pour des articles techniques qui se prêtent au PDF.
5. **Aucun budget humain** défini, là où ceux de performance et d'environnement le sont et échouent le build.

### Deux écarts assumés, argumentés dans le code

**Deux appels tiers** subsistent, les badges Website Carbon et EcoIndex. La règle voudrait zéro, et l'arbitrage a été rendu deux fois dans l'autre sens : une empreinte que le lecteur peut vérifier vaut une requête, et la figer au build ferait noter le déploiement précédent.

**Aucun accès hors ligne**, donc aucun service worker. Un site statique avec un cache HTTP correctement réglé n'a pas besoin d'un script pour rejouer ce que le navigateur fait déjà.

---

## Conception et expérience

*17 lignes directrices : 15 respectées, 2 partielles.*

| Ligne directrice | Critères | Statut | Comment |
|---|---|---|---|
| [Identify, assess, disclose, review, and mitigate sustainability impacts](https://www.w3.org/TR/web-sustainability-guidelines/#identify-assess-disclose-review-and-mitigate-sustainability-impacts) | 2 | ✅ Respectée | L'impact est mesuré à chaque build et publié au lecteur : `/blog-conception/` porte trois badges, dont deux vérifiables par un tiers, et le poids servant au calcul est affiché avec sa date. |
| [Understand user requirements or constraints](https://www.w3.org/TR/web-sustainability-guidelines/#understand-user-requirements-or-constraints) | 1 | ✅ Respectée | Les contraintes sont écrites et chiffrées dans `.claude/rules/quality.md` : budgets de poids, de requêtes, de DOM, plus WCAG 2.1 AA dans les deux thèmes. |
| [Integrate sustainability into every stage of the ideation process](https://www.w3.org/TR/web-sustainability-guidelines/#integrate-sustainability-into-every-stage-of-the-ideation-process) | 4 | ✅ Respectée | La sobriété est un critère de sortie, pas une intention : trois portes de qualité échouent le build, et chaque kilo-octet de script est une exception argumentée dans le code. |
| [Design efficient and streamlined user journeys](https://www.w3.org/TR/web-sustainability-guidelines/#design-efficient-and-streamlined-user-journeys) | 3 | ✅ Respectée | Deux niveaux depuis l'accueil jusqu'à l'article. Les deux taxonomies tiennent sur une page unique plutôt que dans un menu déroulant, et le parcours a été vérifié dans un navigateur réel. |
| [Design to assist and not to distract](https://www.w3.org/TR/web-sustainability-guidelines/#design-to-assist-and-not-to-distract) | 3 | ✅ Respectée | Aucune publicité, aucune notification, aucun bandeau de consentement puisque aucun cookie n'est posé. Une seule animation, en une passe, neutralisée sous `prefers-reduced-motion`. |
| [Avoid being manipulative or deceptive](https://www.w3.org/TR/web-sustainability-guidelines/#avoid-being-manipulative-or-deceptive) | 4 | ✅ Respectée | Aucun schéma sombre : pas de compte à rebours, pas d'inscription forcée, pas de collecte. Le chiffre d'empreinte affiché porte sa date pour qu'un chiffre périmé se voie. |
| [Make deliverables understandable and reusable](https://www.w3.org/TR/web-sustainability-guidelines/#make-deliverables-understandable-and-reusable) | 3 | ✅ Respectée | Dépôt public sous licence, décisions et pièges documentés dans `CLAUDE.md` et `PLAN-MIGRATION.md`, contenu en Markdown portable dans un dépôt distinct. |
| [Use a design system for interface consistency](https://www.w3.org/TR/web-sustainability-guidelines/#use-a-design-system-for-interface-consistency) | 1 | ✅ Respectée | Jetons sémantiques dans `src/styles/tokens/`, alignés sur le Zatsit Design System. Aucune valeur hexadécimale brute n'est admise dans le code produit. |
| [Optimize media to reduce resource use](https://www.w3.org/TR/web-sustainability-guidelines/#optimize-media-to-reduce-resource-use) | 5 | ✅ Respectée | WebP, dimensions plafonnées à 1366 px, `srcset` de six paliers calé sur les largeurs réellement mesurées, chargement différé sous la ligne de flottaison. Un article est passé de 734 à 322 ko d'images sur téléphone. |
| [Ensure animation is proportionate and easy to control](https://www.w3.org/TR/web-sustainability-guidelines/#ensure-animation-is-proportionate-and-easy-to-control) | 4 | ✅ Respectée | Une animation sur tout le site, en une passe et non en boucle, ce qui la sort du critère 2.2.2. Chaque composant animé annule son animation dans sa propre requête de média. |
| [Use optimized web typography](https://www.w3.org/TR/web-sustainability-guidelines/#use-optimized-web-typography) | 3 | ✅ Respectée | Poppins auto-hébergée en woff2 latin, sous-ensemble par l'API Fonts d'Astro, trois graisses, six fichiers pour 48,5 ko. Aucune requête vers un fournisseur tiers. |
| [Avoid unwanted notifications](https://www.w3.org/TR/web-sustainability-guidelines/#avoid-unwanted-notifications) | 2 | ✅ Respectée | Le site ne demande aucune permission et n'envoie rien : ni notification, ni courriel, ni fenêtre modale. |
| [Reduce the impact of downloadable and physical documents](https://www.w3.org/TR/web-sustainability-guidelines/#reduce-the-impact-of-downloadable-and-physical-documents) | 4 | 🟡 Partielle | Aucun document téléchargeable n'est publié. En revanche aucune feuille d'impression n'est fournie, alors qu'un article technique est un candidat naturel au PDF. |
| [Involve users early in the project](https://www.w3.org/TR/web-sustainability-guidelines/#involve-users-early-in-the-project) | 1 | ✅ Respectée | La refonte a été mise en relecture auprès des treize consultants sur une preview dédiée avant toute bascule. |
| [Audit and test for bugs or issues requiring resolution](https://www.w3.org/TR/web-sustainability-guidelines/#audit-and-test-for-bugs-or-issues-requiring-resolution) | 3 | ✅ Respectée | axe-core sur les 68 pages, deux thèmes, deux largeurs, avec `target-size` demandée par son nom, plus le contraste sur les jetons et les couleurs de code. Les trois portes échouent le build. |
| [Validate usability through testing and real-world usage](https://www.w3.org/TR/web-sustainability-guidelines/#validate-usability-through-testing-and-real-world-usage) | 2 | 🟡 Partielle | Vérifications systématiques dans un navigateur réel piloté en CDP, et relecture par les consultants. Aucun test d'utilisabilité formel avec des lecteurs extérieurs. |
| [Provide cross-platform compatibility support](https://www.w3.org/TR/web-sustainability-guidelines/#provide-cross-platform-compatibility-support) | 3 | ✅ Respectée | HTML sémantique sans framework client : la page fonctionne sans JavaScript, navigation, articles et tirage au hasard compris. Vérifié de 390 à 1440 px. |

## Développement web

*16 lignes directrices : 12 respectées, 3 partielles, 1 sans objet.*

| Ligne directrice | Critères | Statut | Comment |
|---|---|---|---|
| [Set goals based on performance and energy impact](https://www.w3.org/TR/web-sustainability-guidelines/#set-goals-based-on-performance-and-energy-impact) | 2 | ✅ Respectée | Budgets chiffrés et opposables : moins de 500 ko initiaux, 1 Mo au total, 25 requêtes, 1500 éléments de DOM. Le build échoue au dépassement. |
| [Minify and remove unused code](https://www.w3.org/TR/web-sustainability-guidelines/#minify-and-remove-unused-code) | 2 | ✅ Respectée | `compressHTML: true`, minification par Astro, et un pruneur maison retire 408 ko d'interfaces Pagefind inutilisées à chaque build. |
| [Modularize bandwidth-heavy components](https://www.w3.org/TR/web-sustainability-guidelines/#modularize-bandwidth-heavy-components) | 1 | ✅ Respectée | L'index de recherche n'est chargé qu'à la première frappe, et la CSS est découpée par composant, donc la feuille d'un article ne part pas sur la page des auteurs. |
| [Avoid redundancy and duplication in code](https://www.w3.org/TR/web-sustainability-guidelines/#avoid-redundancy-and-duplication-in-code) | 3 | ✅ Respectée | Un `PostCard` pour cinq surfaces, un `listingPages` partagé par les deux routes de liste, un `authorSlug` pour toutes les pages d'auteur. Les duplications trouvées ont été supprimées, la dernière ayant produit un bug de pagination. |
| [Treat third parties the same as first parties](https://www.w3.org/TR/web-sustainability-guidelines/#treat-third-parties-the-same-as-first-parties) | 4 | 🟡 Partielle | Aucun CDN, aucun traceur, aucune police tierce, aucun bouton de partage officiel. Deux appels tiers subsistent, les badges Website Carbon et EcoIndex, chacun argumenté et dégradant proprement. |
| [Ensure code follows good semantic practices](https://www.w3.org/TR/web-sustainability-guidelines/#ensure-code-follows-good-semantic-practices) | 4 | ✅ Respectée | `<nav>`, `<main>`, `<article>`, `<time>`, un seul `h1` par page, hiérarchie sans saut. Vérifié par axe sur les 68 pages sans violation. |
| [Defer the loading of non-critical resources](https://www.w3.org/TR/web-sustainability-guidelines/#defer-the-loading-of-non-critical-resources) | 2 | ✅ Respectée | `loading="lazy"` sous la ligne de flottaison, index de recherche à la demande, badges en chargement différé. |
| [Structure metadata for machine readability](https://www.w3.org/TR/web-sustainability-guidelines/#structure-metadata-for-machine-readability) | 3 | 🟡 Partielle | Titres, méta-descriptions, Open Graph, carte Twitter, flux RSS et sitemap segmenté sont en place. Manquent un `robots.txt` déclarant le sitemap et des données structurées `schema.org` sur les articles. |
| [Use media queries that support sustainability goals](https://www.w3.org/TR/web-sustainability-guidelines/#use-media-queries-that-support-sustainability-goals) | 1 | ✅ Respectée | `prefers-reduced-motion` respecté partout, `prefers-color-scheme` pour le thème par défaut, et des requêtes de largeur qui servent une seule feuille adaptative. |
| [Ensure layouts work for different devices and requirements](https://www.w3.org/TR/web-sustainability-guidelines/#ensure-layouts-work-for-different-devices-and-requirements) | 4 | ✅ Respectée | Grilles en `auto-fit`, unités relatives, aucun débordement horizontal sur les 68 pages à 390 px, mesuré. |
| [Use sustainable JavaScript and APIs](https://www.w3.org/TR/web-sustainability-guidelines/#use-sustainable-javascript-and-apis) | 3 | ✅ Respectée | 4 ko de JavaScript pour tout le site, aucun framework, aucun traitement long. Le tirage au hasard réécrit une adresse plutôt que d'intercepter un clic, ce qui préserve le fonctionnement sans script. |
| [Use dependencies sparingly and maintain them](https://www.w3.org/TR/web-sustainability-guidelines/#use-dependencies-sparingly-and-maintain-them) | 3 | ✅ Respectée | 215 paquets contre 1478 sous Docusaurus. Les mises à jour sont suivies, et celles qui cassent sont refusées avec la raison écrite. |
| [Include expected and beneficial files](https://www.w3.org/TR/web-sustainability-guidelines/#include-expected-and-beneficial-files) | 2 | 🟡 Partielle | `sitemap-index.xml`, `sitemap-0.xml` et `rss.xml` sont générés, `404.html` aussi. Il manque `robots.txt`, et `security.txt` n'a pas été envisagé. |
| [Use the most efficient solution for your service](https://www.w3.org/TR/web-sustainability-guidelines/#use-the-most-efficient-solution-for-your-service) | 5 | ✅ Respectée | Génération statique complète : aucun serveur n'exécute quoi que ce soit pendant la lecture. C'est la raison même du départ de Docusaurus. |
| [Use the latest stable language version](https://www.w3.org/TR/web-sustainability-guidelines/#use-the-latest-stable-language-version) | 2 | ✅ Respectée | Astro 7.2, Node 22.12 minimum, TypeScript vérifié à zéro erreur sur 52 fichiers. |
| [Reduce the number and complexity of database queries](https://www.w3.org/TR/web-sustainability-guidelines/#reduce-the-number-and-complexity-of-database-queries) | 4 | ⬜ Sans objet | Aucune base de données : le contenu est lu en place dans des fichiers Markdown au moment du build. |

## Hébergement et infrastructure

*12 lignes directrices : 8 respectées, 4 partielles.*

| Ligne directrice | Critères | Statut | Comment |
|---|---|---|---|
| [Use sustainable hosting](https://www.w3.org/TR/web-sustainability-guidelines/#use-sustainable-hosting) | 6 | 🟡 Partielle | Stockage d'objets managé, sans serveur allumé pour servir des fichiers. L'hébergeur n'est pas choisi sur un critère d'énergie renouvelable, et le badge CO2.js retient volontairement l'hypothèse pessimiste. |
| [Optimize caching and support offline access](https://www.w3.org/TR/web-sustainability-guidelines/#optimize-caching-and-support-offline-access) | 2 | 🟡 Partielle | Cache HTTP réglé par famille : un an immuable pour les actifs hachés, revalidation pour l'index, dix minutes pour les pages. Aucun accès hors ligne, choix assumé : un service worker rejouerait ce que le cache HTTP fait déjà. |
| [Reduce data transfer with compression](https://www.w3.org/TR/web-sustainability-guidelines/#reduce-data-transfer-with-compression) | 2 | ✅ Respectée | Compression par la couche d'hébergement, et le gate de poids mesure le texte gzippé plutôt que brut, ce qui est la mesure honnête. |
| [Setup necessary error pages and redirection links](https://www.w3.org/TR/web-sustainability-guidelines/#setup-necessary-error-pages-and-redirection-links) | 2 | 🟡 Partielle | `404.html` est généré et statique, et les deux redirections du contrat sont servies. Mais la production répond aujourd'hui par la page d'accueil en 200 sur une URL inconnue, ce qui est mesuré et inscrit au plan. |
| [Avoid maintaining unnecessary virtualized environments or containers](https://www.w3.org/TR/web-sustainability-guidelines/#avoid-maintaining-unnecessary-virtualized-environments-or-containers) | 1 | ✅ Respectée | Aucun conteneur ni machine virtuelle pour ce site : des fichiers dans un stockage d'objets. |
| [Use automation wisely](https://www.w3.org/TR/web-sustainability-guidelines/#use-automation-wisely) | 4 | ✅ Respectée | La CI construit, vérifie et déploie une preview par pull request, sans tâche périodique inutile. Les portes de qualité sont automatisées, la vérification axe reste locale parce qu'elle exige un navigateur. |
| [Define the frequency of data refreshes](https://www.w3.org/TR/web-sustainability-guidelines/#define-the-frequency-of-data-refreshes) | 1 | ✅ Respectée | Rien ne se rafraîchit tout seul : le site est reconstruit à la publication d'un article, et le badge carbone met son résultat en cache un jour. |
| [Back up critical data at routine intervals](https://www.w3.org/TR/web-sustainability-guidelines/#back-up-critical-data-at-routine-intervals) | 1 | ✅ Respectée | Le contenu et la coque sont deux dépôts git distincts, donc versionnés et répliqués. Aucune donnée n'existe hors de git. |
| [Assess the impact and requirements of data processing](https://www.w3.org/TR/web-sustainability-guidelines/#assess-the-impact-and-requirements-of-data-processing) | 5 | ✅ Respectée | Aucun traitement de données : pas de collecte, pas de compte, pas de formulaire, pas de journalisation applicative. |
| [Use Content Delivery Networks (CDNs) when beneficial](https://www.w3.org/TR/web-sustainability-guidelines/#use-content-delivery-networks-cdns-when-beneficial) | 3 | 🟡 Partielle | Aucun CDN, et c'est un choix : l'audience est nationale et un CDN ajouterait une couche pour un gain de latence marginal. La question reste ouverte pour la bascule. |
| [Ensure infrastructure fits project requirements](https://www.w3.org/TR/web-sustainability-guidelines/#ensure-infrastructure-fits-project-requirements) | 1 | ✅ Respectée | Un stockage d'objets pour un site statique : c'est le dimensionnement minimal qui rende le service. |
| [Store data according to the needs of your users](https://www.w3.org/TR/web-sustainability-guidelines/#store-data-according-to-the-needs-of-your-users) | 5 | ✅ Respectée | Aucune donnée d'utilisateur n'est stockée. Les seules préférences, thème et dernier tirage, restent dans le navigateur du lecteur. |

## Stratégie et gestion de produit

*26 lignes directrices : 11 respectées, 5 partielles, 1 non respectée, 9 en cours d’analyse.*

| Ligne directrice | Critères | Statut | Comment |
|---|---|---|---|
| [Have an ethical and sustainable product strategy](https://www.w3.org/TR/web-sustainability-guidelines/#have-an-ethical-and-sustainable-product-strategy) | 4 | 🔍 En cours d’analyse | En cours : société à mission et certifiée B Corp, ce que le pied de page documente. Ce dépôt en applique la conséquence technique. |
| [Assign a sustainability advocate](https://www.w3.org/TR/web-sustainability-guidelines/#assign-a-sustainability-advocate) | 1 | 🔍 En cours d’analyse | En cours. zatsit publie un portail Sustainability distinct. |
| [Inform, raise awareness, and train for sustainability](https://www.w3.org/TR/web-sustainability-guidelines/#inform-raise-awareness-and-train-for-sustainability) | 5 | ✅ Respectée | C'est l'objet même du blog : les articles GreenIT, et une page qui explique et mesure sa propre éco-conception. |
| [Communicate the environmental impact of user choices](https://www.w3.org/TR/web-sustainability-guidelines/#communicate-the-environmental-impact-of-user-choices) | 1 | ✅ Respectée | Trois badges publiés au lecteur, dont un calculé chez nous et deux vérifiables par un tiers, avec le poids et la date du relevé affichés. |
| [Calculate the environmental impact](https://www.w3.org/TR/web-sustainability-guidelines/#calculate-the-environmental-impact) | 3 | ✅ Respectée | CO2.js exécuté au build sur notre poids réellement mesuré, plus EcoIndex et Website Carbon en corroboration externe. |
| [Define clear organizational sustainability goals and metrics](https://www.w3.org/TR/web-sustainability-guidelines/#define-clear-organizational-sustainability-goals-and-metrics) | 1 | 🟡 Partielle | Les objectifs du site sont chiffrés et opposables. Les objectifs de l'organisation sont hors de ce dépôt. |
| [Validate web sustainability efforts through external verification](https://www.w3.org/TR/web-sustainability-guidelines/#validate-web-sustainability-efforts-through-external-verification) | 2 | ✅ Respectée | EcoIndex et Website Carbon sont deux vérifications tierces, publiées et cliquables par le lecteur. |
| [Support mandatory disclosures and reporting](https://www.w3.org/TR/web-sustainability-guidelines/#support-mandatory-disclosures-and-reporting) | 4 | 🔍 En cours d’analyse | Notation EcoVadis Silver et certification B Corp, affichées dans le pied de page. |
| [Create one or more impact business models](https://www.w3.org/TR/web-sustainability-guidelines/#create-one-or-more-impact-business-models) | 1 | 🔍 En cours d’analyse | En cours. |
| [Follow a product management and maintenance strategy](https://www.w3.org/TR/web-sustainability-guidelines/#follow-a-product-management-and-maintenance-strategy) | 5 | ✅ Respectée | Plan de migration écrit, décisions numérotées et datées, journal des pièges déjà payés. Le dépôt se relit plus qu'il ne se redécouvre. |
| [Implement continuous improvement procedures](https://www.w3.org/TR/web-sustainability-guidelines/#implement-continuous-improvement-procedures) | 4 | ✅ Respectée | Trois portes automatisées, une quatrième locale, et un journal des régressions évitées. Les budgets sont revérifiés à chaque changement. |
| [Document updates and evolutions](https://www.w3.org/TR/web-sustainability-guidelines/#document-updates-and-evolutions) | 1 | ✅ Respectée | Historique git en messages explicites, `PLAN-MIGRATION.md` pour les décisions et ce qui reste, `CLAUDE.md` pour les conventions. |
| [Evaluate if a digital product or service is necessary](https://www.w3.org/TR/web-sustainability-guidelines/#evaluate-if-a-digital-product-or-service-is-necessary) | 3 | ✅ Respectée | La question a été posée à chaque fonctionnalité, et plusieurs ont été écartées : le nuage gradué, le filigrane des cartes, le bouton de partage X, le garde-fou sur les tags. |
| [Provide a supplier standards of practice document](https://www.w3.org/TR/web-sustainability-guidelines/#provide-a-supplier-standards-of-practice-document) | 3 | 🔍 En cours d’analyse | En cours. |
| [Share economic benefits](https://www.w3.org/TR/web-sustainability-guidelines/#share-economic-benefits) | 3 | 🔍 En cours d’analyse | En cours. |
| [Share decision-making power with affected parties](https://www.w3.org/TR/web-sustainability-guidelines/#share-decision-making-power-with-affected-parties) | 1 | ✅ Respectée | Les articles sont relus en pull request dans le dépôt contenu, et la refonte a été soumise aux treize auteurs avant bascule. |
| [Use Diversity, Equity, Justice, Inclusion (DEJI) practices](https://www.w3.org/TR/web-sustainability-guidelines/#use-diversity-equity-justice-inclusion-deji-practices) | 3 | 🟡 Partielle | L'accessibilité est traitée comme une contrainte dure, WCAG 2.1 AA vérifiée sur toutes les pages. Les autres dimensions se traitent au niveau de l'entreprise. |
| [Promote responsible data practices](https://www.w3.org/TR/web-sustainability-guidelines/#promote-responsible-data-practices) | 3 | ✅ Respectée | Aucune donnée collectée : ni cookie, ni traceur, ni analytique, ni compte. C'est la pratique la plus responsable possible, ne rien recueillir. |
| [Establish responsible practices around AI and emerging or disruptive technologies](https://www.w3.org/TR/web-sustainability-guidelines/#establish-responsible-practices-around-ai-and-emerging-or-disruptive-technologies) | 5 | 🟡 Partielle | Le dépôt est développé avec assistance d'IA (ici Claude), des skills et rules publiés aident à cadrer les développement sur l'aspect éco-conception et a11y. |
| [Adopt responsible financial practices](https://www.w3.org/TR/web-sustainability-guidelines/#adopt-responsible-financial-practices) | 2 | 🔍 En cours d’analyse | En cours. |
| [Adopt organizational philanthropy practices](https://www.w3.org/TR/web-sustainability-guidelines/#adopt-organizational-philanthropy-practices) | 2 | 🔍 En cours d’analyse | En cours. |
| [Plan for a digital product or service's care and end-of-life](https://www.w3.org/TR/web-sustainability-guidelines/#plan-for-a-digital-product-or-service-s-care-and-end-of-life) | 1 | ❌ Non respectée | Aucun plan de fin de vie n'existe, ni pour le site ni pour ses contenus : rien n'est jamais dépublié et `/archive/` liste tout, ce qui est l'inverse d'une stratégie. |
| [Repair, reuse, refurbish, recycle or reduce e-waste](https://www.w3.org/TR/web-sustainability-guidelines/#repair-reuse-refurbish-recycle-or-reduce-e-waste) | 4 | 🔍 En cours d’analyse | En cours. Le site n'a aucun matériel propre, la question se pose au niveau de l'entreprise. |
| [Define performance, environmental, and human budgets](https://www.w3.org/TR/web-sustainability-guidelines/#define-performance-environmental-and-human-budgets) | 4 | 🟡 Partielle | Budgets de performance et d'environnement chiffrés et opposables. Aucun budget humain n'est défini. |
| [Use and contribute to open source](https://www.w3.org/TR/web-sustainability-guidelines/#use-and-contribute-to-open-source) | 2 | ✅ Respectée | Les deux dépôts sont publics sous l'organisation zatsit-oss, et le site est bâti sur des briques ouvertes, Astro, Pagefind, CO2.js. |
| [Create a business continuity and disaster recovery plan](https://www.w3.org/TR/web-sustainability-guidelines/#create-a-business-continuity-and-disaster-recovery-plan) | 2 | 🟡 Partielle | Le site est reconstructible entièrement depuis deux dépôts git, ce qui est la meilleure garantie de reprise. Aucun plan n'est écrit et aucune restauration n'a été testée. |

---

## Méthode

Chaque verdict a été posé en relisant le code concerné et, quand la règle porte sur un comportement, en mesurant le build : `npm run check:eco` pour les poids et les requêtes, `npm run check:axe` pour l'accessibilité sur toutes les pages dans les deux thèmes et aux deux largeurs, et Chrome piloté en CDP pour ce qui ne se lit pas dans le HTML.

Source : [https://www.w3.org/TR/web-sustainability-guidelines/](https://www.w3.org/TR/web-sustainability-guidelines/), WSG 1.0, Group Note Draft du 28 juillet 2026. Évalué le 29/08/2026.

*Fichier généré par `npm run docs:referentiels`. Ne pas le modifier à la main.*
