# graphql-server-lambda

This is the AWS Lambda integration for the Apollo community GraphQL Server. [Read the docs.](http://dev.apollodata.com/tools/apollo-server/index.html)

## How to Deploy
### AWS Serverless Application Model (SAM)

To deploy the AWS Lambda function we must create a Cloudformation Template and a S3 bucket to store the artifact (zip of source code) and template.

We will use the [AWS Command Line Interface](https://aws.amazon.com/cli/).

#### Write the API handlers
graphql.js:
```javascript
var server = require("graphql-server-lambda"),
    myGraphQLSchema = require("./schema");

exports.graphqlHandler = server.graphqlLambda({ schema: myGraphQLSchema });
exports.graphiqlHandler = server.graphiqlLambda({
    endpointURL: '/Prod/graphql'
});

```

#### Create a S3 bucket 

The bucket name name must be universally unique.
```
aws s3 mb s3://<bucket name>
```
#### Create the Template
This will look for a file called graphql.js with two exports: graphqlHandler and graphiqlHandler. It creates two API enpoints:
- /graphql (GET and POST)
- /graphiql (GET)

template.yaml:
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  GraphQL:
    Type: AWS::Serverless::Function
    Properties:
      Handler: graphql.graphqlHandler
      Runtime: nodejs4.3
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
      Runtime: nodejs4.3
      Events:
        GetRequest:
          Type: Api
          Properties:
            Path: /graphiql
            Method: get

```
#### Pacakge source code and dependencies
This will read and transform the template, created in previous step. Package and upload the artifact to the S3 bucket and generate another template for the deployment.
```
aws cloudformation package \
   --template-file template.yaml \
   --output-template-file serverless-output.yaml \
   --s3-bucket <bucket-name>
```
#### Deploy the API
The will create the Lambda Function and API Gateway for GraphQL. We use the stack-name prod to mean production but any stack name can be used.
```
aws cloudformation deploy \
   --template-file serverless-output.yaml \
   --stack-name prod \
   --capabilities CAPABILITY_IAM
```
