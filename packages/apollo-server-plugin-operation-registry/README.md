# Operation Registry Plugin

The operation registry plugin is the interface into the Apollo Platform's **operation registry** and enables operation **safelisting**, which allows selective execution based on the operation. Safelisting eliminates the risk of unexpected operations that could cause downtime from being run against a graph.

In order to enable safelisting, follow the [step by step guide in the Apollo docs](https://www.apollographql.com/docs/studio/operation-registry/). These steps describe how to extract and upload operations defined within client applications to [Apollo Studio](https://studio.apollographql.com) using the Apollo CLI. Once operations have been registered, this plugin for Apollo Server fetches the manifest of these operations from [Apollo Studio](https://studio.apollographql.com) and forbids the execution of any operations that are not in that manifest.

### Usage

The following example shows basic usage of the plugin with Apollo Server. First, add the plugin to your project's `package.json`:

```bash
npm install apollo-server-plugin-operation-registry
```

Then, ensure Apollo Server has access to an [API key](https://www.apollographql.com/docs/studio/operation-registry/#6-start-apollo-server-with-apollo-studio-enabled), for example as the `APOLLO_KEY` environment variable:

```bash
APOLLO_KEY=<API_KEY> npm start
```

Next, enable the plugin by adding it to the `plugins` parameter to the Apollo Server options:

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: false,
  plugins: [
    require("apollo-server-plugin-operation-registry")({
      forbidUnregisteredOperations: true
    })
  ]
});
```

<details><summary>With federation, the setup follows the same `plugins` configuration:</summary>

```js
const { ApolloServer } = require("apollo-server");
const { ApolloGateway } = require("@apollo/gateway");

const gateway = new ApolloGateway({
  serviceList: [ /* services */ ],
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  plugins: [
    require("apollo-server-plugin-operation-registry")({
      forbidUnregisteredOperations: true
    })
  ]
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```
</details>

#### Variant

Clients can register their operations to a specific variant, so the plugin contains the `graphVariant` field to specify which variant to pull operation manifests from.

```js
const server = new ApolloServer({
  plugins: [
    require("apollo-server-plugin-operation-registry")({
      graphVariant: "production"
    })
  ]
});
```


### Metrics

The plugin will transmit metrics regarding unregistered operations which can be viewed within [Apollo Studio](https://studio.apollographql.com). The following example shows the unregistered operations sent by a particular client:

<p align="center">
  <img
    src="https://cl.ly/2a5b9c82287d/download/clients-page.png"
    alt="The clients page showing unregistered operations"
  />
</p>
