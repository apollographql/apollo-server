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

  type UserMetadata {
    name: String
    address: String
    description: String
  }

  type User @key(fields: "id") {
    id: ID!
    name: String
    username: String
    birthDate(locale: String): String
    account: AccountType
    metadata: [UserMetadata]
  }

  extend type Mutation {
    login(username: String!, password: String!): User
  }

  extend type Library @key(fields: "id") {
    id: ID! @external
    name: String @external
    userAccount(id: ID! = "1"): User @requires(fields: "name")
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

const metadata = [
  {
    id: '1',
    metadata: [{ name: 'meta1', address: '1', description: '2' }],
  },
  {
    id: '2',
    metadata: [{ name: 'meta2', address: '3', description: '4' }],
  },
];

const libraryUsers: { [name: string]: string[] } = {
  'NYC Public Library': ['1', '2'],
};

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
    metadata(object) {
      const metaIndex = metadata.findIndex(m => m.id === object.id);
      return metadata[metaIndex].metadata.map(obj => ({ name: obj.name }));
    },
  },
  UserMetadata: {
    address(object) {
      const metaIndex = metadata.findIndex(m =>
        m.metadata.find(o => o.name === object.name),
      );
      return metadata[metaIndex].metadata[0].address;
    },
    description(object) {
      const metaIndex = metadata.findIndex(m =>
        m.metadata.find(o => o.name === object.name),
      );
      return metadata[metaIndex].metadata[0].description;
    },
  },
  Library: {
    userAccount({ name }, { id: userId }) {
      const libraryUserIds = libraryUsers[name];
      return libraryUserIds &&
        libraryUserIds.find((id: string) => id === userId)
        ? { id: userId }
        : null;
    },
  },
  Mutation: {
    login(_, args) {
      return users.find(user => user.username === args.username);
    },
  },
};
