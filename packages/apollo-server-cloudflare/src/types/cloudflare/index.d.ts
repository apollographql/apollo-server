interface FetchEvent {
  readonly request: Request;
  respondWith(response: Promise<Response>): void;
  waitUntil(task: Promise<any>): void;
}

declare function addEventListener(
  type: 'fetch',
  listener: (event: FetchEvent) => void,
): void;
