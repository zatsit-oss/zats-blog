/**
 * Runs axe-core over every page of dist/, in both themes and at two widths.
 *
 *   npm run check:axe                 desktop then mobile, every page
 *   npm run check:axe -- --mobile     390px only
 *   npm run check:axe -- --desktop    1440px only
 *   npm run check:axe -- /categories/ one page, both widths
 *
 * ## Why this exists as a script rather than as a recipe
 *
 * `check:a11y` measures the colour tokens and `check:eco` the page weight;
 * neither sees ARIA, roles, names, focus order or target size. axe does, and it
 * is the same engine as the DevTools extension, so a clean result here is a
 * clean result in the reader's browser.
 *
 * It sweeps *every* page because the templates are not where the violations
 * are. Ten passes on the home page, the categories and the authors came back
 * clean on 28 August while three rules were failing inside articles: an
 * admonition title below AA, table-of-contents links a pixel under the target
 * minimum, and tables that scrolled without keyboard access. An article brings
 * admonitions, deep headings, wide tables and images; a template brings none.
 *
 * ## Three things it does not leave to chance
 *
 * It serves `dist/` itself, on a port of its own, rather than trusting whatever
 * `astro preview` happens to be holding: the point is to audit the build that
 * was just produced, and a stale daemon would quietly audit the previous one.
 *
 * It forces a frame after every navigation and after every theme change.
 * Headless Chrome paints nothing unless asked, so a colour read before a frame
 * is the colour of the state the page is leaving, which once produced 42
 * contrast violations that did not exist.
 *
 * It asks for `target-size` by name. That rule is experimental in axe and does
 * not run in the default set, and it is the one that caught the 23px links.
 */
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { extname, join, resolve } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const AXE = join(ROOT, 'node_modules/axe-core/axe.min.js');

const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
};

const args = process.argv.slice(2);
const only = args.filter((a) => a.startsWith('/'));
const widths = args.includes('--mobile')
  ? ['mobile']
  : args.includes('--desktop')
    ? ['desktop']
    : ['desktop', 'mobile'];

if (!existsSync(DIST)) {
  console.error('dist/ absent. Lancer `npm run build` avant `npm run check:axe`.');
  process.exit(1);
}
if (!existsSync(AXE)) {
  console.error('axe-core absent. Lancer `npm ci`.');
  process.exit(1);
}
if (!existsSync(CHROME)) {
  console.error(`Chrome introuvable à ${CHROME}. Renseigner CHROME_PATH.`);
  process.exit(1);
}

/** Every route the build produced, read from the filesystem rather than listed. */
function routes(dir, prefix = '') {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (['_astro', 'pagefind', 'img', 'fonts'].includes(entry)) continue;
      out.push(...routes(full, `${prefix}/${entry}`));
    } else if (entry === 'index.html') {
      out.push(`${prefix}/`);
    } else if (entry === '404.html') {
      out.push('/404.html');
    }
  }
  return out;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

function serveDist() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const candidates = [join(DIST, path), join(DIST, path, 'index.html')];
    const file = candidates.find((c) => existsSync(c) && statSync(c).isFile());

    if (!file) {
      res.writeHead(404, { 'Content-Type': MIME['.html'] });
      res.end(existsSync(join(DIST, '404.html')) ? readFileSync(join(DIST, '404.html')) : 'Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });

  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

/** Minimal CDP client: one page target, request/response by id. */
async function connect(port) {
  let list;
  for (let i = 0; i < 60; i++) {
    try {
      list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      if (list.some((t) => t.type === 'page')) break;
    } catch {
      // Chrome is still starting.
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  const target = list?.find((t) => t.type === 'page');
  if (!target) throw new Error('Chrome n’a pas ouvert de page.');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok, ko) => {
    ws.onopen = ok;
    ws.onerror = ko;
  });

  let id = 0;
  const pending = new Map();
  const consoleErrors = [];
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      consoleErrors.push(message.params.args.map((a) => a.value ?? a.description).join(' '));
    }
    if (message.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(message.params.exceptionDetails.text);
    }
  };

  const send = (method, params = {}) => {
    const messageId = ++id;
    ws.send(JSON.stringify({ id: messageId, method, params }));
    return new Promise((ok) => pending.set(messageId, ok));
  };

  return { ws, send, consoleErrors };
}

