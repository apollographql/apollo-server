import { GraphQLResolverMap } from 'apollo-graphql';
import gql from 'graphql-tag';

export const name = 'reviews';
export const typeDefs = gql`
  extend type Query {
    topReviews(first: Int = 5): [Review]
  }

  type Review @key(fields: "id") {
    id: ID!
    body(format: Boolean = false): String
    author: User @provides(fields: "username")
    product: Product
  }

  input UpdateReviewInput {
    id: ID!
    body: String
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    username: String @external
    reviews: [Review]
    numberOfReviews: Int!
  }

  extend interface Product {
    reviews: [Review]
  }

  extend type Furniture implements Product @key(fields: "upc") {
    upc: String! @external
    reviews: [Review]
  }

  extend type Book implements Product @key(fields: "isbn") {
    isbn: String! @external
    reviews: [Review]
    similarBooks: [Book!]! @external
    relatedReviews: [Review!]! @requires(fields: "similarBooks { isbn }")
  }

  extend type Mutation {
    reviewProduct(upc: String!, body: String!): Product
    updateReview(review: UpdateReviewInput!): Review
    deleteReview(id: ID!): Boolean
  }
`;

const usernames = [
  { id: '1', username: '@ada' },
  { id: '2', username: '@complete' },
];
const reviews = [
  {
    id: '1',
    authorID: '1',
    product: { __typename: 'Furniture', upc: '1' },
    body: 'Love it!',
  },
  {
    id: '2',
    authorID: '1',
    product: { __typename: 'Furniture', upc: '2' },
    body: 'Too expensive.',
  },
  {
    id: '3',
    authorID: '2',
    product: { __typename: 'Furniture', upc: '3' },
    body: 'Could be better.',
  },
  {
    id: '4',
    authorID: '2',
    product: { __typename: 'Furniture', upc: '1' },
    body: 'Prefer something else.',
  },
  {
    id: '4',
    authorID: '2',
    product: { __typename: 'Book', isbn: '0262510871' },
    body: 'Wish I had read this before.',
  },
  {
    id: '5',
    authorID: '2',
    product: { __typename: 'Book', isbn: '0136291554' },
    body: 'A bit outdated.',
  },
  {
    id: '6',
    authorID: '1',
    product: { __typename: 'Book', isbn: '0201633612' },
    body: 'A classic.',
  },
];

export const resolvers: GraphQLResolverMap<any> = {
  Query: {
    review(_, args) {
      return { id: args.id };
    },
    topReviews(_, args) {
      return reviews.slice(0, args.first);
    },
  },
  Mutation: {
    reviewProduct(_, { upc, body }) {
      const id = `${Number(reviews[reviews.length - 1].id) + 1}`;
      reviews.push({
        id,
        authorID: '1',
        product: { __typename: 'Furniture', upc },
        body,
      });
      return { upc, __typename: 'Furniture' };
    },
    updateReview(_, { review: { id }, review: updatedReview }) {
      let review = reviews.find(review => review.id === id);

      if (!review) {
        return null;
      }

      review = {
        ...review,
        ...updatedReview,
      };

      return review;
    },
    deleteReview(_, { id }) {
      const deleted = reviews.splice(
        reviews.findIndex(review => review.id === id),
        1,
      );
      return Boolean(deleted);
    },
  },
  Review: {
    author(review) {
      return { __typename: 'User', id: review.authorID };
    },
  },
  User: {
    reviews(user) {
      return reviews.filter(review => review.authorID === user.id);
    },
    numberOfReviews(user) {
      return reviews.filter(review => review.authorID === user.id).length;
    },
    username(user) {
      const found = usernames.find(username => username.id === user.id);
      return found ? found.username : null;
    },
  },
  Furniture: {
    reviews(product) {
      return reviews.filter(review => review.product.upc === product.upc);
    },
  },
  Book: {
    reviews(product) {
      return reviews.filter(review => review.product.isbn === product.isbn);
    },
    relatedReviews(book) {
      return book.similarBooks
        ? book.similarBooks
            .map(({ isbn }: any) =>
              reviews.filter(review => review.product.isbn === isbn),
            )
            .flat()
        : [];
    },
  },
};
