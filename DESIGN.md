# Apollo Server design goals

The goal of this project is to build a GraphQL server for Node.js that is simple, flexible, and performant. It is a Node.js GraphQL server built for production use.

Apollo Server consists of three parts:

1. Core
2. Integrations
3. Modules

At the core of Apollo Server is a function called `runQuery`, which handles parsing, validating and executing queries. Its interface is generic in order to allow for integrations with different Node.js server frameworks. Extensions provide useful functionality that can be shared between different integrations.


### Core

The main goals of Apollo Server are (in order of priority):

1. Simplicity: Apollo Server’s core API is very straight forward. It’s one function that does one thing really well (parsing, validating and executing GraphQL queries), and doesn’t do anything else.
2. Flexibility: The core of Apollo Server should be transport-agnostic (e.g. it doesn’t deal with HTTP or Websockets directly. This is will be handled in the wrappers for Express, Hapi, etc.)
3. Performance: Apollo server should be be tunable to make it fast in production. One example of this is that it should be able to take pre-stored queries to skip parsing and validation. It should also allow easy integration of profiling tools like Apollo Tracer that help with debugging and optimizing server performance.

### Integrations

Apollo Server should come with a set of integrations for different Node.js server frameworks:

- Express
- Hapi
- Connect
- Koa
- ...

Framework integrations take care of parsing requests, submitting them to Apollo Server’s core runQuery  function, and sending the response back to the client. These integrations should accept requests over HTTP, websockets or other means, then invoke `runQuery` as appropriate, and return the result. They should be written in such a way that makes it easy to add features, such as batched queries, subscriptions etc.

Framework integrations should hide all transport-specific (eg. setting headers) and framework-specific things (eg. registering a route) from the core functions.

### Modules
Things that are not part of runQuery’s tasks, but are GraphQL specific (such as providing a bundle for the GraphiQL UI, generating a schema, storing prepared queries, etc.) should be implemented in another core module of Apollo Server that lives alongside runQuery, or be imported from graphql-tools or other related packages.
