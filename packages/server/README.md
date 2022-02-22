# apollo-server-core

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server/tree/main.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)

This package implements the core logic of Apollo Server. It exports a base version of `ApolloServer`. Typically you do not use this class directly but instead use an `ApolloServer` imported from the batteries-included `apollo-server` package or one of the integration packages like `apollo-server-express`.

It also exports a set of plugins such as `ApolloServerPluginUsageReporting` which you can provide to the `plugins` option to the `ApolloServer` constructor.

[Read the docs.](https://www.apollographql.com/docs/apollo-server/)
[Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md)
