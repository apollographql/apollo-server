/**
 * Portions of code within this module are leveraging code copied from the
 * `graphql-js` library and modified to suit the needs of Apollo Server. For
 * details regarding the terms of these modifications and any relevant
 * attributions for the existing code, see the LICENSE file, at the root of this
 * package.
 */

import {
  GraphQLSchema,
  VariableDefinitionNode,
  GraphQLAbstractType,
  GraphQLObjectType,
  GraphQLInterfaceType,
} from "graphql";

/**
 * Fixed on release of this PR:
 * @see: https://github.com/graphql/graphql-js/pull/2224
 */
declare module "graphql/execution/values" {
  export function getVariableValues(
    schema: GraphQLSchema,
    varDefNodes: readonly VariableDefinitionNode[],
    inputs: { [key: string]: any },
    options?: { maxErrors?: number },
  ): CoercedVariableValues;
}

/**
 * Fixed on release of this PR:
 * @see: https://github.com/graphql/graphql-js/pull/2084
 */
declare module "graphql/type/schema" {
  interface GraphQLSchema {
    isSubType(
      abstractType: GraphQLAbstractType,
      maybeSubType: GraphQLObjectType | GraphQLInterfaceType,
    ): boolean
  }
}
