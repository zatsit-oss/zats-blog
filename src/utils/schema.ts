/**
 * JSON-LD for the pages, built at compile time. Emitted at build and not
 * injected by a script: it is text, and text belongs in the build.
 *
 * Two types only. `Organization` says who publishes, `BlogPosting` says what an
 * article is, who wrote it and when. No `FAQPage`: a blog is not a FAQ, and
 * fabricating that markup is the kind of structured-data spam search engines
 * penalise.
 */
import {
  AWARDS,
  CERTIFICATIONS,
  CONTACT_EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  POSTAL_ADDRESS,
  SITE_DESCRIPTION,
  SITE_TITLE,
  WEBSITE_URL,
} from '../consts';

/**
 * The publisher's identity, and the one value in this file that must not be
 * derived from this site.
 *
 * Every zatsit site anchors the organisation on the corporate origin, so that
 * an answer engine resolves the blog, `zatsit.fr` and the sustainability portal
 * to **one** organisation instead of three homonyms. This file derived the id
 * from `Astro.site` until 11 September 2026, which published a second
 * organisation at `https://blog.zatsit.fr/#organization`; the shared constant
 * lives in `@zatsit/components` as `ORGANIZATION_ID`, and the two must agree.
 */
export const ORGANIZATION_ID = `${WEBSITE_URL}/#organization`;

/**
 * The organisation's logo, on the corporate origin rather than ours.
 *
 * One node, one logo: the portal points at this same file for the same reason.
 * Our own `logo-zatsit-style-light.svg` stays the favicon and the site's mark,
 * but declaring it here would give one `@id` two logos depending on which site
 * a crawler read it from.
 */
const ORGANIZATION_LOGO = `${WEBSITE_URL}/favicon.svg`;

/**
 * The publisher, referenced by every article rather than repeated inside it.
 *
 * The facts beyond name and logo are the four the footer prints on every page:
 * the postal address, the contact address, the B Corp certification and the
 * EcoVadis medal. Nothing here is a signal invented for a scanner.
 *
 * **No `description`.** The corporate site and the portal each pass their own
 * site description into this node, which gives one `@id` two conflicting
 * descriptions; ours would make it three, and would describe the organisation
 * as a blog. The organisation is described on `zatsit.fr`.
 */
export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_TITLE,
    url: WEBSITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: ORGANIZATION_LOGO,
    },
    sameAs: [LINKEDIN_URL, GITHUB_URL],
    address: { '@type': 'PostalAddress', ...POSTAL_ADDRESS },
    email: CONTACT_EMAIL,
    hasCertification: CERTIFICATIONS.map((certification) => ({
      '@type': 'Certification',
      name: certification.name,
      issuedBy: { '@type': 'Organization', name: certification.issuedBy },
      url: certification.url,
    })),
    award: AWARDS,
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
    isPartOf: { '@id': webSiteId(site) },
    publisher: { '@id': ORGANIZATION_ID },
    ...(article.tags.length > 0 ? { keywords: article.tags.join(', ') } : {}),
  };
}

/** The blog itself, anchored on our own origin: it is not the corporate site. */
function webSiteId(site: URL) {
  return new URL('/#website', site).href;
}

/** The site itself, for any page that is not an article. */
export function webSiteSchema(site: URL) {
  return {
    '@type': 'WebSite',
    '@id': webSiteId(site),
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: new URL('/', site).href,
    inLanguage: 'fr-FR',
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Absolute. The last item omits it, as schema.org advises. */
  url?: string;
}

/**
 * The trail from the site root to this page.
 *
 * Anchored on the page's own URL so two pages never share a node id. Articles
 * sit at the root of the site, so their trail is the category they are filed
 * in rather than anything the URL shows: one article has exactly one category,
 * which is what makes the trail unambiguous.
 */
export function breadcrumbListSchema(items: BreadcrumbItem[], pageUrl: URL) {
  return {
    '@type': 'BreadcrumbList',
    '@id': new URL('#breadcrumb', pageUrl).href,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export interface PageSchemaInput {
  name: string;
  description: string;
  url: URL;
  site: URL;
  /** Id of the BreadcrumbList travelling in the same graph, when there is one. */
  breadcrumbId?: string;
}

/**
 * A page that is not an article.
 *
 * More precise than describing a listing as the whole `WebSite`, which is what
 * this file did until 11 September 2026 and what made the ten listing pages
 * indistinguishable from the home page. The `WebSite` node still travels beside
 * it, so the site is described once and the page says which one it belongs to.
 */
export function webPageSchema(page: PageSchemaInput) {
  return {
    '@type': 'WebPage',
    '@id': new URL('#webpage', page.url).href,
    name: page.name,
    description: page.description,
    url: page.url.href,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': webSiteId(page.site) },
    publisher: { '@id': ORGANIZATION_ID },
    ...(page.breadcrumbId ? { breadcrumb: { '@id': page.breadcrumbId } } : {}),
  };
}

/**
 * One graph per page rather than several loose blocks: `@graph` lets the page
 * point at its publisher by id instead of repeating the organisation on every
 * page, which is both smaller and what the consumers expect.
 *
 * Every page carries the same three nodes: who publishes, which site this is,
 * and what this page is. A page below the root carries its trail as a fourth.
 */
export function pageGraph(site: URL, page: object, breadcrumb?: object) {
  const nodes = [organizationSchema(), webSiteSchema(site), page];
  if (breadcrumb) nodes.push(breadcrumb);
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}
