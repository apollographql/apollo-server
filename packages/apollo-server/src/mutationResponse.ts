import {
  GraphQLInterfaceType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString,
  defaultFieldResolver,
} from 'graphql';
import { SchemaDirectiveVisitor } from 'graphql-tools';

const gql = String.raw;

export const typeDefs = gql`
  interface MutationResponse {
    code: String
    message: String
    success: Boolean!
    query: Query
  }
`;

export class MutationResponseDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    const fields = type.getFields();
    const interfaces = type.getInterfaces();

    if (interfaces.find(x => x.toString() === 'MutationResponse')) {
      throw new Error(`
       It looks like when defining type ${type.toString()},
       you implemented the Node interface and also used
       the @node schema directive. When using @node, you don't need
       to implement the Node interface as the directive does it
       for you!
      `);
    }

    // add the node interface
    // XXX this is a hack, it doesn't appear to work correctly
    // in graphql-tools (OR most likely I'm goind it wrong)
    const implementations = (this.schema as any)._implementations;
    if (!implementations.MutationResponse)
      implementations.MutationResponse = [];
    implementations.MutationResponse.push(type);

    fields['code'] = {
      name: 'code',
      type: GraphQLString,
      description: 'Machine readable runtime code of mutation status',
      args: [],
      isDeprecated: false,
      resolve(source) {
        if (source.code) return source.code;
        if (source.source) {
          return source.success ? 204 : 500;
        }
        return null;
      },
    };

    fields['message'] = {
      name: 'message',
      type: GraphQLString,
      description: 'Status of mutation for consumers to read',
      args: [],
      isDeprecated: false,
      resolve(source) {
        if (source.message) return source.message;
        return null;
      },
    };

    fields['success'] = {
      name: 'success',
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'True or false status of success of mutation',
      args: [],
      isDeprecated: false,
      resolve(source) {
        if (source.success) return source.success;
        if (source.code && source.code >= 300) return false;
        // if we didn't throw, lets call this successful
        return true;
      },
    };

    fields['query'] = {
      name: 'query',
      type: this.schema.getType('Query'),
      description: 'The root query for ease of refetching',
      args: [],
      isDeprecated: false,
      resolve(source) {
        return {};
      },
    };
  }
}
