import type {
  CreateServerForIntegrationTests,
  CreateServerForIntegrationTestsResult,
} from './index.js';
import { afterAll, beforeAll, describe, test } from '@jest/globals';
import { ServerAuditOptions, serverAudits } from 'graphql-http';
import fetch from 'node-fetch';

export function defineIntegrationTestSuiteHttpSpecTests(
  createServer: CreateServerForIntegrationTests,
) {
  describe('httpSpecTests.ts', () => {
    let createServerResult: CreateServerForIntegrationTestsResult | null = null;

    const serverAuditOptions: ServerAuditOptions = {
      // We don't actually have access to the URL when we need to call
      // serverAudits. Fortunately it's not actually read until the tests are
      // run, so we can just pass some garbage and overwrite it.
      // See https://github.com/graphql/graphql-http/issues/24
      url: 'http://should-not-happen.invalid',
      fetchFn: fetch,
    };

    beforeAll(async () => {
      createServerResult = await createServer({
        // Any schema will do (the tests just run `{__typename}`).
        typeDefs: 'type Query { x: ID }',
        // The test doesn't know we should send apollo-require-preflight along
        // with GETs. We could override `fetchFn` to add it but this seems simple enough.
        csrfPrevention: false,
      });
      // Until https://github.com/graphql/graphql-http/issues/24 is addressed,
      // this hack happens to work.
      serverAuditOptions.url = createServerResult.url;
    });

    afterAll(async () => {
      await createServerResult?.server.stop();
      await createServerResult?.extraCleanup?.();
    });

    for (const audit of serverAudits(serverAuditOptions)) {
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
        if (
          audit.name.startsWith('SHOULD use 200 status code') &&
          audit.name.endsWith('when accepting application/json') &&
          result.reason === 'Status code 400 is not 200'
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
