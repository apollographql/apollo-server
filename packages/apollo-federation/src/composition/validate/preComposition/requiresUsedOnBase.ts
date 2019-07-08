import { GraphQLError, visit } from 'graphql';
import { ServiceDefinition } from '../../types';

import { logServiceAndType, errorWithCode } from '../../utils';

/**
 * - There are no fields with @requires on base type definitions
 */
export const requiresUsedOnBase = ({
  name: serviceName,
  typeDefs,
}: ServiceDefinition) => {
  const errors: GraphQLError[] = [];

  visit(typeDefs, {
    ObjectTypeDefinition(typeDefinition) {
      if (typeDefinition.fields) {
        for (const field of typeDefinition.fields) {
          if (field.directives) {
            for (const directive of field.directives) {
              const name = directive.name.value;
              if (name === 'requires') {
                errors.push(
                  errorWithCode(
                    'REQUIRES_USED_ON_BASE',
                    logServiceAndType(
                      serviceName,
                      typeDefinition.name.value,
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
