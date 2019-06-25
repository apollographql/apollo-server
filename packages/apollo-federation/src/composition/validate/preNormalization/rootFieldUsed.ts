import {
  GraphQLError,
  visit,
  OperationTypeNode,
  ObjectTypeDefinitionNode,
  ObjectTypeExtensionNode,
} from 'graphql';
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
    [node in OperationTypeNode]: DefaultRootOperationTypeName;
  } = {
    query: 'Query',
    mutation: 'Mutation',
    subscription: 'Subscription',
  };

  // Array of default root operation names
  const defaultRootOperationNames = Object.values(
    defaultRootOperationNameLookup,
  );

  const disallowedTypeNames: {
    [key in DefaultRootOperationTypeName]?: boolean;
  } = {};

  let hasSchemaDefinitionOrExtension = false;
  visit(typeDefs, {
    OperationTypeDefinition(node) {
      // If we find at least one root operation type definition, we know the user has
      // specified either a schema definition or extension.
      hasSchemaDefinitionOrExtension = true;

      if (
        !defaultRootOperationNames.includes(node.type.name
          .value as DefaultRootOperationTypeName)
      ) {
        disallowedTypeNames[
          defaultRootOperationNameLookup[node.operation]
        ] = true;
      }
    },
  });

  // If a schema or schema extension is defined, we need to warn for each improper
  // usage of default root operation names. The conditions for an improper usage are:
  //  1. root operation type is defined as a non-default name (i.e. query: RootQuery)
  //  2. the respective default operation type name is used as a regular type
  if (hasSchemaDefinitionOrExtension) {
    visit(typeDefs, {
      ObjectTypeDefinition: visitType,
      ObjectTypeExtension: visitType,
    });

    function visitType(
      node: ObjectTypeDefinitionNode | ObjectTypeExtensionNode,
    ) {
      if (
        disallowedTypeNames[node.name.value as DefaultRootOperationTypeName]
      ) {
        const rootOperationName = node.name.value;
        errors.push(
          errorWithCode(
            `ROOT_${rootOperationName.toUpperCase()}_USED`,
            logServiceAndType(serviceName, rootOperationName) +
              `Found invalid use of default root operation name \`${rootOperationName}\`. \`${rootOperationName}\` is disallowed when \`Schema.${rootOperationName.toLowerCase()}\` is set to a type other than \`${rootOperationName}\`.`,
          ),
        );
      }
    }
  }

  return errors;
};
