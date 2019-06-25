import { GraphQLSchema, isObjectType, FieldNode, GraphQLError } from 'graphql';

import { logServiceAndType, errorWithCode } from '../../utils';

/**
 * The fields arg in @requires can only reference fields on the base type
 */
export const requiresFieldsMissingOnBase = (schema: GraphQLSchema) => {
  const errors: GraphQLError[] = [];

  const types = schema.getTypeMap();
  for (const [typeName, namedType] of Object.entries(types)) {
    // Only object types have fields
    if (!isObjectType(namedType)) continue;

    // for each field, if there's a requires on it, check that there's a matching
    // @external field, and that the types referenced are from the base type
    for (const [fieldName, field] of Object.entries(namedType.getFields())) {
      const serviceName = field.federation && field.federation.serviceName;

      // serviceName should always exist on fields that have @requires federation data, since
      // the only case where serviceName wouldn't exist is on a base type, and in that case,
      // the `requires` metadata should never get added to begin with. This should be caught in
      // composition work. This kind of error should be validated _before_ composition.
      if (!serviceName) continue;

      if (field.federation && field.federation.requires) {
        const selections = field.federation.requires as FieldNode[];
        for (const selection of selections) {
          // check the selections are from the _base_ type (no serviceName)
          const matchingFieldOnType = namedType.getFields()[
            selection.name.value
          ];

          if (
            matchingFieldOnType &&
            matchingFieldOnType.federation &&
            matchingFieldOnType.federation.serviceName
          ) {
            errors.push(
              errorWithCode(
                'REQUIRES_FIELDS_MISSING_ON_BASE',
                logServiceAndType(serviceName, typeName, fieldName) +
                  `requires the field \`${selection.name.value}\` to be @external. @external fields must exist on the base type, not an extension.`,
              ),
            );
          }
        }
      }
    }
  }

  return errors;
};
