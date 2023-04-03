import type {
  CreateServerForIntegrationTests,
  CreateServerForIntegrationTestsResult,
} from './index.js';
import { afterAll, beforeAll, describe, test } from '@jest/globals';
import { serverAudits } from 'graphql-http';
import fetch from 'node-fetch';

export function defineIntegrationTestSuiteHttpSpecTests(
  createServer: CreateServerForIntegrationTests,
) {
  describe('httpSpecTests.ts', () => {
    let createServerResult: CreateServerForIntegrationTestsResult;

    beforeAll(async () => {
      createServerResult = await createServer({
        // Any schema will do (the tests just run `{__typename}`).
        typeDefs: 'type Query { x: ID }',
        // The test doesn't know we should send apollo-require-preflight along
        // with GETs. We could override `fetchFn` to add it but this seems simple enough.
        csrfPrevention: false,
      });
    });

    afterAll(async () => {
      await createServerResult.server.stop();
      await createServerResult.extraCleanup?.();
    });

    for (const audit of serverAudits({
      url: () => createServerResult.url,
      fetchFn: fetch,
    })) {
      test(audit.name, async () => {
        const result = await audit.fn();

        if (result.status === 'ok') {
          return;
        }
        if (result.status === 'error') {
          throw new Error(result.reason);
        }

        if (result.status !== 'warn') {
          throw new Error(`unknown status ${result.status}`);
        }

        // We failed an optional audit. That's OK, but let's make sure it's
        // one of the ones we expect to fail!

        // The spec has a bunch of optional suggestions which say that you
        // should use 200 rather than 400 for various errors unless opting in to
        // the new application/graphql-response+json response type. That's based
        // on the theory that "400 + application/json" might come from some
        // random proxy layer rather than an actual GraphQL processor and so it
        // shouldn't be relied on. (It *does* expect you to use 400 for these
        // errors when returning `application/graphql-response+json`, and we
        // pass those tests.) But Apollo Server has used non-200 status codes
        // for a long time, and in fact a major reason these are merely SHOULDs
        // in the spec is so that AS can pass without backwards-incompatible
        // changes here. So we ignore these particular SHOULD failures.
        const expectedWarning400InsteadOf200Ids = [
          '3715',
          '9FE0',
          '9FE1',
          '9FE2',
          '9FE3',
          'FB90',
          'FB91',
          'FB92',
          'FB93',
          'F050',
          'F051',
          'F052',
          'F053',
          '3680',
          '3681',
          '3682',
          '3683',
          'D477',
          'F5AF',
          '572B',
          'FDE2',
          '7B9B', // SHOULD use a status code of 200 on variable coercion failure when accepting application/json
        ];

        if (
          expectedWarning400InsteadOf200Ids.includes(audit.id) &&
          result.response.status === 400
        ) {
          return;
        }

        // This is a bit weird: this issue is not actually that we include the 'data'
        // entry, but that JSON parse errors aren't delivered as JSON responses at all.
        // See https://github.com/graphql/graphql-http/issues/25
        if (
          audit.name ===
          'SHOULD not contain the data entry on JSON parsing failure when accepting application/graphql-response+json'
        ) {
          return;
        }

        throw new Error(result.reason);
      });
    }
  });
}
