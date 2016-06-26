import {
  assert,
  expect,
} from 'chai';

import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

// TODO use import, not require... help appreciated.
import * as express from 'express';
import * as bodyParser from 'body-parser';
// tslint:disable-next-line
const request = require('supertest-as-promised');

import { graphqlHTTP, ExpressApolloOptions, renderGraphiQL } from './expressApollo';

const QueryType = new GraphQLObjectType({
    name: 'QueryType',
    fields: {
        testString: {
            type: GraphQLString,
            resolve() {
                return 'it works';
            },
        },
        testArgument: {
            type: GraphQLString,
            args: { echo: { type: GraphQLString } },
            resolve(root, { echo }) {
                return `hello ${echo}`;
            },
        },
    },
});

const MutationType = new GraphQLObjectType({
    name: 'MutationType',
    fields: {
        testMutation: {
            type: GraphQLString,
            args: { echo: { type: GraphQLString } },
            resolve(root, { echo }) {
                return `not really a mutation, but who cares: ${echo}`;
            },
        },
    },
});

const Schema = new GraphQLSchema({
    query: QueryType,
    mutation: MutationType,
});

describe('expressApollo', () => {
  describe('graphqlHTTP', () => {
     it('returns express middleware', () => {
        const middleware = graphqlHTTP({
            schema: Schema,
        });
        assert(typeof middleware === 'function');
    });
    it('throws error if called without schema', () => {
       expect(() => graphqlHTTP(undefined as ExpressApolloOptions)).to.throw('Apollo Server requires options.');
    });


    it('can handle a basic request', async () => {
        const app = express();
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlHTTP({ schema: Schema }));
        const expected = {
            testString: 'it works',
        };
        const req = request(app)
            .post('/graphql')
            .send({
                query: 'query test{ testString }',
            });
        const res = await req;
        expect(res.status).to.equal(200);
        return expect(res.body.data).to.deep.equal(expected);
    });

    it('can handle a request with variables', async () => {
        const app = express();
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlHTTP({ schema: Schema }));
        const expected = {
            testArgument: 'hello world',
        };
        const req = request(app)
            .post('/graphql')
            .send({
                query: 'query test($echo: String){ testArgument(echo: $echo) }',
                variables: { echo: 'world' },
            });
        const res = await req;
        expect(res.status).to.equal(200);
        return expect(res.body.data).to.deep.equal(expected);
    });

    it('can handle a request with operationName', async () => {
        const app = express();
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlHTTP({ schema: Schema }));
        const expected = {
            testString: 'it works',
        };
        const req = request(app)
            .post('/graphql')
            .send({
                query: `
                    query test($echo: String){ testArgument(echo: $echo) }
                    query test2{ testString }`,
                variables: { echo: 'world' },
                operationName: 'test2',
            });
        const res = await req;
        expect(res.status).to.equal(200);
        return expect(res.body.data).to.deep.equal(expected);
    });

    it('can handle a request with a mutation', async () => {
        const app = express();
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlHTTP({ schema: Schema }));
        const expected = {
            testMutation: 'not really a mutation, but who cares: world',
        };
        const req = request(app)
            .post('/graphql')
            .send({
                query: 'mutation test($echo: String){ testMutation(echo: $echo) }',
                variables: { echo: 'world' },
            });
        const res = await req;
        expect(res.status).to.equal(200);
        return expect(res.body.data).to.deep.equal(expected);
    });

  });


  describe('renderGraphiQL', () => {
    it('returns express middleware', () => {
        const query = `{ testString }`;
        const middleware = renderGraphiQL({
            location: '/graphql',
            query: query,
        });
        assert(typeof middleware === 'function');
    });

    it('presents GraphiQL when accepting HTML', async () => {
        const app = express();

        app.use('/graphiql', renderGraphiQL({
            location: '/graphql',
        }));

        const response = await request(app)
          .get('/graphiql?query={test}')
          .set('Accept', 'text/html');

        expect(response.status).to.equal(200);
        expect(response.type).to.equal('text/html');
        expect(response.text).to.include('{test}');
        expect(response.text).to.include('/graphql');
        expect(response.text).to.include('graphiql.min.js');
      });
  });
});
