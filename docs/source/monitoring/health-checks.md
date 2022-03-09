---
title: Health checks
description: Determining the health status of your server
---

Load balancers often use health checks to determine if a server is available and ready to serve traffic.

## GraphQL-level health checks

The easiest way to determine if your GraphQL server is healthy is to run a GraphQL operation!

Every GraphQL server supports a trivial query that requests the [`__typename`](../schema/schema/#the-__typename-field) of the top-level `Query` type.  This means every GraphQL server can respond to a `GET` request to a URL such as:

```
https://your.server/?query=%7B__typename%7D
```

Note that this health check will run an actual GraphQL operation. If your server requires special headers or cookies to run any query, you'll need to provide those with your request.

We recommend performing GraphQL-level health checks to ensure your server successfully serves traffic _and_ performs GraphQL operations.
## HTTP-level health checks
<!-- Update later one way or the other -->
> Note that the [`ApolloServerStandalone` package](../api/apollo-server.mdx) doesn't provide direct access to your HTTP server, so we recommend running a GraphQL-level health check to ensure your server is healthy.

If you are using an [integration with Apollo Server](../integrations/middleware/) and want to check if your HTTP server is serving traffic, you can add a simple HTTP-level health check handler directly to your web framework by returning a status of 200 to the URL path of your choice.

