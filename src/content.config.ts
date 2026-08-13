import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';
import { CONTENT_REPO } from './consts';

/**
 * Articles live in the zats-blog-content repository, cloned next to this one.
 * No submodule, no remote loader: a plain glob over the sibling checkout.
 */
const BLOG_BASE = `${CONTENT_REPO}/blog`;

/** `2024-07-18-bundlephobia` -> 2024-07-18. Every folder follows this shape. */
const FOLDER_DATE = /(?:^|\/)(\d{4})-(\d{2})-(\d{2})-/;

/**
 * Schema aligned on the frontmatter that actually exists, not on what a
 * greenfield blog would use. Verified against all 19 articles:
 *   - title, slug, authors, tags are present on every one of them
 *   - date is present on 7 only, hence optional here and filled in by the
 *     loader below
 *   - description, cover and draft are present on none, so they are optional
 *     and reserved for future articles
 */
const blogSchema = z.object({
  title: z.string(),
  /** Explicit in the frontmatter of all 19 articles: it drives the URL. */
  slug: z.string(),
  /** Plural, and up to three authors on a single article. Keys of authors.yml. */
  authors: z.array(z.string()).nonempty(),
  tags: z.array(z.string()).default([]),
  /**
   * Optional on purpose. Zod validation runs *inside* glob().load(), so a
   * required date would fail before the loader could derive it from the folder
   * name. It is filled in right after loading, then asserted.
   */
  date: z.coerce.date().optional(),
  description: z.string().optional(),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  /**
   * Hand-written copy for the X share link, recovered from the boilerplate the
   * articles used to carry. Present on five articles; ShareLinks falls back to
   * the title when it is absent.
   */
  shareText: z.string().optional(),
});

/**
 * Wraps the glob loader to replay one Docusaurus behaviour Astro does not have:
 * deriving a post's publication date from its folder name when the frontmatter
 * omits it. Twelve of the nineteen articles depend on this.
 *
 * Precedence matches Docusaurus: frontmatter first, folder name second.
 */
function blogLoader() {
  const inner = glob({ base: BLOG_BASE, pattern: '**/index.md' });

  return {
    ...inner,
    name: 'zats-blog-content',
    load: async (context: Parameters<typeof inner.load>[0]) => {
      await inner.load(context);

      const undated: string[] = [];

      for (const [id, entry] of context.store.entries()) {
        if (entry.data.date) continue;

        // Not `id`: glob() derives the id from the frontmatter `slug` when
        // there is one, and every article here has one. The folder name only
        // survives in filePath.
        const source = entry.filePath ?? id;
        const match = source.match(FOLDER_DATE);
        if (!match) {
          undated.push(`${id} (${source})`);
          continue;
        }

        const [, year, month, day] = match;
        const dated = {
          ...entry,
          data: { ...entry.data, date: new Date(`${year}-${month}-${day}T00:00:00Z`) },
        };

        // store.set() is a no-op when the entry's digest is unchanged: the
        // content layer uses it to skip rewriting entries whose source file did
        // not move. Our change is to the derived data, not to the file, so the
        // digest is identical and the write would be dropped. Deleting first
        // forces it through.
        context.store.delete(id);
        context.store.set(dated);
      }

      // Fail loudly. A silently undated article would sort last and break the
      // feed rather than break the build.
      if (undated.length > 0) {
        throw new Error(
          `Ces articles n'ont ni "date" en frontmatter ni date dans le nom de leur dossier :\n` +
            undated.map((id) => `  - ${id}`).join('\n') +
            `\nAjoutez "date: YYYY-MM-DD" au frontmatter, ou renommez le dossier en YYYY-MM-DD-slug.`,
        );
      }

      // Post-condition, and not a formality: the loop above can derive a date
      // and still fail to persist it. Assert the end state rather than the
      // intent, so a regression surfaces here instead of as an undefined date
      // in whatever page sorts the collection next.
      const unpersisted = [...context.store.entries()]
        .filter(([, entry]) => !entry.data.date)
        .map(([id]) => id);

      if (unpersisted.length > 0) {
        throw new Error(
          `Date non persistée dans le store pour :\n` +
            unpersisted.map((id) => `  - ${id}`).join('\n'),
        );
      }
    },
  };
}

const blog = defineCollection({
  loader: blogLoader(),
  schema: blogSchema,
});

/**
 * authors.yml is one file holding a mapping of author key -> profile, so it
 * needs file() and not glob(): glob would load the whole document as a single
 * entry. file() turns each top-level key into its own entry, keyed by the same
 * id that articles reference in their `authors` array.
 */
const authors = defineCollection({
  loader: file(`${CONTENT_REPO}/authors/authors.yml`, {
    parser: (text) => parseYaml(text),
  }),
  schema: z.object({
    name: z.string(),
    title: z.string().optional(),
    url: z.string().optional(),
    image_url: z.string().optional(),
    /** Network -> handle, e.g. { github: 'm3lkior', bluesky: 'ldussart.bsky.social' }. */
    socials: z.record(z.string(), z.string()).optional(),
  }),
});

export const collections = { blog, authors };
