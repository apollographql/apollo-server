---
'@apollo/server': minor
---

Introduce new opt-in configuration option to mitigate v4 status code regression

Apollo Server v4 accidentally started responding to requests with an invalid `variables` object with a 200 status code, where v3 previously responded with a 400. In order to not break current behavior (potentially breaking users who have creatively worked around this issue) and offer a mitigation, we've added the following configuration option which we recommend for all users.

```ts
new ApolloServer({
  // ...
  status400ForVariableCoercionErrors: true,
});
```

Specifically, this regression affects cases where _input variable coercion_ fails. Variables of an incorrect type (i.e. `String` instead of `Int`) or unexpectedly `null` are examples that fail variable coercion. Additionally, missing or incorrect fields on input objects as well as custom scalars that throw during validation will also fail variable coercion. For more specifics on variable coercion, see the "Input Coercion" sections in the [GraphQL spec](https://spec.graphql.org/June2018/#sec-Scalars).

This will become the default behavior in Apollo Server v5 and the configuration option will be ignored / no longer needed.
