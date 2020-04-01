import { GraphQLRequest } from 'apollo-server-types';
import { parse } from 'graphql';
import { Headers, HeadersInit } from 'node-fetch';
import { GraphQLDataSource } from './datasources/types';
import { Experimental_UpdateServiceDefinitions, SERVICE_DEFINITION_QUERY } from './';
import { ServiceDefinition } from '@apollo/federation';

export async function getServiceDefinitionsFromRemoteEndpoint({
  serviceList,
  headers = {},
  serviceSdlCache,
}: {
  serviceList: {
    name: string;
    url?: string;
    dataSource: GraphQLDataSource;
  }[];
  headers?: HeadersInit;
  serviceSdlCache: Map<string, string>;
}): ReturnType<Experimental_UpdateServiceDefinitions> {
  if (!serviceList || !serviceList.length) {
    throw new Error(
      'Tried to load services from remote endpoints but none provided',
    );
  }

  let isNewSchema = false;
  // for each service, fetch its introspection schema
  const promiseOfServiceList = serviceList.map(({ name, url, dataSource }) => {
    if (!url) {
      throw new Error(
        `Tried to load schema for '${name}' but no 'url' was specified.`);
    }

    const request: GraphQLRequest = {
      query: SERVICE_DEFINITION_QUERY,
      http: {
        url,
        method: 'POST',
        headers: new Headers(headers),
      },
    };

    return dataSource
      .process({ request, context: {} })
      .then(({ data, errors }): ServiceDefinition => {
        if (data && !errors) {
          const typeDefs = data._service.sdl as string;
          const previousDefinition = serviceSdlCache.get(name);
          // this lets us know if any downstream service has changed
          // and we need to recalculate the schema
          if (previousDefinition !== typeDefs) {
            isNewSchema = true;
          }
          serviceSdlCache.set(name, typeDefs);
          return {
            name,
            url,
            typeDefs: parse(typeDefs),
          };
        }

        throw new Error(errors?.map(e => e.message).join("\n"));
      })
      .catch(err => {
        const errorMessage =
          `Couldn't load service definitions for "${name}" at ${url}` +
          (err && err.message ? ": " + err.message || err : "");

        throw new Error(errorMessage);
      });
  });

  const serviceDefinitions = await Promise.all(promiseOfServiceList);
  return { serviceDefinitions, isNewSchema }
}
