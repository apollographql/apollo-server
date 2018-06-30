import {
  Request,
  RequestInit,
  Response,
  BodyInit,
  Headers,
  URL,
  URLSearchParams,
  URLSearchParamsInit,
} from 'apollo-server-env';

import { HTTPCache } from './HTTPCache';
import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-errors';

export type RequestOptions = RequestInit & {
  path: string;
  params: URLSearchParams;
  headers: Headers;
  body?: Body;
};

export type Body = BodyInit | object;
export { Request };

type ValueOrPromise<T> = T | Promise<T>;

type ValueOrFunction<T> = T | ((options: RequestOptions) => T);

function resolveIfNeeded<T>(
  valueOrFunction: ValueOrFunction<T>,
  options: RequestOptions,
) {
  if (typeof valueOrFunction === 'function') {
    return valueOrFunction(options);
  } else {
    return valueOrFunction;
  }
}

export abstract class RESTDataSource<TContext = any> {
  httpCache!: HTTPCache;
  context!: TContext;

  abstract baseURL: ValueOrFunction<ValueOrPromise<string>>;

  protected willSendRequest?(request: RequestOptions): ValueOrPromise<void>;

  protected async didReceiveErrorResponse<TResult = any>(
    response: Response,
  ): Promise<TResult> {
    const message = `${response.status} ${
      response.statusText
    }: ${await response.text()}`;

    if (response.status === 401) {
      throw new AuthenticationError(message);
    } else if (response.status === 403) {
      throw new ForbiddenError(message);
    } else {
      throw new ApolloError(message);
    }
  }

  protected async get<TResult = any>(
    path: string,
    params?: URLSearchParamsInit,
    init?: RequestInit,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      Object.assign({ method: 'GET', path, params }, init),
    );
  }

  protected async post<TResult = any>(
    path: string,
    body?: Body,
    init?: RequestInit,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      Object.assign({ method: 'POST', path, body }, init),
    );
  }

  protected async patch<TResult = any>(
    path: string,
    body?: Body,
    init?: RequestInit,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      Object.assign({ method: 'PATCH', path, body }, init),
    );
  }

  protected async put<TResult = any>(
    path: string,
    body?: Body,
    init?: RequestInit,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      Object.assign({ method: 'PUT', path, body }, init),
    );
  }

  protected async delete<TResult = any>(
    path: string,
    params?: URLSearchParamsInit,
    init?: RequestInit,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      Object.assign({ method: 'DELETE', path, params }, init),
    );
  }

  private async fetch<TResult>(
    init: RequestInit & {
      path: string;
      params?: URLSearchParamsInit;
    },
  ): Promise<TResult> {
    if (!(init.params instanceof URLSearchParams)) {
      init.params = new URLSearchParams(init.params);
    }

    if (!(init.headers && init.headers instanceof Headers)) {
      init.headers = new Headers(init.headers);
    }

    const options = init as RequestOptions;

    if (this.willSendRequest) {
      await this.willSendRequest(options);
    }

    const baseURL = await resolveIfNeeded(this.baseURL, options);
    const normalizedBaseURL = baseURL.endsWith('/')
      ? baseURL
      : baseURL.concat('/');
    const url = new URL(options.path, normalizedBaseURL);

    // Append params to existing params in the path
    for (const [name, value] of options.params) {
      url.searchParams.append(name, value);
    }

    // We accept arbitrary objects as body and serialize them as JSON
    if (
      options.body !== undefined &&
      typeof options.body !== 'string' &&
      !(options.body instanceof ArrayBuffer)
    ) {
      options.body = JSON.stringify(options.body);
      options.headers.set('Content-Type', 'application/json');
    }

    const request = new Request(String(url), options);

    return this.trace(`${options.method || 'GET'} ${url}`, async () => {
      const response = await this.httpCache.fetch(request);
      if (response.ok) {
        const contentType = response.headers.get('Content-Type');

        if (contentType && contentType.startsWith('application/json')) {
          return response.json();
        } else {
          return response.text();
        }
      } else {
        return this.didReceiveErrorResponse(response);
      }
    });
  }

  private async trace<TResult>(
    label: string,
    fn: () => Promise<TResult>,
  ): Promise<TResult> {
    if (process && process.env && process.env.NODE_ENV === 'development') {
      // We're not using console.time because that isn't supported on Cloudflare
      const startTime = Date.now();
      try {
        return await fn();
      } finally {
        const duration = Date.now() - startTime;
        console.log(`${label} (${duration}ms)`);
      }
    } else {
      return fn();
    }
  }
}
