---
title: Building Web Framework Integrations for Apollo Server
description: ""
---

> This document is intended for web framework integration _authors_. Before
> building your own integration, we recommend first looking to see if there's
> already a widely used package for your integration of choice that might suit
> your needs.

One of the driving forces behind Apollo Server 4 is the creation of a stable,
well-defined API for processing HTTP requests and responses. Apollo Server 4's
API enables external collaborators (like you) to build integrations with Apollo
Server in their web framework of choice.

The primary responsibility of an Apollo Server integration is to translate
requests and responses between a web framework's native format to the format
that `ApolloServer` uses.

## Overview

Let's start by getting a general sense of what an integration package is
responsible for. This is an outline of the higher-level concepts to get you
acquainted with server initialization and the lifecycle of a request.

### Ensuring successful startup

`ApolloServer` provides a method `assertStarted` for ensuring that the
`ApolloServer` instance was started successfully. For non-serverless
integrations, calling this function will ensure that the server instance is
ready to receive requests. This means that users of your integration are
expected to `await server.start()` _before_ handing off the server instance to
your integration.

Serverless integrations should first call the
`startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests` method
and need not require their users to call `server.start()`. Calling this function
will allow calling `assertStarted` while still in the "starting" state.

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

FIXME: are there actual errors to handle any differently?
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
interface ExpressMiddlewareOptions<TContext extends BaseContext> {
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
Since serverless integrations handle starting the server instance, they don't
need to call `assertStarted`.

### Computing Context

A request handler has access to all kinds of useful information about the
incoming request which is often useful during GraphQL execution. For this
reason, integrations should provide a hook to users which allows them to
generate their GraphQL context object based on the incoming request.

If no `context` function is provided, an empty GraphQL context object is
sufficient (see `defaultContext` below).

When a user provides a `context` function, it should be called with the request
object and any other contextual information that the handler receives when it's
called. In Express, the handler receives `req` and `res` objects which we pass
along to the user's `context` function.

Apollo Server exports the `ContextFunction` type, which is a generic type that
is useful for integrations in defining their API. The first type argument
defines the arguments that will be passed to your user's `context` function. The
Express integration uses it above in the `ExpressMiddlewareOptions` interface so
that users get a strongly typed `context` function with correct parameter
typings. The second type argument defines the return type of the user's
`context` function, and should be the same `TContext` generic as used in the
`ApolloServer` instance.

```ts
interface ExpressContextFunctionArgument {
  req: express.Request;
  res: express.Response;
}

const defaultContext: ContextFunction<
  [ExpressContextFunctionArgument],
  any
> = async () => ({});

const context: ContextFunction<[ExpressContextFunctionArgument], TContext> =
  options?.context ?? defaultContext;
```

### Handling Requests

This section is where implementations can expect to diverge from the Express
implementation the most. The request handler has 4 main functions:
1. Parsing the request
2. Construct an `HTTPGraphQLRequest` object from the incoming request
3. Execute the GraphQL request via Apollo Server
4. Return a well-formed response to the client

#### Parsing the request

Apollo Server responds to a variety of requests, handling queries via `GET`
and `POST`, full GraphQL queries and APQs, and landing pages like Explorer.
Fortunately, this is all part of Apollo Server's core logic and isn't something
that integrations need to worry about.

Integrations _are_ responsible for parsing the request in order to correctly
construct the `HTTPGraphQLRequest` that Apollo Server expects. This
means parsing the request body as well as the query string if present.

In the Express integration, users are expected to use the `body-parser` JSON
middleware which handles parsing JSON request bodies when the `content-type`
header is set to `application/json`. Integrations can choose to require a
similar middleware or plugin for their ecosystem or handle body parsing
themselves. A correctly parsed body should look like this:

```ts
{
  query?: string;
  variables?: Record<string, any>;
  operationName?: string;
  extensions?: Record<string, any>;
}
```

Integrations are also responsible for parsing the query string if present.
Express does this by default, handing off the parsed query string as an object
(`req.query`) to the request handler. A correctly parsed query string should
look like this:

```ts
{
  query?: string;
  variables?: string;
  operationName?: string;
  extensions?: string;
}
```

Note that `variables` and `extensions` are a `string` instead of a `Record`. No
additional parsing of the individual query string parts should be necessary.

#### Constructing the `HTTPGraphQLRequest` object

```ts
interface HTTPGraphQLRequest {
  method: string;
  headers: Map<string, string>;
  searchParams: any;
  body: any;
}
```

With the request body parsed, we can now construct an `HTTPGraphQLRequest`.
Apollo Server handles the logic of `GET` vs `POST`, applicable headers, and
whether to look in `searchParams` or `body` for the GraphQL-specific parts of
the query.

The only thing left for us to compute is the `headers` object! Apollo Server
expects a `Map` of headers. In the Express implementation, we construct the
`Map` by iterating over the `headers` object like so:

```ts
const headers = new Map<string, string>();
for (const [key, value] of Object.entries(req.headers)) {
  if (value !== undefined) {
    // Node/Express headers can be an array or a single value. We join
    // multi-valued headers with `, ` just like the Fetch API's `Headers`
    // does. We assume that keys are already lower-cased (as per the Node
    // docs on IncomingMessage.headers) and so we don't bother to lower-case
    // them or combine across multiple keys that would lower-case to the
    // same value.
    headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }
}
```

Apollo Server expects header keys to be lower-cased. If your framework allows
duplicate keys, the values should be merged into the same key, joined by a
`, ` as shown above.

Now that we have all the parts of an `HTTPGraphQLRequest`, we can build the
object and hand it off to Apollo Server for execution.

```ts
const httpGraphQLRequest: HTTPGraphQLRequest = {
  method: req.method.toUpperCase(),
  headers,
  searchParams: req.query,
  body: req.body,
};
```

#### Execute the GraphQL request

Now that we have an `HTTPGraphQLRequest` object, we can use it to execute the
GraphQL request.

```ts
const result = await server
  .executeHTTPGraphQLRequest({
    httpGraphQLRequest,
    context: () => context({ req, res }),
  });
```

Here, `httpGraphQLRequest` is the `HTTPGraphQLRequest` object constructed above.
The `context` function is the one we determined above, either provided by the
user or the default one. Note how we pass the `req` and `res` objects we
received from Express to the `context` function (as promised by our
`ExpressContextFunctionArgument` type).

#### Send the response

The `HTTPGraphQLResponse` type is what we expect after awaiting the Promise
returned by `executeHTTPGraphQLRequest`. At this point, the handler should
respond to the client as appropriate based on the conventions of the framework.

```ts
interface HTTPGraphQLHead {
  statusCode?: number;
  headers: Map<string, string>;
}

type HTTPGraphQLResponse = HTTPGraphQLHead &
  (
    | {
        completeBody: string;
        bodyChunks: null;
      }
    | {
        completeBody: null;
        bodyChunks: AsyncIterableIterator<HTTPGraphQLResponseChunk>;
      }
  );
```

The express implementation uses the `res` object in order to update the response
with the appropriate status code and headers as well as send the body like so:

```ts
if (httpGraphQLResponse.completeBody === null) {
  // TODO(AS4): Implement incremental delivery or improve error handling.
  throw Error('Incremental delivery not implemented');
}

for (const [key, value] of httpGraphQLResponse.headers) {
  res.setHeader(key, value);
}
res.statusCode = httpGraphQLResponse.statusCode || 200;
res.send(httpGraphQLResponse.completeBody);
```
