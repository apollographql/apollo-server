import { Config, Plugin, Refs } from 'pretty-format';
import { PlanNode, QueryPlan } from '../QueryPlan';

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
              node.requires,
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
          node.selectionSet,
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
