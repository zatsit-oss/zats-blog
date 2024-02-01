# Posting in Zatsit Blog

> Remember that the official documentation of docusaurus is the reference.

Docusaurus proposes file conventions to make blog posts, but we added a top level folder hierarchy to categorize posts (and change the way we name file blog post) :

- [ai](blog%2Fai)
- [architecture](blog%2Farchitecture)
- [cloud](blog%2Fcloud)
- [data](blog%2Fdata)
- [dev](blog%2Fdev)
- [general](blog%2Fgeneral)
- [green](blog%2Fgreen)
- [mobile](blog%2Fmobile)
- [ops](blog%2Fops)
- [web](blog%2Fweb)

> If you think you need a new category, please contact [DT](mailto:dirtech@zatsit.fr).

> If you think your post belongs to more than one category, choose the main one to create it. 
> Don't worry, tags in your post will help Docusaurus to index it. 

## Create a post for the first time

First of all, pull the project repository and create a branch like "category-YYYYMMDD-SLUG"
> SLUG will be your future URI

```sh
git clone xxxxx
git branch category-YYYYMMDD-MyTitle
git checkout category-YYYYMMDD-MyTitle
```
You are ready to write !

Below the 'blog' folder we will find [authors.yml](./authors.yml), you will have to create your author's information bloc : 

The first entry follow the same convention in all other Zatsit software usage : 
- everything in lowercase
- first letter of your first name
- your name

This value will be used in your post metadata.

```yml
jdoe:
  name: John Doe
  title: Site Reliability Engineer  @ Zatsit
  url: Github account or Linkedin account
  image_url: Could be an external permanent link to your profile picture
```

Then in your category folder create a folder like : YYYYMMDD-SLUG, where SLUG will be use by 
Docusaurus router (in fact, it the 'slug' property in your post that router will use, 
but by convention we use it in the folder naming).


```sh
cd blog
cd category
mkdir YYYYMMDD-SLUG
touch index.md
vim index.md (it is a joke)
```
Then with your favourite IDE, you can edit your index.md file following this example

```md
---
slug: zatsit-blog
title: Zatsit blog introduction
authors: [jdoe]
tags: 
  - "architecture"
  - "web"
---
```

After this section you have few lines to sum up your post, it will be used in list page.
For example : 

```md
---

Présentation de RedPanda, au travers du premier cours dédié aux développeurs de la "RedPanda University".

<!-- truncate -->
```
will result like this : 
![Screenshot of the sumup in page list](./readme/posting-post-sumup.png "Screenshot of the sumup in page list")

Then you can follow [this guide](https://www.markdownguide.org/basic-syntax/) to format your post if you are not markdown fluent.

All your pictures for your post have to be stored in your post folder, feel free to create subfolders if you want.

> Do not forget alternative test for accessibility.

> Do not forget to credit your pictures according to the licence of the picture.

## Add social media link

In this version, the minimalist solution found to add link to share on X and Linkedin is to copy/paste this two lines, customizing the query attribute, for example : 
```
[![Partage Linkedin](../../../static/img/icon-linkedin.webp)](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fzatsit-blog.web.app%2Fblog%2Fredpanda-introduction%2F)
[![Partage Linkedin](../../../static/img/icon-x.webp)](https://twitter.com/intent/tweet?text=Pr%C3%A9sentation%20de%20RedPanda%2C%20au%20travers%20du%20premier%20cours%20d%C3%A9di%C3%A9%20aux%20d%C3%A9veloppeurs%20de%20la%20%22RedPanda%20University%22%20que%20j%27ai%20suivi%2C%0Aje%20vous%20pr%C3%A9sente%20les%20grands%20principes%20et%20les%20premiers%20pas%20dans%20cet%20%C3%A9cosyst%C3%A8me&url=https%3A%2F%2Fzatsit-blog.web.app%2Fblog%2Fredpanda-introduction%2F)

```
Take care of the relative path of the two social icons, regarding the folders in the category.
- For Likedin and Twitter (X) : the url of your post use the root of the blog and your slug. You have to encode your url (you can use [URL Encoder](https://www.urlencoder.org/)
- For Twitter (X) only : encode the description of your post too.

Linkedin 

## Visualise the blog

In edit mode, you should start Docusaurus server like this : 

```sh
npm start

> zats-blog@0.0.0 start
> docusaurus start

[INFO] Starting the development server...
[SUCCESS] Docusaurus website is running at: http://localhost:3000/

✔ Client
  Compiled successfully in 852.07ms

client (webpack 5.89.0) compiled successfully
```

By default, the blog is accessible to http://localhost:3000/ , the hot reload will refresh pages after each edition.

## Build the blog

Simply execute a **npm run build**

```sh 
npm run build

> zats-blog@0.0.0 build
> docusaurus build

[INFO] [fr] Creating an optimized production build...

✔ Client

✔ Server
  Compiled successfully in 2.78s

✔ Client

● Server █████████████████████████ cache (99%) shutdown IdleFileCachePlugin
 stored

[SUCCESS] Generated static files in "build".
[INFO] Use `npm run serve` command to test your build locally.
```

The static resources are located in the build directory.

## Publish the blog in dev mode

You can use the zatsit blog firebase project and execute a : 

```sh
firebase deploy
```

