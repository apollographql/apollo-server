import { DocumentNode, GraphQLSchema, specifiedDirectives } from 'graphql';
import {
  buildSchemaFromSDL,
  GraphQLSchemaModule,
  modulesFromSDL,
  GraphQLResolverMap,
} from 'apollo-graphql';
import federationDirectives from '../directives';

import 'apollo-server-env';
import { transformFederatedSchema } from './transformFederatedSchema';
import { extractFederationResolvers } from './extractFederationResolvers';

export function buildFederatedSchema(
  modulesOrSDLOrSchema:
    | (GraphQLSchemaModule | DocumentNode)[]
    | DocumentNode
    | GraphQLSchema,
): GraphQLSchema {
  // Extract federation specific resolvers from already constructed
  // GraphQLSchema and transform it to a federated schema.
  if (modulesOrSDLOrSchema instanceof GraphQLSchema) {
    return transformFederatedSchema(modulesOrSDLOrSchema, [
      extractFederationResolvers(modulesOrSDLOrSchema),
    ]);
  }

  // Transform *modules* or *sdl* into a federated schema.
  const modules = modulesFromSDL(modulesOrSDLOrSchema);

  const resolvers = modules
    .filter(module => !!module.resolvers)
    .map(module => module.resolvers as GraphQLResolverMap<any>);

  return transformFederatedSchema(
    buildSchemaFromSDL(
      modules,
      new GraphQLSchema({
        query: undefined,
        directives: [...specifiedDirectives, ...federationDirectives],
      }),
    ),
    resolvers,
  );
}
