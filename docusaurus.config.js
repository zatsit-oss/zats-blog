// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'zatsit blog',
  tagline: 'Quelque soit votre domaine tech, nous avons forcément un article pour vous',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://blog.zatsit.fr',
  baseUrl: '/',
  organizationName: 'zatsit-oss', // Usually your GitHub org/user name.
  projectName: 'zatsit-blog', // Usually your repo name.
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js'
        }
        ,
        blog: {
          showReadingTime: true,
          blogTitle: 'Blog',
          blogDescription: 'Blog de zatsit, propulsé par Docusaurus',
          postsPerPage: 10,
          //tagsBasePath : '/blog/tags',
          blogSidebarTitle: 'Nos derniers articles',
          blogSidebarCount: 'ALL',
            editUrl: 'https://github.com/zatsit-oss/zats-blog-content/tree/main',
            showLastUpdateTime: true
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/zatsit-social-card.png',
      navbar: {
        title: 'zatsit',
        hideOnScroll: true,
        logo: {
          alt: 'Accueil blog',
          src: 'img/logo-zatsit-style-light.svg',
          srcDark: 'img/logo-zatsit-style-dark.svg',
          height: 32,
          width: 32
        },
        items: [
          {to: '/blog', label: 'Blog', position: 'left', exact: true},
          {to: 'blog/tags', label: 'Catégories', exact: true},
          {to: 'blog/tags/green', label: 'Green', exact: true},
          {to: 'blog/tags/architecture', label: 'Architecture', exact: true},
          {to: 'blog/tags/cloud', label: 'Cloud', exact: true},
          {to: 'blog/tags/data', label: 'Data & AI', exact: true},
          {to: 'blog/tags/general', label: 'Général', exact: true},
          // Future categories, one post is required to display the tem navigation bar, if not, build fail
          /*{
            type: 'dropdown',
            label: 'À venir',
            items: [
              {to: 'blog/tags/dev', label: 'Developpement'},
              {to: 'blog/tags/Eco-conception', label: 'Eco-Conception'},
              {to: 'blog/tags/mobile', label: 'Mobile'},
              {to: 'blog/tags/ops', label: 'OPS'},
              {to: 'blog/tags/web', label: 'Web'},
            ],
          },*/
          {
            label: 'GitHub',
            href: 'https://github.com/zatsit-oss',
            position: 'right',
          },
          {
            label: 'Site web',
            href: 'https://zatsit.fr',
            position: 'right',
          }
        ],
      },
      footer: {
        links: [
          {
            title: 'zatsit',
            items: [
              {
                label: 'Blog statique éco-conçu',
                href: 'https://www.ecoindex.fr/resultat/?id=6ac3f361-a35c-4933-8c09-890046d300f0',
              }
            ],
          },
          {
            title: 'Nous suivre',
            items: [
              {
                label: 'Linkedin',
                href: 'https://www.linkedin.com/company/zatsit/about/',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/zatsit_',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/zatsit-oss',
              }
            ],
          },
          {
            title: 'Autres',
            items: [
              {
                label: 'Site web',
                href: 'https://zatsit.fr',
              },
              {
                label: 'Mentions légales',
                to: '/mentions-legales',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} <b>zatsit</b>, Propulsé par <b><a href="https://docusaurus.io/docs/category/getting-started">Docusaurus</a></b>.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },

    }),
    plugins: [[ require.resolve('docusaurus-lunr-search'), {
      languages: ['fr'], // language codes
      enableHighlight: true
  }]],
};

export default config;
