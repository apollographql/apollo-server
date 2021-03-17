---
title: File uploads
description: Enabling file uploads in Apollo Server
---

> Note: Apollo Server 2 has built-in support for file uploads which is based on the [`graphql-upload` npm package](https://www.npmjs.com/package/graphql-upload). For backwards compatibility, Apollo Server is stuck depending on an old version of `graphql-upload` that does not fully support Node 14. We are planning to remove this integration in Apollo Server 3 and will instead document how to use `graphql-upload` directly (and work to make sure that all Apollo Server integration libraries have appropriate hooks to let you do so). If you want to use file uploads with Node 14 or use any of the more recently released features of `graphql-upload`, you are encouraged to disable the built-in integration by passing `uploads: false` to `new ApolloServer` and use `graphql-upload`'s API directly as documented in that package's documents. The rest of this page describes how to use the built-in integration.

For server integrations that support file uploads (e.g. Express, hapi, Koa), Apollo Server enables file uploads by default. To enable file uploads, reference the `Upload` type in the schema passed to the Apollo Server construction.

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    uploads: [File]
  }

  type Mutation {
    singleUpload(file: Upload!): File!
  }
`;

const resolvers = {
  Query: {
    uploads: (parent, args) => {},
  },
  Mutation: {
    singleUpload: (parent, args) => {
      return args.file.then(file => {
        //Contents of Upload scalar: https://github.com/jaydenseric/graphql-upload#class-graphqlupload
        //file.createReadStream() is a readable node stream that contains the contents of the uploaded file
        //node stream api: https://nodejs.org/api/stream.html
        return file;
      });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

> Note: When using `typeDefs`, Apollo Server adds `scalar Upload` to your schema, so any existing declaration of `scalar Upload` in the type definitions should be removed. If you create your schema with `makeExecutableSchema` and pass it to `ApolloServer` constructor using the `schema` param, make sure to include [`scalar Upload`](https://www.apollographql.com/docs/guides/file-uploads.html#File-upload-with-schema-param).
