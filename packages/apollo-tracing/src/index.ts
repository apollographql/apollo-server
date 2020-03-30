import {
  ResponsePath,
  responsePathAsArray,
  GraphQLType,
} from 'graphql';
import { ApolloServerPlugin } from "apollo-server-plugin-base";

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

export const plugin = (_futureOptions = {}) => (): ApolloServerPlugin => ({
  requestDidStart() {
    let startWallTime: Date | undefined;
    let endWallTime: Date | undefined;
    let startHrTime: HighResolutionTime | undefined;
    let duration: HighResolutionTime | undefined;
    const resolverCalls: ResolverCall[] = [];

    startWallTime = new Date();
    startHrTime = process.hrtime();

    return {
      executionDidStart() {
        // It's a little odd that we record the end time after execution rather
        // than at the end of the whole request, but because we need to include
        // our formatted trace in the request itself, we have to record it
        // before the request is over! It's also odd that we don't do traces for
        // parse or validation errors, but runQuery doesn't currently support
        // that, as format() is only invoked after execution.
        return () => {
          duration = process.hrtime(startHrTime);
          endWallTime = new Date();
        };
      },
      willResolveField(...args) {
        const [, , , info] = args;

        const resolverCall: ResolverCall = {
          path: info.path,
          fieldName: info.fieldName,
          parentType: info.parentType,
          returnType: info.returnType,
          startOffset: process.hrtime(startHrTime),
        };

        resolverCalls.push(resolverCall);

        return () => {
          resolverCall.endOffset = process.hrtime(startHrTime);
        };
      },
      willSendResponse({ response }) {
        // In the event that we are called prior to the initialization of
        // critical date metrics, we'll return undefined to signal that the
        // extension did not format properly. Any undefined extension
        // results are simply purged by the graphql-extensions module.
        if (
          typeof startWallTime === 'undefined' ||
          typeof endWallTime === 'undefined' ||
          typeof duration === 'undefined'
        ) {
          return;
        }

        const extensions =
          response.extensions || (response.extensions = Object.create(null));

        if (typeof extensions.tracing !== 'undefined') {
          throw new Error("The tracing information already existed.");
        }

        // Set the extensions.
        extensions.tracing = {
          version: 1,
          startTime: startWallTime.toISOString(),
          endTime: endWallTime.toISOString(),
          duration: durationHrTimeToNanos(duration),
          execution: {
            resolvers: resolverCalls.map(resolverCall => {
              const startOffset = durationHrTimeToNanos(
                resolverCall.startOffset,
              );
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
        };
      },
    };
  },
})

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
