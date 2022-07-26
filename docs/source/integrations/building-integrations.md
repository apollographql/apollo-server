---
title: Building Web Framework Integrations for Apollo Server
description: ""
---

<!-- TODO(AS4) Once we have a page with integrations, add link here -->
> This article is for _authors_ of web framework integrations. Before
> building a new integration, we recommend seeing if there's
> an integration for your framework of choice that suits your needs.

One of the driving forces behind Apollo Server 4 is the creation of a stable,
well-defined API for processing HTTP requests and responses. Apollo Server 4's
API enables external collaborators, like you, to build integrations with Apollo
Server in their web framework of choice.
## Overview

The primary responsibility of an Apollo Server integration is to translate
requests and responses between a web framework's native format to the format used by `ApolloServer`. This article conceptually covers how to build an integration, using the [Express integration](https://github.com/apollographql/apollo-server/blob/version-4/packages/server/src/express4/index.ts) (i.e.,`expressMiddleware`) as an example.

### Main function signature

Let's start by looking at the main function signature. The below snippet uses
[function
_overloading_](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads)
to provide the strongest possible types for the `ApolloServer` instance and the
user's `context` function.

The first two `expressMiddleware` definitions are the
permitted signatures, while the third is the actual implementation (omitted for
now):

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
  // implementation details
}
```

In the first `expressMiddleware` signature above, if a user doesn't provide `options`, there isn't a user-provided `context` function to call. The resulting `context` object is a `BaseContext` (or `{}`). So, the first argument's expected type is `ApolloServer<BaseContext>`.

The second `expressMiddleware` signature _requires_ that `options` receives a `context` property. This means that Apollo Server expects the `context` object's type to be the _same_ as the type returned by the user-provided `context` function. Apollo Server uses the `TContext` type to represent the generic type of the GraphQL context object. Above, both the `ApolloServer` instance and the user-provided `context` function share the `TContext` generic, ensuring users correctly type their server and `context` function.

### Ensure successful startup

For standard integrations, users should await `server.start()` before passing their server instance to an integration. This ensures that the server starts correctly and enables your integration user to handle any startup errors.

To guarantee a server has started, you can use the `assertStarted` method on
Apollo Server, like so:

```ts
server.assertStarted('expressMiddleware()');
```

*Serverless* integrations don't require users to call `server.start()`;  instead, a serverless integration calls the
`startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests` method. Because serverless integrations handle starting their server instances, they also don't need to call the `assertStarted` method.

### Compute GraphQL Context

A request handler can access all kinds of information about an incoming
request, which can be useful during GraphQL execution. Integrations should provide a hook to users, enabling them to create their GraphQL `context` object with values from an incoming request.

If a user provides a `context` function, it should receive the request object and any other contextual information the handler receives. For example, in Express, the handler receives `req` and `res` objects, which it passes to the user's `context` function.

If a user doesn't provide a `context` function, an empty GraphQL context object is sufficient (see `defaultContext` below).

Apollo Server exports a generic `ContextFunction` type, which can be useful for integrations defining their APIs. Above, the [`expressMiddleware` function signature](#main-function-signature) uses the `ContextFunction` type in the `ExpressMiddlewareOptions` interface, giving users a strongly typed
`context` function with correct parameter typings.

The `ContextFunction` type's first type argument specifies which arguments an integration needs to pass to a user's `context` function. The second type argument defines the return type of a user's `context` function, which should use the same `TContext` generic that `ApolloServer` uses:

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

Note, the `context` function is _called_ during the execution step.

### Handle Requests

We recommend implementing your integration package as either a request handler or a framework plugin. Request handlers typically receive information about each request, including standard HTTP parts (i.e., `method`, `headers`, and `body`) and other useful contextual information.

A request handler has 4 main responsibilities:
1. [Parse the request](#parse-the-request)
2. [Construct an `HTTPGraphQLRequest` object](#construct-the-httpgraphqlrequest-object) from the incoming request
3. [Execute the GraphQL request](#execute-the-graphql-request) via Apollo Server
4. Return a well-formed [response to the client](#send-the-response)

#### Parse the request

Apollo Server responds to a variety of requests, such as HTTP requests (i.e., `GET` and `POST`), APQs, and landing page requests (e.g., Apollo Sandbox). Fortunately, this is all part of Apollo Server's core logic and isn't something integration authors need to worry about.

Integrations _are_ responsible for parsing a request's body and using the values to construct the `HTTPGraphQLRequest` that Apollo Server expects.

In the Express integration, users are expected to use the `body-parser` JSON middleware, which handles parsing JSON request bodies when the `content-type` header is set to `application/json`. Integrations can choose to require a similar middleware or plugin for their ecosystem or handle body parsing themselves.

A correctly parsed body should have this shape:

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
