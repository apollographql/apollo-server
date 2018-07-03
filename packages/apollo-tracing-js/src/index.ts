import {
  ResponsePath,
  responsePathAsArray,
  GraphQLResolveInfo,
  GraphQLType,
} from 'graphql';

import { GraphQLExtension } from 'graphql-extensions';

export interface TracingFormat {
  version: 1;
  startTime: string;
  endTime: string;
  duration: number;
  execution: {
    resolvers: {
      path: (string | number)[];
      parentType: string;
      fieldName: string;
      returnType: string;
      startOffset: number;
      duration: number;
    }[];
  };
}

interface ResolverCall {
  path: ResponsePath;
  fieldName: string;
  parentType: GraphQLType;
  returnType: GraphQLType;
  startOffset: HighResolutionTime;
  endOffset?: HighResolutionTime;
}

export class TracingExtension<TContext = any>
  implements GraphQLExtension<TContext> {
  private startWallTime?: Date;
  private endWallTime?: Date;
  private startHrTime?: HighResolutionTime;
  private duration?: HighResolutionTime;

  private resolverCalls: ResolverCall[] = [];

  public requestDidStart() {
    this.startWallTime = new Date();
    this.startHrTime = process.hrtime();
  }

  public executionDidStart() {
    // It's a little odd that we record the end time after execution rather than
    // at the end of the whole request, but because we need to include our
    // formatted trace in the request itself, we have to record it before the
    // request is over!  It's also odd that we don't do traces for parse or
    // validation errors, but runQuery doesn't currently support that, as
    // format() is only invoked after execution.
    return () => {
      this.duration = process.hrtime(this.startHrTime);
      this.endWallTime = new Date();
    };
  }

  public willResolveField(
    _source: any,
    _args: { [argName: string]: any },
    _context: TContext,
    info: GraphQLResolveInfo,
  ) {
    const resolverCall: ResolverCall = {
      path: info.path,
      fieldName: info.fieldName,
      parentType: info.parentType,
      returnType: info.returnType,
      startOffset: process.hrtime(this.startHrTime),
    };

    this.resolverCalls.push(resolverCall);

    return () => {
      resolverCall.endOffset = process.hrtime(this.startHrTime);
    };
  }

  public format(): [string, TracingFormat] | undefined {
    // In the event that we are called prior to the initialization of critical
    // date metrics, we'll return undefined to signal that the extension did not
    // format properly.  Any undefined extension results are simply purged by
    // the graphql-extensions module.
    if (
      typeof this.startWallTime === 'undefined' ||
      typeof this.endWallTime === 'undefined' ||
      typeof this.duration === 'undefined'
    ) {
      return;
    }

    return [
      'tracing',
      {
        version: 1,
        startTime: this.startWallTime.toISOString(),
        endTime: this.endWallTime.toISOString(),
        duration: durationHrTimeToNanos(this.duration),
        execution: {
          resolvers: this.resolverCalls.map(resolverCall => {
            const startOffset = durationHrTimeToNanos(resolverCall.startOffset);
            const duration = resolverCall.endOffset
              ? durationHrTimeToNanos(resolverCall.endOffset) - startOffset
              : 0;
            return {
              path: [...responsePathAsArray(resolverCall.path)],
              parentType: resolverCall.parentType.toString(),
              fieldName: resolverCall.fieldName,
              returnType: resolverCall.returnType.toString(),
              startOffset,
              duration,
            };
          }),
        },
      },
    ];
  }
}

type HighResolutionTime = [number, number];

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
function durationHrTimeToNanos(hrtime: HighResolutionTime) {
  return hrtime[0] * 1e9 + hrtime[1];
}
