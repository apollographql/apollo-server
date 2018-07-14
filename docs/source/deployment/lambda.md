---
title: Deploying with AWS Lambda
sidebar_title: Lambda
description: How to deploy Apollo Server with AWS Lambda
---

AWS Lambda is a service that lets you run code without provisioning or managing servers. You pay only for the compute time you consume-there is no charge when your code is not running.

Learn how to integrate Apollo Server 2 with AWS Lambda. First, install the `apollo-server-lambda` package:

```sh
npm install apollo-server-lambda@rc graphql
```

## Deploying with AWS Serverless Application Model (SAM)

To deploy the AWS Lambda function, you must create a Cloudformation Template and a S3 bucket to store the artifact (zip of source code) and template. You'll use the [AWS Command Line Interface](https://aws.amazon.com/cli/).

#### 1. Write the API handlers

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

exports.graphqlHandler = server.createHandler();
```

#### 2. Create an S3 bucket

The bucket name must be universally unique.

```bash
aws s3 mb s3://<bucket name>
```

#### 3. Create the Template

This will look for a file called `graphql.js` with the export `graphqlHandler`. It creates one API endpoints:

* `/graphql` (GET and POST)

In a file called `template.yaml`:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  GraphQL:
    Type: AWS::Serverless::Function
    Properties:
      Handler: graphql.graphqlHandler
      Runtime: nodejs8.10
      Events:
        GetRequest:
          Type: Api
          Properties:
            Path: /graphql
            Method: get
        PostRequest:
          Type: Api
          Properties:
            Path: /graphql
            Method: post
```

#### 4. Package source code and dependencies

Read and transform the template, created in the previous step. Package and upload the artifact to the S3 bucket and generate another template for the deployment.

```sh
aws cloudformation package \
  --template-file template.yaml \
  --output-template-file serverless-output.yaml \
  --s3-bucket <bucket-name>
```

#### 5. Deploy the API

Create the Lambda Function and API Gateway for GraphQL. In the example below, `prod` stands for production. However, you can use any name to represent it.

```
aws cloudformation deploy \
  --template-file serverless-output.yaml \
  --stack-name prod \
  --capabilities CAPABILITY_IAM
```

## Getting request info

To read information about the current request from the API Gateway event `(HTTP headers, HTTP method, body, path, ...)` or the current Lambda Context `(Function Name, Function Version, awsRequestId, time remaning, ...)`, use the options function. This way, they can be passed to your schema resolvers via the context option.

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
  })
});

exports.graphqlHandler = server.createHandler();
```

## Modifying the Lambda Response (Enable CORS)

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
