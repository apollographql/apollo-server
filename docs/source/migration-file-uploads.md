---
title: File uploads in Node.js < v8.5.0
---

File uploads are supported in Apollo Server 2.x through the third-party [`graphql-upload`](https://npm.im/graphql-upload/) package.  While Apollo Server 2.x aims to support Node.js LTS versions prior to v8.5.0, the `graphql-upload` project no longer supports file uploads on versions of Node.js prior to v8.5.0 due to changes in the underlying architecture.

While Node.js versions prior to v8.5.0 are still under [_Long Term Support_ (LTS) agreements](https://github.com/nodejs/Release#release-schedule) from the Node.js Foundation, **we encourage _all users_ of Apollo Server to update to newer LTS versions of Node.js** prior to the "end-of-life" dates for their current server version.

For example, while Node.js 6.x is covered by Long Term Support until April 2019, there are substantial performance (e.g. [V8](https://v8.dev/) improvements) and language changes (e.g. "modern" ECMAScript support) offered by newer Node.js engines (e.g. 8.x, 10.x).  Switching to newer Long Term Support versions of Node.js comes with long-term benefits; Node.js 10.x LTS releases are covered by the Node.js Foundation through April 2021.

Since file upload support for Node.js versions prior to v8.5.0 is no longer offered by `graphql-upload`, users of those versions must disable file uploads to continue using newer Apollo Server 2.x versions.

**To disable file uploads and continue using Apollo Server 2.x on Node.js 6.x**, add the `uploads: false` setting to the options when constructing the server.  For example:

```js
const { typeDefs, resolvers } = require('./anOutsideDependency');
const server = new ApolloServer({
  /* Existing Apollo Server settings — e.g. type definitions */
  typeDefs,
  resolvers,

  /* Add this line to disable upload support! */
  uploads: false,

  /* ... other Apollo Server settings ... */
})
```

For additional assistance, please [search for existing issues](https://github.com/apollographql/apollo-server/issues?q=uploads) or file a [new issue](https://github.com/apollographql/apollo-server/issues/new) on the Apollo Server GitHub repository.
