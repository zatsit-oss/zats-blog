// Global site constants, imported wherever they are needed.

export const SITE_TITLE = 'zatsit';

/**
 * Title of the home page, which cannot be `SITE_TITLE` alone: "zatsit" is six
 * characters and says nothing about what the site is. Every other page reads
 * "<sujet> | zatsit", so the home page needs its own subject.
 *
 * 22 characters, inside the 10 to 70 a search engine displays without cutting.
 * It already contains the site name, which is what stops BaseHead from
 * appending it a second time.
 */
export const HOME_TITLE = 'Le blog tech de zatsit';
export const SITE_DESCRIPTION =
  'Quel que soit votre domaine tech, nous avons forcément un article pour vous';

/**
 * Default social card, used when a page or an article declares no cover, which
 * today is every page.
 *
 * The declared size is the file's real size, measured: **350x304**, not the
 * 1200x630 a card is expected to be. Announcing a size the file does not have
 * would make a platform reserve the wrong box, so these two numbers are honest
 * rather than aspirational.
 *
 * **The asset itself needs replacing, and that is a design task.** It is a logo
 * export, not a card: the sigle above the wordmark on a fully transparent
 * background, which LinkedIn and Meta composite onto whatever they use, and
 * 350px wide against the 1200px `summary_large_image` wants at a 1.91:1 ratio.
 * At this size a platform falls back to a small thumbnail. Target 1200x630,
 * opaque. The corporate site carries the same defect on its own card.
 */
export const SITE_OG_IMAGE = '/img/zatsit-social-card.png';
export const SITE_OG_IMAGE_WIDTH = 350;
export const SITE_OG_IMAGE_HEIGHT = 304;
/** Describes the card, not the page: the same image is shared by every page. */
export const SITE_OG_IMAGE_ALT = 'Le logo de zatsit, le sigle au-dessus du nom';

/** How many articles per page on the paginated listing. Matches Docusaurus. */
/**
 * Cards in the grid, on every listing page. Nine and not ten, since 28 August:
 * the grid resolves to three columns at full measure, so nine is three full
 * rows where ten left a fourth row holding a single card.
 *
 * The first page carries the featured article **on top of** these nine, so it
 * shows ten articles and every grid on the site has the same shape. Before, the
 * lead ate a grid slot and page 1 showed nine cards against page 2's ten.
 */
export const POSTS_PER_PAGE = 9;

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
 * Link to the site's EcoIndex result, resolved by EcoIndex rather than pinned
 * to one.
 *
 * **No result id, deliberately.** A `resultat/?id=…` link names one measurement
 * and freezes it: the previous one graded the Docusaurus site at 3,665 kB long
 * after that stopped being true, and its TODO sat unhonoured through the whole
 * migration. `bff.ecoindex.fr/redirect/` answers a 303 to the latest result for
 * a URL, so the link follows every re-analysis on its own, with nothing to
 * maintain here and no API call at build time.
 *
 * The trailing slash is stripped for the same reason as in
 * `EcoIndexBadge.astro`: EcoIndex keys results on the exact URL string and
 * stores them without one. Keeping it resolves to a different row, which is
 * what made the badge read E while a fresh analysis scored B.
 *
 * Takes the site rather than spelling the domain out, so there stays one
 * spelling of it, in `astro.config.mjs`.
 */
export function ecoindexResultUrl(site: URL | undefined): string {
  const target = new URL('/', site).href.replace(/\/$/, '');
  return `https://bff.ecoindex.fr/redirect/?url=${encodeURIComponent(target)}`;
}

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
export const MEASURED_PAGE_BYTES = 96.4 * 1024;
export const MEASURED_PAGE_DATE = '3 septembre 2026';

/** Postal address, as the corporate footer prints it. */
export const ADDRESS = ['EURATECHNOPOLYS', '2 Allée de la Haye du Temple', '59160 Lille'];

/**
 * The same address in the shape schema.org expects, kept beside the display
 * lines so the two move together.
 *
 * The values match `ZATSIT_POSTAL_ADDRESS` in `@zatsit/components`, which the
 * corporate site and the sustainability portal read. The three sites describe
 * one organisation under one id, so a divergence here would make them disagree
 * about it.
 */
export const POSTAL_ADDRESS = {
  streetAddress: '2 Allée de la Haye du Temple',
  postalCode: '59160',
  addressLocality: 'Lille',
  addressCountry: 'FR',
};

/**
 * The certification and the rating the footer shows a badge for.
 *
 * The bar for anything added here: the page already prints it for a reader.
 * Declaring it adds nothing to the claim, it only makes the claim
 * machine-readable. A founding date or a headcount would not qualify, since no
 * page states either.
 */
export const CERTIFICATIONS = [{ name: 'B Corp', issuedBy: 'B Lab', url: BCORP_URL }];
export const AWARDS = ['EcoVadis Silver (top 15%)'];

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
  { href: '/a11y/', label: 'a11y' },
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
