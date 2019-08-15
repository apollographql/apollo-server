# `apollo-server-env`

This package is used internally by Apollo Server and not meant to be consumed
directly.

Its primary function is to provide polyfills (e.g. via
[`core-js`](https://npm.im/core-js)) for newer language features which might
not be available in the underlying JavaScript Engine (i.e. more bare-bones V8
environments, older versions of Node.js, etc.).
