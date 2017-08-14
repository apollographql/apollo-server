import {
    IHttpContext,
    IFunctionRequest,
    HttpStatusCodes,
} from 'azure-functions-typescript';
import { GraphQLOptions, runHttpQuery } from 'apollo-server-core';
import * as GraphiQL from 'apollo-server-module-graphiql';

export interface AzureFunctionsGraphQLOptionsFunction {
    (context: IHttpContext): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface AzureFunctionsHandler {
    (context: IHttpContext, request: IFunctionRequest): void;
}

export interface IHeaders {
    'content-type'?: string;
    'content-length'?: HttpStatusCodes | number;
    'content-disposition'?: string;
    'content-encoding'?: string;
    'content-language'?: string;
    'content-range'?: string;
    'content-location'?: string;
    'content-md5'?: Buffer;
    'expires'?: Date;
    'last-modified'?: Date;
    [header: string]: any;
}

export interface AzureFunctionsGraphiQLOptionsFunction {
    (context: IHttpContext, request: IFunctionRequest):
        | GraphiQL.GraphiQLData
        | Promise<GraphiQL.GraphiQLData>;
}

export function graphqlAzureFunctions(
    options: GraphQLOptions | AzureFunctionsGraphQLOptionsFunction,
): AzureFunctionsHandler {
    if (!options) {
        throw new Error('Apollo Server requires options.');
    }

    if (arguments.length > 1) {
        throw new Error(
            `Apollo Server expects exactly one argument, got ${arguments.length}`,
        );
    }

    return (httpContext: IHttpContext, request: IFunctionRequest) => {
        const queryRequest = {
            method: request.method,
            options: options,
            query: request.method === 'POST' ? request.body : request.query,
        };

        if (queryRequest.query && typeof queryRequest.query === 'string') {
            queryRequest.query = JSON.parse(queryRequest.query);
        }

        return runHttpQuery([httpContext, request], queryRequest)
            .then(gqlResponse => {
                const result = {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: gqlResponse,
                };

                httpContext.res = result;

                httpContext.done(null, result);
            })
            .catch(error => {
                const result = {
                    status: error.statusCode,
                    headers: error.headers,
                    body: error.message,
                };

                httpContext.res = result;

                httpContext.done(null, result);
            });
    };
}

/* This Azure Functions Handler returns the html for the GraphiQL interactive query UI
 *
 * GraphiQLData arguments
 *
 * - endpointURL: the relative or absolute URL for the endpoint which GraphiQL will make queries to
 * - (optional) query: the GraphQL query to pre-fill in the GraphiQL UI
 * - (optional) variables: a JS object of variables to pre-fill in the GraphiQL UI
 * - (optional) operationName: the operationName to pre-fill in the GraphiQL UI
 * - (optional) result: the result of the query to pre-fill in the GraphiQL UI
 */

export function graphiqlAzureFunctions(
    options: GraphiQL.GraphiQLData | AzureFunctionsGraphiQLOptionsFunction,
) {
    return (httpContext: IHttpContext, request: IFunctionRequest) => {
        const query = request.query;

        GraphiQL.resolveGraphiQLString(query, options, httpContext, request).then(
            graphiqlString => {
                httpContext.res = {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/html',
                    },
                    body: graphiqlString,
                };

                httpContext.done(null, httpContext.res);
            },
            error => {
                httpContext.res = {
                    status: 500,
                    body: error.message,
                };

                httpContext.done(null, httpContext.res);
            },
        );
    };
}
