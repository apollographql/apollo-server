# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.12.0-alpha.0](https://github.com/apollographql/apollo-server/compare/graphql-extensions@0.11.1...graphql-extensions@0.12.0-alpha.0) (2020-04-10)

**Note:** Version bump only for package graphql-extensions





# Changelog

### vNext

### 0.1.0-beta
- *Backwards-incompatible change*: `fooDidStart` handlers (where foo is `request`, `parsing`, `validation`, and `execution`) now return their end handler; the `fooDidEnd` handlers no longer exist.  The end handlers now take errors.  There is a new `willSendResponse` handler.  The `fooDidStart` handlers take extra options (eg, the `ExecutionArgs` for `executionDidStart`).
- *Backwards-incompatible change*: Previously, the `GraphQLExtensionStack` constructor took either `GraphQLExtension` objects or their constructors. Now you may only pass in `GraphQLExtension` objects.

### 0.0.10
- Fix lifecycle method invocations on extensions
