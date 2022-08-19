# Apollo REST Data Source

This package exports a ([`RESTDataSource`](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-datasource-rest)) class which is used for fetching data from a REST API and exposing it via GraphQL within Apollo Server.

## Documentation

View the [Apollo Server documentation for data sources](https://www.apollographql.com/docs/apollo-server/features/data-sources/) for more details.

## Usage

To get started, install the `apollo-datasource-rest` package:

```bash
npm install apollo-datasource-rest
```

To define a data source, extend the [`RESTDataSource`](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-datasource-rest) class and implement the data fetching methods that your resolvers require.  Data sources can then be provided via the `dataSources` property to the `ApolloServer` constructor, as demonstrated in the _Accessing data sources from resolvers_ section below.

Your implementation of these methods can call on convenience methods built into the [RESTDataSource](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-datasource-rest) class to perform HTTP requests, while making it easy to build up query parameters, parse JSON results, and handle errors.

```javascript
const { RESTDataSource } = require('apollo-datasource-rest');

class MoviesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://movies-api.example.com/';
  }

  async getMovie(id) {
    return this.get(`movies/${encodeURIComponent(id)}`);
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

## API Reference
View the source code to see the all the properties and functions that can be overridden and their specific parameters. This section lists the usage and default behavior of the `RESTDatasource` class.

### Constructor Parameters
#### `httpFetch`

Optional constructor option which allows overriding the `fetch` implementation used when calling data sources.

### Properties
#### `baseURL`
Optional value to use for all the REST calls. If it is set in your class implementation, this base URL is used as the prefix for all calls. If it is not set, then the value passed to the REST call is exactly the value used.

```js title="baseURL.js"
class MoviesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://movies-api.example.com/';
  }

  // GET
  async getMovie(id) {
    return this.get(
      `movies/${encodeURIComponent(id)}` // path
    );
  }
}
```

#### `memoizeGetRequests`
By default, `RESTDataSource` caches all outgoing GET **requests** in a separate memoized cache from the regular response cache. It makes the assumption that all responses from HTTP GET calls are cacheable by their URL.
If a request is made with the same cache key (URL by default) but with an HTTP method other than GET, the cached request is then cleared.

If you would like to disable the GET request cache, set the `memoizeGetRequests` property to `false`. You might want to do this if your API is not actually cacheable or your data changes over time.

```js title="memoizeGetRequests.js"
class MoviesAPI extends RESTDataSource {
  constructor() {
    super();
    // Defaults to true
    this.memoizeGetRequests = false;
  }

  // Outgoing requests are never cached, however the response cache is still enabled
  async getMovie(id) {
    return this.get(
      `https://movies-api.example.com/movies/${encodeURIComponent(id)}` // path
    );
  }
}
```

### Methods

#### `cacheKeyFor`
By default, `RESTDatasource` uses the full request URL as the cache key. Override this method to remove query parameters or compute a custom cache key.

For example, you could use this to use header fields as part of the cache key. Even though we do validate header fields and don't serve responses from cache when they don't match, new responses overwrite old ones with different header fields.

#### `willSendRequest`
This method is invoked just before the fetch call is made. If a `Promise` is returned from this method it will wait until the promise is completed to continue executing the request.

#### `cacheOptionsFor`
Allows setting the `CacheOptions` to be used for each request/response in the HTTPCache. This is separate from the request-only cache.

#### `didReceiveResponse`
By default, this method checks if the response was returned successfully and parses the response into the result object. If the response had an error, it detects which type of HTTP error and throws the error result.

If you override this behavior, be sure to implement the proper error handling.

#### `didEncounterError`
By default, this method just throws the `error` it was given. If you override this method, you can choose to either perform some additional logic and still throw, or to swallow the error by not throwing the error result.


## Examples
### HTTP Methods

The `get` method on the [RESTDataSource](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-datasource-rest) makes an HTTP `GET` request. Similarly, there are methods built-in to allow for POST, PUT, PATCH, and DELETE requests.

```javascript
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
      `movies/${encodeURIComponent(movie.id)}`, // path
    );
  }
}
```

All of the HTTP helper functions (`get`, `put`, `post`, `patch`, and `delete`) accept a third options parameter, which can be used to set things like headers and referrers. For more info on the options available, see MDN's [fetch docs](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters).

### Intercepting fetches

Data sources allow you to intercept fetches to set headers, query parameters, or make other changes to the outgoing request. This is most often used for authorization or other common concerns that apply to all requests. Data sources also get access to the GraphQL context, which is a great place to store a user token or other information you need to have available.

You can easily set a header on every request:

```javascript
class PersonalizationAPI extends RESTDataSource {
  willSendRequest(request) {
    request.headers.set('Authorization', this.context.token);
  }
}
```

Or add a query parameter:

```javascript
class PersonalizationAPI extends RESTDataSource {
  willSendRequest(request) {
    request.params.set('api_key', this.context.token);
  }
}
```

If you're using TypeScript, make sure to import the `RequestOptions` type:

```javascript
import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';

class PersonalizationAPI extends RESTDataSource {
  baseURL = 'https://personalization-api.example.com/';

  willSendRequest(request: RequestOptions) {
    request.headers.set('Authorization', this.context.token);
  }
}
```

### Resolving URLs dynamically

In some cases, you'll want to set the URL based on the environment or other contextual values. To do this, you can override `resolveURL`:

```javascript
async resolveURL(request: RequestOptions) {
  if (!this.baseURL) {
    const addresses = await resolveSrv(request.path.split("/")[1] + ".service.consul");
    this.baseURL = addresses[0];
  }
  return super.resolveURL(request);
}
```

### Accessing data sources from resolvers

To give resolvers access to data sources, you pass them as options to the `ApolloServer` constructor:

```javascript
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

```javascript
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

### Implementing custom metrics

By overriding `trace` method, it's possible to implement custom metrics for request timing.

See the original method [implementation](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-datasource-rest/src/RESTDataSource.ts) or the reference.
