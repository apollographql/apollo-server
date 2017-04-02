import { microGraphql } from './microApollo';
import 'mocha';

import * as micro from 'micro'
import testSuite, { schema as Schema, CreateAppOptions  } from 'graphql-server-integration-testsuite';

function createApp(options: CreateAppOptions) {
    const graphqlOptions = (options && options.graphqlOptions) || { schema: Schema };
    return micro(microGraphql(graphqlOptions));
}

describe('integration:Micro', () => {
  testSuite(createApp);
});
