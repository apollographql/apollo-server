## MemcachedCache

[![npm version](https://badge.fury.io/js/apollo-server-cache-memcached.svg)](https://badge.fury.io/js/apollo-server-cache-memcached)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server/tree/main.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)

This package exports an implementation of `KeyValueCache` that allows using Memcached as a backing store for resource caching in [Data Sources](https://www.apollographql.com/docs/apollo-server/v2/features/data-sources.html).

## Usage

```js
const { MemcachedCache } = require('apollo-server-cache-memcached');

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

For documentation of the options you can pass to the underlying memcached client, look [here](https://github.com/3rd-Eden/memcached).
