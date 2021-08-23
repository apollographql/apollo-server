[![npm version](https://badge.fury.io/js/apollo-server-express.svg)](https://badge.fury.io/js/apollo-server-express)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server/tree/main.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)
[![Join the community forum](https://img.shields.io/badge/join%20the%20community-forum-blueviolet)](https://community.apollographql.com)
[![Read CHANGELOG](https://img.shields.io/badge/read-changelog-blue)](https://github.com/apollographql/apollo-server/blob/HEAD/CHANGELOG.md)


This is the Express integration of Apollo Server. Apollo Server is a community-maintained open-source GraphQL server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/). [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md)


A full example of how to use `apollo-server-express` can be found in [the docs](https://www.apollographql.com/docs/apollo-server/integrations/middleware/#apollo-server-express).

Before Apollo Server 3, we officially supported using this package with `connect` as well. `connect` is an older framework that `express` evolved from. For now, we believe that this package is still compatible with `connect` and we even run tests against `connect`, but we may choose to break this compatibility at some point without a major version bump. If you rely on the ability to use Apollo Server with `connect`, you may wish to make your own integration.

## Principles

GraphQL Server is built with the following principles in mind:

* **By the community, for the community**: GraphQL Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, GraphQL Server is easier to use, easier to contribute to, and more secure
* **Performance**: GraphQL Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to GraphQL Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/main/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/main/ROADMAP.md) and make your first PR!
