import { QueryPlan } from '@apollo/gateway';
import { PlanNode } from '../../QueryPlan';
import astSerializer from '../../snapshotSerializers/astSerializer';
import queryPlanSerializer from '../../snapshotSerializers/queryPlanSerializer';
const prettyFormat = require('pretty-format');

declare global {
  namespace jest {
    interface Matchers<R> {
      toCallService(service: string): R;
    }
  }
}

// function printNode(node: ExecutionNode) {
//   return prettyFormat(
//     { nodes: [node], kind: 'QueryPlan' },
//     {
//       plugins: [queryPlanSerializer, astSerializer],
//     },
//   );
// }

const lineEndRegex = /^/gm;
function indentString(string: string, count = 2) {
  if (!string) return string;
  return string.replace(lineEndRegex, ' '.repeat(count));
}

function toCallService(
  this: jest.MatcherUtils,
  queryPlan: QueryPlan,
  service: string,
): { message(): string; pass: boolean } {
  // const receivedString = print(received);
  // const expectedString = print(expected);

  const printReceived = (string: string) =>
    this.utils.RECEIVED_COLOR(indentString(string));
  const printExpected = (string: string) =>
    this.utils.EXPECTED_COLOR(indentString(string));

  let pass = false;
  // let initialServiceCall = null;
  // recurse the node, find first match of service name, return
  function walkExecutionNode(node?: PlanNode) {
    if (!node) return;
    if (node.kind === 'Fetch' && node.serviceName === service) {
      pass = true;
      // initialServiceCall = node;
      return;
    }
    switch (node.kind) {
      case 'Flatten':
        walkExecutionNode(node.node);
        break;
      case 'Parallel':
      case 'Sequence':
        node.nodes.forEach(walkExecutionNode);
        break;
      default:
        return;
    }
  }

  walkExecutionNode(queryPlan.node);

  const message = pass
    ? () =>
        this.utils.matcherHint('.not.toCallService') +
        '\n\n' +
        `Expected query plan to not call service:\n` +
        printExpected(service) +
        '\n' +
        `Received:\n` +
        // FIXME print just the node
        printReceived(
          prettyFormat(queryPlan, {
            plugins: [queryPlanSerializer, astSerializer],
          }),
        )
    : () => {
        return (
          this.utils.matcherHint('.toCallService') +
          '\n\n' +
          `Expected query plan to call service:\n` +
          printExpected(service) +
          '\n' +
          `Received query plan:\n` +
          printReceived(
            prettyFormat(queryPlan, {
              plugins: [queryPlanSerializer, astSerializer],
            }),
          )
        );
      };
  return {
    message,
    pass,
  };
}

expect.extend({
  toCallService,
});
