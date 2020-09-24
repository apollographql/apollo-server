import { DocumentNode, GraphQLError } from 'graphql';
import { RequestAgent } from 'apollo-server-env';
import {
  Logger,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextDidEncounterErrors,
} from 'apollo-server-types';
import {
  ApolloServerPluginUsageReportingOptions,
  VariableValueOptions,
  SendValuesBaseOptions,
  GenerateClientInfo,
} from './options';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { ApolloServerPluginUsageReporting } from './plugin';

/**
 * The type of the legacy `engine` option to `new ApolloServer`. Replaced by the
 * `apollo` argument and the options to various plugin functions. In most cases
 * these options map directly to fields on `ApolloConfigInput`,
 * `ApolloServerPluginUsageReportingOptions`, or
 * `ApolloServerPluginSchemaReportingOptions`; the correspondance is documented
 * in the migration guide at
 * https://go.apollo.dev/s/migration-engine-plugins
 */
export interface EngineReportingOptions<TContext> {
  apiKey?: string;
  calculateSignature?: (ast: DocumentNode, operationName: string) => string;
  reportIntervalMs?: number;
  maxUncompressedReportSize?: number;
  endpointUrl?: string;
  tracesEndpointUrl?: string;
  debugPrintReports?: boolean;
  requestAgent?: RequestAgent | false;
  maxAttempts?: number;
  minimumRetryDelayMs?: number;
  reportErrorFunction?: (err: Error) => void;
  sendVariableValues?: VariableValueOptions;
  reportTiming?: ReportTimingOptions<TContext>;
  privateVariables?: Array<String> | boolean;
  sendHeaders?: SendValuesBaseOptions;
  privateHeaders?: Array<String> | boolean;
  handleSignals?: boolean;
  sendReportsImmediately?: boolean;
  maskErrorDetails?: boolean;
  rewriteError?: (err: GraphQLError) => GraphQLError | null;
  schemaTag?: string;
  graphVariant?: string;
  generateClientInfo?: GenerateClientInfo<TContext>;
  reportSchema?: boolean;
  overrideReportedSchema?: string;
  schemaReportingInitialDelayMaxMs?: number;
  schemaReportingUrl?: string;
  logger?: Logger;
  experimental_schemaReporting?: boolean;
  experimental_overrideReportedSchema?: string;
  experimental_schemaReportingInitialDelayMaxMs?: number;
}

export type ReportTimingOptions<TContext> =
  | ((
      request:
        | GraphQLRequestContextDidResolveOperation<TContext>
        | GraphQLRequestContextDidEncounterErrors<TContext>,
    ) => Promise<boolean>)
  | boolean;

export function ApolloServerPluginUsageReportingFromLegacyOptions<TContext>(
  options: EngineReportingOptions<TContext> = Object.create(null),
): ApolloServerPlugin {
  return ApolloServerPluginUsageReporting(
    legacyOptionsToPluginOptions(options),
  );
}

/**
 * Converts the usage-reporting-related options in EngineReportingOptions format
 * (the deprecated `engine` option to `new ApolloServer`) into the appropriate
 * format for this plugin.
 */
export function legacyOptionsToPluginOptions(
  engine: EngineReportingOptions<any>,
): ApolloServerPluginUsageReportingOptions<any> {
  const pluginOptions: ApolloServerPluginUsageReportingOptions<any> = {};
  // apiKey, schemaTag, graphVariant, and handleSignals are dealt with
  // elsewhere.

  pluginOptions.calculateSignature = engine.calculateSignature;
  pluginOptions.reportIntervalMs = engine.reportIntervalMs;
  pluginOptions.maxUncompressedReportSize = engine.maxUncompressedReportSize;
  pluginOptions.endpointUrl = engine.tracesEndpointUrl ?? engine.endpointUrl;
  pluginOptions.debugPrintReports = engine.debugPrintReports;
  pluginOptions.requestAgent = engine.requestAgent;
  pluginOptions.maxAttempts = engine.maxAttempts;
  pluginOptions.minimumRetryDelayMs = engine.minimumRetryDelayMs;
  pluginOptions.reportErrorFunction = engine.reportErrorFunction;
  pluginOptions.sendVariableValues = engine.sendVariableValues;
  if (typeof engine.reportTiming === 'function') {
    // We can ignore true because that just means to make the plugin, and
    // false is already taken care of with disabledViaLegacyOption.
    pluginOptions.includeRequest = engine.reportTiming;
  }
  pluginOptions.sendHeaders = engine.sendHeaders;
  pluginOptions.sendReportsImmediately = engine.sendReportsImmediately;

  // Normalize the legacy option maskErrorDetails.
  if (engine.maskErrorDetails && engine.rewriteError) {
    throw new Error("Can't set both maskErrorDetails and rewriteError!");
  } else if (engine.rewriteError && typeof engine.rewriteError !== 'function') {
    throw new Error('rewriteError must be a function');
  } else if (engine.maskErrorDetails) {
    pluginOptions.rewriteError = () => new GraphQLError('<masked>');
    delete engine.maskErrorDetails;
  } else if (engine.rewriteError) {
    pluginOptions.rewriteError = engine.rewriteError;
  }
  pluginOptions.generateClientInfo = engine.generateClientInfo;
  pluginOptions.logger = engine.logger;

  // Handle the legacy option: privateVariables
  if (
    typeof engine.privateVariables !== 'undefined' &&
    engine.sendVariableValues
  ) {
    throw new Error(
      "You have set both the 'sendVariableValues' and the deprecated 'privateVariables' options. " +
        "Please only set 'sendVariableValues' (ideally, when calling `ApolloServerPluginUsageReporting` " +
        'instead of the deprecated `engine` option to the `ApolloServer` constructor).',
    );
  } else if (typeof engine.privateVariables !== 'undefined') {
    if (engine.privateVariables !== null) {
      pluginOptions.sendVariableValues = makeSendValuesBaseOptionsFromLegacy(
        engine.privateVariables,
      );
    }
  } else {
    pluginOptions.sendVariableValues = engine.sendVariableValues;
  }

  // Handle the legacy option: privateHeaders
  if (typeof engine.privateHeaders !== 'undefined' && engine.sendHeaders) {
    throw new Error(
      "You have set both the 'sendHeaders' and the deprecated 'privateVariables' options. " +
        "Please only set 'sendHeaders' (ideally, when calling `ApolloServerPluginUsageReporting` " +
        'instead of the deprecated `engine` option to the `ApolloServer` constructor).',
    );
  } else if (typeof engine.privateHeaders !== 'undefined') {
    if (engine.privateHeaders !== null) {
      pluginOptions.sendHeaders = makeSendValuesBaseOptionsFromLegacy(
        engine.privateHeaders,
      );
    }
  } else {
    pluginOptions.sendHeaders = engine.sendHeaders;
  }
  return pluginOptions;
}

// This helper wraps non-null inputs from the deprecated options
// 'privateVariables' and 'privateHeaders' into objects that can be passed to
// the replacement options, 'sendVariableValues' and 'sendHeaders'.
function makeSendValuesBaseOptionsFromLegacy(
  legacyPrivateOption: Array<String> | boolean,
): SendValuesBaseOptions {
  return Array.isArray(legacyPrivateOption)
    ? {
        exceptNames: legacyPrivateOption,
      }
    : legacyPrivateOption
    ? { none: true }
    : { all: true };
}
