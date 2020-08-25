import { Config, Plugin, Refs } from 'pretty-format';
import { PlanNode, QueryPlan } from '../QueryPlan';
import { parse, Kind, visit, DocumentNode } from 'graphql';

export default {
  test(value: any) {
    return value && value.kind === 'QueryPlan';
  },

  serialize(
    queryPlan: QueryPlan,
    config: Config,
    indentation: string,
    depth: number,
    refs: Refs,
    printer: any,
  ): string {
    return (
      'QueryPlan {' +
      printNodes(
        queryPlan.node ? [queryPlan.node] : undefined,
        config,
        indentation,
        depth,
        refs,
        printer,
      ) +
      '}'
    );
  },
} as Plugin;

function printNode(
  node: PlanNode,
  config: Config,
  indentation: string,
  depth: number,
  refs: Refs,
  printer: any,
): string {
  let result = '';

  const indentationNext = indentation + config.indent;

  switch (node.kind) {
    case 'Fetch':
      result +=
        `Fetch(service: "${node.serviceName}")` +
        ' {' +
        config.spacingOuter +
        indentationNext +
        (node.requires
          ? printer(
              // this is an array of selections, so we need to make it a proper
              // selectionSet so we can print it
              { kind: Kind.SELECTION_SET, selections: node.requires },
              config,
              indentationNext,
              depth,
              refs,
              printer,
            ) +
            ' =>' +
            config.spacingOuter +
            indentationNext
          : '') +
        printer(
          flattenEntitiesField(parse(node.operation)),
          config,
          indentationNext,
          depth,
          refs,
          printer,
        ) +
        config.spacingOuter +
        indentation +
        '}';
      break;
    case 'Flatten':
      result += `Flatten(path: "${node.path.join('.')}")`;
      break;
    default:
      result += node.kind;
  }

  const nodes =
    'nodes' in node ? node.nodes : 'node' in node ? [node.node] : [];

  if (nodes.length > 0) {
    result +=
      ' {' + printNodes(nodes, config, indentation, depth, refs, printer) + '}';
  }

  return result;
}

function printNodes(
  nodes: PlanNode[] | undefined,
  config: Config,
  indentation: string,
  depth: number,
  refs: Refs,
  printer: any,
): string {
  let result = '';

  if (nodes && nodes.length > 0) {
    result += config.spacingOuter;

    const indentationNext = indentation + config.indent;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;

      result +=
        indentationNext +
        printNode(node, config, indentationNext, depth, refs, printer);

      if (i < nodes.length - 1) {
        result += ',' + config.spacingInner;
      } else if (!config.min) {
        result += ',';
      }
    }

    result += config.spacingOuter + indentation;
  }

  return result;
}

/**
 * when we serialize a query plan, we want to serialize the operation, but not
 * show the root level `query` definition or the `_entities` call. This function
 * flattens those nodes to only show their selectionSets
 */
function flattenEntitiesField(node: DocumentNode) {
  return visit(node, {
    OperationDefinition: ({ operation, selectionSet }) => {
      const firstSelection = selectionSet.selections[0];
      if (
        operation === 'query' &&
        firstSelection.kind === Kind.FIELD &&
        firstSelection.name.value === '_entities'
      ) {
        return firstSelection.selectionSet;
      }
      // we don't want to print the `query { }` definition either for query plan printing
      return selectionSet;
    },
  });
}
