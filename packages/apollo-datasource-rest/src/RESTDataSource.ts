import {
  BodyInit,
  Headers,
  Request,
  RequestInit,
  Response,
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
  params?: URLSearchParamsInit;
  body: Body;
};
export type Body = BodyInit | object;
export { Request };

export abstract class RESTDataSource<TContext = any> {
  abstract baseURL: string;

  httpCache!: HTTPCache;
  context!: TContext;

  protected willSendRequest?(request: Request): void;

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
    options?: RequestOptions,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      path,
      Object.assign({ method: 'GET', params }, options),
    );
  }

  protected async post<TResult = any>(
    path: string,
    body?: Body,
    options?: RequestOptions,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      path,
      Object.assign({ method: 'POST', body }, options),
    );
  }

  protected async patch<TResult = any>(
    path: string,
    body?: Body,
    options?: RequestOptions,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      path,
      Object.assign({ method: 'PATCH', body }, options),
    );
  }

  protected async put<TResult = any>(
    path: string,
    body?: Body,
    options?: RequestOptions,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      path,
      Object.assign({ method: 'PUT', body }, options),
    );
  }

  protected async delete<TResult = any>(
    path: string,
    params?: URLSearchParamsInit,
    options?: RequestOptions,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      path,
      Object.assign({ method: 'DELETE', params }, options),
    );
  }

  private async fetch<TResult>(
    path: string,
    options: RequestOptions,
  ): Promise<TResult> {
    const { params, ...init } = options;

    const normalizedBaseURL = this.baseURL.endsWith('/')
      ? this.baseURL
      : this.baseURL.concat('/');
    const url = new URL(path, normalizedBaseURL);

    if (params) {
      // Append params to existing params in the path
      for (const [name, value] of new URLSearchParams(params)) {
        url.searchParams.append(name, value);
      }
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

    return this.trace(`${init.method || 'GET'} ${url}`, async () => {
      const request = new Request(String(url), init);

      if (this.willSendRequest) {
        this.willSendRequest(request);
      }

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
