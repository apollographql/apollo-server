---
title: Deploying with Zeit Now
sidebar_title: Now
description: Deploying your GraphQL server to Zeit Now
---

`now` is a service by Zeit that allows you to deploy an instance of Apollo Server and have a functional GraphQL endpoint. `now` supports three types of deployments for web apps: `static`, `node.js`, and `Docker`. We'll focus on the Node.js deployment for this guide.

## Node.js Deployment

Deployment to `now` for node apps simply requires a `package.json` file to be present in your app directory. Your server directory has a `package.json` file.

```js
{
  "name": "graphqlservice",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "apollo-engine": "^1.1.2",
    "apollo-server": "^2.0.0-rc.5",
    "graphql": "^0.13.2"
  }
}
```

### Deploy server to Now

Install the [now cli](https://zeit.co/download#now-cli), then visit your server directory and run the `now` command:

```sh
$ now
```

The `now` command immediately deploys your server to the cloud and returns the hosted project link. Send a query to your GraphQL server on `now` at `<NOW_APP_NAME>.now.sh`.

### Deploying directly from GitHub

If you have your GraphQL server published to GitHub, `now` provides the ability to deploy straight from GitHub to the cloud.

Assuming you'd like to deploy an instance of [unicodeveloper](https://github.com/unicodeveloper)'s [graphql-server](https://github.com/unicodeveloper/graphql-server), this is what you'll do:

```sh
$ now unicodeveloper/graphql-server
```

The `graphql-server` in this example is connected to Apollo Engine and requires an API key for it to send reports to Engine. You can pass in environment variables such as `ENGINE_API_KEY` like so:

```sh
$ now -e ENGINE_API_KEY=xxxxxxxxx unicodeveloper/graphql-server
```

<div style="text-align:center">
![Deployed GraphQL Server](../images/deployment/zeit/zeit-apollo-server.png)
<br></br>
</div>