# apollo-server-lambda

This is the AWS Lambda integration for the Apollo community GraphQL Server. [Read the docs.](http://dev.apollodata.com/tools/apollo-server/index.html)

## How to Deploy
### AWS Serverless Application Model (SAM)

To deploy the AWS Lambda function we must create a Cloudformation Template and a S3 bucket to store the artifact (zip of source code) and template.

We will use the [AWS Command Line Interface](https://aws.amazon.com/cli/).

#### Write the API handlers
graphql.js:
```javascript
var server = require("apollo-server-lambda"),
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
This will look for a file called graphql.js with two exports: graphqlHandler and graphiqlHandler. It creates two API endpoints:
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
#### Package source code and dependencies
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

## Access or Modify Lambda options
### Read API Gateway event and Lambda Context
To read information about the current request (HTTP headers, HTTP method, body, path, ...) or the current Lambda Context (Function Name, Function Version, awsRequestId, time remaning, ...) use the options function. This way they can be passed to your schema resolvers using the context option.
```js
var server = require("apollo-server-lambda"),
    myGraphQLSchema = require("./schema");

exports.graphqlHandler = server.graphqlLambda((event, context) => {
    const headers = event.headers,
        functionName = context.functionName;

    return {
        schema: myGraphQLSchema,
        context: {
            headers,
            functionName,
            event,
            context
        }
        
    };
});
```
### Modify the Lambda Response (Enable CORS)
To enable CORS the response HTTP headers need to be modified. To accomplish this pass in a callback filter to the generated handler of graphqlLambda.
```js
var server = require("apollo-server-lambda"),
    myGraphQLSchema = require("./schema");

exports.graphqlHandler = function(event, context, callback)  {
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
const CORS_ORIGIN = "https://example.com";

var server = require("apollo-server-lambda"),
    myGraphQLSchema = require("./schema");

exports.graphqlHandler = function(event, context, callback)  {
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
