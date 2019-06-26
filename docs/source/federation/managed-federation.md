  ---
title: Using managed federation
description: Managing gateways at scale
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

However for larger scale projects it can be helpful to remotely manage service definitions, such that new services may be added or existing services modified at runtime. For these use cases, an Apollo Gateway can be configured to pull a remotely hosted service definition from Apollo Engine.

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
Modify hosted service definitions by rerunning the `apollo service:push` command with the appropriate URL and service name. The service will be queried for it's new schema, which will then be uploaded to Apollo Engine.

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
