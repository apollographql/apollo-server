---
title: What's new?
description: A quick rundown of big announcements in the Apollo Server ecosystem.
---

## 2.0

> To upgrade from Apollo Server 1.x, see the [2.0 migration guide](./migration-two-dot.html).  For a more detailed list of smaller changes, see the Apollo Server [`CHANGELOG`](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md).

Apollo Server 2.0 makes building the most powerful and production ready GraphQL app easy. Apollo Server 1.x provided all of the tools necessary to make a great GraphQL backend, allowing the developer to pick and choose from a set of unopinionated tools. Building on 1.x and fully backwards compatible, 2.0's defaults bake in the best practices and patterns gathered from two years of community feedback and iteration. It is an opinionated, production focused, GraphQL server that works with any backend.

The following code snippet demonstrates the creation of Apollo Server 2.0 and a few of the new features.

```js
const { ApolloServer, gql } = require('apollo-server');

// The GraphQL schema
const typeDefs = gql`
  type Query {
    hello: String
    mockedString: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () =>
      fetch('https://fourtonfish.com/hellosalut/?mode=auto')
        .then(res => res.json())
        .then(data => data.hello),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  mocks: true,
  onHealthCheck: () => fetch('https://fourtonfish.com/hellosalut/?mode=auto'),
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

This is just the beginning. We have published a [roadmap](https://github.com/apollographql/apollo-server/blob/master/ROADMAP.md) for all of the features we will be bringing to Apollo Server soon and we would love your help! If you have any interest, you can get involved on [Github](https://github.com/apollographql/apollo-server) or by joining the [Apollo Slack](https://www.apollographql.com/slack) and going to the #apollo-server channel.

### Automatic Persisted Queries

A persisted query is an ID or hash that can be sent to the server in place of the GraphQL query string. This smaller signature reduces bandwidth utilization and speeds up client loading times. Apollo Server enables persisted queries without additional server configuration, using an in-memory LRU cache to store the mapping between hash and query string. The persisted query cache can be configured as shown in the following code snippet. To enable persisted queries on the client, follow the [Performance Guide](https://www.apollographql.com/docs/guides/performance.html#Automatic-Persisted-Queries).

```js line=7-12
const { ApolloServer } = require('apollo-server');
const { MemcachedCache } = require('apollo-server-cache-memcached');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  persistedQueries: {
    cache: new MemcachedCache(
      ['memcached-server-1', 'memcached-server-2', 'memcached-server-3'],
      { retries: 10, retry: 10000 }, // Options
    ),
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

For more information on automatic persisted queries, check the [APQ section of the performance guide](https://www.apollographql.com/docs/guides/performance.html#automatic-persisted-queries).

### CDN integration

Apollo Server works well with a Content-Distribution Network to cache full GraphQL query results. Apollo Server provides `cache-control` headers that a CDN uses to determine how long a request should be cached. For subsequent requests, the result will be served directly from the CDN's cache. A CDN paired with Apollo Server's persisted queries is especially powerful, since GraphQL operations can be shortened and sent with a HTTP GET request. Read more about [caching in Apollo Server](./features/caching.html).

### GraphQL errors

Apollo Server provides the ability to add error codes to categorize errors that occur within resolvers. In addition to an error code, Apollo Server 2 passes error stack traces in development mode to enable a smoother getting started experience.

This code snippet shows how the new error could be used.

```js
const { ApolloError, ForbiddenError, AuthenticationError } = require("apollo-server");

const resolvers = {
  Query: {
    allTodos: (_, _, context) => {
      if (!context.scope) {
        throw new AuthenticationError("You must be logged in to see all todos");
      }

      if (context.scope !== "ADMIN") {
        throw new ForbiddenError("You must be an administrator to see all todos");
      }

      return context.Todos.getAllTodos();
    },
  }
  Mutation: {
    addTodo: (_, args, context) => {
      if(!context.Todos.idAvailable(args.id)) {
        throw new ApolloError('The id is already taken', 'DUPLICATE_KEY',  {field: 'id'});
      }

      return context.Todos.addTodo(args.id, args.todo);
    }
  }
};
```

For more information, read about [errors in Apollo Server 2](./features/errors.html).

### Schema mocking

Apollo Server 2 allows mocking of a schema with the `mocks` parameter in the constructor. The `mocks` parameter can be a boolean to enable the default mocking functions or an object to define custom mock functions by type.

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    hello: String
    resolved: String
  }
`;

const resolvers = {
  Query: {
    resolved: () => 'Resolved',
  },
};

const mocks = {
  Int: () => 6,
  Float: () => 22.1,
  String: () => 'Hello',
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  mocks,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

For more information, check out the [feature explanation about mocking](./features/mocking.html).

### Performance monitoring

Apollo Server 2.0 enables GraphQL monitoring out of the box. It reports performance and error data out-of-band to Apollo Engine. And Apollo Engine displays information about every query and schema present in your GraphQL service.

To set up Apollo Server with Engine, [click here](https://engine.apollographql.com/) to get an Engine API key and provide it to the `ENGINE_API_KEY` environment variable. Setting an environment variable can be done on the command-line as seen below, or with the [`dotenv` npm package](https://www.npmjs.com/package/dotenv).

```bash
#Replace YOUR_API_KEY with the api key for you service in the Engine UI
ENGINE_API_KEY=YOUR_API_KEY node start-server.js
```

The simplest option is to pass the Engine API Key directly to the Apollo Server constructor.

```js line=6-8
const { ApolloServer } = require('apollo-server');

const server = new ApolloSever({
  typeDefs,
  resolvers,
  engine: {
    apiKey: 'YOUR API KEY HERE',
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

For more information, check out the details in the [performance monitoring guide](./features/metrics.html).

### GraphQL Playground

Apollo Server 2.0 creates a single GraphQL endpoint that provides data and a GUI explorer depending on how the endpoint is accessed. In browser, Apollo Server returns GraphQL playground. For other cases, Apollo Server returns the data for GraphQL requests from other clients, such as Apollo Client, curl, Postman, or Insomnia.

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hello',
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

To start in production mode, set the `NODE_ENV` environment variables to `production`. For further customization, the Apollo Server constructor options accepts an `introspection` boolean, which can overwrite the default for the environment.

For additional information, check out the [guide on configuring GraphQL playground](./features/graphql-playground.html).

### File Uploads

> Note: This feature is incompatible with `graphql-tools`' schema stitching.  See [this issue](https://github.com/apollographql/graphql-tools/issues/671) for additional details.

For server integrations that support file uploads (e.g. Express, hapi, Koa), Apollo Server enables file uploads by default. To enable file uploads, reference the `Upload` type in the schema passed to the Apollo Server construction.

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    uploads: [File]
  }

  type Mutation {
    singleUpload(file: Upload!): File!
  }
`;

const resolvers = {
  Query: {
    uploads: (parent, args) => {},
  },
  Mutation: {
    singleUpload: (parent, args) => {
      return args.file.then(file => {
        //Contents of Upload scalar: https://github.com/jaydenseric/graphql-upload#class-graphqlupload
        //file.stream is a node stream that contains the contents of the uploaded file
        //node stream api: https://nodejs.org/api/stream.html
        return file;
      });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

> Note: When using `typeDefs` Apollo Server adds `Upload scalar` to your schema, so any existing declaration of `scalar Upload` in the type definitions should be removed. If you create your schema with `makeExecutableSchema` and pass it to `ApolloServer` constructor using the `schema` param, make sure to include [`Upload scalar`](https://www.apollographql.com/docs/guides/file-uploads.html#File-upload-with-schema-param).

### Subscriptions

Subscriptions are enabled by default in integrations that support persistent connections.

```js
const { ApolloServer, gql, PubSub } = require('apollo-server');

const pubsub = new PubSub();
const SOMETHING_CHANGED_TOPIC = 'something_changed';

const typeDefs = gql`
  type Query {
    hello: String
  }
  type Subscription {
    newMessage: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hello',
  },
  Subscription: {
    newMessage: {
      subscribe: () => pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

//publish events every second
setInterval(
  () =>
    pubsub.publish(SOMETHING_CHANGED_TOPIC, {
      newMessage: new Date().toString(),
    }),
  1000,
);
```

> Note: to disable subscriptions, set `subscriptions` to `false` in the options passed to `listen`.

For more information, check out the [documentation for GraphQL subscriptions](/docs/graphql-subscriptions/).

### Health checks

The default Apollo Server provides a health check endpoint at `/.well-known/apollo/server-health` that returns a 200 status code by default. If `onHealthCheck` is defined, the promise returned from the callback determines the status code. A successful resolution causes a 200 and rejection causes a 503. Health checks are often used by load balancers to determine if a server is available.

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql``;
const resolvers = {};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  //optional parameter
  onHealthCheck: () =>
    new Promise((resolve, reject) => {
      //database check or other asynchronous action
    }),
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(
    `Try your health check at: ${url}.well-known/apollo/server-health`,
  );
});
```
