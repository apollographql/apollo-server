import { Request, Headers } from '@landingexp/apollo-server-env';

declare class MockReq implements Pick<Request, 'method' | 'url' | 'headers'> {
  constructor();
  method: string;
  url: string;
  headers: Headers;
}

export = MockReq;
