import rss from '@astrojs/rss';
import { sortedPosts, excerpt } from '../utils/posts';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

/**
 * The feed, at /rss.xml, which is the path BaseHead has been advertising in
 * every page's <head> since the foundation commit.
 *
 * Descriptions come from the same excerpt helper as the listing, so the feed
 * cannot say something different from the site about the same article.
 */
export async function GET(context) {
  const posts = await sortedPosts();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    // French, because the articles are. Readers filter on this.
    customData: '<language>fr-FR</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: excerpt(post),
      // Absolute, from `site`: a feed is read outside the site, where a
      // root-relative path resolves against whatever host is showing it.
      link: new URL(`/${post.data.slug}/`, context.site).href,
      categories: post.data.tags,
    })),
  });
}
