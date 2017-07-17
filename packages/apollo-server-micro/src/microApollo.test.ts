import { microGraphql, microGraphiql } from './microApollo';
import 'mocha';

import micro, { send } from 'micro';
import { router, get, post, put, patch, del, head, options as opts } from 'microrouter';
import testSuite, { schema, CreateAppOptions  } from 'apollo-server-integration-testsuite';


function createApp(options: CreateAppOptions) {
    const graphqlOptions = (options && options.graphqlOptions) || { schema };
    const graphiqlOptions = (options && options.graphiqlOptions) || { endpointURL: '/graphql' };

    const graphqlHandler = microGraphql(graphqlOptions);
    const graphiqlHandler = microGraphiql(graphiqlOptions);

    return micro(
        router(
            get('/graphql', graphqlHandler),
            post('/graphql', graphqlHandler),
            put('/graphql', graphqlHandler),
            patch('/graphql', graphqlHandler),
            del('/graphql', graphqlHandler),
            head('/graphql', graphqlHandler),
            opts('/graphql', graphqlHandler),

            get('/graphiql', graphiqlHandler),
            post('/graphiql', graphiqlHandler),
            put('/graphiql', graphiqlHandler),
            patch('/graphiql', graphiqlHandler),
            del('/graphiql', graphiqlHandler),
            head('/graphiql', graphiqlHandler),
            opts('/graphiql', graphiqlHandler),

            (req, res) => send(res, 404, 'not found'),
        ),
    );
}

describe('integration:Micro', () => {
  testSuite(createApp);
});
