---
title: File Uploads
description: Implementing File Uploads on Apollo Server
---

## File Uploads

For server integrations that support file uploads(express, hapi, koa, etc), Apollo Server enables file uploads by default. To enable file uploads, reference the `Upload` type in the schema passed to the Apollo Server construction.

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
        //Contents of Upload scalar: https://github.com/jaydenseric/apollo-upload-server#upload-scalar
        //file.stream is a node stream that contains the contents of the uploaded file
        //node stream api: https://nodejs.org/api/stream.html
        return file;
      })
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

> Note: Apollo Server adds the Upload scalar to the schema, so any existing declaration of `scalar Upload` in the schema should be removed

