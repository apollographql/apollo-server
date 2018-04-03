import {
  GraphQLInterfaceType,
  GraphQLID,
  GraphQLNonNull,
  defaultFieldResolver,
} from 'graphql';
import { SchemaDirectiveVisitor } from 'graphql-tools';

import { Context } from './types';
import { Connector } from './connector';
const gql = String.raw;

export const typeDefs = gql`
  interface Node {
    id: ID!
  }

  extend type Query {
    node(id: ID!): Node
  }

  directive @node(
    # Which fields to include in the new ID:
    from: String
  ) on OBJECT

  directive @unique on FIELD_DEFINITION
`;

export const resolvers = {
  Query: {
    node: (_, { id }, { Node }) => Node.get(id),
  },
  Node: {
    __resolveType: ({ __type }) => __type,
  },
};

export const toGlobalId = (type: string, id: string): string =>
  Buffer.from(`${type}:${id}`, 'utf8').toString('base64');

export const fromGlobalId = (
  globalId: string,
): { type: string; id: string } => {
  const [type, id] = Buffer.from(globalId, 'base64')
    .toString('utf8')
    .split(':');
  return { type, id };
};

export class NodeDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    const { from = 'id' } = this.args;
    const fields = type.getFields();
    const interfaces = type.getInterfaces();

    if (fields.id) {
      throw new Error(`
       We found a field called id on type ${type.toString()}
       in your schema which also had the schema directive @node
       applied to it. When using @node, you don't need to include
       the id field, as it is added by the @node directive
      `);
    }

    if (interfaces.find(x => x.toString() === 'Node')) {
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
    if (!implementations.Node) implementations.Node = [];
    implementations.Node.push(type);

    // add the id field for them
    fields['id'] = {
      name: 'id',
      type: new GraphQLNonNull(GraphQLID),
      description: 'Globally Unique ID',
      args: [],
      isDeprecated: false,
      resolve(source) {
        const id = String(source[from]);
        if (!id)
          throw new Error(`
          Tried to create global id from ${type.toString()}
          but could not find field ${from} on the source data.
        `);
        return toGlobalId(type.toString(), id);
      },
    };
  }
}

export class UniqueDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const parentType = details.objectType.name;

    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const result = await resolve.apply(this, args);
      return toGlobalId(parentType, result);
    };
  }
}

export class Node {
  private connectors: Record<string, Connector<any>>;
  constructor({ connectors }: Context) {
    this.connectors = connectors;
  }

  async get(encodedId) {
    const { type: __type, id } = fromGlobalId(encodedId);

    if (
      !this.connectors ||
      !this.connectors[__type] ||
      !this.connectors[__type].getById
    ) {
      throw new Error(`
        Error during the resolver for \`node(id: ${id})\`:
          When trying to resolve for type ${__type}, no
          connector was found under the key of ${__type} on
          the context, or the connector did not have a
          getById method that could be found.

          To fix this, create a Connector and add it to the
          context under ${__type}: { [${__type}]: ${__type}Connector }
      `);
    }

    const data = await this.connectors[__type].getById(id);
    if (!data) return null;
    Object.defineProperty(data, '__type', {
      writable: false,
      enumerable: false,
      value: __type,
    });
    return data;
  }
}
