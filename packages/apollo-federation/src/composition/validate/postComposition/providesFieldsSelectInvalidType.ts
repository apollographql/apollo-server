import {
  GraphQLError,
  isObjectType,
  FieldNode,
  isListType,
  isInterfaceType,
  isNonNullType,
  getNullableType,
  isUnionType,
} from 'graphql';
import { logServiceAndType, errorWithCode, getFederationMetadata } from '../../utils';
import { PostCompositionValidator } from '.';

/**
 * - The fields argument can not have root fields that result in a list
 * - The fields argument can not have root fields that result in an interface
 * - The fields argument can not have root fields that result in a union type
 */
export const providesFieldsSelectInvalidType: PostCompositionValidator = ({
  schema,
}) => {
  const errors: GraphQLError[] = [];

  const types = schema.getTypeMap();
  for (const [typeName, namedType] of Object.entries(types)) {
    if (!isObjectType(namedType)) continue;

    // for each field, if there's a provides on it, check the type of the field
    // it references
    for (const [fieldName, field] of Object.entries(namedType.getFields())) {
      const fieldFederationMetadata = getFederationMetadata(field);
      const serviceName = fieldFederationMetadata?.serviceName;

      // serviceName should always exist on fields that have @provides federation data, since
      // the only case where serviceName wouldn't exist is on a base type, and in that case,
      // the `provides` metadata should never get added to begin with. This should be caught in
      // composition work. This kind of error should be validated _before_ composition.
      if (!serviceName) continue;

      const fieldType = field.type;
      if (!isObjectType(fieldType)) continue;
      const allFields = fieldType.getFields();

      if (fieldFederationMetadata?.provides) {
        const selections = fieldFederationMetadata.provides as FieldNode[];
        for (const selection of selections) {
          const name = selection.name.value;
          const matchingField = allFields[name];
          if (!matchingField) {
            errors.push(
              errorWithCode(
                'PROVIDES_FIELDS_SELECT_INVALID_TYPE',
                logServiceAndType(serviceName, typeName, fieldName) +
                  `A @provides selects ${name}, but ${fieldType.name}.${name} could not be found`,
              ),
            );
            continue;
          }

          if (
            isListType(matchingField.type) ||
            (isNonNullType(matchingField.type) &&
              isListType(getNullableType(matchingField.type)))
          ) {
            errors.push(
              errorWithCode(
                'PROVIDES_FIELDS_SELECT_INVALID_TYPE',
                logServiceAndType(serviceName, typeName, fieldName) +
                  `A @provides selects ${fieldType.name}.${name}, which is a list type. A field cannot @provide lists.`,
              ),
            );
          }
          if (
            isInterfaceType(matchingField.type) ||
            (isNonNullType(matchingField.type) &&
              isInterfaceType(getNullableType(matchingField.type)))
          ) {
            errors.push(
              errorWithCode(
                'PROVIDES_FIELDS_SELECT_INVALID_TYPE',
                logServiceAndType(serviceName, typeName, fieldName) +
                  `A @provides selects ${fieldType.name}.${name}, which is an interface type. A field cannot @provide interfaces.`,
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
                'PROVIDES_FIELDS_SELECT_INVALID_TYPE',
                logServiceAndType(serviceName, typeName, fieldName) +
                  `A @provides selects ${fieldType.name}.${name}, which is a union type. A field cannot @provide union types.`,
              ),
            );
          }
        }
      }
    }
  }

  return errors;
};
