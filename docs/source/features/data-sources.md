---
title: Data sources
description: Caching Partial Query Results
---

Data sources are classes that encapsulate fetching data from a particular service, with built-in support for caching, deduplication, and error handling. You write the code that is specific to interacting with your backend, and Apollo Server takes care of the rest.

## REST Data Source

A `RESTDataSource` is responsible for fetching data from a given REST API.

To get started, install the release candidate of the REST data source:

```bash
npm install apollo-datasource-rest@rc
```

To define a data source, extend the `RESTDataSource` class and implement the data fetching methods that your resolvers require. Your implementation of these methods can call on convenience methods built into the `RESTDataSource` class to perform HTTP requests, while making it easy to build up query parameters, parse JSON results, and handle errors.

```js
const { RESTDataSource } = require('apollo-datasource-rest');

class MoviesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://movies-api.example.com/';
  }

  async getMovie(id) {
    return this.get(`movies/${id}`);
  }

  async getMostViewedMovies(limit = 10) {
    const data = await this.get('movies', {
      per_page: limit,
      order_by: 'most_viewed',
    });
    return data.results;
  }
}
```

### Supported Methods

The `get` method on the `RESTDataSource` makes an HTTP `GET` request. Similarly, there are methods built-in to allow for `POST`, `PUT`, `PATCH`, and `DELETE` requests.

```js
class MoviesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://movies-api.example.com/';
  }

  // an example making an HTTP POST request
  async postMovie(movie) {
    return this.post(
      `movies`, // path
      movie, // request body
    );
  }

  // an example making an HTTP PUT request
  async newMovie(movie) {
    return this.put(
      `movies`, // path
      movie, // request body
    );
  }

  // an example making an HTTP PATCH request
  async updateMovie(movie) {
    return this.patch(
      `movies`, // path
      { id: movie.id, movie }, // request body
    );
  }

  // an example making an HTTP DELETE request
  async deleteMovie(movie) {
    return this.delete(
      `movies/${movie.id}`, // path
    );
  }
}
```

All of the HTTP helper functions (`get`, `put`, `post`, `patch`, and `delete`) accept a third `options` parameter, which can be used to set things like headers and referrers. For more info on the options available, see MDN's [fetch docs](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters).

### Example API

Data sources allow you to intercept fetches to set headers or make other changes to the outgoing request. This is most often used for authorization. Data sources also get access to the GraphQL execution context, which is a great place to store a user token or other information you need to have available.

```js
class PersonalizationAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://personalization-api.example.com/';
  }

  willSendRequest(request) {
    request.headers.set('Authorization', this.context.token);
  }

  async getFavorites() {
    return this.get('favorites');
  }

  async getProgressFor(movieId) {
    return this.get('progress', {
      id: movieId,
    });
  }
}
```

To give resolvers access to data sources, you pass them as options to the `ApolloServer` constructor:

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      moviesAPI: new MoviesAPI(),
      personalizationAPI: new PersonalizationAPI(),
    };
  },
  context: () => {
    return {
      token: 'foo',
    };
  },
});
```

Apollo Server will put the data sources on the context for every request, so you can access them from your resolvers. It will also give your data sources access to the context. (The reason for not having users put data sources on the context directly is because that would lead to a circular dependency.)

From our resolvers, we can access the data source and return the result:

```js
 Query: {
    movie: async (_source, { id }, { dataSources }) => {
      return dataSources.moviesAPI.getMovie(id);
    },
    mostViewedMovies: async (_source, _args, { dataSources }) => {
      return dataSources.moviesAPI.getMostViewedMovies();
    },
    favorites: async (_source, _args, { dataSources }) => {
      return dataSources.personalizationAPI.getFavorites();
    },
  },
```

## What about DataLoader?

[DataLoader](https://github.com/facebook/dataloader) was designed by Facebook with a specific use case in mind: deduplicating and batching object loads from a data store. It provides a memoization cache, which avoids loading the same object multiple times during a single GraphQL request, and it coalesces loads that occur during a single tick of the event loop into a batched request that fetches multiple objects at once.

Although DataLoader is great for that use case, it’s less helpful when loading data from REST APIs because its primary feature is _batching_, not _caching_. What we’ve found to be far more important when layering GraphQL over REST APIs is having a resource cache that saves data across multiple GraphQL requests, can be shared across multiple GraphQL servers, and has cache management features like expiry and invalidation that leverage standard HTTP cache control headers.

#### Batching

Most REST APIs don't support batching, and if they do, using a batched endpoint may actually jeopardize caching. When you fetch data in a batch request, the response you receive is for the exact combination of resources you're requesting. Unless you request that same combination again, future requests for the same resource won't be served from cache.
Our recommendation is to restrict batching to requests that can't be cached. In those cases, you can actually take advantage of DataLoader as a private implementation detail inside your data source.

```js
class PersonalizationAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://personalization-api.example.com/';
  }

  willSendRequest(request) {
    request.headers.set('Authorization', this.context.token);
  }

  private progressLoader = new DataLoader(async (ids) => {
    const progressList = await this.get('progress', {
      ids: ids.join(','),
    });
    return ids.map(id =>
      progressList.find((progress) => progress.id === id),
    );
  });

  async getProgressFor(id) {
    return this.progressLoader.load(id);
  }
```

## Using Memcached/Redis as a cache storage backend

By default, resource caching will use an in memory LRU cache. When running multiple server instances, you'll want to use a shared cache backend instead. That's why Apollo Server also includes support for using [Memcached](../../../packages/apollo-server-memcached) or [Redis](../../../packages/apollo-server-redis) as your backing store. You can specify which one to use by creating an instance and passing it into the Apollo Server constructor:

```js
const { MemcachedCache } = require('apollo-server-memcached');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: new MemcachedCache(
    ['memcached-server-1', 'memcached-server-2', 'memcached-server-3'],
    { retries: 10, retry: 10000 }, // Options
  ),
  dataSources: () => ({
    moviesAPI: new MoviesAPI(),
  }),
});
```

For documentation of the options you can pass to the underlying Memcached client, look [here](https://github.com/3rd-Eden/memcached).

```js
const { RedisCache } = require('apollo-server-redis');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: new RedisCache({
    host: 'redis-server',
    // Options are passed through to the Redis client
  }),
  dataSources: () => ({
    moviesAPI: new MoviesAPI(),
  }),
});
```

For documentation of the options you can pass to the underlying Redis client, look [here](https://github.com/NodeRedis/node_redis).

## Implementing your own cache backend

Apollo Server exposes a `KeyValueCache` interface that you can use to implement connectors to other data stores, or to optimize for the query characteristics of your application. More information can be found in the package readme for [apollo-server-caching](https://www.npmjs.com/package/apollo-server-caching).
