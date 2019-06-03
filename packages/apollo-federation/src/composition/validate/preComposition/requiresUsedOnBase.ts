import { GraphQLError, visit } from 'graphql';
import { ServiceDefinition } from '../../types';
import {
  logServiceAndType,
  errorWithCode,
  findDirectivesOnTypeOrField,
} from '../../utils';

/**
 * - There are no fields with @requires on base type definitions
 */
export const requiresUsedOnBase = ({
  name: serviceName,
  typeDefs,
}: ServiceDefinition) => {
  const errors: GraphQLError[] = [];

  visit(typeDefs, {
    ObjectTypeDefinition(node) {
      // This is actually a type extension via the @extends directive
      if (findDirectivesOnTypeOrField(node, 'extends').length > 0) {
        return;
      }

      if (node.fields) {
        for (const field of node.fields) {
          if (field.directives) {
            for (const directive of field.directives) {
              const name = directive.name.value;
              if (name === 'requires') {
                errors.push(
                  errorWithCode(
                    'REQUIRES_USED_ON_BASE',
                    logServiceAndType(
                      serviceName,
                      node.name.value,
                      field.name.value,
                    ) +
                      `Found extraneous @requires directive. @requires cannot be used on base types.`,
                  ),
                );
              }
            }
          }
        }
      }
    },
  });

  return errors;
};
