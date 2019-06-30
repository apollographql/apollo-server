import gql from 'graphql-tag';
import { GraphQLResolverMap } from 'apollo-graphql';

export const name = 'accounts';
export const typeDefs = gql`
  extend type Query {
    user(id: ID!): User
    me: User
  }

  type PasswordAccount @key(fields: "email") {
    email: String!
  }

  type SMSAccount @key(fields: "number") {
    number: String
  }

  union AccountType = PasswordAccount | SMSAccount

  type User @key(fields: "id") {
    id: ID!
    name: String
    username: String
    birthDate(locale: String): String
    account: AccountType
  }

  extend type Mutation {
    login(username: String!, password: String!): User
  }
`;

const users = [
  {
    id: '1',
    name: 'Ada Lovelace',
    birthDate: '1815-12-10',
    username: '@ada',
    account: { __typename: 'LibraryAccount', id: '1' },
  },
  {
    id: '2',
    name: 'Alan Turing',
    birthDate: '1912-06-23',
    username: '@complete',
    account: { __typename: 'SMSAccount', number: '8675309' },
  },
];

export const resolvers: GraphQLResolverMap<any> = {
  Query: {
    user(_, args) {
      return { id: args.id };
    },

    me() {
      return { id: '1' };
    },
  },
  User: {
    __resolveObject(object) {
      return users.find(user => user.id === object.id);
    },
    birthDate(user, args) {
      return args.locale
        ? new Date(user.birthDate).toLocaleDateString(args.locale, {
            timeZone: 'Asia/Samarkand', // UTC + 5
          })
        : user.birthDate;
    },
  },
  Mutation: {
    login(_, args) {
      return users.find(user => user.username === args.username);
    },
  },
};
