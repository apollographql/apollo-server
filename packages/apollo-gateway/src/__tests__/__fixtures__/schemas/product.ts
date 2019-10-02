import gql from 'graphql-tag';
import { GraphQLResolverMap } from 'apollo-graphql';

export const name = 'product';
export const typeDefs = gql`
  extend type Query {
    product(upc: String!): Product
    topProducts(first: Int = 5): [Product]
    topCars(first: Int = 5): [Car]
  }

  type Ikea {
    asile: Int
  }

  type Amazon {
    referrer: String
  }

  union Brand = Ikea | Amazon

  interface Product {
    upc: String!
    sku: String!
    name: String
    price: String
  }

  type Furniture implements Product @key(fields: "upc") @key(fields: "sku") {
    upc: String!
    sku: String!
    name: String
    price: String
    brand: Brand
    metadata: [MetadataOrError]
  }

  extend type Book implements Product @key(fields: "isbn") {
    isbn: String! @external
    title: String @external
    year: Int @external
    upc: String!
    sku: String!
    name(delimeter: String = " "): String @requires(fields: "title year")
    price: String
  }

  type Car @key(fields: "id") {
    id: String!
    price: String
  }

  # Value type
  type KeyValue {
    key: String!
    value: String!
  }

  # Value type
  type Error {
    code: Int
    message: String
  }

  # Value type
  union MetadataOrError = KeyValue | Error
`;

const products = [
  {
    __typename: 'Furniture',
    upc: '1',
    sku: 'TABLE1',
    name: 'Table',
    price: 899,
    brand: {
      __typename: 'Ikea',
      asile: 10,
    },
    metadata: [{ key: 'Condition', value: 'excellent' }],
  },
  {
    __typename: 'Furniture',
    upc: '2',
    sku: 'COUCH1',
    name: 'Couch',
    price: 1299,
    brand: {
      __typename: 'Amazon',
      referrer: 'https://canopy.co',
    },
    metadata: [{ key: 'Condition', value: 'used' }],
  },
  {
    __typename: 'Furniture',
    upc: '3',
    sku: 'CHAIR1',
    name: 'Chair',
    price: 54,
    brand: {
      __typename: 'Ikea',
      asile: 10,
    },
    metadata: [{ key: 'Condition', value: 'like new' }],
  },
  { __typename: 'Book', isbn: '0262510871', price: 39 },
  { __typename: 'Book', isbn: '0136291554', price: 29 },
  { __typename: 'Book', isbn: '0201633612', price: 49 },
  { __typename: 'Book', isbn: '1234567890', price: 59 },
  { __typename: 'Book', isbn: '404404404', price: 0 },
  { __typename: 'Book', isbn: '0987654321', price: 29 },
];

const cars = [
  {
    __typename: 'Car',
    id: '1',
    price: 9990,
  },
  {
    __typename: 'Car',
    id: '2',
    price: 12990,
  },
];

export const resolvers: GraphQLResolverMap<any> = {
  Furniture: {
    __resolveReference(object) {
      return products.find(
        product => product.upc === object.upc || product.sku === object.sku,
      );
    },
  },
  Book: {
    __resolveReference(object) {
      if (object.isbn) {
        const fetchedObject = products.find(
          product => product.isbn === object.isbn,
        );
        if (fetchedObject) {
          return { ...object, ...fetchedObject };
        }
      }
      return object;
    },
    name(object, { delimeter }) {
      return `${object.title}${delimeter}(${object.year})`;
    },
    upc(object) {
      return object.isbn;
    },
    sku(object) {
      return object.isbn;
    },
  },
  Car: {
    __resolveReference(object) {
      return cars.find(car => car.id === object.id);
    },
  },
  Query: {
    product(_, args) {
      return products.find(product => product.upc === args.upc);
    },
    topProducts(_, args) {
      return products.slice(0, args.first);
    },
  },
  MetadataOrError: {
    __resolveType(object) {
      return 'key' in object ? 'KeyValue' : 'Error';
    },
  },
};
