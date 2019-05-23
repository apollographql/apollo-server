---
title: Deploying with AWS Lambda
sidebar_title: Lambda
description: How to deploy Apollo Server with AWS Lambda
---

AWS Lambda is a service that allows users to run code without provisioning or managing servers. Cost is based on the compute time that is consumed, and there is no charge when code is not running.

This guide explains how to setup Apollo Server 2 to run on AWS Lambda.

## Prerequisites

The following must be done before following this guide:

- Setup an AWS account
- [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
- [Configure the AWS CLI with user credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)
- Install the serverless framework from NPM
  - `npm install -g serverless`

---

## Setting up your project

Setting up a project to work with Lambda isn't that different from a typical NodeJS project.

First, install the `apollo-server-lambda` package:

```sh
npm install apollo-server-lambda graphql
```

Next, set up the schema's type definitions and resolvers, and pass them to the `ApolloServer` constructor like normal. Here, `ApolloServer` must be imported from `apollo-server-lambda`. It's also important to note that this file must be named `graphql.js`, as the config example in a later step depends on the filename.

```js
// graphql.js

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

const server = new ApolloServer({ typeDefs, resolvers });

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
  runtime: nodejs6.10
functions:
  graphql:
    # this is formatted as <FILENAME>.<HANDLER>
    handler: graphql.graphqlHandler
    events:
    - http:
        path: graphql
        method: post
        cors: true
    - http:
        path: graphql
        method: get
        cors: true
```

### Running the Serverless Framework

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
  POST - https://ujt89xxyn3.execute-api.us-east-1.amazonaws.com/dev/graphql
  GET - https://ujt89xxyn3.execute-api.us-east-1.amazonaws.com/dev/graphql
functions:
  graphql: apollo-lambda-dev-graphql
```

#### What does `serverless` do?

First, it builds the functions, zips up the artifacts, and uploads the artifacts to a new S3 bucket. Then, it creates a Lambda function with those artifacts, and if successful, outputs the HTTP endpoint URLs to the console.

### Managing the resulting services

The resulting S3 buckets and Lambda functions can be viewed and managed after logging in to the [AWS Console](https://console.aws.amazon.com).

- To find the created S3 bucket, search the listed services for S3. For this example, the bucket created by Serverless was named `apollo-lambda-dev-serverlessdeploymentbucket-1s10e00wvoe5f`
- To find the created Lambda function, search the listed services for `Lambda`. If the list of Lambda functions is empty, or missing the newly created function, double check the region at the top right of the screen. The default region for Serverless deployments is `us-east-1` (N. Virginia)

## Getting request info

To read information about the current request from the API Gateway event `(HTTP headers, HTTP method, body, path, ...)` or the current Lambda Context `(Function Name, Function Version, awsRequestId, time remaining, ...)`, use the options function. This way, they can be passed to your schema resolvers via the context option.

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
  context: ({ event, context }) => ({
    headers: event.headers,
    functionName: context.functionName,
    event,
    context,
  }),
});

exports.graphqlHandler = server.createHandler();
```

## Modifying the Lambda response (Enable CORS)

To enable CORS, the response HTTP headers need to be modified. To accomplish this, use the `cors` options.

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

const server = new ApolloServer({ typeDefs, resolvers });

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});
```

Furthermore, to enable CORS response for requests with credentials (cookies, http authentication), the `allow origin` and `credentials` header must be set to true.

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

const server = new ApolloServer({ typeDefs, resolvers });

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: true,
    credentials: true,
  },
});
```
