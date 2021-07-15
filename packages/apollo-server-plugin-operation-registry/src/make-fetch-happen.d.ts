/**
 * We are attempting to get types included natively in this package, but it
 * has not happened, yet!
 *
 * See https://github.com/npm/make-fetch-happen/issues/20
 */
declare module 'make-fetch-happen' {
  import {
    Response,
    Request,
    RequestInfo,
    RequestInit,
  } from 'apollo-server-env';

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

  /**
   * This is an augmentation of the fetch function types provided by `apollo-server-env`
   * @see: https://git.io/JvBwX
   */
  export interface Fetcher {
    (
      input: RequestInfo,
      init?: RequestInit & FetcherOptions,
    ): Promise<Response>;
  }

  let fetch: Fetcher & {
    defaults(opts?: RequestInit & FetcherOptions): Fetcher;
  };

  export default fetch;
}
