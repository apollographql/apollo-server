---
title: Plugins
description: Extending Apollo Server through the use of plugins.
---

> **Note:** Plugins are available in Apollo Server 2.2.x or higher.

## Overview

The default Apollo Server installation is designed for a reliable out-of-the-box experience with as little configuration as possible.  In order to provide additional features, Apollo Server supports _plugins_ which can interface with various stages of server operation and each request/response cycle.

## Usage

Plugins for Apollo Server can be specified using the `plugins` configuration parameter on the Apollo Server be provided as a module (and optionally published to a registry — e.g. npm) or defined in-line within the `ApolloServer` contructor.

> **Types:** To facilitate plugin development, the `apollo-server-plugin-base` module exports the plugin interface for plugins as `ApolloServerPlugin`.  Advanced users may want to directly explore `ApolloServerPlugin` by [reviewing its source](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-plugin-base/src/index.ts), but we recommend TypeScript users implement plugins using the `ApolloServerPlugin` interface.

For example, defining an in-line plugin (one which isn't published to a registry) which implements a single `onServerStart` event might look like this:

```js
const { ApolloServer } = require('apollo-server');

/* Note: This example doesn't provide `typeDefs` or `resolvers`,
         both of which are necessary to start the server. */
const { typeDefs, resolvers } = require('./separatelyDefined');

const server = new ApolloServer({
  typeDefs,
  resolvers,

  /* Plugins are defined within this array and initialized sequentially. */
  plugins: [
    {
      onServerStart() {
        console.debug('The server has started!');
      },
    },
  ],
})
```

In addition to supporting in-line configuration for ad-hoc integration points, plugins which are provided as a stand-alone module or installed from a registry using `npm install` (or `yarn add`) can be listed as members of the `plugins` configuration:

```js
  /* ... Existing, required ApolloServer configuration. ... */

  plugins: [

    /* A plugin could be installed and provided from npm. */
    require('apollo-server-plugin-name')(),

    /* And another plugin might reside locally. */
    require('./localPluginModule')({
      /* plugin configuration, when necessary! */
    })

  ]

  /* ... Any remaining ApolloServer configuration. ... */
```

## Events

There are two main categories of events: server life-cycle events and request life-cycle events.

As the names imply, server life-cycle events are those which might not be directly related to a specific request.  Instead, these events are more generally aimed at providing integrations for the server as a whole, rather than integrations which apply per request.

On the other hand, request life-cycle events are those which are specifically coupled to a specific request.  The organization of plugin event registration aims to make it simple to couple request life-cycle events with server life-cycle events by nesting the request life-cycle events within appropriate server life-cycle events.  For example, the definition of request life-cycle events is done as an extension of the `requestDidStart` server life-cycle event.  This will be explained further below.

### Server life-cycle events

Server life-cycle events are custom integration points which generally cover the life-cycle of the server, rather than focusing on a specific request.  Specific server life-cycle events may expose additional events which are relevant to that portion of their life-cycle, but these are intended to be the most high-level events which represent the super-set of all events which occur will occur within Apollo Server.

In the case that an event exposes additional events, the additional events are coupled to the server life-cycle event in order to provide a focused context which allows developers to couple related logic together.  This will be explored more concisely in the `requestDidStart` server life-cycle event below.

### `onServerStart`

The `onServerStart` event is fired when the GraphQL server is preparing to start.  If this is defined as an `async` function (or if it returns a `Promise`) the server will not start until the asynchronous behavior is resolved.  Any rejection in this event will cause the server to not start, which provides a technique to ensure particular behavior is met before starting (for example, confirming that an underlying dependency is ready).

#### Example

```js
const server = new ApolloServer({
  /* ... other necessary configuration ... */

  plugins: [
    {
      onServerStart() {

      }
    }
  ]
})
```

### `requestDidStart`

This event is emitted when the server has begun fulfilling a request.  This life-cycle may return an object which implements request life-cycle events, as necessary.

By including these as a subset of `requestDidStart`, scope can be created
and used by more specific events — e.g. `parsingDidStart`, `didResolveOperation` `willSendResponse`, etc.  The request-life-cycle events are defined in [request life-cycle events](#TODO) below.

```js
const server = new ApolloServer({
  /* ... other necessary configuration ... */

  plugins: [
    {
      requestDidStart(requestContext) {
        /* Request-specific scope can be created here and
           used in more granular life-cycle events below. */
        return {

          parsingDidStart(requestContext) {

          },

        }
      }
    }
  ],

  /* */
})
```

If there are no more specific events to implement, `requestDidStart` need not return any value.

### Request life-cycle events

Request life-cycle events must be implemented by returning an object which defines their behavior to the `requestDidStart` server life-cycle event.  By maintaining this structure, coupling logic and maintaining control over where scope is created and destroyed within a request becomes more semantic.

For example, to implement any of the request life-cycle events, an object should be returned from `requestDidStart` as such:

```js
const server = new ApolloServer({
  /* ... other necessary configuration ... */

  plugins: [
    {
      requestDidStart(requestContext) {
        /* Request-specific scope can be created here and
           used in more granular life-cycle events below. */
        return {

          parsingDidStart(requestContext) {

          },

          validationDidStart(requestContext) {

          },

          didResolveOperation(requestContext) {

          },

          /* ... any additional request life-cycle events... */

        }
      }
    }
  ],

  /* */
})
```

### `parsingDidStart`

The `parsingDidStart` request life-cycle event will receive the request context as the first argument.  At this stage, the `document` AST may not be defined since the parsing may not succeed.

#### TypeScript signature

```typescript
parsingDidStart?(
  requestContext: GraphQLRequestContext<TContext>,
): (err?: Error) => void | void;
```

### `validationDidStart`

The `validationDidStart` request life-cycle event will receive the request context as the first argument.  Since parsing would have been successful prior to validation, the `document` AST will be present.

#### TypeScript signature

```typescript
validationDidStart?(
  requestContext: WithRequired<GraphQLRequestContext<TContext>, 'document'>,
): (err?: ReadonlyArray<Error>) => void | void;
```

### `didResolveOperation`

The `didResolveOperation` request life-cycle event is triggered after the operation to be executed has been successfully retrieved from the `document` AST by `graphql`'s `getOperationAST`.  This focusing of execution which identifies the correct operation is important when a `document` contains multiple operations.  At this stage, in addition to the `document` the `operationName` (`String`) and `operation` (AST) will be present on the context.

If the operation is anonymous (e.g. the operation is `query { ... }` rather than `query NamedQuery { ... }`, then `operationName` will be `null`.

```typescript
didResolveOperation?(
  requestContext: WithRequired<
    GraphQLRequestContext<TContext>,
    'document' | 'operationName' | 'operation'
  >,
): ValueOrPromise<void>;
```

### `executionDidStart`

> TODO

```typescript
executionDidStart?(
  requestContext: WithRequired<
    GraphQLRequestContext<TContext>,
    'document' | 'operationName' | 'operation'
  >,
): (err?: Error) => void | void;
```

### `willSendResponse`

> TODO

```typescript
willSendResponse?(
  requestContext: WithRequired<GraphQLRequestContext<TContext>, 'response'>,
): ValueOrPromise<void>;
```
