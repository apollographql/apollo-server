import { GraphQLError, DocumentNode } from 'graphql';
import {
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextDidEncounterErrors,
  Logger,
  GraphQLRequestContext,
} from 'apollo-server-types';
import { RequestAgent } from 'apollo-server-env';

export interface ApolloServerPluginUsageReportingOptions<TContext> {
  //#region Configure exactly which data should be sent to Apollo.
  /**
   * By default, Apollo Server does not send the values of any GraphQL variables to Apollo's servers, because variable
   * values often contain the private data of your app's users. If you'd like variable values to be included in traces, set this option.
   * This option can take several forms:
   * - { none: true }: don't send any variable values (DEFAULT)
   * - { all: true}: send all variable values
   * - { transform: ... }: a custom function for modifying variable values. Keys added by the custom function will
   *    be removed, and keys removed will be added back with an empty value. For security reasons, if an error occurs within this function, all variable values will be replaced with `[PREDICATE_FUNCTION_ERROR]`.
   * - { exceptNames: ... }: a case-sensitive list of names of variables whose values should not be sent to Apollo servers
   * - { onlyNames: ... }: A case-sensitive list of names of variables whose values will be sent to Apollo servers
   *
   * Defaults to not sending any variable values if both this parameter and
   * the deprecated `privateVariables` are not set. The report will
   * indicate each private variable key whose value was redacted by { none: true } or { exceptNames: [...] }.
   */
  sendVariableValues?: VariableValueOptions;
  /**
   * By default, Apollo Server does not send the list of HTTP headers and values
   * to Apollo's servers, as these headers may contain your users' private data.
   * If you'd like this information included in traces, set this option. This
   * option can take several forms:
   *
   * - { none: true } to drop all HTTP request headers (DEFAULT)
   * - { all: true } to send the values of all HTTP request headers
   * - { exceptNames: Array<String> } A case-insensitive list of names of HTTP
   *     headers whose values should not be sent to Apollo servers
   * - { onlyNames: Array<String> }: A case-insensitive list of names of HTTP
   *   headers whose values will be sent to Apollo servers
   *
   * Unlike with sendVariableValues, names of dropped headers are not reported.
   * The headers 'authorization', 'cookie', and 'set-cookie' are never reported.
   */
  sendHeaders?: SendValuesBaseOptions;
  /**
   * By default, all errors get reported to Apollo servers. You can specify
   * a filter function to exclude specific errors from being reported by
   * returning an explicit `null`, or you can mask certain details of the error
   * by modifying it and returning the modified error.
   */
  rewriteError?: (err: GraphQLError) => GraphQLError | null;
  /**
   * This option allows you to choose if a particular request should be
   * represented in the usage reporting sent to Apollo servers. By default, all
   * requests are included. If this async predicate function is specified, its
   * return value will determine whether a given request is included.
   *
   * The predicate function receives the request context. If validation and
   * parsing of the request succeeds, the function will receive the request
   * context in the
   * [`GraphQLRequestContextDidResolveOperation`](https://www.apollographql.com/docs/apollo-server/integrations/plugins/#didresolveoperation)
   * phase, which permits tracing based on dynamic properties, e.g., HTTP
   * headers or the `operationName` (when available). Otherwise it will receive
   * the request context in the
   * [`GraphQLRequestContextDidEncounterError`](https://www.apollographql.com/docs/apollo-server/integrations/plugins/#didencountererrors)
   * phase:
   *
   * (If you don't want any usage reporting, don't use this plugin; if you are
   * using other plugins that require you to configure an Apollo API key, use
   * ApolloServerPluginUsageReportingDisabled to prevent this plugin from being
   * created by default.)
   *
   * **Example:**
   *
   * ```js
   * includeRequest(requestContext) {
   *   // Always include `query HomeQuery { ... }`.
   *   if (requestContext.operationName === "HomeQuery") return true;
   *
   *   // Omit if the "report-to-apollo" header is set to "false".
   *   if (requestContext.request.http?.headers?.get("report-to-apollo") === "false") {
   *     return false;
   *   }
   *
   *   // Otherwise include.
   *   return true;
   * },
   * ```
   *
   */
  includeRequest?: (
    request:
      | GraphQLRequestContextDidResolveOperation<TContext>
      | GraphQLRequestContextDidEncounterErrors<TContext>,
  ) => Promise<boolean>;
  /**
   * By default, this plugin associates client information such as name
   * and version with user requests based on HTTP headers starting with
   * `apollographql-client-`. If you have another way of communicating
   * client information to your server, tell the plugin how it works
   * with this option.
   */
  generateClientInfo?: GenerateClientInfo<TContext>;
  /**
   * If you are using the `overrideReportedSchema` option to the schema
   * reporting plugin (`ApolloServerPluginSchemaReporting`), you should
   * pass the same value here as well, so that the schema ID associated
   * with requests in this plugin's usage reports matches the schema
   * ID that the other plugin reports.
   */
  overrideReportedSchema?: string;
  /**
   * Whether to include the entire document in the trace if the operation
   * was a GraphQL parse or validation error (i.e. failed the GraphQL parse or
   * validation phases). This will be included as a separate field on the trace
   * and the operation name and signature will always be reported with a cosntant
   * identifier. Whether the operation was a parse failure or a validation
   * failure will be embedded within the stats report key itself.
   */
  sendUnexecutableOperationDocuments?: boolean;
  //#endregion

