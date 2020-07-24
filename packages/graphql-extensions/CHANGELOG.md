# Changelog

> This package is deprecated.  Please use the [Apollo Server Plugin API](https://www.apollographql.com/docs/apollo-server/integrations/plugins/) (specified on the `plugins` property, rather than `extensions`), which provides the same functionality (and more).

### 0.1.0-beta
- *Backwards-incompatible change*: `fooDidStart` handlers (where foo is `request`, `parsing`, `validation`, and `execution`) now return their end handler; the `fooDidEnd` handlers no longer exist.  The end handlers now take errors.  There is a new `willSendResponse` handler.  The `fooDidStart` handlers take extra options (eg, the `ExecutionArgs` for `executionDidStart`).
- *Backwards-incompatible change*: Previously, the `GraphQLExtensionStack` constructor took either `GraphQLExtension` objects or their constructors. Now you may only pass in `GraphQLExtension` objects.

### 0.0.10
- Fix lifecycle method invocations on extensions
