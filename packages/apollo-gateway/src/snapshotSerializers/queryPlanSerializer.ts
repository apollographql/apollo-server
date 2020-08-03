import { Config, Plugin, Refs } from 'pretty-format';
import { PlanNode, QueryPlan } from '../QueryPlan';
import { parse, Kind, visit, OperationDefinitionNode, FieldNode } from 'graphql';

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
              ({kind: Kind.SELECTION_SET, selections: node.requires}),
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
          // parse(node.operation)
          visit(parse(node.operation), {
            OperationDefinition: op => {
              if(isQueryPlanOperation(op)) {
                // since this is a query plan, we know this to be a fieldnode
                // for (_entities). we don't want to print out that portion,
                // just the selection in _entities
                return (op.selectionSet.selections[0] as FieldNode).selectionSet
              }
              return op;
            }
          }),
          config,
          indentationNext,
          depth,
          refs,
          printer,
        ) +
        config.spacingOuter +
        indentation +
        // (node.internalFragments.size > 0
        //   ? '  ' +
        //     Array.from(node.internalFragments)
        //       .map(fragment =>
        //         printer(
        //           fragment,
        //           config,
        //           indentationNext,
        //           depth,
        //           refs,
        //           printer,
        //         ),
        //       )
        //       .join(`\n${indentationNext}`) +
        //     config.spacingOuter +
        //     indentation
        //   : '') +
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

function isQueryPlanOperation(op: OperationDefinitionNode) {
  return (
    op.operation === 'query' &&
    op.name?.value === undefined &&
    op.variableDefinitions?.length === 1 &&
    op.variableDefinitions[0].variable.name.value === 'representations'
  );
}
