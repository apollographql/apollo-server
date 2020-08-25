import { isObjectType, GraphQLError, SelectionNode } from 'graphql';
import {
  logServiceAndType,
  errorWithCode,
  getFederationMetadata,
} from '../../utils';
import { PostCompositionValidator } from '.';
import { printWithReducedWhitespace } from '../../../service';

/**
 *  1. KEY_MISSING_ON_BASE - Originating types must specify at least 1 @key directive
 *  2. MULTIPLE_KEYS_ON_EXTENSION - Extending services may not use more than 1 @key directive
 *  3. KEY_NOT_SPECIFIED - Extending services must use a valid @key specified by the originating type
 */
export const keysMatchBaseService: PostCompositionValidator = function ({
  schema,
}) {
  const errors: GraphQLError[] = [];
  const types = schema.getTypeMap();
  for (const [parentTypeName, parentType] of Object.entries(types)) {
    // Only object types have fields
    if (!isObjectType(parentType)) continue;

    const typeFederationMetadata = getFederationMetadata(parentType);

    if (typeFederationMetadata) {
      const { serviceName, keys } = typeFederationMetadata;

      if (serviceName && keys) {
        if (!keys[serviceName]) {
          errors.push(
            errorWithCode(
              'KEY_MISSING_ON_BASE',
              logServiceAndType(serviceName, parentTypeName) +
                `appears to be an entity but no @key directives are specified on the originating type.`,
            ),
          );
          continue;
        }

        const availableKeys = keys[serviceName].map(printFieldSet);
        Object.entries(keys)
          // No need to validate that the owning service matches its specified keys
          .filter(([service]) => service !== serviceName)
          .forEach(([extendingService, keyFields]) => {
            // Extensions can't specify more than one key
            if (keyFields.length > 1) {
              errors.push(
                errorWithCode(
                  'MULTIPLE_KEYS_ON_EXTENSION',
                  logServiceAndType(extendingService, parentTypeName) +
                    `is extended from service ${serviceName} but specifies multiple @key directives. Extensions may only specify one @key.`,
                ),
              );
              return;
            }

            // This isn't representative of an invalid graph, but it is an existing
            // limitation of the query planner that we want to validate against for now.
            // In the future, `@key`s just need to be "reachable" through a number of
            // services which can link one key to another via "joins".
            const extensionKey = printFieldSet(keyFields[0]);
            if (!availableKeys.includes(extensionKey)) {
              errors.push(
                errorWithCode(
                  'KEY_NOT_SPECIFIED',
                  logServiceAndType(extendingService, parentTypeName) +
                    `extends from ${serviceName} but specifies an invalid @key directive. Valid @key directives are specified by the originating type. Available @key directives for this type are:\n` +
                    `\t${availableKeys
                      .map((fieldSet) => `@key(fields: "${fieldSet}")`)
                      .join('\n\t')}`,
                ),
              );
              return;
            }
          });
      }
    }
  }

  return errors;
};

function printFieldSet(selections: readonly SelectionNode[]): string {
  return selections.map(printWithReducedWhitespace).join(' ');
}
