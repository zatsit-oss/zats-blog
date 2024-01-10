# Zatsit blog

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

### Build

```
$ npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment on firebase

### Step 1: Install the Firebase CLI

Visit the Firebase CLI documentation to learn how to [install the CLI](https://firebase.google.com/docs/cli#install_the_firebase_cli
) or [update to its latest version](https://firebase.google.com/docs/cli#update-cli).

### Step 2: Login with your Zatsit Google account

```
$ firebase login
```
Your web browser will ask you to fill in the login form.

Now everything is in the firebase.json file, refer you to the [POSTING](.POSTING.md) instructions to deploy it.
