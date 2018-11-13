---
title: File uploads
description: Implementing file uploads in GraphQL apps
---

File uploads are a requirement for many applications. Apollo Server supports the [GraphQL multipart request specification](https://github.com/jaydenseric/graphql-multipart-request-spec) for uploading files as mutation arguments using [apollo-upload-server](https://github.com/jaydenseric/apollo-upload-server).

## File upload with default options

Apollo Server automatically adds the `Upload` scalar to the schema when you are not setting the schema manually.

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
    files: () => {
      // Return the record of files uploaded from your DB or API or filesystem.
    }
  },
  Mutation: {
    async singleUpload(parent, { file }) {
      const { stream, filename, mimetype, encoding } = await file;

      // 1. Validate file metadata.

      // 2. Stream file contents into local filesystem or cloud storage:
      // https://nodejs.org/api/stream.html

      // 3. Record the file upload in your DB.
      // const id = await recordFile( … )

      return { stream, filename, mimetype, encoding };
    }
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

## File upload with schema param

In a situation where a schema is set manually using `makeExecutableSchema` and passed to the `ApolloServer` constructor using the schema params, add the `Upload` scalar to the type definitions and `Upload` to the resolver as shown in the example below:

```js
const { ApolloServer, makeExecutableSchema, gql, GraphQLUpload } = require('apollo-server');

const typeDefs = gql`
  scalar Upload
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
  Upload: GraphQLUpload,
  Query: {
    files: () => {
      // Return the record of files uploaded from your DB or API or filesystem.
    }
  },
  Mutation: {
    async singleUpload(parent, { file }) {
      const { stream, filename, mimetype, encoding } = await file;

      // 1. Validate file metadata.

      // 2. Stream file contents into local filesystem or cloud storage:
      // https://nodejs.org/api/stream.html

      // 3. Record the file upload in your DB.
      // const id = await recordFile( … )

      return { stream, filename, mimetype, encoding };
    }
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```


## Scalar Upload

The `Upload` type automatically added to the schema by Apollo Server resolves an object containing the following:

- `stream`
- `filename`
- `mimetype`
- `encoding`


### File upload options

The `ApolloServer` constructor supports the following configuration properties. They are:

- `maxFieldSize`: represents allowed non-file multipart form field size in bytes.
- `maxFileSize`: represents the allowed file size in bytes.
- `maxFiles`: represents the allowed number of files. It can accept as many files as possible.


## Client setup

From the client side, you need to install the `apollo-upload-client` package. It enables file uploads via GraphQL mutations.

```sh
npm install apollo-upload-client
```

You will then need to initialize your [Apollo Client](https://apollographql.com/docs/link#apollo-client) instance with a terminating [Apollo Link](https://apollographql.com/docs/link), created by calling [`createUploadlink`](https://github.com/jaydenseric/apollo-upload-client#function-createuploadlink). For example:

```js
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createUploadLink } from 'apollo-upload-client';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: createUploadLink(),
});
```

> Note: [Apollo Boost](https://www.apollographql.com/docs/react/essentials/get-started.html#apollo-boost) does not support Apollo Link overrides, so if you're using Apollo Boost and want to use `apollo-upload-client`, you will need to switch to the full version of Apollo Client. See the [Apollo Boost migration](https://www.apollographql.com/docs/react/advanced/boost-migration.html) docs for help migrating from Apollo Boost to Apollo Client.

_File uploads example from the client for a single file:_

```js
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

export const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!) {
    uploadFile(file: $file) {
      filename
    }
  }
`;

const uploadFile = () => {
  return (
    <Mutation mutation={UPLOAD_FILE}>
      {uploadFile => (
        <input
        type="file"
        required
        onChange={({ target: { validity, files: [file] } }) =>
          validity.valid && uploadFile({ variables: { file } });
        }
      />
      )}
    </Mutation>
  );
};
```

_File uploads example from the client for multiple files:_

```js
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

export const UPLOAD_MULTIPLE_FILES = gql`
  mutation uploadMultipleFiles($files: [Upload!]!) {
    uploadMultipleFiles(files: $files) {
      filename
    }
  }
`;

const uploadMultipleFiles = () => {
  return (
    <Mutation mutation={UPLOAD_MULTIPLE_FILES}>
      {uploadFile => (
        <input
        type="file"
        multiple
        required
        onChange={({ target: { validity, files } }) =>
          validity.valid && uploadMultipleFiles({ variables: { files } });
        }
       />
      )}
    </Mutation>
  );
};
```

_Blob example from the client:_

```js
import gql from 'graphql-tag'

// Apollo Client instance
import client from './apollo'

const file = new Blob(['Foo.'], { type: 'text/plain' })

// Optional, defaults to `blob`
file.name = 'bar.txt'

client.mutate({
  mutation: gql`
    mutation($file: Upload!) {
      uploadFile(file: $file) {
        filename
      }
    }
  `,
  variables: { file }
})
```

Use [FileList](https://developer.mozilla.org/en/docs/Web/API/FileList), [File](https://developer.mozilla.org/en/docs/Web/API/File), [Blob](https://developer.mozilla.org/en/docs/Web/API/Blob) instances anywhere within query or mutation input variables to send a GraphQL multipart request.

**Jayden Seric**, author of [apollo-upload-client](https://github.com/jaydenseric/apollo-upload-client) has [an example app on GitHub](https://github.com/jaydenseric/apollo-upload-examples/tree/master/app). It's a web app using [Next.js](https://github.com/zeit/next.js/), [react-apollo](https://github.com/apollographql/react-apollo), and [apollo-upload-client](https://github.com/jaydenseric/apollo-upload-client).