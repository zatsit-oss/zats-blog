// Global site constants, imported wherever they are needed.

export const SITE_TITLE = 'zatsit';
export const SITE_DESCRIPTION =
  'Quel que soit votre domaine tech, nous avons forcément un article pour vous';

/** Default social card, used when a page or an article declares no cover. */
export const SITE_OG_IMAGE = '/img/zatsit-social-card.png';

/** How many articles per page on the paginated listing. Matches Docusaurus. */
export const POSTS_PER_PAGE = 10;

/**
 * The content lives in a separate repository, cloned next to this one.
 * See the README for the local setup.
 */
export const CONTENT_REPO = '../zats-blog-content';

/**
 * Outbound links, shared by the header and the footer. Values match the
 * defaults of the corporate site's env schema, so the two stay in step.
 */
export const GITHUB_URL = 'https://github.com/zatsit-oss';
export const LINKEDIN_URL = 'https://www.linkedin.com/company/zatsit/';
export const WEBSITE_URL = 'https://zatsit.fr';
export const SUSTAINABILITY_URL = 'https://sustainability.zatsit.fr/';
export const BCORP_URL = 'https://www.bcorporation.net/';
export const CONTACT_EMAIL = 'contact@zatsit.fr';
/**
 * TODO, after the production switch: this result was measured on the Docusaurus
 * blog, so it grades a site this one replaces. Re-run the analysis on the live
 * Astro build and swap the id, or the footer link and the "mesuré avec" band on
 * the home page will point at someone else's numbers, which is exactly the kind
 * of stale claim /blog-conception/ exists to avoid.
 */
export const ECOINDEX_URL =
  'https://www.ecoindex.fr/resultat/?id=6ac3f361-a35c-4933-8c09-890046d300f0';

/**
 * Weight of the home page on a first visit, feeding the CO2.js estimate on
 * /blog-conception/.
 *
 * Refresh both values together after any change that moves page weight:
 *
 *   npm run build && npm run check:eco
 *
 * and read the `total` column of index.html. The figure is printed next to the
 * estimate on the page, so a stale one is visible to the reader rather than
 * quietly wrong, which is how the Docusaurus badge ended up asserting 400 kB
 * long after that stopped being true.
 */
export const MEASURED_PAGE_BYTES = 91.6 * 1024;
export const MEASURED_PAGE_DATE = '25 août 2026';

/** Postal address, as the corporate footer prints it. */
export const ADDRESS = ['EURATECHNOPOLYS', '2 Allée de la Haye du Temple', '59160 Lille'];

/**
 * Home page hero.
 *
 * PLACEHOLDER. The Docusaurus home was the article listing and nothing else,
 * so there is no previous wording to restore and none of this is a decision
 * yet. It is here so the layout can be judged with real text in it; replace
 * every field.
 *
 * The copy below is the only thing that already existed: the site tagline, and
 * the promise from HomepageFeatures, a Docusaurus component that was written
 * but never rendered on any page.
 *
 * Constraints worth keeping when rewriting: one gradient phrase per heading,
 * per the design system, and `illustration` must stay decorative, since it
 * carries `alt=""`. Anything meaningful belongs in the text.
 */
export const HERO = {
  eyebrow: 'Le blog de zatsit',
  /**
   * Two clauses, two voices: the statement in roman, the answer in italic and
   * in the accent colour. These words went in as a placeholder on 21 August
   * and Emmanuel kept them on the 28th, so they are the copy, not a draft.
   * Splitting them differently stays a one-line change here.
   */
  title: 'Nos consultants construisent.',
  counterpoint: 'Puis ils écrivent comment.',
  subtitle:
    'Architecture, cloud, data, IA et éco-conception. Quel que soit votre domaine tech, nous avons un article pour vous.',
  actions: [
    { href: '/categories/', label: 'Parcourir les catégories', primary: true },
    { href: '/blog-conception/', label: 'Comment ce blog est éco-conçu' },
  ],
} as const;

/**
 * Two taxonomies, one entry point. Both are published, but the header names
 * only "Catégories": `/categories/` carries the six category cards and, under
 * them, the cloud of seventeen tags. Decided on 27 August, against the
 * three-entry header that shipped that morning, and for the reader's sake
 * rather than the header's: side by side, one axis reads as a shelf and the
 * other as a subject index, which two menu entries never conveyed.
 *
 * `/tags/` redirects there, in astro.config.mjs. The seventeen `/tags/<tag>/`
 * pages stay: they are part of the 45 routes under contract, and the cloud is
 * what links to them.
 *
 * One word for one thing, settled on 28 August: the reader reads "tag", which
 * is what the frontmatter and the URL have always said. "Thème" lasted two
 * days and only added a translation.
 *
 * The history below is why the wording is watched so closely here.
 *
 * Two taxonomies, and they were being spoken of as one. The content repository
 * has always carried both: one **category** per article, the folder it lives
 * in, drawn from the closed list in its config.json; and free **tags**, several
 * per article, "used for cross-category indexing" in the words of its own
 * AGENTS.md. Only the tags were ever published, under a menu entry that called
 * them categories, on a page whose heading called them tags, next to an intro
 * that called them themes.
 *
 * So: categories are the coarse, stable, curated axis, six of the ten allowed
 * ones in use. Tags are the fine, open one, seventeen of them. The word
 * "catégorie" is now reserved for the first and never used for the second.
 *
 * The header lists one entry point per axis rather than the six categories,
 * which is what Docusaurus did until its navbar ran out of room. `/categories/`
 * is that navbar, on a page, and it costs no dropdown script and no focus trap.
 *
 * `/authors/` joins them on 28 August. It was among the 45 routes from the
 * start and **nothing in the site linked to it**: reachable only by typing the
 * URL, for a page about the thirteen people who write here. Now that each name
 * leads to their own page, the list is worth an entry of its own.
 */
export const NAV_LINKS = [
  { href: '/', label: 'Blog' },
  { href: '/categories/', label: 'Catégories' },
  { href: '/authors/', label: 'Auteurs' },
  { href: '/blog-conception/', label: 'Éco-conception' },
] as const;

/**
 * Reader-facing name for each category slug. The slugs are the folder names in
 * the content repository, English and lowercase; these are what the reader sees.
 *
 * All ten allowed categories are listed, not just the six with articles, so a
 * first post in `mobile/` renders as "Mobile" and not as a raw slug. The order
 * is the one the site uses: config.json is alphabetical on the English slugs,
 * which is meaningless once translated.
 *
 * Labels come from the Docusaurus navbar this replaces, with two changes:
 * "Green" reads "Green IT", the name the articles themselves use, and its
 * "Data & AI" entry is split, since config.json makes `data` and `ai` two
 * separate categories.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  green: 'Green IT',
  architecture: 'Architecture',
  cloud: 'Cloud',
  data: 'Data',
  ai: 'IA',
  dev: 'Développement',
  web: 'Web',
  mobile: 'Mobile',
  ops: 'Ops',
  general: 'Général',
};

/** The label, or the slug itself if a category ever ships before its label. */
export function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug;
}
