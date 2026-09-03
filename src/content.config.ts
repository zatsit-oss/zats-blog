import { readFileSync } from 'node:fs';
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
 * The category is the folder holding the article folder, i.e. `dev` in
 * `blog/dev/2024-07-18-bundlephobia/index.md`. Read from the path relative to
 * `blog/`, and deliberately not anchored on the `YYYY-MM-DD-` folder pattern:
 * that pattern is a convention the content repository enforces with a
 * pre-commit hook, and a hook only runs where it is installed. On 28 August
 * `blog/ai/20260717-AgentSquad` reached its main branch, and a category
 * derivation anchored on the dashes would have failed the whole build over one
 * folder name, for an article whose date was in its frontmatter all along.
 *
 * A naming slip belongs in a review, not in a build that refuses to run. The
 * date fallback below still needs the pattern, and that is different in kind:
 * a missing date cannot be invented from a name that does not carry one.
 */
function categoryFromPath(source: string): string | undefined {
  const marker = '/blog/';
  const at = source.lastIndexOf(marker);
  if (at === -1) return undefined;

  // <category>/<article folder>/<file>, three segments at least. Anything
  // shallower sits outside a category folder and is reported as such.
  const parts = source.slice(at + marker.length).split('/');
  return parts.length >= 3 ? parts[0] : undefined;
}

/**
 * The categories the content repository allows, read from its own config.json
 * rather than restated here. That file is the contract its CI already enforces
 * (`check_categories-list.sh` asserts every `blog/*` folder appears in it), and
 * a second list in this repo would be one more thing to keep in step.
 *
 * Ten are allowed, six carry articles today. Only the populated ones get a page.
 */
const ALLOWED_CATEGORIES: string[] = JSON.parse(
  readFileSync(`${CONTENT_REPO}/config.json`, 'utf8'),
).categories;

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
  /**
   * Derived like the date, and optional for the same reason: it comes from the
   * folder the article sits in, which Zod cannot see while glob() is still
   * loading. Filled in right after, validated against config.json, asserted.
   *
   * One per article, by the content repository's own rule: "choose the single
   * best-fit category; use tags for the rest".
   */
  category: z.string().optional(),
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
 * Wraps the glob loader to fill in two fields the frontmatter does not carry
 * but the file layout does:
 *
 *   - the publication date, from the folder name, replaying a Docusaurus
 *     behaviour Astro has no equivalent for. Twelve of the nineteen articles
 *     depend on it, and frontmatter wins when both exist, as it did there.
 *   - the category, from the folder the article sits in. The content
 *     repository has organised posts that way from the start and documents the
 *     rule in its AGENTS.md; nothing was ever reading it.
 */
function blogLoader() {
  const inner = glob({ base: BLOG_BASE, pattern: '**/index.md' });

  return {
    ...inner,
    name: 'zats-blog-content',
    load: async (context: Parameters<typeof inner.load>[0]) => {
      await inner.load(context);

      const undated: string[] = [];
      const uncategorised: string[] = [];
      const unknownCategory: string[] = [];

      for (const [id, entry] of context.store.entries()) {
        // Not `id`: glob() derives the id from the frontmatter `slug` when
        // there is one, and every article here has one. The folder layout only
        // survives in filePath, so both derivations read from it.
        const source = entry.filePath ?? id;
        const derived: Record<string, unknown> = {};

        if (!entry.data.date) {
          const match = source.match(FOLDER_DATE);
          if (match) {
            const [, year, month, day] = match;
            derived.date = new Date(`${year}-${month}-${day}T00:00:00Z`);
          } else {
            undated.push(`${id} (${source})`);
          }
        }

        if (!entry.data.category) {
          const category = categoryFromPath(source);
          if (!category) {
            uncategorised.push(`${id} (${source})`);
          } else if (!ALLOWED_CATEGORIES.includes(category)) {
            unknownCategory.push(`${id} -> "${category}"`);
          } else {
            derived.category = category;
          }
        }

        if (Object.keys(derived).length === 0) continue;

        // store.set() is a no-op when the entry's digest is unchanged: the
        // content layer uses it to skip rewriting entries whose source file did
        // not move. Our change is to the derived data, not to the file, so the
        // digest is identical and the write would be dropped. Deleting first
        // forces it through.
        context.store.delete(id);
        context.store.set({ ...entry, data: { ...entry.data, ...derived } });
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

      if (uncategorised.length > 0) {
        throw new Error(
          `Ces articles ne sont pas dans un dossier de catégorie :\n` +
            uncategorised.map((id) => `  - ${id}`).join('\n') +
            `\nLe chemin attendu est blog/<catégorie>/YYYY-MM-DD-slug/index.md.`,
        );
      }

      // The content repository's CI already refuses a folder absent from its
      // config.json. Repeating the check here means a checkout that predates
      // that rule fails the build instead of publishing a category page whose
      // name nobody agreed on.
      if (unknownCategory.length > 0) {
        throw new Error(
          `Catégorie inconnue, absente de ${CONTENT_REPO}/config.json :\n` +
            unknownCategory.map((id) => `  - ${id}`).join('\n') +
            `\nCatégories autorisées : ${ALLOWED_CATEGORIES.join(', ')}.` +
            `\nEn ajouter une passe par la Direction Technique (dirtech@zatsit.fr).`,
        );
      }

      // Post-condition, and not a formality: the loop above can derive a value
      // and still fail to persist it. Assert the end state rather than the
      // intent, so a regression surfaces here instead of as an undefined date
      // in whatever page sorts the collection next.
      const unpersisted = [...context.store.entries()]
        .filter(([, entry]) => !entry.data.date || !entry.data.category)
        .map(([id, entry]) => `${id} (date: ${entry.data.date}, catégorie: ${entry.data.category})`);

      if (unpersisted.length > 0) {
        throw new Error(
          `Donnée dérivée non persistée dans le store pour :\n` +
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
