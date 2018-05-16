# Changelog

### vNext

### 0.1.0-beta.0
- *Backwards-incompatible change*: `fooDidStart` handlers (where foo is `request`, `parsing`, `validation`, and `execution`) now return their end handler; the `fooDidEnd` handlers no longer exist.
- *Backwards-incompatible change*: Only `GraphQLExtension` objects may be passed to the `GraphQLExtensionStack` constructor, not their constructors.

### 0.0.10
- Fix lifecycle method invocations on extensions
