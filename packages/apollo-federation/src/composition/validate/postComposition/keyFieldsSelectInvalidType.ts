import {
  GraphQLSchema,
  isObjectType,
  FieldNode,
  isInterfaceType,
  isNonNullType,
  getNullableType,
  isUnionType,
  GraphQLError,
} from 'graphql';

import { logServiceAndType, errorWithCode } from '../../utils';

/**
 * - The fields argument can not have root fields that result in a list
 * - The fields argument can not have root fields that result in an interface
 * - The fields argument can not have root fields that result in a union type
 */
export const keyFieldsSelectInvalidType = (schema: GraphQLSchema) => {
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
            if (!matchingField) {
              errors.push(
                errorWithCode(
                  'KEY_FIELDS_SELECT_INVALID_TYPE',
                  logServiceAndType(serviceName, typeName) +
                    `A @key selects ${name}, but ${typeName}.${name} could not be found`,
                ),
              );
            }

            if (matchingField) {
              if (
                isInterfaceType(matchingField.type) ||
                (isNonNullType(matchingField.type) &&
                  isInterfaceType(getNullableType(matchingField.type)))
              ) {
                errors.push(
                  errorWithCode(
                    'KEY_FIELDS_SELECT_INVALID_TYPE',
                    logServiceAndType(serviceName, typeName) +
                      `A @key selects ${typeName}.${name}, which is an interface type. Keys cannot select interfaces.`,
                  ),
                );
              }

              if (
                isUnionType(matchingField.type) ||
                (isNonNullType(matchingField.type) &&
                  isUnionType(getNullableType(matchingField.type)))
              ) {
                errors.push(
                  errorWithCode(
                    'KEY_FIELDS_SELECT_INVALID_TYPE',
                    logServiceAndType(serviceName, typeName) +
                      `A @key selects ${typeName}.${name}, which is a union type. Keys cannot select union types.`,
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
