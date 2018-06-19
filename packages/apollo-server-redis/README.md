## RedisKeyValueCache

This package exports an implementation of `KeyValueCache` that allows using Redis as a backing store for resource caching in [Data Sources](https://www.apollographql.com/docs/apollo-server/v2/features/data-sources.html).

## Usage

```js
const { RedisKeyValueCache } = require('apollo-server-redis');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: new RedisKeyValueCache({
    host: 'redis-server',
    // Options are passed through to the Redis client
  }),
  dataSources: () => ({
    moviesAPI: new MoviesAPI(),
  }),
});
```

For documentation of the options you can pass to the underlying redis client, look [here](https://github.com/NodeRedis/node_redis).
