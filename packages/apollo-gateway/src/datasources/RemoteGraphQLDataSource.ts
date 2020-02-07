import {
  GraphQLRequestContext,
  GraphQLResponse,
  ValueOrPromise,
  GraphQLRequest,
} from 'apollo-server-types';
import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-errors';
import {
  fetch,
  Request,
  RequestInit,
  Headers,
  Response,
} from 'apollo-server-env';
import { isObject } from '../utilities/predicates';
import { GraphQLDataSource } from './types';

export class RemoteGraphQLDataSource implements GraphQLDataSource {
  constructor(
    config?: Partial<RemoteGraphQLDataSource> &
      object &
      ThisType<RemoteGraphQLDataSource>,
  ) {
    if (config) {
      return Object.assign(this, config);
    }
  }

  url!: string;

  async process<TContext>({
    request,
    context,
  }: Pick<GraphQLRequestContext<TContext>, 'request' | 'context'>): Promise<
    GraphQLResponse
  > {
    // Respect incoming http headers (eg, apollo-federation-include-trace).
    const headers = (request.http && request.http.headers) || new Headers();
    headers.set('Content-Type', 'application/json');

    request.http = {
      method: 'POST',
      url: this.url,
      headers,
    };

    if (this.willSendRequest) {
      await this.willSendRequest({ request, context });
    }

    const { http, ...graphqlRequest } = request;
    const options: RequestInit = {
      ...http,
      body: JSON.stringify(graphqlRequest),
    };

    const httpRequest = new Request(request.http.url, options);

    const respond = (response: GraphQLResponse, request: GraphQLRequest) =>
      typeof this.didReceiveResponse === "function"
        ? this.didReceiveResponse({ response, request, context })
        : response;

    try {
      const httpResponse = await fetch(httpRequest);

      if (!httpResponse.ok) {
        throw await this.errorFromResponse(httpResponse);
      }

      const body = await this.parseBody(httpResponse, httpRequest, context);

      if (!isObject(body)) {
        throw new Error(`Expected JSON response body, but received: ${body}`);
      }

      const response: GraphQLResponse = {
        ...body,
        http: httpResponse,
      };

      return respond(response, request);
    } catch (error) {
      this.didEncounterError(error, httpRequest);
      throw error;
    }
  }

  public willSendRequest?<TContext>(
    requestContext: Pick<
      GraphQLRequestContext<TContext>,
      'request' | 'context'
    >,
  ): ValueOrPromise<void>;

  public didReceiveResponse?<TContext = any>(
    requestContext: Required<Pick<
      GraphQLRequestContext<TContext>,
      'request' | 'response' | 'context'>
    >,
  ): ValueOrPromise<GraphQLResponse>;

  public didEncounterError(error: Error, _request: Request) {
    throw error;
  }

  public parseBody<TContext>(
    response: Response,
    _request?: Request,
    _context?: TContext,
  ): Promise<object | string> {
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.startsWith('application/json')) {
      return response.json();
    } else {
      return response.text();
    }
  }

  public async errorFromResponse(response: Response) {
    const message = `${response.status}: ${response.statusText}`;

    let error: ApolloError;
    if (response.status === 401) {
      error = new AuthenticationError(message);
    } else if (response.status === 403) {
      error = new ForbiddenError(message);
    } else {
      error = new ApolloError(message);
    }

    const body = await this.parseBody(response);

    Object.assign(error.extensions, {
      response: {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        body,
      },
    });

    return error;
  }
}
