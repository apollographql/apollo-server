---
title: Unions and Interfaces
description: Abstract schema types
---

**Unions** and **interfaces** are abstract GraphQL types that enable a schema field to return one of multiple object types.

## Union type

When you define a union type, you declare which object types are included in the union:

```graphql
union Media = Book | Movie
```

A field can have a union (or a list of that union) as its return type. In this case, it can return any object type that's included in the union:

```graphql
type Query {
  allMedia: [Media] # This list can include both Book and Movie objects
}
```

All of a union's included types must be [object types](./schema/#object-types) (not scalars, input types, etc.). Included types do _not_ need to share any fields.

### Example

The following schema defines a `SearchResult` union type that can return either a `Book` or an `Author`:

```graphql {1,12}
union SearchResult = Book | Author

type Book {
  title: String!
}

type Author {
  name: String!
}

type Query {
  search(contains: String): [SearchResult!]
}
```

The `SearchResult` union enables `Query.search` to return a list that includes both `Book`s and `Author`s.

### Querying a union

GraphQL clients don't know which object type a field will return if the field's return type is a union. To account for this, a query can include the subfields of _multiple possible types_.

Here's a valid query for the schema above:

```graphql
query GetSearchResults {
  search(contains: "Shakespeare") {
    # Querying for __typename is almost always recommended,
    # but it's even more important when querying a field that
    # might return one of multiple types.
    __typename
    ... on Book {
      title
    }
    ... on Author {
      name
    }
  }
}
```

> [What is the `__typename` field?](./schema/#the-__typename-field)

This query uses [inline fragments](https://graphql.org/learn/queries/#inline-fragments) to fetch a `Result`'s `title` (if it's a `Book`) or its `name` (if it's an `Author`). The web client can be informed about this polymorphic relationship by [passing the possibleTypes option](https://www.apollographql.com/docs/react/data/fragments/#using-fragments-with-unions-and-interfaces).

Here's a valid result for the above query:

```json
{
  "data": {
    "search": [
      {
        "__typename": "Book",
        "title": "The Complete Works of William Shakespeare"
      },
      {
        "__typename": "Author",
        "name": "William Shakespeare"
      }
    ]
  }
}
```


### Resolving a union

> Before reading this section, [learn about resolvers](../data/resolvers/).

To fully resolve a union, Apollo Server needs to specify _which_ of the union's types is being returned. To achieve this, you define a `__resolveType` function for the union in your resolver map.

The `__resolveType` function is responsible for determining an object's corresponding GraphQL type and returning the name of that type as a string. It can use any logic to do so, such as:

- Checking for the presence or absence of fields that are unique to a particular type in the union
- Using `instanceof`, if the _JavaScript_ object's type is related to its _GraphQL_ object type

Here's a basic `__resolveType` function for the `SearchResult` union defined above:

```ts {3-13}
const resolvers = {
  SearchResult: {
    __resolveType(obj, contextValue, info){
      // Only Author has a name field
      if(obj.name){
        return 'Author';
      }
      // Only Book has a title field
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

const { url } = await startStandaloneServer(server);

console.log(`🚀  Server ready at: ${url}`);
```

> If a `__resolveType` function returns any value that _isn't_ the name of a valid type, the associated operation produces a GraphQL error.

## Interface type

An interface specifies a set of fields that multiple object types can include:

```graphql
interface Book {
  title: String!
  author: Author!
}
```

If an object type `implements` an interface, it _must_ include _all_ of that interface's fields:

```graphql
type Textbook implements Book {
  title: String! # Must be present
  author: Author! # Must be present
  courses: [Course!]!
}
```

A field can have an interface (or a list of that interface) as its return type. In this case, it can return any object type that `implements` that interface:

```graphql
type Query {
  books: [Book!]! # Can include Textbook objects
}
```

### Example

The following schema defines a `Book` interface, along with two object types that implement it:

```graphql
interface Book {
  title: String!
  author: Author!
}

type Textbook implements Book {
  title: String!
  author: Author!
  courses: [Course!]!
}

type ColoringBook implements Book {
  title: String!
  author: Author!
  colors: [String!]!
}

type Query {
  books: [Book!]!
}
```

In this schema, `Query.books` returns a list that can include both `Textbook`s and `ColoringBook`s.

### Querying an interface

If a field's return type is an interface, clients can query that field for any subfields included in the interface:

```graphql
query GetBooks {
  books {
    title
    author
  }
}
```

Clients can _also_ query for subfields that _aren't_ included in the interface:

```graphql
query GetBooks {
  books {
    # Querying for __typename is almost always recommended,
    # but it's even more important when querying a field that
    # might return one of multiple types.
    __typename
    title
    ... on Textbook {
      courses {
        # Only present in Textbook
        name
      }
    }
    ... on ColoringBook {
      colors # Only present in ColoringBook
    }
  }
}
```

> [What is the `__typename` field?](./schema/#the-__typename-field)

This query uses [inline fragments](https://graphql.org/learn/queries/#inline-fragments) to fetch a `Book`'s `courses` (if it's a `Textbook`) or its `colors` (if it's a `ColoringBook`). The web client can be informed about this polymorphic relationship by [passing the possibleTypes option](https://www.apollographql.com/docs/react/data/fragments/#using-fragments-with-unions-and-interfaces).

Here's a valid result for the above query:

```json
{
  "data": {
    "books": [
      {
        "__typename": "Textbook",
        "title": "Wheelock's Latin",
        "courses": [
          {
            "name": "Latin I"
          }
        ]
      },
      {
        "__typename": "ColoringBook",
        "title": "Oops All Water",
        "colors": ["Blue"]
      }
    ]
  }
}
```

### Resolving an interface

> Before reading this section, [learn about resolvers](../data/resolvers/).

[As with union types](#resolving-a-union), Apollo Server requires interfaces to define a `__resolveType` function to determine which implementing object type is being returned.

Here's an example `__resolveType` function for the `Book` interface defined above:

```ts {3-13}
const resolvers = {
  Book: {
    __resolveType(book, contextValue, info){
      // Only Textbook has a courses field
      if(book.courses){
        return 'Textbook';
      }
      // Only ColoringBook has a colors field
      if(book.colors){
        return 'ColoringBook';
      }
      return null; // GraphQLError is thrown
    },
  },
  Query: {
    books: () => { ... }
  },
};
```
