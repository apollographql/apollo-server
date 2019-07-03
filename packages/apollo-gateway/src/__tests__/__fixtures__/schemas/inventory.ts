import gql from 'graphql-tag';
import { GraphQLResolverMap } from 'apollo-graphql';

export const name = 'inventory';
export const typeDefs = gql`
  extend interface Product {
    inStock: Boolean
  }

  extend type Furniture implements Product @key(fields: "sku") {
    sku: String! @external
    inStock: Boolean
    isHeavy: Boolean
  }

  extend type Book implements Product @key(fields: "isbn") {
    isbn: String! @external
    inStock: Boolean
    isCheckedOut: Boolean
  }

  extend type UserMetadata {
    description: String @external
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    metadata: [UserMetadata] @external
    goodDescription: Boolean @requires(fields: "metadata { description }")
  }
`;

const inventory = [
  { sku: 'TABLE1', inStock: true, isHeavy: false },
  { sku: 'COUCH1', inStock: false, isHeavy: true },
  { sku: 'CHAIR1', inStock: true, isHeavy: false },
  { isbn: '0262510871', inStock: true, isCheckedOut: true },
  { isbn: '0136291554', inStock: false, isCheckedOut: false },
  { isbn: '0201633612', inStock: true, isCheckedOut: false },
];

export const resolvers: GraphQLResolverMap<any> = {
  Furniture: {
    __resolveReference(object) {
      return inventory.find(product => product.sku === object.sku);
    },
  },
  Book: {
    __resolveReference(object) {
      return inventory.find(product => product.isbn === object.isbn);
    },
  },
  User: {
    goodDescription(object) {
      return object.metadata[0].description === '2';
    },
  },
};
