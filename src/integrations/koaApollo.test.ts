import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

// tslint:disable-next-line
const request = require('supertest-as-promised');

import { apolloKoa, graphiqlKoa } from './koaApollo';
import ApolloOptions from './apolloOptions';
import { expect } from 'chai';

import testSuite, { Schema, CreateAppOptions } from './integrations.test';

function createApp(options: CreateAppOptions = {}) {
  const app = new koa();
  const router = new koaRouter();

  options.apolloOptions = options.apolloOptions || { schema: Schema };

  if (!options.excludeParser) {
    app.use(koaBody());
  }
  if (options.graphiqlOptions ) {
    router.get('/graphiql', graphiqlKoa( options.graphiqlOptions ));
  }
  router.post('/graphql', apolloKoa( options.apolloOptions ));
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app.listen(3000);
}

function destroyApp(app) {
  app.close();
}


describe('koaApollo', () => {
  it('throws error if called without schema', function(){
     expect(() => apolloKoa(undefined as ApolloOptions)).to.throw('Apollo Server requires options.');
  });

  it('throws an error if called with more than one argument', function(){
     expect(() => (<any>apolloKoa)({}, 'x')).to.throw(
       'Apollo Server expects exactly one argument, got 2');
  });
  it('uploads a single file using multipart/form-data', async () => {
    const UploadedFileType = new GraphQLObjectType({
      name: 'UploadedFile',
      fields: {
        filename: { type: GraphQLString },
        mime: { type: GraphQLString },
      },
    });

    const TestMutationSchema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQuery',
        fields: {
          test: { type: GraphQLString },
        },
      }),
      mutation: new GraphQLObjectType({
        name: 'RootMutation',
        fields: {
          file: {
            type: UploadedFileType,
            resolve(root, data, context, wtf) {
              return {
                filename: root.file.filename,
                mime: root.file.mime,
              };
            },
          },
        },
      }),
    });

    const app = new koa();
    const router = new koaRouter();
    router.post('/graphql', apolloKoa({
      schema: TestMutationSchema,
      context: {},
      //formatError: error => console.trace(error),
    }));
    app.use(router.routes());
    app.use(router.allowedMethods());

    const server = app.listen(3000);
    const response = await request(server)
      .post('/graphql')
      .field('query', `mutation TestMutation {
        file { filename, mime }
      }`)
      .attach('file', __filename);

    server.close();

    expect(JSON.parse(response.text)).to.deep.equal({
      data: {
        file: {
          filename: 'koaApollo.test.js',
          mime: 'application/javascript',
        },
      },
    });
  });
});

describe('integration:Koa', () => {
  testSuite(createApp, destroyApp);
});
