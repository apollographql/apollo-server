---
title: Lambda
description: Setting up Apollo Server with Lambda
---

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core) [![Build Status](https://circleci.com/gh/apollographql/apollo-cache-control-js.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-cache-control-js) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

This is the AWS Lambda integration for the Apollo community GraphQL Server. [Read the docs.](https://www.apollographql.com/docs/apollo-server/) [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md)

```sh
npm install apollo-server-lambda
```

<h2 id="deploying" title="Deploying with SAM">Deploying with AWS Serverless Application Model (SAM)</h2>

To deploy the AWS Lambda function we must create a Cloudformation Template and a S3 bucket to store the artifact (zip of source code) and template. We will use the [AWS Command Line Interface](https://aws.amazon.com/cli/).

#### 1. Write the API handlers

```js
// graphql.js
var server = require('apollo-server-lambda'),
  myGraphQLSchema = require('./schema');

exports.graphqlHandler = server.graphqlLambda({ schema: myGraphQLSchema });
exports.graphiqlHandler = server.graphiqlLambda({
  endpointURL: '/Prod/graphql',
});
```

#### 2. Create an S3 bucket

The bucket name name must be universally unique.

```bash
aws s3 mb s3://<bucket name>
```

#### 3. Create the Template

This will look for a file called graphql.js with two exports: `graphqlHandler` and `graphiqlHandler`. It creates two API endpoints:

* `/graphql` (GET and POST)
* `/graphiql` (GET)

In a file called `template.yaml`:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  GraphQL:
    Type: AWS::Serverless::Function
    Properties:
      Handler: graphql.graphqlHandler
      Runtime: nodejs6.10
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
  GraphQLInspector:
    Type: AWS::Serverless::Function
    Properties:
      Handler: graphql.graphiqlHandler
      Runtime: nodejs6.10
      Events:
        GetRequest:
          Type: Api
          Properties:
            Path: /graphiql
            Method: get
```

#### 4. Package source code and dependencies

This will read and transform the template, created in previous step. Package and upload the artifact to the S3 bucket and generate another template for the deployment.

```sh
aws cloudformation package \
   --template-file template.yaml \
   --output-template-file serverless-output.yaml \
   --s3-bucket <bucket-name>
```

#### 5. Deploy the API

The will create the Lambda Function and API Gateway for GraphQL. We use the stack-name `prod` to mean production but any stack name can be used.

```
aws cloudformation deploy \
   --template-file serverless-output.yaml \
   --stack-name prod \
   --capabilities CAPABILITY_IAM
```

<h2 id="request-info" title="Getting request info">Getting request info</h2>

To read information about the current request from the API Gateway event (HTTP headers, HTTP method, body, path, ...) or the current Lambda Context (Function Name, Function Version, awsRequestId, time remaning, ...) use the options function. This way they can be passed to your schema resolvers using the context option.

```js
var server = require('apollo-server-lambda'),
  myGraphQLSchema = require('./schema');

exports.graphqlHandler = server.graphqlLambda((event, context) => {
  const headers = event.headers,
    functionName = context.functionName;

  return {
    schema: myGraphQLSchema,
    context: {
      headers,
      functionName,
      event,
      context,
    },
  };
});
```

<h2 id="modifying-response" title="Modifying the response">Modifying the Lambda Response (Enable CORS)</h2>

To enable CORS the response HTTP headers need to be modified. To accomplish this pass in a callback filter to the generated handler of graphqlLambda.

```js
var server = require('apollo-server-lambda'),
  myGraphQLSchema = require('./schema');

exports.graphqlHandler = function(event, context, callback) {
  const callbackFilter = function(error, output) {
    output.headers['Access-Control-Allow-Origin'] = '*';
    callback(error, output);
  };
  const handler = server.graphqlLambda({ schema: myGraphQLSchema });

  return handler(event, context, callbackFilter);
};
```

To enable CORS response for requests with credentials (cookies, http authentication) the allow origin header must equal the request origin and the allow credential header must be set to true.

```js
const CORS_ORIGIN = 'https://example.com';

var server = require('apollo-server-lambda'),
  myGraphQLSchema = require('./schema');

exports.graphqlHandler = function(event, context, callback) {
  const requestOrigin = event.headers.origin,
    callbackFilter = function(error, output) {
      if (requestOrigin === CORS_ORIGIN) {
        output.headers['Access-Control-Allow-Origin'] = CORS_ORIGIN;
        output.headers['Access-Control-Allow-Credentials'] = 'true';
      }
      callback(error, output);
    };
  const handler = server.graphqlLambda({ schema: myGraphQLSchema });

  return handler(event, context, callbackFilter);
};
```
