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
export const MEASURED_PAGE_BYTES = 79.7 * 1024;
export const MEASURED_PAGE_DATE = '21 août 2026';

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
   * in the accent colour. The words themselves are still a placeholder waiting
   * on Emmanuel, and splitting them differently is a one-line change here.
   */
  title: 'Nos consultants construisent.',
  counterpoint: 'Puis ils écrivent comment.',
  subtitle:
    'Architecture, cloud, data, IA et éco-conception. Quel que soit votre domaine tech, nous avons un article pour vous.',
  actions: [
    { href: '/tags/', label: 'Parcourir les catégories', primary: true },
    { href: '/blog-conception/', label: 'Comment ce blog est éco-conçu' },
  ],
} as const;

/**
 * Navigation, kept identical to the Docusaurus navbar so no habit breaks.
 * Categories are tag pages: adding one means publishing an article with that
 * tag first, otherwise the link 404s.
 *
 * The dropdown of upcoming categories (dev, eco-conception, mobile, ops, web)
 * was commented out in the Docusaurus config and stays out until each has an
 * article.
 */
export const NAV_LINKS = [
  { href: '/', label: 'Blog' },
  { href: '/tags/', label: 'Catégories' },
  { href: '/tags/green/', label: 'Green' },
  { href: '/tags/architecture/', label: 'Architecture' },
  { href: '/tags/cloud/', label: 'Cloud' },
  { href: '/tags/data/', label: 'Data & AI' },
  { href: '/tags/general/', label: 'Général' },
] as const;
