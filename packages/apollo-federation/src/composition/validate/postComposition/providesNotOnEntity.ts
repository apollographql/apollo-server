import { GraphQLSchema, isObjectType, GraphQLError } from 'graphql';

import { logServiceAndType, errorWithCode } from '../../utils';

/**
 *  Provides directive can only be added to return types that are entities
 */
export const providesNotOnEntity = (schema: GraphQLSchema) => {
  const errors: GraphQLError[] = [];

  const types = schema.getTypeMap();
  for (const [typeName, namedType] of Object.entries(types)) {
    // Only object types have fields
    if (!isObjectType(namedType)) continue;

    // for each field, if there's a provides on it, check that the containing
    // type has a `key` field under the federation metadata.
    for (const [fieldName, field] of Object.entries(namedType.getFields())) {
      const serviceName = field.federation && field.federation.serviceName;

      // serviceName should always exist on fields that have @provides federation data, since
      // the only case where serviceName wouldn't exist is on a base type, and in that case,
      // the `provides` metadata should never get added to begin with. This should be caught in
      // composition work. This kind of error should be validated _before_ composition.
      if (!serviceName) continue;

      // field has a @provides directive on it
      if (field.federation && field.federation.provides) {
        if (!isObjectType(field.type)) {
          errors.push(
            errorWithCode(
              'PROVIDES_NOT_ON_ENTITY',
              logServiceAndType(serviceName, typeName, fieldName) +
                `uses the @provides directive but \`${typeName}.${fieldName}\` returns \`${field.type}\`, which is not an Object type. @provides can only be used on Object types with at least one @key.`,
            ),
          );
          continue;
        }

        const fieldType = types[field.type.name];
        const selectedFieldIsEntity =
          fieldType.federation && fieldType.federation.keys;

        if (!selectedFieldIsEntity) {
          errors.push(
            errorWithCode(
              'PROVIDES_NOT_ON_ENTITY',
              logServiceAndType(serviceName, typeName, fieldName) +
                `uses the @provides directive but \`${typeName}.${fieldName}\` does not return a type that has a @key. Try adding a @key to the \`${field.type}\` type.`,
            ),
          );
        }
      }
    }
  }

  return errors;
};
