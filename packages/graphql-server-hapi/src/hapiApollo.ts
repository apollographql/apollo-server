import * as Boom from 'boom';
import { Server, Request, IReply } from 'hapi';
import { ExecutionResult, formatError } from 'graphql';
import * as GraphiQL from 'graphql-server-module-graphiql';
import { GraphQLOptions, runQuery } from 'graphql-server-core';

export interface IRegister {
    (server: Server, options: any, next: any): void;
    attributes?: any;
}

export interface HapiOptionsFunction {
  (req?: Request): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface HapiPluginOptions {
  path: string;
  route?: any;
  graphqlOptions: GraphQLOptions | HapiOptionsFunction;
}

const graphqlHapi: IRegister = function(server: Server, options: HapiPluginOptions, next) {
  server.method('verifyPayload', verifyPayload);
  server.method('getGraphQLParams', getGraphQLParams);
  server.method('getGraphQLOptions', getGraphQLOptions);
  server.method('processQuery', processQuery);

  const config = Object.assign(options.route || {}, {
    plugins: {
      graphql: isOptionsFunction(options.graphqlOptions) ? options.graphqlOptions : () => options.graphqlOptions,
    },
    pre: [{
      assign: 'isBatch',
      method: 'verifyPayload(payload)',
    }, {
      assign: 'graphqlParams',
      method: 'getGraphQLParams(payload, pre.isBatch)',
    }, {
      assign: 'graphqlOptions',
      method: 'getGraphQLOptions',
    }, {
      assign: 'graphQL',
      method: 'processQuery(pre.graphqlParams, pre.graphqlOptions, pre.isBatch)',
    }],
  });

  server.route({
    method: 'POST',
    path: options.path || '/graphql',
    config,
    handler: function(request, reply) {
      const responses = request.pre['graphQL'];
      if (request.pre['isBatch']) {
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
  });

  return next();
};

graphqlHapi.attributes = {
  name: 'graphql',
  version: '0.0.1',
};

function verifyPayload(payload, reply) {
  if (!payload) {
    return reply(createErr(500, 'POST body missing.'));
  }

  // TODO: do something different here if the body is an array.
  // Throw an error if body isn't either array or object.
  reply(payload && Array.isArray(payload));
}

function getGraphQLParams(payload, isBatch, reply) {
  if (!isBatch) {
    payload = [payload];
  }

  const params = [];
  for (let query of payload) {
    let variables = query.variables;
    if (variables && typeof variables === 'string') {
      try {
        variables = JSON.parse(variables);
      } catch (error) {
        return reply(createErr(400, 'Variables are invalid JSON.'));
      }
    }

    params.push({
      query: query.query,
      variables: variables,
      operationName: query.operationName,
    });
  }
  reply(params);
};

async function getGraphQLOptions(request: Request, reply: IReply): Promise<{}> {
  const options = request.route.settings.plugins['graphql'];
  let optionsObject: GraphQLOptions;
  if (isOptionsFunction(options)) {
    try {
      const opsFunc: HapiOptionsFunction = <HapiOptionsFunction>options;
      optionsObject = await opsFunc(request);
    } catch (e) {
      return reply(createErr(500, `Invalid options provided to ApolloServer: ${e.message}`));
    }
  } else {
    optionsObject = <GraphQLOptions>options;
  }
  reply(optionsObject);
}

async function processQuery(graphqlParams, optionsObject: GraphQLOptions, isBatch: boolean, reply) {
  const formatErrorFn = optionsObject.formatError || formatError;

  let responses: ExecutionResult[] = [];
  for (let query of graphqlParams) {
    try {
      // Shallow clone context for queries in batches. This allows
      // users to distinguish multiple queries in the batch and to
      // modify the context object without interfering with each other.
      let context = optionsObject.context;
      if (isBatch) {
        context = Object.assign({},  context || {});
      }

      let params = {
        schema: optionsObject.schema,
        query: query.query,
        variables: query.variables,
        rootValue: optionsObject.rootValue,
        context: context,
        operationName: query.operationName,
        logFunction: optionsObject.logFunction,
        validationRules: optionsObject.validationRules,
        formatError: formatErrorFn,
        formatResponse: optionsObject.formatResponse,
        debug: optionsObject.debug,
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

function isOptionsFunction(arg: GraphQLOptions | HapiOptionsFunction): arg is HapiOptionsFunction {
  return typeof arg === 'function';
}

function createErr(code: number, message: string) {
  const err = Boom.create(code);
  err.output.payload.message = message;
  return err;
}

export interface GraphiQLPluginOptions {
  path: string;
  route?: any;
  graphiqlOptions: GraphiQL.GraphiQLData;
}

const graphiqlHapi: IRegister =  function(server: Server, options: GraphiQLPluginOptions, next) {
  server.method('getGraphiQLParams', getGraphiQLParams);
  server.method('renderGraphiQL', renderGraphiQL);

  const config = Object.assign(options.route || {}, {
    plugins: {
      graphiql: options.graphiqlOptions,
    },
    pre: [{
      assign: 'graphiqlParams',
      method: 'getGraphiQLParams',
    }, {
      assign: 'graphiQLString',
      method: 'renderGraphiQL(route, pre.graphiqlParams)',
    }],
  });

  server.route({
    method: 'GET',
    path: options.path || '/graphql',
    config,
    handler: (request, reply) => {
      reply(request.pre['graphiQLString']).header('Content-Type', 'text/html');
    },
  });
  next();
};

graphiqlHapi.attributes = {
  name: 'graphiql',
  version: '0.0.1',
};

function getGraphiQLParams(request, reply) {
  const q = request.query || {};
  const query = q.query || '';
  const variables = q.variables || '{}';
  const operationName = q.operationName || '';
  reply({ query, variables, operationName});
}

function renderGraphiQL(route, graphiqlParams: any, reply) {
  const graphiqlOptions = route.settings.plugins['graphiql'];
  const graphiQLString = GraphiQL.renderGraphiQL({
    endpointURL: graphiqlOptions.endpointURL,
    query: graphiqlParams.query || graphiqlOptions.query,
    variables: JSON.parse(graphiqlParams.variables) || graphiqlOptions.variables,
    operationName: graphiqlParams.operationName || graphiqlOptions.operationName,
    passHeader: graphiqlOptions.passHeader,
  });
  reply(graphiQLString);
}

export { graphqlHapi, graphiqlHapi };
