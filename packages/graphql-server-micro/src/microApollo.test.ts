import { microGraphql, microGraphiql } from './microApollo';
import 'mocha';

import * as micro from 'micro';
import testSuite, { schema as Schema, CreateAppOptions  } from 'graphql-server-integration-testsuite';

function createApp(options: CreateAppOptions) {
    if (options && options.graphiqlOptions ) {
        return micro(microGraphiql( options.graphiqlOptions ));
    } else {
        const graphqlOptions = (options && options.graphqlOptions) || { schema: Schema };
        return micro(microGraphql(graphqlOptions));
    }
}

describe('integration:Micro', () => {
  testSuite(createApp);
});
