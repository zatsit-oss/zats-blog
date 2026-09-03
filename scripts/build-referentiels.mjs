/**
 * Regenerates REFERENTIEL-GREENIT.md and REFERENTIEL-W3C-WSG.md from
 * src/data/referentiel-*.json.
 *
 *   npm run docs:referentiels
 *
 * The JSON is the source and this script is the only writer of those two files:
 * editing the Markdown by hand puts the pages under /audits/ and the document
 * out of step, and an audit that contradicts itself is worse than no audit. The
 * same duplication, one calculation in two places, is what produced the
 * pagination bug of 29 August.
 *
 * The prose that is not per-rule, the introductions and the summaries of what is
 * missing, lives in `PREAMBULE` below rather than in the JSON: it is editorial
 * and it changes for other reasons than a verdict does.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DATA = join(ROOT, 'src/data');

const LABEL = {
  OK: '✅ Respectée',
  PART: '🟡 Partielle',
  KO: '❌ Non respectée',
  NA: '⬜ Sans objet',
  ORG: '🔍 En cours d’analyse',
};

const PLURIEL = {
  OK: 'respectées',
  PART: 'partielles',
  KO: 'non respectées',
  NA: 'sans objet',
  ORG: 'en cours d’analyse',
};

const SINGULIER = {
  OK: 'respectée',
  PART: 'partielle',
  KO: 'non respectée',
  NA: 'sans objet',
  ORG: 'en cours d’analyse',
};

/** Editorial text, per reference. */
const PREAMBULE = {
  greenit: {
    fichier: 'REFERENTIEL-GREENIT.md',
    titre: 'Le blog zatsit face aux 119 bonnes pratiques du collectif Green IT',
    intro: [
      "Évaluation du référentiel [cnumr/best-practices](https://github.com/cnumr/best-practices) appliquée à ce dépôt.",
      "Le référentiel est souvent cité comme « les 115 règles » ; sa version publiée en compte **119 en français**, et c'est ce nombre qui est repris ici. Chaque verdict s'appuie sur une mesure du build ou sur un fichier du dépôt, jamais sur une intention.",
      "Ce document a un pendant, [`REFERENTIEL-W3C-WSG.md`](REFERENTIEL-W3C-WSG.md), et une version en ligne sur [/audits/](https://blog.zatsit.fr/audits/). Les trois sont générés depuis `src/data/referentiel-greenit.json` : ne pas les modifier à la main, lancer `npm run docs:referentiels`.",
    ],
    apres: [
      "### Ce qui reste à faire\n",
      "Les seuls écarts qui coûtent quelque chose au lecteur, par ordre d'effort croissant :\n",
      "1. **`robots.txt` absent** (BP_4008). Le sitemap est généré et segmenté, mais rien ne le déclare aux robots. Cinq lignes à écrire.",
      "2. **Aucune feuille d'impression** (BP_027). C'est la seule règle en échec franc, et un article technique est typiquement ce qu'on imprime ou passe en PDF.",
      "3. **La page 404 n'est pas servie** (BP_096). Le fichier existe, mais la production répond aujourd'hui par la page d'accueil en 200 sur une URL inconnue. Mesuré, inscrit au plan.",
      "4. **Pas de stratégie de fin de vie des contenus** (BP_4031, BP_085). Rien n'est jamais dépublié et aucune règle d'archivage n'existe.\n",
      "### Les trois quarts du travail sont structurels\n",
      "La majorité des règles sont respectées non par optimisation mais par choix d'architecture : site statique, aucun CMS, aucune base de données, aucun traceur, aucun cookie, aucun framework côté client. Les règles sans objet le sont pour cette raison, et ce n'est pas une facilité : c'est le résultat de la décision de quitter Docusaurus, qui envoyait 135 ko de JavaScript compressé là où ce site en envoie 1,1.\n",
    ],
  },
  wsg: {
    fichier: 'REFERENTIEL-W3C-WSG.md',
    titre: 'Le blog zatsit face aux Web Sustainability Guidelines du W3C',
    intro: [
      "Évaluation des [Web Sustainability Guidelines](https://www.w3.org/TR/web-sustainability-guidelines/) appliquée à ce dépôt.",
      "Le référentiel compte **71 lignes directrices** regroupant **196 critères de succès**, en quatre domaines. Ce document évalue les 71 lignes directrices, chacune couvrant ses critères ; c'est l'unité lisible, et le nombre de critères de chaque ligne figure dans la colonne « Critères ».",
      "Ce document a un pendant, [`REFERENTIEL-GREENIT.md`](REFERENTIEL-GREENIT.md), et une version en ligne sur [/audits/](https://blog.zatsit.fr/audits/). Les trois sont générés depuis `src/data/referentiel-wsg.json` : ne pas les modifier à la main, lancer `npm run docs:referentiels`.",
    ],
    apres: [
      "### Une distinction que le référentiel Green IT n'imposait pas\n",
      "Neuf lignes directrices portent sur l'entreprise et non sur le site : stratégie de produit, modèles d'impact, pratiques financières, philanthropie, partage de la valeur, gestion des déchets électroniques. Elles sont marquées **En cours d'analyse** plutôt que respectées ou non : la question se pose, mais elle se tranche au niveau de l'entreprise et non depuis un dépôt de code. Un « sans objet » laisserait croire qu'elle ne se pose pas.\n",
      "### Ce qui manque\n",
      "1. **Aucun plan de fin de vie**, ni pour le site ni pour ses contenus. C'est la seule ligne en échec franc, et les deux référentiels la relèvent.",
      "2. **`robots.txt` absent**, alors que le sitemap est généré et segmenté.",
      "3. **Aucune donnée structurée `schema.org`** sur les articles, alors que le reste des métadonnées est complet.",
      "4. **Aucune feuille d'impression**, pour des articles techniques qui se prêtent au PDF.",
      "5. **Aucun budget humain** défini, là où ceux de performance et d'environnement le sont et échouent le build.\n",
      "### Deux écarts assumés, argumentés dans le code\n",
      "**Deux appels tiers** subsistent, les badges Website Carbon et EcoIndex. La règle voudrait zéro, et l'arbitrage a été rendu deux fois dans l'autre sens : une empreinte que le lecteur peut vérifier vaut une requête, et la figer au build ferait noter le déploiement précédent.\n",
      "**Aucun accès hors ligne**, donc aucun service worker. Un site statique avec un cache HTTP correctement réglé n'a pas besoin d'un script pour rejouer ce que le navigateur fait déjà.\n",
    ],
  },
};

