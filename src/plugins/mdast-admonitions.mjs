/**
 * Turns the Docusaurus admonition syntax into markup we style ourselves.
 *
 *   :::tip
 *   Contenu.
 *   :::
 *
 *   :::warning[Titre choisi]
 *   Contenu.
 *   :::
 *
 * Docusaurus rendered these natively; Astro does not, and the corpus already
 * uses them, so the syntax has to keep working or published articles change
 * meaning.
 *
 * Written as a Sätteri mdast plugin rather than a remark one. Sätteri is the
 * default Markdown processor in Astro 7 and parses directives itself once
 * `features.directive` is on, so remark-directive and the whole unified
 * processor are not needed here.
 *
 * Output is an <aside> with a visible label, not a bare coloured div: an
 * admonition really is an aside from the main flow, and the label carries
 * information the border colour alone would not give to a screen reader.
 */

const TYPES = {
  note: { label: 'Note', icon: 'i' },
  info: { label: 'Info', icon: 'i' },
  tip: { label: 'Astuce', icon: '✓' },
  warning: { label: 'Attention', icon: '!' },
  caution: { label: 'Attention', icon: '!' },
  danger: { label: 'Danger', icon: '!' },
};

/** The label comes from article text, so it is escaped before reaching rawHtml. */
const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );

export const mdastAdmonitions = {
  name: 'zatsit-admonitions',

  containerDirective(node, ctx) {
    const type = TYPES[node.name];

    if (!type) {
      // An unknown :::name is almost always a typo in an article. Left alone it
      // renders as an empty div and nobody notices, so say so at build time.
      console.warn(
        `[admonitions] type inconnu « ${node.name} »${
          ctx.fileURL ? ` dans ${ctx.fileURL.pathname}` : ''
        }, bloc ignoré.`,
      );
      return;
    }

    // `:::tip[Titre]` puts the title in a child flagged as the directive label.
    const children = node.children ?? [];
    const labelNode = children.find((child) => child.data?.directiveLabel === true);
    const label = labelNode ? ctx.textContent(labelNode) : type.label;

    if (labelNode) ctx.removeNode(labelNode);

    ctx.setProperty(node, 'data', {
      hName: 'aside',
      hProperties: {
        class: `admonition admonition--${node.name}`,
        role: 'note',
        'aria-label': label,
      },
    });

    // Raw HTML rather than a declarative node tree. Sätteri offers rawHtml as
    // an explicit escape hatch for inserted content, and it keeps the title
    // markup in one readable place instead of four nested node literals.
    ctx.prependChild(node, {
      rawHtml:
        `<p class="admonition__title">` +
        `<span class="admonition__icon" aria-hidden="true">${escapeHtml(type.icon)}</span>` +
        `${escapeHtml(label)}</p>`,
    });
  },
};
