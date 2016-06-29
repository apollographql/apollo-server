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
import { OperationStore } from '../modules/operationStore';

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

    it('can be called with an options function', () => {
        const app = express();
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlHTTP( (req) => ({ schema: Schema })));
        const expected = {
            testString: 'it works',
        };
        const req = request(app)
            .post('/graphql')
            .send({
                query: 'query test{ testString }',
            });
        return req.then((res) => {
            expect(res.status).to.equal(200);
            return expect(res.body.data).to.deep.equal(expected);
        });
    });

    it('can be called with an options function that returns a promise', () => {
        const app = express();
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlHTTP( (req) => {
            return new Promise(resolve => {
                resolve({schema: Schema});
            });
        }));
        const expected = {
            testString: 'it works',
        };
        const req = request(app)
            .post('/graphql')
            .send({
                query: 'query test{ testString }',
            });
        return req.then((res) => {
            expect(res.status).to.equal(200);
            return expect(res.body.data).to.deep.equal(expected);
        });
    });

    it('throws an error if POST body is missing', () => {
        const app = express();
        app.use('/graphql', graphqlHTTP({ schema: Schema }));
        const req = request(app)
            .post('/graphql')
            .send({
                query: 'query test{ testString }',
            });
        return req.then((res) => {
            expect(res.status).to.equal(500);
            return expect(res.error.text).to.contain('POST body missing.');
        });
    });


    it('can handle a basic request', () => {
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
        return req.then((res) => {
            expect(res.status).to.equal(200);
            return expect(res.body.data).to.deep.equal(expected);
        });
    });

    it('can handle a request with variables', () => {
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
        return req.then((res) => {
            expect(res.status).to.equal(200);
            return expect(res.body.data).to.deep.equal(expected);
        });
    });

    it('can handle a request with variables as string', () => {
        const app = express();
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlHTTP({ schema: Schema }));
        const expected = {
            testArgument: 'hello world',
        };
        const req = request(app)
            .post('/graphql')
            .send({
                query: 'query test($echo: String!){ testArgument(echo: $echo) }',
                variables: '{ "echo": "world" }',
            });
        return req.then((res) => {
            expect(res.status).to.equal(200);
            return expect(res.body.data).to.deep.equal(expected);
        });
    });

    it('can handle a request with operationName', () => {
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
        return req.then((res) => {
            expect(res.status).to.equal(200);
            return expect(res.body.data).to.deep.equal(expected);
        });
    });

     it('can handle batch requests', () => {
        const app = express();
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlHTTP({ schema: Schema }));
        const expected = [
            {
                data: {
                    testString: 'it works',
                },
            },
            {
                data: {
                    testArgument: 'hello yellow',
                },
            },
        ];
        const req = request(app)
            .post('/graphql')
            .send([{
                query: `
                    query test($echo: String){ testArgument(echo: $echo) }
                    query test2{ testString }`,
                variables: { echo: 'world' },
                operationName: 'test2',
            },
            {
                query: `
                    query testX($echo: String){ testArgument(echo: $echo) }`,
                variables: { echo: 'yellow' },
                operationName: 'testX',
            }]);
        return req.then((res) => {
            expect(res.status).to.equal(200);
            return expect(res.body).to.deep.equal(expected);
        });
    });

    it('can handle a request with a mutation', () => {
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
        return req.then((res) => {
            expect(res.status).to.equal(200);
            return expect(res.body.data).to.deep.equal(expected);
        });
    });

    it('applies the formatResponse function', () => {
        const app = express();
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlHTTP({
            schema: Schema,
            formatResponse(response) {
                response['extensions'] = { it: 'works' }; return response;
            },
        }));
        const expected = { it: 'works' };
        const req = request(app)
            .post('/graphql')
            .send({
                query: 'mutation test($echo: String){ testMutation(echo: $echo) }',
                variables: { echo: 'world' },
            });
        return req.then((res) => {
            expect(res.status).to.equal(200);
            return expect(res.body.extensions).to.deep.equal(expected);
        });
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

    it('presents GraphiQL when accepting HTML', () => {
        const app = express();

        app.use('/graphiql', renderGraphiQL({
            location: '/graphql',
        }));

        const req = request(app)
            .get('/graphiql?query={test}')
            .set('Accept', 'text/html');
        return req.then((response) => {
            expect(response.status).to.equal(200);
            expect(response.type).to.equal('text/html');
            expect(response.text).to.include('{test}');
            expect(response.text).to.include('/graphql');
            expect(response.text).to.include('graphiql.min.js');
        });
    });
  });

  describe('stored queries', () => {
    it('works with formatRequest', () => {
        const store = new OperationStore(Schema);
        store.put('query testquery{ testString }');
        const app = express();
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlHTTP({
            schema: Schema,
            formatRequest(params) {
                params['query'] = store.get(params.operationName);
                return params;
            },
        }));
        const expected = { testString: 'it works' };
        const req = request(app)
            .post('/graphql')
            .send({
                operationName: 'testquery',
            });
        return req.then((res) => {
            expect(res.status).to.equal(200);
            return expect(res.body.data).to.deep.equal(expected);
        });
    });

    it('can reject non-whitelisted queries', () => {
        const store = new OperationStore(Schema);
        store.put('query testquery{ testString }');
        const app = express();
        app.use('/graphql', bodyParser.json());
        app.use('/graphql', graphqlHTTP({
            schema: Schema,
            formatRequest(params) {
                if (params.query) {
                    throw new Error('Must not provide query, only operationName');
                }
                params['query'] = store.get(params.operationName);
                return params;
            },
        }));
        const expected = [{
            data: {
                testString: 'it works',
            },
        }, {
            errors: [{
                message: 'Must not provide query, only operationName',
            }],
        }];

        const req = request(app)
            .post('/graphql')
            .send([{
                operationName: 'testquery',
            }, {
                query: '{ testString }',
            }]);
        return req.then((res) => {
            expect(res.status).to.equal(200);
            return expect(res.body).to.deep.equal(expected);
        });
    });
  });
});
