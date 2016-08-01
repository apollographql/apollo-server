# Apollo-server: A GraphQL server for Node.js

[![npm version](https://badge.fury.io/js/apollo-server.svg)](https://badge.fury.io/js/apollo-server)
[![Build Status](https://travis-ci.org/apollostack/apollo-server.svg?branch=master)](https://travis-ci.org/apollostack/apollo-server)
[![Coverage Status](https://coveralls.io/repos/github/apollostack/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollostack/apollo-server?branch=master)
[![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](http://www.apollostack.com/#slack)

Apollo server has integrations for Express, Connect, HAPI and Koa!

### Contributions

Contributions, issues and feature requests are very welcome. If you are using this package and fixed a bug for yourself, please consider submitting a PR!

### Folder structure

**/src/core**:
- contains the core functionality that is independent of any particular node.js server framework

**/src/integrations/\<name\>**:
- Contains the integrations for Node.js server framework \<name\> (i.e. express, HAPI, Koa, connect)

**/src/test**:
- Contains only the `tests.ts` file that imports other tests. All real test files go in the same folder as the code they are testing, and should be named `*.test.ts`.
