import * as koa from 'koa';
import * as graphql from 'graphql';
import { runQuery } from '../core/runQuery';
import ApolloOptions from './apolloOptions';
import * as GraphiQL from '../modules/renderGraphiQL';

export interface KoaApolloOptionsFunction {
  (ctx: koa.Context): ApolloOptions | Promise<ApolloOptions>;
}

export interface KoaHandler {
  (req: any, next): void;
}

export function apolloKoa(options: ApolloOptions | KoaApolloOptionsFunction): KoaHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
  }

  return async (ctx, next) => {
    let optionsObject: ApolloOptions;
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

    let responses: Array<graphql.GraphQLResult> = [];
    let batchIndex: number = -1;
    for (let requestParams of b) {
      try {
        const query = requestParams.query;
        const operationName = requestParams.operationName;
        let variables = requestParams.variables;
        batchIndex += 1;

        if (typeof variables === 'string') {
          try {
            variables = JSON.parse(variables);
          } catch (error) {
            ctx.status = 400;
            return ctx.body = 'Variables are invalid JSON.';
          }
        }

        // shallow clone the context object to put batch markers in.
        // create a context object if there isn't one passed in.
        let context = optionsObject.context;
        if (isBatch) {
          context = Object.assign({},  context || {});
          context.apolloBatchIndex = batchIndex;
          context.apolloBatchSize = b.length;
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

function isOptionsFunction(arg: ApolloOptions | KoaApolloOptionsFunction): arg is KoaApolloOptionsFunction {
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
