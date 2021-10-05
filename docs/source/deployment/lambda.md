---
title: Deploying with AWS Lambda
sidebar_title: Lambda
description: How to deploy Apollo Server with AWS Lambda
---

AWS Lambda is a service that allows users to run code without provisioning or managing servers. Cost is based on the compute time that is consumed, and there is no charge when code is not running.

This guide explains how to setup Apollo Server 3 to run on AWS Lambda using either AWS Application Serverless Model (SAM) or the Serverless Framework. To use CDK and SST instead, [follow this tutorial](https://serverless-stack.com/examples/how-to-create-an-apollo-graphql-api-with-serverless.html).

## Prerequisites

The following must be done before following this guide:

- Setup an AWS account
- [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
- [Configure the AWS CLI with user credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)
- If using SAM for deployment, [Install AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install-linux.html)
- If using the serverless framework for deployment, Install the serverless framework from NPM:
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

## Deploying with the AWS Serverless Application Model (SAM)

The [AWS Serverless Application Model (AWS SAM)](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) is an open-source framework that you can use to build serverless applications on AWS.

### Configuring your SAM template.yaml

An AWS SAM template file closely follows the format of an AWS CloudFormation template file, which is described in [Template anatomy](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html) in the AWS CloudFormation User Guide.

For the sake of this example, the following file can just be copied and pasted into the root of your project.

```
# template.yaml

AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  GraphQLFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: graphql/
      Handler: app.graphqlHandler
      Timeout: 5 #
      MemorySize: 256
      Runtime: nodejs14.x
      Events:
        AutomaticPersistedQueries:
          Type: Api
          Properties:
            Path: /
            Method: get
        GraphQL:
          Type: Api
          Properties:
            Path: /
            Method: post
        ApolloSandbox:
          Type: Api
          Properties:
            Path: /
            Method: options
```

You will need to ensure `options` are exposed to use Apollo Explorer and Apollo Sandbox.

*Note: The example above is using v1 of AWS API Gateway which is denoted by the `Type: Api`, but v2 (`Type: HttpApi`) is supported as well. The `apollo-server-lambda` [repository currently has tests that cover both v1 and v2 API Gateway events and ALB events](https://github.com/apollographql/apollo-server/blob/main/packages/apollo-server-lambda/src/__tests__/lambdaApollo.test.ts). More info about API Event Source can be found [here](https://github.com/aws/serverless-application-model/blob/master/versions/2016-10-31.md#api)*

### Invoking SAM locally

To run your project locally with SAM, you will need to provide an event payload that "invokes" the AWS Lambda handler running locally in docker on your machine. [Invoking your lambda function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-invoke.html) locally can be done with the SAM CLI:

```
sam local invoke "GraphQLFunction" -e event.json
```

For the `event.json`, you will need to provide the proper event depending on what is being used to provide the event to the AWS lambda. This will most commonly used will be an [AWS API Gateway, either v1 or v2](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html).

Below is an example of the minimum `event.json` needed for a standard GraphQL request when using AWS API Gateway v1:

```
{
  "requestContext": {
    "version": "1.0"
  },
  "path": "/graphql",
  "httpMethod": "POST",
  "body": "{ \"query\": \"{__typename}\" }",
  "multiValueHeaders": {
    "Accept": "*",
    "origin": "",
    "content-type": "application/json"
  }
}
```

Below is an example of the minimum `event.json` needed for a standard GraphQL request when using AWS API Gateway v2:

```
{
  "version": "2.0",
  "rawPath": "/graphql",
  "requestContext": {
    "http": {
      "method: "POST",
      "path": "/graphql",
    }
  },
  "body": "{ \"query\": \"{__typename}\" }",
  "headers": {
    "Accept": "*",
    "origin": "",
    "content-type": "application/json"
  }
}
```

Below is an example of the minimum `event.json` needed to test an Automatic Persisted Queries (APQ) GraphQL request when using v1 API Gateway:

```
{
  "requestContext": {
    "version": "1.0"
  },
  "path": "/graphql",
  "httpMethod": "GET",
  "body": "",
  "multiValueHeaders": {
    "Accept": "*",
    "origin": "",
    "content-type": "application/json"
  },
  "multiValueQueryStringParameters": {
    "query": ["{__typename}"],
    "extensions": [
      "{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38\"}}"
    ]
  }
}
```

Below is an example of the minimum `event.json` needed to test an Automatic Persisted Queries (APQ) GraphQL request when using v2 API Gateway:

```
{
  "version": "2.0",
  "rawPath": "/graphql",
  "rawQueryString":"extensions={\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38\"}}",
  "requestContext": {
    "http": {
      "method: "GET",
      "path": "/graphql",
    },
  },
  "body": "",
  "headers": {
    "Accept": "*",
    "origin": "",
    "content-type": "application/json"
  }
}
```

### Debugging SAM Template Locally with VS Code

The AWS Sam CLI creates VS Code debugging configurations when initializing projects using the CLI. Below is an example of a VS Code Debug configuration:

```
{
  "type": "aws-sam",
  "request": "direct-invoke",
  "name": "Debug Operation (POST)",
  "invokeTarget": {
    "target": "template",
    "templatePath": "template.yaml",
    "logicalId": "GraphQLFunction"
  },
  "lambda": {
    "payload": {
      "json": {
        "requestContext": {
          "version": "1.0"
        },
        "path": "/graphql",
        "httpMethod": "POST",
        "body": "{ \"query\": \"{__typename}\" }",
        "multiValueHeaders": {
          "Accept": "*",
          "origin": "",
          "content-type": "application/json"
        }
      }
    }
  }
}
```

Below is an example of a VS Code Debug configuration for an Automatic Persisted Query (APQ):

```
{
  "type": "aws-sam",
  "request": "direct-invoke",
  "name": "Debug APQ (GET)",
  "invokeTarget": {
    "target": "template",
    "templatePath": "template.yaml",
    "logicalId": "GraphQLFunction"
  },
  "lambda": {
    "payload": {
      "json": {
        "requestContext": {
          "version": "1.0"
        },
        "path": "/graphql",
        "httpMethod": "GET",
        "body": "",
        "multiValueHeaders": {
          "Accept": "*",
          "origin": "",
          "content-type": "application/json"
        },
        "multiValueQueryStringParameters": {
          "query": ["{__typename}"],
          "extensions": [
            "{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38\"}}"
          ]
        }
      }
    }
  }
}
```

### Pushing to AWS with the SAM CLI

After configuring and testing your project locally, all you have to do to deploy is run `sam deploy --guided`. Once you have finished the guided deploy, your lambda should be available in your [AWS console](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions).

If successful, `serverless` should output something similar to this example:

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
    - http:
        path: /
        method: options
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
  POST - https://ujt89xxyn3.execute-api.us-east-1.amazonaws.com/dev/
  GET - https://ujt89xxyn3.execute-api.us-east-1.amazonaws.com/dev/
functions:
  graphql: apollo-lambda-dev-graphql
```

#### What does `serverless` do?

First, it builds the functions, zips up the artifacts, and uploads the artifacts to a new S3 bucket. Then, it creates a Lambda function with those artifacts, and if successful, outputs the HTTP endpoint URLs to the console.

### Managing the resulting services

The resulting S3 buckets and Lambda functions can be viewed and managed after logging in to the [AWS Console](https://console.aws.amazon.com).

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
