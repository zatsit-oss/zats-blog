import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { avatarFor } from './avatars';
import { sortedPosts } from './posts';

type Post = CollectionEntry<'blog'>;

/**
 * The URL segment for an author, derived from the name rather than from the
 * authors.yml key. The key is an internal handle, `eperu`, `ldussart`; these
 * pages exist to be shared, on LinkedIn among other places, so they are worth
 * a segment a human can read.
 *
 * Accents are folded rather than dropped, which is what makes `Nicolas Fourré`
 * land on `nicolas-fourre` instead of `nicolas-fourr`.
 */
export function authorSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface AuthorSocial {
  /** The network as authors.yml spells it, e.g. `github`. */
  network: string;
  label: string;
  href: string;
}

export interface AuthorProfile {
  /** The authors.yml key, which is what an article's `authors` array holds. */
  key: string;
  slug: string;
  href: string;
  name: string;
  title?: string;
  /** The personal site or profile authors.yml declares, if any. */
  url?: string;
  socials: AuthorSocial[];
  avatar: ReturnType<typeof avatarFor>;
  /** Newest first, like every other listing on the site. */
  posts: Post[];
}

/**
 * How a handle becomes a link. authors.yml stores handles, not URLs, so the
 * shape of each profile URL lives here rather than in the content.
 */
const SOCIAL_LINKS: Record<string, { label: string; url: (handle: string) => string }> = {
  github: { label: 'GitHub', url: (h) => `https://github.com/${h}` },
  linkedin: { label: 'LinkedIn', url: (h) => `https://www.linkedin.com/in/${h}` },
  x: { label: 'X', url: (h) => `https://x.com/${h}` },
  bluesky: { label: 'Bluesky', url: (h) => `https://bsky.app/profile/${h}` },
};

function socialsOf(socials: Record<string, string> | undefined, name: string): AuthorSocial[] {
  if (!socials) return [];

  return Object.entries(socials).flatMap(([network, handle]) => {
    // A handle that is already a URL is used as it stands: it is the one shape
    // that cannot be wrong, whatever the network.
    if (/^https?:\/\//.test(handle)) {
      return [{ network, label: SOCIAL_LINKS[network]?.label ?? network, href: handle }];
    }

    const known = SOCIAL_LINKS[network];
    if (!known) {
      // Warned rather than thrown. A network nobody anticipated is a cosmetic
      // gap on one page, and failing the build over it would hold a
      // publication hostage to a line of YAML, which is the mistake the
      // category derivation already paid for.
      console.warn(
        `[authors] Réseau inconnu "${network}" pour ${name}, ignoré. ` +
          `Ajouter son gabarit d'URL dans src/utils/authors.ts.`,
      );
      return [];
    }

    return [{ network, label: known.label, href: known.url(handle) }];
  });
}

/**
 * Every profile in authors.yml, with its articles, ready for both the index
 * and the per-author page. One function so the two cannot disagree on what a
 * given person has written.
 *
 * Ordered alphabetically by name. Ranking people by output was the first cut
 * and it is the wrong rule for a list of colleagues: it reads as a leaderboard,
 * and it moves someone down the page the day somebody else publishes. The
 * byline order inside an article is meaningful and is left alone.
 */
export async function authorProfiles(posts?: Post[]): Promise<AuthorProfile[]> {
  const entries = posts ?? (await sortedPosts());
  const authors = await getCollection('authors');

  const profiles = authors.map((author) => {
    const slug = authorSlug(author.data.name);

    return {
      key: author.id,
      slug,
      href: `/authors/${slug}/`,
      name: author.data.name,
      title: author.data.title,
      url: author.data.url,
      socials: socialsOf(author.data.socials, author.data.name),
      avatar: avatarFor(author.id),
      posts: entries.filter((post) => post.data.authors.includes(author.id)),
    };
  });

  // Two people whose names fold to the same slug would silently share a page,
  // one overwriting the other. Rare, and exactly why it has to be loud.
  const seen = new Map<string, string>();
  for (const profile of profiles) {
    const clash = seen.get(profile.slug);
    if (clash) {
      throw new Error(
        `Deux auteurs partagent l'adresse /authors/${profile.slug}/ : ` +
          `"${clash}" et "${profile.name}". Départager dans authors.yml.`,
      );
    }
    seen.set(profile.slug, profile.name);
  }

  return profiles.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

/** The profile behind an authors.yml key, for a byline that wants to link it. */
export async function authorByKey(key: string, profiles?: AuthorProfile[]) {
  const all = profiles ?? (await authorProfiles());
  return all.find((profile) => profile.key === key);
}

/**
 * Heading of an author page. The numeral, never "Un" spelled out: it is a
 * count, it reads faster, and one rule across the site beats a rule per page.
 */
export function authoredHeading(count: number): string {
  if (count === 0) return 'Pas encore d’article';
  return `${count} article${count > 1 ? 's' : ''}`;
}
