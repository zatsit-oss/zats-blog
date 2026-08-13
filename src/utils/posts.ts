import type { CollectionEntry } from 'astro:content';
import { SITE_DESCRIPTION } from '../consts';

type Post = CollectionEntry<'blog'>;

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
