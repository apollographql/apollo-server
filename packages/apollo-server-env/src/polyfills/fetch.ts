import fetch, { Request, Response, Headers } from 'node-fetch';

Object.assign(global, { fetch, Request, Response, Headers });

declare global {
  function fetch(input?: RequestInfo, init?: RequestInit): Promise<Response>;

  interface GlobalFetch {
    fetch: typeof fetch;
  }

  type RequestInfo = Request | string;

  class Headers implements Iterable<[string, string]> {
    constructor(init?: HeadersInit);

    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;

    entries(): Iterator<[string, string]>;
    keys(): Iterator<string>;
    values(): Iterator<[string]>;
    [Symbol.iterator](): Iterator<[string, string]>;
  }

  type HeadersInit = Headers | string[][] | { [name: string]: string };

  class Body {
    readonly bodyUsed: boolean;
    arrayBuffer(): Promise<ArrayBuffer>;
    json(): Promise<any>;
    text(): Promise<string>;
  }

  class Request extends Body {
    constructor(input: Request | string, init?: RequestInit);

    readonly method: string;
    readonly url: string;
    readonly headers: Headers;

    clone(): Request;
  }

  interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    integrity?: string;
  }

  type RequestMode = 'navigate' | 'same-origin' | 'no-cors' | 'cors';

  type RequestCredentials = 'omit' | 'same-origin' | 'include';

  type RequestCache =
    | 'default'
    | 'no-store'
    | 'reload'
    | 'no-cache'
    | 'force-cache'
    | 'only-if-cached';

  type RequestRedirect = 'follow' | 'error' | 'manual';

  type ReferrerPolicy =
    | ''
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'same-origin'
    | 'origin'
    | 'strict-origin'
    | 'origin-when-cross-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';

  class Response extends Body {
    constructor(body?: BodyInit, init?: ResponseInit);
    static error(): Response;
    static redirect(url: string, status?: number): Response;

    readonly url: string;
    readonly redirected: boolean;
    readonly status: number;
    readonly ok: boolean;
    readonly statusText: string;
    readonly headers: Headers;

    clone(): Response;
  }

  interface ResponseInit {
    headers?: HeadersInit;
    status?: number;
    statusText?: string;
  }

  type BodyInit = ArrayBuffer | string;

  class Blob {
    type: string;
    size: number;
    slice(start?: number, end?: number): Blob;
  }
}
