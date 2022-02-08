import type { Request, Headers } from 'node-fetch';

declare class MockReq implements Pick<Request, 'method' | 'url' | 'headers'> {
  constructor();
  method: string;
  url: string;
  headers: Headers;
}

export = MockReq;
