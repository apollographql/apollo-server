# @apollo/server-integration-testsuite

## 4.0.2

### Patch Changes

- [#7035](https://github.com/apollographql/apollo-server/pull/7035) [`b3f400063`](https://github.com/apollographql/apollo-server/commit/b3f4000633a9dc5ef983b97e46cba29507ee2955) Thanks [@barryhagan](https://github.com/barryhagan)! - Errors resulting from an attempt to use introspection when it is not enabled now have an additional `validationErrorCode: 'INTROSPECTION_DISABLED'` extension; this value is part of a new enum `ApolloServerValidationErrorCode` exported from `@apollo/server/errors`.

- [#7066](https://github.com/apollographql/apollo-server/pull/7066) [`f11d55a83`](https://github.com/apollographql/apollo-server/commit/f11d55a83cf0300cf31674311e72cb7703c70040) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Add a test to validate error message and code for invalid operation names via GET

- [#7055](https://github.com/apollographql/apollo-server/pull/7055) [`d0d8f4be7`](https://github.com/apollographql/apollo-server/commit/d0d8f4be705065745bd3767a62b8025abe774842) Thanks [@trevor-scheer](https://github.com/trevor-scheer)! - Fix build configuration issue and align on CJS correctly

- Updated dependencies [[`b3f400063`](https://github.com/apollographql/apollo-server/commit/b3f4000633a9dc5ef983b97e46cba29507ee2955)]:
  - @apollo/server@4.0.2

## 4.0.1

### Patch Changes

- [#7049](https://github.com/apollographql/apollo-server/pull/7049) [`3daee02c6`](https://github.com/apollographql/apollo-server/commit/3daee02c6a0fa34ea0e6f4f18b9a7308539021e3) Thanks [@glasser](https://github.com/glasser)! - Raise minimum `engines` requirement from Node.js v14.0.0 to v14.16.0. This is the minimum version of Node 14 supported by the `engines` requirement of `graphql@16.6.0`.

- Updated dependencies [[`3daee02c6`](https://github.com/apollographql/apollo-server/commit/3daee02c6a0fa34ea0e6f4f18b9a7308539021e3), [`3daee02c6`](https://github.com/apollographql/apollo-server/commit/3daee02c6a0fa34ea0e6f4f18b9a7308539021e3)]:
  - @apollo/server@4.0.1

## 4.0.0

Initial release of `@apollo/server-integration-testsuite`.
