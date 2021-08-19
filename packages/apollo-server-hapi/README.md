[![npm version](https://badge.fury.io/js/apollo-server-hapi.svg)](https://badge.fury.io/js/apollo-server-hapi)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server/tree/main.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)
[![Join the community forum](https://img.shields.io/badge/join%20the%20community-forum-blueviolet)](https://community.apollographql.com)
[![Read CHANGELOG](https://img.shields.io/badge/read-changelog-blue)](https://github.com/apollographql/apollo-server/blob/HEAD/CHANGELOG.md)


This is the Hapi integration of Apollo Server. Apollo Server is a community-maintained open-source Apollo Server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/). [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md)

This package has only been tested with `@hapi/hapi` 20.1.2 and higher; that is the minimum version of Hapi that supports Node 16.

A full example of how to use `apollo-server-hapi` can be found in [the docs](https://www.apollographql.com/docs/apollo-server/integrations/middleware/#apollo-server-hapi).

### Context

The context is created for each request. The following code snippet shows the creation of a context. The arguments are the `request`, the request, and `h`, the response toolkit.

```js
new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ request, h }) => {
    return { ... };
  },
})
```

## Principles

Apollo Server is built with the following principles in mind:

* **By the community, for the community**: Apollo Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, Apollo Server is easier to use, easier to contribute to, and more secure
* **Performance**: Apollo Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to Apollo Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/main/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/main/ROADMAP.md) and make your first PR!
