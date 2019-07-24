import {
  GraphQLResolveInfo,
  GraphQLError,
  ResponsePath,
  responsePathAsArray,
} from 'graphql';
import { Trace, google } from 'apollo-engine-reporting-protobuf';

export class EngineReportingTreeBuilder {
  private rootNode = new Trace.Node();
  public trace = new Trace({ root: this.rootNode });
  public startHrTime?: [number, number];
  private stopped = false;
  private nodes = new Map<string, Trace.Node>([
    [rootResponsePath, this.rootNode],
  ]);
  private rewriteError?: (err: GraphQLError) => GraphQLError | null;

  public constructor(options: {
    rewriteError?: (err: GraphQLError) => GraphQLError | null;
  }) {
    this.rewriteError = options.rewriteError;
  }

  public startTiming() {
    if (this.startHrTime) {
      throw Error('startTiming called twice!');
    }
    if (this.stopped) {
      throw Error('startTiming called after stopTiming!');
    }
    this.trace.startTime = dateToProtoTimestamp(new Date());
    this.startHrTime = process.hrtime();
  }

  public stopTiming() {
    if (!this.startHrTime) {
      throw Error('stopTiming called before startTiming!');
    }
    if (this.stopped) {
      throw Error('stopTiming called twice!');
    }

    this.trace.durationNs = durationHrTimeToNanos(
      process.hrtime(this.startHrTime),
    );
    this.trace.endTime = dateToProtoTimestamp(new Date());
    this.stopped = true;
  }

  public willResolveField(info: GraphQLResolveInfo): () => void {
    if (!this.startHrTime) {
      throw Error('willResolveField called before startTiming!');
    }
    if (this.stopped) {
      throw Error('willResolveField called after stopTiming!');
    }

    const path = info.path;
    const node = this.newNode(path);
    node.type = info.returnType.toString();
    node.parentType = info.parentType.toString();
    node.startTime = durationHrTimeToNanos(process.hrtime(this.startHrTime));
    if (typeof path.key === 'string' && path.key !== info.fieldName) {
      // This field was aliased; send the original field name too (for FieldStats).
      node.originalFieldName = info.fieldName;
    }

    return () => {
      node.endTime = durationHrTimeToNanos(process.hrtime(this.startHrTime));
    };
  }

  public didEncounterErrors(errors: GraphQLError[]) {
    errors.forEach(err => {
      // This is an error from a federated service. We will already be reporting
      // it in the nested Trace in the query plan.
      if (err.extensions && err.extensions.serviceName) {
        return;
      }

      // In terms of reporting, errors can be re-written by the user by
      // utilizing the `rewriteError` parameter.  This allows changing
      // the message or stack to remove potentially sensitive information.
      // Returning `null` will result in the error not being reported at all.
      const errorForReporting = this.rewriteAndNormalizeError(err);

      if (errorForReporting === null) {
        return;
      }

      this.addProtobufError(
        errorForReporting.path,
        errorToProtobufError(errorForReporting),
      );
    });
  }

  private addProtobufError(
    path: ReadonlyArray<string | number> | undefined,
    error: Trace.Error,
  ) {
    if (!this.startHrTime) {
      throw Error('addProtobufError called before startTiming!');
    }
    if (this.stopped) {
      throw Error('addProtobufError called after stopTiming!');
    }

    // By default, put errors on the root node.
    let node = this.rootNode;
    if (path) {
      const specificNode = this.nodes.get(path.join('.'));
      if (specificNode) {
        node = specificNode;
      } else {
        console.warn(
          `Could not find node with path ${path.join(
            '.',
          )}; defaulting to put errors on root node.`,
        );
      }
    }

    node.error.push(error);
  }

  private newNode(path: ResponsePath): Trace.Node {
    const node = new Trace.Node();
    const id = path.key;
    if (typeof id === 'number') {
      node.index = id;
    } else {
      node.responseName = id;
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
    // Because we set up the root path when creating this.nodes, we now know
    // that path.prev isn't undefined.
    return this.newNode(path.prev!);
  }

  private rewriteAndNormalizeError(err: GraphQLError): GraphQLError | null {
    if (this.rewriteError) {
      // Before passing the error to the user-provided `rewriteError` function,
      // we'll make a shadow copy of the error so the user is free to change
      // the object as they see fit.

      // At this stage, this error is only for the purposes of reporting, but
      // this is even more important since this is still a reference to the
      // original error object and changing it would also change the error which
      // is returned in the response to the client.

      // For the clone, we'll create a new object which utilizes the exact same
      // prototype of the error being reported.
      const clonedError = Object.assign(
        Object.create(Object.getPrototypeOf(err)),
        err,
      );

      const rewrittenError = this.rewriteError(clonedError);

      // Returning an explicit `null` means the user is requesting that, in
      // terms of Engine reporting, the error be buried.
      if (rewrittenError === null) {
        return null;
      }

      // We don't want users to be inadvertently not reporting errors, so if
      // they haven't returned an explicit `GraphQLError` (or `null`, handled
      // above), then we'll report the error as usual.
      if (!(rewrittenError instanceof GraphQLError)) {
        return err;
      }

      // We only allow rewriteError to change the message and extensions of the
      // error; we keep everything else the same. That way people don't have to
      // do extra work to keep the error on the same trace node. We also keep
      // extensions the same if it isn't explicitly changed (to, eg, {}). (Note
      // that many of the fields of GraphQLError are not enumerable and won't
      // show up in the trace (even in the json field) anyway.)
      return new GraphQLError(
        rewrittenError.message,
        err.nodes,
        err.source,
        err.positions,
        err.path,
        err.originalError,
        rewrittenError.extensions || err.extensions,
      );
    }
    return err;
  }
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

// Convert from the linked-list ResponsePath format to a dot-joined
// string. Includes the full path (field names and array indices).
function responsePathAsString(p: ResponsePath | undefined) {
  if (p === undefined) {
    return '';
  }
  return responsePathAsArray(p).join('.');
}

const rootResponsePath = responsePathAsString(undefined);

function errorToProtobufError(error: GraphQLError): Trace.Error {
  return new Trace.Error({
    message: error.message,
    location: (error.locations || []).map(
      ({ line, column }) => new Trace.Location({ line, column }),
    ),
    json: JSON.stringify(error),
  });
}

// Converts a JS Date into a Timestamp.
function dateToProtoTimestamp(date: Date): google.protobuf.Timestamp {
  const totalMillis = +date;
  const millis = totalMillis % 1000;
  return new google.protobuf.Timestamp({
    seconds: (totalMillis - millis) / 1000,
    nanos: millis * 1e6,
  });
}
