/**
 * Wraps every article table in a focusable box, so a table wider than the
 * column can be scrolled with the keyboard.
 *
 * The defect this fixes, found by axe-core on /ia-et-consommation-energetique/:
 * `.post__body table` carries `overflow-x: auto`, which makes the table itself
 * the scroll container. A scroll container that holds nothing focusable cannot
 * be reached without a pointer, so the right-hand columns of three tables were
 * unreachable for a keyboard user. Rule `scrollable-region-focusable`.
 *
 * Code blocks escape the same fate by accident rather than by design: CodeCopy
 * injects a button into every `<pre>`, which gives the region focusable
 * content. They are left alone here: that button positions itself against the
 * `pre`, and wrapping it would move the ground under it.
 *
 * A hast plugin and not an mdast one: a table is a table in mdast too, but the
 * wrapper is presentational, and `wrapNode` on the hast tree keeps the change
 * where the markup is decided rather than where the document means something.
 *
 * `tabindex="0"` alone, with no `role="region"`: a region with no accessible
 * name adds nothing for a screen reader, and naming it would mean inventing a
 * label ("Tableau") that no author wrote. Keyboard access is the defect; the
 * table's own semantics already say what it is.
 */
import { defineHastPlugin } from 'satteri';

export const hastTableScroll = defineHastPlugin({
  name: 'zatsit-table-scroll',

  element: {
    filter: ['table'],

    visit(node, ctx) {
      ctx.wrapNode(node, {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'], tabIndex: 0 },
        children: [],
      });
    },
  },
});
