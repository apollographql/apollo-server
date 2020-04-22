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
  GraphQLResolverMap,
} from 'apollo-graphql';
import federationDirectives, { typeIncludesDirective } from '../directives';

import { serviceField, entitiesField, EntityType } from '../types';

import { printSchema } from './printFederatedSchema';

import 'apollo-server-env';

type LegacySchemaModule = {
  typeDefs: DocumentNode | DocumentNode[];
  resolvers?: GraphQLResolverMap<any>;
};

export function buildFederatedSchema(
  modulesOrSDL:
    | (GraphQLSchemaModule | DocumentNode)[]
    | DocumentNode
    | LegacySchemaModule,
): GraphQLSchema {
  // ApolloServer supports passing an array of DocumentNode along with a single
  // map of resolvers to build a schema. Long term we don't want to support this
  // style anymore as we move towards a more structured approach to modules,
  // however, it has tripped several teams up to not support this signature
  // in buildFederatedSchema. Especially as teams migrate from
  // `new ApolloServer({ typeDefs: DocumentNode[], resolvers })` to
  // `new ApolloServer({ schema: buildFederatedSchema({ typeDefs: DocumentNode[], resolvers }) })`
  //
  // The last type in the union for `modulesOrSDL` supports this "legacy" input
  // style in a simple manner (by just adding the resolvers to the first typeDefs entry)
  //
  let shapedModulesOrSDL: (GraphQLSchemaModule | DocumentNode)[] | DocumentNode;
  if ('typeDefs' in modulesOrSDL) {
    const { typeDefs, resolvers } = modulesOrSDL;
    const augmentedTypeDefs = Array.isArray(typeDefs) ? typeDefs : [typeDefs];
    shapedModulesOrSDL = augmentedTypeDefs.map((typeDefs, i) => {
      const module: GraphQLSchemaModule = { typeDefs };
      // add the resolvers to the first "module" in the array
      if (i === 0 && resolvers) module.resolvers = resolvers;
      return module;
    });
  } else {
    shapedModulesOrSDL = modulesOrSDL;
  }

  const modules = modulesFromSDL(shapedModulesOrSDL);

  let schema = buildSchemaFromSDL(
    modules,
    new GraphQLSchema({
      query: undefined,
      directives: [...specifiedDirectives, ...federationDirectives],
    }),
  );

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

  for (const module of modules) {
    if (!module.resolvers) continue;
    addResolversToSchema(schema, module.resolvers);
  }

  return schema;
}
