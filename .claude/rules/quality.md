# Quality rules for the zatsit blog

These rules apply to every change in this repository. They are derived from the
`zats-websites` monorepo charter and adapted to this project: a single Astro
site, plain CSS with design-system tokens (no Tailwind), content living in a
separate repository.

**Why they are stricter here than elsewhere.** This blog publishes zatsit's
GreenIT articles and carries the CO2 badges. It is the one site where an
eco-design claim is checkable by the reader. Lead by example, or say nothing.

## Accessibility: WCAG 2.1 AA is mandatory

Not a stretch goal. Every page and component must meet it, in **both** themes.

- Semantic HTML first: `<nav>`, `<main>`, `<article>`, `<header>`, `<footer>`,
  `<time>`. `<button>` for actions, `<a>` for navigation, never a `<div>`.
- Heading hierarchy without skipped levels. One `<h1>` per page.
- `alt` on every image; `alt=""` for purely decorative ones.
- `aria-label` on icon-only controls (the share links, the theme toggle).
- Visible `:focus-visible` on everything interactive. Never `outline: none`
  without an equivalent replacement.
- Every animation and transition gated behind
  `@media (prefers-reduced-motion: reduce)`; JS-driven motion gated via
  `matchMedia`.
- Contrast measured, never eyeballed. See the `wcag-check` skill.
- Interactive targets: 24×24px, **or** enough clear space around a smaller one
  that a 24px circle centred on it touches no neighbour's, which is the spacing
  exception 2.5.8 actually grants. Aim for 44×44px on anything a thumb uses.
  Stated flatly as "≥ 24×24px" this rule flagged about thirty compliant
  elements, the header navigation and the tag chips among them: their 20px
  height passes on spacing, and axe's own `target-size` rule agrees. Measure
  with that rule rather than with a ruler, and note it is experimental so it
  only runs when asked for by name.
- `lang="fr"` on `<html>`: the site is French-only.

Verification is a gate, not an afterthought: run `wcag-check` before declaring
UI work done and before committing, and `npm run check:axe` with it. The token
gate cannot see ARIA, roles, names, focus order or target size; axe can, over
every page rather than over the handful a template suggests.

## Eco-design: budgets, measured

The migration's whole point is a page far lighter than Docusaurus. Numbers, not
intentions.

| Budget | Limit |
|---|---|
| Initial page weight (first visit, text gzipped) | **< 500 kB** |
| Total page weight (including lazy assets) | **< 1 MB** |
| Initial requests, excluding the document | **< 25** |
| DOM elements per page | **< 1500** |
| EcoIndex grade | **A** |

Measured with the `eco-check` skill. The Docusaurus baseline it replaces is
recorded in `.claude/skills/eco-check/references/baseline-docusaurus.md`.

### Principles

- Static generation. Zero client JS by default; every kilobyte of script is an
  argued exception, not a convenience.
- Astro islands (`client:*`) only where interactivity is genuinely required,
  and `client:visible` below the fold.
- `compressHTML: true` in `astro.config.mjs`.
- Inline SVG or `.svg` assets for icons. Never an icon font.
- Images in WebP or AVIF, sized correctly, `loading="lazy"` below the fold,
  explicit `width`/`height` to avoid layout shift.
- No external CDN, no external stylesheet, no tracking, no analytics. Fonts are
  self-hosted through the Astro Fonts API (never Google Fonts).
- Load a stylesheet only on the pages that need it. KaTeX CSS in particular is
  loaded per-page, not globally: one single article uses maths.
- Font weights: 3 at most in the CSS actually shipped. Each extra weight or
  style is another woff2 over the wire.

## CSS conventions

- Never a raw hex in product code. Always a semantic token from
  `src/styles/tokens/colors.css`, so both themes resolve automatically.
- Add a new token rather than a one-off value. The token layer mirrors the
  Zatsit Design System; a divergence there must be deliberate and documented.
- `--color-eco` (`#2ecc71`) is a sustainability signifier, reserved for
  non-text use. It measures 2.10:1 on the light background: it is not a text
  color.

## Astro conventions

- No MDX. Articles stay portable plain Markdown, per the brief.
- The content repository is read in place by the `glob()` loader; never copy
  content into the shell, and never reference the shell's assets from an
  article with a relative path.
- `astro check` must pass. No TypeScript error.

## Testing checklist

- [ ] `npm run build` passes
- [ ] `npm run check` passes (no TypeScript error)
- [ ] `wcag-check` run on what changed, ratios recorded
- [ ] `eco-check` run on the build, every page within budget
- [ ] Keyboard navigation works, focus always visible
- [ ] Both themes verified, no flash of wrong theme
- [ ] Responsive on mobile, tablet, desktop, no horizontal scroll
- [ ] No console error
