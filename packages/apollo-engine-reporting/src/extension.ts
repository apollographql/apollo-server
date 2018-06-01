import { parse as urlParse } from 'url'; // XXX use W3C URL instead?

import {
  GraphQLResolveInfo,
  responsePathAsArray,
  ResponsePath,
  DocumentNode,
  ExecutionArgs,
} from 'graphql';
import { GraphQLExtension, EndHandler } from 'graphql-extensions';
import { Trace, google } from 'apollo-engine-reporting-protobuf';

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

// XXX Implement details (variables, raw_query).
// XXX Implement client_*
// XXX Implement http response fields if feasible
// XXX Implement error tracking

export class EngineReportingExtension<TContext = any>
  implements GraphQLExtension<TContext> {
  public trace = new Trace();
  private nodes = new Map<string, Trace.Node>();
  private startHrTime: [number, number];
  private operationName: string;
  private queryString: string;
  private documentAST: DocumentNode;
  private calculateSignature: (
    ast: DocumentNode,
    operationName: string,
  ) => string;
  private addTrace: (
    signature: string,
    operationName: string,
    trace: Trace,
  ) => void;

  public constructor(
    calculateSignature: (ast: DocumentNode, operationName: string) => string,
    addTrace: (signature: string, operationName: string, trace: Trace) => void,
  ) {
    this.calculateSignature = calculateSignature;
    this.addTrace = addTrace;
    const root = new Trace.Node();
    this.trace.root = root;
    this.nodes.set(responsePathAsString(undefined), root);
  }

  public parsingDidStart(o: { queryString: string }) {
    this.queryString = o.queryString;
  }

  public requestDidStart(o: { request: Request }): EndHandler {
    this.trace.startTime = dateToTimestamp(new Date());
    this.startHrTime = process.hrtime();

    const u = urlParse(o.request.url);

    this.trace.http = new Trace.HTTP({
      method:
        Trace.HTTP.Method[o.request.method as keyof typeof Trace.HTTP.Method] ||
        Trace.HTTP.Method.UNKNOWN,
      host: u.hostname, // XXX Includes port; is this right?
      path: u.path,
    });
    o.request.headers.forEach((value: string, key: string) => {
      // XXX Implement privateHeaders
      switch (key) {
        case 'authorization':
        case 'cookie':
        case 'set-cookie':
          break;
        default:
          this.trace.http!.requestHeaders![key] = new Trace.HTTP.Values({
            value: [value],
          });
      }
    });

    return () => {
      this.trace.durationNs = durationHrTimeToNanos(
        process.hrtime(this.startHrTime),
      );
      this.trace.endTime = dateToTimestamp(new Date());

      const operationName = this.operationName || '';
      let signature;
      if (this.documentAST) {
        signature = this.calculateSignature(this.documentAST, operationName);
      } else if (this.queryString) {
        // We didn't get an AST, possibly because of a parse failure. Let's just
        // use the full query string.
        //
        // XXX This does mean that even if you use a calculateSignature which
        //     hides literals, you might end up sending literals for queries
        //     that fail to execute. Provide some way to mask them anyway?
        signature = this.queryString;
      } else {
        // This probably only happens if you're using an OperationStore and you
        // put something that doesn't pass validation in it.
        //
        // XXX We could add more hooks to apollo-server to get the documentAST
        //     in that case but this feels pretty marginal.
        signature = 'query unknown { unknown }';
      }

      this.addTrace(signature, operationName, this.trace);
    };
  }

  public executionDidStart(o: { executionArgs: ExecutionArgs }) {
    // If the operationName is explicitly provided, save it. If there's just one
    // named operation, the client doesn't have to provide it, but we still want
    // to know the operation name so that the server can identify the query by
    // it without having to parse a signature.
    //
    // Fortunately, in the non-error case, we can just pull this out of
    // the first call to willResolveField's `info` argument.  In an
    // error case (eg, the operationName isn't found, or there are more
    // than one operation and no specified operationName) it's OK to continue
    // to file this trace under the empty operationName.
    if (o.executionArgs.operationName) {
      this.operationName = o.executionArgs.operationName;
    }
    this.documentAST = o.executionArgs.document;
  }

  public willResolveField?(
    _source: any,
    _args: { [argName: string]: any },
    _context: TContext,
    info: GraphQLResolveInfo,
  ): ((result: any) => void) | void {
    if (this.operationName === undefined) {
      this.operationName =
        (info.operation.name && info.operation.name.value) || '';
    }

    const path = info.path;
    const node = this.newNode(path);
    node.type = info.returnType.toString();
    node.parentType = info.parentType.toString();
    node.startTime = durationHrTimeToNanos(process.hrtime(this.startHrTime));

    return () => {
      node.endTime = durationHrTimeToNanos(process.hrtime(this.startHrTime));
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
