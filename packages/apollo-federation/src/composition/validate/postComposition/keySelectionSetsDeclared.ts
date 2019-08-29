import { GraphQLSchema, isObjectType, FieldNode, GraphQLError } from 'graphql';

import { logServiceAndType, errorWithCode } from '../../utils';

/**
 * - Each key's selection set must be present on the base service
 */
export const keySelectionSetsDeclared = (schema: GraphQLSchema) => {
  const errors: GraphQLError[] = [];

  const types = schema.getTypeMap();
  for (const [typeName, namedType] of Object.entries(types)) {
    if (!isObjectType(namedType)) continue;

    if (namedType.federation && namedType.federation.keys) {
      const baseService = namedType.federation.serviceName;
      if (!baseService) {
        // Federated type does not have a base service. This shouldn't happen, but does in some tests.
        // Just exit early?
        continue;
      }

      const baseKeys = namedType.federation.keys[baseService] as FieldNode[][];

      for (const [serviceName, selectionSets] of Object.entries(
        namedType.federation.keys,
      )) {
        for (const selectionSet of selectionSets as FieldNode[][]) {
          if (!baseKeys.some(key => selectionSetsEqual(key, selectionSet))) {
            errors.push(
              errorWithCode(
                'KEY_NOT_DECLARED',
                logServiceAndType(serviceName, typeName) +
                  `uses the key \`${selectionSetToString(
                    selectionSet,
                  )}\`, which is not declared on the base service. All keys must be declared on the base service. `,
              ),
            );
          }
        }
      }
    }
  }

  return errors;
};

const selectionSetToString = (a: FieldNode[]): string =>
  a
    .map(
      node =>
        node.name.value +
        (node.selectionSet
          ? ` { ${selectionSetToString(node.selectionSet
              .selections as FieldNode[])} }`
          : ''),
    )
    .join(' ');

const selectionSetsEqual = (a: FieldNode[], b: FieldNode[]) => {
  if (a.length !== b.length) return false;
  a = a.slice();
  b = b.slice();

  a.sort((_a, _b) => _a.name.value.localeCompare(_b.name.value));
  b.sort((_a, _b) => _a.name.value.localeCompare(_b.name.value));

  for (let i = 0; i < a.length; i++) {
    const nodeA = a[i];
    const nodeB = b[i];

    if (nodeA.name.value !== nodeB.name.value) return false;

    const nodeASelections = nodeA.selectionSet;
    const nodeBSelections = nodeB.selectionSet;

    if (nodeASelections && nodeBSelections) {
      if (
        !selectionSetsEqual(
          nodeASelections.selections as FieldNode[],
          nodeBSelections.selections as FieldNode[],
        )
      ) {
        return false;
      }
    } else if (nodeASelections || nodeBSelections) {
      return false;
    }
  }
  return true;
};
