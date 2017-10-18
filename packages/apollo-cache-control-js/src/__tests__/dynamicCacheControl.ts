import {
  GraphQLScalarType,
  GraphQLFieldResolver,
  GraphQLTypeResolver,
  GraphQLIsTypeOfFn
} from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

import { collectCacheControlData } from './test-utils/helpers';

import { CacheControlExtension } from '../';

declare module 'graphql/type/definition' {
  interface GraphQLResolveInfo {
    cacheControl: CacheControlExtension;
  }
}

export interface GraphQLResolvers {
  [fieldName: string]: (() => any) | GraphQLResolverObject | GraphQLScalarType;
}

export type GraphQLResolverObject = {
  [fieldName: string]: GraphQLFieldResolver<any, any> | GraphQLResolverOptions;
};

export interface GraphQLResolverOptions {
  resolve?: GraphQLFieldResolver<any, any>;
  subscribe?: GraphQLFieldResolver<any, any>;
  __resolveType?: GraphQLTypeResolver<any, any>;
  __isTypeOf?: GraphQLIsTypeOfFn<any, any>;
}

describe('dynamic cache control', () => {
  xit('should include the specified maxAge for a root field with a dynamic cache hint', async () => {
    const typeDefs = `
      type Query {
        droid(id: ID!): Droid
      }

      type Droid {
        id: ID!
        name: String!
      }
    `;

    const resolvers: GraphQLResolvers = {
      Query: {
        droid: (_source, { _id }, _context, { cacheControl }) => {
          cacheControl.setCacheHint({ maxAge: 60 });
          return {
            id: 2001,
            name: 'R2-D2'
          };
        }
      }
    };

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const data = await collectCacheControlData(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `
    );

    expect(data.hints).toContainEqual({ path: ['droid'], maxAge: 60 });
  });
});
