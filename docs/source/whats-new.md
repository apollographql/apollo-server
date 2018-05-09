---
title: What's new?
---

This section of the ApolloServer docs is an announcement page where it is easy to find and share big changes to the ApolloServer package, or the Apollo server side ecosystem. For a more detailed list of changes, check out the [Changelog](https://github.com/apollographql/apollo-server/blob/version-2/CHANGELOG.md).

## 2.0

ApolloServer 2.0 is a new effort targeted in making the most powerful and production ready GraphQL app easier than ever to build. Instead of providing all of the tools to figure out how to make a great GraphQL backend, the 2.0 brings everything together that we think you should be doing when building a GraphQL app. It is an opinionated, production focused, GraphQL server that works with any backend.

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
```

This is just the beginning. We have published a [roadmap](https://github.com/apollographql/apollo-server/blob/master/ROADMAP.md) for all of the features we will be bringing to ApolloServer soon and we would love your help! If you have any interest, you can get involved on [Github](https://github.com/apollographql/apollo-server) or by joining the [Apollo Slack](https://www.apollographql.com/slack) and going to the #apollo-server channel.

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
const { ApolloServer } = require('apollo-server');

const typeDefs = `
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

The default Apollo server provides a health check endpoint at `/.well-known/apollo/server-health` hat returns a 200 status code by default. If `onHealthCheck` is defined, the promise returned from the callback determines the status code. A successful resolution causes a 200 and rejection causes a 503. Health checks are often used by load balancers to determine if a server is available.

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
  console.log(`Try your health check at: ${url}/.well-known/apollo/server-health`);
});
```

