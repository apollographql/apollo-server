---
title: Unions and interfaces
description: Abstract schema types
---

**Unions** and **interfaces** are abstract GraphQL types that enable a schema field to return one of multiple object types.

## Union type

When you define a union type, you declare which object types are included in the union:

```graphql:title=schema.graphql
union Media = Book | Movie
```

A field can have a union as its return type. In this case, it can return any object type that's included in the union:

```graphql:title=schema.graphql
 type Query {
  allMedia: [Media] # This list can include both Books and Movies
}
```

All of a union's included types must be [object types](./schema/#object-types) (not scalars, input types, etc.). Included types do _not_ need to share any fields.

### Example

The following schema defines a `Result` union type that can return either a `Book` or an `Author`:

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

The `Result` union enables `Query.search` to return a list that includes both `Book`s and `Author`s.

### Querying a union field

GraphQL clients don't know which object type a union field will return for a particular query. To account for this, a query can include the subfields of _multiple possible types_.

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

To fully resolve a query that includes a union field, Apollo Server needs to specify _which_ of the union's types the field is returning. To achieve this, you define a `__resolveType` function for the union in your resolver map.

The `__resolveType` function uses a returned object's fields to determine its type. It then returns the name of that type as a string.

Here's an example `__resolveType` function for the `Result` union defined above:

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
      return null; // GraphQLError is thrown
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

> If a `__resolveType` function returns any value that _isn't_ the name of a valid type, the associated operation produces a GraphQL error.

## Interface type

An interface specifies a set of fields that multiple object types can include:

```graphql
interface Book {
  title: String
  author: Author
}
```

If an object type `implements` an interface, it _must_ include _all_ of that interface's fields:

```graphql
type Textbook implements Book {
  title: String # Must be present
  author: Author # Must be present
  courses: [Course]
}
```

A field can have an interface as its return type. In this case, it can return any object type that `implements` that interface:

```graphql
 type Query {
  schoolBooks: [Book] # Can include Textbooks
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

In this schema, `Query.schoolBooks` returns a list that can include both `Textbook`s and `ColoringBook`s.

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

As you might _not_ expect, clients can _also_ query an interface field for subfields that _aren't_ included in the interface:

```graphql
query GetBooks {
  schoolBooks {
    title # Always present (part of Book interface)
    ... on Textbook {
      courses { # Only present in Textbook
        name
      }
    }
    ... on ColoringBook {
      colors { # Only present in ColoringBook
        name
      }
    }
  }
}
```

This query uses [inline fragments](https://graphql.org/learn/queries/#inline-fragments) to fetch a `Book`'s `courses` (if it's a `Textbook`) or its `colors` (if it's a `ColoringBook`).

For more information, see [Using fragments with unions and interfaces](https://www.apollographql.com/docs/react/data/fragments/#using-fragments-with-unions-and-interfaces).


### Resolving an interface field

[As with union types](#resolving-a-union-field), Apollo Server requires interfaces to define a `__resolveType` function to determine which implementing object type an interface field is returning.

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
      return null; // GraphQLError is thrown
    },
  },
  Query: {
    schoolBooks: () => { ... }
  },
};
```