function compter(groupes) {
  const parStatut = { OK: 0, PART: 0, KO: 0, NA: 0, ORG: 0 };
  for (const groupe of groupes) {
    for (const critere of groupe.criteres) parStatut[critere.statut] += 1;
  }
  const total = Object.values(parStatut).reduce((a, b) => a + b, 0);
  const applicables = total - parStatut.NA - parStatut.ORG;
  return { parStatut, total, applicables, score: Math.round((100 * parStatut.OK) / applicables) };
}

function rendre(ref) {
  const meta = PREAMBULE[ref.id];
  const c = compter(ref.groupes);
  const out = [];
  const w = (line = '') => out.push(line);

  w(`# ${meta.titre}\n`);
  for (const p of meta.intro) w(`${p}\n`);

  w('## Résultat\n');
  w('| Statut | Nombre |');
  w('|---|---:|');
  for (const [statut, n] of Object.entries(c.parStatut)) {
    if (n > 0) w(`| ${LABEL[statut]} | ${n} |`);
  }
  w(`| **Total** | **${c.total}** |\n`);
  w(
    `**${c.parStatut.OK} ${ref.unite} respectées sur ${c.applicables} qui engagent ce dépôt**, ` +
      `soit ${c.score} %, plus ${c.parStatut.PART} partielles et ${c.parStatut.KO} non respectée.\n`,
  );

  for (const p of meta.apres) w(p);

  w('---\n');

  for (const groupe of ref.groupes) {
    const cg = compter([groupe]);
    const resume = Object.entries(cg.parStatut)
      .filter(([, n]) => n > 0)
      .map(([statut, n]) => `${n} ${n > 1 ? PLURIEL[statut] : SINGULIER[statut]}`)
      .join(', ');

    w(`## ${groupe.nom}\n`);
    w(`*${groupe.criteres.length} ${ref.unite} : ${resume}.*\n`);
    w(`| ${ref.id === 'wsg' ? 'Ligne directrice' : 'Règle'} | ${ref.id === 'wsg' ? 'Critères' : 'Intitulé'} | Statut | Comment |`);
    w('|---|---|---|---|');

    for (const critere of groupe.criteres) {
      const [a, b] =
        ref.id === 'wsg'
          ? [`[${critere.titre}](${critere.url})`, critere.ref]
          : [`\`${critere.ref}\``, critere.titre];
      w(`| ${a} | ${b} | ${LABEL[critere.statut]} | ${critere.comment} |`);
    }
    w('');
  }

  w('---\n');
  w('## Méthode\n');
  w(
    'Chaque verdict a été posé en relisant le code concerné et, quand la règle porte sur un ' +
      'comportement, en mesurant le build : `npm run check:eco` pour les poids et les requêtes, ' +
      '`npm run check:axe` pour l\'accessibilité sur toutes les pages dans les deux thèmes et aux ' +
      'deux largeurs, et Chrome piloté en CDP pour ce qui ne se lit pas dans le HTML.\n',
  );
  w(
    `Source : [${ref.source}](${ref.source}), ${ref.version}. Évalué le ` +
      `${ref.evalue_le.split('-').reverse().join('/')}.\n`,
  );
  w('*Fichier généré par `npm run docs:referentiels`. Ne pas le modifier à la main.*\n');

  return out.join('\n');
}

for (const id of ['greenit', 'wsg']) {
  const ref = JSON.parse(readFileSync(join(DATA, `referentiel-${id}.json`), 'utf8'));
  const cible = join(ROOT, PREAMBULE[id].fichier);
  writeFileSync(cible, rendre(ref), 'utf8');
  const c = compter(ref.groupes);
  console.log(
    `  ${PREAMBULE[id].fichier.padEnd(26)} ${c.total} entrées, ${c.parStatut.OK}/${c.applicables} respectées (${c.score} %)`,
  );
}
