---
name: accessibility-a11y
description: Implementation guidance for accessible UI on the zatsit blog: semantic HTML, ARIA, keyboard, focus, motion, forms, images. Use while writing or reshaping an Astro component, layout or page. The verification counterpart is the wcag-check skill, which is the gate you run before committing.
---

# Accessibility, implementation guidance

Use this while writing. Use `wcag-check` before committing: this skill helps
you get it right, that one proves it.

The target is WCAG 2.1 AA, mandatory on this repo
(`.claude/rules/quality.md`). The site is French-only, static, with close to
zero client JavaScript, which removes whole categories of accessibility risk
(no client-side routing, no focus to restore after a re-render, no live
regions). What remains is markup discipline.

## Semantic HTML first

The cheapest accessibility is the markup you did not have to annotate.

- Landmarks: one `<header>`, one `<nav>`, one `<main id="main-content">`, one
  `<footer>` per page. Articles in `<article>`, sidebars in `<aside>`.
- `<button>` for an action, `<a href>` for a destination. Never a `<div>` with
  a click handler: it costs you keyboard support, focus, role and Enter/Space
  handling, all of which come free with the right element.
- One `<h1>` per page, then `<h2>`/`<h3>` without skipping a level. On an
  article page the `<h1>` is the title, so the Markdown body must start at
  `##`.
- Dates in `<time datetime="2026-08-13">`, which is also what the RSS feed and
  the structured data want.
- Lists are `<ul>`/`<ol>`: tag lists, author lists, the archive index.
- Abbreviations in `<abbr title="…">`. Relevant here: WUE, PUE, GES.

## Links and text

- Link text must make sense out of context. "Lire l'article" repeated fifteen
  times on a listing page is fifteen indistinguishable links: include the
  article title, or add `aria-label` carrying it.
- No "cliquez ici".
- A link that opens in a new tab announces it, in the label or via a visually
  hidden mention. Prefer not opening new tabs at all.
- Don't wrap a whole card in one giant `<a>`. Make the title the link and
  extend its hit area with a pseudo-element overlay, so the accessible name
  stays the title rather than the entire card text.

## Images

- Meaningful image: `alt` describing what it conveys, not "image de …".
- Decorative image: `alt=""`, so screen readers skip it. Author avatars next to
  a name that is already text are decorative.
- Every image goes through `astro:assets` with explicit dimensions: missing
  dimensions cause layout shift, which is both a CLS failure and an
  accessibility annoyance for people using magnification.
- Inline SVG icons get `aria-hidden="true"` when the neighbouring text already
  names them, and the control itself carries the `aria-label`.

## Keyboard and focus

- Everything interactive is reachable by Tab, in visual order. DOM order is
  reading order: do not reorder with CSS in a way that breaks it.
- The skip link (`global.css:194`) stays the first focusable element and
  targets `#main-content`.
- `:focus-visible` is defined globally (`global.css:212`). If a component
  overrides it, the replacement must be at least as visible and still meet 3:1.
- `tabindex="0"` only to make a genuinely interactive non-native element
  focusable; `tabindex="-1"` for programmatic focus targets. Never a positive
  value.
- No keyboard trap. On this site the only realistic candidate is a mobile menu:
  if one lands, Escape must close it and focus must return to the trigger.

## The two interactive components on this site

Both are the classic ARIA failure cases, so get them right once.

**Theme toggle.** A real `<button>`, with an `aria-label` in French describing
the action ("Passer au thème sombre"), and `aria-pressed` kept in sync if you
model it as a two-state toggle. The label must change with the state, or use
`aria-pressed` and keep the label stable: pick one, do not mix. The inline
theme script in `BaseHead.astro` already prevents the flash of wrong theme;
keep that behaviour when touching it.

**Share links.** Icon-only links, so each needs an `aria-label` naming both the
network and the target: "Partager cet article sur LinkedIn". The icons
themselves are `aria-hidden="true"`. Target size ≥ 24×24px, ideally 44×44px,
which usually means padding rather than a bigger icon.

## Motion

- Every transition and animation gated:

  ```css
  @media (prefers-reduced-motion: reduce) {
    /* ... */
  }
  ```

  `global.css:218` already carries the global reduction. A component that adds
  its own animation must respect it rather than re-enable motion underneath.
- No infinite animation without a pause control. The design system's signature
  lift on hover is fine: it is short, triggered, and reversible.

## Color

- Never a raw hex: use a semantic token, so both themes resolve.
- Never information by color alone. A tag distinguished only by hue is not
  distinguished for everyone; the tag text carries the meaning.
- `--color-eco` is a signifier, not a text color in light theme. See
  `wcag-check` for the number.

## Language

- `lang="fr"` on `<html>`.
- A run of text in another language carries its own `lang`, which matters for
  screen reader pronunciation. Technical articles here mix in English terms
  constantly; annotate whole quoted sentences, not every borrowed noun.

## Testing beyond the automated gate

The script measures contrast. It cannot tell you the page makes sense.

- Tab through the page start to finish. Can you reach everything, in a sensible
  order, always seeing where you are?
- Zoom to 200% and to 400%. Does anything overlap, clip or scroll sideways?
- Read the page with VoiceOver (Cmd+F5 on macOS). Do the headings form a usable
  outline? Do the links make sense read as a list?
- Turn on Reduce Motion in System Settings and reload.
