---
title: Deploying with Azure Functions
sidebar_title: Azure Functions
description: Deploying your GraphQL server to Azure Functions
---
This is the Azure Functions integration for the Apollo community GraphQL Server. [Read Docs](https://www.npmjs.com/package/apollo-server-azure-functions)

All examples below was created using Linux environments, if you are working with Windows-based platforms some commands couldn’t work fine.

## Prerequisites

The following must be done before following this guide:

- Setup an [Azure](https://azure.com) account.
- Install [Azure Functions Core Tools CLI version 3.x](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#v2).
- [Install the Azure CLI 2.x](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) to deploy to Azure.

## Setting up the project

We will need to create our local project, installing the node.js dependencies and testing locally to make sure that all process will happen fine.

```shell
func init apollo-example --worker-runtime node
cd apollo-example
func new --template "Http Trigger" --name graphql
```

Now, our project is prepared to start! Run `func host start` command to see the output below.

```shell
Azure Functions Core Tools
Core Tools Version:       3.0.3477 Commit hash: 5fbb9a76fc00e4168f2cc90d6ff0afe5373afc6d  (64-bit)
Function Runtime Version: 3.0.15584.0

[2021-06-30T19:22:21.077Z] Worker process started and initialized.

Functions:

	graphql: [GET,POST] http://localhost:7071/api/graphql

For detailed output, run func with --verbose flag.
```

Go to [http://localhost:7071/api/graphql?name=Apollo](http://localhost:7071/api/graphql?name=Apollo) and verify if the text with the content: **Hello Apollo** is appearing at your browser.

(If you see an error about "Incompatible Node.js version", you may need to ensure that the version of `node` on your `PATH` is a version supported by Azure Functions by using a tool like [nvm](https://github.com/nvm-sh/nvm). For example, as of June 2021, Azure Functions does not yet support Node 16.)

If you would like to remove the `api` from the url structure, set the prefix in your `host.json` file like below:

```json
{
  "version": "2.0",
  "extensions": {
    "http": {
        "routePrefix": ""
    }
  }
}
```

This will make your url look like `http://{my-url}/graphql` like we would expect for most GraphQL projects.

## Sample Code

We will now install the dependencies and test our azure function app using apollo server and graphql. Run the following commands to perform the node.js initialization project and to install the node.js dependencies.

```shell
cd apollo-example
npm install apollo-server-azure-functions@3.x graphql
```

Replace the context of the file `graphql/index.js` with the following:

```javascript
const { ApolloServer, gql } = require('apollo-server-azure-functions');

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

Make two changes to `graphql/function.json`: make the output name `$return`, and add `options` to the list of supported methods so that CORS works. Your file should look like:

```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [
        "get",
        "post",
        "options"
      ]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ]
}
```

Finally, we need to return to the base folder and run the `func host start` command again after that, go back to your browser and refresh your page to see the Apollo Server running. You can then run operations against your graph with Apollo Sandbox.

```shell
func host start
```


## Deploying the project to Azure using the Azure CLI

### Setting up resources in Azure for deployment

Before deploying, a new application must be set up. To do this, we need to create some azure requirements. First, you will need a resource group. To create one run the code below on your terminal, where the **--name** is the name for the group and **--location** the region.

```shell
az group create --name apollo-examples --location eastus
```

After creating a resource group, we need to create a storage account to store our code on Azure. You will need to choose a unique name.

```shell
az storage account create \
    --name apolloexampleYOURNAME \
    --location eastus \
    --resource-group apollo-examples \
    --sku Standard_LRS
```

We will publish our application to Azure now using the CLI as well. We need to create a `functionapp` running the following command.

Note: The function name must be unique.

```shell
az functionapp create \
    --resource-group apollo-examples \
    --name apollo-example-YOURNAME \
    --consumption-plan-location eastus \
    --runtime node \
    --functions-version 3 \
    --storage-account apolloexampleYOURNAME
```

### Publishing our project to the function app

After creating a functionapp, it is just to publish our function to azure. The command below could be used to perform releases to all of your functions.

```shell
func azure functionapp publish apollo-example-YOURNAME
```

```shell
Getting site publishing info...
Preparing archive...
Uploading 4.45 MB [###############################################################################]
Upload completed successfully.
Deployment completed successfully.
Syncing triggers...
Functions in apollo-example:
    graphql - [httpTrigger]
        Invoke url: https://apollo-example.azurewebsites.net/graphql?code=4aB9bka0fXFyTVeO8jAiHTc8bmyoqx2mEabk/QDA6gu2xLcqEAJRiw==
```

Finally, going to the Invoke URL shown at the output above, we will see our result.

### Cleaning Up

After completing this tutorial, you can delete all the resources you created during this example from your Azure account by removing the Azure Resource Group called **apollo-examples** with the **az group** commmand:

```shell
az group delete --name apollo-examples --yes
```

## Deploying to Azure from VS Code

It is also possible to publish your project from VS Code using the Azure Functions Extension, we recommend referring to [Microsoft's documentation on publishing to Azure from VS Code](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-function-vs-code#publish-the-project-to-azure).

Need more details? See the [README](https://www.npmjs.com/package/apollo-server-azure-functions) for `apollo-server-azure-functions`.
