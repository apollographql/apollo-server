import { GraphQLSchema } from 'graphql';
import { GraphQLResolverMap } from 'apollo-graphql';
import {
  GraphQLReferenceResolver,
  ResolvableGraphQLObjectType,
} from '../types';

function extractFederationResolverForType(
  type: ResolvableGraphQLObjectType,
): { __resolveReference: GraphQLReferenceResolver } | void {
  if (type.resolveReference) {
    return { __resolveReference: type.resolveReference };
  }
}

export function extractFederationResolvers(
  schema: GraphQLSchema,
): GraphQLResolverMap<any> {
  const map: GraphQLResolverMap<any> = {};

  for (const [typeName, type] of Object.entries(schema.getTypeMap())) {
    const resolvers = extractFederationResolverForType(
      type as ResolvableGraphQLObjectType,
    );

    if (resolvers) {
      map[typeName] = resolvers;
    }
  }

  return map;
}
