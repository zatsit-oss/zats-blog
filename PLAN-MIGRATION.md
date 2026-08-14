# Plan de migration : Docusaurus → Astro

Document de travail pour la migration du blog zatsit, dérivé de `brief-migration-astro.md` et corrigé par un inventaire du code et du contenu réels (7 août 2026).

Branche cible : **`migration-astro`** dans les deux repos.

| Repo | Chemin local | Rôle après migration |
|---|---|---|
| `zats-blog` (coque) | `/Users/emmanuelperu/dev/zatsit/blog/zats-blog` | Projet Astro : layouts, thème, schéma, build, déploiement |
| `zats-blog-content` (contenu) | `/Users/emmanuelperu/dev/zatsit/blog/zats-blog-content` | Articles `.md` + assets, zéro tooling Astro |
| `zats-websites` (référence) | `/Users/emmanuelperu/dev/zatsit/zats-websites` | Implémentation Astro de référence, patterns et conventions maison |
| Zatsit Design System (référence) | [claude.ai/design](https://claude.ai/design/p/34f5e88a-fa9f-49cc-9a99-1383413a3a3a) | Système formel : jetons, guidelines, assets de marque, règles éditoriales |

---

## 0. État d'avancement

*Dernière mise à jour : 13 août 2026.* Pour le détail du prochain geste, voir [`REPRISE.md`](REPRISE.md).

| Phase | État |
|---|---|
| Ph0 — préparation et capture de référence | ✅ terminée |
| A — normalisation du contenu | ✅ terminée |
| Ph1 — socle Astro et jetons | ✅ terminée |
| Ph2 — contenu et schéma | ✅ terminée, **le build passe** |
| Ph2 bis — garde-fous qualité (a11y, éco) | ✅ terminée |
| Ph3 — pages et parité | ✅ terminée |
| Ph4 — vérification des URLs | ✅ 45/45, zéro divergence |
| Ph5 — CI/CD | 🟡 preview migrée et verte, production encore sur Docusaurus |
| Ph6 — documentation | 🟡 `README`, `CLAUDE.md`, `AGENTS.md` refaits ; reste la CI du dépôt contenu |

**Acquis mesurés, pas supposés**

- Les 19 articles sont chargés depuis le repo voisin, **les 19 dates résolues**, les 12 auteurs lus.
- La normalisation du contenu n'a changé **aucune URL** : build Docusaurus relancé après renommage, `diff` des 45 routes vide.
- Astro retenu : **7.2.0**, au-delà du « ≥ 6 » du brief. Exige Node ≥ 22.12, déjà couvert par `.node-version`.
- Arbre de dépendances : 215 paquets, contre l'installation Docusaurus.

**Détail de la phase 3**

| Élément | État |
|---|---|
| Route d'article `/<slug>/`, 19 articles | ✅ |
| Header, footer, bascule de thème | ✅ |
| Badge Website Carbon, auto-hébergé | ✅ |
| Listing paginé `/` et `/page/2/` | ✅ |
| Hero et les trois blocs de la home | ✅ |
| Pages de tags : `/tags/` et les 17 `/tags/<tag>/` | ✅ |
| `/archive/` | ✅ |
| `/authors/` | ✅ |
| 404 | ✅ |
| Pages portées : `/mentions-legales/`, `/blog-conception/`, `/markdown-page/` | ✅ |
| Admonitions `:::info` | ✅ |
| Thème Shiki vérifié AA, bouton copier | ✅ |
| RSS | ✅ |
| Pagefind | ✅ |

**La phase 3 est terminée.** Restent la phase 5 (CI/CD) et la phase 6 (documentation), plus les deux dettes d'images ci-dessous.

**Parité des URLs : atteinte le 14 août 2026**

Le `diff` entre les 45 routes de référence et le build Astro donne **45 routes conformes, zéro manquante, zéro en trop**. C'est le critère de sortie de la phase 4, rempli.

Un seul écart assumé : `/markdown-page/` est servie en redirection vers la racine plutôt qu'en page. Son contenu Docusaurus était du remplissage de gabarit, en anglais, sur un blog francophone. L'URL continue de résoudre.

La vérification est reproductible :

```bash
find dist -name "*.html" | sed 's|^dist||;s|/index.html$|/|;s|^/404.html$|/404|' | sort -u
```

**Mesures du 13 août 2026, sur 21 pages construites**

| | Docusaurus (45 pages) | Astro |
|---|---|---|
| Poids initial | 243 à 3 324 ko | **60,5 à 74 ko** |
| JS client | 135 ko gzip | **1,10 ko gzip** |
| Requêtes | 5 à 16 | 9 à 11 |
| Pages sous le budget de 1 Mo au total | 0 / 45 | 17 / 21 |
| Contrastes vérifiés | 0 | 16 appariements, deux thèmes |

Les quatre pages hors budget total le sont à cause d'images non redimensionnées. Le mécanisme est établi dans les deux sens : la médaille EcoVadis du footer, qui déclare `width` et `height`, passe de 57 ko à 2,8 ko, quand les images d'articles, qui n'en déclarent aucun, sont réencodées sans être redimensionnées.

**Garde-fous outillés avant la phase 3**

Les exigences d'accessibilité et d'éco-conception étaient jusqu'ici de la prose. Elles sont désormais mesurables, et posées avant d'écrire les pages plutôt qu'auditées après.

- `.claude/rules/quality.md` : la charte, avec les budgets chiffrés.
- `npm run check:a11y` : résout les vrais jetons de `src/styles/tokens/` et mesure les 16 appariements standards dans les deux thèmes. **Tous passent aujourd'hui.** Deux points de vigilance mesurés : `--color-secondary` en sombre à 4,83:1, soit 0,33 de marge, et `--color-eco` à 2,10:1 en clair, donc inutilisable comme couleur de texte.
- `npm run check:eco` : mesure le poids réel de chaque page de `dist/` contre les budgets. Sort en erreur si un budget est dépassé.
- Skills `wcag-check`, `eco-check` et `accessibility-a11y` dans `.claude/skills/`.

**Blocage levé le 13 août 2026**

Les 8 articles qui codaient en dur `../../../static/img/icon-linkedin.webp` sont nettoyés, le boilerplate est remplacé par `src/components/ShareLinks.astro`, et la copie éditoriale des 5 textes de partage rédigés à la main est préservée dans un champ `shareText` optionnel du frontmatter. `npm run build` passe : **19 articles, 19 dates résolues, 12 auteurs**.

Un second bug, masqué par le premier, a été trouvé et corrigé dans le loader : `context.store.set()` est ignoré quand le digest de l'entrée n'a pas changé. Notre modification portant sur la donnée dérivée et non sur le fichier, l'écriture des 12 dates était silencieusement abandonnée. Correction : `delete()` puis `set()`, et surtout une post-condition qui vérifie **l'état final du store** au lieu de l'intention. L'ancienne garde ne couvrait que le cas « date non dérivable » et laissait donc passer « date non persistée ».

**Deux pièges déjà payés**

1. `glob()` dérive l'`id` du `slug` du frontmatter, pas du chemin. Le repli de date doit lire `entry.filePath`.
2. `authors.yml` est un document unique de 12 profils : il exige `file()` avec un parseur YAML, `glob()` le charge comme une entrée unique.

**Écarts assumés par rapport au design system**

- Les huit `@font-face` de `tokens/typography.css` sont remplacés par l'API Fonts native d'Astro 7 : même woff2 latin auto-hébergé, sans binaires dupliqués.
- `tokens/base.css` (`.btn-primary`, `.card`, `.tag`, `.glass`) n'est pas encore importé, ses classes n'ayant pas d'usage avant la phase 3.

---

## 1. Inventaire réel (établi, non supposé)

### Contenu : 19 articles, 10 catégories, 12 auteurs

| Constat | Chiffre |
|---|---|
| Articles | 19 (`.md` uniquement, **aucun MDX**) |
| Avec `title`, `tags`, `slug`, `authors` | 19 / 19 |
| Avec `date:` en frontmatter | **7 / 19** |
| Avec `description` | **0 / 19** |
| Avec `cover` ou `draft` | **0 / 19** |
| Avec `<!-- truncate -->` | 17 / 19 |
| Admonitions | 2 occurrences : un `:::tip`, un `:::info` |
| Mermaid | **0** (la dépendance existe, aucun article ne l'utilise) |
| Maths `$$` | 1 fichier à vérifier |
| Balises JSX | aucune |

### Routage actuel

`docusaurus.config.js:36` définit `routeBasePath: '/'`. **Le blog est servi à la racine**, pas sous `/blog` :

- Article : `https://blog.zatsit.fr/<slug>`
- Tag : `https://blog.zatsit.fr/tags/<tag>`
- Index paginé : `/`, `/page/2`, … (`postsPerPage: 10`)
- Page statique : `/mentions-legales`

Aucun `redirects` dans les deux `firebase.json`. `onBrokenLinks: 'throw'`.

> Le brief annonce un mapping en `/blog/<slug>`. C'est inexact : la cible à préserver est **la racine**.

### Navbar

6 entrées actives : `/`, `/tags`, `/tags/green`, `/tags/architecture`, `/tags/cloud`, `/tags/data`, `/tags/general`. Le dropdown « À venir » (`dev`, `eco-conception`, `mobile`, `ops`, `web`) est **commenté** dans la config, ce qui explique que le build passe malgré des tags sans article.

### Référence de style : Zatsit Design System + `zats-websites/corporate`

> **Aucun style ne se décide en dehors de ces deux références.** Couleurs, typographie, espacements, rayons, animations, thème clair/sombre, structure du `<head>`, ton éditorial. En cas de divergence avec le rendu Docusaurus actuel, ce sont ces références qui tranchent, sauf sur la structure des URLs (voir P2).

#### Hiérarchie des sources

| Source | Nature | Autorité |
|---|---|---|
| **Zatsit Design System** ([claude.ai/design](https://claude.ai/design/p/34f5e88a-fa9f-49cc-9a99-1383413a3a3a)) | Système formalisé : jetons CSS agnostiques, primitives React, guidelines, assets de marque, règles éditoriales | **Règles et intentions.** Fait foi sur le « pourquoi » et le « comment » |
| **`zats-websites/corporate`** | Site Astro de production | **Implémentation de référence.** Le design system se déclare lui-même dérivé de son `global.css` pour les jetons |

Les deux ne se contredisent pas : le design system a été rétro-conçu depuis `corporate/` puis reformulé en CSS pur plus primitives React, pour pouvoir alimenter n'importe quel support. Pour un blog Astro, la voie recommandée est donc **les jetons du design system** (CSS pur, réutilisables tels quels) plus **les patterns Astro de `corporate/`** (layout, script de thème, config).

Attention : le design system précise que `ui_kits/corporate/` en son sein est une **recréation cosmétique**, pas le code de production. Ne pas s'en servir comme source de code.

#### Structure du design system

- `styles.css` : point d'entrée unique, ne contient que des `@import` dans l'ordre primitives → sémantique
- `tokens/` : `palette.css` (couleurs brutes), `colors.css` (sémantique bi-thème), `typography.css` (`@font-face` + échelle), `spacing.css`, `shape.css` (rayons, élévation, motion), `base.css` (resets + classes utilitaires `.btn-primary`, `.text-gradient`, `.card`, `.tag`, `.glass`)
- `guidelines/` : spécimens (échelles de type, couleurs, spacing, rayons, élévation, iconographie)
- `assets/` : Poppins woff2 300 à 900, logos et sigles toutes variantes, icônes UI, logos tech, photos d'équipe, certifications B Corp et EcoVadis
- `components/` : primitives React (Button, Card, ServiceCard, Tag, TechTag, Badge, Stat, Header, Logo, Icon, ThemeToggle). **Non réutilisables en l'état dans Astro**, mais leur markup et leurs classes documentent le rendu attendu

Le design system est aussi exposé comme skill (`SKILL.md`, `name: zatsit-design`), donc invocable directement pendant l'implémentation.

#### Le monorepo `zats-websites`

Deux sites Astro plus un paquet de composants partagés :

- `corporate/` : **Astro 5.16**, Tailwind **v4** via `@tailwindcss/vite`, `@fontsource/poppins`, `@lucide/astro`, `compressHTML`, `prefetch` viewport, config d'env typée via `envField`. **Référence.**
- `components/` : Astro 5.6, Tailwind **v3** + `@astrojs/tailwind`. Plus ancien et incompatible avec la base v4. **Ne pas s'en inspirer, ne pas en dépendre.**

#### Ce qui est repris de `corporate/`

| Élément | Source | Traitement |
|---|---|---|
| Jetons et thème | `src/styles/global.css` (1431 lignes) | Patterns d'implémentation seulement. Les jetons viennent du design system, voir **D5** |
| Typographie | Poppins via `@fontsource/poppins` | Le design system fournit les woff2 300 à 900 en latin, à préférer. Réévaluer si l'API Fonts d'Astro 6 est retenue (D1) |
| Icônes | `@lucide/astro` | Tel quel, en `currentColor` |
| `<head>` et OG | `src/layouts/Layout.astro` | Base à étendre, voir **P6** |
| Config | `compressHTML`, `prefetch` viewport, `envField` | Tel quel |
| Accessibilité | `skip-link` vers `#main-content`, `prefers-reduced-motion` | Tel quel |
| Charte éditoriale | `corporate/docs/brand-and-content.md` | Fait autorité, voir ci-dessous |

#### Fondations visuelles imposées

Le trait définissant du système est le **double thème** : deux personnalités à part entière, pas une teinte inversée.

| | Clair (défaut) | Sombre |
|---|---|---|
| Primaire | Bleu `#0f15fd` (`--zat-blue-500`) | **Orange** `#f1be51` (`--zat-gold-400`) |
| Hover / pressé | `#0a0ecc` | `#ffd580` (fin de gradient) |
| Fond | Blanc / `#f8fafc` | `#1b1b1d` / `#0a0a0a` |
| Texte | `#1c1e21` | `#e3e3e3` |
| Accent secondaire | | Orange soutenu `#e1601f` (`--zat-orange-500`) |
| Intention | Professionnel, institutionnel | Premium, chaleureux, moins gourmand en OLED |

> **La couleur du thème sombre est l'orange.** `tokens/palette.css` regroupe `#f1be51` et `#e1601f` sous « Brand — Gold / Orange (dark theme primary) » : le nom de variable dit `gold`, le vocabulaire de marque dit orange. C'est « orange » qu'on emploie à l'écrit et à l'oral.

Règles non négociables :

- **Toujours référencer les jetons sémantiques** (`--color-primary`, `--color-text`, `--color-surface`, …), **jamais un hexadécimal brut**. Les deux thèmes se résolvent alors automatiquement.
- Thème posé via `data-theme="light|dark"` sur `<html>`, avec respect de `prefers-color-scheme`.
- **Vert éco `#2ecc71` réservé aux signifiants durabilité** (EcoVadis, métriques CO₂), usage parcimonieux. Directement pertinent pour les badges CO2 du blog.
- **Unité de base 4px stricte.** Largeur max 1280px, gouttières 24px (20px tablette, 16px mobile), écarts de section 120px et plus.
- **Rayons** : 4px par défaut, 8px boutons et tags, 12px cartes. Pilules réservées aux avatars et pastilles sociales rondes.
- **Élévation par couches tonales et filets 1px**, pas d'ombres lourdes (coût GPU moindre, cohérent GreenIT). Interaction signature : lift de 3 à 6px, filet d'accent primaire en haut, lueur primaire diffuse.
- **Glass et `backdrop-filter` strictement réservés à la barre de navigation collante.** Nulle part ailleurs.
- **Gradients uniquement** sur le mot-clé mis en avant et le fond décoratif du hero. Jamais sur un bouton, une carte ou un aplat.
- **Pas d'images de fond lourdes.** Décor en CSS pur : grille de points en `radial-gradient` (32px, ~8% d'opacité) et blobs flous dérivants derrière le hero seulement.
- **Motion** : easing `cubic-bezier(0.16, 1, 0.3, 1)`, transitions de survol à 0.2s, effondrement complet sous `prefers-reduced-motion: reduce`.
- **Typographie** : Poppins seule famille, 300 à 900. Titres 700 à 800 en interlignage serré, corps 400 en couleur atténuée, méta et labels 500 à 600. **woff2 auto-hébergé, sous-ensemble latin uniquement** pour l'empreinte.
- **Icônes** : Lucide en `currentColor`, tailles `icon-sm` 12px, `icon-md` 20px, `icon-lg` 32px. Les marques sociales (GitHub, LinkedIn, Bluesky, blog) restent des SVG locaux et non des glyphes génériques. Aucun emoji, aucune police d'icônes.

#### Règles éditoriales applicables au blog

Elles s'appliquent aux gabarits et aux textes d'interface, pas au corps des articles, qui reste la responsabilité des auteurs.

- Langue française, voix **« nous »**, tutoiement pour les candidats, adresse plus neutre pour les clients.
- **Casse phrase partout**, titres compris. Nom de marque en minuscules, **« zatsit »**, dans le corps de texte et le pied de page.
- Titres courts terminés par un point, cadence déclarative.
- **Exactement un mot-clé** par titre reçoit le traitement gradient (`.text-gradient-glow`). Jamais un titre entier.
- Termes clés en `<strong>` dans la couleur du texte, pas dans la couleur d'accent.
- Paragraphes de 2 à 3 phrases, listes à puces, métriques éco citées concrètement.
- **Aucun emoji** dans l'interface produit.

#### Modèle de thème à respecter

`corporate/src/styles/global.css` implémente un thème à trois états qu'il faut reconduire :

1. `:root` porte la palette claire complète.
2. `@media (prefers-color-scheme: dark)` redéfinit les jetons pour le réglage système.
3. `[data-theme="light"]` et `[data-theme="dark"]` redéfinissent une troisième fois pour que le choix explicite de l'utilisateur l'emporte dans les deux sens.

L'attribut `data-theme` est posé sur `<html>` par un script `is:inline` exécuté avant le premier rendu, avec relecture de `localStorage`, ce qui évite le flash de thème. Ce script est réappliqué sur `astro:after-swap`. Le bloc `@theme` de Tailwind v4 ne porte que `--font-sans` et les rayons : les couleurs restent des variables CSS, pas des jetons Tailwind.

> Sur `--color-secondary: #7c3aed` de `corporate` : ce violet **figure bien** dans le design system, sous `--zat-violet`, dans le groupe « Light-theme accents (mesh gradients, decorative blobs only) ». Il n'y a donc pas de contradiction, mais une contrainte d'usage : il reste cantonné au décoratif et ne doit pas servir de couleur sémantique dans le blog.

---

## 2. Décisions actées

Les cinq décisions ont été arbitrées le 7 août 2026. Elles ne sont plus ouvertes.

### D1. Version d'Astro → dernière stable

**Décidé** : on part sur la dernière version stable d'Astro, épinglée au moment de l'installation (`npm view astro version` avant de figer le `package.json`).

L'écart avec `zats-websites` (5.16) est sans conséquence : on ne dépend d'aucun paquet Astro maison. Les jetons viennent du design system en CSS pur (D5) et les patterns de `corporate/` sont recopiés, pas importés.

Point de vigilance : `<ViewTransitions />` d'Astro 5 devient `<ClientRouter />` à partir d'Astro 6. À trancher au regard de l'objectif « aucun JS client superflu », le composant n'étant pas indispensable.

### D2. Emplacement → coque entièrement neuve

**Décidé** : remplacement en place. Docusaurus est supprimé sur la branche, pas de dossier `astro/` transitoire.

Conséquence directe : la comparaison côte à côte devient impossible une fois la suppression faite. **La capture de référence en phase 0 passe donc de confortable à obligatoire** (liste des routes, captures des pages clés en clair et en sombre). C'est le seul témoin qui restera pour valider la parité.

### D3. Déploiement → bucket maintenant, CleverCloud plus tard

**Décidé** : la prod reste sur le bucket Google Cloud Storage, donc la pipeline de référence est celle du repo contenu (`publish-on-merge.yml`). Migration vers CleverCloud prévue ultérieurement. Les previews de PR restent sur canaux Firebase, conformément au brief.

Conséquence d'architecture : **découpler build et déploiement**. L'étape de build ne doit rien savoir de la cible ; le déploiement est un job séparé, pour que le passage à CleverCloud soit un changement d'un seul fichier et non une refonte de pipeline. Les redirections 301 (P2) ne peuvent pas s'appuyer sur `firebase.json` en prod : elles devront être portées par la couche qui sert le bucket, puis retranscrites côté CleverCloud.

### D4. Maths → conservées

**Vérifié puis décidé** : il y a bien une formule KaTeX réelle, la définition du WUE en `blog/green/20251129-greenIT-episode-2/index.md:105`.

```
$$
\text{WUE} = \frac{\text{Annual Site Water Usage (liters)}}{\text{IT Equipment Annual Energy Use (kWh)}}
$$
```

`remark-math` + `rehype-katex` restent donc au périmètre. Pour limiter le coût GreenIT, ne charger le CSS KaTeX que sur les pages qui contiennent effectivement des maths, plutôt que globalement comme aujourd'hui.

### D5. Jetons CSS → design system

**Décidé** (« fais ce qui a de mieux ») : copier `tokens/palette.css`, `colors.css`, `typography.css`, `spacing.css`, `shape.css`, `base.css` et le point d'entrée `styles.css` du design system, en respectant l'ordre d'import primitives → sémantique.

De `corporate/global.css`, n'emprunter que les patterns d'implémentation Astro : bloc `@theme` Tailwind v4, les trois états de thème, `prefers-reduced-motion`. On évite ainsi de traîner 1431 lignes majoritairement propres au site vitrine.

Comme les jetons sont copiés et donc figés, prévoir une procédure de resynchronisation avec le design system (`/design-sync` la permet).

---

## 3. Points critiques : solutions techniques

### P1. Les dates (le vrai piège)

**12 des 19 articles n'ont pas de `date:` en frontmatter.** Docusaurus la dérive du préfixe du dossier (`2024-07-18-bundlephobia`). Le loader `glob()` d'Astro ne fait rien de tel : ces 12 articles se retrouveraient sans date, donc sans tri chronologique ni RSS correct.

Le nommage des dossiers est hétérogène :

| Forme | Nombre | Exemple | Date frontmatter ? |
|---|---|---|---|
| `YYYY-MM-DD-slug` | 15 | `2024-07-18-bundlephobia` | facultative |
| `YYYYMMDD-slug` | 3 | `20250606-IA-et-consommation-energetique` | présente |
| sans date | 1 | `entreprise-a-mission` | présente |

Règle constatée : **tout dossier au préfixe non parsable porte un `date:` en frontmatter**. La règle de résolution est donc `frontmatter.date ?? date du dossier`, et elle couvre 19/19.

#### Décidé : normaliser sur le pattern majoritaire

Plutôt que de faire vivre trois conventions, on aligne tout sur **`YYYY-MM-DD-slug/index.md`** (15/19 déjà conformes) et on renomme les 4 écarts.

**Le renommage ne touche aucune URL** : `slug` est explicite dans le frontmatter des 19 articles, donc l'adresse publique ne dépend pas du nom de dossier. Les images relatives suivent leur dossier. Fait via `git mv`, l'historique est préservé.

| Actuel | Cible | Date retenue |
|---|---|---|
| `blog/ai/20250606-IA-et-consommation-energetique` | `blog/ai/2025-11-28-IA-et-consommation-energetique` | frontmatter `2025-11-28` |
| `blog/green/20240621-greenIT-introduction-1` | `blog/green/2024-06-21-greenIT-introduction-1` | concordante |
| `blog/green/20251129-greenIT-episode-2` | `blog/green/2025-11-29-greenIT-episode-2` | concordante |
| `blog/general/entreprise-a-mission` | `blog/general/2025-07-10-entreprise-a-mission` | frontmatter `2025-07-10` |

Plus : `blog/general/entreprise-a-mission/README.md` → `index.md`, seul article qui ne s'appelle pas `index.md`.

> **Incohérence relevée** : le dossier `20250606-…` annonce le 6 juin 2025 alors que son frontmatter dit `date: 2025-11-28`, soit près de six mois d'écart. Le frontmatter fait foi sous Docusaurus, c'est donc lui qui donne le nom cible. C'est exactement le genre de piège que la normalisation élimine.

À signaler sans agir : `blog/cloud/2024-10-25-crossplane-presentation-des-concepts` porte `date: 2024-11-12`. Le dossier respecte le pattern, il est donc hors périmètre, mais l'écart de 18 jours mérite une décision éditoriale.

#### Implémentation après normalisation

Une fois les 19 articles conformes, le loader se simplifie mais la mécanique reste nécessaire, `glob()` ne dérivant toujours pas de date. La validation Zod s'exécutant *pendant* `glob().load()`, un `date` requis échouerait avant qu'on puisse l'injecter :

1. `date: z.coerce.date().optional()` dans le schéma Zod.
2. Un loader maison qui enveloppe `glob()` et, après `load()`, complète les entrées sans date depuis l'id (regex `^(\d{4})-(\d{2})-(\d{2})-`, désormais unique).
3. Un garde-fou au build qui lève si une entrée reste sans date, pour que le trou soit bruyant et non silencieux.

Le pattern du loader devient `**/index.md`.

### P2. Les URLs

Cible : reproduire la racine à l'identique.

**Référence capturée** : le dernier build Docusaurus a produit **45 routes**, listées dans [`migration-routes-docusaurus.txt`](migration-routes-docusaurus.txt). C'est le contrat de non-régression.

| Docusaurus | Nb | Astro |
|---|---|---|
| `/<slug>/` | 19 | `src/pages/[...slug].astro`, slug lu du frontmatter (présent sur 19/19) |
| `/tags/<tag>/` | 17 | `src/pages/tags/[tag].astro` |
| `/tags/` | 1 | `src/pages/tags/index.astro` |
| `/`, `/page/2/` | 2 | `src/pages/[...page].astro` avec `paginate()`, 10 par page |
| `/archive/` | 1 | **à recréer**, page d'archive générée nativement par Docusaurus |
| `/authors/` | 1 | **à recréer**, index des auteurs généré nativement par Docusaurus |
| `/mentions-legales/` | 1 | page statique portée depuis `src/pages/mentions-legales.md` |
| `/blog-conception/` | 1 | page statique portée depuis `src/pages/blog-conception.js` |
| `/404` | 1 | `src/pages/404.astro` |
| `/markdown-page/` | 1 | résidu du gabarit Docusaurus, voir ci-dessous |

> **Trois découvertes de la capture.** `/archive/` et `/authors/` sont générées automatiquement par le plugin blog de Docusaurus : personne ne les a écrites, et elles disparaîtraient silencieusement sous Astro. Il faut les recréer ou les rediriger. `/markdown-page/` est un résidu du gabarit d'installation, sans contenu utile : candidat à la suppression, mais c'est une URL publique aujourd'hui, donc à faire consciemment avec une 301 vers `/` plutôt qu'en la laissant tomber.

Les 17 tags générés dépassent les 6 exposés dans la navbar : `ai`, `angular`, `architecture`, `cloud`, `conference`, `data`, `dev`, `environnement`, `general`, `green`, `hacktoberfest`, `java`, `javascript`, `open-source`, `refacto`, `tech`, `web`. Toutes ces pages existent et doivent survivre, y compris celles qui ne sont liées depuis aucun menu.

Le `slug` étant explicite sur tous les articles, **aucune URL d'article ne devrait changer**. Vérification obligatoire avant merge : générer la liste des routes des deux builds et faire un `diff`.

Toute différence donne une redirection 301. Attention, D3 change le porteur : la prod étant servie depuis un bucket GCS et non Firebase, `firebase.json` ne couvre que les previews. Les 301 de production doivent être portées par la couche qui sert le bucket, puis retranscrites lors du passage à CleverCloud. À traiter comme une donnée de configuration versionnée, pas comme un réglage de console.

Attention aussi à la cohérence des slashs finaux entre Docusaurus et Astro (`trailingSlash`), qui peut créer des 301 en cascade.

### P3. Admonitions

Enjeu réel faible (2 occurrences), mais la syntaxe doit rester valide pour les futurs articles. `remark-directive` plus un plugin maison transformant `:::tip`, `:::info`, `:::warning`, `:::danger`, `:::note` en HTML stylé. Aucun article n'est réécrit.

### P4. Schéma Zod aligné sur l'existant

Le schéma du brief (`title`, `description`, `pubDate`, `author`, `tags`, `cover`, `draft`) ne correspond pas au frontmatter réel. Alignement nécessaire :

- `title` : requis
- `slug` : requis (et non dérivé du chemin)
- `authors` : requis, tableau de clés, **pluriel** et non `author` (jusqu'à 3 auteurs sur un article)
- `tags` : requis, tableau
- `date` : optionnel dans le schéma, complété par le loader (voir P1). Le brief l'appelle `pubDate` : renommer imposerait de toucher les 7 articles qui portent `date`, donc **garder `date`**
- `description` : optionnel, absent partout, fallback sur l'extrait `<!-- truncate -->`
- `cover`, `draft` : optionnels, absents partout, prévus pour la suite

Le champ `authors` référence `authors/authors.yml` (12 auteurs, avec `name`, `title`, `url`, `image_url`, `socials`). À charger comme une seconde collection avec son propre schéma, et à valider par référence croisée.

### P5. Extraits

**Décidé : `<!-- truncate -->` reste la source du résumé.**

17 des 19 articles le portent déjà, `POSTING.md` le documente, et les auteurs n'ont donc rien à changer à leurs habitudes. Astro l'ignore nativement : c'est à nous de couper le corps sur ce marqueur au build. La partie haute alimente **trois usages d'un coup**, calculés une seule fois en amont du layout :

1. l'extrait de la page de listing,
2. la `description` du flux RSS,
3. plus tard `<meta name="description">` et `og:description` (P6).

#### Les deux articles sans marqueur

- `blog/ai/2025-11-28-IA-et-consommation-energetique/index.md`
- `blog/general/2026-02-13-fosdem-2026/index.md`

**Traitement retenu** : leur ajouter un `<!-- truncate -->` au bon endroit. Deux lignes dans deux fichiers, cohérent avec le reste du corpus, et l'auteur garde la maîtrise de sa coupe plutôt que de la subir. Le repo contenu étant déjà ouvert pour les renommages de P1, le coût marginal est nul.

#### Le filet de sécurité

Indépendamment de ces deux cas, le repli automatique est implémenté **de toute façon** : un futur article publié sans marqueur ne doit pas produire un extrait vide. Règle de repli, dans l'ordre :

1. `description` du frontmatter si un jour elle existe (le schéma la prévoit, P4),
2. sinon le contenu avant `<!-- truncate -->`,
3. sinon le premier paragraphe du corps, coupé sur une frontière de mot.

Ce qu'on **ne fait pas** : imposer une `description` en frontmatter à tous les articles. Ce serait un second mécanisme concurrent, et une charge supplémentaire pour les auteurs alors que le marqueur remplit déjà le rôle.

### P6. `<head>`, Open Graph et partage social — *différé*

> **Décidé : traité plus tard.** La phase 1 pose un `<head>` minimal mais correct (canonical, `og:type`, `og:title`, `og:description`, et surtout `og:image`, qui coûte cinq lignes et évite une régression de partage par rapport à Docusaurus). Tout le reste de cette section, la spécialisation `article:*` et la carte Twitter, est reporté à une itération ultérieure. La section est conservée telle quelle comme cahier des charges de cette itération.

Le `<head>` reprend celui de `corporate/src/layouts/Layout.astro`, qui fournit déjà :

```astro
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const fullTitle = `${title} | Zatsit`;
```

```html
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />
<meta property="og:type" content="website" />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:site_name" content="Zatsit" />
<meta property="og:locale" content="fr_FR" />
```

Ce bloc est le socle. Il est **incomplet pour un blog** et doit être étendu, sans quoi la migration régresse par rapport à Docusaurus.

#### Manques à combler

`corporate/` ne déclare **ni `og:image` ni de carte Twitter**. Or Docusaurus expose aujourd'hui une image sociale (`themeConfig.image: 'img/zatsit-social-card.png'`) : la perdre casserait l'aperçu de tous les partages. À ajouter :

| Balise | Valeur |
|---|---|
| `og:image` | `cover` de l'article si présent, sinon la carte sociale par défaut, en URL absolue |
| `og:image:alt` | titre de l'article |
| `twitter:card` | `summary_large_image` |
| `twitter:title`, `twitter:description`, `twitter:image` | miroir des valeurs OG |

#### Spécialisation par type de page

`corporate/` code `og:type="website"` en dur, ce qui convient au vitrine mais pas à un blog. Le layout doit accepter un type :

- Listing, tags, pages statiques : `og:type="website"`
- Article : `og:type="article"`, plus `article:published_time` (date résolue en P1), `article:author` (résolu via `authors.yml`) et un `article:tag` par tag

#### Source de la `description`

Aucun article ne porte de `description` (voir P4). L'ordre de repli est donc : `description` du frontmatter, sinon l'extrait `<!-- truncate -->` (P5), sinon la description par défaut du site. Cette valeur alimente simultanément `<meta name="description">`, `og:description`, `twitter:description` et le flux RSS : à calculer une seule fois, en amont du layout.

#### Dépendance côté contenu

`POSTING.md` demande aux auteurs de coller à la main des liens de partage LinkedIn et X dans leurs articles. Ces liens s'appuient sur l'exactitude des balises OG de la page cible. Le canonical et `og:url` doivent donc rester alignés sur les URLs actuelles (P2).

#### Reste du `<head>` à reprendre

`lang="fr"` sur `<html>`, `<link rel="icon">`, `<meta name="generator">`, le script `is:inline` de persistance du thème et le `skip-link` vers `#main-content`. Le composant `<ViewTransitions />` de `corporate/` provient de `astro:transitions` en Astro 5 : s'il faut le conserver et que D1 retient Astro 6, c'est `<ClientRouter />` qu'il faut utiliser. À évaluer au regard de l'objectif « aucun JS client superflu ».

---

## 4. Repo coque : phases

### Phase 0 : préparation

- ✅ Créer `migration-astro` depuis `main`, dans les deux repos.
- ✅ **Capturer la référence** (fait le 7 août 2026, build Docusaurus réussi) :
  - liste des 45 routes → [`migration-routes-docusaurus.txt`](migration-routes-docusaurus.txt), versionnée sur la branche ;
  - **build complet archivé** dans `/Users/emmanuelperu/dev/zatsit/blog/docusaurus-reference-build` (38 Mo, hors des deux repos, donc il survit à la suppression de Docusaurus). Rejouable avec `npx serve docusaurus-reference-build`, ce qui vaut mieux que des captures figées : on compare n'importe quelle page, dans les deux thèmes, à n'importe quel moment de la migration.
- Épingler la version d'Astro (`npm view astro version`) conformément à D1.
- S'imprégner du design system : lire son `readme.md` et parcourir `guidelines/` (échelles de type, couleurs, spacing, rayons, élévation, iconographie). La skill `zatsit-design` est invocable directement.

### Phase 1 : socle Astro

- Suppression de Docusaurus et `npm create astro@latest -- --template blog` à la racine (D2 : coque neuve, remplacement en place).
- `astro.config.mjs` : `site: 'https://blog.zatsit.fr'`, Tailwind v4 via `@tailwindcss/vite`, `compressHTML`, `prefetch` viewport.
- Porter les jetons depuis le design system selon D5 : copier `tokens/palette.css`, `colors.css`, `typography.css`, `spacing.css`, `shape.css`, `base.css` et le point d'entrée `styles.css`, en respectant l'ordre d'import primitives → sémantique.
- Emprunter à `corporate/src/styles/global.css` les seuls patterns Astro : bloc `@theme` Tailwind v4, les trois états de thème, `prefers-reduced-motion`. Écarter les styles de sections propres au vitrine.
- Poppins auto-hébergée depuis `assets/fonts/` du design system (woff2, latin), icônes Lucide en `currentColor`, marques sociales en SVG locaux depuis `assets/icons/`.
- Récupérer les logos et sigles depuis `assets/logos/` (variantes bleu, or, noir, blanc, horizontal et sigle).
- `Layout.astro` calqué sur celui de `corporate`, **étendu selon P6** : `og:image`, carte Twitter, `og:type` variable, `article:*` sur les articles.
- Reprendre le script `is:inline` de persistance du thème et le `skip-link`.
- **Jalon** : une page de démonstration reprend le rendu Zatsit en clair et en sombre, sans flash au chargement, et ses balises OG passent un validateur de partage.

### Phase 2 : contenu et schéma

- `content.config.ts` : loader `glob()` vers `../zats-blog-content/blog`, pattern `**/{index,README}.md`.
- Loader maison pour la résolution des dates (P1).
- Schéma Zod aligné (P4) plus collection `authors`.
- **Jalon** : `astro check` passe sur les 19 articles, zéro erreur de schéma, 19 dates résolues.

### Phase 3 : pages et parité

- Listing paginé, page article, tags, index des tags, précédent/suivant.
- Plugin remark admonitions (P3), extraits (P5).
- `astro-expressive-code` (copier, titres de fichiers, highlight, diff).
- `@astrojs/rss`, `@astrojs/sitemap`, `remark-reading-time`.
- Pagefind en remplacement de `docusaurus-lunr-search`.
- Images d'articles via `astro:assets`, chemins relatifs depuis le repo contenu.
- Portage de `mentions-legales` et `blog-conception`, des badges CO2 (`zatsCO2JSBadge`, `zatsWebsiteCarbonBadge`).

### Phase 4 : vérification des URLs

- `diff` des routes entre les deux builds.
- `redirects` 301 dans `firebase.json` pour tout écart.
- Contrôle du `trailingSlash`.

### Phase 5 : CI/CD

- Adapter `.github/actions/docusaurus/action.yml` (à renommer) : checkout des deux repos côte à côte, build Astro.
- **Corriger au passage le cache figé** : la clé actuelle `blog-contents-${{ runner.os }}` ne contient aucun hash du contenu et n'est jamais réécrite, donc les builds déclenchés depuis la coque servent un contenu périmé. Y intégrer le SHA du repo contenu.
- Aligner les versions de Node entre les deux actions (20 ici, 22 côté contenu).
- Preview de PR et déploiement prod selon D3.

### Phase 6 : documentation

- README de dev : clonage côte à côte, lancement du serveur.
- Mettre à jour `CLAUDE.md` (il décrit aujourd'hui un redirect racine → `/blog` qui n'existe pas dans `firebase.json`).
- Adapter les outils locaux `dev.sh` / `watch-content.mjs` / `sync-content.sh`, ou les supprimer : avec le loader `glob()` pointant directement sur le repo voisin, **la copie de contenu n'a plus lieu d'être** et le HMR d'Astro suit les fichiers sources.

---

## 5. Repo contenu : phases

Périmètre resserré. **Aucun contenu rédactionnel n'est réécrit** : le schéma de P4 valide 19/19 en l'état. Les seules interventions sont structurelles, décidées en P1 et P5.

### Phase A : branche et normalisation

- Créer `migration-astro` depuis `main`.
- **Renommages P1** : les 4 dossiers vers `YYYY-MM-DD-slug` via `git mv`, plus `entreprise-a-mission/README.md` → `index.md`. Sans effet sur les URLs, `slug` étant explicite partout.
- **Ajout P5** : un `<!-- truncate -->` dans les 2 articles qui n'en ont pas.
- **Contrôle** : relancer le build Docusaurus après ces changements. S'il passe, rien n'a cassé. C'est le dernier moment où ce témoin est disponible, la coque étant supprimée en parallèle (D2).

### Phase A bis : CI de validation

- Exporter le schéma Zod de la coque en JSON Schema, le committer côté contenu.
- Workflow de validation du frontmatter sur PR (`blog/**`).
- Y ajouter un contrôle du nommage des dossiers (`YYYY-MM-DD-slug/index.md`), pour que la convention désormais uniforme le reste.

### Phase B : pipeline de preview

- Adapter `.github/actions/docusaurus/action.yml` et les deux workflows au build Astro.
- Conserver le déclenchement sur `blog/**` et `docs/**` et le déploiement en canal `pr-<id>`.

### Phase C : documentation contributeur

- Mettre `POSTING.md` à jour :
  - le nommage `YYYY-MM-DD-slug/index.md` devient **obligatoire** et non plus indicatif, et il est vérifié en CI ;
  - `date:` en frontmatter reste facultatif mais **recommandé**, et il fait foi en cas d'écart avec le dossier ;
  - `<!-- truncate -->` est confirmé comme mécanisme du résumé, avec ses trois usages (listing, RSS, méta) ;
  - retirer la mention `README.md`, tous les articles s'appellent désormais `index.md`.

---

## 6. Ordre d'exécution

Les deux repos ne sont plus indépendants : la normalisation du contenu (A) conditionne le loader de la coque, et la coque produit ensuite le schéma dont dépend la CI du contenu (A bis).

```
Coque    Ph0 ──────→ Ph1 → Ph2 → Ph3 → Ph4 → Ph5 → Ph6
          │           ↑                  ↓ (JSON Schema)
          │           │                  │
Contenu   └→ A ───────┘         A bis ←──┘ → B → C
          (normalisation)
```

Trois contraintes d'ordre :

1. **La capture de référence (Ph0) précède tout.** D2 supprime Docusaurus, il n'y a pas de seconde chance.
2. **La normalisation du contenu (A) précède la phase 2 de la coque.** Écrire le loader avant que les dossiers soient uniformes reviendrait à coder pour trois conventions puis à en jeter deux.
3. **Le build Docusaurus de contrôle après A** est le dernier témoin disponible : il faut le lancer avant que la coque ne disparaisse.

---

## 7. Critères d'acceptation

Repris du brief, rendus vérifiables :

- [ ] `npm run build` passe, 19/19 articles, zéro erreur Zod, **19/19 dates résolues**
- [ ] `diff` des routes entre build Docusaurus et build Astro vide, ou intégralement couvert par des 301 dans `firebase.json`
- [ ] Parité fonctionnelle : listing paginé, article, tags, recherche Pagefind, RSS, sitemap, admonitions, blocs de code avec bouton copier, temps de lecture
- [ ] Conformité au design system : jetons sémantiques uniquement (**aucun hexadécimal brut dans le code**), unité 4px, rayons 4/8/12, élévation par filets et couches tonales, glass limité à la nav, un seul mot-clé en gradient par titre, aucun emoji
- [ ] Double thème complet : bleu en clair, or en sombre, bascule sans flash, respect de `prefers-color-scheme` et de `prefers-reduced-motion`
- [ ] Poppins auto-hébergée en woff2 latin, aucune requête de police vers un tiers
- [ ] `<head>` complet sur article et listing : canonical, `og:type` correct, `og:image` en URL absolue, carte Twitter, `article:published_time` et `article:author` sur les articles, aperçu de partage vérifié sur LinkedIn et X
- [ ] Preview Firebase opérationnelle sur une PR du repo contenu
- [ ] Poids de page et JS client mesurés et inférieurs à l'actuel (objectif GreenIT), badge ecoindex revérifié : `npm run check:eco`, comparé à la ligne de base Docusaurus mesurée dans `.claude/skills/eco-check/references/baseline-docusaurus.md` (0/45 pages sous le budget de 1 Mo, médiane 304 ko initial et 1 335 ko total, accueil à 3,2 Mo)
- [ ] Accessibilité WCAG 2.1 AA vérifiée, pas supposée : `npm run check:a11y` au vert et checklist du skill `wcag-check` passée sur chaque page livrée
- [ ] Aucun article modifié, ou modifications documentées et justifiées

---

## 8. Risques

| Risque | Probabilité | Parade |
|---|---|---|
| Dates manquantes silencieuses sur 12 articles | élevée sans P1 | garde-fou au build qui lève une erreur |
| Changement d'URL non détecté | moyenne | `diff` de routes obligatoire en phase 4 |
| 301 de prod oubliées, `firebase.json` ne couvrant que les previews (D3) | élevée | porter les redirections sur la couche qui sert le bucket, versionnées, vérifiées en phase 4 |
| Perte de la référence visuelle, la coque étant supprimée (D2) | élevée | capture obligatoire en phase 0 avant toute suppression |
| Cache CI figé masquant un contenu périmé | avérée aujourd'hui | corriger la clé en phase 5 |
| Écart Tailwind v3 / v4 entre `components` et `corporate` | faible | copier les styles, ne pas dépendre de `components` |
| Usage du violet `#7c3aed` hors du décoratif | faible | jeton cantonné aux gradients et blobs, contrôle en revue |
| Dérive du design system après la migration | moyenne | jetons copiés, donc figés : prévoir une procédure de resynchronisation, `/design-sync` le permet |
| Hexadécimaux bruts glissés dans le code, cassant le double thème | moyenne | règle de revue explicite, contrôle au moment de la recette |
| Régression de poids de page via Pagefind | faible | mesurer, l'index Pagefind est chargé à la demande |
