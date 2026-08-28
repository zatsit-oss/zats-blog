// @ts-check

import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig, fontProviders } from 'astro/config';
import { mdastAdmonitions } from './src/plugins/mdast-admonitions.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.zatsit.fr',

  // Eco-design: ship the smallest possible HTML payload.
  compressHTML: true,

  // Prefetch links entering the viewport. Cheap on a static site and it makes
  // navigation feel instant without shipping a router.
  prefetch: {
    defaultStrategy: 'viewport',
  },

  // No MDX on purpose: articles stay portable plain Markdown, per the brief.
  integrations: [sitemap()],

  image: {
    // Sharp, plus a cap on any image whose size nobody declared. Markdown has
    // no syntax for a width, so Astro sized article images from the source and
    // shipped 7008px conference photos into a 683px column. The reasoning is
    // in the service itself, which also repairs the two attributes `layout`
    // below derives from that same wrong width.
    service: { entrypoint: './src/plugins/capped-image-service.mjs' },

    // What gives Markdown images a srcset at all: with no layout, Astro emits
    // one file per image and a 390px phone downloads the 1366px desktop one,
    // 4.19 times the pixels it can show. `constrained` is the right mode here,
    // the image scales down with its container and never exceeds its own size.
    layout: 'constrained',

    /**
     * Chosen against the widths an article image is actually laid out at, 326,
     * 651 and 779 CSS pixels, crossed with the densities that matter:
     *
     *    390  a phone at 1x
     *    640  a phone at ~1.7x
     *    780  the 651px column at ~1.2x, and a 390px phone at 2x
     *    880  the widest an article image gets, 865px, at 1x
     *   1080  the 651px column at ~1.7x, and a 390px phone at 3x
     *   1366  the cap, which serves the 865px lead image at 1.58x
     *
     * Astro's own defaults start at 640 and run to 2560, which is both too
     * coarse at the bottom, where the savings are, and past the cap at the top.
     * Six candidates and not fifteen: each one is a file to encode, to store
     * and to cache, and the ladder is already finer than the layout it serves.
     */
    breakpoints: [390, 640, 780, 880, 1080, 1366],
  },

  // /markdown-page/ is one of the 45 routes to preserve, but its content was
  // Docusaurus scaffold filler: "You don't need React to write simple
  // standalone pages", in English, on a French blog. Republishing that would
  // be parity with the letter and not the intent. The URL keeps resolving,
  // to the home page.
  redirects: {
    '/markdown-page': '/',

    // The tag index moved onto /categories/, under the category cards, so
    // this route would otherwise serve the same list twice. It cannot simply
    // go: it is one of the 45 routes the migration owes, and it is linked from
    // outside. The seventeen /tags/<tag>/ pages are untouched.
    //
    // To the anchor and not to the top of the page: someone typing /tags/ is
    // after the tags, and the index sits under the six category cards, which
    // would otherwise be all they land on.
    '/tags': '/categories/#tags',
  },

  markdown: {
    // Sätteri parses the ::: blocks once `directive` is on; our plugin gives
    // them meaning. No remark, no unified processor: both would be a second
    // Markdown pipeline for one feature the default one already has.
    processor: satteri({
      features: { directive: true },
      mdastPlugins: [mdastAdmonitions],
    }),

    shikiConfig: {
      // Two themes, both emitted on every token. `defaultColor: false` stops
      // Shiki from picking one, leaving the switch to CSS keyed on data-theme,
      // so changing theme costs no JavaScript and no second stylesheet.
      themes: {
        light: 'github-light-high-contrast',
        dark: 'catppuccin-frappe',
      },
      defaultColor: false,
      wrap: false,
    },
  },

  // Poppins is the single Zatsit typeface. The Fonts API downloads, subsets
  // and self-hosts the woff2 files at build time, so nothing is fetched from a
  // third party at runtime. Latin only, to keep the footprint eco-light.
  //
  // Three weights, matching what corporate/src/styles/global.css ships in the
  // zats-websites monorepo (@fontsource/poppins 400, 600, 700), plus italic for
  // blockquotes. Every extra weight is a separate ~8 kB woff2 over the wire:
  // declaring the full 300-900 range cost 14 files and 112 kB, more than the
  // rest of the page put together, for five weights the CSS actually used.
  //
  // One entry per family: two entries naming Poppins get deduplicated, the
  // second one downloading its woff2 without ever emitting a CSS variable to
  // reference it. So `styles` applies to all three weights: asking for italic
  // yields six files, not four.
  //
  // All six are preloaded, because BaseHead renders <Font preload />, so all
  // six are fetched on a first visit: 56.5 kB for the page against 31.0 kB
  // without italic. Dropping `preload` there would let the browser fetch only
  // the variants the text actually uses, at the cost of a later text paint.
  // Measure before changing it, the trade is real either way.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      fallbacks: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      weights: [400, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
    },
  ],
});
