import {
  GraphQLScalarType,
  GraphQLFieldResolver,
  GraphQLTypeResolver,
  GraphQLIsTypeOfFn
} from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

import { CacheScope } from '../';
import { collectCacheControlHints } from './test-utils/helpers';

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
  it('should set the maxAge for a field from a dynamic cache hint', async () => {
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

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 60 });
  });

  it('should set the scope for a field from a dynamic cache hint', async () => {
    const typeDefs = `
      type Query {
        droid(id: ID!): Droid @cacheControl(maxAge: 60)
      }

      type Droid {
        id: ID!
        name: String!
      }
    `;

    const resolvers: GraphQLResolvers = {
      Query: {
        droid: (_source, { _id }, _context, { cacheControl }) => {
          cacheControl.setCacheHint({ scope: CacheScope.Private });
          return {
            id: 2001,
            name: 'R2-D2'
          };
        }
      }
    };

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 60, scope: CacheScope.Private });
  });

  it('should override the maxAge set for a field from a dynamic cache hint', async () => {
    const typeDefs = `
      type Query {
        droid(id: ID!): Droid @cacheControl(maxAge: 60)
      }

      type Droid {
        id: ID!
        name: String!
      }
    `;

    const resolvers: GraphQLResolvers = {
      Query: {
        droid: (_source, { _id }, _context, { cacheControl }) => {
          cacheControl.setCacheHint({ maxAge: 120 });
          return {
            id: 2001,
            name: 'R2-D2'
          };
        }
      }
    };

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const hints = await collectCacheControlHints(
      schema,
      `
        query {
          droid(id: 2001) {
            name
          }
        }
      `
    );

    expect(hints).toContainEqual({ path: ['droid'], maxAge: 120 });
  });
});
