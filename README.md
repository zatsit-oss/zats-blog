# zatsit blog

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ npm install
```

### Local Development

```
$ npm run
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

#### Fetch zatsit blog content

The **zatsit** blog content is hosted on a separated repository to facilitate the contribution. To fetch the content, you have to run the following command :

- Clone [the repository](https://github.com/zatsit-oss/zats-blog-content) on your workspace
- Copy the `zats-blog-content/blog` folder to the `blog` folder
- Copy the `zats-blog-content/authors/authors.yml` to the `blog` folder

```
cp -r  ../zats-blog-content/docs/* docs 
cp -r  ../zats-blog-content/blog/* blog 
cp -r  ../zats-blog-content/authors/authors.yml blog
cp -R ../zats-blog-content/authors/img/* static/img/authors
```

### Build

```
$ npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment on firebase

### Step 1: Install the Firebase CLI

Visit the Firebase CLI documentation to learn how to [install the CLI](https://firebase.google.com/docs/cli#install_the_firebase_cli
) or [update to its latest version](https://firebase.google.com/docs/cli#update-cli).

### Step 2: Login with your zatsit Google account

```
$ firebase login
```
Your web browser will ask you to fill in the login form.

Then you will deploy the blog with :

```
$ firebase deploy
```
