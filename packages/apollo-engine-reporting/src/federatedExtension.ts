import { GraphQLResolveInfo, GraphQLError } from 'graphql';
import { GraphQLExtension, EndHandler } from 'graphql-extensions';
import { Trace } from 'apollo-engine-reporting-protobuf';
import { GraphQLRequestContext } from 'apollo-server-types';

import { EngineReportingTreeBuilder } from './treeBuilder';

export class EngineFederatedTracingExtension<TContext = any>
  implements GraphQLExtension<TContext> {
  private enabled = false;
  private done = false;
  private treeBuilder: EngineReportingTreeBuilder;

  public constructor(options: {
    rewriteError?: (err: GraphQLError) => GraphQLError | null;
  }) {
    this.treeBuilder = new EngineReportingTreeBuilder({
      rewriteError: options.rewriteError,
    });
  }

  public requestDidStart(o: {
    requestContext: GraphQLRequestContext<TContext>;
  }) {
    // XXX Provide a mechanism to customize this logic.
    const http = o.requestContext.request.http;
    if (
      http &&
      http.headers.get('apollo-federation-include-trace') === 'ftv1'
    ) {
      this.enabled = true;
    }

    if (this.enabled) {
      this.treeBuilder.startTiming();
    }
  }

  public willResolveField(
    _source: any,
    _args: { [argName: string]: any },
    _context: TContext,
    info: GraphQLResolveInfo,
  ): ((error: Error | null, result: any) => void) | void {
    if (this.enabled) {
      return this.treeBuilder.willResolveField(info);
    }
  }

  public didEncounterErrors(errors: GraphQLError[]) {
    if (this.enabled) {
      this.treeBuilder.didEncounterErrors(errors);
    }
  }

  public executionDidStart(): EndHandler | void {
    if (this.enabled) {
      // It's a little odd that we record the end time after execution rather than
      // at the end of the whole request, but because we need to include our
      // formatted trace in the request itself, we have to record it before the
      // request is over!  It's also odd that we don't do traces for parse or
      // validation errors, but runQuery doesn't currently support that, as
      // format() is only invoked after execution.
      return () => {
        this.treeBuilder.stopTiming();
        this.done = true;
      };
    }
  }

  // The ftv1 extension is a base64'd Trace protobuf containing only the
  // durationNs, startTime, endTime, and root fields.
  public format(): [string, string] | undefined {
    if (!this.enabled) {
      return;
    }
    if (!this.done) {
      throw Error('format called before end of execution?');
    }
    const encodedUint8Array = Trace.encode(this.treeBuilder.trace).finish();
    const encodedBuffer = Buffer.from(
      encodedUint8Array,
      encodedUint8Array.byteOffset,
      encodedUint8Array.byteLength,
    );
    return ['ftv1', encodedBuffer.toString('base64')];
  }
}
