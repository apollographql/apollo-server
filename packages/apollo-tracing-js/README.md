# Apollo Tracing (for Node.js)

This package is used to collect and expose trace data in the [Apollo Tracing format](https://github.com/apollographql/apollo-tracing).

It relies on instrumenting a GraphQL schema to collect resolver timings, and exposes trace data for an individual request under `extensions` as part of the GraphQL response.

The extension format is work in progress, and we're collaborating with others in the GraphQL community to make it broadly available, and to build awesome tools on top of it.

One use of Apollo Tracing is to add support for [Apollo Optics](https://www.apollodata.com/optics/) to more GraphQL servers.

## Usage

### Apollo Server

Apollo Server includes built-in support for tracing from version 1.1.0 onwards.

The only code change required is to add `tracing: true` to the options passed to the Apollo Server middleware function for your framework of choice. For example, for Express:

```javascript
app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
  context: {},
  tracing: true,
}));
```

> If you are using `express-graphql`, we recommend you switch to Apollo Server. Both `express-graphql` and Apollo Server are based on the [`graphql-js`](https://github.com/graphql/graphql-js) reference implementation, and switching should only require changing a few lines of code.
