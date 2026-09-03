# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The **zatsit blog**: a static site built with [Astro 7](https://astro.build/), French-only. It replaced a Docusaurus v3 site on 3 September 2026 and is what `blog.zatsit.fr` serves.

**Content lives in another repository.** Articles, authors and their images are in [zats-blog-content](https://github.com/zatsit-oss/zats-blog-content), cloned as a **sibling directory**, and read in place by a `glob()` loader. Nothing is copied. This repo holds the shell only.

## Quality gates, non-negotiable

@.claude/rules/quality.md

```bash
npm run check        # TypeScript
npm run check:a11y   # WCAG 2.1 AA contrast, both themes, plus the Shiki colours
npm run check:eco    # page weight budgets, on dist/
npm run check:axe    # axe-core over every page of dist/, both themes, 1440 and 390px
```

The first three run in CI on every pull request and exit non-zero on failure. Read
the full output of `astro check`: the error count sits above the warnings line, and
truncating with `tail -3` hides it.

`check:axe` does not run in CI: it needs Chrome, so it is a local gate, and the one
to run before calling UI work done. It serves `dist/` itself on a port of its own,
so it audits the build just produced rather than whatever a preview daemon is
holding. `-- --mobile`, `-- --desktop` or `-- /une/page/` narrow it down.

The matching skills carry the checklists: `wcag-check` and `eco-check` are the verification gates, `accessibility-a11y` is the implementation guidance to read while writing a component.

## The traps this codebase has already paid for

Each of these cost a debugging session. They are not hypothetical.

**The content store caches rendered Markdown.** Changing a Markdown plugin and rebuilding shows the old output. Move `node_modules/.astro/data-store.json` aside after touching the Markdown pipeline, or you will diagnose problems that no longer exist.

**`context.store.set()` is a no-op when the entry digest is unchanged.** Deriving data from a file without touching the file means the write is silently dropped. `delete()` then `set()`. And assert the end state of the store, not the fact of having attempted the write.

**`glob()` derives its `id` from the frontmatter `slug`, not the path.** The date fallback reads `entry.filePath`; with `id`, the thirteen articles without a frontmatter date fail.

**`authors.yml` is one document of thirteen profiles.** It needs `file()` with a YAML parser; `glob()` loads it as a single entry and Zod fails on `name: Required`.

**`.focus()` does not make `:focus-visible` match, so it cannot verify a focus ring.** Chrome grants `:focus-visible` on keyboard interaction, not on a programmatic focus call: the computed style came back as the browser default, `3px none`, and reads as a missing focus ring on a component that has one. Drive a real Tab with `Input.dispatchKeyEvent` and assert `el.matches(':focus-visible')` alongside the outline.

**A class passed to a child component does not carry the parent's scope.** `<CategoryIcon class="categories__icon" />` puts the class on the child's root element, but not the parent's `data-astro-cid`, so a rule written in the parent compiles to `.categories__icon[data-astro-cid-…]` and matches nothing: the category icons shipped with neither their margin nor their colour, silently. Reach them with `:global()` behind a scoped ancestor, or drive them with a custom property, which inherits across the boundary.

**Astro scopes component CSS to server-rendered elements.** Anything a script creates at runtime carries no `data-astro-cid` attribute, so scoped rules never match it. Those styles must be `is:global`.

**`is:inline` is required, not stylistic, for the search script.** `/pagefind/pagefind.js` is generated after the Astro build, and a Vite-processed dynamic import emits an unsubstituted `__VITE_PRELOAD__` marker that throws at runtime. The inline script also needs `type="module"`, or Safari refuses the dynamic import that Chrome accepts.

**Crossing 4 kB flips a shared component's CSS from inlined to a request.** `build.inlineStylesheets: 'auto'` inlines a stylesheet under 4 kB; 150 bytes added to `PostList.astro` took its chunk to 4.1 kB and Astro emitted `_astro/PostList.*.css`, which put the home page's initial weight up 4.4 kB and its request count from 10 to 11. It cuts both ways rather than being a regression: that CSS was inlined into each of the six pages using the component, so a visit of more than one page now downloads it once. Worth knowing before blaming a feature for a jump it did not cause.

**Files under `public/` bypass the image pipeline.** They ship at full resolution.

**`astro:assets` re-encodes every image but resizes only when it knows the target width, and Markdown has no syntax for one.** Article images were therefore emitted at their source size, up to 7008px into a 779px column, which is what put two articles megabytes over the page-weight budget. `src/plugins/capped-image-service.mjs` wraps the Sharp service, caps any image whose size nobody declared, and gives it a srcset matched to the widths an article image is measured at; an explicit `width` on an `<Image>` still passes through untouched, its own `sizes` included.

**`prefers-reduced-motion` in global.css collapses the animation *duration*, never the *delay*.** A staggered entrance therefore still waits its turn with the from-state applied: thirteen of the seventeen words of the hero tag cloud were invisible 200 ms in, for exactly the readers who asked for calm. A component with an `animation-delay` has to cancel its own animation in its own media query.

**Animating a transform on an SVG element is not composited.** Unlike a div, it goes back through layout on every frame: measured at 720 style recalculations and 720 layouts per six seconds for a loop, against 158 of each for a single pass. "It is only transform and opacity, the GPU handles it" is false inside an SVG.

**`image.layout: 'constrained'` derives `sizes` and the candidate list from the declared width, and for a Markdown image that width *is the source's*.** Turning it on alone made things worse, not better: `sizes` came out as `(min-width: 7086px) 7086px, 100vw`, so a 1600px window resolved it to 1600px and fetched the 3218w file for an image laid out at 779px, and the candidate list ran back up to 7086w, defeating the cap. Both are computed in Astro's `internal.js` *before* `validateOptions` runs, so the service has to rewrite `widths` and `sizes` itself, which is what `capped-image-service.mjs` now does.

**`naturalWidth` is density-corrected when a srcset uses `w` descriptors.** It returns the file's width divided by the density Chrome computed from `sizes`, not the file's own pixel width, so "is this image being upscaled?" cannot be answered with it: a correctly served 780px file reported 358. Read the `w` descriptor of `currentSrc` instead.

**A translucent background defeats a naive contrast measurement, and axe knows it.** `--color-card-bg` is `rgba(255, 255, 255, 0.05)` in the dark theme. Walking up the tree for the first non-transparent background finds that layer, and read as an opaque colour it computes as near-white: the card's article count measured 2.56:1 against a real 5.86:1. That is also what axe reports as *incomplete* rather than as a violation, since it declines to guess through a semi-transparent stack. Composite every layer down to the page background before dividing.

**A sticky child needs a parent taller than itself.** `align-items: start` on a grid shrinks the item to its content height, leaving nothing for the sticky element to travel along: the table of contents looked pinned and scrolled away with the page.

**The built-in highlighter runs ahead of every user hast plugin, and its exclusion list cannot see a math block.** Astro documents `syntaxHighlight.excludeLangs: ['math']` as a default, but `createHighlightPlugin` tests `code.data.lang`, which a math block does not carry, so it reads as `plaintext` and Shiki claims the formula: `language-math` is stripped and what reaches the rest of the pipeline is a coloured code listing that no longer says it is maths. `hastPlugins` is pushed *after* the highlighter unconditionally, so no ordering fixes it. Anything the highlighter would swallow has to be handled at the mdast layer instead, which is what `mdast-math.mjs` does.

**Sätteri parses maths and renders none.** `features.math` produces a `math` node, then the pipeline emits `<pre><code class="language-math">` holding the LaTeX, exactly as remark-math does without a renderer, so the reader sees `$$ \text{WUE} = … $$` printed. This shipped unnoticed for the whole migration: no quality gate asks whether what is displayed resembles what the author wrote. It was found by reading what `main` had that the branch did not.

**A quality gate can encode an assumption about production that nothing checks, and this one did for the whole migration.** `check:eco` measures text gzipped, which assumes the host compresses it. Production did not: `gzip on` was commented out in the nginx config, so the home page went over the wire at 72 kB where the gate reported 21 kB, and every page weight this blog published described a site nobody received. The gate was green the entire time. The fix was one directive; the habit is the point, so after any hosting change read the response and not the build: `curl -sI -H 'Accept-Encoding: gzip'`.

**`gzip_proxied` defaults to `off`, so nginx behind a load balancer compresses nothing.** The directive tells nginx whether to compress a *proxied* request, and it decides that on the `Via` header, which Google's load balancer stamps on everything as `Via: 1.1 google`. Without `gzip_proxied any`, the response carries `Vary: Accept-Encoding` over an uncompressed body, which reads as "compression is configured" while nothing is compressed. This cost a production deploy to find: the local container test passed because no proxy was in front of it, so no `Via`. **Replay the proxy header when testing a config that runs behind one**, or the test is not the production it claims to reproduce.

**An nginx `location` that sets its own `add_header` drops every header from the enclosing level.** The directive is inherited only when the current level declares none of its own, so the moment a location carried its own `Cache-Control` it stopped sending the security headers the server block was sending: measured, `/_astro/*` came back with a cache lifetime and no `nosniff`, on exactly the stylesheets, scripts and fonts that header protects. Derive the varying value with a `map` and keep all the `add_header` directives on one level. A `map` is legal in `conf.d`, which is included inside the `http` block.

**An SPA fallback is not a static site's fallback, and Astro removes the safety net Docusaurus had.** `try_files $uri $uri/ /index.html` serves the home page with a **200** on any unknown URL. Under Docusaurus the client router then drew its own error screen, so the wrong status was masked; Astro has no client router, so the day the blog switched, every mistyped URL served the home page and told nobody, leaving search engines free to index unbounded duplicates. `=404` plus `error_page 404 /404.html` is the static answer, and the `$uri/` element must stay so a slashless article URL keeps its 301.

**Block-level `rawHtml` escapes the paragraph wrapper, phrasing-level does not.** Returning KaTeX's output as-is put the formula in `<p><span class="katex">…`, because the replacement opens on a `span`. Opening on a `div` emits a clean sibling block. That is what lets the formula have its own scroll box, and a `div` inside a `p` would have been closed by the browser.

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

**Awaiting inside `requestAnimationFrame` hangs forever in headless.** Same root cause as the frame note below, worse symptom: no frame is produced unless one is asked for, so the callback never runs and the CDP call never returns. A measurement that needs the browser to have settled goes in three steps, act, `Page.captureScreenshot`, measure, never in an rAF chain. This cost a killed script and a 180 s timeout.

**Force a frame before measuring a colour in headless.** Headless Chrome produces no frames unless asked, so a CSS transition never advances: after clicking the theme toggle, `getComputedStyle` returned the palette the page was leaving for at least three seconds, and the 200 ms transition on `a { color }` was enough for axe-core to report 42 contrast violations that do not exist. `Page.captureScreenshot` forces a frame and the values snap to the truth. Any colour assertion after a state change needs that, or it measures the previous state.

**Audit the articles, not only the page templates.** Ten passes on the home page, the categories, the authors and `/blog-conception/` came back clean while three rules were failing on article pages: an admonition title below AA in both themes, table-of-contents links one pixel short of the 24px target, and three tables scrollable without keyboard access. A template is written once and audited once; an article brings admonitions, deep headings, wide tables and images, and it is where the violations are. Sweep all 72 pages, both themes: it takes four minutes.

**axe-core can be run without adding a dependency.** Download `axe.min.js` to the scratchpad, inject it with `Runtime.evaluate`, then `axe.run(document)`. That is the same engine as the axe DevTools extension, so a clean result here is a clean result in the reader's browser, and it catches what `check:a11y` cannot: ARIA misuse, roles, names, structure. `check:a11y` only measures contrast on the tokens.

**The carbon badge always reads "No Result" outside production, and that is not a defect.** It asks the API to measure `window.location.href`, so locally it asks for `http://localhost:4321/`, which nothing can reach. Do not debug it from a local build, and do not take a screenshot of the footer as evidence of a failure.

**The search cannot work under `npm run dev`**, since Pagefind's index is produced by the build. Use `npm run preview`. And the search script is inlined into every page, so a cached page serves the old script: force-reload before concluding anything.

## Architecture

| Concern | Where |
|---|---|
| Loader, schema, date and category fallback | `src/content.config.ts` |
| Shared helpers: excerpt, reading time, tags, categories | `src/utils/posts.ts` |
| Category and tag pages | `src/pages/categories/`, `src/pages/tags/[tag].astro` |
| Tag index, the navigational one | `src/components/TagIndex.astro` |
| Author pages, slugs, social links | `src/pages/authors/`, `src/utils/authors.ts` |
| Avatars, read from the content repo | `src/utils/avatars.ts` |
| Page shell, header, footer | `src/layouts/Layout.astro` |
| Article | `src/layouts/BlogPost.astro`, `src/pages/[...slug].astro` |
| Admonitions | `src/plugins/mdast-admonitions.mjs` |
| Maths, one formula in the whole corpus | `src/plugins/mdast-math.mjs` |
| Keyboard access to a wide table | `src/plugins/hast-table-scroll.mjs` |
| JSON-LD, `llms.txt` | `src/utils/schema.ts`, `src/pages/llms.txt.ts` |
| Green IT and WSG audits | `src/pages/audits/`, `src/data/referentiel-*.json`, `src/utils/referentiels.ts` |
| Image sizing policy | `src/plugins/capped-image-service.mjs` |
| Home page bands, hero figure | `src/components/BlogFacts.astro`, `BuiltWith.astro`, `HeroTagCloud.astro` |
| Design tokens | `src/styles/tokens/`, entry point `src/styles/tokens.css` |
| Site constants, navigation, hero copy | `src/consts.ts` |

The hero illustrations come from the Claude Design project **Illustrations hero banner Zatsit** (`e5663b1b-f0ae-4abb-a5ac-84599fcdac63`), which ships both boards as Astro components. Only board 3a, the tag cloud, is in the repository: the other was left in the project rather than committed unused. `DesignSync` cannot find it through `list_projects`: that call only returns projects of type design system, and this one is a plain project, so it has to be addressed by the id in its URL. The Zatsit Design System itself is `34f5e88a-fa9f-49cc-9a99-1383413a3a3a`.

Articles are served at the **root**, as `/<slug>/`, and the slug comes from the frontmatter rather than the folder name. `migration-routes-docusaurus.txt` holds the 45 reference routes; the build matches all 45.

## Conventions

- **Two taxonomies, and they are not the same word.** A **category** is the folder an article sits in, one per article, drawn from the closed list in the content repository's `config.json` and enforced by its own CI; it is derived in the loader and served at `/categories/<slug>/`, under labels held in `CATEGORY_LABELS`. A **tag** is free, several per article, open-ended, and served at `/tags/<tag>/`. Never call a tag a category: the site did, in four different words on four different surfaces, and it is what this rule exists to stop.
- **A name links inside the site, never out.** Clicking an author, in a byline or on `/authors/`, leads to `/authors/<prénom-nom>/`: their card and their articles. It used to open their GitHub profile, which answers a question nobody asked. The outbound profiles live on that card. Slugs come from `authorSlug`, shared by every surface, and two names folding to one slug fails the build rather than having one person overwrite another.
- **A tag is a "tag", to the reader as in the frontmatter.** One word for one thing, in the YAML, in the URL, in the heading of `/tags/<tag>/` and in the index on `/categories/`. "Thème" was tried as the reader-facing word and dropped: it asked the reader to translate a term the site never stopped spelling `tags`. Both taxonomies are surfaced on `/categories/` alone, the header carrying a single entry, and `/tags/` redirects to `/categories/#tags`, the anchor rather than the top of the page, since someone typing that URL is after the tags.
- **Tags are deliberately unvalidated, and that is not an oversight to fix.** A new tag in the frontmatter creates its page and joins the index at the next build; nothing checks the spelling, where a category absent from the content repo's `config.json` fails the build. The asymmetry is intended: a category *must* exist for an article to be filed in it, which is structural, while a misspelt tag is a mistake in prose, and the content repository's pull-request reviews catch prose. Do not add a closed list, a warning on single-article tags, or a hook.
- **No tag is presented as bigger than another.** The index prints the seventeen words alphabetically, at one size, with no article count, on the page and in the accessible text alike. A graded cloud was tried and dropped: a count ranks seventeen equal words and sends every reader to the same three, where six of the seventeen hold a single article nobody has seen. Categories do carry their count, and that asymmetry is the point, a category is a shelf. What gives the block life instead is a tonal panel, the words two steps above body size, and a 48px accent stub on the panel's top edge, never a size ramp.
- **No separator in a wrapped run of words.** Middots between the tags lasted one build: there is no selector for "last on this line", so seven lines out of eight on a phone ended on a dangling dot and read as an unfinished sentence. `column-gap` separates them now. The same holds for any wrapped list this codebase grows.
- Never a raw hex in product code: always a semantic token from `src/styles/tokens/colors.css`, so both themes resolve.
- **The Website Carbon badge calls the API at runtime, and that is decided.** Its script is self-hosted, 1.9 kB, and it queries `api.websitecarbon.com` from the reader's browser on every page. Freezing that figure at build was proposed twice and refused twice: the API measures a URL by loading it, so at build it would grade the previous deployment or 404 on a new page, and Website Carbon caches upstream while the badge caches a day in `localStorage`. Do not propose self-hosting the number again. The self-computed figure already exists beside it, `CO2JSBadge` running `@tgwf/co2` at build over our own measured weight.
- Third-party brand marks are never redrawn, and never recoloured into our palette. Use the asset the owner publishes, geometry untouched, and only in the one-colour form they provide: Astro and Clever Cloud both ship a mono variant, and the Website Carbon globe travels as a CSS mask so its shape is theirs and the colour is the page's. A vendor with no vector asset gets its name set in type.
- Vertical space is not set per page. `main` opens and closes the page and its children are separated by the section gap, from the rhythm tokens at the end of `src/styles/tokens/spacing.css`. A block that needs to sit closer than the gap overrides it and says why.
- No MDX. Articles stay portable plain Markdown.
- Never reference this repo's assets from an article with a relative path: the content repo no longer sits inside the shell.
- The visual reference for shared components is the corporate site in `zats-websites`, but it is a Tailwind project: read it, rewrite it, do not copy its classes.

## Markdown pipeline

Sätteri, the default processor in Astro 7, with `features.directive` on for admonitions. Not remark: that would need `@astrojs/markdown-remark` and swap the whole pipeline for one feature the default already has.

Shiki emits both themes on every token with `defaultColor: false`, and CSS keyed on `data-theme` picks one. Code blocks sit on our surface token, so a theme's published contrast does not carry over: `check:a11y` measures the colours actually emitted.

## Deployment

Both workflows now build Astro through `.github/actions/astro`, which checks out the
content repository as a sibling.

- **Pull request** → [firebase-hosting-pull-request.yml](.github/workflows/firebase-hosting-pull-request.yml): builds, runs the gates, deploys a preview channel. `workflow_dispatch` with a `channel` input is the fallback, and it is currently the only path that works: the `pull_request` trigger stopped firing on the migration PR.
- **Merge to `main`** → [publish-on-merge.yml](.github/workflows/publish-on-merge.yml): the Firebase `live` channel, which is `zatsit-blog.web.app`.

**`blog.zatsit.fr` is served by neither.** Its bytes come from the GCS bucket `zatsit-blog-prod`, filled by the *content* repository's own `publish-on-merge.yml`: that pipeline checks this shell out at `shell-ref`, builds, and uploads `dist/`. So a publication in the content repo rebuilds this shell, and a change made only here does not reach production until something triggers that pipeline. `shell-ref` defaults to `main`.

**But the bucket is not what answers the request, and that matters more than it sounds.** In front of it sits **nginx on Cloud Run**, service `nginx` in `zatsit-dsi-externalsites-prod`, reading the bucket through gcsfuse and serving three hosts from one config. Everything about the *response* is decided there and nowhere in this repository: compression, cache lifetimes, security headers, and what an unknown URL returns.

That config is **generated by Terraform**, from `zatsit-external-loadbalancer/modules/nginx/nginx.conf.tftpl` in the `zatsit-terraform` repository, and stored as the Secret Manager secret `zatsit-external-prod-nginx-conf`. Two consequences worth knowing before touching anything:

- **Editing the secret by hand is drift, and Terraform will win.** `NGINX_CONF_VERSION` on the Cloud Run service is `google_secret_manager_secret_version.nginx-conf.version`, so an apply that finds a hand-made version resets the env var and recreates the revision. A hosting change belongs in that template, in a pull request.
- **`firebase.json` in this repo only ever served preview channels.** Its cache rules and its five security headers never applied to production, and reading it as the description of what readers receive is exactly the mistake that let the blog serve everything uncompressed for the whole migration.
