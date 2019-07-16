import { GraphQLSchema, isObjectType } from 'graphql';
import { GraphQLResolverMap } from 'apollo-graphql';
import {
  GraphQLReferenceResolver,
  ResolvableGraphQLObjectType,
} from '../types';

function extractFederationResolversForType(
  type: ResolvableGraphQLObjectType,
): { __resolveReference: GraphQLReferenceResolver } | undefined {
  if (type.resolveReference) {
    return { __resolveReference: type.resolveReference };
  }

  if (isObjectType(type)) {
    const fields = type.getFields();

    if (fields.__resolveReference) {
      const __resolveReference = fields.__resolveReference
        .resolve as GraphQLReferenceResolver;

      delete fields.__resolveReference;

      return { __resolveReference };
    }
  }

  return;
}

export function extractFederationResolvers(
  schema: GraphQLSchema,
): GraphQLResolverMap<any> {
  const map: GraphQLResolverMap<any> = {};

  for (const [typeName, type] of Object.entries(schema.getTypeMap())) {
    const resolvers = extractFederationResolversForType(
      type as ResolvableGraphQLObjectType,
    );

    if (resolvers) {
      map[typeName] = resolvers;
    }
  }

  return map;
}
