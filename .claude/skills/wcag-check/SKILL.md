---
name: wcag-check
description: Verify that UI changes on the zatsit blog meet WCAG 2.1 AA (contrast measured in BOTH themes, visible focus, motion gating, ARIA, semantics, target size) BEFORE declaring front-end work done or committing. Use whenever you add or modify a component, page, style, color, or animation. Complements accessibility-a11y (implementation guidance); this is the mandatory verification gate.
---

# WCAG 2.1 AA verification gate

WCAG 2.1 AA is mandatory for every front-end change in this repo (see
`.claude/rules/quality.md`). This skill is the verification step. Run it before
claiming UI work is complete, and before committing.

**Do not eyeball contrast. Measure it.** A ratio you did not compute is a claim
you cannot make.

## Scope

This gate verifies the UI you **changed**. It does not, by itself, catch
pre-existing failures elsewhere on the page. When a change lands in a shared
layout or in `src/styles/global.css`, check the other components that consume
it too.

## How to use

1. Run the token audit. It resolves the real token files and measures every
   standard pairing in both themes:

   ```bash
   node .claude/skills/wcag-check/scripts/contrast.mjs
   ```

   It exits 1 if any gated pairing falls below AA, so it can gate CI.

   When a build exists, it also measures every Shiki colour the articles
   actually emit, against the surface code blocks sit on. A theme is designed
   against its own background, so its published ratios do not carry over: with
   `github-light` on our surface, three colours failed, one of them on 212
   tokens. Run `npm run build` first if you have changed a theme.

2. If the change introduces a pairing the audit does not cover (a new token, a
   color-mix over an unusual backdrop, gradient-clipped text), measure it
   explicitly:

   ```bash
   node .claude/skills/wcag-check/scripts/contrast.mjs "#f1be51" "#262628"
   ```

   Then add the pairing to the `PAIRS` table in the script, so the next change
   inherits the check instead of rediscovering it.

3. Run the engine the token audit cannot replace:

   ```bash
   npm run check:axe                 # every page of dist/, both themes, 1440 and 390px
   npm run check:axe -- --mobile     # 390px only
   npm run check:axe -- /categories/ # one page
   ```

   It exits 1 on any violation. Contrast is the one thing it duplicates; the
   rest, ARIA, roles, names, focus order, target size, is invisible to a token
   audit. `target-size` is experimental in axe and is asked for by name here,
   which is what caught table-of-contents links measuring 23px.

   Sweep every page, not the templates you changed. On 28 August ten passes on
   the home page, the categories and the authors came back clean while three
   rules were failing inside articles: an admonition title below AA in both
   themes, those 23px links, and tables scrolling without keyboard access. The
   violations live where the content is.

   Nodes it leaves *undetermined* are not failures: axe declines to compute
   contrast through a translucent stack, and `--color-surface` is `rgba` in the
   dark theme. Step 1 composites those layers and measures them.

4. Walk the checklist below. Fix what fails, re-measure.

5. Report the ratios you relied on. Never claim a pass without the number.

## Checklist

- [ ] **1.4.3 Text contrast** ≥ 4.5:1 (≥ 3:1 for large text ≥ 24px, or ≥
      18.66px bold), light **and** dark. Gradient-clipped text (`--gradient-text`,
      `--gradient-impact`) must pass at its **worst** stop, not its average.
- [ ] **1.4.11 Non-text contrast** ≥ 3:1 for control boundaries, focus
      indicators, meaningful icons and state indicators. Check **every state**
      (default, hover, focus, active, disabled), not just the initial render.
      *Decorative exemption:* purely aesthetic borders (card outlines, inactive
      chips) are exempt when the component and its state are already
      identifiable by fill and text. `--color-border` sits at 1.48:1 in light
      and 1.66:1 in dark by design; do not force 3:1 on it and diverge from the
      design system for no accessibility gain. Reserve the 3:1 bar for
      boundaries that actually convey the control or its state.
- [ ] **2.4.7 Focus visible**: every interactive element has a
      `:focus-visible` indicator ≥ 3:1 against adjacent colors. The global rule
      in `global.css:212` covers the default case; anything overriding it must
      provide an equivalent.
- [ ] **1.4.1 Use of color**: no information carried by color alone. Pair with
      shape, position, text or icon.
- [ ] **2.3.3 / 2.2.2 Motion**: every animation and transition gated behind
      `@media (prefers-reduced-motion: reduce)`, JS-driven motion gated via
      `matchMedia('(prefers-reduced-motion: reduce)')`. No ungated infinite
      animation.
- [ ] **4.1.2 Name, role, value**: semantic element or correct `role`;
      `aria-label` on icon-only controls; `aria-pressed` / `aria-expanded` /
      `aria-hidden` kept in sync with the visual state. The theme toggle and
      the share links are the two obvious cases here.
- [ ] **1.3.1 Info and relationships**: semantic structure: lists are
      `<ul>`/`<ol>`, headings ordered without skipping, dates in `<time
      datetime>`, form labels associated.
- [ ] **2.1.1 Keyboard**: reachable and operable by keyboard, no trap. The
      skip link (`global.css:194`) must remain the first focusable element.
- [ ] **2.5.8 Target size**: interactive targets ≥ 24×24px; project rule aims
      for 44×44px.
- [ ] **3.1.1 Language**: `lang="fr"` on `<html>`. Flag a foreign-language run
      of text with its own `lang`.

## Measured baseline

Every gated pairing currently passes. Recorded so a regression is visible as a
change, not discovered as a surprise. Re-run the script rather than trusting
this table if the tokens have moved.

| Pairing | Light | Dark |
|---|---|---|
| `text` on `bg` | 16.71:1 | 13.40:1 |
| `text` on `surface` / `card-bg` | 15.97:1 | 11.77:1 |
| `text-muted` on `bg` | 7.58:1 | 6.71:1 |
| `text-muted` on `surface` / `card-bg` | 7.24:1 | 5.89:1 |
| `primary` on `bg` | 8.25:1 | 10.01:1 |
| `primary` on `surface` / `card-bg` | 7.88:1 | 8.79:1 |
| `primary-hover` on `bg` | 10.78:1 | 9.65:1 |
| `on-primary` on `primary` | 8.25:1 | 10.01:1 |
| `secondary` on `bg` | 8.25:1 | **4.83:1** |
| `eco` on `bg` | 2.10:1 | 8.18:1 |
| `border` on `bg` | 1.48:1 | 1.66:1 |

In dark, `--color-surface` and `--color-card-bg` are `rgba(255,255,255,0.05)`,
which composites to `#262628` over `#1b1b1d`. Stacked layers land near
`#313133`; compute the exact value rather than trusting the approximation when
a result is borderline.

## Two traps specific to this palette

1. **`--color-secondary` in dark is `#e1601f`, at 4.83:1.** It passes, with
   0.33 of margin. Any darkening of that orange, or any use of it on
   `--color-surface` instead of `--color-bg`, drops it below AA. Measure before
   reusing it as text.

2. **`--color-eco` (`#2ecc71`) is not a text color in the light theme**, at
   2.10:1 on white. The design system reserves it for sustainability
   signifiers: use it as a fill, a dot, an icon or a chart mark, and pair the
   figure it annotates with `--color-text`. This matters most on the CO2
   badges, which is exactly where the temptation is.

## Brand versus contrast

If a brand color fails as text, **decouple**: keep a vivid decorative token for
non-text elements (glows, blobs, mesh gradients, borders) and use a separate
AA-safe token for text. Do not ship a failing text color, and do not silently
darken a brand color either: raise it.
