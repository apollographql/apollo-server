import * as Boom from 'boom';
import { Server, Response, Request, IReply } from 'hapi';
import * as GraphiQL from 'graphql-server-module-graphiql';
import { GraphQLOptions, runHttpQuery, HttpQueryError } from 'graphql-server-core';

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

function runHttpQueryWrapper(options: GraphQLOptions | HapiOptionsFunction, request: Request, reply: IReply): Promise<Response> {
  return runHttpQuery([request], {
    method: request.method.toUpperCase(),
    options: options,
    query: request.method === 'post' ? request.payload : request.query,
  }).then((gqlResponse) => {
    return reply(gqlResponse).type('application/json');
  }, (error: HttpQueryError) => {
    if ( 'HttpQueryError' !== error.name ) {
      throw error;
    }

    if ( true === error.isGraphQLError ) {
      return reply(error.message).code(error.statusCode).type('application/json');
    }

    const err = Boom.create(error.statusCode);
    err.output.payload.message = error.message;
    if ( error.headers ) {
      Object.keys(error.headers).forEach((header) => {
        err.output.headers[header] = error.headers[header];
      });
    }

    return reply(err);
  });
}

const graphqlHapi: IRegister = function(server: Server, options: HapiPluginOptions, next) {
  if (!options || !options.graphqlOptions) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length !== 3) {
    throw new Error(`Apollo Server expects exactly 3 argument, got ${arguments.length}`);
  }

  server.route({
    method: ['GET', 'POST'],
    path: options.path || '/graphql',
    config: options.route || {},
    handler: (request, reply) => runHttpQueryWrapper(options.graphqlOptions, request, reply),
  });

  return next();
};

graphqlHapi.attributes = {
  name: 'graphql',
  version: '0.0.1',
};

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
  const variables = q.variables;
  const operationName = q.operationName || '';
  reply({ query, variables, operationName});
}

function renderGraphiQL(route, graphiqlParams: any, reply) {
  const graphiqlOptions = route.settings.plugins['graphiql'];
  const graphiQLString = GraphiQL.renderGraphiQL({
    endpointURL: graphiqlOptions.endpointURL,
    query: graphiqlParams.query || graphiqlOptions.query,
    variables: graphiqlParams.variables && JSON.parse(graphiqlParams.variables) || graphiqlOptions.variables,
    operationName: graphiqlParams.operationName || graphiqlOptions.operationName,
    passHeader: graphiqlOptions.passHeader,
  });
  reply(graphiQLString);
}

export { graphqlHapi, graphiqlHapi };
