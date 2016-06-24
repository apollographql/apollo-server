// tslint:disable
// TODO: enable when you figure out how to automatically fix trailing commas

/*
 * Below are the HTTP tests from express-graphql. We're using them here to make
 * sure apolloServer still works if used in the place of express-graphql.
 */

import { graphqlHTTP } from '../integrations/expressApollo';
  // TODO: test that it accepts a promise as input object.
  // XXX: how annoying will it be to keep these tests up to date for every
  // release of graphql-http?

/* @flow */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

// 80+ char lines are useful in describe/it, so ignore in this file.
/* eslint-disable max-len */

import { expect } from 'chai';
import { stringify } from 'querystring';
import zlib from 'zlib';
import * as multer from 'multer';
import * as bodyParser from 'body-parser';
const request = require('supertest-as-promised');
const express4 = require('express'); // modern
//import express3 from 'express3'; // old but commonly still used
const express3 = express4;
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  BREAK
} from 'graphql';

const QueryRootType = new GraphQLObjectType({
  name: 'QueryRoot',
  fields: {
    test: {
      type: GraphQLString,
      args: {
        who: {
          type: GraphQLString
        }
      },
      resolve: (root, { who }) => 'Hello ' + (who || 'World')
    },
    thrower: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: () => { throw new Error('Throws!'); }
    },
    context: {
      type: GraphQLString,
      resolve: (obj, args, context) => context,
    }
  }
});

const TestSchema = new GraphQLSchema({
  query: QueryRootType,
  mutation: new GraphQLObjectType({
    name: 'MutationRoot',
    fields: {
      writeTest: {
        type: QueryRootType,
        resolve: () => ({})
      }
    }
  })
});

function urlString(urlParams?: any): string {
  let str = '/graphql';
  if (urlParams) {
    str += ('?' + stringify(urlParams));
  }
  return str;
}

function catchError(p) {
  return p.then(
    (res) => {
      // workaround for unkown issues with testing against npm package of express-graphql.
      // the same code works when testing against the source, I'm not sure why.
      if (res && res.error) {
        return { response: res };
      }
      throw new Error('Expected to catch error.');
    },
    error => {
      if (!(error instanceof Error)) {
        throw new Error('Expected error to be instanceof Error.');
      }
      return error;
    }
  );
}

function promiseTo(fn) {
  return new Promise((resolve, reject) => {
    fn((error, result) => error ? reject(error) : resolve(result));
  });
}

describe('test harness', () => {

  it('expects to catch errors', async () => {
    let caught;
    try {
      await catchError(Promise.resolve());
    } catch (error) {
      caught = error;
    }
    expect(caught && caught.message).to.equal('Expected to catch error.');
  });

  it('expects to catch actual errors', async () => {
    let caught;
    try {
      await catchError(Promise.reject('not a real error'));
    } catch (error) {
      caught = error;
    }
    expect(caught && caught.message).to.equal('Expected error to be instanceof Error.');
  });

  it('resolves callback promises', async () => {
    const resolveValue = {};
    const result = await promiseTo(cb => cb(null, resolveValue));
    expect(result).to.equal(resolveValue);
  });

  it('rejects callback promises with errors', async () => {
    const rejectError = new Error();
    let caught;
    try {
      await promiseTo(cb => cb(rejectError));
    } catch (error) {
      caught = error;
    }
    expect(caught).to.equal(rejectError);
  });

});

