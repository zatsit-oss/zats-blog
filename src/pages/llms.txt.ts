/**
 * `llms.txt`, at the site root.
 *
 * A route rather than a file in `public/`, and that is the whole point: a
 * hand-written list of articles is wrong the day after the next publication.
 * This one is built from the collection, like the RSS feed beside it.
 *
 * A proposal, not a standard: no major provider has committed to reading it, so
 * this is a low-cost bet rather than a requirement, and removing it would cost
 * nothing.
 *
 * The format is Markdown by convention: a title, a summary, then sections of
 * links. Kept factual, with no adjective a machine would have to weigh.
 */
import type { APIRoute } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { allCategories, allTags, sortedPosts } from '../utils/posts';
import { authorProfiles } from '../utils/authors';

export const GET: APIRoute = async ({ site }) => {
  const base = site!;
  const url = (path: string) => new URL(path, base).href;

  const posts = await sortedPosts();
  const categories = await allCategories(posts);
  const tags = await allTags(posts);
  const authors = await authorProfiles(posts);

  const lignes: string[] = [];
  const w = (line = '') => lignes.push(line);

  w(`# ${SITE_TITLE} — le blog tech`);
  w();
  w(`> ${SITE_DESCRIPTION}. ${posts.length} articles écrits par ${authors.length} consultantes et consultants de zatsit, en français, sur l'architecture, le cloud, la donnée, l'IA et l'éco-conception.`);
  w();
  w(
    'Site statique, sans traceur ni cookie. Le contenu est en Markdown dans un dépôt public, ' +
      'et chaque page est lisible sans exécuter de JavaScript.',
  );
  w();

  w('## Articles');
  w();
  for (const post of posts) {
    const date = post.data.date ? post.data.date.toISOString().slice(0, 10) : 'sans date';
    const resume = post.data.description ?? post.data.shareText ?? '';
    w(`- [${post.data.title}](${url(`/${post.data.slug}/`)}) — ${date}${resume ? `. ${resume}` : ''}`);
  }
  w();

  w('## Catégories');
  w();
  for (const { slug, label, count } of categories) {
    w(`- [${label}](${url(`/categories/${slug}/`)}) — ${count} article${count > 1 ? 's' : ''}`);
  }
  w();

  w('## Autrices et auteurs');
  w();
  for (const author of authors) {
    const titre = author.title ? `, ${author.title}` : '';
    w(`- [${author.name}](${author.href ? url(author.href) : ''})${titre} — ${author.posts.length} article${author.posts.length > 1 ? 's' : ''}`);
  }
  w();

  w('## Tags');
  w();
  w(tags.map(({ tag }) => `[${tag}](${url(`/tags/${tag}/`)})`).join(', '));
  w();

  w('## Pages de référence');
  w();
  w(`- [Éco-conception de ce blog](${url('/blog-conception/')}) — comment le site est construit, et ce qu'une page coûte, mesuré`);
  w(`- [Nos audits d'éco-conception](${url('/audits/')}) — le blog évalué contre les 119 règles du collectif Green IT et les 71 lignes directrices du W3C`);
  w(`- [Accessibilité](${url('/a11y/')}) — état des vérifications, audit humain à venir`);
  w(`- [Archive](${url('/archive/')}) — tous les articles par date`);
  w(`- [Flux RSS](${url('/rss.xml')})`);
  w();

  // Named to make the staleness visible: a list of articles that says nothing
  // about when it was written is worse than no list.
  w(`Généré le ${new Date().toISOString().slice(0, 10)} à la construction du site.`);
  w();

  return new Response(lignes.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
