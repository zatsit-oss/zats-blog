# AGENTS.md

Guidance for AI agents working in this repository. Read it **before** making any change.

## The project in one sentence

zatsit's technical blog (https://blog.zatsit.fr), statically generated with
**Docusaurus 3.9**, hosted on **Firebase Hosting**, and built with an
**eco-design** mindset (sobriety, serverless local search, carbon-footprint measurement).

## ⚠️ Content lives in ANOTHER repository

This is the single most important thing to understand. **This repo only holds the
technical stack** (theme, config, components, CI/CD). The editorial content lives in a
separate repository: [`zatsit-oss/zats-blog-content`](https://github.com/zatsit-oss/zats-blog-content).

The following are **gitignored here** and must NOT be committed to this repo:

- `blog/**` — the articles
- `docs/**` — the documentation
- `blog/authors.yml` — the authors list
- `static/img/authors/**` — author avatars

Practical consequences:

- **To write or fix an article**, work in the `zats-blog-content` repo, not here. See its
  `POSTING.md` for the writing conventions.
- Locally, content is fetched manually (see `README.md`). In CI it is fetched automatically
  via `.github/actions/docusaurus` (sparse-checkout of the content repo).
- If you run `npm run build` or `npm start` without copying the content first, the build
  fails (`onBrokenLinks: 'throw'`) or the blog shows up empty. That's expected.

## Tech stack

- **Docusaurus 3.9** (`@docusaurus/preset-classic`), React 18, MDX 3.
- **Node ≥ 20** (`package.json` `engines`). Local dev targets **Node 22** (`.node-version`);
  CI builds on **Node 20**. Use Node 20 or 22.
- **npm** (there is a `package-lock.json`, no yarn/pnpm). Use `npm ci` in CI, `npm install` locally.
- **Search**: `docusaurus-lunr-search` (client-side local index, language `fr`) — no Algolia, no server.
- **Math**: `remark-math` + `rehype-katex` (KaTeX CSS loaded via `stylesheets` in the config).
- **Eco-design**: `react-websitecarbon-badge` and `@tgwf/co2` for carbon-footprint badges.
- **i18n**: single locale `fr` (`defaultLocale: 'fr'`). All user-facing prose is in French.

## Commands

```bash
npm install        # install dependencies
npm start          # dev server (README says "npm run", but the real command is "npm start")
npm run build      # static build into ./build
npm run serve      # serve the build locally
npm run clear      # clear the Docusaurus cache (.docusaurus) when things look stale
npm run deploy     # Docusaurus deploy (unused — we deploy via Firebase)
```

There is **no test, linter, or formatter** configured in this repo. The quality gate is
`npm run build`: it fails on broken links and on config errors.
**Always validate a stack change with a successful `npm run build`.**

## Repository layout (versioned part)

```
docusaurus.config.js   # central config: navbar, footer, presets, plugins, theme
sidebars.js            # docs sidebar (auto-generated from docs/)
firebase.json          # hosting: public=build, redirect / -> /blog (302), 1-day cache
src/
  pages/               # non-blog React/MD pages (index, blog-conception, mentions-legales)
  components/          # custom components
    HomepageFeatures/  # homepage blocks
    zatsWebsiteCarbonBadge.js  # WebsiteCarbon badge
    zatsCO2JSBadge.js          # CO2 estimate via @tgwf/co2
  css/custom.css       # Infima variables + global styles (light/dark theme)
static/img/            # assets (logos, favicon, illustrations) — except img/authors (ignored)
.github/
  actions/docusaurus/  # composite action: fetch content + build
  workflows/           # Firebase CI (preview on PR, prod on merge to main)
blog/ docs/            # ⚠️ ignored content, see the dedicated section
```

## Deployment & CI/CD

- **Hosting**: Firebase Hosting, project `zatsit-blog`. Root `/` redirects (302) to `/blog`.
- **On PR**: `firebase-hosting-pull-request.yml` → build + deploy to a Firebase preview channel.
- **On merge to `main`**: `publish-on-merge.yml` → build + deploy to the `live` (prod) channel.
- Both workflows **ignore content changes** (`paths-ignore: blog/**, docs/**, *.md`): they only
  trigger on stack changes. Redeployment after publishing an article is driven from the content repo.
- The `.github/actions/docusaurus` action fetches the content from `zats-blog-content`
  (with caching), copies it to the right places, then runs `npm ci && npm run docusaurus build`.

## Conventions

- **Language**: prose and UI in **French**; code, variable names, and comments in **English**.
- **Commits**: *Conventional Commits* as seen in the history
  (`feat:`, `fix:`, `chore:`, `config:`, `ci:`, `build:`, scopes like `fix(a11y):`).
- **Accessibility**: the project has had a11y passes (labels, links). Keep `ariaLabel`, `alt`,
  and explicit labels when editing components/navigation.
- **Git**: never add a `Co-Authored-By` line or any AI-attribution mention in commits or PR descriptions.
- Don't commit noise: `node_modules/`, `build/`, `.docusaurus/`, `.idea/` are ignored.

## Gotchas

- **Navbar and tags**: a tag link in the navbar (`blog/tags/green`, etc.) **breaks the build**
  if no article carries that tag. That's why the `À venir` category block is commented out in
  `docusaurus.config.js`. Only enable a category tab once at least one article in the content
  repo carries the tag.
- The articles' `editUrl` points to the **content** repo, not this one.
- The README says `npm run` for dev: that's a typo, the correct command is `npm start`.
- If the dev view looks inconsistent after a config change, run `npm run clear`.
