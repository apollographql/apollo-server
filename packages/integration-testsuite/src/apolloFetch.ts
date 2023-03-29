import fetch, { type RequestInit, type Response } from 'node-fetch';

export interface ApolloFetch {
  (operation: GraphQLRequest): Promise<FetchResult>;
  use: (middlewares: MiddlewareInterface) => ApolloFetch;
  useAfter: (afterwares: AfterwareInterface) => ApolloFetch;
}

export interface GraphQLRequest {
  query?: string;
  variables?: object;
  operationName?: string;
  extensions?: Record<string, unknown>;
}

interface FetchResult {
  data: any;
  errors?: any;
  extensions?: any;
}

type MiddlewareInterface = (request: RequestAndOptions, next: Function) => void;

interface RequestAndOptions {
  request: GraphQLRequest;
  options: RequestInit;
}

type AfterwareInterface = (
  response: ResponseAndOptions,
  next: Function,
) => void;

interface ResponseAndOptions {
  response: ParsedResponse;
  options: RequestInit;
}

export interface ParsedResponse extends Response {
  raw: string;
  parsed?: any;
}

interface FetchOptions {
  uri?: string;
}

interface FetchError extends Error {
  response: ParsedResponse;
  parseError?: Error;
}

function buildWareStack<M>(
  funcs: ((modifiedObject: M, next: Function) => void)[],
  modifiedObject: M,
  resolve: (modifiedObject: M) => void,
) {
  const next = () => {
    if (funcs.length > 0) {
      const f = funcs.shift();
      if (f) {
        f(modifiedObject, next);
      }
    } else {
      resolve(modifiedObject);
    }
  };
  next();
}

function constructDefaultOptions(
  request: GraphQLRequest,
  options: RequestInit,
): RequestInit {
  let body;
  try {
    body = JSON.stringify(request);
  } catch (e) {
    throw new Error(
      `Network request failed. Payload is not serializable: ${
        (e as Error).message
      }`,
    );
  }

  return {
    body,
    method: 'POST',
    ...options,
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
      ...(options.headers || []),
    },
  };
}

function throwHttpError(response: ParsedResponse, error: Error) {
  const httpError = new Error(
    response && response.status >= 300
      ? `Network request failed with status ${response.status} - "${response.statusText}"`
      : `Network request failed to return valid JSON`,
  ) as FetchError;
  httpError.response = response;
  httpError.parseError = error;

  throw httpError as FetchError;
}

export function createApolloFetch(params: FetchOptions = {}): ApolloFetch {
  const _uri = params.uri || '/';
  const middlewares: MiddlewareInterface[] = [];
  const afterwares: AfterwareInterface[] = [];

  const applyMiddlewares = (
    requestAndOptions: RequestAndOptions,
  ): Promise<RequestAndOptions> => {
    return new Promise((resolve) => {
      buildWareStack([...middlewares], requestAndOptions, resolve);
    });
  };

  const applyAfterwares = (
    responseObject: ResponseAndOptions,
  ): Promise<ResponseAndOptions> => {
    return new Promise((resolve) => {
      buildWareStack([...afterwares], responseObject, resolve);
    });
  };

  const apolloFetch = function (request: GraphQLRequest): Promise<FetchResult> {
    let options = {};
    let parseError: Error | undefined;

    const requestObject = <RequestAndOptions>{
      request,
      options,
    };

    return applyMiddlewares(requestObject)
      .then((reqOpts) => {
        const construct = constructDefaultOptions;
        const request = reqOpts.request;
        return construct(request, reqOpts.options);
      })
      .then((opts) => {
        options = { ...opts };
        return fetch(_uri, options);
      })
      .then(
        (response) =>
          response.text().then((raw) => {
            try {
              const parsed = JSON.parse(raw);
              (response as ParsedResponse).raw = raw;
              (response as ParsedResponse).parsed = parsed;
              return <ParsedResponse>response;
            } catch (e) {
              parseError = e as Error;

              //pass parsed raw response onto afterware
              (response as ParsedResponse).raw = raw;
              return <ParsedResponse>response;
            }
          }),
        //.catch() this should never happen: https://developer.mozilla.org/en-US/docs/Web/API/Body/text
      )
      .then((response) =>
        applyAfterwares({
          response,
          options,
        }),
      )
      .then(({ response }) => {
        if (response.parsed) {
          return { ...response.parsed };
        } else {
          throwHttpError(response, parseError!);
        }
      });
  } as ApolloFetch;

  apolloFetch.use = (middleware: MiddlewareInterface) => {
    if (typeof middleware === 'function') {
      middlewares.push(middleware);
    } else {
      throw new Error('Middleware must be a function');
    }

    return apolloFetch;
  };

  apolloFetch.useAfter = (afterware: AfterwareInterface) => {
    if (typeof afterware === 'function') {
      afterwares.push(afterware);
    } else {
      throw new Error('Afterware must be a function');
    }

    return apolloFetch;
  };

  return apolloFetch as ApolloFetch;
}
