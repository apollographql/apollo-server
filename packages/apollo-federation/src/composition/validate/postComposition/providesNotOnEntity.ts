import {
  isObjectType,
  GraphQLError,
  isListType,
  isNonNullType,
} from 'graphql';
import { logServiceAndType, errorWithCode, getFederationMetadata } from '../../utils';
import { PostCompositionValidator } from '.';

/**
 *  Provides directive can only be added to return types that are entities
 */
export const providesNotOnEntity: PostCompositionValidator = ({ schema }) => {
  const errors: GraphQLError[] = [];

  const types = schema.getTypeMap();
  for (const [typeName, namedType] of Object.entries(types)) {
    // Only object types have fields
    if (!isObjectType(namedType)) continue;

    // for each field, if there's a provides on it, check that the containing
    // type has a `key` field under the federation metadata.
    for (const [fieldName, field] of Object.entries(namedType.getFields())) {
      const fieldFederationMetadata = getFederationMetadata(field)
      const serviceName = fieldFederationMetadata?.serviceName;

      // serviceName should always exist on fields that have @provides federation data, since
      // the only case where serviceName wouldn't exist is on a base type, and in that case,
      // the `provides` metadata should never get added to begin with. This should be caught in
      // composition work. This kind of error should be validated _before_ composition.
      if (
        !serviceName &&
        fieldFederationMetadata?.provides &&
        !fieldFederationMetadata?.belongsToValueType
      )
        throw Error(
          'Internal Consistency Error: field with provides information does not have service name.',
        );
      if (!serviceName) continue;

      const getBaseType = (type: any): any =>
        isListType(type) || isNonNullType(type)
          ? getBaseType(type.ofType)
          : type;
      const baseType = getBaseType(field.type);

      // field has a @provides directive on it
      if (fieldFederationMetadata?.provides) {
        if (!isObjectType(baseType)) {
          errors.push(
            errorWithCode(
              'PROVIDES_NOT_ON_ENTITY',
              logServiceAndType(serviceName, typeName, fieldName) +
                `uses the @provides directive but \`${typeName}.${fieldName}\` returns \`${field.type}\`, which is not an Object or List type. @provides can only be used on Object types with at least one @key, or Lists of such Objects.`,
            ),
          );
          continue;
        }

        const fieldType = types[baseType.name];
        const selectedFieldIsEntity = getFederationMetadata(fieldType)?.keys;

        if (!selectedFieldIsEntity) {
          errors.push(
            errorWithCode(
              'PROVIDES_NOT_ON_ENTITY',
              logServiceAndType(serviceName, typeName, fieldName) +
                `uses the @provides directive but \`${typeName}.${fieldName}\` does not return a type that has a @key. Try adding a @key to the \`${baseType}\` type.`,
            ),
          );
        }
      }
    }
  }

  return errors;
};
