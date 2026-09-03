/**
 * JSON-LD for the pages, built at compile time. Emitted at build and not
 * injected by a script: it is text, and text belongs in the build.
 *
 * Two types only. `Organization` says who publishes, `BlogPosting` says what an
 * article is, who wrote it and when. No `FAQPage`: a blog is not a FAQ, and
 * fabricating that markup is the kind of structured-data spam search engines
 * penalise.
 */
import { SITE_DESCRIPTION, SITE_TITLE, WEBSITE_URL } from '../consts';

/** The publisher, referenced by every article rather than repeated inside it. */
export function organizationSchema(site: URL) {
  return {
    '@type': 'Organization',
    '@id': new URL('/#organization', site).href,
    name: SITE_TITLE,
    url: WEBSITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: new URL('/img/logo-zatsit-style-light.svg', site).href,
    },
    sameAs: ['https://www.linkedin.com/company/zatsit', 'https://github.com/zatsit-oss'],
  };
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  url: URL;
  image: URL;
  publishedAt?: Date;
  /** Display names, in byline order. */
  authors: string[];
  tags: string[];
}

export function blogPostingSchema(article: ArticleSchemaInput, site: URL) {
  return {
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    url: article.url.href,
    image: article.image.href,
    inLanguage: 'fr-FR',
    // Only what we actually hold: no `dateModified`, since the corpus has no
    // reliable modification date, and inventing one would be a claim.
    ...(article.publishedAt ? { datePublished: article.publishedAt.toISOString() } : {}),
    author: article.authors.map((name) => ({ '@type': 'Person', name })),
    publisher: { '@id': new URL('/#organization', site).href },
    ...(article.tags.length > 0 ? { keywords: article.tags.join(', ') } : {}),
  };
}

/** The site itself, for any page that is not an article. */
export function webSiteSchema(site: URL) {
  return {
    '@type': 'WebSite',
    '@id': new URL('/#website', site).href,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: new URL('/', site).href,
    inLanguage: 'fr-FR',
    publisher: { '@id': new URL('/#organization', site).href },
  };
}

/**
 * One graph per page rather than several loose blocks: `@graph` lets the
 * article point at its publisher by id instead of repeating the organisation on
 * every page, which is both smaller and what the consumers expect.
 */
export function pageGraph(site: URL, page: object) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(site), page],
  });
}
