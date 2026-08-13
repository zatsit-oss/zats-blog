#!/usr/bin/env node
/**
 * Eco-design budget check for the zatsit blog.
 *
 *   npm run build && node .claude/skills/eco-check/scripts/page-weight.mjs
 *   node .claude/skills/eco-check/scripts/page-weight.mjs --verbose   per-asset breakdown
 *   node .claude/skills/eco-check/scripts/page-weight.mjs <dir>       measure another build
 *
 * The third form is how the Docusaurus baseline was taken: point it at the
 * archived reference build to compare the migration against what it replaces.
 *
 * Walks the built dist/ and estimates, for every page, the bytes a first-time
 * visitor actually downloads. Text assets are measured gzipped (every host we
 * use compresses them); binaries are measured raw. Images marked
 * loading="lazy" and non-preloaded fonts are excluded from the initial figure
 * and reported separately.
 *
 * This is a static estimate, not a Lighthouse run: it sees what the HTML
 * references, not what the browser ends up executing. It catches budget drift
 * cheaply and deterministically. For Core Web Vitals, run a real audit.
 *
 * Exit code 1 when a budget is exceeded, so CI can gate on it.
 */

import { readFileSync, statSync, existsSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative, extname } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const target = process.argv.slice(2).find((a) => !a.startsWith('--'));
const DIST = target ? resolve(process.cwd(), target) : resolve(ROOT, 'dist');

// Budgets, from .claude/rules/quality.md. Keep the two in sync.
const BUDGET = {
  initialBytes: 500 * 1024, // what a first-time visitor downloads
  totalBytes: 1024 * 1024, // including lazy images
  requests: 25, // initial requests, excluding the document itself
  domElements: 1500, // whole document
};

const TEXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.xml', '.txt']);

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;

/** Bytes over the wire: gzipped for text, raw for already-compressed binaries. */
function transferSize(file) {
  const buf = readFileSync(file);
  return TEXT.has(extname(file).toLowerCase()) ? gzipSync(buf).length : buf.length;
}

function walk(dir, match, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, match, out);
    else if (match(full)) out.push(full);
  }
  return out;
}

