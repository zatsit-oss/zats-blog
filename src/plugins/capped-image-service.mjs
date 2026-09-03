/**
 * The Sharp service with one rule added: an image whose size nobody declared is
 * never emitted wider than the reading column can use, and it is offered at
 * several widths so a phone stops downloading a desktop file.
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
 *
 * ## Why this file also rewrites `widths` and `sizes`
 *
 * `image.layout: 'constrained'` in astro.config.mjs is what produces the
 * srcset. On its own it is worse than no srcset at all here, because Astro
 * derives both the candidate list and the `sizes` attribute from the declared
 * width, and for a Markdown image the declared width *is the source's*:
 *
 *   - `sizes` came out as `(min-width: 7086px) 7086px, 100vw`, so a 1600px
 *     window resolved it to 1600px and the browser picked the 3218w candidate
 *     for an image it lays out at 779px. Measured in Chrome, not deduced.
 *   - the candidate list ended at 7086w, which is the cap below defeated.
 *
 * Both are computed in Astro's internal.js *before* `validateOptions` runs
 * (`resolvedOptions.widths ||= getWidths(...)`, then `sizes ||= ...`), so
 * capping the width alone arrives too late to change either. They are plain
 * properties on the options object this function receives, so it brings them
 * back in line with the width it just capped.
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

/**
 * What an article image actually occupies, measured in Chrome across the whole
 * corpus rather than read off the stylesheet:
 *
 *   >= 1100px : 779px in the body, 865px in the lead paragraph
 *    768-1099 : 651px, the text column
 *      < 768  : 82% to 91% of the viewport, the article's side padding
 *
 * 1100px is the breakpoint in BlogPost.astro; if that stylesheet moves, this
 * attribute starts lying and the browser goes back to guessing from 100vw.
 *
 * 865 and not 779 at the top, even though most images are 779: the escape width
 * is expressed in `ch`, so the lead paragraph's larger font stretches it, and
 * three articles put an image there. `sizes` is one string for every image and
 * this file cannot tell which paragraph an image landed in, so it declares the
 * larger of the two. Under-declaring would ship a knowingly soft image on those
 * three; over-declaring by 11% costs one rung, and there is a breakpoint at 880
 * so that rung is 880 and not 1080.
 *
 * The last stop is 92vw and not 100vw for the same reason in reverse: it covers
 * the widest measured case without ever under-serving, where 100vw over-declares
 * by up to a fifth and can cost a whole rung.
 */
const ARTICLE_SIZES = '(min-width: 1100px) 865px, (min-width: 768px) 651px, 92vw';

export default {
  ...sharpService,

  validateOptions(options, config) {
    const validated = sharpService.validateOptions(options, config);

    // A call that asks for a quality keeps it; nothing does today.
    validated.quality ??= DEFAULT_QUALITY;

    // Not `typeof === 'object'`: an imported SVG arrives as an Astro component
    // factory, so it is a *function* carrying `width`, `height` and `format` as
    // properties. Testing for an object alone missed every SVG on the site and
    // left the `format === 'svg'` branch below unreachable.
    const src = validated.src;
    const source = src && (typeof src === 'object' || typeof src === 'function') ? src : undefined;

    // SVG is passed through untransformed, so capping it would only produce
    // attributes that lie about the file. It gets no srcset either: `layout`
    // asked for one candidate per breakpoint, and since nothing is re-encoded
    // those came out as seven byte-identical copies of the same 23 kB file,
    // 140 kB of duplicates in dist for a format that scales on its own.
    if (source?.format === 'svg') {
      delete validated.widths;
      delete validated.sizes;
      return validated;
    }

    if (!source?.width) return validated;

    // Only images nobody sized. Astro fills width and height from the source
    // when the call declares neither, so a width still equal to the source's
    // own was inferred rather than asked for; an explicit `width={1920}` on an
    // <Image> passes through untouched, its own `sizes` included: a component
    // that states its width knows better than this file does.
    const undeclared = validated.width === source.width;
    if (!undeclared) return validated;

    // Every undeclared image is an article image, and they all lay out
    // identically, so they all describe themselves the same way. This runs even
    // when the image is too small to need capping: a 1050px source was
    // announcing `(min-width: 1050px) 1050px`, which is just as wrong.
    validated.sizes = ARTICLE_SIZES;

    if (source.width > MAX_UNDECLARED_WIDTH) {
      validated.width = MAX_UNDECLARED_WIDTH;
      validated.height = Math.round(source.height * (MAX_UNDECLARED_WIDTH / source.width));
    }

    if (Array.isArray(validated.widths)) {
      // Astro's own getSrcSet appends the source width back when the list
      // overshoots it, so the list has to stop at or below the cap rather than
      // merely avoid naming anything larger.
      const ceiling = Math.min(MAX_UNDECLARED_WIDTH, source.width);
      const kept = new Set(validated.widths.filter((width) => width <= ceiling));
      kept.add(validated.width);
      validated.widths = [...kept].sort((a, b) => a - b);
    }

    return validated;
  },
};
