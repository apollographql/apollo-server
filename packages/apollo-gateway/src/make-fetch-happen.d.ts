declare module 'make-fetch-happen' {
  import { Response, Request } from 'apollo-server-env';

  // If adding to these options, they should mirror those from `make-fetch-happen`
  // @see: https://github.com/npm/make-fetch-happen/#extra-options
  export interface FetcherOptions {
    cacheManager?: string | CacheManager;
    // @see: https://www.npmjs.com/package/retry#retrytimeoutsoptions
    retry?:
      | boolean
      | number
      | {
          //  The maximum amount of times to retry the operation. Default is 10. Seting this to 1 means do it once, then retry it once
          retries?: number;
          // The exponential factor to use. Default is 2.
          factor?: number;
          // The number of milliseconds before starting the first retry. Default is 1000.
          minTimeout?: number;
          // The maximum number of milliseconds between two retries. Default is Infinity.
          maxTimeout?: number;
          // Randomizes the timeouts by multiplying with a factor between 1 to 2. Default is false.
          randomize?: boolean;
        };
    onRetry?(): void;
  }

  export interface CacheManager {
    delete(req: Request): Promise<Boolean>;
    put(req: Request, res: Response): Promise<Response>;
    match(req: Request): Promise<Response | undefined>;
  }
  export interface Fetcher {
    (url: string): Promise<Response>;
    defaults(opts?: FetcherOptions): Fetcher;
  }

  let fetch: Fetcher;

  export default fetch;
}
