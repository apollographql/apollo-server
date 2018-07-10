## DynamoDBCache

This package exports an implementation of `KeyValueCache` that allows using DynamoDB as a backing store for persisted queries and resource caching of data sources.

## Setup

You will need a DynamoDB table to store the persisted queries or data sources.
Default table name is apollo-persisted-queries.

If you want to use DynamoDB TTL support you need to define as per AWS documentation [here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/time-to-live-ttl-how-to.html)

Set the ttl attribute to be 'ttl'.

## Usage

For documentation of the options you can pass to the underlying dynamoDB client including a table name, look [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property).

The second object passed in the constructor accepts only 1 attributes for now:
  tableName
describing the DynamoDB table to get and set the queries.

### Persisted Query Cache

```js
const { DynamoDBCache } = require('apollo-server-dynamodb');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  persistedQueries: {
    cache: new DynamoDBCache({
      endpoint: 'localhost OR AWS endpoint',
      region: 'local OR us-east-1 etc.',
      // Options are passed through to the DynamoDB client
    },
    {
      tableName: 'my-apollo-persisted-queries',
      ttl: 0
    }),
    dataSources: () => ({
      moviesAPI: new MoviesAPI(),
    }),
  }
});
```

### Data sources cache

```js
const { DynamoDBCache } = require('apollo-server-dynamodb');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: new DynamoDBCache({
    endpoint: 'localhost OR AWS endpoint',
    region: 'local OR us-east-1 etc.',
    // Options are passed through to the DynamoDB client
  },
  {
    tableName: 'my-apollo-persisted-queries'
  }),
  dataSources: () => ({
    moviesAPI: new MoviesAPI(),
  }),
});
```

## Roadmap

### Completed

* DynamoDB cache for persisted queries & data sources

### Current

* Add tests

### Next up

* Support DAX
* LRU cache first priority
* More DynamoDB configuration options
* AWS X-Ray support

