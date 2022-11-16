---
title: File uploads
description: Enabling file uploads in Apollo Server
---
> ⚠️ **Apollo Server 2's file uploads feature has an end-of-life date of 31 December 2022.**
>
>[Learn more about this deprecation and end-of-life.](/apollo-server/other-versions#apollo-server-2)
>
> **WARNING**: The file upload mechanism described in this file (which we removed in Apollo Server 3) inherently exposes your server to [CSRF mutation attacks](https://www.apollographql.com/docs/apollo-server/security/cors/#preventing-cross-site-request-forgery-csrf). These attacks allow untrusted websites to ask users' browsers to send mutations to your Apollo Server which can execute even if your server's CORS security policy specifies that the origin in question should not be able to send that request. This is because the `multipart/form-data` content type that is parsed by the file upload feature is special-cased by browsers and can be sent in a POST request without the browser needing to "ask permission" via a "preflight" OPTIONS request. Attackers can run any mutation with your cookies, not just upload-specific mutations. Since Apollo Server v2.25.4, we no longer automatically enable this `multipart/form-data` parser unless you explicitly enable it with the `uploads` option to `new ApolloServer()` or if your schema uses the `Upload` scalar in it; in this case, your server will be protected from the CSRF mutation vulnerability. You can also pass `uploads: false` to `new ApolloServer()` in any version of Apollo Server 2 to ensure that this dangerous parser is disabled. If you actually use the upload feature (particularly if your app uses cookies for authentication), we highly encourage you to [upgrade to Apollo Server v3.7 or newer](https://www.apollographql.com/docs/apollo-server/migration/) and enable its [CSRF prevention feature](https://www.apollographql.com/docs/apollo-server/security/cors/#preventing-cross-site-request-forgery-csrf), or remove the use of uploads from your server.

> Note: Apollo Server's built-in file upload mechanism is not fully supported in Node 14 and later, and it will be removed in Apollo Server 3. For details, [see below](#uploads-in-node-14-and-later).

For server integrations that support file uploads (e.g. Express, hapi, Koa), Apollo Server enables file uploads by default if your schema references the `Upload` type.

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

## Uploads in Node 14 and later

Apollo Server's built-in support for file uploads relies on an old version of the [`graphql-upload` npm package](https://www.npmjs.com/package/graphql-upload) for backward compatibility. This old version is not fully compatible with Node 14.

> To prevent similar backward compatibility issues in the future, Apollo Server 3 will not include built-in file upload support.

To use file uploads with Node 14, you can disable built-in support by passing `uploads: false` to [the `ApolloServer` constructor](../api/apollo-server/#uploads). You can then install and use the lastest version of `graphql-upload` directly ([see the documentation](https://www.npmjs.com/package/graphql-upload#graphql-upload)).
