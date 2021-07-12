[![npm version](https://badge.fury.io/js/apollo-server-lambda.svg)](https://badge.fury.io/js/apollo-server-lambda)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server/tree/main.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)
[![Join the community forum](https://img.shields.io/badge/join%20the%20community-forum-blueviolet)](https://community.apollographql.com)
[![Read CHANGELOG](https://img.shields.io/badge/read-changelog-blue)](https://github.com/apollographql/apollo-server/blob/HEAD/CHANGELOG.md)


This is the AWS Lambda integration of GraphQL Server. Apollo Server is a community-maintained open-source GraphQL server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/v2). [Read the CHANGELOG](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md).

```shell
npm install apollo-server-lambda graphql
```

## Deploying with AWS Serverless Application Model (SAM)

To deploy the AWS Lambda function we must create a Cloudformation Template and a S3 bucket to store the artifact (zip of source code) and template. We will use the [AWS Command Line Interface](https://aws.amazon.com/cli/).

#### 1. Write the API handlers

In a file named `graphql.js`, place the following code:

```js
const { ApolloServer, gql } = require('apollo-server-lambda');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core');

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

  // By default, the GraphQL Playground interface and GraphQL introspection
  // is disabled in "production" (i.e. when `process.env.NODE_ENV` is `production`).
  //
  // If you'd like to have GraphQL Playground and introspection enabled in production,
  // install the Playground plugin and set the `introspection` option explicitly to `true`.
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

exports.handler = server.createHandler();
```

#### 2. Create an S3 bucket

The bucket name must be universally unique.

```bash
aws s3 mb s3://<bucket name>
```

#### 3. Create the Template

This will look for a file called graphql.js with the export `graphqlHandler`. It creates one API endpoints:

* `/graphql` (GET and POST)

In a file called `template.yaml`:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  GraphQL:
    Type: AWS::Serverless::Function
    Properties:
      Handler: graphql.handler
      Runtime: nodejs14.x
      Events:
        AnyRequest:
          Type: Api
          Properties:
            Path: /graphql
            Method: ANY
```

#### 4. Package source code and dependencies

This will read and transform the template, created in previous step. Package and upload the artifact to the S3 bucket and generate another template for the deployment.

```shell
aws cloudformation package \
  --template-file template.yaml \
  --output-template-file serverless-output.yaml \
  --s3-bucket <bucket-name>
```

#### 5. Deploy the API

This will create the Lambda Function and API Gateway for GraphQL. We use the stack-name `prod` to mean production but any stack name can be used.

```
aws cloudformation deploy \
  --template-file serverless-output.yaml \
  --stack-name prod \
  --capabilities CAPABILITY_IAM
```


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

## Getting request info

Your ApolloServer's `context` function can read information about the current operation from both the original Lambda data structures and the Express request and response created by `@vendia/serverless-express`. These are provided to your `context` function as `event`, `context`, and `express` options.

The `event` object contains the API Gateway event (HTTP headers, HTTP method, body, path, ...). The `context` object (not to be confused with the `context` function itself!) contains the current Lambda Context (Function Name, Function Version, awsRequestId, time remaining, ...). `express` contains `req` and `res` fields with the Express request and response. The object returned from your `context` function is provided to all of your schema resolvers in the third `context` argument.

```js
const { ApolloServer, gql } = require('apollo-server-lambda');

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
  context: ({ event, context, express }) => ({
    headers: event.headers,
    functionName: context.functionName,
    event,
    context,
    expressRequest: express.req,
  }),
});

exports.graphqlHandler = server.createHandler();
```

## Modifying the Lambda Response (Enable CORS)

To enable CORS the response HTTP headers need to be modified. To accomplish this use the `cors` option.

```js
const { ApolloServer, gql } = require('apollo-server-lambda');

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
  expressGetMiddlewareOptions: {
    cors: {
      origin: '*',
      credentials: true,
    }
  },
});
```

To enable CORS response for requests with credentials (cookies, http authentication) the allow origin header must equal the request origin and the allow credential header must be set to true.

```js
const { ApolloServer, gql } = require('apollo-server-lambda');

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
  expressGetMiddlewareOptions: {
    cors: {
      origin: true,
      credentials: true,
    }
  },
});
```

### Cors Options

The options correspond to the [express cors configuration](https://github.com/expressjs/cors#configuration-options) with the following fields(all are optional):

* `origin`: boolean | string | string[]
* `methods`: string | string[]
* `allowedHeaders`: string | string[]
* `exposedHeaders`: string | string[]
* `credentials`: boolean
* `maxAge`: number

## Principles

GraphQL Server is built with the following principles in mind:

* **By the community, for the community**: GraphQL Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, GraphQL Server is easier to use, easier to contribute to, and more secure
* **Performance**: GraphQL Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to GraphQL Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/main/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/main/ROADMAP.md) and make your first PR!
