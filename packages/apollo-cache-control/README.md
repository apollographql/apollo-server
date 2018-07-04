# Apollo Cache Control (for Node.js)

This package is used to collect and expose cache control data in the [Apollo Cache Control](https://github.com/apollographql/apollo-cache-control) format.

It relies on instrumenting a GraphQL schema to collect cache control hints, and exposes cache control data for an individual request under `extensions` as part of the GraphQL response.

This data can be consumed by [Apollo Engine](https://www.apollographql.com/engine/) or any other tool to inform caching and visualize the cache policies that are in effect for a particular request.

## Usage

### Apollo Server

Apollo Server includes built-in support for Apollo Cache Control from version 1.2.0 onwards.

The only code change required is to add `tracing: true` and `cacheControl: true` to the options passed to the Apollo Server middleware function for your framework of choice. For example, for Express:

```javascript
app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
  context: {},
  tracing: true,
  cacheControl: true
}));
```

> If you are using `express-graphql`, we recommend you switch to Apollo Server. Both `express-graphql` and Apollo Server are based on the [`graphql-js`](https://github.com/graphql/graphql-js) reference implementation, and switching should only require changing a few lines of code.

### Add cache hints to your schema

Cache hints can be added to your schema using directives on your types and fields. When executing your query, these hints will be added to the response and interpreted by Engine to compute a cache policy for the response. Hints on fields override hints specified on the target type.

```graphql
type Post @cacheControl(maxAge: 240) {
  id: Int!
  title: String
  author: Author
  votes: Int @cacheControl(maxAge: 30)
  readByCurrentUser: Boolean! @cacheControl(scope: PRIVATE)
}
```

If you need to add cache hints dynamically, you can use a programmatic API from within your resolvers.

```javascript
const resolvers = {
  Query: {
    post: (_, { id }, _, { cacheControl }) => {
      cacheControl.setCacheHint({ maxAge: 60 });
      return find(posts, { id });
    }
  }
}
```

If you're using TypeScript, you need the following:
```javascript
import 'apollo-cache-control';
```

If set up correctly, for this query:

```graphql
query {
  post(id: 1) {
    title
    votes
    readByCurrentUser
  }
}
```

You should receive cache control data in the `extensions` field of your response:

```json
"cacheControl": {
  "version": 1,
  "hints": [
    {
      "path": [
        "post"
      ],
      "maxAge": 240
    },
    {
      "path": [
        "post",
        "votes"
      ],
      "maxAge": 30
    },
    {
      "path": [
        "post",
        "readByCurrentUser"
      ],
      "scope": "PRIVATE"
    }
  ]
}
```

### Setting a default maxAge

The power of cache hints comes from being able to set them precisely to different values on different types and fields based on your understanding of your implementation's semantics. But when getting started with Apollo Cache Control, you might just want to apply the same `maxAge` to most of your resolvers. You can specify a default max age when you set up `cacheControl` in your server. This max age will be applied to all resolvers which don't explicitly set `maxAge` via schema hints (including schema hints on the type that they return) or the programmatic API. You can override this for a particular resolver or type by setting `@cacheControl(maxAge: 0)`. For example, for Express:

```javascript
app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
  context: {},
  tracing: true,
  cacheControl: {
    defaultMaxAge: 5,
  },
}));
```
