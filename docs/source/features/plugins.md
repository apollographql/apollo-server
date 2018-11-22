---
title: Plugins
description: Extending Apollo Server through the use of plugins.
---

> **Note:** Plugins are available in Apollo Server 2.2.x or higher.

## Overview

The default Apollo Server installation is designed for a reliable out-of-the-box experience with as little configuration as possible.  In order to provide additional features, Apollo Server supports _plugins_ which can interface with various stages of server operation and each request/response cycle.

## Usage

Plugins for Apollo Server can be specified using the `plugins` configuration parameter to the Apollo Server constructor options.

The `plugins` array is an array of plugins.  They might be provided as a module (and optionally published to a registry — e.g. npm) or defined in-line within the `ApolloServer` constructor.  Plugins should be defined correctly and the requirements of building a plugin are explained in the plugin [definition](#definition) section below.

> **Note:** If a plugin is provided by a package published to a registry (for example, npm), that package must be installed using `npm install <plugin>` or `yarn add <plugin>` prior to use.  In-line plugins or plugins which reside locally do not need to be installed.

An example of Apollo Server which installed three plugins might look like:

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

    /* A plugin installed from the npm registry. */
    require('apollo-server-operation-registry')({ /* options */ }),

    /* A plugin which is defined locally. */
    require('./localPluginModule'),

    /* A plugin which is defined in-line. */
    {
      /* ... plugin event hooks ... */
    },
  ],
})
```

## Definition

> **Types:** To facilitate plugin development, the `apollo-server-plugin-base` module exports [the `ApolloServerPlugin` interface](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-plugin-base/src/index.ts) for plugins to utilize.  It's recommended to use this interafce when building custom plugins.


A plugin defines the life-cycle events it wishes to act upon using an object which maps events (specific events are defined in further detail later in this document) to the functions that implement them.

For example, here is a very simple plugin, defined as an object literal, which implements a `requestDidStart` event:

```js
{
  requestDidStart() {
    console.log('The request started.');
  },
}
```

This plugin might be directly included as an element of the `plugins`, or it could be provided as a separate module:

```js
module.exports = {
  requestDidStart() {
    /* ... */
  },
};
```

Plugins which accepted options might providing a function which returns an object that implements a object matching the `ApolloServerPlugin` interface:

```js
/* localPluginModule.js */
module.exports = (options) => {
  /* ...Plugin specific implementation... */

  return {
    requestDidStart() {
      console.log('The options were', options);
    },
  };
};
```

Within the `plugins` array, this `localPluginModule.js` would be used as:

```js
  /* ... Existing, required ApolloServer configuration. ... */

  plugins: [

    require('./localPluginModule')({
      /* ...configuration options, when necessary! */
    }),

  ],

  /* ... any additional ApolloServer configuration. ... */
```

And finally, advanced cases can implement the `ApolloServerPlugin` interface via a factory function.  The factory function will receive `pluginInfo`, which can allow implementors to adjust their behavior based on circumstantial factors:

```js
/* advancedPluginModule.js */
module.exports = (options) => {
  /* ...Plugin specific implementation... */

  return (pluginInfo) => {
    console.log('The pluginInfo was', pluginInfo);

    return {
      requestDidStart() {
        console.log('The options were', options);
      }
    };
  };
}
```

And again, this could be used as a plugin by defining it in the `plugins` array:

```js
  /* ... Existing, required ApolloServer configuration. ... */

  plugins: [

    require('./advancedPluginModule')({
      /* ...configuration options, when necessary! */
    }),

  ],

  /* ... any additional ApolloServer configuration. ... */
```

> **Note:** Currently the `pluginInfo` is undefined, but future additions to the plugin API will enable this functionality.  For now, the factory function facilities are in place to use, but `pluginInfo` is simply not available.

## Events

There are two main categories of events: server life-cycle events and request life-cycle events.

As the names imply, server life-cycle events are those which might not be directly related to a specific request.  Instead, these events are more generally aimed at providing integrations for the server as a whole, rather than integrations which apply per request.

On the other hand, request life-cycle events are those which are specifically coupled to a specific request.  The organization of plugin event registration aims to make it simple to couple request life-cycle events with server life-cycle events by nesting the request life-cycle events within appropriate server life-cycle events.  For example, the definition of request life-cycle events is done as an extension of the `requestDidStart` server life-cycle event.  This will be explained further below.

### Server life-cycle events

Server life-cycle events are custom integration points which generally cover the life-cycle of the server, rather than focusing on a specific request.  Specific server life-cycle events may expose additional events which are relevant to that portion of their life-cycle, but these are intended to be the most high-level events which represent the super-set of all events which occur will occur within Apollo Server.

In the case that an event exposes additional events, the additional events are coupled to the server life-cycle event in order to provide a focused context which allows developers to couple related logic together.  This will be explored more concisely in the `requestDidStart` server life-cycle event below.

### `serverWillStart`

The `serverWillStart` event is fired when the GraphQL server is preparing to start.  If this is defined as an `async` function (or if it returns a `Promise`) the server will not start until the asynchronous behavior is resolved.  Any rejection in this event will cause the server to not start, which provides a technique to ensure particular behavior is met before starting (for example, confirming that an underlying dependency is ready).

#### Example

```js
const server = new ApolloServer({
  /* ... other necessary configuration ... */

  plugins: [
    {
      serverWillStart() {

      }
    }
  ]
})
```

### `requestDidStart`

This event is emitted when the server has begun fulfilling a request.  This life-cycle may return an object which implements request life-cycle events, as necessary.

The `requestDidStart` event can return an object which implements the `GraphQLRequestListener` interface in order to define more specific [request- life-cycle events](#Request-life-cycle-events) &mdash; e.g. `parsingDidStart`, `didResolveOperation` `willSendResponse`, etc.  By including these as a subset of `requestDidStart`, plugin specific request scope can be created and used by the more granular events.

```js
const server = new ApolloServer({
  /* ... other necessary configuration ... */

  plugins: [
    {
      /* The `requestDidStart` will be called when the request has started
         processing and more granular events — like `parsingDidStart` below —
         are executed when those particular events occur. */
      requestDidStart(requestContext) {

        /* Request-specific scope can be created here and
           used in more granular life-cycle events below. */

        return {

          parsingDidStart(requestContext) {
            /* This `parsingDidStart` life-cycle event is
               called when parsing begins, but scoped within the
               `requestDidStart` server life-cycle event. */
          },

        }
      }
    }
  ],

  /* */
})
```

If there are no specific request life-cycle events to implement, `requestDidStart` should not return anything.

### Request life-cycle events

Request life-cycle events must be implemented by returning an object which defines their behavior from the `requestDidStart` server life-cycle event.  By maintaining this structure, coupling logic, and defining plugin-specific request scope becomes semantic and co-located.

> **Types:** The `apollo-server-plugin-base` module exports [the `GraphQLRequestListener` interface](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-plugin-base/src/index.ts) which defines the shape of request life-cycle events.  It's recommended to use this interafce when building custom plugins which implement granular request life-cycle events via `requestDidStart`.

For example, to implement any of the request life-cycle events, an object should be returned from `requestDidStart` as such:

```js
const server = new ApolloServer({
  /* ... other necessary configuration ... */

  plugins: [
    {
      requestDidStart(requestContext) {
        /* Plugin-specific request scope can be created here and
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
