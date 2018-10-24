import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';
import url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import request = require('supertest');

import gql from 'graphql-tag';

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
  scalar Upload

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
  }
`;

const resolvers = {
  Query: {
    uploads: () => {},
    helloWorld: () => 'hi',
  },
  Mutation: {
    singleUpload: async (_, args) => {
      expect((await args.file).stream).toBeDefined();
      return args.file;
    },
  },
};

describe('file uploads', () => {
  it('enabled uploads', async () => {
    const app = await createLambda({
      graphqlOptions: {
        typeDefs,
        resolvers,
      },
    });

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
      .field('map', JSON.stringify({ 1: ['variables.file'] }))
      .attach('1', 'package.json');

    return req.then((res: any) => {
      expect(res.status).toEqual(200);
      expect(res.body.data.singleUpload).toEqual(expected);
    });
  });
});
