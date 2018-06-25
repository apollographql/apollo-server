---
title: File Uploads
description: Implementing File Uploads on Apollo Server
---

File uploads are frequently requested features of several applications. Apollo Server enables file uploads by default. 

## Default File Uploads example

To enable file uploads, reference the `Upload` type in the schema passed to the Apollo Server construction.

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

> Note: Apollo Server automatically adds the Upload scalar to the schema, so any existing declaration of `scalar Upload` in the schema should be removed.


## Scalar Upload

The `Upload` type automatically added to the schema by Apollo Server resolves an object containing the following:

- `stream`
- `filename`
- `mimetype`
- `encoding`


### File Upload Options

There are several file upload options that you can pass into the Apollo Server constructor. They are:

- `maxFieldSize`: represents allowed non-file multipart form field size in bytes. The default is 1 MB.
- `maxFileSize: represents the allowed file size in bytes.
- `maxFiles: represents the allowed number of files. It can accept as many files as possible.


## Setup with Client 

File uploads might not happen from the terminal every time. In most cases, there's always a client with an intuitive UI that users can interact with to upload files. From the client side, you need to install the `apollo-upload-client` package. It enhances Apollo Client for intuitive file uploads via GraphQL mutations.

```sh
npm i apollo-upload-client
```

_file uploads example from the client for multple files_

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

_file uploads example from the client for a single file_

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

**Jayden Seric**, author of `apollo-upload-client` has [an example app on GitHub](https://github.com/jaydenseric/apollo-upload-examples/tree/master/app). It's a web app using `Next.js`, `react-apollo`, and `apollo-upload-client`.