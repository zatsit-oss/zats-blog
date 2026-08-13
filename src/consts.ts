// Global site constants, imported wherever they are needed.

export const SITE_TITLE = 'zatsit';
export const SITE_DESCRIPTION =
  'Quelque soit votre domaine tech, nous avons forcément un article pour vous';

/** Default social card, used when a page or an article declares no cover. */
export const SITE_OG_IMAGE = '/img/zatsit-social-card.png';

/** How many articles per page on the paginated listing. Matches Docusaurus. */
export const POSTS_PER_PAGE = 10;

/**
 * The content lives in a separate repository, cloned next to this one.
 * See the README for the local setup.
 */
export const CONTENT_REPO = '../zats-blog-content';

/** Outbound links, shared by the header and the footer. */
export const GITHUB_URL = 'https://github.com/zatsit-oss';
export const LINKEDIN_URL = 'https://www.linkedin.com/company/zatsit/about/';
export const WEBSITE_URL = 'https://zatsit.fr';
export const ECOINDEX_URL =
  'https://www.ecoindex.fr/resultat/?id=6ac3f361-a35c-4933-8c09-890046d300f0';

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
