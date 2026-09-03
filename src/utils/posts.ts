import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { CATEGORY_LABELS, categoryLabel, POSTS_PER_PAGE, SITE_DESCRIPTION } from '../consts';

type Post = CollectionEntry<'blog'>;

/**
 * Published articles, newest first. The single entry point for every listing,
 * so the home page, the tag pages, the archive and the feed cannot disagree on
 * what is published or in what order.
 *
 * The date is non-null by construction: the loader derives it from the folder
 * name when the frontmatter omits it, and fails the build otherwise.
 */
export async function sortedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date!.valueOf() - a.data.date!.valueOf());
}

/** The marker Docusaurus used to cut a post. 17 of the 19 articles carry it. */
const TRUNCATE = /<!--\s*truncate\s*-->/;

/**
 * Raw markdown above the truncate marker, or the whole body when there is
 * none. The plan (P5) keeps this marker as the single source of the summary.
 */
function beforeTruncate(post: Post): string {
  const body = post.body ?? '';
  const [head] = body.split(TRUNCATE);
  return head;
}

export interface TagSummary {
  tag: string;
  count: number;
}

/**
 * Every tag in use, with how many articles carry it, most used first and
 * alphabetical within a count.
 *
 * Open-ended and derived from the articles, where a category is closed and
 * declared in the content repository's config.json. That is the whole
 * difference between the two axes: a tag appears the day someone writes it,
 * which is why seventeen exist and why all seventeen must survive the
 * migration, including those nothing links to.
 */
export async function allTags(posts?: Post[]): Promise<TagSummary[]> {
  const entries = posts ?? (await sortedPosts());
  const counts = new Map<string, number>();

  for (const post of entries) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'fr'));
}

/** Articles carrying a given tag, newest first. */
export async function postsByTag(tag: string, posts?: Post[]): Promise<Post[]> {
  const entries = posts ?? (await sortedPosts());
  return entries.filter((post) => post.data.tags.includes(tag));
}

/**
 * Heading of a tag page. Docusaurus printed "Un article tagués avec « java »",
 * wrong in number and in register; this agrees, counts in numerals, and says
 * "tag", the word the
 * whole site uses for a tag, in the frontmatter, in the URL and to the reader.
 * "Thème" was tried for two days and dropped on 28 August: it made the reader
 * translate a word the rest of the site never stopped spelling `tags`.
 */
export function taggedHeading(tag: string, count: number): string {
  const lead = `${count} article${count > 1 ? 's' : ''}`;
  return `${lead} sur le tag « ${tag} »`;
}

export interface CategorySummary {
  /** The folder name in the content repository, and the URL segment. */
  slug: string;
  /** What the reader sees. */
  label: string;
  count: number;
}

/**
 * The categories that actually carry an article, in the curated order of
 * CATEGORY_LABELS rather than by article count.
 *
 * Sorting by count is right for tags, where the number is the only thing
 * distinguishing seventeen flat entries. It is wrong here: six stable
 * categories that reshuffle on every publication give the reader nothing to
 * memorise, and "Général", the fullest, would lead a list it says least about.
 *
 * Empty categories are skipped: four of the ten allowed ones have no article
 * yet, and a page saying "0 article" is a page nobody needs to build.
 */
export async function allCategories(posts?: Post[]): Promise<CategorySummary[]> {
  const entries = posts ?? (await sortedPosts());
  const counts = new Map<string, number>();

  for (const post of entries) {
    const slug = post.data.category!;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  // Ordered by the label map, then anything it does not know about, so a new
  // folder still shows up rather than being silently dropped.
  const known = Object.keys(CATEGORY_LABELS).filter((slug) => counts.has(slug));
  const unknown = [...counts.keys()].filter((slug) => !(slug in CATEGORY_LABELS)).sort();

  return [...known, ...unknown].map((slug) => ({
    slug,
    label: categoryLabel(slug),
    count: counts.get(slug)!,
  }));
}

/** Articles in a given category, newest first. */
export async function postsByCategory(slug: string, posts?: Post[]): Promise<Post[]> {
  const entries = posts ?? (await sortedPosts());
  return entries.filter((post) => post.data.category === slug);
}

/** Heading of a category page, agreeing in number like taggedHeading does. */
export function categoryHeading(slug: string, count: number): string {
  const lead = `${count} article${count > 1 ? 's' : ''}`;
  return `${lead} dans « ${categoryLabel(slug)} »`;
}

/**
 * Markdown reduced to readable prose. Deliberately not a full parser: it feeds
 * a meta description and a listing excerpt, where a leftover asterisk matters
 * more than perfect fidelity.
 */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/^---\n[\s\S]*?\n---/, '') // frontmatter, if any slipped through
    .replace(/```[\s\S]*?```/g, '') // fenced code
    .replace(/<!--[\s\S]*?-->/g, '') // html comments
    .replace(/<[^>]+>/g, '') // inline html
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images, caption included
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links keep their label
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // heading marks
    .replace(/^\s{0,3}>\s?/gm, '') // blockquote marks
    .replace(/^\s{0,3}[-*+]\s+/gm, '') // list bullets
    .replace(/[*_`]/g, '') // emphasis and inline code
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Excerpt for the listing and the RSS feed: the prose above the marker.
 * Falls back to the frontmatter description when an article ever gets one.
 */
export function excerpt(post: Post): string {
  return post.data.description ?? toPlainText(beforeTruncate(post));
}

/**
 * Meta description. Same source as the excerpt, cut to a length search engines
 * and social cards actually display, on a word boundary rather than mid-word.
 *
 * Fallback order set by the plan (P6): frontmatter description, then the
 * truncate excerpt, then the site default. No article carries a description
 * today, so in practice the second branch is the one that runs.
 */
export function metaDescription(post: Post, maxLength = 160): string {
  const text = excerpt(post);
  if (!text) return SITE_DESCRIPTION;
  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.]$/, '')}…`;
}

/**
 * Reading time in minutes, at 200 words per minute, the usual figure for
 * French prose. Code blocks and images are stripped first: nobody reads a
 * fenced block at prose speed, and counting it inflates every technical
 * article on this blog.
 */
export function readingTime(post: Post): number {
  const words = toPlainText(post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export interface ListingPage {
  posts: Post[];
  /** 1 for the root, 2 and up for /page/<n>/. */
  current: number;
  total: number;
}

/**
 * Splits the corpus into listing pages, and it lives here rather than in the
 * two pages that render them: the home page and /page/[page].astro each
 * computed their own slice and their own total, with two different formulas,
 * which is how the first page came to show nine cards against the second's ten.
 *
 * The first page holds the featured article **plus** a full grid, so every
 * grid on the site has the same three rows of three. Page one therefore shows
 * one article more than the others, which is the point: the lead is an extra,
 * not a slot taken from the grid.
 */
export function listingPages(posts: Post[]): ListingPage[] {
  // The lead is what page one has and the others do not.
  const firstPageSize = POSTS_PER_PAGE + 1;
  const rest = Math.max(0, posts.length - firstPageSize);
  const total = 1 + Math.ceil(rest / POSTS_PER_PAGE);

  return Array.from({ length: total }, (_, index) => {
    const current = index + 1;
    const start = current === 1 ? 0 : firstPageSize + (current - 2) * POSTS_PER_PAGE;
    const size = current === 1 ? firstPageSize : POSTS_PER_PAGE;

    return { posts: posts.slice(start, start + size), current, total };
  });
}
