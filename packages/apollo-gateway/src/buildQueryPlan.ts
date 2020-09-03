import {
  DocumentNode,
  FragmentDefinitionNode,
  GraphQLError,
  Kind,
  OperationDefinitionNode,
  print,
} from 'graphql';
import {
  QueryPlan,
  OperationContext,
  WasmPointer,
} from './QueryPlan';
import { ComposedGraphQLSchema } from '@apollo/federation';
import { getQueryPlan } from '@apollo/query-planner-wasm';

export interface BuildQueryPlanOptions {
  autoFragmentization: boolean;
}

export function buildQueryPlan(
  operationContext: OperationContext,
  _options: BuildQueryPlanOptions = { autoFragmentization: false },
): QueryPlan {

  return getQueryPlan(
    operationContext.queryPlannerPointer,
    operationContext.operationString,
  );
}

// Adapted from buildExecutionContext in graphql-js
interface BuildOperationContextOptions {
  schema: ComposedGraphQLSchema;
  operationDocument: DocumentNode;
  operationString: string;
  queryPlannerPointer: WasmPointer;
  operationName?: string;
};

export function buildOperationContext({
  schema,
  operationDocument,
  operationString,
  queryPlannerPointer,
  operationName,
}: BuildOperationContextOptions): OperationContext {
  let operation: OperationDefinitionNode | undefined;
  let operationCount: number = 0;
  const fragments: {
    [fragmentName: string]: FragmentDefinitionNode;
  } = Object.create(null);
  operationDocument.definitions.forEach(definition => {
    switch (definition.kind) {
      case Kind.OPERATION_DEFINITION:
        operationCount++;
        if (!operationName && operationCount > 1) {
          throw new GraphQLError(
            'Must provide operation name if query contains ' +
              'multiple operations.',
          );
        }
        if (
          !operationName ||
          (definition.name && definition.name.value === operationName)
        ) {
          operation = definition;
        }
        break;
      case Kind.FRAGMENT_DEFINITION:
        fragments[definition.name.value] = definition;
        break;
    }
  });
  if (!operation) {
    if (operationName) {
      throw new GraphQLError(`Unknown operation named "${operationName}".`);
    } else {
      throw new GraphQLError('Must provide an operation.');
    }
  }

  // In the case of multiple operations specified (operationName presence validated above),
  // `operation` === the operation specified by `operationName`
  const trimmedOperationString = operationCount > 1
    ? print({
      kind: Kind.DOCUMENT,
      definitions: [
        operation,
        ...Object.values(fragments),
      ],
    })
    : operationString;

  return {
    schema,
    operation,
    fragments,
    queryPlannerPointer,
    operationString: trimmedOperationString
  };
}
