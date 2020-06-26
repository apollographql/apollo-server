import { GraphQLSchema, GraphQLError } from 'graphql';
import {
  GraphQLSchemaValidationError,
  GraphQLSchemaModule,
  GraphQLResolverMap,
} from 'apollo-graphql';
import { GraphQLRequest, GraphQLExecutionResult, Logger } from 'apollo-server-types';
import {
  composeAndValidate,
  buildFederatedSchema,
  ServiceDefinition,
} from '@apollo/federation';

import {
  buildQueryPlan,
  executeQueryPlan,
  QueryPlan,
  buildOperationContext,
} from '@apollo/gateway';
import { LocalGraphQLDataSource } from '../datasources/LocalGraphQLDataSource';
import { mergeDeep } from 'apollo-utilities';

import queryPlanSerializer from '../snapshotSerializers/queryPlanSerializer';
import astSerializer from '../snapshotSerializers/astSerializer';
import gql from 'graphql-tag';
import { fixtures } from './__fixtures__/schemas';
const prettyFormat = require('pretty-format');

export type ServiceDefinitionModule = ServiceDefinition & GraphQLSchemaModule;

export function overrideResolversInService(
  module: ServiceDefinitionModule,
  resolvers: GraphQLResolverMap,
): ServiceDefinitionModule {
  return {
    name: module.name,
    typeDefs: module.typeDefs,
    resolvers: mergeDeep(module.resolvers, resolvers),
  };
}

export async function execute(
  request: GraphQLRequest,
  services: ServiceDefinitionModule[] = fixtures,
  logger: Logger = console,
): Promise<GraphQLExecutionResult & { queryPlan: QueryPlan }> {
  let schema: GraphQLSchema;
  const serviceMap = Object.fromEntries(
    services.map(({ name, typeDefs, resolvers }) => {
      return [
        name,
        new LocalGraphQLDataSource(
          buildFederatedSchema([{ typeDefs, resolvers }]),
        ),
      ] as [string, LocalGraphQLDataSource];
    }),
  );

  let errors: GraphQLError[];

  ({ schema, errors } = composeAndValidate(
    Object.entries(serviceMap).map(([serviceName, service]) => ({
      name: serviceName,
      typeDefs: service.sdl(),
    })),
  ));

  if (errors && errors.length > 0) {
    throw new GraphQLSchemaValidationError(errors);
  }
  const operationContext = buildOperationContext(schema, gql`${request.query}`);

  const queryPlan = buildQueryPlan(operationContext);

  const result = await executeQueryPlan(
    queryPlan,
    serviceMap,
    {
      cache: undefined as any,
      context: {},
      request,
      logger
    },
    operationContext,
  );

  return { ...result, queryPlan };
}

export function wait(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export function printPlan(queryPlan: QueryPlan): string {
  return prettyFormat(queryPlan, {
    plugins: [queryPlanSerializer, astSerializer],
  });
}
