import { Trace } from 'apollo-engine-reporting-protobuf';
import { EngineReportingTreeBuilder } from './treeBuilder';
import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { EngineReportingOptions } from "./agent";

type FederatedReportingOptions<TContext> = Pick<EngineReportingOptions<TContext>, 'rewriteError'>

// This ftv1 plugin produces a base64'd Trace protobuf containing only the
// durationNs, startTime, endTime, and root fields.  This output is placed
// on the `extensions`.`ftv1` property of the response.  The Apollo Gateway
// utilizes this data to construct the full trace and submit it to Apollo
// Graph Manager ingress.
const federatedPlugin = <TContext>(
  options: FederatedReportingOptions<TContext> = Object.create(null),
): ApolloServerPlugin<TContext> => {
  return {
    requestDidStart({ request: { http } }) {
      const treeBuilder: EngineReportingTreeBuilder =
        new EngineReportingTreeBuilder({
          rewriteError: options.rewriteError,
        });

      // XXX Provide a mechanism to customize this logic.
      if (http?.headers.get('apollo-federation-include-trace') !== 'ftv1') {
        return;
      }

      treeBuilder.startTiming();

      return {
        executionDidStart: () => ({
          willResolveField({ info }) {
            return treeBuilder.willResolveField(info);
          },
        }),

        didEncounterErrors({ errors }) {
          treeBuilder.didEncounterErrors(errors);
        },

        willSendResponse({ response }) {
          // We record the end time at the latest possible time: right before serializing the trace.
          // If we wait any longer, the time we record won't actually be sent anywhere!
          treeBuilder.stopTiming();

          const encodedUint8Array = Trace.encode(treeBuilder.trace).finish();
          const encodedBuffer = Buffer.from(
            encodedUint8Array,
            encodedUint8Array.byteOffset,
            encodedUint8Array.byteLength,
          );

          const extensions =
            response.extensions || (response.extensions = Object.create(null));

          // This should only happen if another plugin is using the same name-
          // space within the `extensions` object and got to it before us.
          if (typeof extensions.ftv1 !== "undefined") {
            throw new Error("The `ftv1` extension was already present.");
          }

          extensions.ftv1 = encodedBuffer.toString('base64');
        }
      }
    },
  }
};

export default federatedPlugin;
