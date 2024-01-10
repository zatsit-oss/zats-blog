// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Zatsit Blog',
  tagline: 'Zats Crew',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'zatsit', // Usually your GitHub org/user name.
  projectName: 'zatsit-blog', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          //editUrl:
          //  'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        }
        ,
        blog: {
          showReadingTime: true,
          blogTitle: 'Zatsit blog!',
          blogDescription: 'A Docusaurus powered blog!',
          postsPerPage: 5,
          //tagsBasePath : '/blog/tags',
          blogSidebarTitle: 'Nos derniers articles',
          blogSidebarCount: 'ALL',
          
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          //editUrl:
            //'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Zats Blog',
        hideOnScroll: true,
        logo: {
          alt: 'Zatsit logo',
          src: 'img/logo-zatsit-orange.svg',
        },
        items: [
          {to: '/blog', label: 'Accueil', position: 'left'},
          {
            type: 'dropdown',
            to: '/blog/tags',
            label: 'Catégories',
            position: 'left',
            items: [
              {to: 'blog/tags', label: 'Tous les sujets'},
              {to: 'blog/tags/ai', label: 'Intelligence artificielle'},
              {to: 'blog/tags/architecture', label: 'Architecture'},
              {to: 'blog/tags/cloud', label: 'Cloud'},
              {to: 'blog/tags/data', label: 'Data'},
              {to: 'blog', label: 'Et d\'autres bientôt'},
             // Next categories
             // {to: 'blog/tags/dev', label: 'Developpement'},
             // {to: 'blog/tags/general', label: 'Général'},
             // {to: 'blog/tags/Eco-conception', label: 'Eco-Conception'},
             // {to: 'blog/tags/mobile', label: 'Mobile'},
             // {to: 'blog/tags/ops', label: 'OPS'},
             // {to: 'blog/tags/web', label: 'Web'},
            ],
          },
          {
            href: 'https://docusaurus.io/https://github.com/facebook/docusaurus',
            label: 'Built with Docusaurus',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Créé ton Blog avec Docusaurus',
                to: 'https://docusaurus.io/docs/category/getting-started',
              },
            ],
          },
          {
            title: 'Communauté',
            items: [
              {
                label: 'Site web',
                href: 'https://zatsit.fr',
              },
              {
                label: 'Linkedin',
                href: 'https://zatsit.fr',
              },
              {
                label: 'Twitter',
                href: 'https://zatsit.fr',
              },
            ],
          },
          {
            title: 'Autres',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://zatsit.fr',
              },
              {
                label: 'Mentions légales',
                href: '/mentions-legales',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Zatsit, Built with Docusaurus.`,
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
