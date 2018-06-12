declare module 'http-cache-semantics' {
  interface Request {
    url: string;
    method: string;
    headers: Headers;
  }

  interface Response {
    status: number;
    headers: Headers;
  }

  type Headers = { [name: string]: string };

  class CachePolicy {
    constructor(request: Request, response: Response);

    storable(): boolean;

    satisfiesWithoutRevalidation(request: Request): boolean;
    responseHeaders(): Headers;

    revalidationHeaders(request: Request): Headers;
    revalidatedPolicy(
      request: Request,
      response: Response,
    ): { policy: CachePolicy; modified: boolean };

    static fromObject(object: object): CachePolicy;
    toObject(): object;

    _status: number;
  }

  export = CachePolicy;
}
