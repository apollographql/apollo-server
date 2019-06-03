import { visit, GraphQLError } from 'graphql';
import { ServiceDefinition } from '../../types';

import {
  logServiceAndType,
  errorWithCode,
  findDirectivesOnTypeOrField,
} from '../../utils';

/**
 * - There are no fields with @external on base type definitions
 */
export const externalUsedOnBase = ({
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
              if (name === 'external') {
                errors.push(
                  errorWithCode(
                    'EXTERNAL_USED_ON_BASE',
                    logServiceAndType(
                      serviceName,
                      node.name.value,
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
