---
title: File uploads
description: Implementing file uploads on Apollo Server
---

File uploads are a requirement for many applications. Apollo Server supports the [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec) for uploading files as mutation arguments using [apollo-upload-server](https://github.com/jaydenseric/apollo-upload-server).

## File upload with default options

Apollo Server automatically adds the `Upload` scalar to the schema, so any existing declaration of `scalar Upload` in the schema should be removed.

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
    async singleUpload(parent, { upload }) {
      const { stream, filename, mimetype, encoding } = await upload

      // 1. Validate file metadata.

      // 2. Stream file contents into cloud storage:
      // https://nodejs.org/api/stream.html

      // 3. Record the file upload in your DB.
      // const id = await recordFile( … )

      return { id, filename, mimetype, encoding }
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


## Scalar Upload

The `Upload` type automatically added to the schema by Apollo Server resolves an object containing the following:

- `stream`
- `filename`
- `mimetype`
- `encoding`


### File upload options

There are several file upload options that you can pass into the Apollo Server constructor. They are:

- `maxFieldSize`: represents allowed non-file multipart form field size in bytes.
- `maxFileSize`: represents the allowed file size in bytes.
- `maxFiles`: represents the allowed number of files. It can accept as many files as possible.


## Client setup 

File uploads might not happen from the terminal every time. In most cases, there's always a client with an intuitive UI that users can interact with to upload files. From the client side, you need to install the `apollo-upload-client` package. It enhances Apollo Client for intuitive file uploads via GraphQL mutations.

```sh
npm i apollo-upload-client
```

_File uploads example from the client for a single file:_

```js
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

export default graphql(gql`
  mutation($file: Upload!) {
    uploadFile(file: $file) {
      id
    }
  }
`)(({ mutate }) => (
  <input
    type="file"
    required
    onChange={({ target: { validity, files: [file] } }) =>
      validity.valid && mutate({ variables: { file } })
    }
  />
))
```

_File uploads example from the client for multiple files:_

```js
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

export default graphql(gql`
  mutation($files: [Upload!]!) {
    uploadFiles(files: $files) {
      id
    }
  }
`)(({ mutate }) => (
  <input
    type="file"
    multiple
    required
    onChange={({ target: { validity, files } }) =>
      validity.valid && mutate({ variables: { files } })
    }
  />
))
```

**Jayden Seric**, author of [apollo-upload-client](https://github.com/jaydenseric/apollo-upload-client) has [an example app on GitHub](https://github.com/jaydenseric/apollo-upload-examples/tree/master/app). It's a web app using [Next.js](https://github.com/zeit/next.js/), [react-apollo](https://github.com/apollographql/react-apollo), and [apollo-upload-client](https://github.com/jaydenseric/apollo-upload-client).