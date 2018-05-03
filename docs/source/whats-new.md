---
title: What's new?
---

This section of the ApolloServer docs is an announcement page where it is easy to find and share big changes to the ApolloServer package, or the Apollo server side ecosystem. For a more detailed list of changes, check out the [Changelog]().

## 2.0

ApolloServer 2.0 is a new effort targeted in making the most powerful and production ready GraphQL app easier than ever to build. Instead of providing all of the tools to figure out how to make a great GraphQL backend, the 2.0 brings everything together that we think you should be doing when building a GraphQL app. It is an opinionated, production focused, GraphQL server that works with any backend.

TODO code example

This is just the beginning. We have published a [roadmap]() for all of the features we will be bringing to ApolloServer soon and we would love your help! If you have any interest, you can get involved on [Github]() or by joining the [Apollo Slack]() and going to the #apollo-server channel.

## Errors

Apollo Server provides the ability to add error codes to categorize errors that occur within resolvers. In addition to an error code, Apollo Server 2 passes error stack traces in development mode to enable a smoother getting started experience.

This code snippet shows how the new error could be used. For more information, take a look at [this section]()

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
