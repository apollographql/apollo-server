import gql from 'graphql-tag';
import { GraphQLResolverMap } from 'apollo-graphql';

export const name = 'books';
export const typeDefs = gql`
  extend type Query {
    book(isbn: String!): Book
  }

  type Library @key(fields: "id") {
    id: ID!
    name: String
  }

  # FIXME: turn back on when unions are supported in composition
  # type LibraryAccount @key(fields: "id") {
  #   id: ID!
  #   library: Library
  # }

  # extend union AccountType = LibraryAccount

  type Book @key(fields: "isbn") {
    isbn: String!
    title: String
    year: Int
  }
`;

const libraries = [{ id: '1', name: 'NYC Public Library' }];
const books = [
  {
    isbn: '0262510871',
    title: 'Structure and Interpretation of Computer Programs',
    year: 1996,
  },
  {
    isbn: '0136291554',
    title: 'Object Oriented Software Construction',
    year: 1997,
  },
  {
    isbn: '0201633612',
    title: 'Design Patterns',
    year: 1995,
  },
];

export const resolvers: GraphQLResolverMap<any> = {
  Book: {
    __resolveObject(object) {
      return books.find(book => book.isbn === object.isbn);
    },
  },
  Library: {
    __resolveReference(object) {
      return libraries.find(library => library.id === object.id);
    },
  },
  Query: {
    book(_, args) {
      return { isbn: args.isbn };
    },
  },
};
