#!/usr/bin/env node
/**
 * Removes the Pagefind interfaces the site does not use.
 *
 * Pagefind always emits three ready-made UIs alongside the search library, and
 * offers no flag to skip them. We render results ourselves from the low-level
 * API, so those bundles are 400 kB of JavaScript and CSS deployed to the bucket
 * that no page ever references. They cost nothing per visit, which is exactly
 * why they would sit there unnoticed on a site whose subject is not shipping
 * what nobody uses.
 *
 * Deliberately a denylist of known filenames rather than a glob: if Pagefind
 * renames or adds a file, the worst case is that it survives, never that the
 * search breaks because something required was deleted. Missing entries are
 * reported, not fatal.
 */

import { existsSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BUNDLE = join(process.cwd(), 'dist', 'pagefind');

const UNUSED = [
  'pagefind-ui.js',
  'pagefind-ui.css',
  'pagefind-modular-ui.js',
  'pagefind-modular-ui.css',
  'pagefind-component-ui.js',
  'pagefind-component-ui.css',
  // Highlights matches on the destination page. We do not link with the
  // highlight parameter, so nothing loads it.
  'pagefind-highlight.js',
];

if (!existsSync(BUNDLE)) {
  console.error('prune-pagefind: dist/pagefind absent, rien à faire.');
  process.exit(0);
}

let freed = 0;
const missing = [];

for (const name of UNUSED) {
  const path = join(BUNDLE, name);
  if (!existsSync(path)) {
    missing.push(name);
    continue;
  }
  freed += statSync(path).size;
  rmSync(path);
}

console.log(`prune-pagefind: ${(freed / 1024).toFixed(1)} ko d'interfaces inutilisées retirés.`);

if (missing.length > 0) {
  console.warn(
    `prune-pagefind: introuvables, la liste a peut-être vieilli avec Pagefind : ${missing.join(', ')}`,
  );
}
