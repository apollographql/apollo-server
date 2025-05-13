import {
  GraphQLError,
  type ValidationRule,
  type ValidationContext,
  type ASTVisitor,
} from 'graphql';
import { ApolloServerValidationErrorCode } from '../errors/index.js';

export const DEFAULT_MAX_RECURSIVE_SELECTIONS = 10_000_000;

interface ExecutableDefinitionInfo {
  selectionCount: number;
  fragmentSpreads: Map<string, number>;
}

class RecursiveSelectionValidationContext {
  private readonly fragmentInfo: Map<string, ExecutableDefinitionInfo> =
    new Map();
  private readonly operationInfo: Map<string | null, ExecutableDefinitionInfo> =
    new Map();
  private currentFragment?: string;
  private currentOperation?: string | null;
  private readonly fragmentRecursiveSelectionCount: Map<string, number | null> =
    new Map();

  constructor(
    private readonly selectionCountLimit: number,
    private readonly context: ValidationContext,
  ) {}

  private getExecutionDefinitionInfo(): ExecutableDefinitionInfo | undefined {
    if (this.currentFragment !== undefined) {
      let entry = this.fragmentInfo.get(this.currentFragment);
      if (!entry) {
        entry = {
          selectionCount: 0,
          fragmentSpreads: new Map(),
        };
        this.fragmentInfo.set(this.currentFragment, entry);
      }
      return entry;
    }
    if (this.currentOperation !== undefined) {
      let entry = this.operationInfo.get(this.currentOperation);
      if (!entry) {
        entry = {
          selectionCount: 0,
          fragmentSpreads: new Map(),
        };
        this.operationInfo.set(this.currentOperation, entry);
      }
      return entry;
    }
    return undefined;
  }

  processSelection(fragmentSpreadName?: string) {
    const definitionInfo = this.getExecutionDefinitionInfo();
    if (!definitionInfo) {
      return;
    }
    definitionInfo.selectionCount++;
    if (fragmentSpreadName !== undefined) {
      let spreadCount =
        (definitionInfo.fragmentSpreads.get(fragmentSpreadName) ?? 0) + 1;
      definitionInfo.fragmentSpreads.set(fragmentSpreadName, spreadCount);
    }
  }

  enterFragment(fragment: string) {
    this.currentFragment = fragment;
  }

  leaveFragment() {
    this.currentFragment = undefined;
  }

  enterOperation(operation: string | null) {
    this.currentOperation = operation;
  }

  leaveOperation() {
    this.currentOperation = undefined;
  }

  computeFragmentRecursiveSelectionsCount(fragment: string): number {
    const cachedCount = this.fragmentRecursiveSelectionCount.get(fragment);
    if (cachedCount === null) {
      // We set "fragmentRecursiveSelectionCount" to "null" for a fragment when
      // we're in the middle of recursing it, so if we encounter it when getting
      // a fragment spread, that means we've reached a circular reference. We
      // don't want to error here, as a separate GraphQL validation checks for
      // this, so we instead pretend the fragment has zero selections.
      return 0;
    }
    if (cachedCount !== undefined) {
      return cachedCount;
    }
    this.fragmentRecursiveSelectionCount.set(fragment, null);
    // If "definitionInfo" is "undefined", it means that the fragment spread
    // refers to a named fragment that has zero selections or doesn't exist. We
    // don't want to error here, as a separate GraphQL validation checks for
    // this, so we instead pretend the fragment always has zero selections.
    const definitionInfo = this.fragmentInfo.get(fragment);
    let count = 0;
    if (definitionInfo) {
      count = definitionInfo.selectionCount;
      for (const [fragment, spreadCount] of definitionInfo.fragmentSpreads) {
        count +=
          spreadCount * this.computeFragmentRecursiveSelectionsCount(fragment);
      }
    }
    this.fragmentRecursiveSelectionCount.set(fragment, count);
    return count;
  }

  private reportError(operation: string | null) {
    const operationName = operation
      ? `Operation "${operation}"`
      : 'Anonymous operation';
    this.context.reportError(
      new GraphQLError(
        `${operationName} recursively requests too many selections.`,
        {
          nodes: [],
          extensions: {
            validationErrorCode:
              ApolloServerValidationErrorCode.MAX_RECURSIVE_SELECTIONS_EXCEEDED,
          },
        },
      ),
    );
  }

  checkLimitExceeded() {
    for (const [operation, definitionInfo] of this.operationInfo) {
      let count = definitionInfo.selectionCount;
      for (const [fragment, spreadCount] of definitionInfo.fragmentSpreads) {
        count +=
          spreadCount * this.computeFragmentRecursiveSelectionsCount(fragment);
      }
      if (count > this.selectionCountLimit) {
        this.reportError(operation);
      }
    }
  }
}

/**
 * Creates a GraphQL validation rule that imposes a limit on the number of
 * recursive selections in an operation. This is the number of selections you
 * would encounter if named fragments were inserted inline whenever a fragment
 * spread referencing them were encountered.
 *
 * @param limit The maximum number of recursive selections in any operation.
 */
export function createMaxRecursiveSelectionsRule(
  limit: number,
): ValidationRule {
  return (context: ValidationContext): ASTVisitor => {
    const selectionContext = new RecursiveSelectionValidationContext(
      limit,
      context,
    );
    return {
      Field() {
        selectionContext.processSelection();
      },
      InlineFragment() {
        selectionContext.processSelection();
      },
      FragmentSpread(node) {
        selectionContext.processSelection(node.name.value);
      },
      FragmentDefinition: {
        enter(node) {
          selectionContext.enterFragment(node.name.value);
        },
        leave() {
          selectionContext.leaveFragment();
        },
      },
      OperationDefinition: {
        enter(node) {
          selectionContext.enterOperation(node.name?.value ?? null);
        },
        leave() {
          selectionContext.leaveOperation();
        },
      },
      Document: {
        leave() {
          selectionContext.checkLimitExceeded();
        },
      },
    };
  };
}
