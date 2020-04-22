## RedisCache

[![npm version](https://badge.fury.io/js/apollo-server-cache-redis.svg)](https://badge.fury.io/js/apollo-server-cache-redis)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)

This package exports an implementation of `KeyValueCache` that allows using Redis as a backing store for resource caching in [Data Sources](https://www.apollographql.com/docs/apollo-server/data/data-sources).

It currently supports a single instance of Redis, [Cluster](http://redis.io/topics/cluster-tutorial) and [Sentinel](http://redis.io/topics/sentinel).

## Usage

### Single instance

```js
const { RedisCache } = require('apollo-server-cache-redis');

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

### Sentinels

```js
const { RedisCache } = require('apollo-server-cache-redis');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: new RedisCache({
    sentinels: [{
      host: 'sentinel-host-01',
      port: 26379
    }],
    password: 'my_password',
    name: 'service_name',
    // Options are passed through to the Redis client
  }),
  dataSources: () => ({
    moviesAPI: new MoviesAPI(),
  }),
});
```

### Cluster

```js
const { RedisClusterCache } = require('apollo-server-cache-redis');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: new RedisClusterCache(
    [{
      host: 'redis-node-01-host',
      // Options are passed through to the Redis cluster client
    }],
    {
      // Cluster options are passed through to the Redis cluster client
    }
  ),
  dataSources: () => ({
    moviesAPI: new MoviesAPI(),
  }),
});
```

For documentation of the options you can pass to the underlying redis client, look [here](https://github.com/luin/ioredis).
