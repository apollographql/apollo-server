---
title: Unions and interfaces
description: How to write add unions and interfaces to a schema
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
}`;
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

A possible query for these result could appear as follows. This query demonstrates the need for the `__resolveType`, since it requests different data depending on the types,

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

## Intersection type

An `Interface` type provides the ability to describe fields that are shared across different types. It is best used to show that all types implementing an interface always contain the interface's fields. In other words, it is the semantic opposite of a union. For example, in this example `Vehicle` interface type is used by members `Airplane` and `Car`:

```
interface Vehicle {
  maxSpeed: Int
}

type Airplane implements Vehicle {
  maxSpeed: Int
  wingspan: Int
}

type Car implements Vehicle {
  maxSpeed: Int
  licensePlate: String
}

type Query {
  vehicle: Vehicle
}
```

Similarly to the `Union`, `Interface` requires an extra `__resolveType` field in the resolver map.

```js
const resolvers = {
  Vehicle: {
    __resolveType(obj, context, info){
      if(obj.wingspan){
        return 'Airplane';
      }

      if(obj.licensePlate){
        return 'Car';
      }

      return null;
    },
  },
  Query: {
    vehicle: () => { ... }
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

A possible query could appear as follows. Notice that `maxSpeed` is shared, so it can be included directly:

```graphql
{
  vehicle {
    maxSpeed

    ... on Car {
			licensePlate
    }
    ... on Airplane {
      wingspan
    }
  }
}
```
