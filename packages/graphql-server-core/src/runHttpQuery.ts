import { formatError, ExecutionResult } from 'graphql';
import { runQuery } from './runQuery';
import { default as GraphQLOptions, isOptionsFunction } from './graphqlOptions';

export interface HttpQueryRequest {
  method: string;
  query: string;
  options: GraphQLOptions | Function;
}

export class HttpQueryError extends Error {
  public statusCode: number;
  public isGraphQLError: boolean;
  public headers: { [key: string]: string };

  constructor (statusCode: number, message: string, isGraphQLError: boolean = false, headers?: { [key: string]: string }) {
    super(message);
    this.statusCode = statusCode;
    this.isGraphQLError = isGraphQLError;
    this.headers = headers;
  }
}

export async function runHttpQuery(handlerArguments: Array<any>, request: HttpQueryRequest): Promise<string> {
  let isGetRequest: boolean = false;
  let optionsObject: GraphQLOptions;
  if (isOptionsFunction(request.options)) {
    try {
      optionsObject = await request.options(...handlerArguments);
    } catch (e) {
      throw new HttpQueryError(500, `Invalid options provided to ApolloServer: ${e.message}`);
    }
  } else {
    optionsObject = request.options;
  }

  const formatErrorFn = optionsObject.formatError || formatError;
  let requestPayload;

  switch ( request.method ) {
    case 'POST':
      if ( !request.query ) {
        throw new HttpQueryError(500, 'POST body missing. Did you forget use body-parser middleware?');
      }

      requestPayload = request.query;
      break;
   case 'GET':
     if ( !request.query || (Object.keys(request.query).length === 0) ) {
       throw new HttpQueryError(400, 'GET query missing.');
     }

     isGetRequest = true;
     requestPayload = request.query;
     break;

   default:
     throw new HttpQueryError(405, 'Apollo Server supports only GET/POST requests.', false, {
       'Allow':  'GET, POST',
     });
  }

  let isBatch = true;
  // TODO: do something different here if the body is an array.
  // Throw an error if body isn't either array or object.
  if (!Array.isArray(requestPayload)) {
    isBatch = false;
    requestPayload = [requestPayload];
  }

  let responses: Array<ExecutionResult> = [];
  for (let requestParams of requestPayload) {
    if ( isGetRequest && !requestParams.query.trim().startsWith('query')) {
      const errorMsg = `GET supports only query operation`;
      throw new HttpQueryError(405, errorMsg, false, {
        'Allow':  'POST',
      });
    }

    try {
      const query = requestParams.query;
      const operationName = requestParams.operationName;
      let variables = requestParams.variables;

      if (typeof variables === 'string') {
        try {
          variables = JSON.parse(variables);
        } catch (error) {
          throw new HttpQueryError(400, 'Variables are invalid JSON.');
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

  if (!isBatch) {
    const gqlResponse = responses[0];
    if (gqlResponse.errors && typeof gqlResponse.data === 'undefined') {
      throw new HttpQueryError(400, JSON.stringify(gqlResponse), true, {
        'Content-Type': 'application/json',
      });
    }
    return JSON.stringify(gqlResponse);
  }

  return JSON.stringify(responses);
}
