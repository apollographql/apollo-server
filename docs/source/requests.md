---
title: Operation request format
sidebar_title: Request format
description: How to send requests to Apollo Server over HTTP
---

By default, almost every GraphQL IDE and client library takes care of sending operations in a format that Apollo Server supports. This article describes that format.

> This format is also described on [graphql.org](https://graphql.org/learn/serving-over-http/) and in [this preliminary spec](https://github.com/graphql/graphql-over-http).

Apollo Server accepts queries and mutations sent as POST requests. It also accepts queries sent as GET requests.

## POST requests

Apollo Server accepts POST requests with a JSON body. A valid request contains a `query` field, along with optional `variables` and an `operationName` (if `query` contains multiple possible operations).

Let's say we want to execute the following query:

```graphql
query GetBestSellers($category:ProductCategory) {
  bestSellers(category: $category) {
    title
  }
}
```

 Here's an example of a valid POST request body for that query:

```json
{
  "query":"query GetBestSellers($category:ProductCategory){bestSellers(category: $category){title}}",
  "operationName": "GetBestSellers",
  "variables": { "category": "BOOKS" }
}
```

Note that `operationName` _isn't_ required for this particular request body, because `query` includes only one operation definition.

You can execute this query against an Apollo-hosted example server right now with the following `curl` command:

```sh
curl --request POST \
  -H 'Content-Type: application/json' \
  --data '{"query":"query GetBestSellers($category:ProductCategory){bestSellers(category: $category){title}}", "operationName":"GetBestSellers", "variables":{"category":"BOOKS"}}' \
  https://rover.apollo.dev/quickstart/products/graphql
```

> Apollo Server's default landing page provides a `curl` command you can use to execute a test query on your own server:
>
> <img class="screenshot" src="./images/as-landing-page-production.jpg" width="500" />

### Batching

You can send a batch of queries in a single POST request by providing a JSON-encoded array of query objects, like so:

```json
[
  {
    "query": "query { testString }"
  },
  {
    "query": "query AnotherQuery{ test(who: \"you\" ) }"
  }
]
```

If you send a batched request, Apollo Server responds with a corresponding array of GraphQL responses.

## GET requests

Apollo Server also accepts GET requests for queries (but not mutations). With a GET request, query details (`query`, `operationName`, `variables`) are provided as URL query parameters. The `variables` option is a URL-escaped JSON object.

> Sending queries as GET requests can help with [CDN caching](./performance/caching/#caching-with-a-cdn).

Here's the same query from [POST requests](#post-requests) formatted for a `curl` GET request:

```sh
curl --request GET \
  https://rover.apollo.dev/quickstart/products/graphql?query=query%20GetBestSellers%28%24category%3AProductCategory%29%7BbestSellers%28category%3A%20%24category%29%7Btitle%7D%7D&operationName=GetBestSellers&variables=%7B%22category%22%3A%22BOOKS%22%7D
```
