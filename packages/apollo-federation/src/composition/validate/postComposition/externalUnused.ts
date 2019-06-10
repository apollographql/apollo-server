import { GraphQLSchema, isObjectType, GraphQLError, Kind } from 'graphql';

import {
  findDirectivesOnTypeOrField,
  logServiceAndType,
  hasMatchingFieldInDirectives,
  errorWithCode,
  findFieldsThatReturnType,
  parseSelections,
  isStringValueNode,
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
      const keySelections = namedType.federation.keys;

      // loop over every service that has extensions with @external
      for (const [serviceName, externalFieldsForService] of Object.entries(
        namedType.federation.externals,
      )) {
        const keysForService = keySelections && keySelections[serviceName];
        // for a single service, loop over the external fields.
        for (const { field: externalField } of externalFieldsForService) {
          const externalFieldName = externalField.name.value;

          // check the selected fields of every @key provided by `serviceName`
          const hasMatchingKeyOnType = Boolean(
            keysForService &&
              keysForService
                .flat()
                .find(
                  selectedField =>
                    selectedField.name.value === externalFieldName,
                ),
          );
          if (hasMatchingKeyOnType) continue;

          /*
            @provides is most commonly used from another type than where
            the @external directive is applied. We need to find all
            fields on any type in the schema that return this type
            and see if they have a provides directive that uses this
            external field

            extend type Review {
              author: User @provides(fields: "username")
            }

            extend type User @key(fields: "id") {
              id: ID! @external
              username: String @external
              reviews: [Review]
            }
          */
          const hasMatchingProvidesOnAnotherType = findFieldsThatReturnType({
            schema,
            typeToFind: namedType,
          }).some(field => {
            const directivesOnField = findDirectivesOnTypeOrField(
              field.astNode,
              'provides',
            );

            const matchingProvidesDirective = directivesOnField.find(
              directive => {
                if (!directive.arguments) return false;
                const selections =
                  isStringValueNode(directive.arguments[0].value) &&
                  parseSelections(directive.arguments[0].value.value);
                // find the selections which are fields with names matching
                // our external field name
                return (
                  selections &&
                  selections.some(
                    selection =>
                      selection.kind === Kind.FIELD &&
                      selection.name.value === externalFieldName,
                  )
                );
              },
            );
            return Boolean(matchingProvidesDirective);
          });

          if (hasMatchingProvidesOnAnotherType) continue;

          const hasMatchingProvidesOrRequiresOnType = Object.values(
            namedType.getFields(),
          ).some(maybeProvidesField => {
            const fieldOwner =
              maybeProvidesField.federation &&
              maybeProvidesField.federation.serviceName;

            if (fieldOwner !== serviceName) return false;

            // if the provides is located directly on the type
            // type User { username: String, user: User @provides(fields: "username") }
            const providesDirectives = findDirectivesOnTypeOrField(
              maybeProvidesField.astNode,
              'provides',
            );

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
          });

          if (hasMatchingProvidesOrRequiresOnType) continue;

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

  return errors;
};
