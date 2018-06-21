import {
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
    options?: RequestInit,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      path,
      params,
      Object.assign({ method: 'GET' }, options),
    );
  }

  protected async post<TResult = any>(
    path: string,
    params?: URLSearchParamsInit,
    options?: RequestInit,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      path,
      params,
      Object.assign({ method: 'POST' }, options),
    );
  }

  protected async patch<TResult = any>(
    path: string,
    params?: URLSearchParamsInit,
    options?: RequestInit,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      path,
      params,
      Object.assign({ method: 'PATCH' }, options),
    );
  }

  protected async put<TResult = any>(
    path: string,
    params?: URLSearchParamsInit,
    options?: RequestInit,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      path,
      params,
      Object.assign({ method: 'PUT' }, options),
    );
  }

  protected async delete<TResult = any>(
    path: string,
    params?: URLSearchParamsInit,
    options?: RequestInit,
  ): Promise<TResult> {
    return this.fetch<TResult>(
      path,
      params,
      Object.assign({ method: 'DELETE' }, options),
    );
  }

  private async fetch<TResult>(
    path: string,
    params?: URLSearchParamsInit,
    init?: RequestInit,
  ): Promise<TResult> {
    const url = new URL(path, this.baseURL);

    if (params) {
      // Append params to existing params in the path
      for (const [name, value] of new URLSearchParams(params)) {
        url.searchParams.append(name, value);
      }
    }

    return this.trace(`${(init && init.method) || 'GET'} ${url}`, async () => {
      const request = new Request(String(url));

      if (this.willSendRequest) {
        this.willSendRequest(request);
      }

      const response = await this.httpCache.fetch(request, init);
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
