import { GraphQLError, visit, OperationTypeNode } from 'graphql';
import { ServiceDefinition, DefaultRootOperationTypeName } from '../../types';

import { logServiceAndType, errorWithCode } from '../../utils';

/**
 * - When a schema definition or extension is provided, warn user against using
 *    default root operation type names for types or extensions
 *    (Query, Mutation, Subscription)
 */
export const rootFieldUsed = ({
  name: serviceName,
  typeDefs,
}: ServiceDefinition) => {
  const errors: GraphQLError[] = [];

  // Map of OperationTypeNode to its respective default root operation type name
  const defaultRootOperationNameLookup: {
    [node in OperationTypeNode]: DefaultRootOperationTypeName
  } = {
    query: 'Query',
    mutation: 'Mutation',
    subscription: 'Subscription',
  };

  // Array of default root operation names
  const defaultRootOperationNames = Object.values(
    defaultRootOperationNameLookup,
  );

  // Map of the given root operation type names to their respective default operation
  // type names, i.e. {RootQuery: 'Query'}
  const rootOperationTypeMap: {
    [key: string]: DefaultRootOperationTypeName;
  } = Object.create(null);

  let hasSchemaDefinitionOrExtension = false;
  visit(typeDefs, {
    OperationTypeDefinition(node) {
      // If we find at least one root operation type definition, we know the user has
      // specified either a schema definition or extension.
      hasSchemaDefinitionOrExtension = true;
      // Build the map of root operation type name to its respective default
      rootOperationTypeMap[node.type.name.value] =
        defaultRootOperationNameLookup[node.operation];
    },
  });

  // If a schema or schema extension is defined, we need to warn for all usages
  // of default root operation type names.
  if (hasSchemaDefinitionOrExtension) {
    visit(typeDefs, {
      ObjectTypeDefinition(node) {
        if ((defaultRootOperationNames as string[]).includes(node.name.value)) {
          errors.push(
            errorWithCode(
              `ROOT_${node.name.value}_USED`,
              logServiceAndType(serviceName, node.name.value) +
                `Found invalid use of default root operation type \`${
                  node.name.value
                }\`. Default root operation type names (${defaultRootOperationNames.join(
                  ', ',
                )}) are disallowed when a schema is defined or extended within a service.`,
            ),
          );
        }
      },
      ObjectTypeExtension(node) {
        if ((defaultRootOperationNames as string[]).includes(node.name.value)) {
          errors.push(
            errorWithCode(
              `ROOT_${node.name.value}_USED`,
              logServiceAndType(serviceName, node.name.value) +
                `Found invalid use of default root operation type extension \`${
                  node.name.value
                }\`. Default root operation type names (${defaultRootOperationNames.join(
                  ', ',
                )}) are disallowed when a schema is defined or extended within a service.`,
            ),
          );
        }
      },
    });
  }

  return errors;
};
