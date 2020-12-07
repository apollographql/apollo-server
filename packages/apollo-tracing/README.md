# Apollo Tracing (for Node.js)

This package is used to collect and expose trace data in the [Apollo Tracing](https://github.com/apollographql/apollo-tracing) format.

It relies on instrumenting a GraphQL schema to collect resolver timings, and exposes trace data for an individual request under `extensions` as part of the GraphQL response.

This data can be consumed by [Apollo Studio](https://www.apollographql.com/docs/studio/) (previously, Apollo Engine and Apollo Graph Manager) or any other tool to provide visualization and history of field-by-field execution performance.

## Usage

### Apollo Server

Apollo Server includes built-in support for tracing from version 1.1.0 onwards.

The only code change required is to add `tracing: true` to the options passed to the `ApolloServer` constructor options for your integration of choice. For example, for [`apollo-server-express`](https://npm.im/apollo-server-express):

```javascript
const { ApolloServer } = require('apollo-server-express');

const server = new ApolloServer({
  schema,
  tracing: true,
});
```
