import * as hapi from 'hapi';
import * as GraphiQL from '../modules/renderGraphiQL';
import { runQuery } from '../core/runQuery';
import apolloOptions from './apolloOptions';


export interface IRegister {
    (server: hapi.Server, options: any, next: any): void;
    attributes?: any;
}

export class ApolloHAPI {
    constructor() {
        this.register.attributes = {
            name: 'graphql',
            version: '0.0.1',
        };
    }

    public register: IRegister = (server: hapi.Server, options: apolloOptions, next) => {
        server.route({
            method: 'POST',
            path: '/',
            handler: (request, reply) => {
                return runQuery({
                    schema: options.schema,
                    query: request.payload.query,
                }).then(gqlResponse => {
                    reply({ data: gqlResponse.data });
                }).catch(errors => {
                    reply({ errors: errors }).code(500);
                });
            },
        });
        next();
    }
}

export class GraphiQLHAPI {
    constructor() {
        this.register.attributes = {
            name: 'graphiql',
            version: '0.0.1',
        };
    }

    public register: IRegister = (server: hapi.Server, options: GraphiQL.GraphiQLData, next) => {
        server.route({
            method: 'GET',
            path: '/',
            handler: (request, reply) => {
              const q = request.query || {};
              const query = q.query || '';
              const variables = q.variables || '{}';
              const operationName = q.operationName || '';

              const graphiQLString = GraphiQL.renderGraphiQL({
                endpointURL: options.endpointURL,
                query: query || options.query,
                variables: JSON.parse(variables) || options.variables,
                operationName: operationName || options.operationName,
              });
              reply(graphiQLString).header('Content-Type', 'text/html');
            },
        });
        next();
    }
}
