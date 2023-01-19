---
'@apollo/server': patch
---

Add an `__identity` property to `HeaderMap` class to disallow standard `Map`s (in TypeScript).

This ensures that typechecking occurs on fields which are declared to accept a
`HeaderMap` (notably, the `httpGraphQLRequest.headers` option to
`ApolloServer.executeHTTPGraphQLRequest` and the `http.headers` option to
`ApolloServer.executeOperation`). This might be a breaking change for
integration authors, but should be easily fixed by switching from `new
Map<string, string>()` to `new HeaderMap()`.
