import gql from 'graphql-tag';
import {
  defaultRootOperationTypes,
  replaceExtendedDefinitionsWithExtensions,
  normalizeTypeDefs,
} from '../normalize';
import { astSerializer } from '../../snapshotSerializers';

expect.addSnapshotSerializer(astSerializer);

describe('SDL normalization and its respective parts', () => {
  describe('defaultRootOperationTypes', () => {
    it('transforms defined root operation types to respective extended default root operation types', () => {
      const typeDefs = gql`
        schema {
          query: RootQuery
          mutation: RootMutation
        }

        type RootQuery {
          product: Product
        }

        type Product {
          sku: String
        }

        type RootMutation {
          updateProduct: Product
        }
      `;

      const schemaWithDefaultedRootOperationTypes = defaultRootOperationTypes(
        typeDefs,
      );
      expect(schemaWithDefaultedRootOperationTypes).toMatchInlineSnapshot(`
        extend type Query {
          product: Product
        }

        type Product {
          sku: String
        }

        extend type Mutation {
          updateProduct: Product
        }
      `);
    });

    it('removes all types using a default root operation type name when a schema definition is provided (root types are defined by the user)', () => {
      const typeDefs = gql`
        schema {
          query: RootQuery
        }

        type RootQuery {
          product: Product
        }

        type Product {
          sku: String
        }

        type Query {
          removeThisEntireType: String
        }

        type Mutation {
          removeThisEntireType: String
        }

        type Subscription {
          removeThisEntireType: String
        }
      `;

      const schemaWithDefaultedRootOperationTypes = defaultRootOperationTypes(
        typeDefs,
      );
      expect(schemaWithDefaultedRootOperationTypes).toMatchInlineSnapshot(`
        extend type Query {
          product: Product
        }

        type Product {
          sku: String
        }
      `);
    });

    it('drops fields that reference an invalid default root operation type name', () => {
      const typeDefs = gql`
        schema {
          query: RootQuery
          mutation: RootMutation
        }

        type RootQuery {
          product: Product
        }

        type Query {
          removeThisEntireType: String
        }

        type RootMutation {
          keepThisField: String
          removeThisField: Query
        }
      `;

      const schemaWithDefaultedRootOperationTypes = defaultRootOperationTypes(
        typeDefs,
      );
      expect(schemaWithDefaultedRootOperationTypes).toMatchInlineSnapshot(`
        extend type Query {
          product: Product
        }

        extend type Mutation {
          keepThisField: String
        }
      `);
    });
  });

  describe('replaceExtendedDefinitionsWithExtensions', () => {
    it('transforms the @extends directive into type extensions', () => {
      const typeDefs = gql`
        type Product @extends @key(fields: "sku") {
          sku: String @external
        }
      `;

      expect(replaceExtendedDefinitionsWithExtensions(typeDefs))
        .toMatchInlineSnapshot(`
        extend type Product @key(fields: "sku") {
          sku: String @external
        }
      `);
    });
  });

  describe('normalizeTypeDefs', () => {
    it('integration', () => {
      const typeDefsToNormalize = gql`
        schema {
          query: RootQuery
          mutation: RootMutation
        }

        type RootQuery {
          product: Product
        }

        type Product @extends @key(fields: "sku") {
          sku: String @external
        }

        type RootMutation {
          updateProduct: Product
        }
      `;

      const normalized = normalizeTypeDefs(typeDefsToNormalize);

      expect(normalized).toMatchInlineSnapshot(`
        extend type Query {
          product: Product
        }

        extend type Product @key(fields: "sku") {
          sku: String @external
        }

        extend type Mutation {
          updateProduct: Product
        }
      `);
    });

    it('should allow schema describing default types', () => {
      const typeDefsToNormalize = gql`
        schema {
          query: Query
          mutation: Mutation
        }

        type Query {
          product: Product
        }

        type Product @extends @key(fields: "sku") {
          sku: String @external
        }

        type Mutation {
          updateProduct: Product
        }
      `;

      const normalized = normalizeTypeDefs(typeDefsToNormalize);

      expect(normalized).toMatchInlineSnapshot(`
        extend type Query {
          product: Product
        }

        extend type Product @key(fields: "sku") {
          sku: String @external
        }

        extend type Mutation {
          updateProduct: Product
        }
      `);
    });
  });
});
