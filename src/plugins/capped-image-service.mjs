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
 * 72 rather than Sharp's default 80. Measured on the eight heaviest images of
 * the site, at the size actually served: 1312 kB becomes 1063 kB, 19% off.
 *
 * The fidelity cost, measured as PSNR against the source rather than eyeballed:
 * photographs drop from 35.6 dB to 33.7, screenshots and diagrams from 43.4 to
 * 41.8. So 1.9 dB at worst, and the text-heavy images, the ones a lossy encoder
 * degrades first, stay above 40 dB. Raise it back to 80 if a photograph ever
 * looks soft in a published article.
 *
 * It is set here, per image, and not through the service's encoder config,
 * because `quality` is one of the properties Astro hashes to name a generated
 * file. Configured on the service it would change no hash, so every image
 * already in `node_modules/.astro/assets` would be served from the cache at its
 * old quality and the setting would look like it did nothing.
 */
const DEFAULT_QUALITY = 72;

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

    // A call that asks for a quality keeps it; nothing does today.
    validated.quality ??= DEFAULT_QUALITY;

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
