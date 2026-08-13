# Docusaurus baseline

Measurement of the site the migration replaces, taken 13 August 2026 with
`page-weight.mjs` on the archived reference build at
`/Users/emmanuelperu/dev/zatsit/blog/docusaurus-reference-build` (38 MB on
disk, 45 pages).

This is the "actuel" in the migration exit criterion of `PLAN-MIGRATION.md`
(section 6): *page weight and client JS measured and lower than the current
site*. Reproduce with:

```bash
node .claude/skills/eco-check/scripts/page-weight.mjs \
  /Users/emmanuelperu/dev/zatsit/blog/docusaurus-reference-build
```

## Headline

| Metric | Docusaurus | Budget | Verdict |
|---|---|---|---|
| Pages measured | 45 | | |
| Pages within the 1 MB total budget | **0 / 45** | all | every page fails |
| Pages within the 500 kB initial budget | 29 / 45 | all | 16 fail |
| Median initial weight | **304 kB** | < 500 kB | passes, barely |
| Median total weight | **1 335 kB** | < 1 MB | fails |
| Lightest page (`markdown-page`) | 243 kB initial / 1 069 kB total | | a near-empty page still ships 1 MB |
| Heaviest initial (`authors`) | **3 324 kB** | | 6.6× the budget |
| Heaviest total (`devlille-2026`) | **10 850 kB** | | 10.6× the budget |
| Homepage | 3 152 kB initial / 6 734 kB total | | 6.3× / 6.6× |

## What the numbers say

**The floor is the problem, not the outliers.** A 404 page with 114 DOM
elements ships 243 kB on first visit and pulls 1 069 kB in total. That is the
React runtime plus the Docusaurus client bundle, paid identically on every
route regardless of content. No amount of per-page tuning moves it; only
dropping the framework does. That is the migration's core argument, and it is
now a measured one.

**The outliers are unoptimised images.** `devlille-2026` at 10.8 MB total and
the homepage at 6.7 MB are carrying full-size raster assets. These live in the
content repository, so the Astro shell does not fix them by itself: the image
pipeline has to, via `astro:assets` and WebP/AVIF conversion. Worth a pass on
the content repo during phase 3.

**Request count was never the issue** (5 to 16 per page, budget 25), and
neither was DOM size (median well under 1500, two pages excepted:
`crossplane-presentation-des-concepts` at 1484 and the homepage at 1326).
Weight is the whole story.

## Target for the Astro build

An Astro static page with zero client JS should land in the low tens of
kilobytes for the document plus CSS, with fonts as the main fixed cost. A
credible target is **under 150 kB initial on an article page**, which would be
a 2× improvement on the median and better than 20× on the homepage.

The honest caveat: this migration wins on the framework floor. It does not
automatically win on the image outliers, and if the content images ship
untouched, `devlille-2026` will still be a multi-megabyte page. Convert them.
