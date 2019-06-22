
import nock from 'nock'
import { createGateway } from '../..';

it('Queries remote endpoints for their SDLs', async () => {
  nock('http://localhost:4001', { "encodedQueryParams": true })
    .post('/graphql', { "query": "query GetServiceDefinition { _service { sdl } }" })
    .reply(200, { "data": { "_service": { "sdl": "extend type Query {\n  me: User\n  everyone: [User]\n}\n\ntype User @key(fields: \"id\") {\n  id: ID!\n  name: String\n  username: String\n}\n" } } },
      {
        'X-Powered-By': 'Express',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Content-Length': '175',
        'Date': 'Fri, 21 Jun 2019 23:57:10 GMT',
        'Connection': 'close'
      });

  await createGateway({
    serviceList: [
      { name: "accounts", url: "http://localhost:4001/graphql" },
    ],
  })

  expect(nock.isDone()).toBeTruthy()
})

it.skip('Extracts service definitions from remote storage', async () => {
  // TODO: mock all the GCS calls
})
