# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The **zatsit blog**: a static site built with [Astro 7](https://astro.build/), French-only, deployed on Firebase Hosting. Migrated from Docusaurus v3 in August 2026.

**Content lives in another repository.** Articles, authors and their images are in [zats-blog-content](https://github.com/zatsit-oss/zats-blog-content), cloned as a **sibling directory**, and read in place by a `glob()` loader. Nothing is copied. This repo holds the shell only.

## Quality gates, non-negotiable

@.claude/rules/quality.md

```bash
npm run check        # TypeScript
npm run check:a11y   # WCAG 2.1 AA contrast, both themes, plus the Shiki colours
npm run check:eco    # page weight budgets, on dist/
```

All three run in CI on every pull request and exit non-zero on failure. Read the full output of `astro check`: the error count sits above the warnings line, and truncating with `tail -3` hides it.

The matching skills carry the checklists: `wcag-check` and `eco-check` are the verification gates, `accessibility-a11y` is the implementation guidance to read while writing a component.

## The traps this codebase has already paid for

Each of these cost a debugging session. They are not hypothetical.

**The content store caches rendered Markdown.** Changing a Markdown plugin and rebuilding shows the old output. Move `node_modules/.astro/data-store.json` aside after touching the Markdown pipeline, or you will diagnose problems that no longer exist.

**`context.store.set()` is a no-op when the entry digest is unchanged.** Deriving data from a file without touching the file means the write is silently dropped. `delete()` then `set()`. And assert the end state of the store, not the fact of having attempted the write.

**`glob()` derives its `id` from the frontmatter `slug`, not the path.** The date fallback reads `entry.filePath`; with `id`, the twelve articles without a frontmatter date fail.

**`authors.yml` is one document of twelve profiles.** It needs `file()` with a YAML parser; `glob()` loads it as a single entry and Zod fails on `name: Required`.

**Astro scopes component CSS to server-rendered elements.** Anything a script creates at runtime carries no `data-astro-cid` attribute, so scoped rules never match it. Those styles must be `is:global`.

**`is:inline` is required, not stylistic, for the search script.** `/pagefind/pagefind.js` is generated after the Astro build, and a Vite-processed dynamic import emits an unsubstituted `__VITE_PRELOAD__` marker that throws at runtime. The inline script also needs `type="module"`, or Safari refuses the dynamic import that Chrome accepts.

**Files under `public/` bypass the image pipeline.** They ship at full resolution.

**`astro:assets` re-encodes every image but resizes only when it knows the target width, and Markdown has no syntax for one.** Article images were therefore emitted at their source size, up to 7008px into a 779px column, which is what put two articles megabytes over the page-weight budget. `src/plugins/capped-image-service.mjs` wraps the Sharp service and caps any image whose size nobody declared; an explicit `width` on an `<Image>` still passes through untouched.

**A sticky child needs a parent taller than itself.** `align-items: start` on a grid shrinks the item to its content height, leaving nothing for the sticky element to travel along: the table of contents looked pinned and scrolled away with the page.

## Testing behaviour

Static HTML tells you what was generated, not what happens. Three rounds were lost reporting "everything checks out from here" while a feature was broken in the browser.

Chrome is installed on this machine. Drive it rather than reading output:

```bash
# quick: does the script run at all?
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --virtual-time-budget=30000 --dump-dom http://localhost:4321/

# real interaction: launch with --remote-debugging-port=9222 and drive it over
# CDP. Node 22 has a global WebSocket, so no dependency is needed. Runtime.evaluate
# to type into a field and read the DOM back, Runtime.consoleAPICalled for errors,
# Emulation.setDeviceMetricsOverride to test a width.
```

Two things this catches that nothing else does: whether an element is actually visible where the reader is looking, through `getBoundingClientRect` and `elementFromPoint`, and console errors from inline scripts, which `astro check` never sees.

**Force a frame before measuring a colour in headless.** Headless Chrome produces no frames unless asked, so a CSS transition never advances: after clicking the theme toggle, `getComputedStyle` returned the palette the page was leaving for at least three seconds, and the 200 ms transition on `a { color }` was enough for axe-core to report 42 contrast violations that do not exist. `Page.captureScreenshot` forces a frame and the values snap to the truth. Any colour assertion after a state change needs that, or it measures the previous state.

**axe-core can be run without adding a dependency.** Download `axe.min.js` to the scratchpad, inject it with `Runtime.evaluate`, then `axe.run(document)`. That is the same engine as the axe DevTools extension, so a clean result here is a clean result in the reader's browser, and it catches what `check:a11y` cannot: ARIA misuse, roles, names, structure. `check:a11y` only measures contrast on the tokens.

**The search cannot work under `npm run dev`**, since Pagefind's index is produced by the build. Use `npm run preview`. And the search script is inlined into every page, so a cached page serves the old script: force-reload before concluding anything.

## Architecture

| Concern | Where |
|---|---|
| Loader, schema, date fallback | `src/content.config.ts` |
| Shared helpers: excerpt, reading time, tags | `src/utils/posts.ts` |
| Avatars, read from the content repo | `src/utils/avatars.ts` |
| Page shell, header, footer | `src/layouts/Layout.astro` |
| Article | `src/layouts/BlogPost.astro`, `src/pages/[...slug].astro` |
| Admonitions | `src/plugins/mdast-admonitions.mjs` |
| Image sizing policy | `src/plugins/capped-image-service.mjs` |
| Design tokens | `src/styles/tokens/`, entry point `src/styles/tokens.css` |
| Site constants, navigation, hero copy | `src/consts.ts` |

Articles are served at the **root**, as `/<slug>/`, and the slug comes from the frontmatter rather than the folder name. `migration-routes-docusaurus.txt` holds the 45 reference routes; the build matches all 45.

## Conventions

- Never a raw hex in product code: always a semantic token from `src/styles/tokens/colors.css`, so both themes resolve.
- Vertical space is not set per page. `main` opens and closes the page and its children are separated by the section gap, from the rhythm tokens at the end of `src/styles/tokens/spacing.css`. A block that needs to sit closer than the gap overrides it and says why.
- No MDX. Articles stay portable plain Markdown.
- Never reference this repo's assets from an article with a relative path: the content repo no longer sits inside the shell.
- The visual reference for shared components is the corporate site in `zats-websites`, but it is a Tailwind project: read it, rewrite it, do not copy its classes.

## Markdown pipeline

Sätteri, the default processor in Astro 7, with `features.directive` on for admonitions. Not remark: that would need `@astrojs/markdown-remark` and swap the whole pipeline for one feature the default already has.

Shiki emits both themes on every token with `defaultColor: false`, and CSS keyed on `data-theme` picks one. Code blocks sit on our surface token, so a theme's published contrast does not carry over: `check:a11y` measures the colours actually emitted.

## Deployment

- **Pull request** → [firebase-hosting-pull-request.yml](.github/workflows/firebase-hosting-pull-request.yml), which clones the content repo as a sibling, builds, runs the gates and deploys a preview channel.
- **Merge to `main`** → [publish-on-merge.yml](.github/workflows/publish-on-merge.yml). **Still on the Docusaurus action**, deliberately, until the migration is validated. Migrating it is the last step.

A publication in the content repo needs a rebuild of this shell to appear online.
