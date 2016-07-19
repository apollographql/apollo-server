import * as hapi from 'hapi';
import * as graphql from 'graphql';
import * as GraphiQL from '../modules/renderGraphiQL';
import { runQuery } from '../core/runQuery';
import ApolloOptions from './apolloOptions';


export interface IRegister {
    (server: hapi.Server, options: any, next: any): void;
    attributes?: any;
}

export interface HAPIOptionsFunction {
  (req?: hapi.Request): ApolloOptions | Promise<ApolloOptions>;
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

              const responses = await processQuery(request.payload, optionsObject);

              if (responses.length > 1) {
                reply(responses);
              } else {
                const gqlResponse = responses[0];
                if (gqlResponse.errors && typeof gqlResponse.data === 'undefined') {
                  reply(gqlResponse).code(400);
                } else {
                  reply(gqlResponse);
                }
              }

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

async function processQuery(body, optionsObject) {
  const formatErrorFn = optionsObject.formatError || graphql.formatError;

  let isBatch = true;
  // TODO: do something different here if the body is an array.
  // Throw an error if body isn't either array or object.
  if (!Array.isArray(body)) {
    isBatch = false;
    body = [body];
  }

  let responses: Array<graphql.GraphQLResult> = [];
  for (let payload of body) {
    try {
      const operationName = payload.operationName;
      let variables = payload.variables;

      if (typeof variables === 'string') {
        // TODO: catch errors
        variables = JSON.parse(variables);
      }

      let params = {
        schema: optionsObject.schema,
        query: payload.query,
        variables: variables,
        rootValue: optionsObject.rootValue,
        context: optionsObject.context,
        operationName: operationName,
        logFunction: optionsObject.logFunction,
        validationRules: optionsObject.validationRules,
        formatError: formatErrorFn,
        formatResponse: optionsObject.formatResponse,
      };

      if (optionsObject.formatParams) {
        params = optionsObject.formatParams(params);
      }

      responses.push(await runQuery(params));
    } catch (e) {
      responses.push({ errors: [formatErrorFn(e)] });
    }
  }
  return responses;
}

function isOptionsFunction(arg: ApolloOptions | HAPIOptionsFunction): arg is HAPIOptionsFunction {
  return typeof arg === 'function';
}
