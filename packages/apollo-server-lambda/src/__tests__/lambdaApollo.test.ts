import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
  NODE_MAJOR_VERSION,
  NODE_MINOR_VERSION
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core' ;
import url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import request = require('supertest');

import gql from 'graphql-tag';
import { argsToArgsConfig } from 'graphql/type/definition';

const createLambda = (options: CreateAppOptions = {}) => {
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );

  const handler = server.createHandler();

  return (req: IncomingMessage, res: ServerResponse) => {
    // return 404 if path is /bogus-route to pass the test, lambda doesn't have paths
    if (req.url && req.url.includes('/bogus-route')) {
      res.statusCode = 404;
      return res.end();
    }

    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const urlObject = url.parse(req.url || '', true);
      const event = {
        httpMethod: req.method,
        body: body,
        path: req.url,
        queryStringParameters: urlObject.query,
        requestContext: {
          path: urlObject.pathname,
        },
        headers: req.headers,
      };
      const callback = (error: any, result: any) => {
        if (error) throw error;
        res.statusCode = result.statusCode;
        for (let key in result.headers) {
          if (result.headers.hasOwnProperty(key)) {
            res.setHeader(key, result.headers[key]);
          }
        }
        res.write(result.body);
        res.end();
      };
      handler(event as any, {} as any, callback);
    });
  };
};

describe('integration:Lambda', () => {
  testSuite(createLambda);
});

const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    uploads: [File]
    helloWorld: String
  }

  type Mutation {
    singleUpload(file: Upload!): File!
    multiUpload(files: [Upload!]!): [File]!
  }
`;

const resolvers = {
  Query: {
    uploads: () => {},
    helloWorld: () => 'hi'
  },
  Mutation: {
    singleUpload: async (_, {file}) => {
      expect((await file).stream).toBeDefined();
      return file;
    },
    multiUpload: async (parent, { files }) => {
      const fileArray = await files
      fileArray.forEach(async file => {
        expect((await file).stream).toBeDefined();
      });
      return fileArray;
    },
  },
};

// NODE: graphql-upload (8.0.0) requires Node 8.5 or higher

const supportedNodeVersion =
  ((NODE_MAJOR_VERSION === 8 && NODE_MINOR_VERSION >= 5) || NODE_MAJOR_VERSION >8);

(supportedNodeVersion ? describe : describe.skip)('file uploads', () => {
  let app = <any>null
  beforeAll(async ()=>{
    app = await createLambda({
      graphqlOptions: {
        typeDefs,
        resolvers,
      },
    });
  });

  it('allows for a standard query without uploads', async () => {
    const req = request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        query: `query{helloWorld}`
    });
    const res = await req;
    expect(res.statusCode).toBe(200);
    expect(res.body.data.helloWorld).toBe('hi')
  });

  it('allows for uploading a single file', async () => {
    const expected = {
      filename: 'package.json',
      encoding: '7bit',
      mimetype: 'application/json',
    };

    const req = request(app)
      .post('/graphql')
      .type('form')
      .field(
        'operations',
        JSON.stringify({
          query: `
            mutation($file: Upload!) {
              singleUpload(file: $file) {
                filename
                encoding
                mimetype
              }
            }
          `,
          variables: {
            file: null,
          },
        }),
      )
      .field('map', JSON.stringify({ 0: ['variables.file'] }))
      .attach('0', 'package.json');
    return req.then((res: any) => {
      expect(res.status).toEqual(200);
      expect(res.body.data.singleUpload).toEqual(expected);
    });
  });

  it('allows for uploading multiple files', async () => {
    const expected = [{
      filename: 'package.json',
      encoding: '7bit',
      mimetype: 'application/json',
    },
    {
      filename: 'tsconfig.json',
      encoding: '7bit',
      mimetype: 'application/json',
    }];

    const req = request(app)
      .post('/graphql')
      .type('form')
      .field(
        'operations',
        JSON.stringify({
          query: `
            mutation($files: [Upload!]!) {
              multiUpload(files: $files) {
                filename
                encoding
                mimetype
              }
            }
          `,
          variables: {
            files: [null, null],
          },
        }),
      )
      .field('map', JSON.stringify({ 0: ['variables.files.0'], 1: ['variables.files.1']}))
      .attach('0', 'package.json')
      .attach('1', 'tsconfig.json');
    return req.then((res: any) => {
      expect(res.status).toEqual(200);
      expect(res.body.data.multiUpload).toEqual(expected);
    });
  });
});
