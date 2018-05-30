export {
  hideLiterals,
  dropUnusedDefinitions,
  sortAST,
  removeAliases,
  printWithReducedWhitespace,
  defaultSignature,
} from './signature';

import { GraphQLResolveInfo, responsePathAsArray, ResponsePath } from 'graphql';
import { GraphQLExtension, EndHandler } from 'graphql-extensions';
import { StatsReport, Trace, google } from 'apollo-engine-reporting-protobuf';

// While the actual protobuf Node object doesn't contain a parentType, it's
// helpful for us to have access to it when aggregating a Trace into Stats.
class TraceNode extends Trace.Node {
  public parentType: string;
}

function responsePathAsString(p: ResponsePath | undefined) {
  if (p === undefined) {
    return '';
  }
  return responsePathAsArray(p).join('.');
}

// Converts a JS Date into a Timestamp.
function dateToTimestamp(date: Date): google.protobuf.Timestamp {
  const totalMillis = +date;
  const millis = totalMillis % 1000;
  return new google.protobuf.Timestamp({
    seconds: (totalMillis - millis) / 1000,
    nanos: millis * 1e6,
  });
}

// Converts an hrtime array (as returned from process.hrtime) to nanoseconds.
//
// ONLY CALL THIS ON VALUES REPRESENTING DELTAS, NOT ON THE RAW RETURN VALUE
// FROM process.hrtime() WITH NO ARGUMENTS.
//
// The entire point of the hrtime data structure is that the JavaScript Number
// type can't represent all int64 values without loss of precision:
// Number.MAX_SAFE_INTEGER nanoseconds is about 104 days. Calling this function
// on a duration that represents a value less than 104 days is fine. Calling
// this function on an absolute time (which is generally roughly time since
// system boot) is not a good idea.
//
// XXX We should probably use google.protobuf.Duration on the wire instead of
// ever trying to store durations in a single number.
function durationHrTimeToNanos(hrtime: [number, number]) {
  return hrtime[0] * 1e9 + hrtime[1];
}

// XXX Implement signatures.
// XXX Implement details (variables, raw_query, operation_name).
// XXX Implement client_*
// XXX Implement http request fields (requires access to Request)
// XXX Implement http response fields if feasible
// XXX Implement error tracking

export class EngineReportingExtension<TContext = any>
  implements GraphQLExtension<TContext> {
  public trace = new Trace();
  private nodes = new Map<string, TraceNode>();
  private startHrTime: [number, number];

  public constructor() {
    const root = new TraceNode();
    this.trace.root = root;
    this.nodes.set(responsePathAsString(undefined), root);
  }

  public requestDidStart(): EndHandler {
    this.trace.startTime = dateToTimestamp(new Date());
    this.startHrTime = process.hrtime();
    return () => {
      this.trace.durationNs = durationHrTimeToNanos(
        process.hrtime(this.startHrTime),
      );
      this.trace.endTime = dateToTimestamp(new Date());
    };
  }

  public willResolveField?(
    source: any,
    args: { [argName: string]: any },
    context: TContext,
    info: GraphQLResolveInfo,
  ): ((result: any) => void) | void {
    const path = info.path;
    const node = this.newNode(path);
    node.type = info.returnType.toString();
    node.parentType = info.parentType.toString();
    node.startTime = durationHrTimeToNanos(process.hrtime(this.startHrTime));

    return () => {
      node.endTime = durationHrTimeToNanos(process.hrtime(this.startHrTime));
    };
  }

  private newNode(path: ResponsePath): TraceNode {
    const node = new TraceNode();
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

  private ensureParentNode(path: ResponsePath): TraceNode {
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
