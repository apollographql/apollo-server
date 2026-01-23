---
title: Hardening for Production
description: Important resources for securely deploying Apollo Server in production environments.
---

When deploying Apollo Server in a production environment, there are additional considerations to ensure the security and integrity of your server.
All of this has already been covered in other places, so here are some links to relevant resources that you should review before going to production.

# Recommended resources

## GraphOS Production Readiness Checklist

The [Apollo GraphOS Production Readiness Checklist](https://www.apollographql.com/docs/graphos/platform/production-readiness/checklist) is a comprehensive resource that outlines best practices for deploying and managing GraphQL services with GraphOS in production.
For Apollo Server specific advice, pay special attention to the [Subgraphs/servers](https://www.apollographql.com/docs/graphos/platform/production-readiness/checklist#subgraphsservers) section.

## GraphOS "Graph Security" guide

If you are using Apollo GraphOS, there is also a lot of great advice available in the [GraphOS Graph Security](https://www.apollographql.com/docs/graphos/platform/security/overview) documentation.

## GraphQL's Going to Production guide

As Apollo Server internally uses the `graphql` npm package, we recommend going over the [Going to Production](https://www.graphql-js.org/docs/going-to-production/) guide from the GraphQL team, as it is an excellent resource.

If you are using Apollo GraphOS, many of these security best practices are already handled for you or are available as GraphOS features.
So here is some additional context that you should keep in mind when reading that document:

* As a GraphOS user, you can use [safelisted persisted queries](https://www.apollographql.com/docs/graphos/platform/security/persisted-queries) wherever that guide mentions "trusted documents".
While the name is similar, this is a different concept from Apollo Server's [automatic persisted queries (APQ)](https://www.apollographql.com/docs/apollo-server/performance/apq/), which is, as that guide points out, a performance feature, not a security feature.
* The [limiting query complexity and depth](https://www.graphql-js.org/docs/going-to-production/#limit-query-complexity) section is also important, as it helps protect your server from denial-of-service (DoS) attacks. Consider using GraphOS's [operation limits](https://www.apollographql.com/docs/graphos/platform/security/overview#set-operation-limits) feature to help with this.
* Observability concerns will already be taken care of by GraphOS, so you can skip that section of the guide. Read [GraphOS Metrics and Insights](https://www.apollographql.com/docs/graphos/platform/insights/) for more information about GraphOS's observability features.
* Pay attention to the [control what errors are exposed](https://www.graphql-js.org/docs/going-to-production/#control-what-errors-are-exposed-to-clients) section about error handling, as exposing internal errors to clients can leak sensitive information about your server's implementation and schema. See our [masking and logging errors](https://www.apollographql.com/docs/apollo-server/data/errors#masking-and-logging-errors) section in the Error Handling guide for more details.
* The [manage your schema safely](https://www.graphql-js.org/docs/going-to-production/#manage-your-schema-safely) recommendations can be achieved with [GraphOS Schema Management](https://www.apollographql.com/docs/graphos/platform/schema-management)
