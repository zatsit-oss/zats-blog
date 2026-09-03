---
name: eco-check
description: Verify that a change respects the zatsit blog's eco-design budgets (page weight, request count, DOM size, fonts, client JS) by measuring the built dist/, not by estimating. Use before declaring front-end work done, when adding any dependency, image, font weight or client:* directive, and whenever asked about page weight, EcoIndex, GreenIT or carbon footprint of the site.
---

# Eco-design budget gate

This blog publishes zatsit's GreenIT articles and carries the CO2 badges. It is
the one site where an eco-design claim is checkable by the reader. The budgets
in `.claude/rules/quality.md` are therefore gates, not aspirations.

**Measure, do not estimate.** "It should be light" is not a result.

## How to use

```bash
npm run build
node .claude/skills/eco-check/scripts/page-weight.mjs            # every page vs budget
node .claude/skills/eco-check/scripts/page-weight.mjs --verbose  # per-asset breakdown
```

The script exits 1 when a budget is breached, so CI can gate on it. It reports,
per page:

- **initial**: what a first-time visitor downloads: the document plus
  stylesheets, preloads, scripts and non-lazy images. Text is measured
  gzipped (every host we use compresses it), binaries raw.
- **total**: initial plus lazy images and CSS-referenced assets.
- **req**: initial requests, excluding the document.
- **dom**: opening tags in the document, a proxy for DOM complexity.

| Budget | Limit |
|---|---|
| Initial page weight | < 500 kB |
| Total page weight | < 1 MB |
| Initial requests | < 25 |
| DOM elements | < 1500 |

To compare against another build, pass a directory:

```bash
node .claude/skills/eco-check/scripts/page-weight.mjs \
  /Users/emmanuelperu/dev/zatsit/blog/docusaurus-reference-build
```

## What the script does not see

It is a static estimate, deterministic and cheap, run on every change. It reads
what the HTML references. It does **not** measure:

- runtime cost: LCP, INP, CLS, main-thread time. For Core Web Vitals, run a
  real Lighthouse audit.
- conditional fetches made by JavaScript at runtime.
- whether a declared `@font-face` is actually used by any CSS rule.

Treat a clean run as "no budget drift", not as "the page is fast".

## Baseline

The Docusaurus site being replaced is measured in
[`references/baseline-docusaurus.md`](references/baseline-docusaurus.md):
**0 of 45 pages** within the 1 MB total budget, median 304 kB initial and
1 335 kB total, homepage at 3.2 MB initial. That is the bar the migration has
to beat, and the number to quote in the exit criterion of `PLAN-MIGRATION.md`.

## Review checklist

Run this when the numbers are within budget but the change deserves scrutiny.

- [ ] **Client JS.** Any new `client:*` directive is an argued exception. Which
      interaction requires it, and does `client:visible` suffice? The default
      for this site is zero client JS on an article page.
- [ ] **New dependency.** What does it add to the shipped bundle? A build-time
      dependency costs nothing at runtime; a runtime one has to earn its place.
- [ ] **Images.** WebP or AVIF, run through `astro:assets`, correct dimensions,
      explicit `width`/`height` (no layout shift), `loading="lazy"` below the
      fold. Content-repo images are the known weak point: the baseline's worst
      page is 10.8 MB of unoptimised rasters.
- [ ] **Icons.** Inline SVG or `.svg` asset. Never an icon font.
- [ ] **Fonts.** Three weights at most in the CSS actually shipped. The script
      warns above 6 built font files. `astro.config.mjs` currently declares 7
      weights × 2 styles = 14 woff2; trim it to what the type scale really uses.
- [ ] **Per-page CSS.** A stylesheet loads only on the pages that need it.
      KaTeX in particular: a single article uses maths, so its CSS must not be
      global.
- [ ] **External resources.** None. No CDN, no external stylesheet, no
      tracking, no analytics, no Google Fonts.
- [ ] **`compressHTML: true`** still set in `astro.config.mjs`.
- [ ] **Cache headers.** Hashed assets immutable, HTML short-lived. Set at the
      hosting layer.

## Reporting

State the measured figures, both before and after, and name what changed. If a
budget is breached and the breach is accepted, say so explicitly and say why:
an undocumented breach reads as an oversight, and on this site it reads as a
contradiction.
