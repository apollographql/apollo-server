/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type ReportSchemaErrorCode =
  | 'BOOT_ID_IS_NOT_VALID_UUID'
  | 'BOOT_ID_IS_REQUIRED'
  | 'CORE_SCHEMA_HASH_IS_NOT_SCHEMA_SHA256'
  | 'CORE_SCHEMA_HASH_IS_REQUIRED'
  | 'CORE_SCHEMA_HASH_IS_TOO_LONG'
  | 'EXECUTABLE_SCHEMA_ID_IS_NOT_SCHEMA_SHA256'
  | 'EXECUTABLE_SCHEMA_ID_IS_REQUIRED'
  | 'EXECUTABLE_SCHEMA_ID_IS_TOO_LONG'
  | 'GRAPH_REF_INVALID_FORMAT'
  | 'GRAPH_REF_IS_REQUIRED'
  | 'GRAPH_VARIANT_DOES_NOT_MATCH_REGEX'
  | 'GRAPH_VARIANT_IS_REQUIRED'
  | 'LIBRARY_VERSION_IS_TOO_LONG'
  | 'PLATFORM_IS_TOO_LONG'
  | 'RUNTIME_VERSION_IS_TOO_LONG'
  | 'SCHEMA_IS_NOT_PARSABLE'
  | 'SCHEMA_IS_NOT_VALID'
  | 'SERVER_ID_IS_TOO_LONG'
  | 'USER_VERSION_IS_TOO_LONG';

export type SchemaReport = {
  /** A randomly generated UUID, immutable for the lifetime of the edge server runtime. */
  bootId: string;
  /** The hex SHA256 hash of the schema being reported. Note that for a GraphQL server with a core schema, this should be the core schema, not the API schema. */
  coreSchemaHash: string;
  /** The graph ref (eg, 'id@variant') */
  graphRef: string;
  /** The version of the edge server reporting agent, e.g. apollo-server-2.8, graphql-java-3.1, etc. length must be <= 256 characters. */
  libraryVersion?: string | null | undefined;
  /** The infra environment in which this edge server is running, e.g. localhost, Kubernetes, AWS Lambda, Google CloudRun, AWS ECS, etc. length must be <= 256 characters. */
  platform?: string | null | undefined;
  /** The runtime in which the edge server is running, e.g. node 12.03, zulu8.46.0.19-ca-jdk8.0.252-macosx_x64, etc. length must be <= 256 characters. */
  runtimeVersion?: string | null | undefined;
  /** If available, an identifier for the edge server instance, such that when restarting this instance it will have the same serverId, with a different bootId. For example, in Kubernetes this might be the pod name. Length must be <= 256 characters. */
  serverId?: string | null | undefined;
  /** An identifier used to distinguish the version (from the user's perspective) of the edge server's code itself. For instance, the git sha of the server's repository or the docker sha of the associated image this server runs with. Length must be <= 256 characters. */
  userVersion?: string | null | undefined;
};

export type SchemaReportMutationVariables = Exact<{
  report: SchemaReport;
  coreSchema?: string | null | undefined;
}>;


export type SchemaReportMutation = { reportSchema:
    | { __typename: 'ReportSchemaError', message: string, code: ReportSchemaErrorCode }
    | { __typename: 'ReportSchemaResponse', inSeconds: number, withCoreSchema: boolean }
   | null };
