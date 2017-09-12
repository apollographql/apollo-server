import { GraphiQLData, renderGraphiQL } from './renderGraphiQL';

export type GraphiQLParams = {
  query?: string,
  variables?: string,
  operationName?: string,
};

function isOptionsFunction(arg: GraphiQLData | Function): arg is Function {
  return typeof arg === 'function';
}

async function resolveGraphiQLOptions(options: GraphiQLData | Function, ...args): Promise<GraphiQLData> {
  if (isOptionsFunction(options)) {
    try {
      return await options(...args);
    } catch (e) {
      throw new Error(`Invalid options provided for GraphiQL: ${e.message}`);
    }
  } else {
    return options;
  }
}

function createGraphiQLParams(query: any): GraphiQLParams {
  const queryObject = query || {};
  return {
    query: queryObject.query || '',
    variables: queryObject.variables,
    operationName: queryObject.operationName || '',
  };
}

function createGraphiQLData(params: GraphiQLParams, options: GraphiQLData): GraphiQLData {
  return {
    endpointURL: options.endpointURL,
    subscriptionsEndpoint: options.subscriptionsEndpoint,
    query: params.query || options.query,
    variables: params.variables && JSON.parse(params.variables) || options.variables,
    operationName: params.operationName || options.operationName,
    passHeader: options.passHeader,
    editorTheme: options.editorTheme,
    websocketConnectionParams: options.websocketConnectionParams,
  };
}

export async function resolveGraphiQLString(query: any = {}, options: GraphiQLData | Function, ...args): Promise<string> {
  const graphiqlParams = createGraphiQLParams(query);
  const graphiqlOptions = await resolveGraphiQLOptions(options, ...args);
  const graphiqlData = createGraphiQLData(graphiqlParams, graphiqlOptions);
  return renderGraphiQL(graphiqlData);
}
