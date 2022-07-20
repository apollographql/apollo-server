---
title: Building Integrations for Apollo Server
description: ""
---

> This document is intended for integration _authors_. Before building your own integration, we recommend first looking to see if there's already a widely used package for your integration of choice that might suit your needs.

One of the driving forces behind Apollo Server 4 is the creation of a stable, well-defined API for processing HTTP requests and responses. Apollo Server 4's API enables external collaborators (like you) to build integrations with Apollo Server in their web framework of choice.

The primary responsibility of an Apollo Server integration is to translate requests and responses between a web framework's native format to the format that `ApolloServer` uses.

## Overview

Let's start by getting a general sense of what an integration package is responsible for. This is an outline of the higher-level concepts to get you acquainted with server initialization and the lifecycle of a request.

### Ensuring successful startup

`ApolloServer` provides a method `assertStarted` for ensuring that the
`ApolloServer` instance was started successfully. For non-serverless
integrations, calling this function will ensure that the server instance is
ready to receive requests. This means that users of your integration are
expected to `await server.start()` _before_ handing off the server instance to
your integration.

Serverless integrations should first call the `startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests` method and need not require their users to call `server.start()`. Calling this function will allow calling `assertStarted` while still in the "starting" state.

### Handling requests

Integration packages should be implemented as some form of request handler or
framework plugin. Handlers typically receive information about each request
including common HTTP parts (method, headers, and body) and likely some other
useful contextual information. Integrations are responsible for mapping this
information into a consistent format for Apollo Server.

Integrations provide a mapped request to Apollo Server's
`executeHTTPGraphQLRequest` method, where GraphQL execution begins. This method
is `await`ed and returns the response object computed by Apollo Server.

### Context Creation

Creating the context object for GraphQL execution happens as a part of request
handling in the above section. The `executeHTTPGraphQLRequest` method receives
an argument consisting of two parts, the second of which is the GraphQL context
object.

The GraphQL context object is typically user-generated and depends on the
incoming request. The most common approach to implementing this is to call a
user-provided function which receives request information (the same information
that your handler receives) as a parameter and returns the GraphQL context
object. Your integration is responsible for calling the user-provided function
and passing the context object it returns to `executeHTTPGraphQLRequest`.

### Response

The return value of awaiting `executeHTTPGraphQLRequest` contains a status code
(if applicable), response headers, and a body. The body can take multiple forms,
which we will explain in more detail down below. It is your integration's
responsibility to take this object and construct a response accordingly, based
on the conventions that apply to your framework.

### Error Handling

The `executeHTTPGraphQLRequest` method does not throw. Instead, it returns an
object containing helpful errors and a specific `statusCode` when applicable.
You should handle this object accordingly, based on the error handling
conventions that apply to your framework.

### Typings

Apollo _strongly_ recommends TypeScript for all packages, especially packages
intended to be used by others. `ApolloServer` is strongly typed and exports a
few useful types for integration authors. We'll go into more details on how to
use these types below.

## Implementation

This implementation guide leans heavily on the [Express integration](FIXME:
link) as an example. Below, we will use code snippets to illustrate the concepts
discussed above as well as explain patterns in the Express integration that you
might find useful in your own integration.

### Main function signature

Let's start by looking at the main function signature. This snippet uses
[function
_overloading_](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads)
to provide the strongest possible types for the `ApolloServer` instance and the
user's `context` function. The first two `expressMiddleware` definitions are the
permitted signatures, while the third is the actual implementation (omitted for
now).

```ts
export interface ExpressMiddlewareOptions<TContext extends BaseContext> {
  context?: ContextFunction<[ExpressContextFunctionArgument], TContext>;
}

export function expressMiddleware(
  server: ApolloServer<BaseContext>,
  options?: ExpressMiddlewareOptions<BaseContext>,
): express.RequestHandler;
export function expressMiddleware<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options: WithRequired<ExpressMiddlewareOptions<TContext>, 'context'>,
): express.RequestHandler;
export function expressMiddleware<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options?: ExpressMiddlewareOptions<TContext>,
): express.RequestHandler {
  // ...
}
```

In the first signature, if `options` is not provided then there is no
user-provided `context` function to call. The resulting `context` object will
just be a `BaseContext` (or `{}`). As such, the expected type of the first
argument is `ApolloServer<BaseContext>`.

The second signature _requires_ that `options` be provided with a `context`
property, meaning that the type of the `context` object that Apollo Server
expects is now the same as the return type of the user-provided `context`
function. We use `TContext` throughout Apollo Server code to represent the
generic type of the GraphQL context object. We can see that the same `TContext`
generic is shared by the `ApolloServer` instance as well as the user-provided
`context` function. This ensures that users type their server and their context
function correctly.

### Server initialization

For standard integrations, users should await `server.start()` before passing
their server instance to your integration. This ensures that the server starts
correctly and that any errors encountered at startup are handled by the user.

To guarantee that the server has started, we use the `assertStarted` method like
so:
```ts
server.assertStarted('expressMiddleware()');
```

For serverless integrations where the handler must be returned synchronously,
users should _not_ call `server.start()` and instead, the integration should
call `startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests`.

The handler you return should call `assertStarted` immediately inside
the function body:
```ts
server.assertStarted('serverlessHandler()');
```

### Computing Context

```ts
  // This `any` is safe because the overload above shows that context can
  // only be left out if you're using BaseContext as your context, and {} is a
  // valid BaseContext.
  const defaultContext: ContextFunction<
    [ExpressContextFunctionArgument],
    any
  > = async () => ({});

  const context: ContextFunction<[ExpressContextFunctionArgument], TContext> =
    options?.context ?? defaultContext;
```






## General integration patterns

<!-- TODO: fix link to point to main once version-4 is merged  -->
> See the [`expressMiddleware` function](https://github.com/apollographql/apollo-server/blob/36482f5eb56a0421c1eb47e3ebf0e60e033573ab/packages/server/src/express/index.ts) for an example of integrating [Express](https://github.com/expressjs/express) with Apollo Server.

Your integration should accept an `ApolloServer` instance _after_ that instance has called the `server.start()` method:

```ts
// Create a new instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// The async start method instructs Apollo Server to
// prepare to handle incoming operations.
await server.start();
```

> Serverless integrations will accept an `ApolloServer` instance _before_ its called any start-related functions. For more details, see [New approach to serverless frameworks](#new-approach-to-serverless-frameworks).

You can pass the "started" `ApolloServer` instance into your framework-specific middleware. With your framework-specific middleware set up, you can then start your chosen framework's server:

```ts
// 1. Create our ApolloServer instance and start it
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
await server.start();

// 2. Create our framework specific server
const app = express();

// 3. Set up our middleware for our framework specific server.
app.use(cors(), bodyParser.json(), expressMiddleware(server));

// 4. Start the framework specific server
app.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000`);
});
```

Note that your integration is responsible for setting up [body-parser](https://www.npmjs.com/package/body-parser) and [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) configuration.

