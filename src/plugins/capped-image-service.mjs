/**
 * The Sharp service with one rule added: an image whose size nobody declared
 * is never emitted wider than the reading column can use.
 *
 * `astro:assets` re-encodes every content image but only resizes when it knows
 * the target dimensions. Article images come from plain Markdown, which has no
 * syntax for a width, so Astro fell back to the source's own size and shipped
 * conference photos at 7008px: two articles were over the page-weight budget by
 * several megabytes for pictures displayed in a 683px column.
 *
 * The cap is applied here rather than in a Markdown plugin because this is the
 * one place that already knows the source's intrinsic size. A plugin would have
 * to open every file itself, and it would only cover Markdown.
 */
import sharpService from 'astro/assets/services/sharp';

/**
 * Measured in Chrome, not guessed: an article image lays out at 779px on a wide
 * screen, where it is allowed past the 651px text column, and at 865px inside
 * the lead paragraph, whose larger font stretches the `ch` the escape width is
 * expressed in. 1366 therefore serves a high-density screen at 1.75x rather
 * than a full 2x, which is a deliberate trade: 1558 would put the two
 * conference articles back over the total page-weight budget, and the budget is
 * the promise this blog makes in writing.
 *
 * Nothing on the site is displayed wider than an article image.
 */
const MAX_UNDECLARED_WIDTH = 1366;

export default {
  ...sharpService,

  validateOptions(options, config) {
    const validated = sharpService.validateOptions(options, config);
    const source = typeof validated.src === 'object' ? validated.src : undefined;

    // SVG is passed through untransformed, so capping it would only produce
    // attributes that lie about the file.
    if (!source?.width || source.format === 'svg') return validated;

    // Only images nobody sized. Astro fills width and height from the source
    // when the call declares neither, so a width still equal to the source's
    // own was inferred rather than asked for; an explicit `width={1920}` on an
    // <Image> passes through untouched.
    const undeclared = validated.width === source.width;
    if (!undeclared || source.width <= MAX_UNDECLARED_WIDTH) return validated;

    validated.width = MAX_UNDECLARED_WIDTH;
    validated.height = Math.round(source.height * (MAX_UNDECLARED_WIDTH / source.width));
    return validated;
  },
};
