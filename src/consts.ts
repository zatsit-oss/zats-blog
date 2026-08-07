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
