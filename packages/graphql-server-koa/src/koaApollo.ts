import * as koa from 'koa';
import * as graphql from 'graphql';
import { GraphQLOptions, runQuery } from 'graphql-server-core';
import * as GraphiQL from 'graphql-server-module-graphiql';

export interface KoaGraphQLOptionsFunction {
  (ctx: koa.Context): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface KoaHandler {
  (req: any, next): void;
}

export function graphqlKoa(options: GraphQLOptions | KoaGraphQLOptionsFunction): KoaHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
  }

  return async (ctx, next) => {
    let optionsObject: GraphQLOptions;
    if (isOptionsFunction(options)) {
      try {
        optionsObject = await options(ctx);
      } catch (e) {
        ctx.status = 500;
        return ctx.body = `Invalid options provided to ApolloServer: ${e.message}`;
      }
    } else {
      optionsObject = options;
    }

    const formatErrorFn = optionsObject.formatError || graphql.formatError;

    if (!ctx.request.body) {
      ctx.status = 500;
      return ctx.body = 'POST body missing. Did you forget "app.use(koaBody())"?';
    }

    let b = ctx.request.body;
    let isBatch = true;
    if (!Array.isArray(b)) {
      isBatch = false;
      b = [b];
    }

    let responses: Array<graphql.ExecutionResult> = [];
    for (let requestParams of b) {
      try {
        const query = requestParams.query;
        const operationName = requestParams.operationName;
        let variables = requestParams.variables;

        if (typeof variables === 'string') {
          try {
            variables = JSON.parse(variables);
          } catch (error) {
            ctx.status = 400;
            return ctx.body = 'Variables are invalid JSON.';
          }
        }

        // Shallow clone context for queries in batches. This allows
        // users to distinguish multiple queries in the batch and to
        // modify the context object without interfering with each other.
        let context = optionsObject.context;
        if (isBatch) {
          context = Object.assign({},  context || {});
        }

        let params = {
          schema: optionsObject.schema,
          query: query,
          variables: variables,
          context: context,
          rootValue: optionsObject.rootValue,
          operationName: operationName,
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

    ctx.set('Content-Type', 'application/json');
    if (isBatch) {
      return ctx.body = JSON.stringify(responses);
    } else {
      const gqlResponse = responses[0];
      if (gqlResponse.errors && typeof gqlResponse.data === 'undefined') {
        ctx.status = 400;
      }
      return ctx.body = JSON.stringify(gqlResponse);
    }

  };
}

function isOptionsFunction(arg: GraphQLOptions | KoaGraphQLOptionsFunction): arg is KoaGraphQLOptionsFunction {
  return typeof arg === 'function';
}

export function graphiqlKoa(options: GraphiQL.GraphiQLData) {
  return (ctx, next) => {

    const q = ctx.request.query || {};
    const query = q.query || '';
    const variables = q.variables || '{}';
    const operationName = q.operationName || '';

    const graphiQLString = GraphiQL.renderGraphiQL({
      endpointURL: options.endpointURL,
      query: query || options.query,
      variables: JSON.parse(variables) || options.variables,
      operationName: operationName || options.operationName,
      passHeader: options.passHeader,
    });
    ctx.set('Content-Type', 'text/html');
    ctx.body = graphiQLString;
  };
}
