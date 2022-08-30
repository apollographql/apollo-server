---
title: Deploying with AWS Lambda
description: How to deploy Apollo Server with AWS Lambda
---

<!-- TODO(AS4) update when we have a serverless integration to deploy -->

AWS Lambda is a service that allows users to run code without provisioning or managing servers. Cost is based on the compute time that is consumed, and there is no charge when code is not running.

This guide explains how to setup Apollo Server 2 to run on AWS Lambda using Serverless Framework. To use CDK and SST instead, [follow this tutorial](https://serverless-stack.com/examples/how-to-create-an-apollo-graphql-api-with-serverless.html).

## Prerequisites

The following must be done before following this guide:

- Setup an AWS account
- [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [Configure the AWS CLI with user credentials](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html)
- Install the serverless framework from NPM
  - `npm install -g serverless`

---

## Setting up your project

Setting up a project to work with Lambda isn't that different from a typical NodeJS project.

First, install the `apollo-server-lambda` package:

```shell
npm install apollo-server-lambda graphql
```

Next, set up the schema's type definitions and resolvers, and pass them to the `ApolloServer` constructor like normal. Here, `ApolloServer` must be imported from `apollo-server-lambda`. It's also important to note that this file must be named `graphql.js`, as the config example in a later step depends on the filename.

```js
// graphql.js

const { ApolloServer, gql } = require('apollo-server-lambda');
const {
  ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');

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
  csrfPrevention: true,
  cache: 'bounded',
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});

exports.graphqlHandler = server.createHandler();
```

Finally, **pay close attention to the last line**. This creates an export named `graphqlHandler` with a Lambda function handler.

## Deploying with the Serverless Framework

[Serverless](https://serverless.com) is a framework that makes deploying to services like AWS Lambda simpler.

### Configuring the Serverless Framework

Serverless uses a config file named `serverless.yml` to determine what service to deploy to and where the handlers are.

For the sake of this example, the following file can just be copied and pasted into the root of your project.

```
# serverless.yml

service: apollo-lambda
provider:
  name: aws
  runtime: nodejs14.x
functions:
  graphql:
    # this is formatted as <FILENAME>.<HANDLER>
    handler: graphql.graphqlHandler
    events:
    - http:
        path: /
        method: post
        cors: true
    - http:
        path: /
        method: get
        cors: true
```

### Running Locally
Using the `serverless` CLI, we can invoke our function locally to make sure it is running properly. As with any GraphQL "server", we need to send an operation for the schema to run as an HTTP request. You can store a mock HTTP request locally in a `query.json` file:

```json
{
  "httpMethod": "POST",
  "path": "/",
  "headers": {
    "content-type": "application/json"
  },
  "requestContext": {},
  "body": "{\"operationName\": null, \"variables\": null, \"query\": \"{ hello }\"}"
}
```

```sh
serverless invoke local -f graphql -p query.json
```

### Deploying the Code

After configuring the Serverless Framework, all you have to do to deploy is run `serverless deploy`

If successful, `serverless` should output something similar to this example:

```
> serverless deploy
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (27.07 MB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..............
Serverless: Stack update finished...
Service Information
service: apollo-lambda
stage: dev
region: us-east-1
stack: apollo-lambda-dev
api keys:
  None
endpoints:
  POST - https://ujt89xxyn3.execute-api.us-east-1.amazonaws.com/dev/
  GET - https://ujt89xxyn3.execute-api.us-east-1.amazonaws.com/dev/
functions:
  graphql: apollo-lambda-dev-graphql
```

#### What does `serverless` do?

First, it builds the functions, zips up the artifacts, and uploads the artifacts to a new S3 bucket. Then, it creates a Lambda function with those artifacts, and if successful, outputs the HTTP endpoint URLs to the console.

### Managing the resulting services

The resulting S3 buckets and Lambda functions can be viewed and managed after logging in to the [AWS Console](https://console.aws.amazon.com).

<!-- cSpell:disable-next-line -->
- To find the created S3 bucket, search the listed services for S3. For this example, the bucket created by Serverless was named `apollo-lambda-dev-serverlessdeploymentbucket-1s10e00wvoe5f`
- To find the created Lambda function, search the listed services for `Lambda`. If the list of Lambda functions is empty, or missing the newly created function, double check the region at the top right of the screen. The default region for Serverless deployments is `us-east-1` (N. Virginia)

If you changed your mind, you can remove everything from your AWS account with `npx serverless remove`.

## Customizing HTTP serving

`apollo-server-lambda` is built on top of `apollo-server-express`. It combines the HTTP server framework `express` with a package called `@vendia/serverless-express` that translates between Lambda events and Express requests. By default, this is entirely behind the scenes, but you can also provide your own express app with the `expressAppFromMiddleware` option to `createHandler`:

```js
const { ApolloServer } = require('apollo-server-lambda');
const express = require('express');

exports.handler = server.createHandler({
  expressAppFromMiddleware(middleware) {
    const app = express();
    app.use(someOtherMiddleware);
    app.use(middleware);
    return app;
  }
});
```

## Configuring the underlying Express integration

Because `apollo-server-lambda` is built on top of `apollo-server-express`, you can specify the same options that `apollo-server-express` accepts in `getMiddleware` (or `applyMiddleware`, other than `app`) as the `expressGetMiddlewareOptions` option to `createHandler`. The default value of this option is `{path: '/'}` (and this value of `path` will be used unless you explicitly override it). For example:

```js
exports.handler = server.createHandler({
  expressGetMiddlewareOptions: {
    disableHealthCheck: true,
  }
});
```

## Getting request info

Your ApolloServer's `context` function can read information about the current operation from both the original Lambda data structures and the Express request and response created by `@vendia/serverless-express`. These are provided to your `context` function as `event`, `context`, and `express` options.

The `event` object contains the API Gateway event (HTTP headers, HTTP method, body, path, ...). The `context` object (not to be confused with the `context` function itself!) contains the current Lambda Context (Function Name, Function Version, awsRequestId, time remaining, ...). `express` contains `req` and `res` fields with the Express request and response. The object returned from your `context` function is provided to all of your schema resolvers in the third `context` argument.

```js
const { ApolloServer, gql } = require('apollo-server-lambda');
const {
  ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');

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
  csrfPrevention: true,
  cache: 'bounded',
  context: ({ event, context, express }) => ({
    headers: event.headers,
    functionName: context.functionName,
    event,
    context,
    expressRequest: express.req,
  }),
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});

exports.graphqlHandler = server.createHandler();
```
