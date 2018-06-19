import { HTTPCache } from './HTTPCache';

export type Params =
  | URLSearchParams
  | string
  | { [key: string]: string | string[] | undefined }
  | Iterable<[string, string]>
  | Array<[string, string]>;

export abstract class RESTDataSource<TContext = any> {
  abstract baseURL: string;

  httpCache!: HTTPCache;
  context!: TContext;

  public willSendRequest?(request: Request): void;

  public willReceiveCache(httpCache: HTTPCache) {
    this.httpCache = httpCache;
  }

  public willReceiveContext(context: TContext) {
    this.context = context;
  }

  protected async get<TResponse>(
    path: string,
    params?: Params,
    options?: RequestInit,
  ): Promise<TResponse> {
    return this.fetch<TResponse>(
      path,
      params,
      Object.assign({ method: 'GET' }, options),
    );
  }

  protected async post<TResponse>(
    path: string,
    params?: Params,
    options?: RequestInit,
  ): Promise<TResponse> {
    return this.fetch<TResponse>(
      path,
      params,
      Object.assign({ method: 'POST' }, options),
    );
  }

  protected async patch<TResponse>(
    path: string,
    params?: Params,
    options?: RequestInit,
  ): Promise<TResponse> {
    return this.fetch<TResponse>(
      path,
      params,
      Object.assign({ method: 'PATCH' }, options),
    );
  }

  protected async put<TResponse>(
    path: string,
    params?: Params,
    options?: RequestInit,
  ): Promise<TResponse> {
    return this.fetch<TResponse>(
      path,
      params,
      Object.assign({ method: 'PUT' }, options),
    );
  }

  protected async delete<TResponse>(
    path: string,
    params?: Params,
    options?: RequestInit,
  ): Promise<TResponse> {
    return this.fetch<TResponse>(
      path,
      params,
      Object.assign({ method: 'DELETE' }, options),
    );
  }

  private async fetch<TResponse>(
    path: string,
    params?: Params,
    init?: RequestInit,
  ): Promise<TResponse> {
    const url = new URL(path, this.baseURL);

    if (params && Object.keys(params).length > 0) {
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
        return response.json();
      } else {
        throw new Error(
          `${response.status} ${response.statusText}: ${await response.text()}`,
        );
      }
    });
  }

  private async trace<Result>(
    label: string,
    fn: () => Promise<Result>,
  ): Promise<Result> {
    const startTime = Date.now();
    try {
      return await fn();
    } finally {
      const duration = Date.now() - startTime;
      //to remove the unused error
      label;
      duration;
      // console.log(`${label} (${duration}ms)`);
    }
  }
}
