/**
 * Serves the sitemap index at the literal `/sitemap.xml` as well.
 *
 * `@astrojs/sitemap` always writes `<filenameBase>-index.xml`, and the suffix
 * is not configurable: the index name is built in `astro:build:done`. Several
 * scanners and a few crawlers only ever look for `/sitemap.xml`, so the file is
 * copied there under its second name, which is why this is a copy and not a
 * redirect: Astro would answer a redirect with an HTML meta-refresh page, and
 * `text/html` is the wrong content type for a crawler asking for a sitemap.
 *
 * Copied rather than rewritten so the two never disagree, and so that a corpus
 * large enough to be split into several chunks keeps working: the index lists
 * the chunks, whatever their number.
 *
 * Registered **after** `sitemap()` in the integrations array, since hooks run
 * in registration order and the file has to exist before it is copied.
 */
import { copyFile } from 'node:fs/promises';

/** @returns {import('astro').AstroIntegration} */
export default function sitemapAlias({ filenameBase = 'sitemap' } = {}) {
  return {
    name: 'sitemap-alias',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const index = new URL(`./${filenameBase}-index.xml`, dir);
        const alias = new URL('./sitemap.xml', dir);
        try {
          await copyFile(index, alias);
          logger.info(`${filenameBase}-index.xml also served as sitemap.xml`);
        } catch (error) {
          // Never fail the build for an alias: the canonical index is still
          // there, and robots.txt would be the only thing pointing at a gap.
          logger.warn(`sitemap.xml not written: ${error.message}`);
        }
      },
    },
  };
}
