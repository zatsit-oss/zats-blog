Docusr# Ce que la migration vers Astro change, en éco-conception et en accessibilité

Document de travail, 13 août 2026. Matière première pour un article de blog.

**Statut des chiffres.** Tout ce qui figure sous « mesuré » a été produit par un script reproductible, sur le build Docusaurus archivé ou sur le build Astro. Ce qui reste projeté est signalé comme tel. Les deux ne doivent pas être mélangés dans l'article, et surtout pas dans un communiqué.

Le build Astro rend les 19 articles depuis le 13 août 2026. Les pages de listing, tags, archives et auteurs manquent encore, donc les chiffres portent sur les articles, pas sur le site complet.

Reproduire les mesures :

```bash
node .claude/skills/eco-check/scripts/page-weight.mjs \
  /Users/emmanuelperu/dev/zatsit/blog/docusaurus-reference-build   # ligne de base
npm run check:a11y                                                  # contrastes des jetons
```

---

## 1. Le point de départ, mesuré

Le build Docusaurus archivé : 45 pages, 38 Mo sur disque.

| Indicateur | Valeur |
|---|---|
| Pages sous le budget de 1 Mo | **0 / 45** |
| Poids médian, première visite | 304 ko |
| Poids médian, total | 1 335 ko |
| Page la plus légère du site (`markdown-page`) | 243 ko initial, 1 069 ko total, 117 éléments DOM |
| Accueil | 3 152 ko initial, 6 734 ko total |
| Page la plus lourde (`devlille-2026`) | 10 850 ko au total |

Convention de mesure : le texte est compté compressé en gzip, ce que tout hébergeur fait ; les binaires sont comptés bruts. Les images en `loading="lazy"` sortent du chiffre « initial » et restent dans le « total ».

### Le vrai sujet n'est pas les pages lourdes, c'est le plancher

La page 404 du site contient 114 éléments DOM. Elle télécharge quand même **243 ko à la première visite et 1 069 ko au total**.

Ce plancher se décompose ainsi, et il est identique sur les 45 routes :

| Ressource | Poids servi | Pages qui le reçoivent | Pages qui en ont besoin |
|---|---|---|---|
| `main.js` (runtime React + Docusaurus) | 424 ko brut, **131 ko gzip** | 45 | 0 pour lire un texte |
| `runtime~main.js` | 7 ko brut, 3,6 ko gzip | 45 | idem |
| `styles.css` (monolithe Infima) | 224 ko brut, **104 ko gzip** | 45 | partiellement |
| dont règles KaTeX | ~17,9 ko brut | 45 | **1** |

Soit environ **135 ko de JavaScript compressé sur chaque page**, pour un site dont la fonction est d'afficher du texte. Aucun réglage par page ne déplace ce chiffre : c'est le coût d'entrée du framework. Seul le fait de ne plus l'embarquer le supprime.

