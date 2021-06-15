---
title: Deploying with Google Cloud Functions
sidebar_title: GCP Cloud Functions
description: Deploying your GraphQL server to Google Cloud Functions
---
This is the Google Cloud Function integration of GraphQL Server. [Read the docs](https://www.apollographql.com/docs/apollo-server/v2).

## Deploying with Google Cloud Functions

The following example API handler is required for both local and console deployment in following this tutorial:

**index.js**

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
  playground: true,
  introspection: true,
});

exports.handler = server.createHandler();
```

Since `NODE_ENV` is a reserved environment variable in Google Cloud Functions and it defaults to "production", both the **playground** and **introspection** `ApolloServer` options need to be explicitly set to `true` for the GraphQL Playground to work correctly.
### Deploy from the Google Cloud Console

#### 1. Configure the Google Cloud Function

Navigate to the Google Cloud Functions page in the [console](https://console.cloud.google.com/functions/).

Click on *Create Function*. Give the function a name and set the *Trigger type* to `HTTP`.

For quick setup and access to the GraphQL endpoint/playground, choose to *Allow unauthenticated invocations*. If you wish to require authentication for this endpoint, you can manage the authorized users who
access the endpoint through [Cloud IAM](https://console.cloud.google.com/iam-admin/iam).

Save your configuration changes in the *Trigger* section. Take note of the **Trigger URL** and click *Next*.

#### 2. Write the API handlers and Deploy

On the *Code* page, set the Runtime to `Node.js 10` and Entry point to `handler`.

Copy the API handler from above and paste it into the contents of `index.js` in the code editor.

Edit `package.json` so that it lists `graphql` and `apollo-server-cloud-functions` in its dependencies:

```json
...
"dependencies": {
    "apollo-server-cloud-functions": "^2.24.0",
    "graphql": "^15.5.0"
  }
...
```

Click *Deploy* and navigate to the Trigger URL from configuration to access the Apollo playground once deployment has succeeded.

You can refer to the [Cloud Functions documentation](https://cloud.google.com/functions/docs/quickstart-console) for more details.

### Deploy from Local Machine

**Prerequisites**

1. [Install the gcloud SDK](https://cloud.google.com/sdk/docs/install)

2. [Initialize the gcloud SDK and authenticate your Google account](https://cloud.google.com/sdk/docs/initializing)

Run `npm init` from an empty directory to initialize the project and to create a template `package.json`.

Run `npm install apollo-server-cloud-functions graphql` to install the necessary dependencies and to include them in the `package.json` file.

At this point your `package.json` should look something like this:

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

Place the contents of the API handler from above in a file named `index.js`.

Run the following command to create and deploy the function to Cloud Functions:

```
gcloud functions deploy apollo-graphql-example --entry-point handler --runtime nodejs10 --trigger-http
```

This will create a function named `apollo-graphql-example` that you can view in the Google Cloud Functions console.
It will ask some configuration questions and print metadata about your newly created function, which includes
the **Trigger URL** endpoint.

For more documentation see the official [Cloud Function Docs](https://cloud.google.com/functions/docs/deploying/filesystem).

### Verify That the Function Works

Open the Trigger URL for your function in a web browser. In the playground that is hosted at this URL, run the following query:

```graphql
query hello {
  hello
}
```

And verify that you received the response:

```json
{
  "data": {
    "hello": "Hello world!"
  }
}
```

## Getting request info

To read information about the currently executing Google Cloud Function (HTTP headers, HTTP method, body, path, ...) use the context option. This way you can pass any request specific data to your schema resolvers.

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

## Modifying the GCF Response (Enable CORS)

To enable CORS the response HTTP headers need to be modified. To accomplish this use the `cors` option.

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
    origin: '*',
    credentials: true,
  },
});
```

To enable CORS response for requests with credentials (cookies, http authentication) the allow origin header must equal the request origin and the allow credential header must be set to true.

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

**Cors Options**

The options correspond to the [express cors configuration](https://github.com/expressjs/cors#configuration-options) with the following fields(all are optional):

+ `origin`: boolean | string | string[]
+ `methods`: string | string[]
+ `allowedHeaders`: string | string[]
+ `exposedHeaders`: string | string[]
+ `credentials`: boolean
+ `maxAge`: number
