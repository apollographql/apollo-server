import { GraphQLSchema, isObjectType, FieldNode, GraphQLError } from 'graphql';

import { logServiceAndType, errorWithCode } from '../../utils';

/**
 * - The fields argument can not select fields that were overwritten by another service
 */
export const keyFieldsMissingOnBase = (schema: GraphQLSchema) => {
  const errors: GraphQLError[] = [];

  const types = schema.getTypeMap();
  for (const [typeName, namedType] of Object.entries(types)) {
    if (!isObjectType(namedType)) continue;

    if (namedType.federation && namedType.federation.keys) {
      const allFieldsInType = namedType.getFields();
      for (const [serviceName, selectionSets] of Object.entries(
        namedType.federation.keys,
      )) {
        for (const selectionSet of selectionSets) {
          for (const field of selectionSet as FieldNode[]) {
            const name = field.name.value;

            // find corresponding field for each selected field
            const matchingField = allFieldsInType[name];

            // NOTE: We don't need to warn if there is no matching field.
            // keyFieldsSelectInvalidType already does that :)

            if (matchingField) {
              // warn if not from base type OR IF IT WAS OVERWITTEN
              if (
                matchingField.federation &&
                matchingField.federation.serviceName
              ) {
                errors.push(
                  errorWithCode(
                    'KEY_FIELDS_MISSING_ON_BASE',
                    logServiceAndType(serviceName, typeName) +
                      `A @key selects ${name}, but ${typeName}.${name} was either created or overwritten by ${matchingField.federation.serviceName}, not ${serviceName}`,
                  ),
                );
              }
            }
          }
        }
      }
    }
  }

  return errors;
};
