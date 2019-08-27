# Apollo Server Roadmap

This roadmap is for **Apollo Server 3.x**.

## Product vision

Apollo Server is a framework for implementing and running a data graph. It is written in TypeScript, runnable in any ES2018-supporting environment (Node.js, V8, etc.), and integrates tightly with the Apollo GraphQL Platform. Apollo Server is easy to use and well documented for product teams. It provides a principled set of tools for structuring and building a data graph, and it scales to hundreds of engineers across multiple teams collaborating on and consuming a single graph.

## Apollo Server 3.x

The next version of Apollo Server is a principled implementation of a production-ready GraphQL framework. It removes large amounts of technical debt that impedes our ability to support our community and customers.

### Goals

* Apollo Server provides **patterns and features that help product teams implement a data graph** with well-defined service boundaries.
    * Includes a first-class story for **schema modules**, using parts of the Apollo Federation spec, DataSources, and project structure recommendations.
    * Allows a seamless transition to a federated architecture, when needed.
    * Enhances execution by using `Entity`s in the graph to facilitate fetching, batching, and caching data.
    * Includes a redesigned set of documentation that walks teams through building a structured data graph.
        * Features a new getting-started experience designed to help product engineers be productive from day one.
        * Explains the architecture and patterns for building a graph.
        * Demonstrates how to run a graph in production using best practices.
    * Only requires a single Apollo Server package to install, which works for teams of all sizes.
        * Allows the completion of introductory documentation and the first "feature shipped" without needing to incorporate multiple packages.
* Apollo Server has a **well-structured and feature-rich transport layer, including a built-in HTTP layer** that fits into modern cloud infrastructures.
    * Requires only a small copy-and-paste snippet to integrate with a variety
    of Node.js HTTP frameworks.
    * Includes built-in support for consuming and setting headers, status codes, and cookies during execution.
    * Supports Apollo cache control for whole-query caching and integration with CDNs.
    * Supports enterprise-scale traffic through integrated caching layers and efficient execution.
* Production teams have **tools and hooks for confidently running and monitoring their graph** in production.
    * Graph and request lifecycles are well-documented and include detailed observability hooks for teams to set up monitoring.
    * Apollo Server includes built-in support for Apollo Graph Manager.
    * A new request pipeline gives teams more control over request lifecycles, including validation, parsing, and error handling.

## How we get there

Apollo Server 3 will be a rewrite-in-place of the Apollo Server project while we continue to support and maintain Apollo Server 2.x. As soon as the new architectural core is ready for use, even before being feature-complete (e.g., without support for WebSockets or subscriptions), we will begin a pre-release cycle and encourage the community to begin adopting the new package. **Many features might not land in the initial 3.0 release, but rather in a follow-up, minor version.**.

The work to accomplish these goals is grouped into the following work:

