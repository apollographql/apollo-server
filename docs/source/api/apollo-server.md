---
title: "API Reference: apollo-server"
sidebar_title: apollo-server
---

This API reference documents the exports from the `apollo-server`.

## `ApolloServer`

The core of an Apollo Server implementation. For an example, see the [Building a server](../essentials/server.html) section within "Essentials".

### `constructor(options)`: <`ApolloServer`>

#### Parameters

* `options`: <`Object`>

  * `typeDefs`: <`String` inside [`gql`](#gql) tag> _(required)_

    String representation of GraphQL schema in the Schema Definition Language (SDL).

  * `resolvers`: <`Object`> _(required)_

    A map of resolvers for the types defined in `typeDefs`. The key should be the type name and the value should be a `Function` to be executed for that type.

  * `context`: <`Object`> | <`Function`>

    An object or function called with the current request that creates the context shared across all resolvers

```js
new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req }) => ({
		authScope: getScope(req.headers.authorization)
	}),
});
```

* `mocks`: <`Object`> | <`Boolean`>

  A boolean enabling the default mocks or object that contains definitions

* `schemaDirectives`: <`Object`>

  Contains definition of schema directives used in the `typeDefs`

* `introspection`: <`Boolean`>

  Enables and disables schema introspection

* `debug`: <`Boolean`>

  Enables and disables development mode helpers. Defaults to `true`

* `validationRules`: <`Object`>

  Schema validation rules

* `tracing`, `cacheControl`: <`Boolean`>

  Add tracing or cacheControl meta data to the GraphQL response

* `formatError`, `formatResponse`, `formatParams`: <`Function`>

  Functions to format the errors and response returned from the server, as well as the parameters to graphql execution(`runQuery`)

* `schema`: <`Object`>

  An executable GraphQL schema that will override the `typeDefs` and `resolvers` provided

#### Returns

`ApolloServer`

### `listen(options)`: `Promise`

#### Parameters

* `options`: <`Object`>

  * `http`: <`Object`>

    All parameters which are supported by Node.js' [`net.Server.listen`](https://nodejs.org/api/net.html#net_server_listen_options_callback) method are supported, including:

    * `port`: <`String`> | <`Number`>
    * `path`: <`String`>
    * `backlog`: <`Number`>
    * `exclusive`: <`Boolean`>

    or

    * `handler`: <`Object`>
    * `backlog`: <`Number`>

  Engine launcher options

  * `engineLauncherOptions` : [<`Object`>](https://www.apollographql.com/docs/engine/setup-node.html#api-engine.listen)
  * `engineProxy`: [<`Object`>](https://www.apollographql.com/docs/engine/proxy-config.html)

  WebSocket options

  * `subscriptions`: <`Object`> | <`String`> | false

    String defining the path for subscriptions or an Object to customize the subscriptions server. Set to false to disable subscriptions

    * `path`: <`String`>
    * `keepAlive`: <`Number`>
    * `onConnect`: <`Function`>
    * `onDisconnect`: <`Function`>

#### Returns

`Promise`

## registerServer

The `registerServer` method is from `apollo-server-express`. Middleware registration has been greatly simplified with this new method.

### Parameters

* `options`: <`Object`>

  * `app`: <`HttpServer`> _(required)_

    Pass the handle to your nexpress server here.

  * `server`: <`ApolloServer`> _(required)_

    Pass the instance of Apollo Server

  * `path` : <`String`>

    Specify a custom path. It defaults to `/graphql` if no path is specified.

  * `cors`: <`Object`>

    Pass the cors options.

### Usage

The `registerServer` method from `apollo-server-express` allows you to easily register your middleware as shown in the example below:

```js
const { ApolloServer } = require('apollo-server');
const { registerServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
  // These will be defined for both new or existing servers
  typeDefs,
  resolvers,
});

// Additional middleware can be mounted at this point to run before Apollo.
app.use('*', jwtCheck, requireAuth, checkScope);

registerServer({ server, app, path: '/specialUrl' }); // app is from an existing express app. Mount Apollo middleware here. If no path is specified, it defaults to `/graphql`.
```

## `gql`

The `gql` is a [template literal tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates). Template literals were introduced in recent versions of ECMAScript to provide embedded expressions (i.e. `` `A string with interpolated ${variables}` ``) and template literal tags exist to provide additional functionality for what would otherwise be a normal template literal.

In the case of GraphQL, the `gql` tag is used to surround GraphQL operation and schema language (which are represented as `String`s), and makes it easier to differentiate from ordinary strings. This is particularly useful when performing static analysis on GraphQL language (e.g. to enable syntax highlighting, code generation, etc.) and avoids need for tools to "guess" if a string contains GraphQL language.

### Usage

Import the `gql` template literal tag into the current context from the `apollo-server` module:

```js
const { gql } = require('apollo-server');
```

Then, place GraphQL schema definitions (SDL), queries or other operations into the `gql` template literal tag. Keep in mind that template literals use the grave accent (`` ` ``) and not normal quotation marks (e.g. not `"` or `'`):

```js
const typeDefs = gql`
  type Author {
    name
  }
`;
```

## `makeExecutableSchema`

The `makeExecutableSchema` method is re-exported from apollo-server as a convenience.

### Parameters

* `options` : <`Object`>
  * `typeDefs`: <`GraphQLSchema`> _(required)_
  * `resolvers` : <`Object`>
  * `logger` : <`Object`>
  * `allowUndefinedInResolve` = false
  * `resolverValidationOptions` = {}
  * `directiveResolvers` = null
  * `schemaDirectives` = null
  * `parseOptions` = {}
  * `inheritResolversFromInterfaces` = false

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