L'exemple KaTeX est le plus parlant parce qu'il est vérifiable en une commande : **une seule** page du site contient une formule mathématique (la définition du WUE dans l'épisode 2 de la série GreenIT). Les 44 autres reçoivent quand même les règles CSS de KaTeX, parce que le CSS est un fichier unique.

### Ce que la migration ne corrigera pas toute seule

À dire dans l'article, sinon la démonstration est malhonnête.

Les pages les plus lourdes le sont à cause d'images non optimisées, pas du framework : `devlille-2026` pèse 10,8 Mo et l'accueil 6,7 Mo, essentiellement des rasters bruts. Ces fichiers vivent dans le dépôt de contenu.

**Correction apportée par la mesure du 13 août.** J'avais écrit ici que passer à Astro ne convertirait pas ces images. C'est faux : `astro:assets` traite les 69 images du corpus automatiquement, sans rien demander. Une source de 2 498 ko descend à 1 543 ko, une autre de 1 489 ko à 157 ko.

La conclusion tient quand même, mais pour une autre raison. Astro **réencode**, il ne **redimensionne** pas : sans largeur déclarée, une photo de 4 000 px de large reste une photo de 4 000 px, simplement mieux compressée. Résultat mesuré sur les 20 pages Astro, quatre restent hors du budget de 1 Mo :

| Page | Docusaurus | Astro | Ce qui a joué |
|---|---|---|---|
| `devlille-2026` | 10 850 ko | 5 515 ko | réencodage, ÷2 |
| `green-exploitation-miniere` | 2 848 ko | 2 849 ko | rien, sources déjà en WebP |
| `ia-et-consommation-energetique` | 1 977 ko | 1 977 ko | rien |
| `entreprise-a-mission` | 1 287 ko | 1 287 ko | rien |

Le correctif n'est donc pas « convertir en WebP », c'est déjà fait, mais des images responsives avec largeurs explicites, ou des sources plus petites dans le dépôt de contenu.

Nuance à ne pas escamoter dans l'article : ces images sont en `loading="lazy"`, donc hors du poids de première visite. Un lecteur qui ne défile pas ne les télécharge pas. Le dépassement concerne celui qui lit l'article en entier.

Le gain de la migration est un gain de **plancher**, franc et généralisé. Le gain sur les images est un travail distinct, à mener en parallèle.

---

## 2. Ce que l'architecture Astro change, et pourquoi

### Zéro JavaScript par défaut

Docusaurus est une application React qui se réhydrate côté client. Astro produit du HTML statique et n'envoie du JavaScript que pour les îlots explicitement déclarés `client:*`. Sur ce blog, l'inventaire des interactions est court : la bascule de thème et la recherche. Tout le reste, listing, article, tags, archives, auteurs, est du texte et des liens.

La règle posée dans `.claude/rules/quality.md` est donc : **zéro JS client par défaut**, chaque directive `client:*` étant une exception argumentée.

**Mesuré le 13 août 2026, sur les 19 articles réellement rendus** : entre **56,5 et 68,0 ko** à la première visite, 10 requêtes sur toutes les pages. La projection annonçait « sous 150 ko » : le résultat est deux fois meilleur.

L'écart le plus parlant n'est pas la médiane, c'est **l'amplitude**. Docusaurus allait de 243 à 3 324 ko selon la page ; Astro tient dans une fourchette de 12 ko sur l'ensemble du corpus. Le plancher du framework a disparu, il ne reste que le contenu. C'est exactement ce que la section précédente prédisait, et c'est vérifiable en une commande.

### Une dépendance sur cinq

| | Docusaurus | Astro |
|---|---|---|
| Paquets dans le lockfile | **1 478** | **307** |

C'est un gain d'éco-conception indirect mais réel : moins d'installations en CI, moins de bande passante, moins de surface d'audit, et un point de sécurité au passage. C'est aussi la fin d'une dette précise, l'incompatibilité entre webpack 5.10x et Docusaurus 3.9.2 qui bloquait les montées de version.

### Le CSS servi n'est plus un monolithe

Astro scope les styles par composant et ne charge une feuille que sur les pages qui l'utilisent. Le cas KaTeX devient une règle explicite : les 17,9 ko de CSS mathématique ne partent que vers la page qui contient une formule.

### Les polices, à condition de les tenir

L'API Fonts native d'Astro télécharge, sous-ensemble et auto-héberge les woff2 au build : aucune requête vers un tiers, ce qui est un gain de confidentialité autant que de poids.

Le garde-fou a immédiatement trouvé une dette de notre côté : `astro.config.mjs` déclare 7 graisses × 2 styles, soit **14 fichiers woff2 pour 140 ko**, quand la règle éco en autorise 3. Le script le signale au-delà de 6 fichiers. À corriger en phase 3.

---

## 3. Accessibilité : le vrai gain est la propriété du balisage

C'est l'angle le plus intéressant pour l'article, et le moins attendu.

### Sous Docusaurus, le HTML ne nous appartenait pas

Le thème générait le balisage : la navigation, les listings, l'entête d'article, la liste d'auteurs. Le modifier suppose de *swizzler*, c'est-à-dire de forker un composant du thème et de le maintenir à chaque montée de version.

**Le dépôt ne contenait aucun composant swizzlé.** Pas de `src/theme/`. Toute l'accessibilité au-delà de la couleur était donc hors de portée.

Ce que cela donnait concrètement dans `src/css/custom.css`, sous un commentaire `/* Accessibility improvements */` :

```css
.navbar__link:hover, .navbar__link--active, article a {
  text-decoration: underline;
}

div[class^='authorSocials'] {
  overflow: inherit;
}
```

Deux règles. La première est une vraie amélioration, souligner les liens. La seconde est le symptôme : un sélecteur qui attaque une classe de CSS module par préfixe, parce que son nom est haché au build et qu'on n'a pas la main sur le composant. C'est du contournement, pas de la conception, et cela casse silencieusement à la prochaine montée de version.

Sous Astro, ces deux lignes deviennent des choix directs dans nos propres composants : niveaux de titres, points de repère, ordre de tabulation, `aria-label`, `<time datetime>`, taille des cibles. On ne contourne plus un thème, on écrit le HTML.

### La palette Docusaurus n'a jamais été rebrandée

Vérifiable dans `custom.css`. La couleur primaire était bien réglée sur le bleu de marque, mais les six teintes dérivées qu'Infima utilise pour les états de survol, d'activation et les boutons étaient restées **au vert par défaut de Docusaurus** :

```css
:root {
  --ifm-color-primary: #0f15fd;        /* bleu de marque */
  --ifm-color-primary-dark: #29784c;   /* vert Docusaurus */
  --ifm-color-primary-light: #33925d;  /* vert Docusaurus */
  /* ... */
}
```

Même chose en thème sombre : primaire à l'or de marque, teintes dérivées au turquoise par défaut. Personne ne l'avait vu parce que rien ne le vérifiait.

### Aujourd'hui, les contrastes sont mesurés, pas supposés

`npm run check:a11y` lit les vrais fichiers de jetons, suit les chaînes de `var()`, composite les couleurs translucides du thème sombre sur leur fond réel, et mesure 16 appariements dans les deux thèmes. **Tous ceux soumis à un seuil passent WCAG 2.1 AA.**

| Appariement | Clair | Sombre | Seuil |
|---|---|---|---|
| Texte sur fond | 16,71:1 | 13,40:1 | 4,5 |
| Texte secondaire sur fond | 7,58:1 | 6,71:1 | 4,5 |
| Lien sur fond | 8,25:1 | 10,01:1 | 4,5 |
| Libellé sur bouton primaire | 8,25:1 | 10,01:1 | 4,5 |

Deux points de vigilance, que seule la mesure fait apparaître :

- `--color-secondary` en thème sombre (`#e1601f`) tient à **4,83:1**, soit 0,33 de marge. Il passe sur le fond de page, il tombe sous le seuil sur une surface.
- `--color-eco` (`#2ecc71`) est à **2,10:1** sur blanc. Ce n'est pas une couleur de texte en thème clair. C'est précisément la couleur des badges CO2, donc l'endroit exact où la tentation est la plus forte.

Ce second point est l'anecdote la plus utile de l'article : **le vert qui signifie « écologique » est le plus difficile à rendre lisible.** Il doit rester un signifiant, une pastille, un aplat, une marque de graphique, et jamais porter le chiffre lui-même.

### Le garde-fou existe avant les pages, pas après

C'est le changement de méthode, et il vaut d'être raconté. Les deux commandes sortent en erreur et sont posées **avant** l'écriture des pages de la phase 3, pas en audit après coup. Un audit d'accessibilité en fin de projet produit une liste de dettes ; un seuil posé avant produit du code conforme.

---

## 4. Le tableau à compléter quand le build passera

Le squelette de la comparaison finale. Les colonnes « après » sont vides tant qu'elles ne sont pas mesurées, et elles doivent le rester.

Mesures du 13 août 2026, sur les 19 articles rendus. Les pages de listing, tags et archives manquent encore : le tableau sera complet en fin de phase 3.

| Indicateur | Docusaurus | Astro | Gain |
|---|---|---|---|
| JS servi par page | 135 ko gzip | **0** | supprimé |
| Poids initial, médiane | 304 ko | **~60 ko** | ÷ 5 |
| Poids initial, minimum | 243 ko | **56,5 ko** | ÷ 4,3 |
| Poids initial, maximum | 3 324 ko | **68,0 ko** | ÷ 49 |
| Amplitude entre pages | 243 à 3 324 ko | **56,5 à 68,0 ko** | 12 ko d'écart |
| Requêtes | 5 à 16 | **10** | stable |
| Pages sous le budget de 1 Mo au total | 0 / 45 | **16 / 20** | |
| Paquets dans le lockfile | 1 478 | 307 | ÷ 4,8 |
| Appariements de contraste vérifiés | 0 | 16, deux thèmes | |
| Composants dont nous maîtrisons le balisage | 0 | tous | |

Le « 0 JS » mérite une précision honnête : il vaut pour l'article tel qu'il est rendu aujourd'hui. La bascule de thème et la recherche Pagefind en ajouteront, et le chiffre devra être remesuré plutôt que reconduit.

---

## 5. Angle éditorial suggéré

Le titre facile serait « nous avons divisé le poids du blog par N ». Il est moins intéressant que ce que les mesures racontent réellement.

**La page 404 du blog pesait 1 Mo.** Cent quatorze éléments HTML, aucune image, aucun contenu, et un mégaoctet sur le réseau. C'est une bonne entrée en matière, parce qu'elle rend visible une idée que les articles GreenIT énoncent rarement de façon concrète : sur un site de contenu, le coût dominant n'est pas ce que vous publiez, c'est ce que votre outil embarque avant que vous ayez publié quoi que ce soit.

Le second fil, plus original, est celui de l'accessibilité comme conséquence de la propriété du code. Nous n'avons pas migré pour être plus accessibles ; nous avons migré et récupéré la capacité de l'être. Deux règles CSS de contournement contre un balisage entièrement nôtre, c'est une différence de nature, pas de degré.

Le troisième, à ne pas escamoter : la migration ne répare pas les images de 10 Mo, et le vert écologique est la couleur la moins lisible de la palette. Un article d'éco-conception qui cite ses propres échecs mesurés est plus crédible qu'un article qui n'affiche que son ratio d'amélioration.
