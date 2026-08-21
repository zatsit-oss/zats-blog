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
    // in the service itself.
    service: { entrypoint: './src/plugins/capped-image-service.mjs' },
  },

  // /markdown-page/ is one of the 45 routes to preserve, but its content was
  // Docusaurus scaffold filler: "You don't need React to write simple
  // standalone pages", in English, on a French blog. Republishing that would
  // be parity with the letter and not the intent. The URL keeps resolving,
  // to the home page.
  redirects: {
    '/markdown-page': '/',
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
