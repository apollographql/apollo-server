declare module "make-fetch-happen" {
  import { Response } from "apollo-server-env";
  // export type Fetcher = (url: string) => Promise<Response>;
  export interface Fetcher {
    (url: string): Promise<Response>;
    defaults(opts?: any): Fetcher;
  }

  let fetch: Fetcher;

  export default fetch;
}
