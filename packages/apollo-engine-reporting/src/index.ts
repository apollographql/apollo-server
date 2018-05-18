import { GraphQLResolveInfo, responsePathAsArray, ResponsePath } from 'graphql';
import { GraphQLExtension } from 'graphql-extensions';
import { Trace } from 'apollo-engine-reporting-protobuf';

function responsePathAsString(p: ResponsePath | undefined) {
  if (p === undefined) {
    return '';
  }
  return responsePathAsArray(p).join('.');
}

export class EngineReportingExtension<TContext = any>
  implements GraphQLExtension<TContext> {
  private trace = new Trace();
  private nodes = new Map<string, Trace.Node>();

  public constructor() {
    const root = new Trace.Node();
    this.trace.root = root;
    this.nodes.set(responsePathAsString(undefined), root);
  }

  public willResolveField?(
    source: any,
    args: { [argName: string]: any },
    context: TContext,
    info: GraphQLResolveInfo,
  ): ((result: any) => void) | void {
    const path = info.path;
    const node = this.newNode(path);

    return () => {
      /* XXX */
    };
  }

  private newNode(path: ResponsePath): Trace.Node {
    const node = new Trace.Node();
    const id = path.key;
    if (typeof id === 'number') {
      node.index = id;
    } else {
      node.fieldName = id;
    }
    this.nodes.set(responsePathAsString(path), node);
    const parentNode = this.ensureParentNode(path);
    parentNode.child.push(node);
    return node;
  }

  private ensureParentNode(path: ResponsePath): Trace.Node {
    const parentPath = responsePathAsString(path.prev);
    const parentNode = this.nodes.get(parentPath);
    if (parentNode) {
      return parentNode;
    }
    // Because we set up the root path in the constructor, we now know that
    // path.prev isn't undefined.
    return this.newNode(path.prev!);
  }
}
