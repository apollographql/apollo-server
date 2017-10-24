# Apollo Cache Control (for Node.js)

This package is used to collect and expose cache control data in the [Apollo Cache Control format](https://github.com/apollographql/apollo-cache-control).

## Usage

### Apollo Server

Apollo Server includes built-in support for cache control from version 1.2.0.pre.1 onwards.

The only code change required is to add `tracing: true` and `cacheControl: true` to the options passed to the Apollo Server middleware function for your framework of choice. For example, for Express:

```javascript
app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
  context: {},
  tracing: true,
  cacheControl: true
}));
```

### Adding cache hints to your schema

Cache hints can be added to your schema using directives on your types and fields.

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