* **Improved packaging and patterns help teams structure their graph correctly at all sizes:**
    * Finish support for schema modules that each define portions of a complete graph:
        * Use federation directives within local schema modules and support a single entity fetch method (Merging `__resolveObject` and `__resolveReference` into a single `loadEntity` API).
        * Support static validation for local services (this unifies the "service" concepts from federation with the "modules" concepts from monolithic services).
        * Remain backward compatible for teams that use `typeDefs` and `resolvers` to construct their schema.
    * Support schema directives for modifying execution:
        * Support the `@cacheControl` directive for both federated and non-federated graphs.
    * Finish the `DataSource` API to support batching and caching:
        * Include tracing integration to show batched and cached work being performed during requests.
        * Directly integrate with the new `loadEntity` API mentioned above.
    * Simplified packaging for easier use:
        * Two packages (down from the current [38 packages](https://github.com/apollographql/apollo-server/tree/fef7a13b81a46dd3a05cc65409ddba6688fc281d/packages)): `@apollo/server` and `@apollo/graphql`.
        * Discontinuation of support for older versions of Node.js, supporting only Node.js v10 and later.
        * Removal of bolted-on subscription support and default inclusion of upload and subscription as a separate entry point.
    * Completely rearchitected documentation site:
        * Includes a rebuilt getting-started experience to help product engineers be productive on day one.
        * Explains the architecture of Apollo Server and how its components work together.
        * Showcases how to build a data graph using core features like `Entity`s and `DataSource`s.
        * Provides improved guidelines for running in production.
* **A new transport abstraction and a corresponding HTTP implementation:**
    * A new generic transport interface that can use an `AsyncIterator` to return "chunked" results to a client. The server should support multiple transports.
        * Apollo Server will ship with an `http` transport by default, which uses  `http.createServer` and its corresponding  `IncomingMessage` and `ServerResponse` interfaces.
            * It should properly support headers, status codes, and response streaming.
        * The documentation will include examples for integrating with common Node.js HTTP frameworks (Express, Koa, Hapi, etc.) so teams can essentially copy and paste Apollo Server functionality into their existing server.
        * A default `ApolloServer` setup will be provided for teams that don’t require a full-fledged Node.js framework.
* **A new `RequestPipeline` for more control and observability into what is happening during execution:**
    * A core `GraphQLService` API which isolates the GraphQL needs from needs of the transport. It is comprised up of a well documented and reasoned request pipeline and coupled with enhanced execution to take advantage of new module patterns:
        * Observability hooks to listen to key graph events:
            * **Graph-level**: ready, shutdown, schema change, service list change, errors, etc.
            * **Transport-level**: start, complete, error
            * **Execution-level**: parse, validate, execute, error
        * Control hooks to allow for custom behavior within the core request pipeline:
            * **Graph-level**: build schema, update schema, shutdown, etc.
            * **Transport-level**: transform request, transform response
            * **Execution-level**: parse, validate, execute

## Future work

* **First-class support for subscriptions, `@defer`, and `@stream`:**
    * Subscriptions
        * Implement a WebSocket transport using the new transport interface described above.
        * Support subscriptions in tracing data sent to Apollo Graph Manager.
        * Query planner support.
    * `@defer` and `@stream`
        * Support response streams in the HTTP transport.
        * Extend execution to allow for "chunked" responses to be sent to clients.
        * Support tracing of "chunked" execution in trace reporting.
        * Add support to Apollo Client for handling "chunked" responses.
	    * Add Query planner support.
* **Global graph directives for advanced production needs**
    * This is a small set of Apollo-specific directives to help teams reliably scale their graph.
	    * Includes an `@auth` directive (to be defined).
	    * Includes an `@experimental` directive to denote that fields are not part of the "stable" graph, but can be used by certain teams to experiment.
* Invalidation of whole-query cache through cache tags with CDN integration.
* Building a "graph" caching layer for the gateway:
    * Will use the `EntityCache` from Apollo Client or some version of it designed for the graph level.
    * Will fulfill the need for "partial query caching" across service and module boundaries.

## Tech debt paid down

This section isn’t critical for understanding the work to be done for Apollo Server 3.0, but is helpful to understand more of the implications of the work being done to make it happen.

* Removal of all of the `apollo-server-<integration>` packages in favor of the default HTTP transport, along with copy-paste snippets in the documentation for other common patterns to deliver production-ready, out-of-the-box experiences.
* Removal of `graphql-tools` in favor of `@apollo/graphql` with additional modules that are currently spread out among numerous repositories and packages.
* Removal of `subscription-transport-ws` in favor of a built-in solution that takes full advantage of the main request pipeline.
* Simplification of the development experience for core team and contributors (e.g., a better test suite, easier publishing, easier community contribution).
* Unification of a number of hanging APIs and packages (`apollo-server-errors`, `graphql-extensions`, `apollo-datasource`, `apollo-env`, etc.).
* Discontinuation of support (and associated polyfills) for end-of-life versions of Node.js (Node.js 6 and 8) from our support matrix.
