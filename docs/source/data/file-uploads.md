---
title: File uploads
description: Enabling file uploads in Apollo Server
---

> Note: As of Apollo Server 3.0, in order to allow the `graphql-upload` package to evolve and live on its own, uploads are no longer enabled by default and are not an integrated part of Apollo Server.

File uploads can be enabled by using the third-party [`graphql-upload`](https://npm.im/graphql-upload) package.  Using this package will introduce support for the `multipart/form-data` content-type.

The instructions below demonstrate how to do this on Express.  Those wishing to implement similar functionality on other Node.js HTTP frameworks (e.g., Koa) should see the [`graphql-upload` repository's documentation](https://github.com/jaydenseric/graphql-upload) for more information.  Some integrations may need to use `graphql-upload`'s `processRequest` directly.

```js
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const {
  GraphQLUpload,
  graphqlUploadExpress, // A Koa implementation is also exported.
} = require('graphql-upload');

const typeDefs = gql`
  # The implementation for this scalar is provided by the
  # 'GraphQLUpload' export from the 'graphql-upload' package
  # in the resolver map below.
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    # This is only here to satisfy the requirement that at least one
    # field be present within the 'Query' type.  This example does not
    # demonstrate how to fetch uploads back.
    otherFields: Boolean!
  }

  type Mutation {
    # Multiple uploads are supported. See graphql-upload docs for details.
    singleUpload(file: Upload!): File!
  }
`;

const resolvers = {
  // This maps the `Upload` scalar to the implementation provided
  // by the `graphql-upload` package.
  Upload: GraphQLUpload,

  Mutation: {
    async singleUpload: (parent, { file }) => {
      const { createReadStream, filename, mimetype, encoding } = await file;

      // Invoking the `createReadStream` will return a Readable Stream.
      // See https://nodejs.org/api/stream.html#stream_readable_streams
      const stream = createReadStream();

      // This is purely for demonstration purposes and will overwrite the
      // local-file-output.txt in the current working directory on EACH upload.
      const out = require('fs').createWriteStream('local-file-output.txt');
      stream.pipe(out);

      return { filename, mimetype, encoding };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

// This middleware should be added before calling `applyMiddleware`.
app.use(graphqlUploadExpress());

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
});
```
