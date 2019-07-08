import {
  DocumentNode,
  GraphQLSchema,
  isObjectType,
  isUnionType,
  GraphQLUnionType,
  GraphQLObjectType,
  specifiedDirectives,
} from 'graphql';
import {
  buildSchemaFromSDL,
  transformSchema,
  GraphQLSchemaModule,
  modulesFromSDL,
  addResolversToSchema,
} from 'apollo-graphql';
import federationDirectives, { typeIncludesDirective } from '../directives';

import {
  serviceField,
  entitiesField,
  EntityType,
  ResolvableGraphQLObjectType,
  GraphQLReferenceResolver,
} from '../types';

import { printSchema } from './printFederatedSchema';

import 'apollo-server-env';

interface ReferenceResolverMap {
  [key: string]: { __resolveReference: GraphQLReferenceResolver };
}

export function buildFederatedSchema(
  modulesSDLOrSchema:
    | (GraphQLSchemaModule | DocumentNode)[]
    | DocumentNode
    | GraphQLSchema,
): GraphQLSchema {
  if (modulesSDLOrSchema instanceof GraphQLSchema) {
    return buildFederatedSchemaFromSchema(modulesSDLOrSchema);
  }

  return buildSchemaFromModulesOrSDL(modulesSDLOrSchema);
}

function resolveReferenceForType(
  type: ResolvableGraphQLObjectType,
): GraphQLReferenceResolver | undefined {
  if (type.resolveReference) {
    return type.resolveReference;
  }

  if (isObjectType(type)) {
    const fields = type.getFields();

    if (fields.__resolveReference) {
      const __resolveReference = fields.__resolveReference
        .resolve as GraphQLReferenceResolver;

      delete fields.__resolveReference;

      return __resolveReference;
    }
  }

  return;
}

function referenceResolversForSchema(
  schema: GraphQLSchema,
): ReferenceResolverMap {
  const map: ReferenceResolverMap = {};

  for (const [typeName, type] of Object.entries(schema.getTypeMap())) {
    const __resolveReference = resolveReferenceForType(
      type as ResolvableGraphQLObjectType,
    );

    if (__resolveReference) {
      map[typeName] = { __resolveReference };
    }
  }

  return map;
}

function buildFederatedSchemaFromSchema(
  baseSchema: GraphQLSchema,
): GraphQLSchema {
  const referenceResolvers = referenceResolversForSchema(baseSchema);

  const schema = transformFederatedSchema(baseSchema);

  addResolversToSchema(schema, referenceResolvers);

  return schema;
}

function buildSchemaFromModulesOrSDL(
  modulesOrSDL: (GraphQLSchemaModule | DocumentNode)[] | DocumentNode,
): GraphQLSchema {
  const modules = modulesFromSDL(modulesOrSDL);

  const schema = transformFederatedSchema(
    buildSchemaFromSDL(
      modules,
      new GraphQLSchema({
        query: null,
        directives: [...specifiedDirectives, ...federationDirectives],
      }),
    ),
  );

  for (const module of modules) {
    if (!module.resolvers) continue;
    addResolversToSchema(schema, module.resolvers);
  }

  return schema;
}

function transformFederatedSchema(schema: GraphQLSchema): GraphQLSchema {
  // At this point in time, we have a schema to be printed into SDL which is
  // representative of what the user defined for their schema. This is before
  // we process any of the federation directives and add custom federation types
  // so its the right place to create our service definition sdl.
  //
  // We have to use a modified printSchema from graphql-js which includes
  // support for preserving the *uses* of federation directives while removing
  // their *definitions* from the sdl.
  const sdl = printSchema(schema);

  // Add an empty query root type if none has been defined
  if (!schema.getQueryType()) {
    schema = new GraphQLSchema({
      ...schema.toConfig(),
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {},
      }),
    });
  }

  const entityTypes = Object.values(schema.getTypeMap()).filter(
    type => isObjectType(type) && typeIncludesDirective(type, 'key'),
  );
  const hasEntities = entityTypes.length > 0;

  schema = transformSchema(schema, type => {
    // Add `_entities` and `_service` fields to query root type
    if (isObjectType(type) && type === schema.getQueryType()) {
      const config = type.toConfig();
      return new GraphQLObjectType({
        ...config,
        fields: {
          ...(hasEntities && { _entities: entitiesField }),
          _service: {
            ...serviceField,
            resolve: () => ({ sdl }),
          },
          ...config.fields,
        },
      });
    }

    return undefined;
  });

  schema = transformSchema(schema, type => {
    if (hasEntities && isUnionType(type) && type.name === EntityType.name) {
      return new GraphQLUnionType({
        ...EntityType.toConfig(),
        types: entityTypes.filter(isObjectType),
      });
    }
    return undefined;
  });

  return schema;
}
