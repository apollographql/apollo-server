---
title: "API Reference: apollo-server"
sidebar_title: apollo-server
---

This API reference documents the exports from the `apollo-server`, and `apollo-server/{variant}` packages (e.g. `apollo-server/express`).  Both the root module and the module sub-paths export the same functionality.

## `ApolloServer`

The core of an Apollo Server implementation.  For a complete example, see the [Running a server](../essentials/server) section within "Essentials".

### `constructor(options)`: <`ApolloServer`>

#### Parameters

* `options`: <`Object`>
  * `typeDefs`: <`String` inside [`gql`](#gql) tag> _(required)_

    This is a string representation of your GraphQL Schema Definition Language (SDL).

  * `resolvers`: <`Object`> _(required)_

    Type: `Object`

    This should be a map of resolvers for the types defined in `typeDefs`.  The key should be the type name and the value should be a `Function` to be executed for that type.

#### Returns

`ApolloServer`

### `listen(options)`: `Promise`

#### Parameters

* `options`: <`Object`>

  The `options` supports all Node.js

  * `port`: <`String`> | <`Number`>
  * `path`: <`String`>
  * `backlog`: <`Number`>
  * `exclusive`: <`Boolean`>

  // engine launcher options
  engineLauncherOptions?: EngineLauncherOptions;
  // WebSocket options
  keepAlive?: number;
  onConnect?: (
    connectionParams: Object,
    websocket: WebSocket,
    context: ConnectionContext,
  ) => any;
  onDisconnect?: (websocket: WebSocket, context: ConnectionContext) => any;

#### Returns

`Promise`

### `applyMiddleware(app, options)`: `void`

* `app`: <`HttpServer`> _(Required)_

* `options`: <`Object`>

  * `path`: <`String`>

    Default: `/`

    The path which the middleware will be mounted on.

  * `subscriptions`: <`Boolean`>

    Default: `false`

    When set to `true`, WebSockets will be enabled to allow for subscription support.

## `gql`

The `gql` is a [template literal tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates).  Template literals were introduced in recent versions of ECMAScript to provide embedded expressions (i.e. `` `A string with interpolated ${variables}` ``) and template literal tags exist to provide additional functionality for what would otherwise be a normal template literal.

In the case of GraphQL, the `gql` tag is used to surround GraphQL operation and schema language (which are represented as `String`s), and makes it easier to differentiate from ordinary strings.  This is particularly useful when performing static analysis on GraphQL language (e.g. to enable syntax highlighting, code generation, etc.) and avoids need for tools to "guess" if a string contains GraphQL language.

### Usage

Import the `gql` template literal tag into the current context from the `apollo-server` module:

```js
const { gql } = require('apollo-server');
```

Then, place GraphQL schema definitions (SDL), queries or other operations into the `gql` template literal tag.  Keep in mind that template literals use the grave accent (`` ` ``) and not normal quotation marks (e.g. not `"` or `'`):

```js
const typeDefs = gql`
  type Author {
    name
  }
`;
```

## `makeExecutableSchema`

## `addMockFunctionsToSchema(options)`

The `addMockFunctionsToSchema` method is re-exported from `apollo-server` as a convenience.

Given an instance of a `GraphQLSchema` and a `mock` object, modifies the schema (in place) to return mock data for any valid query that is sent to the server.

If preserveResolvers is set to true, existing resolve functions will not be overwritten to provide mock data. This can be used to mock some parts of the server and not others.

### Parameters

* `options`: <`Object`>
  * `schema`: <`GraphQLSchema`> _(required)_

    Pass an executable schema (`GraphQLSchema`) to be mocked.

  * `mocks`: <`Object`>

    Should be a map of types to mock resolver functions, e.g.:

    ```js
    {
      Type: () => true,
    }
    ```

    When `mocks` is not defined, the default scalar types (e.g. `Int`, `Float`, `String`, etc.) will be mocked.

  * `preserveResolvers`: <`Boolean`>

    When `true`, resolvers which were already defined will not be over-written with the mock resolver functions specified with `mocks`.

### Usage


```js
const { addMockFunctionsToSchema } = require('apollo-server');

// We'll make an assumption that an executable schema
// is already available from the `./schema` file.
const executableSchema = require('./schema');

addMockFunctionsToSchema({
  schema: executableSchema,
  mocks: {
    // Mocks the `Int` scalar type to always return `12345`.
    Int: () => 12345,

    // Mocks the `Movies` type to always return 'Titanic'.
    Movies: () => 'Titanic',
  },
  preserveResolvers: false,
});
```
