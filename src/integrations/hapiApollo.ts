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

export interface HAPIPluginOptions {
  path: string;
  apolloOptions: ApolloOptions | HAPIOptionsFunction;
}

const ApolloHAPI: IRegister = function(server: hapi.Server, options: HAPIPluginOptions, next) {
  server.method('getApolloOptions', getApolloOptions);
  server.method('processQuery', processQuery);

  server.route({
    method: 'POST',
    path: options.path || '/graphql',
    config: {
      pre: [{
        assign: 'apolloOptions',
        method: 'getApolloOptions',
      }, {
        assign: 'graphQL',
        method: 'processQuery(payload, pre.apolloOptions)',
      }],
      handler: function (request, reply) {
        const responses = request.pre.graphQL;
        if (responses.length > 1) {
            return reply(responses);
          } else {
            const gqlResponse = responses[0];
            if (gqlResponse.errors && typeof gqlResponse.data === 'undefined') {
              return reply(gqlResponse).code(400);
            } else {
              return reply(gqlResponse);
            }
          }
      },
    },
  });
  return next();

  async function getApolloOptions(request: hapi.Request, reply: hapi.IReply): Promise<{}> {
    let optionsObject: ApolloOptions;
    if (isOptionsFunction(options.apolloOptions)) {
      try {
        const opsFunc: HAPIOptionsFunction = <HAPIOptionsFunction>options.apolloOptions;
        optionsObject = await opsFunc(request);
      } catch (e) {
        return reply(new Error(`Invalid options provided to ApolloServer: ${e.message}`));
      }
    } else {
      optionsObject = <ApolloOptions>options.apolloOptions;
    }

    if (!request.payload) {
      return reply(new Error('POST body missing.'));
    } else {
      return reply(optionsObject);
    }
  }

};

ApolloHAPI.attributes = {
  name: 'graphql',
  version: '0.0.1',
};

async function processQuery(payload, optionsObject: ApolloOptions, reply) {
  const formatErrorFn = optionsObject.formatError || graphql.formatError;

  let isBatch = true;
  // TODO: do something different here if the body is an array.
  // Throw an error if body isn't either array or object.
  if (!Array.isArray(payload)) {
    isBatch = false;
    payload = [payload];
  }

  let responses: graphql.GraphQLResult[] = [];
  for (let query of payload) {
    try {
      const operationName = query.operationName;
      let variables = query.variables;

      if (typeof variables === 'string') {
        // TODO: catch errors
        variables = JSON.parse(variables);
      }

      let params = {
        schema: optionsObject.schema,
        query: query.query,
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
  return reply(responses);
}

function isOptionsFunction(arg: ApolloOptions | HAPIOptionsFunction): arg is HAPIOptionsFunction {
  return typeof arg === 'function';
}

const GraphiQLHAPI: IRegister =  function(server: hapi.Server, options: GraphiQL.GraphiQLData, next) {
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
};

GraphiQLHAPI.attributes = {
  name: 'graphiql',
  version: '0.0.1',
};

export { ApolloHAPI, GraphiQLHAPI };