  //#region Configure the mechanics of communicating with Apollo's servers.
  /**
   * Sends a usage report after every request. This options is useful for
   * stateless environments like Amazon Lambda where processes handle only a
   * small number of requests before terminating. It defaults to true when
   * used with an ApolloServer subclass for a serverless framework (Amazon
   * Lambda, Google Cloud Functions, or Azure Functions), or false otherwise.
   * (Note that "immediately" does not mean synchronously with completing the
   * response, but "very soon", such as after a setImmediate call.)
   */
  sendReportsImmediately?: boolean;
  /**
   * HTTP(s) agent to be used on the `fetch` call when sending reports to
   * Apollo.
   */
  requestAgent?: RequestAgent | false;
  /**
   * How often to send reports to Apollo. We'll also send reports when the
   * report gets big; see maxUncompressedReportSize.
   */
  reportIntervalMs?: number;
  /**
   * We send a report when the report size will become bigger than this size in
   * bytes (default: 4MB).  (This is a rough limit --- we ignore the size of the
   * report header and some other top level bytes. We just add up the lengths of
   * the serialized traces and signatures.)
   */
  maxUncompressedReportSize?: number;
  /**
   * Reporting is retried with exponential backoff up to this many times
   * (including the original request). Defaults to 5.
   */
  maxAttempts?: number;
  /**
   * Minimum back-off for retries. Defaults to 100ms.
   */
  minimumRetryDelayMs?: number;
  /**
   * A logger interface to be used for output and errors.  When not provided
   * it will default to the server's own `logger` implementation and use
   * `console` when that is not available.
   */
  logger?: Logger;
  /**
   * By default, if an error occurs when sending trace reports to Apollo
   * servers, its message will be sent to the `error` method on the logger
   * specified with the `logger` option to this plugin or to ApolloServer (or to
   * `console.error` by default). Specify this function to process errors in a
   * different way. (The difference between using this option and using a logger
   * is that this option receives the actual Error object whereas `logger.error`
   * only receives its message.)
   */
  reportErrorFunction?: (err: Error) => void;
  //#endregion

  //#region Internal and non-recommended options
  /**
   * The URL base that we send reports to (not including the path). This option
   * only needs to be set for testing and Apollo-internal uses.
   */
  endpointUrl?: string;
  /**
   * If set, prints all reports as JSON when they are sent. (Note that this
   * feature is not as useful as it may sound because for technical reasons
   * it currently does not include the actual traces.)
   */
  debugPrintReports?: boolean;
  /**
   * Specify the function for creating a signature for a query. See signature.ts
   * for details. This option is not recommended, as Apollo's servers make assumptions
   * about how the signature relates to the operation you executed.
   */
  calculateSignature?: (ast: DocumentNode, operationName: string) => string;
  //#endregion
}

export type SendValuesBaseOptions =
  | { onlyNames: Array<String> }
  | { exceptNames: Array<String> }
  | { all: true }
  | { none: true };

type VariableValueTransformOptions = {
  variables: Record<string, any>;
  operationString?: string;
};

export type VariableValueOptions =
  | {
      transform: (
        options: VariableValueTransformOptions,
      ) => Record<string, any>;
    }
  | SendValuesBaseOptions;

export interface ClientInfo {
  clientName?: string;
  clientVersion?: string;
  clientReferenceId?: string;
}
export type GenerateClientInfo<TContext> = (
  requestContext: GraphQLRequestContext<TContext>,
) => ClientInfo;
