---
title: Unions and interfaces
description: How to add unions and interfaces to a schema
---

Unions and interfaces are great when you have fields that are in common between two types.

## Union type

The `Union` type indicates that a field can return more than one object type, but doesn't define specific fields itself.  Unions are useful for returning disjoint data types from a single field. The type definitions appear as follows:

```js
const { gql } = require('apollo-server');

const typeDefs = gql`
  union Result = Book | Author

  type Book {
    title: String
  }

  type Author {
    name: String
  }

  type Query {
    search: [Result]
  }
`;
```

Since a query requesting a union field, a query being made on a field which is union-typed must specify the object types containing the fields it wants. This ambiguity is solved by an extra `__resolveType` field in the resolver map. `__resolveType` defines the type of the result is out of the available options to GraphQL execution environment.

```js
const resolvers = {
  Result: {
    __resolveType(obj, context, info){
      if(obj.name){
        return 'Author';
      }

      if(obj.title){
        return 'Book';
      }

      return null;
    },
  },
  Query: {
    search: () => { ... }
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

A possible query for these results could appear as follows. This query demonstrates the need for the `__resolveType`, since it requests different data depending on the types,

```graphql
{
  search(contains: "") {
    ... on Book {
      title
    }
    ... on Author {
      name
    }
  }
}
```

## Interface type

Interfaces are a powerful way to build and use GraphQL schemas through the use of _abstract types_. Abstract types can't be used directly in schema, but can be used as building blocks for creating explicit types.

Consider an example where different types of books share a common set of attributes, such as _text books_ and _coloring books_. A simple foundation for these books might be represented as the following `interface`:

```graphql
interface Book {
  title: String
  author: Author
}
```

We won't be able to directly use this interface to query for a book, but we can use it to implement concrete types. Imagine a screen within an application which needs to display a feed of all books, without regard to their (more specific) type. To create such functionality, we could define the following:

```graphql
type TextBook implements Book {
  title: String
  author: Author
  classes: [Class]
}

type ColoringBook implements Book {
  title: String
  author: Author
  colors: [Color]
}

type Query {
  schoolBooks: [Book]
}
```

In this example, we've used the `Book` interface as the foundation for the `TextBook` and `ColoringBook` types. Then, a `schoolBooks` field simply expresses that it returns a list of books (i.e. `[Book]`).

Similarly to the `Union`, `Interface` requires an extra `__resolveType` field in the resolver map to determine which type the interface should resolve to.

```js
const resolvers = {
  Book: {
    __resolveType(book, context, info){
      if(book.classes){
        return 'TextBook';
      }

      if(book.colors){
        return 'ColoringBook';
      }

      return null;
    },
  },
  Query: {
    schoolBooks: () => { ... }
  },
};
```

Implementing the book feed example is now simplified since we've removed the need to worry about what kind of `Book`s will be returned. A query against this schema, which could return _text books_ and _coloring_ books, might look like:

```graphql
query GetBooks {
  schoolBooks {
    title
    author
  }
}
```

This is really helpful for feeds of common content, user role systems, and more!

Furthermore, if we need to return fields which are only provided by either `TextBook`s or `ColoringBook`s (not both) we can request fragments from the abstract types in the query. Those fragments will be filled in only as appropriate; in the case of the example, only coloring books will be returned with `colors`, and only textbooks will have `classes`:

```graphql
query GetBooks {
  schoolBooks {
    title
    ... on TextBook {
      classes {
        name
      }
    }
    ... on ColoringBook {
      colors {
        name
      }
    }
  }
}
```
