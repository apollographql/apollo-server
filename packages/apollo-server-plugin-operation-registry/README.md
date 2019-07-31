# Operation Registry Plugin

The operation registry plugin is the interface into the Apollo Platform's **operation registry** and enables operation **safelisting**, which allows selective execution based on the operation. Safelisting eliminates the risk of unexpected operations that could cause downtime from being run against a graph.

In order to enable safelisting, follow the [step by step guide in the Apollo docs](https://www.apollographql.com/docs/platform/operation-registry/). These steps describe how to extract and upload operations defined within client applications to the [Apollo Graph Manager](https://engine.apollographql.com) using the Apollo CLI. Once operations have been registered, this plugin for Apollo Server fetches the manifest of these operations from the [Apollo Graph Manager](https://engine.apollographql.com) and forbids the execution of any operations that are not in that manifest. 

### Usage

The following example shows basic usage of the plugin with Apollo Server. First, add the plugin to your project's `package.json`:

```bash
npm install apollo-server-plugin-operation-registry
```

Then, ensure Apollo Server has access to an [API key](https://www.apollographql.com/docs/platform/operation-registry/#6-start-apollo-server-with-apollo-engine-enabled), for example as the `ENGINE_API_KEY` environment variable:

```bash
ENGINE_API_KEY=<API_KEY> npm start
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

#### Schema Tag/Variant

Clients can register their operations to specific tags/variants, so the plugin contains the `schemaTag` field to specify which tag/variant to pull operation manifests from.

```js
const server = new ApolloServer({
  plugins: [
    require("apollo-server-plugin-operation-registry")({
      schemaTag: "overrideTag" 
    })
  ]
});
```


### Metrics

The plugin will transmit metrics regarding unregistered operations which can be viewed within [the Apollo Graph Manager](https://engine.apollographql.com). The following example shows the unregistered operations sent by a particular client: 

<p align="center">
  <img
    src="../img/clients-page.png"
    alt="The clients page showing unregistered operations"
  /> 
</p>
