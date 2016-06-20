import * as hapi from 'hapi';
import * as graphql from 'graphql';
import { runQuery } from '../core/runQuery';


export interface IRegister {
    (server: hapi.Server, options: any, next: any): void;
    attributes?: any;
}

export interface HapiApolloOptions {
    schema: graphql.GraphQLSchema;
    formatError?: Function;
    rootValue?: any;
    context?: any;
    logFunction?: Function;
}

export class HapiApollo {
    constructor() {
        this.register.attributes = {
            name: 'graphql',
            version: '0.0.1',
        };
    }

    public register: IRegister = (server: hapi.Server, options: HapiApolloOptions, next) => {
        server.route({
            method: 'GET',
            path: '/test',
            handler: (request, reply) => {
                reply('test passed');
            },
        });

        server.route({
            method: 'POST',
            path: '/',
            handler: (request, reply) => {
                return runQuery({
                    schema: options.schema,
                    query: request.payload,
                }).then(gqlResponse => {
                    reply({ data: gqlResponse.data });
                }).catch(errors => {
                    reply({ errors: errors }).code(500);
                });
            },
        });
        next();
    }
}
