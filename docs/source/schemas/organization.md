---
title: Organization
description: Scaling your Apollo Server from a single file to your entire team
---

## Prerequisites

* essentials/schema for connection between:
  * GraphQL Types
  * Resolvers

## Overview

The GraphQL schema defines the api for Apollo Server, providing the single source of truth between client and server. A complete schema contains type definitions and resolvers. Type definitions are written and documented in the [Schema Definition Language(SDL)]() to define the valid server entry points. Corresponding to one to one with type definition fields, resolvers are functions that retrieve the data described by the type definitions. To accommodate this tight coupling, the type definitions and resolvers should be kept together in the same file. This collocation allows developers to modify fields and resolvers with atomic schema changes without unexpected consequences.

After explaining the self documenting nature of type definitions, this section will describe the strategies for organizing your schema. For many servers, keeping a single file of with the type definitions along with the server instantiation is sufficient. When a server becomes more complicated, it can be necessary to split out the schema into a separate file and export the schema. Extremely large schema may necessitate breaking up domains into separate files that can be combined together, a technique explained in the [advanced/modularize-a-schema]().

<h2 id="descriptions">Documenting your Schema</h2>

Documentation within the SDL enables the schema to be effective as the single source of truth between client and server. To enable that end, gui's to explore GraphQL have built-in support for displaying docstrings with markdown syntax. This schema example includes docstrings for types, fields and arguments.

```graphql
"""
Description for the type
"""
type MyObjectType {
  """
  Description for field
  Supports multi-line description
  """
  myField: String!

  otherField(
    """
    Description for argument
    """
    arg: Int
  )
}
```

# Single File

With proper documentation the type definitions, resolvers, and server instantiation should be kept in a single file if possible. To enable this collocation and keep the resolvers simple, a reusable model to retrieve data is often necessary. Designing a model is covered in [this section](). This example of collocating type definitions, resolvers, and server start contains the assumption that the books model can return objects with `title` and `author`.

```js
const { ApolloServer, gql } = require('apollo-server');

// Contains data fetching code for books
const Books = require('./model/books');

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    books: () => Books.getAll(),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

# Dedicated Schema File

When the instantiation of the server becomes more complicated, such as using a variant or adding extra functionality, such as context. Moving the type definitions and resolvers to a separate file can provide clarity. This example showcases this composition, first with the server startup:

```js
const { ApolloServer } = require('apollo-server');
const Schema = require('./schema');

// Server setup, such as additional middleware with a variant, creation of the context, or advanced schema manipulation

const server = new ApolloServer({ typeDefs: Schema.typeDefs, resolvers: Schema.resolvers });
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

The schema is placed in a separate file and remains the same as the previous single file example.

```js
//schema.js
const { gql } = require('apollo-server');
const Books = require('./model/books');

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    books: () => Books.getAll(),
  },
};

export { typeDefs, resolvers };
```

# Schema Modularization

With schemas spanning different organizations, breaking the schema out into separate files can become necessary. This separation can make maintaining the developer experience difficult. Schema modularization, covered in [advanced/modularize-a-schema](), enables schema modifications to remain atomic by organizing schema dependencies.
