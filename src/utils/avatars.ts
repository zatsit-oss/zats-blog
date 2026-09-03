import type { ImageMetadata } from 'astro';

/**
 * Author avatars, read from the content repository in place.
 *
 * They used to exist twice: once in zats-blog-content/authors/img, once copied
 * into this repo's public/img/authors by the Docusaurus sync script. The copies
 * were 3.1 MB of binaries tracked in git, two of them 1.2 MB photographs shown
 * at 64 pixels, and public/ files bypass the image pipeline entirely, so they
 * shipped at full resolution.
 *
 * The glob path has to be a literal for Vite to statically analyse it, which is
 * why CONTENT_REPO is not interpolated here. Keep the two in step.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../../../zats-blog-content/authors/img/*.{webp,jpeg,jpg,png}',
  { eager: true },
);

/** Keyed by author id, matching the keys of authors.yml. */
const byKey = new Map<string, ImageMetadata>(
  Object.entries(files).map(([path, module]) => [
    path.split('/').pop()!.replace(/\.[^.]+$/, ''),
    module.default,
  ]),
);

/**
 * Returns the avatar for an author key, or undefined when there is none.
 * Undefined is a normal case, not an error: authors.yml allows a profile with
 * no picture, and the layouts skip the image rather than showing a gap.
 */
export function avatarFor(key: string): ImageMetadata | undefined {
  return byKey.get(key);
}
