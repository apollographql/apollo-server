import { URL, URLSearchParams } from 'url';

Object.assign(global, { URL, URLSearchParams });

declare global {
  class URL {
    constructor(input: string, base?: string | URL);
    hash: string;
    host: string;
    hostname: string;
    href: string;
    readonly origin: string;
    password: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
    readonly searchParams: URLSearchParams;
    username: string;
    toString(): string;
    toJSON(): string;
  }

  class URLSearchParams implements Iterable<[string, string]> {
    constructor(
      init?:
        | URLSearchParams
        | string
        | { [key: string]: string | string[] | undefined }
        | Iterable<[string, string]>
        | Array<[string, string]>,
    );
    append(name: string, value: string): void;
    delete(name: string): void;
    entries(): IterableIterator<[string, string]>;
    forEach(callback: (value: string, name: string) => void): void;
    get(name: string): string | null;
    getAll(name: string): string[];
    has(name: string): boolean;
    keys(): IterableIterator<string>;
    set(name: string, value: string): void;
    sort(): void;
    toString(): string;
    values(): IterableIterator<string>;
    [Symbol.iterator](): IterableIterator<[string, string]>;
  }
}
