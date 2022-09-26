---
title: Health checks
description: Determining the health status of Apollo Server
---

> **Apollo Server 4 no longer [supports built-in health checks](../migration/#health-checks)**. Instead, we recommend performing [GraphQL-level health checks](#graphql-level-health-checks) to ensure your server successfully serves traffic _and_ performs GraphQL operations. 

Load balancers often use health checks to determine if a server is available and ready to serve traffic.

## GraphQL-level health checks

The easiest way to determine if your GraphQL server is healthy is to run a GraphQL operation.

Every GraphQL server supports a trivial query that requests the [`__typename`](../schema/schema/#the-__typename-field) of the top-level `Query` type.  This means every GraphQL server can respond to a `GET` request to a URL such as:

```
https://your.server/graphql?query=%7B__typename%7D
```

Note that this health check will run an actual GraphQL operation. If your server requires special headers or cookies to run any query, you'll need to provide those with your request.

> Sending an `apollo-require-preflight: true` header alongside your health check ensures that Apollo Server's [CSRF prevention](../security/cors/#preventing-cross-site-request-forgery-csrf) feature won't block it.

If you want to create a health check for your HTTP server that is _unrelated_ to the health of the GraphQL execution engine (i.e., such as [Apollo Server 3's health check feature](/apollo-server/v3/monitoring/health-checks)), you can add a `GET` handler that always succeeds to your web framework.