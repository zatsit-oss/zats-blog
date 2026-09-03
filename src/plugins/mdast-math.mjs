/**
 * Renders the maths Sätteri parses. `features.math` turns `$$…$$` into a `math`
 * node, but the pipeline stops at markup: left to itself it emits
 * `<pre><code class="language-math">` holding the LaTeX source, the way
 * remark-math does without a renderer. A reader then sees
 * `$$ \text{WUE} = \frac{…}{…} $$` printed literally, which is what the
 * Docusaurus site fixed with KaTeX and what the migration had lost.
 *
 * **MathML only, and that decides the whole cost.** KaTeX can emit its own
 * span-and-CSS layout (`htmlAndMathml`), which is what nearly every site
 * ships; it needs `katex.css` and the KaTeX web fonts. Measured on the one
 * formula this corpus has: 443 octets of MathML against 1 908 octets plus that
 * stylesheet and those fonts. MathML Core is native in every current browser,
 * so the heavy path buys nothing here but weight, on a blog whose subject is
 * weight. KaTeX is therefore a build-time dependency and ships nothing: no
 * script, no stylesheet, no font.
 *
 * **mdast and not hast, for a reason that is not taste.** The obvious place
 * looked like hast, where the formula is already a `code` element. It does not
 * work: the built-in highlight plugin is pushed ahead of every user hast
 * plugin, and its exclusion list is keyed on `code.data.lang`, which a math
 * block does not carry. Shiki therefore claimed the block as `plaintext`,
 * stripped `language-math` and handed on a coloured code listing, so nothing
 * downstream could still tell it was maths. Astro's documented
 * `excludeLangs: ['math']` default never gets a chance to match. At the mdast
 * layer the node is `math` before any of that, and being the semantic layer it
 * is also where "this is an equation" belongs.
 *
 * `rawHtml` rather than hand-built nodes: MathML lives in its own XML
 * namespace, which the AST's property handling does not model, and the string
 * comes from KaTeX over LaTeX we wrote, not from reader input.
 */
import katex from 'katex';
import { defineMdastPlugin } from 'satteri';

/**
 * Returns the MathML for one expression, or `undefined` when KaTeX refuses it.
 * `throwOnError: false` keeps a malformed formula a visible red expression and
 * a build warning rather than a failed deploy: one typo in one article should
 * not take the site down.
 */
function render(node, ctx, displayMode) {
  try {
    return katex.renderToString(node.value, {
      output: 'mathml',
      displayMode,
      throwOnError: false,
      strict: 'warn',
    });
  } catch (error) {
    ctx.report({
      message: `KaTeX a refusé « ${node.value} » : ${error.message}`,
      node,
      severity: 'warning',
    });
    return undefined;
  }
}

export const mdastMath = defineMdastPlugin({
  name: 'zatsit-math',

  math(node, ctx) {
    const html = render(node, ctx, true);
    if (!html) return undefined;

    // A formula has one intrinsic width and no way to reflow: measured at
    // 339px, against a 256px column on a 320px phone, so it overflowed by 83px
    // and pushed the page sideways. It gets the same treatment as a wide table,
    // its own scroll box carrying `tabindex="0"`, since a scroll container
    // holding nothing focusable cannot be reached without a pointer (axe rule
    // `scrollable-region-focusable`). No `role`, no label: naming it would mean
    // inventing a word no author wrote, and the MathML already says what it is.
    //
    // A `div` and not a `span`: block-level raw HTML escapes the paragraph the
    // pipeline otherwise wraps a phrasing replacement in, and KaTeX's output
    // opens on a `span`.
    return { rawHtml: `<div class="math-scroll" tabindex="0">${html}</div>` };
  },

  // Unreachable as configured, `singleDollarTextMath` being off and the corpus
  // having no inline maths. Kept so that turning the feature back on renders
  // rather than printing LaTeX, which is exactly the failure this file exists
  // to fix.
  inlineMath(node, ctx) {
    const html = render(node, ctx, false);
    return html ? { rawHtml: html } : undefined;
  },
});
