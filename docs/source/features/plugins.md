---
title: Plugins
description: Extend Apollo Server with custom functionality
---

> Plugins are available in Apollo Server 2.2.x and later.

**Plugins** enable you to extend Apollo Server's core functionality by performing 
custom operations in response to individual phases of the GraphQL request lifecycle 
(or in response to the startup of Apollo Server itself).

For example, a basic logging plugin might log the GraphQL query string associated 
with each request that's sent to Apollo Server.

## Creating a plugin

> If you're using TypeScript to create a plugin, the `apollo-server-plugin-base` module exports the [`ApolloServerPlugin` interface](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-plugin-base/src/index.ts) for plugins to implement.

### Responding to events

A plugin specifies exactly which [lifecycle events](#events) 
it responds to. To do so, it implements functions that correspond to those events.

For example, this basic plugin (declared as an object literal) responds to the `serverWillStart` event, which fires when Apollo Server is preparing to start up:

```js
{
  serverWillStart() {
    console.log('Server starting up!');
  },
}
```

A plugin can respond to any combination of supported events.

#### Responding to request lifecycle events

Plugins can respond to the following events associated with the GraphQL request
lifecycle:

* `parsingDidStart`
* `validationDidStart`
* `executionDidStart`
* `didResolveOperation`
* `didEncounterErrors`
* `responseForOperation`
* `willSendResponse`

**However**, the way you define these functions is slightly different from the
`serverWillStart` example above. First, your plugin must define the `requestDidStart` function:

```js
{
  requestDidStart() {
    console.log('Request started!');
  },
}
```

The `requestDidStart` event fires whenever Apollo Server receives a GraphQL request,
_before_ any other request lifecycle event fires. You can respond to this event
just like you respond to `serverWillStart`, but you _also_ use this function
 to define responses for a request's _other_ lifecycle events:

```js
{
  requestDidStart(requestContext) {
    console.log('Request started!');

    return {

      parsingDidStart(requestContext) {
        console.log('Parsing started!');
      }

      validationDidStart(requestContext) {
        console.log('Validation started!');
      }

    }
  },
}
```

As shown, the `requestDidStart` function can optionally return an object that 
defines functions that respond to _other_ request lifecycle events. This structure 
organizes and encapsulates all of your plugin's request lifecycle logic, making it 
easier to reason about.

### Inspecting request and response details

As the example above shows, request lifecycle functions accept a `requestContext`
parameter. This parameter is of type `GraphQLRequestContext`, which includes a
`request` (of type `GraphQLRequest`), along with a `response` field (of type `GraphQLResponse`) if it's available.

These types and their related subtypes are all defined in [`apollo-server-types/src/index.ts`](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-types/src/index.ts).

## Installing a plugin

Add your plugin to Apollo Server by including it in the `plugins` configuration 
option you can provide to the `ApolloServer` constructor:

```js
const { ApolloServer } = require('apollo-server');
const ApolloServerOperationRegistry =
  require('apollo-server-plugin-operation-registry');

/* This example doesn't provide `typeDefs` or `resolvers`,
   both of which are required to start the server. */
const { typeDefs, resolvers } = require('./separatelyDefined');

const server = new ApolloServer({
  typeDefs,
  resolvers,

  // You can import plugins or define them in-line, as shown:
  plugins: [

    /* This plugin is from a package that's imported above. */
    ApolloServerOperationRegistry({ /* options */ }),

    /* This plugin is imported in-place. */
    require('./localPluginModule'),

    /* This plugin is defined in-line. */
    {
      serverWillStart() {
        console.log('Server starting up!');
      },
    }
  ],
})
```

## Plugin event reference

Two types of plugin events are currently supported: **server lifecycle
events** and **request lifecycle events**.

Server lifecycle events are high-level events related to the lifecycle of Apollo Server itself.
Currently, only two server lifecycle events are supported: [`serverWillStart`](#serverwillstart) and [`requestDidStart`](#requestdidstart).

Request lifecycle events are associated with a specific request. You define responses to these events _within_ the response to a `requestDidStart` server lifecycle event, as described in [Responding to request lifecycle events](#responding-to-request-lifecycle-events).

### Server lifecycle events

### `serverWillStart`

The `serverWillStart` event fires when the GraphQL server is preparing to start.  If this is defined as an `async` function (or if it returns a `Promise`), the server does not start until the asynchronous operation completes. Any rejection in this event prevents the server from starting, which enables you to make sure certain
conditions are met before starting (for example, confirming that an underlying dependency is ready).

#### Example

```js
const server = new ApolloServer({
  /* ... other necessary configuration ... */

  plugins: [
    {
      serverWillStart() {
        console.log('Server starting!');
      }
    }
  ]
})
```

### `requestDidStart`

The `requestDidStart` event fires when the server has begun fulfilling a request.  

This function can optionally return an object that defines functions that respond to
_request_ lifecycle events associated with the request.

```js
const server = new ApolloServer({
  /* ... other necessary configuration ... */

  plugins: [
    {
      /* `requestDidStart` fires when a request has started
         processing. More granular events — like `parsingDidStart` below —
         fire as the request processes. */
      requestDidStart(requestContext) {

        /* Define functions that respond to request-specific lifecycle events here. */
        return {

          parsingDidStart(requestContext) {
            /* This `parsingDidStart` lifecycle event is
               called when parsing begins, and is scoped within the
               `requestDidStart` server lifecycle event. */
            console.log('Parsing started!')
          },

        }
      }
    }
  ],

  /* */
})
```

If there are no specific request lifecycle events to implement, `requestDidStart` should not return anything.

### Request lifecycle events

> The `apollo-server-plugin-base` module exports [the `GraphQLRequestListener` interface](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-plugin-base/src/index.ts) which defines the shape of request lifecycle events.  It's recommended to use this interface when building custom plugins in TypeScript which implement granular request lifecycle events via `requestDidStart`.

### `parsingDidStart`

The `parsingDidStart` request lifecycle event will receive the request context as the first argument.  At this stage, the `document` AST may not be defined since the parsing may not succeed.

#### TypeScript signature

```typescript
parsingDidStart?(
  requestContext: GraphQLRequestContext<TContext>,
): (err?: Error) => void | void;
```

### `validationDidStart`

The `validationDidStart` request lifecycle event will receive the request context as the first argument.  Since parsing would have been successful prior to validation, the `document` AST will be present.

#### TypeScript signature

```typescript
validationDidStart?(
  requestContext: WithRequired<GraphQLRequestContext<TContext>, 'document'>,
): (err?: ReadonlyArray<Error>) => void | void;
```

### `didResolveOperation`

The `didResolveOperation` request lifecycle event is triggered after the operation to be executed has been successfully retrieved from the `document` AST by `graphql`'s `getOperationAST`.  This focusing of execution which identifies the correct operation is important when a `document` contains multiple operations.  At this stage, in addition to the `document` the `operationName` (`String`) and `operation` (AST) will be present on the context.

If the operation is anonymous (e.g. the operation is `query { ... }` rather than `query NamedQuery { ... }`, then `operationName` will be `null`.

```typescript
didResolveOperation?(
  requestContext: WithRequired<
    GraphQLRequestContext<TContext>,
    'document' | 'operationName' | 'operation'
  >,
): ValueOrPromise<void>;
```

### `didEncounterErrors`

> TODO

```typescript
didEncounterErrors?(
  requestContext: WithRequired<
    GraphQLRequestContext<TContext>,
    'metrics' | 'source' | 'errors'
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

## TODO

You can also define a plugin This plugin might be directly included as an element of the `plugins`, or it could be provided as a separate module:

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

  return () => {

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
