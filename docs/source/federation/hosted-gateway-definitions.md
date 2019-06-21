---
title: Hosted gateway configurations
description: Managing gateways at scale # lmao
---

In many cases it is sufficient to define the list of services comprising a federated graph directly within the gateway:
```javascript
const gateway = await createGateway({
    serviceList: [
      { name: "accounts", url: "http://localhost:4001/graphql" },
      { name: "products", url: "http://localhost:4002/graphql" },
      ...
    ]
  });
```

However for larger scale projects it can be helpful to remotely manage service definitions, such that new services may be added or existing services modified at runtime. For these use cases, aApollo Gateway can be configured to pull a remotely hosted service definition from Apollo Engine.

> Currently the hosted federation service is only available for enterprise. Other customers interested in hosted definitions should reach out to sales to discuss expanding their plans.

## Uploading Service Definitions

To begin, ensure all component services are up and running, and the working directory has a `.env` file containing the appropriate  `ENGINE_API_KEY` for your federated service. Then, upload each service to the gateway through the Apollo CLI:

```bash
apollo service:push       \
  --serviceURL={{url}}    \
  --endpoint={{url}}      \
  --serviceName={{name}}  \
  --federated
```

> Each service needs a unique name, this is how you will identify the service for schema updates

To later modify hosted service definitions, simply rerun the `apollo service:push` command with the appropriate URL and service name.

## Configuring Apollo Gateway

By default, if no `serviceList` is directly provided at initialization, Apollo Gateway will read from the environment's `ENGINE_API_KEY` and, if found, pull the `current` service definition from Apollo Engine. This can be configured by passing an `apiKey` and/or `tag` to the `createGateway` call:

```javascript
const gateway = createGateway(
  {
    tag: 'staging',
    apiKey: 'service:MyService:abcd1234'
  }
)
```

### Automatic Updates

By default the gateway will pull the remote service definition only at sartup. This can be changed to a polling-based approach by passing a `onSchemaChange` event handler to the `createGateway` function:

```javascript
const gateway = createGateway(
  {
    onSchemaChange: () => restartServer()
  }
)
```

> We are in the process of developing a zero down-time way to update service definitions without needing to restart the ApolloServer.
