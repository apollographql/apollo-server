import { Request, Response } from 'apollo-server-env';

declare global {
  interface FetchEvent {
    readonly request: Request;
    respondWith(response: Promise<Response>): void;
    waitUntil(task: Promise<any>): void;
  }

  function addEventListener(
    type: 'fetch',
    listener: (event: FetchEvent) => void,
  ): void;
}
