import { HTTPCache } from './HTTPCache';

export type Params = { [name: string]: any };

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

  protected async get(
    path: string,
    params?: Params,
    options?: RequestInit,
  ): Promise<any> {
    return this.fetch(path, params, Object.assign({ method: 'GET' }, options));
  }

  protected async post(
    path: string,
    params?: Params,
    options?: RequestInit,
  ): Promise<any> {
    return this.fetch(path, params, Object.assign({ method: 'POST' }, options));
  }

  protected async put(
    path: string,
    params?: Params,
    options?: RequestInit,
  ): Promise<any> {
    return this.fetch(path, params, Object.assign({ method: 'PUT' }, options));
  }

  protected async delete(
    path: string,
    params?: Params,
    options?: RequestInit,
  ): Promise<any> {
    return this.fetch(
      path,
      params,
      Object.assign({ method: 'DELETE' }, options),
    );
  }

  private async fetch(
    path: string,
    params?: Params,
    init?: RequestInit,
  ): Promise<any> {
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
