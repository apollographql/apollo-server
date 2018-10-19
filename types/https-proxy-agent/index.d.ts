declare module 'https-proxy-agent' {
  import { Agent } from 'https';

  namespace HttpsProxyAgent {
    interface HttpsProxyAgentOptions {
      host: string
      port: number
      secureProxy?: boolean
      headers?: {
        [key: string]: string
      }
      [key: string]: any
    }
  }

  class HttpsProxyAgent extends Agent {
    constructor(options: string | HttpsProxyAgent.HttpsProxyAgentOptions)
  }

  export = HttpsProxyAgent
}