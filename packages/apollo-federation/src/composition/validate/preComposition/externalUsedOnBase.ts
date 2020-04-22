import { visit, GraphQLError } from 'graphql';
import { ServiceDefinition } from '../../types';

import { logServiceAndType, errorWithCode } from '../../utils';

/**
 * - There are no fields with @external on base type definitions
 */
export const externalUsedOnBase = ({
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
              if (name === 'external') {
                errors.push(
                  errorWithCode(
                    'EXTERNAL_USED_ON_BASE',
                    logServiceAndType(
                      serviceName,
                      typeDefinition.name.value,
                      field.name.value,
                    ) +
                      `Found extraneous @external directive. @external cannot be used on base types.`,
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
