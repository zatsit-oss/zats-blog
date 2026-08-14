import { visit } from 'unist-util-visit';

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
 * meaning. Runs after remark-directive, which does the parsing.
 *
 * Output is an <aside> with a heading, rather than a bare div: an admonition
 * is a genuine aside from the main flow, and its label carries information a
 * coloured border alone would not give to a screen reader.
 */

const TYPES = {
  note: { label: 'Note', icon: 'ℹ' },
  info: { label: 'Info', icon: 'ℹ' },
  tip: { label: 'Astuce', icon: '✓' },
  warning: { label: 'Attention', icon: '!' },
  caution: { label: 'Attention', icon: '!' },
  danger: { label: 'Danger', icon: '!' },
};

export function remarkAdmonitions() {
  return (tree, file) => {
    visit(tree, 'containerDirective', (node) => {
      const type = TYPES[node.name];
      if (!type) {
        // An unknown :::name is almost always a typo in an article. Warn rather
        // than rendering the raw markers into the page, where nobody notices.
        file.message(`Admonition inconnue « ${node.name} », ignorée.`, node);
        return;
      }

      // remark-directive puts `:::tip[Titre]` in a paragraph flagged as the
      // directive label; anything else is body content.
      const labelNode = node.children.find(
        (child) => child.data?.directiveLabel === true,
      );
      const label =
        labelNode?.children?.map((child) => child.value ?? '').join('') || type.label;
      const body = node.children.filter((child) => child !== labelNode);

      node.type = 'paragraph';
      node.data = {
        hName: 'aside',
        hProperties: {
          class: `admonition admonition--${node.name}`,
          role: 'note',
          'aria-label': label,
        },
      };
      node.children = [
        {
          type: 'paragraph',
          data: {
            hName: 'p',
            hProperties: { class: 'admonition__title' },
          },
          children: [
            {
              type: 'text',
              value: '',
              data: {
                hName: 'span',
                hProperties: { class: 'admonition__icon', 'aria-hidden': 'true' },
                hChildren: [{ type: 'text', value: type.icon }],
              },
            },
            { type: 'text', value: label },
          ],
        },
        ...body,
      ];
    });
  };
}
