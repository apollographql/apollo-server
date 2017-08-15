import {
    AzureFunctionsHandler,
    graphqlAzureFunctions,
    graphiqlAzureFunctions,
} from './azureFunctionsApollo';
import testSuite, {
    schema as Schema,
    CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { expect } from 'chai';
import { GraphQLOptions } from 'apollo-server-core';
import 'mocha';
import * as url from 'url';

function createFunction(options: CreateAppOptions = {}) {
    let route, callback, context;
    let handler: AzureFunctionsHandler;

    options.graphqlOptions = options.graphqlOptions || { schema: Schema };
    if (options.graphiqlOptions) {
        route = '/graphiql';
        handler = graphiqlAzureFunctions(options.graphiqlOptions);
    } else {
        route = '/graphql';
        handler = graphqlAzureFunctions(options.graphqlOptions);
    }

    return function(req, res) {
        if (!req.url.startsWith(route)) {
            res.statusCode = 404;
            res.end();
            return;
        }

        let body = '';
        req.on('data', function(chunk) {
            body += chunk;
        });
        req.on('end', function() {
            let urlObject = url.parse(req.url, true);
            const request = {
                method: req.method,
                originalUrl: req.url,
                query: urlObject.query,
                headers: req.headers,
                body: body,
                rawbody: body,
            };

            context = {
                done: function(error, result) {
                    res.statusCode = result.status;
                    for (let key in result.headers) {
                        if (result.headers.hasOwnProperty(key)) {
                            res.setHeader(key, result.headers[key]);
                        }
                    }

                    if (error) {
                        res.error = error;
                    }

                    res.write(result.body);
                    res.end();
                },
            };

            handler(context, request);
        });
    };
}

describe('azureFunctionsApollo', () => {
    it('throws error if called without schema', function() {
        expect(() => graphqlAzureFunctions(undefined as GraphQLOptions)).to.throw(
            'Apollo Server requires options.',
        );
    });

    it('throws an error if called with more than one argument', function() {
        expect(() => (<any>graphqlAzureFunctions)({}, {})).to.throw(
            'Apollo Server expects exactly one argument, got 2',
        );
    });
});

describe('integration:Azure Functions', () => {
    testSuite(createFunction);
});
