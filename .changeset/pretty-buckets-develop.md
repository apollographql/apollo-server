---
'@apollo/server': minor
---

Add `hideSchemaDetailsFromClientErrors` option to ApolloServer to allow hiding 'did you mean' suggestions from validation errors.

Even with introspection disabled, it is possible to "fuzzy test" a graph manually or with automated tools to try to determine the shape of your schema. This is accomplished by taking advantage of the default behavior where a misspelt field in an operation
will be met with a validation error that includes a helpful "did you mean" as part of the error text.

For example, with this option set to `true`, an error would read `Cannot query field "help" on type "Query".` whereas with this option set to `false` it would read `Cannot query field "help" on type "Query". Did you mean "hello"?`.

We recommend enabling this option in production to avoid leaking information about your schema to malicious actors.

To enable, set this option to `true` in your `ApolloServer` options:

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  hideSchemaDetailsFromClientErrors: true
});
```
