import {
  parse,
  getOperationAST,
  DocumentNode,
  formatError,
  ExecutionResult,
} from 'graphql';
import { runQuery } from './runQuery';
import {
  default as GraphQLOptions,
  resolveGraphqlOptions,
} from './graphqlOptions';

export interface HttpQueryRequest {
  method: string;
  query: Record<string, any>;
  options: GraphQLOptions | Function;
}

export class HttpQueryError extends Error {
  public statusCode: number;
  public isGraphQLError: boolean;
  public headers: { [key: string]: string };

  constructor(
    statusCode: number,
    message: string,
    isGraphQLError: boolean = false,
    headers?: { [key: string]: string },
  ) {
    super(message);
    this.name = 'HttpQueryError';
    this.statusCode = statusCode;
    this.isGraphQLError = isGraphQLError;
    this.headers = headers;
  }
}

function isQueryOperation(query: DocumentNode, operationName: string) {
  const operationAST = getOperationAST(query, operationName);
  return operationAST.operation === 'query';
}

export async function runHttpQuery(
  handlerArguments: Array<any>,
  request: HttpQueryRequest,
): Promise<string> {
  let isGetRequest: boolean = false;
  let optionsObject: GraphQLOptions;

  try {
    optionsObject = await resolveGraphqlOptions(
      request.options,
      ...handlerArguments,
    );
  } catch (e) {
    throw new HttpQueryError(500, e.message);
  }
  const formatErrorFn = optionsObject.formatError || formatError;
  let requestPayload;

  switch (request.method) {
    case 'POST':
      if (!request.query || Object.keys(request.query).length === 0) {
        throw new HttpQueryError(
          500,
          'POST body missing. Did you forget use body-parser middleware?',
        );
      }

      requestPayload = request.query;
      break;
    case 'GET':
      if (!request.query || Object.keys(request.query).length === 0) {
        throw new HttpQueryError(400, 'GET query missing.');
      }

      isGetRequest = true;
      requestPayload = request.query;
      break;

    default:
      throw new HttpQueryError(
        405,
        'Apollo Server supports only GET/POST requests.',
        false,
        {
          Allow: 'GET, POST',
        },
      );
  }

  let isBatch = true;
  // TODO: do something different here if the body is an array.
  // Throw an error if body isn't either array or object.
  if (!Array.isArray(requestPayload)) {
    isBatch = false;
    requestPayload = [requestPayload];
  }

  const requests: Array<ExecutionResult> = requestPayload.map(requestParams => {
    try {
      let query = requestParams.query;
      let extensions = requestParams.extensions;

      if (isGetRequest && extensions) {
        // For GET requests, we have to JSON-parse extensions. (For POST
        // requests they get parsed as part of parsing the larger body they're
        // inside.)
        try {
          extensions = JSON.parse(extensions);
        } catch (error) {
          throw new HttpQueryError(400, 'Extensions are invalid JSON.');
        }
      }

      if (query === undefined && extensions && extensions.persistedQuery) {
        // It looks like we've received an Apollo Persisted Query. Apollo Server
        // does not support persisted queries out of the box, so we should fail
        // fast with a clear error saying that we don't support APQs. (A future
        // version of Apollo Server may support APQs directly.)
        throw new HttpQueryError(
          // Return 200 to simplify processing: we want this to be intepreted by
          // the client as data worth interpreting, not an error.
          200,
          JSON.stringify({
            errors: [
              {
                message: 'PersistedQueryNotSupported',
              },
            ],
          }),
          true,
          {
            'Content-Type': 'application/json',
          },
        );
      }

      if (isGetRequest) {
        if (typeof query === 'string') {
          // preparse the query incase of GET so we can assert the operation.
          // XXX This makes the type of 'query' in this function confused
          //     which has led to us accidentally supporting GraphQL AST over
          //     the wire as a valid query, which confuses users. Refactor to
          //     not do this. Also, for a GET request, query really shouldn't
          //     ever be anything other than a string or undefined, so this
          //     set of conditionals doesn't quite make sense.
          query = parse(query);
        } else if (!query) {
          // Note that we've already thrown a different error if it looks like APQ.
          throw new HttpQueryError(400, 'Must provide query string.');
        }

        if (!isQueryOperation(query, requestParams.operationName)) {
          throw new HttpQueryError(
            405,
            `GET supports only query operation`,
            false,
            {
              Allow: 'POST',
            },
          );
        }
      }

      const operationName = requestParams.operationName;

      let variables = requestParams.variables;
      if (typeof variables === 'string') {
        try {
          // XXX Really we should only do this for GET requests, but for
          // compatibility reasons we'll keep doing this at least for now for
          // broken clients that ship variables in a string for no good reason.
          variables = JSON.parse(variables);
        } catch (error) {
          throw new HttpQueryError(400, 'Variables are invalid JSON.');
        }
      }

      let context = optionsObject.context || {};
      if (typeof context === 'function') {
        context = context();
      } else if (isBatch) {
        context = Object.assign(
          Object.create(Object.getPrototypeOf(context)),
          context,
        );
      }

      let params = {
        schema: optionsObject.schema,
        query: query,
        variables: variables,
        context,
        rootValue: optionsObject.rootValue,
        operationName: operationName,
        logFunction: optionsObject.logFunction,
        validationRules: optionsObject.validationRules,
        formatError: formatErrorFn,
        formatResponse: optionsObject.formatResponse,
        fieldResolver: optionsObject.fieldResolver,
        debug: optionsObject.debug,
        tracing: optionsObject.tracing,
        cacheControl: optionsObject.cacheControl,
      };

      if (optionsObject.formatParams) {
        params = optionsObject.formatParams(params);
      }

      return runQuery(params);
    } catch (e) {
      // Populate any HttpQueryError to our handler which should
      // convert it to Http Error.
      if (e.name === 'HttpQueryError') {
        return Promise.reject(e);
      }

      return Promise.resolve({ errors: [formatErrorFn(e)] });
    }
  });
  const responses = await Promise.all(requests);

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
