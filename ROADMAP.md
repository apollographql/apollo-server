# Roadmap + Designs

This document contains a rough outline of a roadmap and a few designs for future features in Apollo Server. Contributions are very welcome! Feel free to pick an of the upcoming features and start implementing, and don't hold back with questions or ideas!


## Roadmap

### Completed

* Rewrite in TypeScript
* Simplification of API
* Express integration
* Query batching (Express)
* Query whitelisting / stored queries
* Hapi integration
* Koa integration
* Connect integration
* Complete rewrite of Apollo Server documentation

### Current

* Performance testing in production setting

### Next up

* Better GraphQL error handling
* Support for simple query timeouts
* Websocket transport
* GraphQL subscriptions

### Future

* Support for @defer, @stream and @live directives



## Proposed designs

### Error handling

GraphQL errors currently get swallowed on the server and formatted before they are sent to the client. This can make debugging difficult. To make getting started easier, apollo server should have a default logging functions that prints errors (including stack traces) to the server console. The default log function should only be used if a log function is not explicitly provided.


### Support for query timeouts

Query timeouts can be implemented by decorating the resolve functions, in a similar fashion to how  `graphql-tracer` currently works (see [this function](https://github.com/apollostack/graphql-tracer/blob/71fd73f4463e6ee7ad87d77fd2819e81f2859d56/src/Tracer.js#L176)). A timeout will be set for the entire query by writing the time by which the query must end to the context. Each resolver will be decorated with a function that sets a timeout which will reject the resolver's promise with a timeout error no later than the end time written to the context. If the resolver returns before the timeout, execution continues as normal. See [Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) for how to implement this pattern.


### Websocket transport

Websockets will be useful to implement many of the future reactive features of GraphQL, like subscriptions and @live.
A first implementation could simply use the [ws library](https://github.com/websockets/ws), take queries sent in exactly the same format as they are currently sent over HTTP, pass them on to the core `runQuery` function and return the result over the websocket. Care must be taken to identify each request with a unique ID so the response can be sent with that same ID. Where the Express integration currently sends back HTTP error codes, the websocket implementation should omit those, and just send back JSON, for example `{ error: 'Invalid options provided to Apollo Server' }`.


### Subscriptions

(for reference on what GraphQL subscriptions are, see [here](https://medium.com/apollo-stack/new-features-in-graphql-batch-defer-stream-live-and-subscribe-7585d0c28b07))

Technically subscriptions are a different type of GraphQL operation (in addition to query and mutation), but in an initial version they could be implemented without modifications to graphql-js, by setting up poll-and-diff on the server. Upon receiving a subscription, the server first executes it as a normal query, but then adds it to a list of active subscriptions. Depending on whether updates happen in-band or out-of-band, subscribed queries are either re-run periodically, or when a mutation happens. The initial implementation should be done with polling. After that we can get arbitrarily fancy with things like invalidations, Mongo oplog-tailing etc.


### Support for @defer, @live and @stream

Support for the defer, stream and live directives will require replacing or modifying graphql-js’ `execute` function. The `execute` function would have to be changed to return an observable instead of a promise, and support for each of the directives would have to be built directly into the execution engine.
In addition, a new protocol will need to be devised for sending partial results back to the clients. The most straightforward way seems to be to include a path with the data sent in the response, for example `{ path: [ 'author', 'posts', 0 ], data: { title: 'Hello', views: 10 } }`. Such a response could then be merged on the client.

@defer could be implemented with a queue. Whenever a “defer” is encountered, it is put on the deferred queue. Once the initial response is sent, the deferred queue is processed. As each item in that queue is processed a new chunk is sent back.

Similar to defer, @live requires changes to the execution engine. In particular, it needs to know to set up a task that keeps sending updates. This can again be done by returning an observable, and then sending the data over a websocket or similar persistent transport. In its most basic form, @live could be implemented by re-running the live subtree of the query at a periodic interval. More advanced implementations will depend on setting up event listeners and re-executing parts of the query only when relevant results have changed.

@stream is similar to @defer, except that processing can continue right away, and the streamed part of the result can begin sending right away.
