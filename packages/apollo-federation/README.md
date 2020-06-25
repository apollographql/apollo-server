# `Apollo Federation Utilities`

This package provides utilities for creating GraphQL microservices, which can be combined into a single endpoint through tools like [Apollo Gateway](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-gateway).

For complete documentation, see the [Apollo Federation API reference](https://www.apollographql.com/docs/apollo-server/api/apollo-federation/).

## Usage

```js
const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const typeDefs = gql`
  type Query {
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    username: String
  }
`;

const resolvers = {
  Query: {
    me() {
      return { id: "1", username: "@ava" }
    }
  },
  User: {
    __resolveReference(user, { fetchUserById }){
      return fetchUserById(user.id)
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});
```
