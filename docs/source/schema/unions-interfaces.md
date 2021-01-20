---
title: Unions and interfaces
description: Polymorphic schema types
---

**Unions** and **interfaces** are polymorphic GraphQL types that enable a schema field to contain one of multiple object types.

> **Tip:** If a field can contain object types that **all share relevant subfields**, use an interface. Otherwise, use a union.

## Union type

A union type indicates that a field's value might be one of multiple distinct object types. Those object types are _not_ required to share any fields (but they can).

### Syntax

The following schema defines a `Result` union type that can contain either a `Book` or an `Author`:

```graphql
union Result = Book | Author

type Book {
  title: String
}

type Author {
  name: String
}

type Query {
  search(contains: String): [Result]
}
```

In this schema, the `Result` union enables `Query.search` to return a list that includes both `Book`s and `Author`s.

> All possible values of a union type must be [object types](./schema/#object-types) (not scalar types, input types, etc.).

### Querying a union field

A union's subfields differ depending on which object type the union contains. For example, in the schema above, a `Result` has a `title` if it's a `Book`, and it has a `name` if it's an `Author`.

GraphQL clients don't know which object type a union will return for a particular query, so a query can include the subfields of _multiple possible types_.

Here's a valid query for the schema above:

```graphql
query GetSearchResults {
  search(contains: "Shakespeare") {
    ... on Book {
      title
    }
    ... on Author {
      name
    }
  }
}
```

This query uses [inline fragments](https://graphql.org/learn/queries/#inline-fragments) to fetch a `Result`'s `title` (if it's a `Book`) or its `name` (if it's an `Author`).

For more information, see [Using fragments with unions and interfaces](https://www.apollographql.com/docs/react/data/fragments/#using-fragments-with-unions-and-interfaces).


### Resolving a union field

To fully resolve a union field for client queries, Apollo Server needs to specify which valid object type the field contains. To achieve this, you define a `__resolveType` function for the union type in your resolver map.

 The `__resolveType` function uses a returned object's fields to determine its type and returns the name of that type as a string.

 Here's an example `__resolveType` function for the `Result` union type defined above:

```js{3-11}
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

## Interface type

An interface specifies a set of fields that multiple object types can include:

```graphql
interface Book {
  title: String
  author: Author
}
```

If an object type `implement`s an interface, it _must_ include _all_ of that interface's fields:

```graphql
type Textbook implements Book {
  title: String # Must be present
  author: Author # Must be present
  courses: [Course]
}
```

A schema field can have an interface as its type. If it does, the field can contain any object type that implements that interface:

```graphql
 type Query {
  schoolBooks: [Book] # Can contain Textbooks
}
```

### Example

The following schema defines a `Book` interface, along with two object types that implement it:

```graphql
interface Book {
  title: String
  author: Author
}

type Textbook implements Book {
  title: String
  author: Author
  courses: [Course]
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

In this schema, `Query.schoolBooks` can return a list that includes both `Textbook`s and `ColoringBook`s.

### Querying an interface field

As you might expect, clients can query an interface field for any subfields included in the interface:

```graphql
query GetBooks {
  schoolBooks {
    title
    author
  }
}
```

As you might _not_ expect, clients can _also_ query an interface field for subfields that only belong to a _particular implementing object type_.

Here's another valid query for the schema above:

```graphql
query GetBooks {
  schoolBooks {
    title
    ... on Textbook {
      courses {
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

This query uses [inline fragments](https://graphql.org/learn/queries/#inline-fragments) to fetch a `Book`'s `courses` (if it's a `Textbook`) or its `colors` (if it's a `ColoringBook`).

For more information, see [Using fragments with unions and interfaces](https://www.apollographql.com/docs/react/data/fragments/#using-fragments-with-unions-and-interfaces).


### Resolving an interface field

[As with union types](#resolving-a-union-field), Apollo Server requires interfaces to define a `__resolveType` function to determine which valid object type an interface field contains.

Here's an example `__resolveType` function for the `Book` interface defined above:

```js{3-11}
const resolvers = {
  Book: {
    __resolveType(book, context, info){
      if(book.courses){
        return 'Textbook';
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
