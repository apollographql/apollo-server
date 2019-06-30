import { ServiceDefinition } from '@apollo/federation';
import { GraphQLExecutionResult } from 'apollo-server-core';
import { parse } from 'graphql';
import fetch, { HeadersInit } from 'node-fetch';
import { ServiceEndpointDefinition } from './';

let serviceDefinitionMap: Map<string, string> = new Map();

export async function getServiceDefinitionsFromRemoteEndpoint({
  serviceList,
  headers = {},
}: {
  serviceList: ServiceEndpointDefinition[];
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
    serviceList.map(service => {
      if (!service.url) {
        throw new Error(
          `Tried to load schema from ${service.name} but no url found`,
        );
      }
      return fetch(service.url, {
        method: 'POST',
        body: JSON.stringify({
          query: 'query GetServiceDefinition { _service { sdl } }',
        }),
        headers: { 'Content-Type': 'application/json', ...headers },
      })
        .then(res => res.json())
        .then(({ data, errors }: GraphQLExecutionResult) => {
          if (data && !errors) {
            const typeDefs = data._service.sdl as string;
            const previousDefinition = serviceDefinitionMap.get(service.name);
            // this lets us know if any downstream service has changed
            // and we need to recalculate the schema
            if (previousDefinition !== typeDefs) {
              isNew = true;
            }
            serviceDefinitionMap.set(service.name, typeDefs);
            return { ...service, typeDefs: parse(typeDefs) };
          }

          // XXX handle local errors better for local development
          if (errors) {
            errors.forEach(console.error);
          }

          return false;
        })
        .catch(error => {
          console.warn(
            `Encountered error when loading ${service.name} at ${service.url}: ${error.message}`,
          );
          return false;
        });
    }),
  ).then(services => services.filter(Boolean))) as ServiceDefinition[];

  // return services
  return [services, isNew];
}
