---
title: Deploying with Heroku
sidebar_title: Heroku
description: Get started with deploying your GraphQL server to Heroku
---

Heroku is a common platform as a service solution that allows users to deploy Apollo Servers and have a functioning GraphQL endpoint running in a matter of minutes.

## Prerequisites

The following must be done before following this guide:

- [Set up an Apollo Server](/getting-started)
- [Set up a Heroku account](https://heroku.com)

In addition, if you would like to [push to Heroku manually](/deployment/heroku/#deploying-with-git) through the command line:
- [Install the Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

> Keep in mind that Heroku operations that will be covered in this document
> can also be done through the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).
> Refer to the [Heroku CLI documentation](https://devcenter.heroku.com/categories/command-line)
> for more detailed help.
## Set up a new Heroku application

First, create a new application through the [Heroku dashboard](https://dashboard.heroku.com/apps) by clicking on the **"Create new app"** button on the top right.

![Create New App Screenshot](../images/deployment/heroku/create-new-app.png)

Choose a name your app (this will be your `<HEROKU_APP_NAME>`) and click the **"Create app"** button.

![Set App Name Screenshot](../images/deployment/heroku/set-app-name.png)

## Setting up the project

For Heroku, projects can be set up using any of the [Apollo Server HTTP variants](/integrations/middleware) (i.e. Express, Hapi).

### Manually setting the port

When deploying to Heroku, we cannot specify a specific port, and must therefore manually set the port as the `$PORT` variable set by Heroku.

The Apollo Server must be configured to bind to the value stored in `process.env.PORT` to avoid errors (such as request timeout). To configure `apollo-server` to use a port defined by Heroku at runtime, the `listen` function in your setup file can be called with a port defined by the `PORT` environment variable:

```js
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`
    🚀  Server is ready at ${url}
    📭  Query at https://studio.apollographql.com/dev
  `);
});
```

### Adding a Procfile

Heroku apps by default look for a [Procfile](https://devcenter.heroku.com/articles/procfile) in the root directory that contains commands run by the app on startup. For your Apollo Server, this file should at least contain:

```shell:title=Procfile
web: node index.js
```

`node index.js` should be replaced with whichever command is used to start your Apollo Server instance.

> **Procfiles** are not absolutely necessary to run your Apollo Server through Heroku.
> However, in the absence of a **Procfile**, Heroku will run a `start script` which should defined
> in your `package.json`. Otherwise, you will run into errors.

## Deploying the project

There are a couple ways to push projects to Heroku:
- manually with [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- automatically through GitHub integration

### Deploying with Git

Again, make sure you have [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed. Then, log into your Heroku CLI through your terminal.

```shell
$ heroku login
```

After you have successfully logged in, navigate to the **root directory of your project** and run:

```shell
$ git init # existing git repositories can skip this
$ heroku git:remote -a <HEROKU_APP_NAME>

$ git add .
$ git commit -m "initial apollo server deployment"
$ git push heroku # specify your branch name, if necessary
```

Now you're Apollo Server is up and running!
Send a query to your GraphQL service at your Heroku application at **<HEROKU\_APP\_NAME>.herokuapp.com**

Some things to note:
- `git push heroku` does not push to your git repository. You must run `git push` again separately.
- By default, Heroku sets the `NODE_ENV` variable to `production`. If you wish to change this, run this command in your project directory:
  ```shell
  $ heroku config:set NODE_ENV=development
  ```
  or alternatively, you can [configure environment variables](/deployment/heroku/#configuring-environment-variables) through the Heroku dashboard.
- Reminder that the [GraphQL playground](/testing/graphql-playground) is disabled when the Apollo Server is in production.

### Automatically deploying with GitHub

If the project is already pushed to GitHub, it may be easier to set up automatic deployments from the project's repository.

On the Heroku dashboard, click on the name of the app that will be deployed from GitHub.

Then, on the app detail page, there is a tab bar at the top, with a "Deploy" option. On that page, the deployment method can be chosen and configured to integrate with GitHub.

![automatic deployment instructions](../images/deployment/heroku/automatic-deployment.png)

## Configuring environment variables

To enable the production mode of Apollo Server, you need to set the `NODE_ENV` variable to `production`. To ensure you have visibility into your GraphQL performance in Apollo Server, you'll want to add the `APOLLO_KEY` environment variable to Heroku. For the API key, log in to [Apollo Studio](https://studio.apollographql.com) and navigate to your graph or create a new one.

Under the Settings tab, click **Reveal Config Vars**. Next, set `NODE_ENV` to `production` and copy your graph API key from [Apollo Studio](http://studio.apollographql.com/) as the value for `APOLLO_KEY`.

![Add Studio API Key Screenshot](../images/deployment/heroku/config-vars.png)

Send a query to your Heroku app's GraphQL service at **<HEROKU\_APP\_NAME>.herokuapp.com** and then check out the tracing data in [Apollo Studio](http://studio.apollographql.com/).
