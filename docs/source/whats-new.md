---
title: What's new?
---

This section of the Apollo Server docs is an announcement page where it is easy to find and share big changes to the ApolloServer package, or the Apollo server side ecosystem. For a more detailed list of changes, check out the [Changelog](https://github.com/apollographql/apollo-server/blob/version-2/CHANGELOG.md).

## 2.0

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
    hello: () => fetch('https://fourtonfish.com/hellosalut/?mode=auto').then(res => res.json()).then(data => data.hello)
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  mocks: true,
  onHealthCheck: () => fetch('https://fourtonfish.com/hellosalut/?mode=auto'),
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

This is just the beginning. We have published a [roadmap](https://github.com/apollographql/apollo-server/blob/master/ROADMAP.md) for all of the features we will be bringing to Apollo Server soon and we would love your help! If you have any interest, you can get involved on [Github](https://github.com/apollographql/apollo-server) or by joining the [Apollo Slack](https://www.apollographql.com/slack) and going to the #apollo-server channel.

## [Errors](./features/errors.html)

Apollo Server provides the ability to add error codes to categorize errors that occur within resolvers. In addition to an error code, Apollo Server 2 passes error stack traces in development mode to enable a smoother getting started experience.

This code snippet shows how the new error could be used.

```js
const { ApolloError, ForbiddenError, AuthenticationError } = require("apollo-server");

const resolvers = {
  Query: {
    allTodos: (_, _, context) => {
      if (!context.scope) {
        throw AuthenticationError("You must be logged in to see all todos");
      }

      if (context.scope !== "ADMIN") {
        throw ForbiddenError("You must be an administrator to see all todos");
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

## [Mocking](features/mocking.html)

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
  console.log(`🚀 Server ready at ${url}`)
});
```

## Health Checks

The default Apollo server provides a health check endpoint at `/.well-known/apollo/server-health` that returns a 200 status code by default. If `onHealthCheck` is defined, the promise returned from the callback determines the status code. A successful resolution causes a 200 and rejection causes a 503. Health checks are often used by load balancers to determine if a server is available.

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql``;
const resolvers = {};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  //optional parameter
  onHealthCheck: () => new Promise((resolve, reject) => {
    //database check or other asynchronous action
  }),
});


server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`Try your health check at: ${url}.well-known/apollo/server-health`);
});
```

## [Performance Monitoring](./features/metrics.html)

Apollo Server 2.0 enables GraphQL monitoring out of the box. It reports performance and error data out-of-band to Apollo Engine. And Apollo Engine displays information about every query and schema present in your GraphQL service.

To set up Apollo Server with Engine, [click here](https://engine.apollographql.com/) to get an Engine API key and provide it to the `ENGINE_API_KEY` environment variable. Setting an environment variable can be done in commandline as seen below or with the [dotenv npm package](https://www.npmjs.com/package/dotenv).

```bash
#Replace YOUR_API_KEY with the api key for you service in the Engine UI
ENGINE_API_KEY=YOUR_API_KEY node start-server.js
```

The simplest option is to pass the Engine API Key directly to the Apollo Server constructor.

```js line=6-8
const { ApolloServer } = require("apollo-server");

const server = new ApolloSever({
  typeDefs,
  resolvers,
  engine: {
    apiKey: "YOUR API KEY HERE"
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```


## GraphQL Playground

Apollo Server 2.0 creates a single GraphQL endpoint that provides data and a gui explorer depending on how the endpoint is accessed. In browser, Apollo Server returns GraphQL playground. For other cases, Apollo server returns the data for a GraphQL requests from other clients, such as Apollo Client, curl, Postman, or Insomnia.

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hello'
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

To start production mode, set the NODE_ENV environment variables to `production`. The Apollo Server constructor accepts `introspection` as a boolean, which can overwrite the default for the environment.

## File Uploads

For server integrations that support file uploads(express, hapi, koa, etc), Apollo Server enables file uploads by default. To enable file uploads, reference the `Upload` type in the schema passed to the Apollo Server construction.

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
        //Contents of Upload scalar: https://github.com/jaydenseric/apollo-upload-server#upload-scalar
        //file.stream is a node stream that contains the contents of the uploaded file
        //node stream api: https://nodejs.org/api/stream.html
        return file;
      })
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

> Note: Apollo Server adds the Upload scalar to the schema, so any existing declaration of `scalar Upload` in the schema should be removed

## [Subscriptions](/docs/graphql-subscriptions/)

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

> Note: to disable subscriptions, set `subscriptions` to `false` in the options passed to `listen`
