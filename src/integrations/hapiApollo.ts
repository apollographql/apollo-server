import * as hapi from 'hapi';
import * as GraphiQL from '../modules/renderGraphiQL';
import { runQuery } from '../core/runQuery';
import ApolloOptions from './apolloOptions';


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

    public register: IRegister = (server: hapi.Server, options: ApolloOptions | HAPIOptionsFunction, next) => {
        server.route({
            method: 'POST',
            path: '/',
            handler: async (request, reply) => {
              let optionsObject: ApolloOptions;
              if (isOptionsFunction(options)) {
                try {
                  optionsObject = await options(request);
                } catch (e) {
                  reply(`Invalid options provided to ApolloServer: ${e.message}`).code(500);
                }
              } else {
                optionsObject = options;
              }

              if (!request.payload) {
                reply('POST body missing.').code(500);
                return;
              }

              return runQuery({
                    schema: optionsObject.schema,
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

export interface HAPIOptionsFunction {
  (req?: hapi.Request): ApolloOptions | Promise<ApolloOptions>;
}

function isOptionsFunction(arg: ApolloOptions | HAPIOptionsFunction): arg is HAPIOptionsFunction {
  return typeof arg === 'function';
}
