import { GraphQLError, visit } from 'graphql';
import { ServiceDefinition } from '../../types';
import { logServiceAndType, errorWithCode } from '../../utils';

const reservedRootFields = ['_service', '_entities'];

/**
 * - Schemas should not define the _service or _entitites fields on the query root
 */
export const reservedFieldUsed = ({
  name: serviceName,
  typeDefs,
}: ServiceDefinition) => {
  const errors: GraphQLError[] = [];

  let rootQueryName = 'Query';
  visit(typeDefs, {
    // find the Query type if redefined
    OperationTypeDefinition(node) {
      if (node.operation === 'query') {
        rootQueryName = node.type.name.value;
      }
    },
  });

  visit(typeDefs, {
    ObjectTypeDefinition(node) {
      if (node.name.value === rootQueryName && node.fields) {
        for (const field of node.fields) {
          const { value: fieldName } = field.name;
          if (reservedRootFields.includes(fieldName)) {
            errors.push(
              errorWithCode(
                'RESERVED_FIELD_USED',
                logServiceAndType(serviceName, rootQueryName, fieldName) +
                  `${fieldName} is a field reserved for federation and can\'t be used at the Query root.`,
              ),
            );
          }
        }
      }
    },
  });

  return errors;
};
