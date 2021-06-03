[![npm version](https://badge.fury.io/js/apollo-server-cloud-functions.svg)](https://badge.fury.io/js/apollo-server-cloud-functions)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server/tree/main.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)
[![Join the community forum](https://img.shields.io/badge/join%20the%20community-forum-blueviolet)](https://community.apollographql.com)
[![Read CHANGELOG](https://img.shields.io/badge/read-changelog-blue)](https://github.com/apollographql/apollo-server/blob/HEAD/CHANGELOG.md)


This is the Google Cloud Function integration of GraphQL Server. Apollo Server is a community-maintained open-source GraphQL server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/v2). [Read the CHANGELOG](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md).

```shell
npm install apollo-server-cloud-functions graphql
```

# Deploying with Google Cloud Functions

This tutorial helps you deploy Apollo Server to Google Cloud Functions. It uses the following example function handler:

```javascript:title=index.js
const { ApolloServer, gql } = require('apollo-server-cloud-functions');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

// Because `NODE_ENV` is a reserved environment variable in Google Cloud
// Functions and it defaults to "production", you need to set the
// `introspection` option to `true` for a UI like Apollo Sandbox or GraphQL
// Playground to work correctly.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

exports.handler = server.createHandler();
```

## Deploying from the Google Cloud Console

### 1. Configure the function

From your Google Cloud Console, go to the [Cloud Functions page](https://console.cloud.google.com/functions/list).

Click **Create Function**. Give the function a name and set the **Trigger type** to `HTTP`.

For quick setup and access to the GraphQL endpoint/landing page, choose to **Allow unauthenticated invocations**. To require authentication for this endpoint, you can manage authorized users via [Cloud IAM](https://console.cloud.google.com/iam-admin/iam).

Save your configuration changes in the Trigger section. Copy the trigger's URL for later and click **Next**.

### 2. Write the API handlers and deploy

Now on the Code page, set the runtime to a currently supported version of Node.js (such as `Node.js 14`), and set the Entry point to `handler`.

Paste the example code at the top of this page into the contents of `index.js` in the code editor.

Edit `package.json` so that it lists `apollo-server-cloud-functions` and `graphql` in its dependencies:

```json:title=package.json
"dependencies": {
  "apollo-server-cloud-functions": "^2.24.0",
  "graphql": "^15.5.0"
}
```

Click **Deploy** to initiate deployment. Then, proceed to [Testing the function](#testing-the-function).


## Deploying from your local machine

Before proceeding, you need to set up the gcloud SDK:

1. [Install the gcloud SDK](https://cloud.google.com/sdk/docs/install)

2. [Initialize the gcloud SDK and authenticate your Google account](https://cloud.google.com/sdk/docs/initializing)

Next, initialize a new Node.js project by running `npm init` in an empty directory.

Run `npm install apollo-server-cloud-functions graphql` to install the necessary dependencies and to include them in the `package.json` file.

At this point, your `package.json` should resemble the following:

```json
{
  "name": "apollo-gcloud",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "apollo-server-cloud-functions": "^2.24.0",
    "graphql": "^15.5.0"
  }
}
```

Create a new file named `index.js` and paste the sample code at the top of this page into it.

Run the following command to create and deploy the function to Cloud Functions:

```bash
gcloud functions deploy apollo-graphql-example --entry-point handler --runtime nodejs14 --trigger-http
```

This creates a function named `apollo-graphql-example` that you can view from your console's [Cloud Functions page](https://console.cloud.google.com/functions/list)

The command asks some configuration questions and prints metadata about your newly created function, which includes the function's trigger URL.

For more information, see the official [Cloud Functions docs](https://cloud.google.com/functions/docs/deploying/filesystem).

## Testing the function

After deployment completes, navigate to your function's trigger URL. If deployment succeeded, you should see your server's landing page.

> If you can't access your trigger URL, you might need to [add `allAuthenticatedUsers` or `allUsers` permissions](https://cloud.google.com/iam/docs/overview#all-authenticated-users) to your function.

Click <q>Query your Server</q> and use Apollo Sandbox to test the following query:

```graphql
query TestQuery {
  hello
}
```

And verify that the following response appears:

```json
{
  "data": {
    "hello": "Hello world!"
  }
}
```

## Getting request details

To obtain information about a currently executing Google Cloud Function (HTTP headers, HTTP method, body, path, etc.) use the `context` option. This enables you to pass any request-specific data to your server's resolvers.

```javascript
const { ApolloServer, gql } = require('apollo-server-cloud-functions');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({
    headers: req.headers,
    req,
    res,
  }),
});

exports.handler = server.createHandler();
```

## Modifying the GCF Response (CORS)

To enable CORS, you need to modify your HTTP response headers. To do so, use the `cors` option:

```javascript{23-26}
const { ApolloServer, gql } = require('apollo-server-cloud-functions');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

exports.handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});
```

To enable CORS response for requests with credentials (cookies, HTTP authentication) the allow origin header must equal the request origin and the allow credential header must be set to `true`.

```javascript
const { ApolloServer, gql } = require('apollo-server-cloud-functions');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

exports.handler = server.createHandler({
  cors: {
    origin: true,
    credentials: true,
  },
});
```

### CORS Options

The options correspond to the [express `cors` configuration](https://github.com/expressjs/cors#configuration-options) with the following fields(all are optional):

| Option | Type(s) |
|--------|---------|
| `origin` | boolean \| string \| string[] |
| `methods` | string \| string[] |
| `allowedHeaders` | string \| string[] |
| `exposedHeaders` | string \| string[] |
| `credentials` | boolean |
| `maxAge` | number |
