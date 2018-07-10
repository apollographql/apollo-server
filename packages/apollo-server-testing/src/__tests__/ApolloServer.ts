import { Headers } from 'apollo-server-env';
import { gql, ApolloServer } from '../';
import { TracesReport } from '../../../../node_modules/apollo-engine-reporting-protobuf';

const typeDefs = gql`
  type Query {
    hello(world: String): String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hi',
  },
};

describe('apollo-server-testing', () => {
  describe('constructor', () => {
    it('accepts typeDefs and resolvers', () => {
      expect(() => new ApolloServer({ typeDefs, resolvers })).not.toThrow();
    });

    it('accepts typeDefs and mocks', () => {
      expect(() => new ApolloServer({ typeDefs, mocks: true })).not.toThrow();
    });
  });

  describe('without registerServer', () => {
    // let server: ApolloServer;

    it('can be queried', async () => {
      let server = new ApolloServer({
        typeDefs,
        resolvers,
      });

      const query = `{ hello }`;

      let result = await server.execute(query);
      expect(result.data).toEqual({ hello: 'hi' });
    });

    it('returns errors properly', async () => {
      let server = new ApolloServer({
        typeDefs,
        resolvers,
      });

      // world doesn't exist in typeDefs
      const query = `{ world }`;

      let result = await server.execute(query);
      expect(result.errors).toBeDefined();
      expect(result.data).not.toBeDefined();
    });

    it('passes variables properly', async done => {
      let testResolvers = {
        Query: {
          hello: (_, args) => {
            expect(args.world).toEqual('wow');
            done();
            return 'hiya';
          },
        },
      };

      let server = new ApolloServer({
        typeDefs,
        resolvers: testResolvers,
      });

      const query = `
        query test($world: String){
          hello(world: $world)
        }
      `;

      const res = await server.execute(query, { world: 'wow' });
    });

    it('passes headers properly', async done => {
      let server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
          console.log(req.headers.get('authorization'));
          done();
          return {};
        },
      });

      const query = `{ hello }`;

      await server.execute(query, null, { authorization: 'foo' });
    });
  });
});
