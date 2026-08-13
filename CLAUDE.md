# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **zatsit blog** — a static site built with [Docusaurus v3](https://docusaurus.io/) (React, MDX), deployed on Firebase Hosting. The site is French-language only (`defaultLocale: 'fr'`).

**Important**: Blog content (posts, docs, author profiles) lives in a **separate repository** — [zatsit-oss/zats-blog-content](https://github.com/zatsit-oss/zats-blog-content). This repo only contains the site shell, theme, and components.

> **Migration in progress.** The shell is being rebuilt on Astro 7 on the `migration-astro` branch. Everything below this section still describes the Docusaurus setup and is rewritten in phase 6. See `PLAN-MIGRATION.md` and `REPRISE.md`.

## Quality gates (non-negotiable)

@.claude/rules/quality.md

Two gates run on every front-end change, before declaring the work done and before committing:

```bash
npm run check:a11y   # WCAG 2.1 AA contrast, both themes  (skill: wcag-check)
npm run check:eco    # page weight budgets on dist/       (skill: eco-check)
```

Both exit non-zero on failure. The matching skills in `.claude/skills/` carry the checklists: `wcag-check` and `eco-check` are the verification gates, `accessibility-a11y` is the implementation guidance to read while writing a component.

## Commands

```bash
npm install          # install dependencies
npm run start        # local dev server with live reload
npm run build        # production build → build/
npm run serve        # serve the production build locally
npm run clear        # clear Docusaurus cache (use when stale build issues occur)
```

No linting or test scripts are configured.

## Content Setup (local dev)

Blog content must be fetched from the content repo before developing locally:

```bash
# Clone the content repo at the same workspace level, then:
cp -r  ../zats-blog-content/docs/* docs
cp -r  ../zats-blog-content/blog/* blog
cp -r  ../zats-blog-content/authors/authors.yml blog
cp -R  ../zats-blog-content/authors/img/* static/img/authors
```

## Architecture

### Content separation

| Concern | Repository |
|---|---|
| Site shell, theme, components | This repo (`zats-blog`) |
| Blog posts, docs, authors | `zats-blog-content` |

In CI, the custom composite action at [.github/actions/docusaurus/action.yml](.github/actions/docusaurus/action.yml) handles fetching the content repo (with caching), merging it into the right folders, and running the build.

### Key configuration files

- [docusaurus.config.js](docusaurus.config.js) — full site config: navbar, footer, plugins, math (KaTeX via `remark-math` + `rehype-katex`), and search (`docusaurus-lunr-search` in French).
- [sidebars.js](sidebars.js) — docs sidebar (auto-generated from filesystem).
- [firebase.json](firebase.json) — Firebase Hosting config: serves `build/`, root redirects to `/blog`, cache-control set to 1 day.
- [.firebaserc](.firebaserc) — Firebase project: `zatsit-blog`.

### Custom components

All live under [src/](src/):

- [src/pages/index.js](src/pages/index.js) — homepage (hero + `HomepageFeatures`).
- [src/pages/blog-conception.js](src/pages/blog-conception.js) — eco-design info page.
- [src/pages/mentions-legales.md](src/pages/mentions-legales.md) — legal notices (raw Markdown page).
- [src/components/zatsCO2JSBadge.js](src/components/zatsCO2JSBadge.js) — custom CO2 badge using `@tgwf/co2`.
- [src/components/zatsWebsiteCarbonBadge.js](src/components/zatsWebsiteCarbonBadge.js) — Website Carbon badge widget.

### Navigation categories

Categories displayed in the navbar are tag-based (`/blog/tags/<tag>`). Adding a new category requires at least one published post with that tag, otherwise the build fails with a broken link.

### CI/CD

- **PRs** → [firebase-hosting-pull-request.yml](.github/workflows/firebase-hosting-pull-request.yml): builds and deploys a Firebase preview channel.
- **Merge to `main`** → [publish-on-merge.yml](.github/workflows/publish-on-merge.yml): builds and deploys to the live Firebase channel.
- Changes to `blog/`, `docs/`, and markdown files do **not** trigger CI (content is managed in the content repo).

## Node version

Requires Node ≥ 20. Pinned in [.node-version](.node-version).

