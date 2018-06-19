---
title: Data Sources
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

```typescript
const { RESTDataSource } = require('apollo-datasource-rest');

class MoviesAPI extends RESTDataSource {
  baseURL = 'https://movies-api.example.com';

  async getMovie(id: string) {
    return this.get(`movies/${id}`);
  }

  async getMostViewedMovies(limit: number = 10) {
    const data = await this.get('movies', {
      per_page: limit,
      order_by: 'most_viewed',
    });
    return data.results;
  }
}
```

Data sources allow you to intercept fetches to set headers or make other changes to the outgoing request. This is most often used for authorization. Data sources also get access to the GraphQL execution context, which is a great place to store a user token or other information you need to have available.

```typescript
class PersonalizationAPI extends RESTDataSource {
  baseURL = 'https://personalization-api.example.com';

  willSendRequest(request: Request) {
    request.headers.set('Authorization', this.context.token);
  }

  async getFavorites() {
    return this.get('favorites');
  }

  async getProgressFor(movieId: string) {
    return this.get('progress', {
      id: movieId,
    });
  }
}
```

To give resolvers access to data sources, you pass them as options to the `ApolloServer` constructor:

```typescript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: new InMemoryKeyValueCache(maxSize: 1000000),
  dataSources: () => {
    return {
      moviesAPI: new MoviesAPI(),
      personalizationAPI: new PersonalizationAPI(),
    };
  },
  context: () => {
    return {
      token:
        'foo',
    };
  }
});
```

Apollo Server will put the data sources on the context for every request, so you can access them from your resolvers. It will also give your data sources access to the context. (The reason for not having users put data sources on the context directly is because that would lead to a circular dependency.)

From our resolvers, we can access the data source and return the result:

```typescript
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

```typescript
class PersonalizationAPI extends RESTDataSource {
  baseURL = 'https://personalization-api.example.com';

  willSendRequest(request: Request) {
    request.headers.set('Authorization', this.context.token);
  }

  private progressLoader = new DataLoader(async (ids: string[]) => {
    const progressList = await this.get('progress', {
      ids: ids.join(','),
    });
    return ids.map(id =>
      progressList.find((progress: any) => progress.id === id),
    );
  });

  async getProgressFor(id: string) {
    return this.progressLoader.load(id);
  }
```
