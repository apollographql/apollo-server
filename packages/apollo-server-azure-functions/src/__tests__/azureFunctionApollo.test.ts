import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';
import url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import typeis from 'type-is';

const createAzureFunction = async (options: CreateAppOptions = {}) => {
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );

  const handler = server.createHandler();

  return (req: IncomingMessage, res: ServerResponse) => {
    // return 404 if path is /bogus-route to pass the test, azure doesn't have paths
    if (req.url!.includes('/bogus-route')) {
      res.statusCode = 404;
      return res.end();
    }

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const urlObject = url.parse(req.url!, true);
      const contentType = req.headers['content-type'];
      const request = {
        method: req.method,
        body,
        path: req.url,
        query: urlObject.query,
        headers: req.headers,
      };
      if (
        body &&
        contentType &&
        req.headers['content-length'] &&
        req.headers['content-length'] !== '0' &&
        typeis.is(contentType, 'application/json')
      ) {
        try {
          request.body = JSON.parse(body);
        } catch (e) {
          // Leaving body as string seems to be what Azure Functions does.
          // https://github.com/Azure/azure-functions-host/blob/ba408f522b59228f7fcf9c64223d2ef109ca810d/src/WebJobs.Script.Grpc/MessageExtensions/GrpcMessageConversionExtensions.cs#L251-L264
        }
      }
      const context = {
        done(error: any, result: any) {
          if (error) throw error;
          res.statusCode = result.status;
          for (const key in result.headers) {
            if (result.headers.hasOwnProperty(key)) {
              res.setHeader(key, result.headers[key]);
            }
          }
          res.write(result.body);
          res.end();
        },
      };
      handler(context as any, request as any);
    });
  };
};

describe('integration:AzureFunctions', () => {
  testSuite({
    createApp: createAzureFunction,
    serverlessFramework: true,
    integrationName: 'azure-functions',
  });

  it('can append CORS headers to GET request', async () => {
    const server = new ApolloServer({ schema: Schema });
    const handler = server.createHandler({
      cors: {
        origin: 'CORSOrigin',
        methods: ['GET', 'POST', 'PUT'],
        allowedHeaders: 'AllowedCORSHeader1,AllowedCORSHeader1',
        exposedHeaders: 'ExposedCORSHeader1,ExposedCORSHeader2',
        credentials: true,
        maxAge: 42,
      },
    });
    const expectedResult = {
      testString: 'it works',
    };
    const query = {
      query: 'query test{ testString }',
    };
    const request = {
      method: 'GET',
      body: null,
      path: '/graphql',
      query: query,
      headers: {},
    };
    const context: any = {};
    const p = new Promise((resolve, reject) => {
      context.done = (error: Error, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      };
    });
    handler(context as any, request as any);
    const result: any = await p;

    expect(result.status).toEqual(200);
    expect(result.body).toEqual(
      JSON.stringify({ data: expectedResult }) + '\n',
    );
    expect(result.headers['Access-Control-Allow-Origin']).toEqual('CORSOrigin');
    expect(result.headers['Access-Control-Allow-Methods']).toEqual(
      'GET,POST,PUT',
    );
    expect(result.headers['Access-Control-Allow-Headers']).toEqual(
      'AllowedCORSHeader1,AllowedCORSHeader1',
    );
    expect(result.headers['Access-Control-Expose-Headers']).toEqual(
      'ExposedCORSHeader1,ExposedCORSHeader2',
    );
    expect(result.headers['Access-Control-Allow-Credentials']).toEqual('true');
    expect(result.headers['Access-Control-Max-Age']).toEqual(42);
  });

  it('can handle OPTIONS request with CORS headers', () => {
    const server = new ApolloServer({ schema: Schema });
    const handler = server.createHandler({
      cors: {
        allowedHeaders: 'AllowedCORSHeader1,AllowedCORSHeader1',
      },
    });
    const request = {
      method: 'OPTIONS',
      body: null,
      path: '/graphql',
      query: null,
      headers: {},
    };
    const context = {
      done(error: any, result: any) {
        if (error) throw error;
        expect(result.status).toEqual(204);
        expect(result.headers['Access-Control-Allow-Headers']).toEqual(
          'AllowedCORSHeader1,AllowedCORSHeader1',
        );
      },
    };
    handler(context as any, request as any);
  });

  it('can return landing page', (done) => {
    const server = new ApolloServer({ schema: Schema });
    const handler = server.createHandler({});
    const request = {
      method: 'GET',
      body: null,
      path: '/',
      query: null,
      headers: {
        Accept: 'text/html',
      },
    };
    const context = {
      done(error: any, result: any) {
        if (error) {
          done(error);
          return;
        }
        try {
          expect(result.status).toEqual(200);
          expect(result.body).toMatch(
            /apollo-server-landing-page.cdn.apollographql.com\/_latest/,
          );
          expect(result.headers['Content-Type']).toEqual('text/html');
          done();
        } catch (e) {
          done(e);
        }
      },
    };
    handler(context as any, request as any);
  });
});
