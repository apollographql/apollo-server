declare module 'mock-req' {
  import { Request, Headers } from 'apollo-server-env';

  class MockReq implements Pick<Request, 'method' | 'url' | 'headers'> {
    constructor();
    method: string;
    url: string;
    headers: Headers;
  }

  export = MockReq;
}
