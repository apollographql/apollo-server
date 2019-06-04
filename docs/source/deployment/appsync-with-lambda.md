---
title: Deploying with AWS AppSync and Lambda
sidebar_title: AppSync and Lambda
description: How to deploy Apollo Server with AWS AppSync and AWS Lambda
---

AWS Lambda is a service that allows users to run code without provisioning or
managing servers. Cost is based on the compute time that is consumed, and
there is no charge when code is not running.

AWS AppSync is a GraphQL service that takes care of hosting the schema, and
resolving calls into your graphql service into lambda functions. With
AppSync, you can leverage other services like AWS Cognito, DynamoDB, and
Aurora Serverless with minimal configuration and code.

In this guide, we will set up an AppSync distribution, that is protected by a
Cognito User Pool, and resolves to a lambda function which is a new instance
of `apollo-server`.

## Prerequisites

The following must be done before following this guide:

- Setup an AWS account
- [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
- [Configure the AWS CLI with user credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

---

## Setting up your project

Setting up a project to work with Lambda isn't that different from a typical
NodeJS project.

First, install the `apollo-server-lambda` package:

```shell
npm install apollo-server-lambda graphql
```

Next, set up the schema's type definitions and resolvers, and pass them to
the `ApolloServer` constructor like normal. Here, `ApolloServer` must be
imported from `apollo-server-lambda`. It's also important to note that this
file must be named `api.js`, as the config example in a later step
depends on the filename.

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

exports.handler = server.createHandler();
```

Finally, **pay close attention to the last line**. This creates an export
named `handler` with a Lambda function handler.

## Deploying with AWS CloudFormation

[AWS CloudFormation](https://aws.amazon.com/cloudformation/) is a framework
that allows you to declare your AWS infrastructure.

We will need to set up:

* An AppSync distribution
* A Cognito User Pool and Identity Pool
* A Lambda function

An optionally:

* A datastore (e.g. a SQL database with RDS, or a noSQL store like DynamoDB)

### Example CloudFormation template

The following template assumes that an S3 bucket to store code and a Cognito
User Pool and Distribution have already been created. A Database URL is also
required, which is an environment variable to your Lambda function.

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: >
  This template creates an Authenticated AppSync API & Resolver Lambda
Parameters:
  pGraphqlDefinition:
    Description: GraphQL Schema
    Type: String
  pFunctionName:
    Description: Name to Call the Function and Role
    Type: String
  pCodeBucket:
    Description: Name of the S3 Bucket
    Type: String
  pHandler:
    Description: Entrypoint in the app where the code will run
    Type: String
  pDatabaseUrl:
    Description: Cognito Database Url
    Type: String
  pCognitoUserPoolId:
    Description: Id of the Cognito Pool
    Type: String
  pCognitoUserPoolArn:
    Description: Arn of the Cognito Pool
    Type: String
  pEnvironment:
    Description: Environment the lambdas are in
    Type: String

Resources:
  GraphqlApi:
    Type: AWS::AppSync::GraphQLApi
    Properties:
      Name: !Ref pFunctionName
      AuthenticationType: AMAZON_COGNITO_USER_POOLS
      UserPoolConfig:
        UserPoolId: !Ref pCognitoUserPoolId
        AwsRegion: us-east-1
        DefaultAction: ALLOW

  ApiSchema:
    Type: "AWS::AppSync::GraphQLSchema"
    Properties:
      DefinitionS3Location: !Sub "s3://${pCodeBucket}/${pGraphqlDefinition}"
      ApiId: !GetAtt GraphqlApi.ApiId

  LambdaDataSource:
    Type: "AWS::AppSync::DataSource"
    Properties:
      ApiId: !GetAtt GraphqlApi.ApiId
      Name: lambda
      Description: "The Authenticated Api Lambda Role"
      Type: "AWS_LAMBDA"
      ServiceRoleArn: !GetAtt LambdaExecutionRole.Arn
      LambdaConfig:
        LambdaFunctionArn: !GetAtt LambdaFunction.Arn

  LambdaPermission:
    Type: "AWS::Lambda::Permission"
    Description: "Allows Cognito to invoke the Cognito Lambda Function"
    Properties:
      Action: lambda:InvokeFunction
      FunctionName: !Ref LambdaFunction
      Principal: cognito-idp.amazonaws.com
      SourceArn: !Ref pCognitoUserPoolArn

  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          Effect: Allow
          Principal:
            Service:
              - lambda.amazonaws.com
              - appsync.amazonaws.com
          Action: sts:AssumeRole
      Path: "/"
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole
      Policies:
        - PolicyName: !Sub ${pFunctionName}-lambda-policy
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action:
                  - logs:CreateLogGroup
                  - logs:CreateLogStream
                  - logs:PutLogEvents
                  - lambda:InvokeFunction
                  - ses:SendEmail
                Resource: "*"

  LambdaFunction:
    Type: AWS::Lambda::Function
    Properties:
      Code:
        S3Bucket: !Ref pCodeBucket
        S3Key: !Join
          - ""
          - - !Ref pEnvironment
            - "/code.zip"
      FunctionName: !Ref pFunctionName
      Handler: !Ref pHandler
      Environment:
        Variables:
          DATABASE_URL: !Ref pDatabaseUrl
          API_ENV: !Ref pEnvironment
          COGNITO_USER_POOL_ID: !Ref pCognitoUserPoolId
      MemorySize: 1024
      Role: !GetAtt LambdaExecutionRole.Arn
      Runtime: nodejs8.10
      Timeout: 30

  LambdaErrors:
    Type: "AWS::CloudWatch::Alarm"
    Properties:
      AlarmDescription: !Ref pFunctionName
      Namespace: "AWS/Lambda"
      MetricName: Errors
      Dimensions:
        - Name: FunctionName
          Value: !Ref LambdaFunction
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 0
      TreatMissingData: notBreaching
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - "Fn::ImportValue": !Sub "marbot-TopicArn"
      OKActions:
        - "Fn::ImportValue": !Sub "marbot-TopicArn"

  AlarmCountUserFunctionThrottles:
    Type: "AWS::CloudWatch::Alarm"
    Properties:
      AlarmDescription: !Sub "${pFunctionName}-Throttling"
      Namespace: "AWS/Lambda"
      MetricName: Throttles
      Dimensions:
        - Name: FunctionName
          Value: !Ref LambdaFunction
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 0
      TreatMissingData: notBreaching
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - "Fn::ImportValue": !Sub "marbot-TopicArn"
      OKActions:
        - "Fn::ImportValue": !Sub "marbot-TopicArn"

Outputs:
  AppSyncApiId:
    Description: ID of the Graphql API
    Value: !GetAtt GraphqlApi.ApiId
    Export:
      Name: !Sub "${AWS::StackName}-ApiId"
  LambdaFunctionConsoleUrl:
    Description: Console URL for the Lambda Function.
    Value: !Join
      - ""
      - - https://
        - !Ref AWS::Region
        - ".console.aws.amazon.com/lambda/home?region="
        - !Ref AWS::Region
        - "#/functions/"
        - !Ref LambdaFunction
    Export:
      Name: !Sub "${AWS::StackName}-LambdaConsoleUrl"
```

## Getting request info

Unlike the documentation using Lambda with API Gateway, requests from AppSync
have a different event and context object. You also do not need to worry
about CORS.

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
    functionName: event.field,
    event,
    context,
  }),
});

exports.graphqlHandler = server.createHandler();
```

## Deploying new versions

AppSync requires a static version of your schema already uploaded before
making your requests, and for each resolver in that schema to resolve to the
AWS Lambda function created in the CloudFormation template above.
