#!/usr/bin/env node
/**
 * WCAG contrast measurement for the zatsit blog.
 *
 * Two modes:
 *   node contrast.mjs                     audit every standard token pairing, both themes
 *   node contrast.mjs "#0f15fd" "#ffffff" measure one ad-hoc pairing
 *
 * The audit mode reads the real token files (src/styles/tokens/*.css) instead of
 * hardcoding hex values, so it can never drift from the design system. Tokens
 * that resolve to a translucent color are composited over their theme background
 * before measuring, which is what the eye actually sees.
 *
 * Exit code 1 when a required pairing fails, so CI can gate on it.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// --- WCAG 2.1 relative luminance and contrast ratio -------------------------

const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

export const contrast = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

/** Composite `hex` at `alpha` over an opaque `base`. */
export const over = (hex, alpha, base) => {
  const parts = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  const f = parts(parseInt(hex.slice(1), 16));
  const b = parts(parseInt(base.slice(1), 16));
  const out = f.map((c, i) => Math.round(c * alpha + b[i] * (1 - alpha)));
  return '#' + out.map((x) => x.toString(16).padStart(2, '0')).join('');
};

// --- Token parsing ----------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = resolve(HERE, '../../../../src/styles/tokens');

/** Extract `--name: value` declarations, keyed by theme, from the token files. */
function readTokens() {
  const themes = { light: {}, dark: {} };
  const css = ['palette.css', 'colors.css']
    .map((f) => readFileSync(resolve(TOKENS_DIR, f), 'utf8'))
    .join('\n');

  // Strip comments so a commented-out declaration is never picked up.
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');

  for (const [, selector, body] of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const isDark = selector.includes('[data-theme="dark"]');
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      const decl = value.trim();
      if (isDark) themes.dark[name] = decl;
      else {
        themes.light[name] = decl;
        // Primitives declared on :root are shared; the dark theme only overrides
        // the semantic layer, so seed it with the same base.
        if (!(name in themes.dark)) themes.dark[name] = decl;
      }
    }
  }
  return themes;
}

const SHORTHAND = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;

/**
 * Resolve a token to `{ hex, alpha }`, following var() chains.
 * Returns null for values that are not a flat color (gradients, keywords).
 */
function resolveColor(name, table, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);

  let value = table[name];
  if (!value) return null;

  const varRef = value.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  if (varRef) return resolveColor(varRef[1], table, seen);

  const rgba = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/);
  if (rgba) {
    const [r, g, b] = rgba.slice(1, 4).map((n) => Math.round(Number(n)));
    const hex = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return { hex, alpha: rgba[4] === undefined ? 1 : Number(rgba[4]) };
  }

  const short = value.match(SHORTHAND);
  if (short) return { hex: '#' + short.slice(1).map((c) => c + c).join(''), alpha: 1 };

  if (/^#[0-9a-f]{6}$/i.test(value)) return { hex: value.toLowerCase(), alpha: 1 };

  return null;
}

/** Flatten a token against the theme background so it can be measured. */
function flatten(name, table) {
  const bg = resolveColor('--color-bg', table);
  const color = resolveColor(name, table);
  if (!color || !bg) return null;
  return color.alpha === 1 ? color.hex : over(color.hex, color.alpha, bg.hex);
}

// --- Standard pairings ------------------------------------------------------

// kind: 'text' → 1.4.3 (4.5:1) | 'large' → 1.4.3 large text (3:1)
//       'nontext' → 1.4.11 (3:1) | 'info' → measured, not gated
const PAIRS = [
  { fg: '--color-text', bg: '--color-bg', kind: 'text', note: 'body copy' },
  { fg: '--color-text', bg: '--color-surface', kind: 'text', note: 'body copy on surface' },
  { fg: '--color-text', bg: '--color-card-bg', kind: 'text', note: 'body copy on card' },
  { fg: '--color-text-muted', bg: '--color-bg', kind: 'text', note: 'dates, metadata' },
  { fg: '--color-text-muted', bg: '--color-surface', kind: 'text', note: 'metadata on surface' },
  { fg: '--color-text-muted', bg: '--color-card-bg', kind: 'text', note: 'metadata on card' },
  { fg: '--color-primary', bg: '--color-bg', kind: 'text', note: 'links, primary text accent' },
  { fg: '--color-primary', bg: '--color-surface', kind: 'text', note: 'links on surface' },
  { fg: '--color-primary', bg: '--color-card-bg', kind: 'text', note: 'links on card' },
  { fg: '--color-primary-hover', bg: '--color-bg', kind: 'text', note: 'link hover' },
  { fg: '--color-on-primary', bg: '--color-primary', kind: 'text', note: 'button label' },
  { fg: '--color-secondary', bg: '--color-bg', kind: 'text', note: 'secondary accent as text' },
  { fg: '--color-eco', bg: '--color-bg', kind: 'info', note: 'eco signifier, non-text use only' },
  { fg: '--color-primary', bg: '--color-bg', kind: 'nontext', note: 'focus ring vs page' },
  { fg: '--color-primary', bg: '--color-surface', kind: 'nontext', note: 'focus ring vs surface' },
  { fg: '--color-border', bg: '--color-bg', kind: 'info', note: 'decorative border, exempt unless it conveys state' },
];

const MIN = { text: 4.5, large: 3, nontext: 3, info: 0 };

function audit() {
  const themes = readTokens();
  let failures = 0;

  for (const theme of ['light', 'dark']) {
    const table = themes[theme];
    console.log(`\n  ${theme.toUpperCase()} theme`);
    console.log('  ' + '-'.repeat(76));

    for (const pair of PAIRS) {
      const fg = flatten(pair.fg, table);
      const bg = flatten(pair.bg, table);
      if (!fg || !bg) {
        console.log(`  ??  ${pair.fg} on ${pair.bg}, not a flat color, measure by hand`);
        continue;
      }
      const ratio = contrast(fg, bg);
      const min = MIN[pair.kind];
      const ok = ratio >= min;
      if (!ok) failures++;

      const mark = pair.kind === 'info' ? '--' : ok ? 'ok' : 'KO';
      const req = pair.kind === 'info' ? '     ' : `≥${min}`;
      const label = `${pair.fg.replace('--color-', '')} on ${pair.bg.replace('--color-', '')}`;
      console.log(
        `  ${mark}  ${label.padEnd(28)} ${ratio.toFixed(2).padStart(6)}:1 ${req.padEnd(5)}` +
          ` ${fg}/${bg}  ${pair.note}`,
      );
    }
  }

  console.log('');
  if (failures) {
    console.log(`  ${failures} pairing(s) below the WCAG 2.1 AA threshold.`);
    process.exit(1);
  }
  console.log('  All gated pairings pass WCAG 2.1 AA.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , fg, bg] = process.argv;
  if (fg && bg) console.log(`${fg} on ${bg} = ${contrast(fg, bg).toFixed(2)}:1`);
  else audit();
}
