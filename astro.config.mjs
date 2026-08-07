// @ts-check

import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

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

  // Poppins is the single Zatsit typeface. The Fonts API downloads, subsets
  // and self-hosts the woff2 files at build time, so nothing is fetched from a
  // third party at runtime. Latin only, to keep the footprint eco-light.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      fallbacks: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      weights: [300, 400, 500, 600, 700, 800, 900],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
    },
  ],
});
