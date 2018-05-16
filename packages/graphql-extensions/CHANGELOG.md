# Changelog

### vNext

### 0.1.0-beta
- *Backwards-incompatible change*: `fooDidStart` handlers (where foo is `request`, `parsing`, `validation`, and `execution`) now return their end handler; the `fooDidEnd` handlers no longer exist.
- *Backwards-incompatible change*: Previously, the `GraphQLExtensionStack` constructor took either `GraphQLExtension` objects or their constructors. You may still pass in `GraphQLExtension` objects, but if functions are provided, they are treated as non-constructor functions which take in a new `GraphQLExtensionOptions` options type as an argument.

### 0.0.10
- Fix lifecycle method invocations on extensions