const server = await serveDist();
const base = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(join(tmpdir(), 'axe-sweep-'));
const debugPort = 9222 + Math.floor(Math.random() * 400);

const chrome = spawn(
  CHROME,
  [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const pages = (only.length ? only : routes(DIST)).sort();
const findings = [];
const overflows = [];
const undetermined = new Map();

const { ws, send, consoleErrors } = await connect(debugPort);

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  return res.result?.result?.value;
}

/** Headless produces no frame unless asked, and an unpainted state measures wrong. */
const paint = () => send('Page.captureScreenshot', { format: 'png' });

async function goto(url) {
  await send('Page.navigate', { url });
  for (let i = 0; i < 80; i++) {
    if ((await evaluate('document.readyState')) === 'complete') break;
    await new Promise((r) => setTimeout(r, 80));
  }
  await paint();
}

const axeSource = readFileSync(AXE, 'utf8');

await send('Page.enable');
await send('Runtime.enable');

console.log(`${pages.length} page(s), ${widths.join(' et ')}, deux thèmes chacune.\n`);

for (const width of widths) {
  await send('Emulation.setDeviceMetricsOverride', VIEWPORTS[width]);

  for (const theme of ['light', 'dark']) {
    await goto(`${base}/`);
    await evaluate(`localStorage.setItem('theme', '${theme}'); true`);

    for (const path of pages) {
      await goto(`${base}${path}`);

      // A redirect stub carries none of our markup: nothing to audit.
      if ((await evaluate('document.documentElement.dataset.theme')) !== theme) continue;

      const overflow = await evaluate(`
        (() => { const d = document.documentElement;
          return d.scrollWidth > innerWidth + 1 ? d.scrollWidth + ' > ' + innerWidth : ''; })()
      `);
      if (overflow) {
        overflows.push({ width, theme, path, overflow });
        console.log(`  ${width} ${theme}  ${path}  DÉBORDEMENT ${overflow}`);
      }

      await evaluate(`${axeSource}; true`);
      const result = JSON.parse(
        await evaluate(`
          axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
            rules: { 'target-size': { enabled: true } },
          }).then(r => JSON.stringify({
            v: r.violations.map(x => ({ id: x.id, impact: x.impact, help: x.help,
              nodes: x.nodes.map(n => n.target.join(' ')).slice(0, 4) })),
            i: r.incomplete.map(x => x.id),
          }))
        `),
      );

      for (const violation of result.v) findings.push({ width, theme, path, ...violation });
      for (const rule of result.i) undetermined.set(rule, (undetermined.get(rule) ?? 0) + 1);

      if (result.v.length) {
        console.log(
          `  ${width} ${theme}  ${path}  ${result.v.length} violation(s) : ${result.v.map((v) => v.id).join(', ')}`,
        );
      }
    }
  }
}

ws.close();
chrome.kill();
server.close();
await rm(profile, { recursive: true, force: true });

console.log('\n================ RÉSULTAT ================\n');

if (findings.length === 0 && overflows.length === 0) {
  console.log(`Aucune violation sur ${pages.length} page(s), ${widths.join(' et ')}, deux thèmes.`);
} else {
  const byRule = new Map();
  for (const finding of findings) {
    if (!byRule.has(finding.id)) byRule.set(finding.id, []);
    byRule.get(finding.id).push(finding);
  }
  for (const [rule, list] of byRule) {
    console.log(`${rule} (${list[0].impact}) — ${list.length} occurrence(s) : ${list[0].help}`);
    console.log(`  pages  : ${[...new Set(list.map((f) => f.path))].slice(0, 8).join(' ')}`);
    console.log(`  cibles : ${[...new Set(list.flatMap((f) => f.nodes))].slice(0, 6).join(' | ')}\n`);
  }
  for (const o of overflows) {
    console.log(`débordement horizontal : ${o.path} en ${o.width} ${o.theme}, ${o.overflow}`);
  }
}

// Undetermined is not a failure: axe declines to compute contrast through a
// translucent stack, which --color-surface is in the dark theme. `check:a11y`
// composites those layers and measures them.
console.log(
  `\nÀ confirmer à la main : ${[...undetermined].map(([rule, n]) => `${rule} × ${n}`).join(', ') || 'rien'}`,
);
console.log(`Erreurs console : ${consoleErrors.length ? [...new Set(consoleErrors)].join(' | ') : 'aucune'}`);

process.exit(findings.length || overflows.length ? 1 : 0);
