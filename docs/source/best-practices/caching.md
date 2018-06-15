---
title: Caching
description: Caching operations
---

One of the best ways we can speed up our application is to implement caching into it. Apollo Client has a intelligent cache which greatly lowers the work the client needs to do to fetch and manage data, but what about our server? Caching in Apollo Server can be done in a number of ways, but we recommend three in particular that have a good balance between complexity to manage and benefit of use.

<h2 id="whole-query">Whole query caching</h2>

GraphQL operations on a client are best when they are statically defined and used in an application. When this is the case, often times there will be operations that could easily be cached as a full result of the the request. We call this *whole query caching* and it is incredibly easy to implement with Apollo Server. Unlike custom REST endpoints, using Apollo Server allows us to define the cacheability of our resources and dynamically calculate the best possible cache timing for any given operation.

- For more information about setting up Apollo Engine with Apollo Server, [read this guide]()
- For more information about setting up whole query caching with Apollo Engine, [read this guide](https://www.apollographql.com/docs/engine/caching.html)

<h2 id="cdn-caching">CDN integration</h2>

If our application has a lot of public data that doesn’t change very frequently, and it’s important for it to load quickly, we will probably benefit from using a CDN to cache our API results. This can be particularly important for media or content companies like news sites and blogs.

A CDN will store our API result close to the “edge” of the network — that is, close to the region the user is in — and deliver a cached result much faster than it would have required to do a full round-trip to our actual server. As an added benefit, we get to save on server load since that query doesn’t actually hit our API.

- Setting up CDN caching with Apollo Server is incredibly easy, simply setup Apollo Engine then follow this [guide](https://www.apollographql.com/docs/engine/cdn.html)
- For more information about using a CDN with Apollo Engine, check out this [article](https://dev-blog.apollodata.com/caching-graphql-results-in-your-cdn-54299832b8e2)