[[ express4, 'modern' ]].forEach(([ express, version ]) => {
  describe(`GraphQL-HTTP (apolloServer) tests for ${version} express`, () => {
    /* describe('GET functionality', () => {

      it('Reports validation errors', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({ schema: TestSchema }));

        const error = await catchError(
          request(app)
            .get(urlString({
              query: `{ test, unknownOne, unknownTwo }`
            }))
        );

        expect(error.response.status).to.equal(400);
        expect(JSON.parse(error.response.text)).to.deep.equal({
          errors: [
            {
              message: 'Cannot query field "unknownOne" on type "QueryRoot".',
              locations: [ { line: 1, column: 9 } ]
            },
            {
              message: 'Cannot query field "unknownTwo" on type "QueryRoot".',
              locations: [ { line: 1, column: 21 } ]
            }
          ]
        });
      });

      it('Errors when missing operation name', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({ schema: TestSchema }));

        const error = await catchError(
          request(app)
            .get(urlString({
              query: `
                query TestQuery { test }
                mutation TestMutation { writeTest { test } }
              `
            }))
        );

        expect(error.response.status).to.equal(400);
        expect(JSON.parse(error.response.text)).to.deep.equal({
          errors: [
            { message: 'Must provide operation name if query contains multiple operations.' }
          ]
        });
      });

      it('Allows passing in a context', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
          context: 'testValue'
        }));

        const response = await request(app)
          .get(urlString({
            operationName: 'TestQuery',
            query: `
              query TestQuery { context }
            `
          }));

        expect(response.status).to.equal(200);
        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            context: 'testValue'
          }
        });
      });

      it('Allows returning an options Promise', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP(() => Promise.resolve({
          schema: TestSchema,
        })));

        const response = await request(app)
          .get(urlString({
            query: '{test}'
          }));

        expect(response.text).to.equal(
          '{"data":{"test":"Hello World"}}'
        );
      });

    });
    */


    describe('POST functionality', () => {
    /*
      it('allows POST with JSON encoding', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema
        }));

        const response = await request(app)
          .post(urlString()).send({ query: '{test}' });

        expect(response.text).to.equal(
          '{"data":{"test":"Hello World"}}'
        );
      });

      it('Allows sending a mutation via POST', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({ schema: TestSchema }));

        const response = await request(app)
          .post(urlString())
          .send({ query: 'mutation TestMutation { writeTest { test } }' });

        expect(response.status).to.equal(200);
        expect(response.text).to.equal(
          '{"data":{"writeTest":{"test":"Hello World"}}}'
        );
      });


      it('supports POST JSON query with JSON variables', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema
        }));

        const response = await request(app)
          .post(urlString())
          .send({
            query: 'query helloWho($who: String){ test(who: $who) }',
            variables: { who: 'Dolly' }
          });

        expect(response.text).to.equal(
          '{"data":{"test":"Hello Dolly"}}'
        );
      });

      it('allows POST with operation name', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP(() => ({
          schema: TestSchema
        })));

        const response = await request(app)
          .post(urlString())
          .send({
            query: `
              query helloYou { test(who: "You"), ...shared }
              query helloWorld { test(who: "World"), ...shared }
              query helloDolly { test(who: "Dolly"), ...shared }
              fragment shared on QueryRoot {
                shared: test(who: "Everyone")
              }
            `,
            operationName: 'helloWorld'
          });

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            test: 'Hello World',
            shared: 'Hello Everyone',
          }
        });
      });

      */

      /*
      it('allows gzipped POST bodies', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP(() => ({
          schema: TestSchema
        })));

        const data = { query: '{ test(who: "World") }' };
        const json = JSON.stringify(data);
        // TODO had to write "as any as Buffer" to make tsc accept it. Does it matter?
        const gzippedJson = await promiseTo(cb => zlib.gzip(json as any as Buffer, cb));

        const req = request(app)
          .post(urlString())
          .set('Content-Type', 'application/json')
          .set('Content-Encoding', 'gzip');
        req.write(gzippedJson);
        const response = await req;

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            test: 'Hello World'
          }
        });
      });

      it('allows deflated POST bodies', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP(() => ({
          schema: TestSchema
        })));

        const data = { query: '{ test(who: "World") }' };
        const json = JSON.stringify(data);
        // TODO had to write "as any as Buffer" to make tsc accept it. Does it matter?
        const deflatedJson = await promiseTo(cb => zlib.deflate(json as any as Buffer, cb));

        const req = request(app)
          .post(urlString())
          .set('Content-Type', 'application/json')
          .set('Content-Encoding', 'deflate');
        req.write(deflatedJson);
        const response = await req;

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            test: 'Hello World'
          }
        });
      });
      */

      it('allows for pre-parsed POST bodies', async () => {
        // Note: this is not the only way to handle file uploads with GraphQL,
        // but it is terse and illustrative of using express-graphql and multer
        // together.

        // A simple schema which includes a mutation.
        const UploadedFileType = new GraphQLObjectType({
          name: 'UploadedFile',
          fields: {
            originalname: { type: GraphQLString },
            mimetype: { type: GraphQLString }
          }
        });

        const TestMutationSchema = new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'QueryRoot',
            fields: {
              test: { type: GraphQLString }
            }
          }),
          mutation: new GraphQLObjectType({
            name: 'MutationRoot',
            fields: {
              uploadFile: {
                type: UploadedFileType,
                resolve(rootValue) {
                  // For this test demo, we're just returning the uploaded
                  // file directly, but presumably you might return a Promise
                  // to go store the file somewhere first.
                  return rootValue.request.file;
                }
              }
            }
          })
        });

        const app = express();

        // Multer provides multipart form data parsing.
        const storage = multer.memoryStorage();
        app.use(urlString(), multer({ storage }).single('file'));

        // Providing the request as part of `rootValue` allows it to
        // be accessible from within Schema resolve functions.
        app.use(urlString(), graphqlHTTP(req => {
          return {
            schema: TestMutationSchema,
            rootValue: { request: req }
          };
        }));

        const response = await request(app)
          .post(urlString())
          .field('query', `mutation TestMutation {
            uploadFile { originalname, mimetype }
          }`)
          .attach('file', __filename);

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            uploadFile: {
              originalname: 'testApolloServerHTTP.js',
              mimetype: 'application/javascript'
            }
          }
        });
      });
      /*
      it('allows for pre-parsed POST using application/graphql', async () => {
        const app = express();
        app.use(bodyParser.text({ type: 'application/graphql' }));

        app.use(urlString(), graphqlHTTP({ schema: TestSchema }));

        const req = request(app)
          .post(urlString())
          .set('Content-Type', 'application/graphql');
        req.write(new Buffer('{ test(who: "World") }'));
        const response = await req;

        expect(JSON.parse(response.text)).to.deep.equal({
          data: {
            test: 'Hello World'
          }
        });
      });

      it('does not accept unknown pre-parsed POST string', async () => {
        const app = express();
        app.use(bodyParser.text({ type: '**' })); // TODO comment...

        app.use(urlString(), graphqlHTTP({ schema: TestSchema }));

        const req = request(app)
          .post(urlString());
        req.write(new Buffer('{ test(who: "World") }'));
        const error = await catchError(req);

        expect(error.response.status).to.equal(400);
        expect(JSON.parse(error.response.text)).to.deep.equal({
          errors: [ { message: 'Must provide query string.' } ]
        });
      });

      it('does not accept unknown pre-parsed POST raw Buffer', async () => {
        const app = express();
        app.use(bodyParser.raw({ type: '**' }));

        app.use(urlString(), graphqlHTTP({ schema: TestSchema }));

        const req = request(app)
          .post(urlString())
          .set('Content-Type', 'application/graphql');
        req.write(new Buffer('{ test(who: "World") }'));
        const error = await catchError(req);

        expect(error.response.status).to.equal(400);
        expect(JSON.parse(error.response.text)).to.deep.equal({
          errors: [ { message: 'Must provide query string.' } ]
        });
      });
    */
    });

    /*
    describe('Error handling functionality', () => {
      it('handles field errors caught by GraphQL', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema
        }));

        const response = await request(app)
          .get(urlString({
            query: '{thrower}',
          }));

        expect(response.status).to.equal(200);
        expect(JSON.parse(response.text)).to.deep.equal({
          data: null,
          errors: [ {
            message: 'Throws!',
            locations: [ { line: 1, column: 2 } ]
          } ]
        });
      });

      it('allows for custom error formatting to sanitize', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
          formatError(error) {
            return { message: 'Custom error format: ' + error.message };
          }
        }));

        const response = await request(app)
          .get(urlString({
            query: '{thrower}',
          }));

        expect(response.status).to.equal(200);
        expect(JSON.parse(response.text)).to.deep.equal({
          data: null,
          errors: [ {
            message: 'Custom error format: Throws!',
          } ]
        });
      });

      it('allows for custom error formatting to elaborate', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
          formatError(error) {
            return {
              message: error.message,
              locations: error.locations,
              stack: 'Stack trace'
            };
          }
        }));

        const response = await request(app)
          .get(urlString({
            query: '{thrower}',
          }));

        expect(response.status).to.equal(200);
        expect(JSON.parse(response.text)).to.deep.equal({
          data: null,
          errors: [ {
            message: 'Throws!',
            locations: [ { line: 1, column: 2 } ],
            stack: 'Stack trace',
          } ]
        });
      });

      it('handles syntax errors caught by GraphQL', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
        }));

        const error = await catchError(
          request(app)
            .get(urlString({
              query: 'syntaxerror',
            }))
        );

        expect(error.response.status).to.equal(400);
        expect(JSON.parse(error.response.text)).to.deep.equal({
          errors: [ {
            message: 'Syntax Error GraphQL request (1:1) ' +
              'Unexpected Name \"syntaxerror\"\n\n1: syntaxerror\n   ^\n',
            locations: [ { line: 1, column: 1 } ]
          } ]
        });
      });

      it('handles errors caused by a lack of query', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
        }));

        const error = await catchError(
          request(app).get(urlString())
        );

        expect(error.response.status).to.equal(400);
        expect(JSON.parse(error.response.text)).to.deep.equal({
          errors: [ { message: 'Must provide query string.' } ]
        });
      });

      it('handles invalid JSON bodies', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
        }));

        const error = await catchError(
          request(app)
            .post(urlString())
            .set('Content-Type', 'application/json')
            .send('[]')
        );

        expect(error.response.status).to.equal(400);
        expect(JSON.parse(error.response.text)).to.deep.equal({
          errors: [ { message: 'POST body sent invalid JSON.' } ]
        });
      });

      it('handles incomplete JSON bodies', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
        }));

        const error = await catchError(
          request(app)
            .post(urlString())
            .set('Content-Type', 'application/json')
            .send('{"query":')
        );

        expect(error.response.status).to.equal(400);
        expect(JSON.parse(error.response.text)).to.deep.equal({
          errors: [ { message: 'POST body sent invalid JSON.' } ]
        });
      });

      it('handles plain POST text', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema
        }));

        const error = await catchError(
          request(app)
            .post(urlString({
              variables: JSON.stringify({ who: 'Dolly' })
            }))
            .set('Content-Type', 'text/plain')
            .send('query helloWho($who: String){ test(who: $who) }')
        );

        expect(error.response.status).to.equal(400);
        expect(JSON.parse(error.response.text)).to.deep.equal({
          errors: [ { message: 'Must provide query string.' } ]
        });
      });


      it('handles unsupported HTTP methods', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({ schema: TestSchema }));

        const error = await catchError(
          request(app)
            .put(urlString({ query: '{test}' }))
        );

        expect(error.response.status).to.equal(405);
        expect(error.response.headers.allow).to.equal('POST');
        expect(JSON.parse(error.response.text)).to.deep.equal({
          errors: [
            { message: 'Apollo Server only allows POST requests.' }
          ]
        });
      });

    });
    */

    /*
    describe('Built-in GraphiQL support', () => {

      it('presents GraphiQL when accepting HTML', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
          graphiql: true
        }));

        const response = await request(app)
          .get(urlString({ query: '{test}' }))
          .set('Accept', 'text/html');

        expect(response.status).to.equal(200);
        expect(response.type).to.equal('text/html');
        expect(response.text).to.include('{test}');
        expect(response.text).to.include('graphiql.min.js');
      });

      it('escapes HTML in queries within GraphiQL', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
          graphiql: true
        }));

        const error = await catchError(
          request(app).get(urlString({ query: '</script><script>alert(1)</script>' }))
                      .set('Accept', 'text/html')
        );

        expect(error.response.status).to.equal(400);
        expect(error.response.type).to.equal('text/html');
        expect(error.response.text).to.not.include('</script><script>alert(1)</script>');
      });

      it('escapes HTML in variables within GraphiQL', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
          graphiql: true
        }));

        const response = await request(app).get(urlString({
          query: 'query helloWho($who: String) { test(who: $who) }',
          variables: JSON.stringify({
            who: '</script><script>alert(1)</script>'
          })
        })) .set('Accept', 'text/html');

        expect(response.status).to.equal(200);
        expect(response.type).to.equal('text/html');
        expect(response.text).to.not.include('</script><script>alert(1)</script>');
      });

      it('GraphiQL renders provided variables', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
          graphiql: true
        }));

        const response = await request(app)
          .get(urlString({
            query: 'query helloWho($who: String) { test(who: $who) }',
            variables: JSON.stringify({ who: 'Dolly' })
          }))
          .set('Accept', 'text/html');

        expect(response.status).to.equal(200);
        expect(response.type).to.equal('text/html');
        expect(response.text).to.include(
          'variables: ' + JSON.stringify(
            JSON.stringify({ who: 'Dolly' }, null, 2)
          )
        );
      });

      it('GraphiQL accepts an empty query', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
          graphiql: true
        }));

        const response = await request(app)
          .get(urlString())
          .set('Accept', 'text/html');

        expect(response.status).to.equal(200);
        expect(response.type).to.equal('text/html');
        expect(response.text).to.include('response: null');
      });

      it('GraphiQL accepts a mutation query - does not execute it', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
          graphiql: true
        }));

        const response = await request(app)
          .get(urlString({
            query: 'mutation TestMutation { writeTest { test } }'
          }))
          .set('Accept', 'text/html');

        expect(response.status).to.equal(200);
        expect(response.type).to.equal('text/html');
        expect(response.text).to.include(
          'query: "mutation TestMutation { writeTest { test } }"'
        );
        expect(response.text).to.include('response: null');
      });

      it('returns HTML if preferred', async () => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
          graphiql: true
        }));

        const response = await request(app)
          .get(urlString({ query: '{test}' }))
          .set('Accept', 'text/html,application/json');

        expect(response.status).to.equal(200);
        expect(response.type).to.equal('text/html');
        expect(response.text).to.include('graphiql.min.js');
      });
    */

    /*
    describe('Custom validation rules', () => {
      const AlwaysInvalidRule = function (context) {
        return {
          enter() {
            context.reportError(new GraphQLError(
              'AlwaysInvalidRule was really invalid!'
            ));
            return BREAK;
          }
        };
      };

      it('Do not execute a query if it do not pass the custom validation.', async() => {
        const app = express();

        app.use(urlString(), graphqlHTTP({
          schema: TestSchema,
          validationRules: [ AlwaysInvalidRule ],
          pretty: true,
        }));

        const error = await catchError(
          request(app)
            .get(urlString({
              query: '{thrower}',
            }))
        );

        expect(error.response.status).to.equal(400);
        expect(JSON.parse(error.response.text)).to.deep.equal({
          errors: [
            {
              message: 'AlwaysInvalidRule was really invalid!'
            },
          ]
        });

      });
    });
    */
  });
});
