---
title: Health checks
description: Determining the health status of your server
---

Load balancers often use health checks to determine if a server is available and ready to serve traffic.

## GraphQL-level health checks

The easiest way to determine if your GraphQL server is healthy is to run a GraphQL operation!

Every GraphQL server supports a trivial query that requests the [`__typename`](https://www.apollographql.com/docs/apollo-server/schema/schema/#the-__typename-field) of the top-level `Query` type.  This means every GraphQL server can respond to a `GET` request with a URL like:

```
https://your.server/graphql?query=%7B__typename%7D
```

Note that this health check will run an actual GraphQL operation. If your server requires special headers or cookies to run any query, you'll need to provide those in your request.
## Adding HTTP-level health checks

If you'd like to check if your HTTP server is successfully serving, you can choose to add an HTTP-level health check. If you are using an [integration with Apollo Server](http://localhost:8000/integrations/middleware/) you can create your own health check handler by defining [framework-specific middleware function](../api/apollo-server/#framework-specific-middleware-function) that returns 200 to the URL path of your choice.

Note that that the [`ApolloStandAlone` package](LINKHERE) doesn't provide you with direct access to your HTTP server, we instead recommend running a GraphQL-level health check to ensure your GraphQL server is working properly.
