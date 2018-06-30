import {
  BodyInit,
  Headers,
  Request,
  RequestInit,
  Response,
  URL,
  URLSearchParams,
} from 'apollo-server-env';

import { HTTPCache } from './HTTPCache';
import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-errors';

export type RequestOptions = RequestInit & {
  path: string;
  params?: Params;
  body?: Body;
};

export type Params = { [key: string]: Object };
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

  defaults?: ValueOrFunction<ValueOrPromise<RequestInit | undefined>>;
  abstract baseURL: ValueOrFunction<ValueOrPromise<string>>;
  defaultParams?: ValueOrFunction<ValueOrPromise<Params | undefined>>;

  protected willSendRequest?(request: Request): ValueOrPromise<void>;

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
    params?: Params,
    options?: RequestOptions,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      Object.assign({ method: 'GET', path, params }, options),
    );
  }

  protected async post<TResult = any>(
    path: string,
    body?: Body,
    options?: RequestOptions,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      Object.assign({ method: 'POST', path, body }, options),
    );
  }

  protected async patch<TResult = any>(
    path: string,
    body?: Body,
    options?: RequestOptions,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      Object.assign({ method: 'PATCH', path, body }, options),
    );
  }

  protected async put<TResult = any>(
    path: string,
    body?: Body,
    options?: RequestOptions,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      Object.assign({ method: 'PUT', path, body }, options),
    );
  }

  protected async delete<TResult = any>(
    path: string,
    params?: Params,
    options?: RequestOptions,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      Object.assign({ method: 'DELETE', path, params }, options),
    );
  }

  private async fetch<TResult>(options: RequestOptions): Promise<TResult> {
    const { path, params, ...init } = Object.assign(
      {},
      await resolveIfNeeded(this.defaults, options),
      options,
    );

    const baseURL = await resolveIfNeeded(this.baseURL, options);
    const normalizedBaseURL = baseURL.endsWith('/')
      ? baseURL
      : baseURL.concat('/');
    const url = new URL(path, normalizedBaseURL);

    const defaultParams = await resolveIfNeeded(this.defaultParams, options);

    // Append params to existing params in the path
    for (const [name, value] of new URLSearchParams(
      Object.assign({}, defaultParams, params),
    )) {
      url.searchParams.append(name, value);
    }

    // We accept arbitrary objects as body and serialize them as JSON
    if (
      init.body !== undefined &&
      typeof init.body !== 'string' &&
      !(init.body instanceof ArrayBuffer)
    ) {
      init.body = JSON.stringify(init.body);
      if (!(init.headers instanceof Headers)) {
        init.headers = new Headers(init.headers);
      }
      init.headers.set('Content-Type', 'application/json');
    }

    const request = new Request(String(url), init);

    if (this.willSendRequest) {
      await this.willSendRequest(request);
    }

    return this.trace(`${init.method || 'GET'} ${url}`, async () => {
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