/** Resolve an href/src found in `pageFile` to a path inside dist, or null. */
function toDistPath(ref, pageFile) {
  if (!ref || /^(https?:|data:|mailto:|tel:|#|\/\/)/i.test(ref)) return null;
  const clean = ref.split(/[?#]/)[0];
  const path = clean.startsWith('/')
    ? join(DIST, clean)
    : resolve(dirname(pageFile), clean);
  return existsSync(path) && statSync(path).isFile() ? path : null;
}

/** Assets pulled in by url() inside a stylesheet. */
function cssDependencies(cssFile) {
  const css = readFileSync(cssFile, 'utf8');
  const deps = [];
  for (const [, raw] of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    const path = toDistPath(raw, cssFile);
    if (path) deps.push(path);
  }
  return deps;
}

function analyzePage(pageFile) {
  const html = readFileSync(pageFile, 'utf8');
  const initial = new Map(); // path -> bytes, counted in the initial load
  const deferred = new Map(); // lazy images and other on-demand assets
  const add = (map, path) => {
    if (path && !map.has(path)) map.set(path, transferSize(path));
  };

  // The document itself.
  const documentBytes = gzipSync(Buffer.from(html)).length;

  // Stylesheets and preloads block or accompany first paint.
  for (const [, tag] of html.matchAll(/<link\b([^>]*)>/gi)) {
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1].toLowerCase() ?? '';
    if (!/\b(stylesheet|preload|modulepreload)\b/.test(rel)) continue;
    const path = toDistPath(tag.match(/\bhref=["']([^"']+)["']/i)?.[1], pageFile);
    add(initial, path);
    if (path && extname(path) === '.css') cssDependencies(path).forEach((d) => add(deferred, d));
  }

  // Scripts. `async`/`defer` still download on the first visit.
  for (const [, tag] of html.matchAll(/<script\b([^>]*)>/gi)) {
    add(initial, toDistPath(tag.match(/\bsrc=["']([^"']+)["']/i)?.[1], pageFile));
  }

  // Images: lazy ones are not part of the initial payload.
  for (const [, tag] of html.matchAll(/<img\b([^>]*)>/gi)) {
    const path = toDistPath(tag.match(/\bsrc=["']([^"']+)["']/i)?.[1], pageFile);
    add(/\bloading=["']lazy["']/i.test(tag) ? deferred : initial, path);
  }

  // Inline CSS and JS ship inside the document, already counted above, but we
  // surface the volume because it is the usual cause of a fat HTML file.
  const inlineBytes = [...html.matchAll(/<(style|script)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .reduce((sum, m) => sum + Buffer.byteLength(m[2]), 0);

  // Rough DOM size: opening tags, minus void-tag noise. Good enough to spot bloat.
  const domElements = (html.match(/<[a-z][a-z0-9-]*[\s>/]/gi) ?? []).length;

  const initialBytes = documentBytes + [...initial.values()].reduce((a, b) => a + b, 0);
  const deferredBytes = [...deferred.values()].reduce((a, b) => a + b, 0);

  return {
    page: relative(DIST, pageFile),
    documentBytes,
    inlineBytes,
    initialBytes,
    totalBytes: initialBytes + deferredBytes,
    requests: initial.size,
    domElements,
    initial,
    deferred,
  };
}

function main() {
  const verbose = process.argv.includes('--verbose');

  if (!existsSync(DIST)) {
    console.error('No dist/ found. Run `npm run build` first.');
    process.exit(1);
  }
  const pages = walk(DIST, (f) => f.endsWith('.html'));
  if (pages.length === 0) {
    console.error('dist/ contains no HTML. The build did not produce any page.');
    process.exit(1);
  }

  const results = pages.map(analyzePage).sort((a, b) => b.initialBytes - a.initialBytes);
  const breaches = [];

  console.log(`\n  ${results.length} page(s), heaviest first. Initial = first visit, gzipped text.\n`);
  console.log(
    '  ' +
      'page'.padEnd(46) +
      'initial'.padStart(10) +
      'total'.padStart(10) +
      'req'.padStart(6) +
      'dom'.padStart(7),
  );
  console.log('  ' + '-'.repeat(79));

  for (const r of results) {
    const over = [];
    if (r.initialBytes > BUDGET.initialBytes) over.push('initial');
    if (r.totalBytes > BUDGET.totalBytes) over.push('total');
    if (r.requests > BUDGET.requests) over.push('requests');
    if (r.domElements > BUDGET.domElements) over.push('dom');
    if (over.length) breaches.push({ page: r.page, over });

    console.log(
      `  ${over.length ? '!' : ' '} ` +
        r.page.padEnd(44) +
        kb(r.initialBytes).padStart(10) +
        kb(r.totalBytes).padStart(10) +
        String(r.requests).padStart(6) +
        String(r.domElements).padStart(7),
    );

    if (verbose) {
      console.log(`      document ${kb(r.documentBytes)} (inline css/js ${kb(r.inlineBytes)} raw)`);
      for (const [path, bytes] of [...r.initial].sort((a, b) => b[1] - a[1]))
        console.log(`      ${kb(bytes).padStart(10)}  ${relative(DIST, path)}`);
      for (const [path, bytes] of [...r.deferred].sort((a, b) => b[1] - a[1]))
        console.log(`      ${kb(bytes).padStart(10)}  ${relative(DIST, path)}  (deferred)`);
    }
  }

  // Fonts are the classic silent regression: declared once, downloaded forever.
  const fontsDir = join(DIST, '_astro/fonts');
  if (existsSync(fontsDir)) {
    const fonts = walk(fontsDir, (f) => /\.(woff2?|ttf|otf)$/i.test(f));
    const total = fonts.reduce((sum, f) => sum + statSync(f).size, 0);
    console.log(`\n  Fonts built: ${fonts.length} file(s), ${kb(total)} on disk.`);
    if (fonts.length > 6)
      console.log(
        '  ! More than 6 font files. Check the weights and styles declared in astro.config.mjs\n' +
          '    against what the CSS actually uses (rule: 3 weights max).',
      );
  }

  console.log('');
  if (breaches.length) {
    for (const b of breaches) console.log(`  ! ${b.page} over budget: ${b.over.join(', ')}`);
    console.log(
      `\n  Budgets: initial ${kb(BUDGET.initialBytes)}, total ${kb(BUDGET.totalBytes)}, ` +
        `${BUDGET.requests} requests, ${BUDGET.domElements} DOM elements.`,
    );
    process.exit(1);
  }
  console.log('  Every page is within budget.');
}

main();
