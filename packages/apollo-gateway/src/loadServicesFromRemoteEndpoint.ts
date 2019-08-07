import { GraphQLRequest, GraphQLResponse } from 'apollo-server-types';
import { parse } from 'graphql';
import { Headers, HeadersInit } from 'node-fetch';
import { ServiceEndpointDefinition } from './';
import { GraphQLDataSource } from './datasources/types';
import { ServiceDefinition } from '@apollo/federation';

let serviceDefinitionMap: Map<string, string> = new Map();

export async function getServiceDefinitionsFromRemoteEndpoint({
  serviceList,
  headers = {},
}: {
  serviceList: {
    serviceDefinition: ServiceEndpointDefinition;
    dataSource: GraphQLDataSource;
  }[];
  headers?: HeadersInit;
}): Promise<[ServiceDefinition[], boolean]> {
  if (!serviceList || !serviceList.length) {
    throw new Error(
      'Tried to load services from remote endpoints but none provided',
    );
  }

  let isNew = false;
  // for each service, fetch its introspection schema
  const services: ServiceDefinition[] = (await Promise.all(
    serviceList.map(({ serviceDefinition, dataSource }) => {
      const request: GraphQLRequest = {
        query: 'query GetServiceDefinition { _service { sdl } }',
        http: {
          url: <string>serviceDefinition.url,
          method: 'POST',
          headers: new Headers(headers),
        },
      };

      return dataSource
        .process({ request, context: {} })
        .then(({ data, errors }: GraphQLResponse) => {
          if (data && !errors) {
            const typeDefs = data._service.sdl as string;
            const previousDefinition = serviceDefinitionMap.get(
              serviceDefinition.name,
            );
            // this lets us know if any downstream service has changed
            // and we need to recalculate the schema
            if (previousDefinition !== typeDefs) {
              isNew = true;
            }
            serviceDefinitionMap.set(serviceDefinition.name, typeDefs);
            return {
                ...serviceDefinition,
                typeDefs: parse(typeDefs),
              };
          }

          // XXX handle local errors better for local development
          if (errors) {
            errors.forEach(console.error);
          }

          return false;
        })
        .catch(error => {
          console.warn(
            `Encountered error when loading ${serviceDefinition.name} at ${serviceDefinition.url}: ${error.message}`,
          );
          return false;
        });
    }),
  ).then(services => services.filter(Boolean))) as ServiceDefinition[];

  // return services
  return [services, isNew];
}
