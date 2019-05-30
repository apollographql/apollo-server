import { GraphQLSchema, isObjectType, GraphQLError } from 'graphql';

import {
  findDirectivesOnTypeOrField,
  logServiceAndType,
  hasMatchingFieldInDirectives,
  errorWithCode,
  findTypesContainingFieldWithReturnType,
} from '../../utils';

/**
 *  for every @external field, there should be a @requires, @key, or @provides
 *  directive that uses it
 */
export const externalUnused = (schema: GraphQLSchema) => {
  const errors: GraphQLError[] = [];
  const types = schema.getTypeMap();
  for (const [typeName, namedType] of Object.entries(types)) {
    // Only object types have fields
    if (!isObjectType(namedType)) continue;

    // If externals is populated, we need to look at each one and confirm
    // it is used
    if (namedType.federation && namedType.federation.externals) {
      // loop over every service that has extensions with @external
      for (const [serviceName, externalFieldsForService] of Object.entries(
        namedType.federation.externals,
      )) {
        // for a single service, loop over the external fields.
        for (const { field: externalField } of externalFieldsForService) {
          const externalFieldName = externalField.name.value;
          const allFields = namedType.getFields();

          const hasMatchingKeyOnType = Boolean(
            hasMatchingFieldInDirectives({
              directives: findDirectivesOnTypeOrField(namedType.astNode, 'key'),
              fieldNameToMatch: externalFieldName,
              namedType,
            }),
          );

          const hasMatchingProvidesOrRequires = Object.values(allFields).some(
            maybeProvidesField => {
              const fieldOwner =
                maybeProvidesField.federation &&
                maybeProvidesField.federation.serviceName;

              if (fieldOwner !== serviceName) return false;

              // if the provides is located directly on the type
              // type User { username: String, user: User @provides(fields: "username") }
              let providesDirectives = findDirectivesOnTypeOrField(
                maybeProvidesField.astNode,
                'provides',
              );

              /*
                @provides is most commonly used from another type than where
                the @external directive is applied. We need to find all
                fields on any type in the schema that return this type
                and see if they have a provides directive that uses this
                external field

                type Review {
                  author: User @provides(fields: "username")
                }

                extend type User @key(fields: "id") {
                  id: ID! @external
                  username: String @external
                  reviews: [Review]
                }
              */
              findTypesContainingFieldWithReturnType(
                schema,
                maybeProvidesField,
              ).map(childType => {
                const fields = childType.getFields();
                Object.values(fields).forEach(
                  maybeProvidesFieldFromChildType => {
                    providesDirectives = providesDirectives.concat(
                      findDirectivesOnTypeOrField(
                        maybeProvidesFieldFromChildType.astNode,
                        'provides',
                      ),
                    );
                  },
                );
              });

              const requiresDirectives = findDirectivesOnTypeOrField(
                maybeProvidesField.astNode,
                'requires',
              );

              return (
                hasMatchingFieldInDirectives({
                  directives: providesDirectives,
                  fieldNameToMatch: externalFieldName,
                  namedType,
                }) ||
                hasMatchingFieldInDirectives({
                  directives: requiresDirectives,
                  fieldNameToMatch: externalFieldName,
                  namedType,
                })
              );
            },
          );

          if (!(hasMatchingKeyOnType || hasMatchingProvidesOrRequires)) {
            errors.push(
              errorWithCode(
                'EXTERNAL_UNUSED',
                logServiceAndType(serviceName, typeName, externalFieldName) +
                  `is marked as @external but is not used by a @requires, @key, or @provides directive.`,
              ),
            );
          }
        }
      }
    }
  }

  return errors;
};
