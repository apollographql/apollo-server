import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';
import { IncomingMessage, ServerResponse } from 'http'
import { App, TemplatedApp, us_listen_socket_close } from 'uWebSockets.js'
import request from 'request'

import { ApolloServer } from '../ApolloServer';

const port = 8080

let listenerToken: any

// Note: There doesn't seem to be a good way of reliablly discarding
// `App` instances right now, so we'll reuse the same one
async function createApp(options: CreateAppOptions = {}) {
  const app = App({})

  const apollo = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );

  apollo.attachHandlers({ app })

  // Start listening on 8080
  const _listenerToken = await new Promise((resolve, reject) => {
    app.listen(port, (token: any) => token ? resolve() : reject())
  })

  listenerToken = _listenerToken

  return (req: IncomingMessage, res: ServerResponse) => {
    req.pipe(request(`http://localhost:${port}${req.url}`)).pipe(res)
  };
}

function destroyApp(app: TemplatedApp) {
  if (listenerToken) {
    us_listen_socket_close(listenerToken)
    listenerToken = null
  }
}

describe('uWebSocketsApollo', function () {
  it('should throw an error if called without a schema', function () {
    expect(() => new ApolloServer(undefined as any)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe('integration:uWebSockets', function () {
  testSuite(createApp, destroyApp);
});
