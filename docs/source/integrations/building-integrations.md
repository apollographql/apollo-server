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

This guide demonstrates how to go about building a framework integration for
Apollo Server at a conceptual level. Below, we will explain the concepts using
code snippets from our [Express integration](FIXME: link) for illustration.

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

### Ensure successful startup

For standard integrations, users should await `server.start()` before passing
their server instance to your integration. This ensures that the server starts
correctly and that any errors encountered at startup are handled by the user.

To guarantee that the server has started, we use the `assertStarted` method on
Apollo Server like so:
```ts
server.assertStarted('expressMiddleware()');
```

Serverless integrations should first call the
`startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests` method
and need not require their users to call `server.start()`. Since serverless
integrations handle starting the server instance, they don't need to call
`assertStarted`.

### Compute GraphQL Context

A request handler has access to all kinds of information about the incoming
request which can be useful during GraphQL execution. Integrations should
provide a hook to users which allows them to generate their GraphQL context
object based on the incoming request.

If no `context` function is provided, an empty GraphQL context object is
sufficient (see `defaultContext` below).

When a user provides a `context` function, it should be called with the request
object and any other contextual information that the handler receives when it's
called. In Express, the handler receives `req` and `res` objects which we pass
along to the user's `context` function.

Apollo Server exports the `ContextFunction` type, which is a generic type that
is useful for integrations in defining their API. The first type argument
defines the arguments that the integration will pass to your user's `context`
function. The Express integration uses it above in the
`ExpressMiddlewareOptions` interface so that users get a strongly typed
`context` function with correct parameter typings. The second type argument
defines the return type of the user's `context` function, and should be the same
`TContext` generic as used in the `ApolloServer` instance.

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

The `context` function that we have here will be _called_ in the execution step.

### Handle Requests

Integration packages should be implemented as some form of request handler or
framework plugin. Handlers typically receive information about each request
including common HTTP parts (i.e. `method, `headers`, and `body`) and likely
some other useful contextual information. Integrations are responsible for
mapping this information into a consistent format for Apollo Server.

The request handler has 4 main functions, which we will discuss in detail below:
1. Parse the request
2. Construct an `HTTPGraphQLRequest` object from the incoming request
3. Execute the GraphQL request via Apollo Server
4. Return a well-formed response to the client

#### Parse the request

Apollo Server responds to a variety of requests, handling queries via `GET` and
`POST`, full GraphQL queries and APQs, and landing pages like Explorer.
Fortunately, this is all part of Apollo Server's core logic and isn't something
that integrations need to worry about.

Integrations _are_ responsible for parsing the request body in order to
correctly construct the `HTTPGraphQLRequest` that Apollo Server expects. In the
Express integration, users are expected to use the `body-parser` JSON middleware
which handles parsing JSON request bodies when the `content-type` header is set
to `application/json`. Integrations can choose to require a similar middleware
or plugin for their ecosystem or handle body parsing themselves. A correctly
parsed body should have this shape:

```ts
{
  query?: string;
  variables?: Record<string, any>;
  operationName?: string;
  extensions?: Record<string, any>;
}
```

This shape is what we expect from a normal parsed request and is just for
illustration purposes. Your integration should pass along whatever it parses to
Apollo Server; validation of the request will happen there.

GraphQL requests can also be sent via a `GET` request by sending the relevant
information via query string parameters. Apollo Server expects the raw query
string for these types of requests. The Express integration computes the query
string given the full URL similarly to the following example:

```ts
import { parse } from 'url';

const search = parse(req.url).search ?? '';
```

#### Construct the `HTTPGraphQLRequest` object

With the request body parsed, we can now construct an `HTTPGraphQLRequest`.
Apollo Server handles the logic of `GET` vs `POST`, relevant headers, and
whether to look in `body` or `search` for the GraphQL-specific parts of the
query.

```ts
interface HTTPGraphQLRequest {
  method: string;
  headers: Map<string, string>;
  search: string;
  body: unknown;
}
```

We now have the `method`, `body`, and `search` properties computed. The only
thing left for us to compute is the `headers` object! Apollo Server expects a
`Map` of headers. In the Express implementation, we construct the `Map` by
iterating over the `headers` object like so:

```ts
const headers = new Map<string, string>();
for (const [key, value] of Object.entries(req.headers)) {
  if (value !== undefined) {
    headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }
}
```

Apollo Server expects header keys to be lower-cased. If your framework allows
duplicate keys, the values should be merged into the same lower-cased key,
joined by a `, ` as shown above. Express provides lower-cased header keys, so
our snippet above operates under that assumption and may not be a sufficient
approach for your framework.

Now that we have all the parts of an `HTTPGraphQLRequest`, we can build the
object like so:

```ts
const httpGraphQLRequest: HTTPGraphQLRequest = {
  method: req.method.toUpperCase(),
  headers,
  body: req.body,
  search: parse(req.url).search ?? '',
};
```

#### Execute the GraphQL request

With the `HTTPGraphQLRequest` we created above, we now execute the GraphQL
request.

```ts
const result = await server
  .executeHTTPGraphQLRequest({
    httpGraphQLRequest,
    context: () => context({ req, res }),
  });
```

Here, `httpGraphQLRequest` is the `HTTPGraphQLRequest` object we just
constructed. The `context` function is the one we determined earlier, either
provided by the user or the default. Note how we pass the `req` and `res`
objects we received from Express to the `context` function (as promised by our
`ExpressContextFunctionArgument` type).

#### Handle errors

The `executeHTTPGraphQLRequest` method does not throw. Instead, it returns an
object containing helpful errors and a specific `statusCode` when applicable.
You should handle this object accordingly, based on the error handling
conventions that apply to your framework.

In the Express integration, this doesn't require any special handling. The
non-error case handles setting the status code and headers, then responds with
the execution result just as it would in the error case.

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
for (const [key, value] of httpGraphQLResponse.headers) {
  res.setHeader(key, value);
}
res.statusCode = httpGraphQLResponse.statusCode || 200;
res.send(httpGraphQLResponse.completeBody);
```
