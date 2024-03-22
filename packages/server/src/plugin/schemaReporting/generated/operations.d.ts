export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigInt: any;
  Blob: any;
  Date: any;
  DateTime: any;
  GraphQLDocument: any;
  JSON: any;
  JSONObject: any;
  Long: any;
  NaiveDateTime: any;
  Object: any;
  SHA256: any;
  StringOrInt: any;
  Timestamp: any;
  Void: any;
};

/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type Account = {
  __typename?: 'Account';
  auditLogExports?: Maybe<Array<AuditLogExport>>;
  /** These are the roles that the account is able to use */
  availableRoles: Array<UserPermission>;
  /**
   * Get an URL to which an avatar image can be uploaded. Client uploads by sending a PUT request
   * with the image data to MediaUploadInfo.url. Client SHOULD set the "Content-Type" header to the
   * browser-inferred MIME type, and SHOULD set the "x-apollo-content-filename" header to the
   * filename, if such information is available. Client MUST set the "x-apollo-csrf-token" header to
   * MediaUploadInfo.csrfToken.
   */
  avatarUpload?: Maybe<AvatarUploadResult>;
  /**
   * Get an image URL for the account's avatar. Note that CORS is not enabled for these URLs. The size
   * argument is used for bandwidth reduction, and should be the size of the image as displayed in the
   * application. Apollo's media server will downscale larger images to at least the requested size,
   * but this will not happen for third-party media servers.
   */
  avatarUrl?: Maybe<Scalars['String']>;
  billingContactEmail?: Maybe<Scalars['String']>;
  billingInfo?: Maybe<BillingInfo>;
  billingInsights: BillingInsights;
  /** Fetch a CloudOnboarding associated with this account */
  cloudOnboarding?: Maybe<CloudOnboarding>;
  companyUrl?: Maybe<Scalars['String']>;
  /** The time at which the account was created */
  createdAt?: Maybe<Scalars['Timestamp']>;
  currentBillingMonth?: Maybe<BillingMonth>;
  currentPlan: BillingPlan;
  currentSubscription?: Maybe<BillingSubscription>;
  eligibleForUsageBasedPlan: Scalars['Boolean'];
  expiredTrialDismissedAt?: Maybe<Scalars['Timestamp']>;
  expiredTrialSubscription?: Maybe<BillingSubscription>;
  graphIDAvailable: Scalars['Boolean'];
  /** Graphs belonging to this organization. */
  graphs: Array<Service>;
  /** Graphs belonging to this organization. */
  graphsConnection?: Maybe<AccountGraphConnection>;
  hasBeenOnTrial: Scalars['Boolean'];
  hasBillingInfo?: Maybe<Scalars['Boolean']>;
  /** Globally unique identifier, which isn't guaranteed stable (can be changed by administrators). */
  id: Scalars['ID'];
  /**
   * Internal immutable identifier for the account. Only visible to Apollo admins (because it really
   * shouldn't be used in normal client apps).
   */
  internalID: Scalars['ID'];
  invitations?: Maybe<Array<AccountInvitation>>;
  invoices: Array<Invoice>;
  isLocked?: Maybe<Scalars['Boolean']>;
  isOnExpiredTrial: Scalars['Boolean'];
  isOnTrial: Scalars['Boolean'];
  lockDetails?: Maybe<AccountLockDetails>;
  memberships?: Maybe<Array<AccountMembership>>;
  /** Name of the organization, which can change over time and isn't unique. */
  name: Scalars['String'];
  /**
   * Fetches an offline license for the account.
   * (If you need this then please contact your Apollo account manager to discuss your requirements.)
   */
  offlineLicense?: Maybe<RouterEntitlement>;
  /**
   * Fetches usage based pricing operations counts for the calling user. If a particular window is not specified,
   * totals for the user's current billing period are returned. (Will error if the user is not currently on a usage
   * based plan.)
   */
  operationUsage: AccountOperationUsage;
  /** List the private subgraphs associated with your Apollo account */
  privateSubgraphs: Array<PrivateSubgraph>;
  /** @deprecated use Account.createdAt instead */
  provisionedAt?: Maybe<Scalars['Timestamp']>;
  /** Returns a different registry related stats pertaining to this account. */
  registryStatsWindow?: Maybe<RegistryStatsWindow>;
  requests?: Maybe<Scalars['Long']>;
  requestsInCurrentBillingPeriod?: Maybe<Scalars['Long']>;
  roles?: Maybe<AccountRoles>;
  routerEntitlement?: Maybe<RouterEntitlement>;
  /** How many seats would be included in your next bill, as best estimated today */
  seatCountForNextBill?: Maybe<Scalars['Int']>;
  seats?: Maybe<Seats>;
  secondaryIDs: Array<Scalars['ID']>;
  /**
   * Graphs belonging to this organization.
   * @deprecated Use graphs field instead
   */
  services: Array<Service>;
  /**
   * If non-null, this organization tracks its members through an upstream, eg PingOne;
   * invitations are not possible on SSO-synchronized account.
   */
  sso?: Maybe<OrganizationSSO>;
  ssoV2?: Maybe<SsoConfig>;
  /** @deprecated no longer relevant; it's only ever populated for enterprise accounts */
  state?: Maybe<AccountState>;
  /** A list of reusable invitations for the organization. */
  staticInvitations?: Maybe<Array<OrganizationInviteLink>>;
  /** @deprecated use Account.statsWindow instead */
  stats: AccountStatsWindow;
  statsWindow?: Maybe<AccountStatsWindow>;
  subscriptions: Array<BillingSubscription>;
  survey?: Maybe<Survey>;
  /** Gets a ticket for this org, by id */
  ticket?: Maybe<ZendeskTicket>;
  /** List of Zendesk tickets submitted for this org */
  tickets?: Maybe<Array<ZendeskTicket>>;
  /**
   * All Variants within the Graphs belonging to this organization. Can be limited to those favorited by the current user.
   * @deprecated use Service.variants instead
   */
  variants?: Maybe<AccountGraphVariantConnection>;
  vitallyTraits?: Maybe<AccountCustomerTraits>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountavatarUrlArgs = {
  size?: Scalars['Int'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountbillingInsightsArgs = {
  from: Scalars['Date'];
  limit?: InputMaybe<Scalars['Int']>;
  to?: InputMaybe<Scalars['Date']>;
  windowSize?: InputMaybe<BillingUsageStatsWindowSize>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountcloudOnboardingArgs = {
  graphRef: Scalars['String'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountgraphIDAvailableArgs = {
  id: Scalars['ID'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountgraphsArgs = {
  filterBy?: InputMaybe<GraphFilter>;
  includeDeleted?: InputMaybe<Scalars['Boolean']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountgraphsConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filterBy?: InputMaybe<GraphFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountinvitationsArgs = {
  includeAccepted?: Scalars['Boolean'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountoperationUsageArgs = {
  forWindow?: InputMaybe<AccountOperationUsageWindowInput>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountprivateSubgraphsArgs = {
  cloudProvider: CloudProvider;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountregistryStatsWindowArgs = {
  from: Scalars['Timestamp'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountrequestsArgs = {
  from: Scalars['Timestamp'];
  to: Scalars['Timestamp'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountservicesArgs = {
  includeDeleted?: InputMaybe<Scalars['Boolean']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountstatsArgs = {
  from: Scalars['Timestamp'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountstatsWindowArgs = {
  from: Scalars['Timestamp'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountsurveyArgs = {
  id: Scalars['String'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountticketArgs = {
  id: Scalars['ID'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountvariantsArgs = {
  filterBy?: InputMaybe<GraphVariantFilter>;
};

/** Columns of AccountBillingUsageStats. */
export enum AccountBillingUsageStatsColumn {
  AGENT_VERSION = 'AGENT_VERSION',
  GRAPH_DEPLOYMENT_TYPE = 'GRAPH_DEPLOYMENT_TYPE',
  OPERATION_COUNT = 'OPERATION_COUNT',
  OPERATION_COUNT_PROVIDED_EXPLICITLY = 'OPERATION_COUNT_PROVIDED_EXPLICITLY',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type AccountBillingUsageStatsDimensions = {
  __typename?: 'AccountBillingUsageStatsDimensions';
  agentVersion?: Maybe<Scalars['String']>;
  graphDeploymentType?: Maybe<Scalars['String']>;
  operationCountProvidedExplicitly?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in AccountBillingUsageStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountBillingUsageStatsFilter = {
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']>;
  and?: InputMaybe<Array<AccountBillingUsageStatsFilter>>;
  /** Selects rows whose graphDeploymentType dimension equals the given value if not null. To query for the null value, use {in: {graphDeploymentType: [null]}} instead. */
  graphDeploymentType?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<AccountBillingUsageStatsFilterIn>;
  not?: InputMaybe<AccountBillingUsageStatsFilter>;
  /** Selects rows whose operationCountProvidedExplicitly dimension equals the given value if not null. To query for the null value, use {in: {operationCountProvidedExplicitly: [null]}} instead. */
  operationCountProvidedExplicitly?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<AccountBillingUsageStatsFilter>>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in AccountBillingUsageStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountBillingUsageStatsFilterIn = {
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose graphDeploymentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  graphDeploymentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationCountProvidedExplicitly dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationCountProvidedExplicitly?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type AccountBillingUsageStatsMetrics = {
  __typename?: 'AccountBillingUsageStatsMetrics';
  operationCount: Scalars['Long'];
};

export type AccountBillingUsageStatsOrderBySpec = {
  column: AccountBillingUsageStatsColumn;
  direction: Ordering;
};

export type AccountBillingUsageStatsRecord = {
  __typename?: 'AccountBillingUsageStatsRecord';
  /** Dimensions of AccountBillingUsageStats that can be grouped by. */
  groupBy: AccountBillingUsageStatsDimensions;
  /** Metrics of AccountBillingUsageStats that can be aggregated over. */
  metrics: AccountBillingUsageStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type AccountChecksStatsMetrics = {
  __typename?: 'AccountChecksStatsMetrics';
  totalFailedChecks: Scalars['Long'];
  totalSuccessfulChecks: Scalars['Long'];
};

export type AccountChecksStatsRecord = {
  __typename?: 'AccountChecksStatsRecord';
  id: Scalars['ID'];
  metrics: AccountChecksStatsMetrics;
  timestamp: Scalars['Timestamp'];
};

export type AccountCustomerTraits = {
  __typename?: 'AccountCustomerTraits';
  accountOwner?: Maybe<Scalars['String']>;
  adminLink?: Maybe<Scalars['String']>;
  federationInProd?: Maybe<Scalars['Boolean']>;
  product?: Maybe<Scalars['String']>;
  requestsLast30Days?: Maybe<Scalars['BigInt']>;
  sfdcId?: Maybe<Scalars['String']>;
  sso?: Maybe<Scalars['Boolean']>;
  tier?: Maybe<Scalars['String']>;
  totalGraphs?: Maybe<Scalars['Int']>;
  totalRequests?: Maybe<Scalars['BigInt']>;
  totalSubgraphs?: Maybe<Scalars['Int']>;
  totalVariants?: Maybe<Scalars['Int']>;
  usersCount?: Maybe<Scalars['Int']>;
  usingClassicGraphs?: Maybe<Scalars['Boolean']>;
  usingCloudGraphs?: Maybe<Scalars['Boolean']>;
  usingExplorer?: Maybe<Scalars['Boolean']>;
  usingFederation?: Maybe<Scalars['Boolean']>;
  usingFederation2?: Maybe<Scalars['Boolean']>;
  usingRover?: Maybe<Scalars['Boolean']>;
  usingSchemaChecks?: Maybe<Scalars['Boolean']>;
  usingVariants?: Maybe<Scalars['Boolean']>;
};

/** Columns of AccountEdgeServerInfos. */
export enum AccountEdgeServerInfosColumn {
  BOOT_ID = 'BOOT_ID',
  EXECUTABLE_SCHEMA_ID = 'EXECUTABLE_SCHEMA_ID',
  LIBRARY_VERSION = 'LIBRARY_VERSION',
  PLATFORM = 'PLATFORM',
  RUNTIME_VERSION = 'RUNTIME_VERSION',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVER_ID = 'SERVER_ID',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP',
  USER_VERSION = 'USER_VERSION'
}

export type AccountEdgeServerInfosDimensions = {
  __typename?: 'AccountEdgeServerInfosDimensions';
  bootId?: Maybe<Scalars['ID']>;
  executableSchemaId?: Maybe<Scalars['ID']>;
  libraryVersion?: Maybe<Scalars['String']>;
  platform?: Maybe<Scalars['String']>;
  runtimeVersion?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serverId?: Maybe<Scalars['ID']>;
  serviceId?: Maybe<Scalars['ID']>;
  userVersion?: Maybe<Scalars['String']>;
};

/** Filter for data in AccountEdgeServerInfos. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountEdgeServerInfosFilter = {
  and?: InputMaybe<Array<AccountEdgeServerInfosFilter>>;
  /** Selects rows whose bootId dimension equals the given value if not null. To query for the null value, use {in: {bootId: [null]}} instead. */
  bootId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose executableSchemaId dimension equals the given value if not null. To query for the null value, use {in: {executableSchemaId: [null]}} instead. */
  executableSchemaId?: InputMaybe<Scalars['ID']>;
  in?: InputMaybe<AccountEdgeServerInfosFilterIn>;
  /** Selects rows whose libraryVersion dimension equals the given value if not null. To query for the null value, use {in: {libraryVersion: [null]}} instead. */
  libraryVersion?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<AccountEdgeServerInfosFilter>;
  or?: InputMaybe<Array<AccountEdgeServerInfosFilter>>;
  /** Selects rows whose platform dimension equals the given value if not null. To query for the null value, use {in: {platform: [null]}} instead. */
  platform?: InputMaybe<Scalars['String']>;
  /** Selects rows whose runtimeVersion dimension equals the given value if not null. To query for the null value, use {in: {runtimeVersion: [null]}} instead. */
  runtimeVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serverId dimension equals the given value if not null. To query for the null value, use {in: {serverId: [null]}} instead. */
  serverId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose userVersion dimension equals the given value if not null. To query for the null value, use {in: {userVersion: [null]}} instead. */
  userVersion?: InputMaybe<Scalars['String']>;
};

/** Filter for data in AccountEdgeServerInfos. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountEdgeServerInfosFilterIn = {
  /** Selects rows whose bootId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  bootId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose executableSchemaId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  executableSchemaId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose libraryVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  libraryVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose platform dimension is in the given list. A null value in the list means a row with null for that dimension. */
  platform?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose runtimeVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  runtimeVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serverId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serverId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose userVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  userVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type AccountEdgeServerInfosOrderBySpec = {
  column: AccountEdgeServerInfosColumn;
  direction: Ordering;
};

export type AccountEdgeServerInfosRecord = {
  __typename?: 'AccountEdgeServerInfosRecord';
  /** Dimensions of AccountEdgeServerInfos that can be grouped by. */
  groupBy: AccountEdgeServerInfosDimensions;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of AccountErrorStats. */
export enum AccountErrorStatsColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ERRORS_COUNT = 'ERRORS_COUNT',
  PATH = 'PATH',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REQUESTS_WITH_ERRORS_COUNT = 'REQUESTS_WITH_ERRORS_COUNT',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type AccountErrorStatsDimensions = {
  __typename?: 'AccountErrorStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in AccountErrorStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountErrorStatsFilter = {
  and?: InputMaybe<Array<AccountErrorStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<AccountErrorStatsFilterIn>;
  not?: InputMaybe<AccountErrorStatsFilter>;
  or?: InputMaybe<Array<AccountErrorStatsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in AccountErrorStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountErrorStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type AccountErrorStatsMetrics = {
  __typename?: 'AccountErrorStatsMetrics';
  errorsCount: Scalars['Long'];
  requestsWithErrorsCount: Scalars['Long'];
};

export type AccountErrorStatsOrderBySpec = {
  column: AccountErrorStatsColumn;
  direction: Ordering;
};

export type AccountErrorStatsRecord = {
  __typename?: 'AccountErrorStatsRecord';
  /** Dimensions of AccountErrorStats that can be grouped by. */
  groupBy: AccountErrorStatsDimensions;
  /** Metrics of AccountErrorStats that can be aggregated over. */
  metrics: AccountErrorStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of AccountFieldExecutions. */
export enum AccountFieldExecutionsColumn {
  ERRORS_COUNT = 'ERRORS_COUNT',
  ESTIMATED_EXECUTION_COUNT = 'ESTIMATED_EXECUTION_COUNT',
  FIELD_NAME = 'FIELD_NAME',
  OBSERVED_EXECUTION_COUNT = 'OBSERVED_EXECUTION_COUNT',
  PARENT_TYPE = 'PARENT_TYPE',
  REFERENCING_OPERATION_COUNT = 'REFERENCING_OPERATION_COUNT',
  REQUESTS_WITH_ERRORS_COUNT = 'REQUESTS_WITH_ERRORS_COUNT',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type AccountFieldExecutionsDimensions = {
  __typename?: 'AccountFieldExecutionsDimensions';
  fieldName?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in AccountFieldExecutions. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountFieldExecutionsFilter = {
  and?: InputMaybe<Array<AccountFieldExecutionsFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<AccountFieldExecutionsFilterIn>;
  not?: InputMaybe<AccountFieldExecutionsFilter>;
  or?: InputMaybe<Array<AccountFieldExecutionsFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in AccountFieldExecutions. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountFieldExecutionsFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type AccountFieldExecutionsMetrics = {
  __typename?: 'AccountFieldExecutionsMetrics';
  errorsCount: Scalars['Long'];
  estimatedExecutionCount: Scalars['Long'];
  observedExecutionCount: Scalars['Long'];
  referencingOperationCount: Scalars['Long'];
  requestsWithErrorsCount: Scalars['Long'];
};

export type AccountFieldExecutionsOrderBySpec = {
  column: AccountFieldExecutionsColumn;
  direction: Ordering;
};

export type AccountFieldExecutionsRecord = {
  __typename?: 'AccountFieldExecutionsRecord';
  /** Dimensions of AccountFieldExecutions that can be grouped by. */
  groupBy: AccountFieldExecutionsDimensions;
  /** Metrics of AccountFieldExecutions that can be aggregated over. */
  metrics: AccountFieldExecutionsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of AccountFieldLatencies. */
export enum AccountFieldLatenciesColumn {
  FIELD_HISTOGRAM = 'FIELD_HISTOGRAM',
  FIELD_NAME = 'FIELD_NAME',
  PARENT_TYPE = 'PARENT_TYPE',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type AccountFieldLatenciesDimensions = {
  __typename?: 'AccountFieldLatenciesDimensions';
  field?: Maybe<Scalars['String']>;
  fieldName?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in AccountFieldLatencies. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountFieldLatenciesFilter = {
  and?: InputMaybe<Array<AccountFieldLatenciesFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<AccountFieldLatenciesFilterIn>;
  not?: InputMaybe<AccountFieldLatenciesFilter>;
  or?: InputMaybe<Array<AccountFieldLatenciesFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in AccountFieldLatencies. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountFieldLatenciesFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type AccountFieldLatenciesMetrics = {
  __typename?: 'AccountFieldLatenciesMetrics';
  fieldHistogram: DurationHistogram;
};

export type AccountFieldLatenciesOrderBySpec = {
  column: AccountFieldLatenciesColumn;
  direction: Ordering;
};

export type AccountFieldLatenciesRecord = {
  __typename?: 'AccountFieldLatenciesRecord';
  /** Dimensions of AccountFieldLatencies that can be grouped by. */
  groupBy: AccountFieldLatenciesDimensions;
  /** Metrics of AccountFieldLatencies that can be aggregated over. */
  metrics: AccountFieldLatenciesMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of AccountFieldUsage. */
export enum AccountFieldUsageColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ESTIMATED_EXECUTION_COUNT = 'ESTIMATED_EXECUTION_COUNT',
  EXECUTION_COUNT = 'EXECUTION_COUNT',
  FIELD_NAME = 'FIELD_NAME',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  PARENT_TYPE = 'PARENT_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REFERENCING_OPERATION_COUNT = 'REFERENCING_OPERATION_COUNT',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type AccountFieldUsageDimensions = {
  __typename?: 'AccountFieldUsageDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  fieldName?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in AccountFieldUsage. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountFieldUsageFilter = {
  and?: InputMaybe<Array<AccountFieldUsageFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<AccountFieldUsageFilterIn>;
  not?: InputMaybe<AccountFieldUsageFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<AccountFieldUsageFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in AccountFieldUsage. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountFieldUsageFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type AccountFieldUsageMetrics = {
  __typename?: 'AccountFieldUsageMetrics';
  estimatedExecutionCount: Scalars['Long'];
  executionCount: Scalars['Long'];
  referencingOperationCount: Scalars['Long'];
};

export type AccountFieldUsageOrderBySpec = {
  column: AccountFieldUsageColumn;
  direction: Ordering;
};

export type AccountFieldUsageRecord = {
  __typename?: 'AccountFieldUsageRecord';
  /** Dimensions of AccountFieldUsage that can be grouped by. */
  groupBy: AccountFieldUsageDimensions;
  /** Metrics of AccountFieldUsage that can be aggregated over. */
  metrics: AccountFieldUsageMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** A list of graphs that belong to an account. */
export type AccountGraphConnection = {
  __typename?: 'AccountGraphConnection';
  /** A list of edges from the account to its graphs. */
  edges?: Maybe<Array<AccountGraphEdge>>;
  /** A list of graphs attached to the account. */
  nodes?: Maybe<Array<Service>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge between an account and a graph. */
export type AccountGraphEdge = {
  __typename?: 'AccountGraphEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** A graph attached to the account. */
  node?: Maybe<Service>;
};

/** A list of all variants from all graphs attached to the account. */
export type AccountGraphVariantConnection = {
  __typename?: 'AccountGraphVariantConnection';
  /** A list of edges from the account to its variants. */
  edges?: Maybe<Array<AccountGraphVariantEdge>>;
  /** A list of all variants from all graphs attached to the account. */
  nodes?: Maybe<Array<GraphVariant>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge between an account and a graph variant. */
export type AccountGraphVariantEdge = {
  __typename?: 'AccountGraphVariantEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** A variant from a graph attached to the account. */
  node?: Maybe<GraphVariant>;
};

/** Columns of AccountGraphosCloudMetrics. */
export enum AccountGraphosCloudMetricsColumn {
  AGENT_VERSION = 'AGENT_VERSION',
  CLOUD_PROVIDER = 'CLOUD_PROVIDER',
  RESPONSE_SIZE = 'RESPONSE_SIZE',
  RESPONSE_SIZE_THROTTLED = 'RESPONSE_SIZE_THROTTLED',
  ROUTER_ID = 'ROUTER_ID',
  ROUTER_OPERATIONS = 'ROUTER_OPERATIONS',
  ROUTER_OPERATIONS_THROTTLED = 'ROUTER_OPERATIONS_THROTTLED',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  SUBGRAPH_FETCHES = 'SUBGRAPH_FETCHES',
  SUBGRAPH_FETCHES_THROTTLED = 'SUBGRAPH_FETCHES_THROTTLED',
  TIER = 'TIER',
  TIMESTAMP = 'TIMESTAMP'
}

export type AccountGraphosCloudMetricsDimensions = {
  __typename?: 'AccountGraphosCloudMetricsDimensions';
  agentVersion?: Maybe<Scalars['String']>;
  cloudProvider?: Maybe<Scalars['String']>;
  routerId?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  tier?: Maybe<Scalars['String']>;
};

/** Filter for data in AccountGraphosCloudMetrics. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountGraphosCloudMetricsFilter = {
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']>;
  and?: InputMaybe<Array<AccountGraphosCloudMetricsFilter>>;
  /** Selects rows whose cloudProvider dimension equals the given value if not null. To query for the null value, use {in: {cloudProvider: [null]}} instead. */
  cloudProvider?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<AccountGraphosCloudMetricsFilterIn>;
  not?: InputMaybe<AccountGraphosCloudMetricsFilter>;
  or?: InputMaybe<Array<AccountGraphosCloudMetricsFilter>>;
  /** Selects rows whose routerId dimension equals the given value if not null. To query for the null value, use {in: {routerId: [null]}} instead. */
  routerId?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose tier dimension equals the given value if not null. To query for the null value, use {in: {tier: [null]}} instead. */
  tier?: InputMaybe<Scalars['String']>;
};

/** Filter for data in AccountGraphosCloudMetrics. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountGraphosCloudMetricsFilterIn = {
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose cloudProvider dimension is in the given list. A null value in the list means a row with null for that dimension. */
  cloudProvider?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose routerId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  routerId?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose tier dimension is in the given list. A null value in the list means a row with null for that dimension. */
  tier?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type AccountGraphosCloudMetricsMetrics = {
  __typename?: 'AccountGraphosCloudMetricsMetrics';
  responseSize: Scalars['Long'];
  responseSizeThrottled: Scalars['Long'];
  routerOperations: Scalars['Long'];
  routerOperationsThrottled: Scalars['Long'];
  subgraphFetches: Scalars['Long'];
  subgraphFetchesThrottled: Scalars['Long'];
};

export type AccountGraphosCloudMetricsOrderBySpec = {
  column: AccountGraphosCloudMetricsColumn;
  direction: Ordering;
};

export type AccountGraphosCloudMetricsRecord = {
  __typename?: 'AccountGraphosCloudMetricsRecord';
  /** Dimensions of AccountGraphosCloudMetrics that can be grouped by. */
  groupBy: AccountGraphosCloudMetricsDimensions;
  /** Metrics of AccountGraphosCloudMetrics that can be aggregated over. */
  metrics: AccountGraphosCloudMetricsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type AccountInvitation = {
  __typename?: 'AccountInvitation';
  /** An accepted invitation cannot be used anymore */
  acceptedAt?: Maybe<Scalars['Timestamp']>;
  /** Who accepted the invitation */
  acceptedBy?: Maybe<User>;
  /** Time the invitation was created */
  createdAt: Scalars['Timestamp'];
  /** Who created the invitation */
  createdBy?: Maybe<User>;
  email: Scalars['String'];
  id: Scalars['ID'];
  /** Last time we sent an email for the invitation */
  lastSentAt?: Maybe<Scalars['Timestamp']>;
  /** Access role for the invitee */
  role: UserPermission;
};

export type AccountLockDetails = {
  __typename?: 'AccountLockDetails';
  actor?: Maybe<Scalars['String']>;
  reason?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['Timestamp']>;
  type?: Maybe<AccountLockType>;
};

export enum AccountLockType {
  AUTOMATED_TRIAL_END = 'AUTOMATED_TRIAL_END',
  MANUAL = 'MANUAL'
}

export type AccountMembership = {
  __typename?: 'AccountMembership';
  account: Account;
  createdAt: Scalars['Timestamp'];
  /** If this membership is a free seat (based on role) */
  free?: Maybe<Scalars['Boolean']>;
  permission: UserPermission;
  user: User;
};

export type AccountMutation = {
  __typename?: 'AccountMutation';
  /** @deprecated Use saml { addVerificationCert } instead */
  addSamlVerificationCert?: Maybe<Scalars['Void']>;
  auditExport?: Maybe<AuditLogExportMutation>;
  /**
   * Cancel account subscriptions, subscriptions will remain active until the end of the paid period.
   * Currently only works for Recurly subscriptions on team plans.
   */
  cancelSubscriptions?: Maybe<Account>;
  /** Create a CloudOnboarding for this account */
  createCloudOnboarding: CreateOnboardingResult;
  createGraph: GraphCreationResult;
  createOidcConnection?: Maybe<OidcConnection>;
  createSamlConnection?: Maybe<SamlConnection>;
  createStaticInvitation?: Maybe<OrganizationInviteLink>;
  currentSubscription?: Maybe<BillingSubscriptionMutation>;
  /** Delete the account's avatar. Requires Account.canUpdateAvatar to be true. */
  deleteAvatar?: Maybe<AvatarDeleteError>;
  /** If the org is on an enterprise trial, set the end date to a new value. */
  extendTrial?: Maybe<Account>;
  /** Hard delete an account and all associated services */
  hardDelete?: Maybe<Scalars['Void']>;
  /** Get reference to the account ID */
  internalID?: Maybe<Scalars['String']>;
  /** Send an invitation to join the account by E-mail */
  invite?: Maybe<AccountInvitation>;
  /** Lock an account, which limits the functionality available with regard to its graphs. */
  lock?: Maybe<Account>;
  /** See Account type. Field is needed by extending subgraph. */
  name?: Maybe<Scalars['String']>;
  /** Mutations for interacting with an Apollo account's private subgraphs on GraphOS */
  privateSubgraph: PrivateSubgraphMutation;
  /**
   * Reactivate a canceled current subscription.
   * Currently only works for Recurly subscriptions on team plans.
   */
  reactivateCurrentSubscription?: Maybe<Account>;
  /** Delete an invitation */
  removeInvitation?: Maybe<Scalars['Void']>;
  /** Remove a member of the account */
  removeMember?: Maybe<Account>;
  /** Trigger a request for an audit export */
  requestAuditExport?: Maybe<Account>;
  /** Send a new E-mail for an existing invitation */
  resendInvitation?: Maybe<AccountInvitation>;
  revokeStaticInvitation?: Maybe<OrganizationInviteLink>;
  saml?: Maybe<SamlConnectionMutation>;
  /** See Account type. Field is needed by extending subgraph. */
  seats?: Maybe<Seats>;
  /** Apollo admins only: set the billing plan to an arbitrary plan effective immediately terminating any current paid plan. */
  setPlan?: Maybe<Scalars['Void']>;
  /** This is called by the form shown to users after they cancel their team subscription. */
  submitTeamCancellationFeedback?: Maybe<Scalars['Void']>;
  /** Apollo admins only: Terminate the ongoing subscription in the account as soon as possible, without refunds. */
  terminateSubscription?: Maybe<Account>;
  /**
   * Apollo admins only: terminate any ongoing subscriptions in the account, without refunds
   * Currently only works for Recurly subscriptions.
   */
  terminateSubscriptions?: Maybe<Account>;
  trackTermsAccepted?: Maybe<Scalars['Void']>;
  /** Unlock a locked account. */
  unlock?: Maybe<Account>;
  /** Update the billing address for a Recurly token */
  updateBillingAddress?: Maybe<Account>;
  /** Update the billing information from a Recurly token */
  updateBillingInfo?: Maybe<Scalars['Void']>;
  updateCompanyUrl?: Maybe<Account>;
  /** Set the E-mail address of the account, used notably for billing */
  updateEmail?: Maybe<Scalars['Void']>;
  /** Update the account ID */
  updateID?: Maybe<Account>;
  /** Update the company name */
  updateName?: Maybe<Scalars['Void']>;
  /** Apollo admins only: enable or disable an account for PingOne SSO login */
  updatePingOneSSOIDPID?: Maybe<Account>;
  /** Updates the role assigned to new SSO users. */
  updateSSODefaultRole?: Maybe<OrganizationSSO>;
  /** A (currently) internal to Apollo mutation to update a user's role within an organization */
  updateUserPermission?: Maybe<User>;
};


export type AccountMutationaddSamlVerificationCertArgs = {
  pem: Scalars['String'];
};


export type AccountMutationauditExportArgs = {
  id: Scalars['String'];
};


export type AccountMutationcreateCloudOnboardingArgs = {
  input: CloudOnboardingInput;
};


export type AccountMutationcreateGraphArgs = {
  graphType: GraphType;
  hiddenFromUninvitedNonAdmin: Scalars['Boolean'];
  id: Scalars['ID'];
  title: Scalars['String'];
  variantCreationConfig?: InputMaybe<VariantCreationConfig>;
};


export type AccountMutationcreateOidcConnectionArgs = {
  connection: OidcConnectionInput;
  enabled?: InputMaybe<Scalars['Boolean']>;
};


export type AccountMutationcreateSamlConnectionArgs = {
  connection: SamlConnectionInput;
  enabled?: InputMaybe<Scalars['Boolean']>;
};


export type AccountMutationcreateStaticInvitationArgs = {
  role: UserPermission;
};


export type AccountMutationinviteArgs = {
  email: Scalars['String'];
  role?: InputMaybe<UserPermission>;
};


export type AccountMutationlockArgs = {
  reason?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<AccountLockType>;
};


export type AccountMutationremoveInvitationArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type AccountMutationremoveMemberArgs = {
  id: Scalars['ID'];
};


export type AccountMutationrequestAuditExportArgs = {
  actors?: InputMaybe<Array<ActorInput>>;
  from: Scalars['Timestamp'];
  graphIds?: InputMaybe<Array<Scalars['String']>>;
  to: Scalars['Timestamp'];
};


export type AccountMutationresendInvitationArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type AccountMutationrevokeStaticInvitationArgs = {
  token: Scalars['String'];
};


export type AccountMutationsetPlanArgs = {
  id: Scalars['ID'];
};


export type AccountMutationsubmitTeamCancellationFeedbackArgs = {
  feedback: Scalars['String'];
};


export type AccountMutationterminateSubscriptionArgs = {
  providerId: Scalars['ID'];
};


export type AccountMutationtrackTermsAcceptedArgs = {
  at: Scalars['Timestamp'];
};


export type AccountMutationupdateBillingAddressArgs = {
  billingAddress: BillingAddressInput;
};


export type AccountMutationupdateBillingInfoArgs = {
  token: Scalars['String'];
};


export type AccountMutationupdateCompanyUrlArgs = {
  companyUrl?: InputMaybe<Scalars['String']>;
};


export type AccountMutationupdateEmailArgs = {
  email: Scalars['String'];
};


export type AccountMutationupdateIDArgs = {
  id: Scalars['ID'];
};


export type AccountMutationupdateNameArgs = {
  name: Scalars['String'];
};


export type AccountMutationupdatePingOneSSOIDPIDArgs = {
  idpid?: InputMaybe<Scalars['String']>;
};


export type AccountMutationupdateSSODefaultRoleArgs = {
  role: UserPermission;
};


export type AccountMutationupdateUserPermissionArgs = {
  permission: UserPermission;
  userID: Scalars['ID'];
};

/** Columns of AccountOperationCheckStats. */
export enum AccountOperationCheckStatsColumn {
  CACHED_REQUESTS_COUNT = 'CACHED_REQUESTS_COUNT',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP',
  UNCACHED_REQUESTS_COUNT = 'UNCACHED_REQUESTS_COUNT'
}

export type AccountOperationCheckStatsDimensions = {
  __typename?: 'AccountOperationCheckStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in AccountOperationCheckStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountOperationCheckStatsFilter = {
  and?: InputMaybe<Array<AccountOperationCheckStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<AccountOperationCheckStatsFilterIn>;
  not?: InputMaybe<AccountOperationCheckStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<AccountOperationCheckStatsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in AccountOperationCheckStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountOperationCheckStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type AccountOperationCheckStatsMetrics = {
  __typename?: 'AccountOperationCheckStatsMetrics';
  cachedRequestsCount: Scalars['Long'];
  uncachedRequestsCount: Scalars['Long'];
};

export type AccountOperationCheckStatsOrderBySpec = {
  column: AccountOperationCheckStatsColumn;
  direction: Ordering;
};

export type AccountOperationCheckStatsRecord = {
  __typename?: 'AccountOperationCheckStatsRecord';
  /** Dimensions of AccountOperationCheckStats that can be grouped by. */
  groupBy: AccountOperationCheckStatsDimensions;
  /** Metrics of AccountOperationCheckStats that can be aggregated over. */
  metrics: AccountOperationCheckStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type AccountOperationUsage = {
  __typename?: 'AccountOperationUsage';
  selfHosted: BillableMetricStats;
  serverless: BillableMetricStats;
  totalOperations: BillableMetricStats;
};

export type AccountOperationUsageWindowInput = {
  from: Scalars['Date'];
  limit?: Scalars['Int'];
  to: Scalars['Date'];
  windowSize?: BillingUsageStatsWindowSize;
};

export type AccountPublishesStatsMetrics = {
  __typename?: 'AccountPublishesStatsMetrics';
  totalPublishes: Scalars['Long'];
};

export type AccountPublishesStatsRecord = {
  __typename?: 'AccountPublishesStatsRecord';
  id: Scalars['ID'];
  metrics: AccountPublishesStatsMetrics;
  timestamp: Scalars['Timestamp'];
};

/** Columns of AccountQueryStats. */
export enum AccountQueryStatsColumn {
  CACHED_HISTOGRAM = 'CACHED_HISTOGRAM',
  CACHED_REQUESTS_COUNT = 'CACHED_REQUESTS_COUNT',
  CACHE_TTL_HISTOGRAM = 'CACHE_TTL_HISTOGRAM',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  FORBIDDEN_OPERATION_COUNT = 'FORBIDDEN_OPERATION_COUNT',
  FROM_ENGINEPROXY = 'FROM_ENGINEPROXY',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REGISTERED_OPERATION_COUNT = 'REGISTERED_OPERATION_COUNT',
  REQUESTS_WITH_ERRORS_COUNT = 'REQUESTS_WITH_ERRORS_COUNT',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP',
  UNCACHED_HISTOGRAM = 'UNCACHED_HISTOGRAM',
  UNCACHED_REQUESTS_COUNT = 'UNCACHED_REQUESTS_COUNT'
}

export type AccountQueryStatsDimensions = {
  __typename?: 'AccountQueryStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  fromEngineproxy?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  querySignatureLength?: Maybe<Scalars['Int']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in AccountQueryStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountQueryStatsFilter = {
  and?: InputMaybe<Array<AccountQueryStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose fromEngineproxy dimension equals the given value if not null. To query for the null value, use {in: {fromEngineproxy: [null]}} instead. */
  fromEngineproxy?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<AccountQueryStatsFilterIn>;
  not?: InputMaybe<AccountQueryStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<AccountQueryStatsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in AccountQueryStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountQueryStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose fromEngineproxy dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fromEngineproxy?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type AccountQueryStatsMetrics = {
  __typename?: 'AccountQueryStatsMetrics';
  cacheTtlHistogram: DurationHistogram;
  cachedHistogram: DurationHistogram;
  cachedRequestsCount: Scalars['Long'];
  forbiddenOperationCount: Scalars['Long'];
  registeredOperationCount: Scalars['Long'];
  requestsWithErrorsCount: Scalars['Long'];
  totalLatencyHistogram: DurationHistogram;
  totalRequestCount: Scalars['Long'];
  uncachedHistogram: DurationHistogram;
  uncachedRequestsCount: Scalars['Long'];
};

export type AccountQueryStatsOrderBySpec = {
  column: AccountQueryStatsColumn;
  direction: Ordering;
};

export type AccountQueryStatsRecord = {
  __typename?: 'AccountQueryStatsRecord';
  /** Dimensions of AccountQueryStats that can be grouped by. */
  groupBy: AccountQueryStatsDimensions;
  /** Metrics of AccountQueryStats that can be aggregated over. */
  metrics: AccountQueryStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type AccountRoles = {
  __typename?: 'AccountRoles';
  canAudit: Scalars['Boolean'];
  canCreateService: Scalars['Boolean'];
  canDelete: Scalars['Boolean'];
  canManageMembers: Scalars['Boolean'];
  canQuery: Scalars['Boolean'];
  canQueryAudit: Scalars['Boolean'];
  canQueryBillingInfo: Scalars['Boolean'];
  canQueryMembers: Scalars['Boolean'];
  canQueryStats: Scalars['Boolean'];
  canReadTickets: Scalars['Boolean'];
  canRemoveMembers: Scalars['Boolean'];
  canSetConstrainedPlan: Scalars['Boolean'];
  canUpdateBillingInfo: Scalars['Boolean'];
  canUpdateMetadata: Scalars['Boolean'];
};

export enum AccountState {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  UNKNOWN = 'UNKNOWN',
  UNPROVISIONED = 'UNPROVISIONED'
}

/** A time window with a specified granularity over a given account. */
export type AccountStatsWindow = {
  __typename?: 'AccountStatsWindow';
  billingUsageStats: Array<AccountBillingUsageStatsRecord>;
  edgeServerInfos: Array<AccountEdgeServerInfosRecord>;
  errorStats: Array<AccountErrorStatsRecord>;
  fieldExecutions: Array<AccountFieldExecutionsRecord>;
  fieldLatencies: Array<AccountFieldLatenciesRecord>;
  fieldUsage: Array<AccountFieldUsageRecord>;
  graphosCloudMetrics: Array<AccountGraphosCloudMetricsRecord>;
  operationCheckStats: Array<AccountOperationCheckStatsRecord>;
  queryStats: Array<AccountQueryStatsRecord>;
  /** From field rounded down to the nearest resolution. */
  roundedDownFrom: Scalars['Timestamp'];
  /** To field rounded up to the nearest resolution. */
  roundedUpTo: Scalars['Timestamp'];
  tracePathErrorsRefs: Array<AccountTracePathErrorsRefsRecord>;
  traceRefs: Array<AccountTraceRefsRecord>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowbillingUsageStatsArgs = {
  filter?: InputMaybe<AccountBillingUsageStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountBillingUsageStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowedgeServerInfosArgs = {
  filter?: InputMaybe<AccountEdgeServerInfosFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountEdgeServerInfosOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowerrorStatsArgs = {
  filter?: InputMaybe<AccountErrorStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowfieldExecutionsArgs = {
  filter?: InputMaybe<AccountFieldExecutionsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountFieldExecutionsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowfieldLatenciesArgs = {
  filter?: InputMaybe<AccountFieldLatenciesFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountFieldLatenciesOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowfieldUsageArgs = {
  filter?: InputMaybe<AccountFieldUsageFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountFieldUsageOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowgraphosCloudMetricsArgs = {
  filter?: InputMaybe<AccountGraphosCloudMetricsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountGraphosCloudMetricsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowoperationCheckStatsArgs = {
  filter?: InputMaybe<AccountOperationCheckStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountOperationCheckStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowqueryStatsArgs = {
  filter?: InputMaybe<AccountQueryStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountQueryStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowtracePathErrorsRefsArgs = {
  filter?: InputMaybe<AccountTracePathErrorsRefsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountTracePathErrorsRefsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowtraceRefsArgs = {
  filter?: InputMaybe<AccountTraceRefsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountTraceRefsOrderBySpec>>;
};

/** Columns of AccountTracePathErrorsRefs. */
export enum AccountTracePathErrorsRefsColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  DURATION_BUCKET = 'DURATION_BUCKET',
  ERRORS_COUNT_IN_PATH = 'ERRORS_COUNT_IN_PATH',
  ERRORS_COUNT_IN_TRACE = 'ERRORS_COUNT_IN_TRACE',
  ERROR_MESSAGE = 'ERROR_MESSAGE',
  PATH = 'PATH',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP',
  TRACE_HTTP_STATUS_CODE = 'TRACE_HTTP_STATUS_CODE',
  TRACE_ID = 'TRACE_ID',
  TRACE_SIZE_BYTES = 'TRACE_SIZE_BYTES',
  TRACE_STARTS_AT = 'TRACE_STARTS_AT'
}

export type AccountTracePathErrorsRefsDimensions = {
  __typename?: 'AccountTracePathErrorsRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationBucket?: Maybe<Scalars['Int']>;
  errorMessage?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  traceHttpStatusCode?: Maybe<Scalars['Int']>;
  traceId?: Maybe<Scalars['ID']>;
  traceStartsAt?: Maybe<Scalars['Timestamp']>;
};

/** Filter for data in AccountTracePathErrorsRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountTracePathErrorsRefsFilter = {
  and?: InputMaybe<Array<AccountTracePathErrorsRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']>;
  /** Selects rows whose errorMessage dimension equals the given value if not null. To query for the null value, use {in: {errorMessage: [null]}} instead. */
  errorMessage?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<AccountTracePathErrorsRefsFilterIn>;
  not?: InputMaybe<AccountTracePathErrorsRefsFilter>;
  or?: InputMaybe<Array<AccountTracePathErrorsRefsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose traceHttpStatusCode dimension equals the given value if not null. To query for the null value, use {in: {traceHttpStatusCode: [null]}} instead. */
  traceHttpStatusCode?: InputMaybe<Scalars['Int']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in AccountTracePathErrorsRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountTracePathErrorsRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  /** Selects rows whose errorMessage dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorMessage?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose traceHttpStatusCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceHttpStatusCode?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type AccountTracePathErrorsRefsMetrics = {
  __typename?: 'AccountTracePathErrorsRefsMetrics';
  errorsCountInPath: Scalars['Long'];
  errorsCountInTrace: Scalars['Long'];
  traceSizeBytes: Scalars['Long'];
};

export type AccountTracePathErrorsRefsOrderBySpec = {
  column: AccountTracePathErrorsRefsColumn;
  direction: Ordering;
};

export type AccountTracePathErrorsRefsRecord = {
  __typename?: 'AccountTracePathErrorsRefsRecord';
  /** Dimensions of AccountTracePathErrorsRefs that can be grouped by. */
  groupBy: AccountTracePathErrorsRefsDimensions;
  /** Metrics of AccountTracePathErrorsRefs that can be aggregated over. */
  metrics: AccountTracePathErrorsRefsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of AccountTraceRefs. */
export enum AccountTraceRefsColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  DURATION_BUCKET = 'DURATION_BUCKET',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP',
  TRACE_COUNT = 'TRACE_COUNT',
  TRACE_ID = 'TRACE_ID'
}

export type AccountTraceRefsDimensions = {
  __typename?: 'AccountTraceRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationBucket?: Maybe<Scalars['Int']>;
  generatedTraceId?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  traceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in AccountTraceRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountTraceRefsFilter = {
  and?: InputMaybe<Array<AccountTraceRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<AccountTraceRefsFilterIn>;
  not?: InputMaybe<AccountTraceRefsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<AccountTraceRefsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in AccountTraceRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountTraceRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type AccountTraceRefsMetrics = {
  __typename?: 'AccountTraceRefsMetrics';
  traceCount: Scalars['Long'];
};

export type AccountTraceRefsOrderBySpec = {
  column: AccountTraceRefsColumn;
  direction: Ordering;
};

export type AccountTraceRefsRecord = {
  __typename?: 'AccountTraceRefsRecord';
  /** Dimensions of AccountTraceRefs that can be grouped by. */
  groupBy: AccountTraceRefsDimensions;
  /** Metrics of AccountTraceRefs that can be aggregated over. */
  metrics: AccountTraceRefsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Represents an actor that performs actions in Apollo Studio. Most actors are either a `USER` or a `GRAPH` (based on a request's provided API key), and they have the corresponding `ActorType`. */
export type Actor = {
  __typename?: 'Actor';
  actorId: Scalars['ID'];
  type: ActorType;
};

/** Input type to provide when specifying an `Actor` in operation arguments. See also the `Actor` object type. */
export type ActorInput = {
  actorId: Scalars['ID'];
  type: ActorType;
};

export enum ActorType {
  ANONYMOUS_USER = 'ANONYMOUS_USER',
  BACKFILL = 'BACKFILL',
  CRON = 'CRON',
  GRAPH = 'GRAPH',
  INTERNAL_IDENTITY = 'INTERNAL_IDENTITY',
  SYNCHRONIZATION = 'SYNCHRONIZATION',
  SYSTEM = 'SYSTEM',
  USER = 'USER'
}

/** parentCommentId is only present for replies. schemaCoordinate & subgraph are only present for initial change comments. If all are absent, this is a general parent comment on the proposal. */
export type AddCommentInput = {
  message: Scalars['String'];
  parentCommentId?: InputMaybe<Scalars['String']>;
  revisionId: Scalars['String'];
  schemaCoordinate?: InputMaybe<Scalars['String']>;
  schemaScope?: InputMaybe<Scalars['String']>;
  usersToNotify?: InputMaybe<Array<Scalars['String']>>;
};

export type AddCommentResult = NotFoundError | ParentChangeProposalComment | ParentGeneralProposalComment | ReplyChangeProposalComment | ReplyGeneralProposalComment | ValidationError;

export type AddOperationCollectionEntriesResult = AddOperationCollectionEntriesSuccess | PermissionError | ValidationError;

export type AddOperationCollectionEntriesSuccess = {
  __typename?: 'AddOperationCollectionEntriesSuccess';
  operationCollectionEntries: Array<OperationCollectionEntry>;
};

export type AddOperationCollectionEntryResult = OperationCollectionEntry | PermissionError | ValidationError;

export type AddOperationCollectionToVariantResult = GraphVariant | InvalidTarget | PermissionError | ValidationError;

export type AddOperationInput = {
  /** The operation's fields. */
  document: OperationCollectionEntryStateInput;
  /** The operation's name. */
  name: Scalars['String'];
};

export type AdminUser = {
  __typename?: 'AdminUser';
  created_at: Scalars['Timestamp'];
  email: Scalars['String'];
  id: Scalars['ID'];
  team: Scalars['String'];
};

export type AffectedClient = {
  __typename?: 'AffectedClient';
  /**
   * ID, often the name, of the client set by the user and reported alongside metrics
   * @deprecated Unsupported.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * version of the client set by the user and reported alongside metrics
   * @deprecated Unsupported.
   */
  clientVersion?: Maybe<Scalars['String']>;
};

export type AffectedQuery = {
  __typename?: 'AffectedQuery';
  /** If the operation would be approved if the check ran again. Returns null if queried from SchemaDiff.changes.affectedQueries.alreadyApproved */
  alreadyApproved?: Maybe<Scalars['Boolean']>;
  /** If the operation would be ignored if the check ran again */
  alreadyIgnored?: Maybe<Scalars['Boolean']>;
  /** List of changes affecting this query. Returns null if queried from SchemaDiff.changes.affectedQueries.changes */
  changes?: Maybe<Array<ChangeOnOperation>>;
  /** Name to display to the user for the operation */
  displayName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  /** Determines if this query validates against the proposed schema */
  isValid?: Maybe<Scalars['Boolean']>;
  /** Whether this operation was ignored and its severity was downgraded for that reason */
  markedAsIgnored?: Maybe<Scalars['Boolean']>;
  /** Whether the changes were marked as safe and its severity was downgraded for that reason */
  markedAsSafe?: Maybe<Scalars['Boolean']>;
  /** Name provided for the operation, which can be empty string if it is an anonymous operation */
  name?: Maybe<Scalars['String']>;
  /** First 128 characters of query signature for display */
  signature?: Maybe<Scalars['String']>;
};

/**
 * Represents an API key that's used to authenticate a
 * particular Apollo user or graph.
 */
export type ApiKey = {
  /** The API key's ID. */
  id: Scalars['ID'];
  /** The API key's name, for distinguishing it from other keys. */
  keyName?: Maybe<Scalars['String']>;
  /** The value of the API key. **This is a secret credential!** */
  token: Scalars['String'];
};

export type ApiKeyProvision = {
  __typename?: 'ApiKeyProvision';
  apiKey: ApiKey;
  created: Scalars['Boolean'];
};

/** A generic event for the `trackApolloKotlinUsage` mutation */
export type ApolloKotlinUsageEventInput = {
  /** When the event occurred */
  date: Scalars['Timestamp'];
  /** Optional parameters attached to the event */
  payload?: InputMaybe<Scalars['Object']>;
  /** Type of event */
  type: Scalars['ID'];
};

/** A generic property for the `trackApolloKotlinUsage` mutation */
export type ApolloKotlinUsagePropertyInput = {
  /** Optional parameters attached to the property */
  payload?: InputMaybe<Scalars['Object']>;
  /** Type of property */
  type: Scalars['ID'];
};

export enum AuditAction {
  BroadcastMessage = 'BroadcastMessage',
  CreateMessage = 'CreateMessage',
  EditMessage = 'EditMessage',
  RecallMessage = 'RecallMessage',
  TestMessage = 'TestMessage',
  UpdateMessageState = 'UpdateMessageState'
}

export type AuditLog = {
  __typename?: 'AuditLog';
  action: Scalars['String'];
  changeLog?: Maybe<Scalars['JSON']>;
  channel?: Maybe<SlackCommunicationChannel>;
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  message?: Maybe<Message>;
  slackMessageId?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
};

export type AuditLogExport = {
  __typename?: 'AuditLogExport';
  /** The list of actors to filter the audit export */
  actors?: Maybe<Array<Identity>>;
  bigqueryTriggeredAt?: Maybe<Scalars['Timestamp']>;
  /** The time when the audit export was completed */
  completedAt?: Maybe<Scalars['Timestamp']>;
  /** The time when the audit export was reqeusted */
  createdAt: Scalars['Timestamp'];
  /** List of URLs to download the audits for the requested range */
  downloadUrls?: Maybe<Array<Scalars['String']>>;
  exportedFiles?: Maybe<Array<Scalars['String']>>;
  /** The starting point of audits to include in export */
  from: Scalars['Timestamp'];
  /** The list of graphs to filter the audit export */
  graphs?: Maybe<Array<Service>>;
  /** The id for the audit export */
  id: Scalars['ID'];
  /** The user that initiated the audit export */
  requester?: Maybe<User>;
  /** The status of the audit export */
  status: AuditStatus;
  /** The end point of audits to include in export */
  to: Scalars['Timestamp'];
};

export type AuditLogExportMutation = {
  __typename?: 'AuditLogExportMutation';
  cancel?: Maybe<Account>;
  delete?: Maybe<Account>;
};

export enum AuditStatus {
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS',
  QUEUED = 'QUEUED'
}

export type AvatarDeleteError = {
  __typename?: 'AvatarDeleteError';
  clientMessage: Scalars['String'];
  code: AvatarDeleteErrorCode;
  serverMessage: Scalars['String'];
};

export enum AvatarDeleteErrorCode {
  SSO_USERS_CANNOT_DELETE_SELF_AVATAR = 'SSO_USERS_CANNOT_DELETE_SELF_AVATAR'
}

export type AvatarUploadError = {
  __typename?: 'AvatarUploadError';
  clientMessage: Scalars['String'];
  code: AvatarUploadErrorCode;
  serverMessage: Scalars['String'];
};

export enum AvatarUploadErrorCode {
  SSO_USERS_CANNOT_UPLOAD_SELF_AVATAR = 'SSO_USERS_CANNOT_UPLOAD_SELF_AVATAR'
}

export type AvatarUploadResult = AvatarUploadError | MediaUploadInfo;

/** AWS Load Balancer information */
export type AwsLoadBalancer = {
  __typename?: 'AwsLoadBalancer';
  /** ARN for the load balancer */
  arn: Scalars['String'];
  /** DNS endpoint for the load balancer */
  endpoint: Scalars['String'];
  /** ARN for the HTTPS listener for the load balancer */
  listenerArn: Scalars['String'];
};

/** Input for AWS Load Balancer */
export type AwsLoadBalancerInput = {
  arn: Scalars['String'];
  endpoint: Scalars['String'];
  listenerArn: Scalars['String'];
};

/** AWS-specific information for a Shard */
export type AwsShard = {
  __typename?: 'AwsShard';
  /** AWS Account ID where the Shard is hosted */
  accountId: Scalars['String'];
  /** ARNs of the target groups for paused Cloud Routers */
  coldStartTargetGroupArns?: Maybe<Array<Scalars['String']>>;
  /** ARN of the ECS Cluster */
  ecsClusterArn: Scalars['String'];
  /** ARN of the IAM role to perform provisioning operations on this shard */
  iamRoleArn: Scalars['String'];
  /** ID of the security group for the load balancer */
  loadbalancerSecurityGroupId: Scalars['String'];
  /** Load balancers for this Cloud Router */
  loadbalancers: Array<AwsLoadBalancer>;
  /** ARN of the IAM permissions boundaries for IAM roles provisioned in this shard */
  permissionsBoundaryArn: Scalars['String'];
  /** IDs of the subnets */
  subnetIds: Array<Scalars['String']>;
  /** ID of the VPC */
  vpcId: Scalars['String'];
};

export type BillableMetricStats = {
  __typename?: 'BillableMetricStats';
  planThreshold?: Maybe<Scalars['Int']>;
  stats: Array<MetricStatWindow>;
};

export type BillingAddress = {
  __typename?: 'BillingAddress';
  address1?: Maybe<Scalars['String']>;
  address2?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

/** Billing address input */
export type BillingAddressInput = {
  address1: Scalars['String'];
  address2?: InputMaybe<Scalars['String']>;
  city: Scalars['String'];
  country: Scalars['String'];
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type BillingAdminQuery = {
  __typename?: 'BillingAdminQuery';
  /** Look up the current plan of an account by calling the grpc service */
  currentPlanFromGrpc?: Maybe<GQLBillingPlanFromGrpc>;
};


export type BillingAdminQuerycurrentPlanFromGrpcArgs = {
  internalAccountId: Scalars['ID'];
};

export type BillingCapability = {
  __typename?: 'BillingCapability';
  defaultValue: Scalars['Boolean'];
  intendedUse: Scalars['String'];
  label: Scalars['String'];
};

/** Billing capability input */
export type BillingCapabilityInput = {
  defaultValue: Scalars['Boolean'];
  intendedUse: Scalars['String'];
  label: Scalars['String'];
};

export type BillingInfo = {
  __typename?: 'BillingInfo';
  address: BillingAddress;
  cardType?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastFour?: Maybe<Scalars['Int']>;
  lastName?: Maybe<Scalars['String']>;
  month?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  vatNumber?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['Int']>;
};

export type BillingInsights = {
  __typename?: 'BillingInsights';
  totalOperations: Array<BillingInsightsUsage>;
  totalSampledOperations: Array<BillingInsightsUsage>;
};

export type BillingInsightsUsage = {
  __typename?: 'BillingInsightsUsage';
  timestamp: Scalars['Timestamp'];
  totalOperationCount: Scalars['Long'];
};

export type BillingLimit = {
  __typename?: 'BillingLimit';
  defaultValue: Scalars['Long'];
  intendedUse: Scalars['String'];
  label: Scalars['String'];
};

/** Billing limit input */
export type BillingLimitInput = {
  defaultValue: Scalars['Long'];
  intendedUse: Scalars['String'];
  label: Scalars['String'];
};

export enum BillingModel {
  REQUEST_BASED = 'REQUEST_BASED',
  SEAT_BASED = 'SEAT_BASED'
}

export type BillingMonth = {
  __typename?: 'BillingMonth';
  end: Scalars['Timestamp'];
  requests: Scalars['Long'];
  start: Scalars['Timestamp'];
};

export type BillingMutation = {
  __typename?: 'BillingMutation';
  /** Temporary utility mutation to convert annual team plan orgs to monthly team plans */
  convertAnnualTeamOrgToMonthly?: Maybe<Scalars['Void']>;
  createSetupIntent?: Maybe<SetupIntentResult>;
  endPaidUsageBasedPlan?: Maybe<EndUsageBasedPlanResult>;
  reloadPlans: Array<BillingPlan>;
  startFreeUsageBasedPlan?: Maybe<StartUsageBasedPlanResult>;
  startUsageBasedPlan?: Maybe<StartUsageBasedPlanResult>;
  /** @deprecated No longer supported */
  syncAccountWithProviders?: Maybe<SyncBillingAccountResult>;
  updatePaymentMethod?: Maybe<UpdatePaymentMethodResult>;
};


export type BillingMutationconvertAnnualTeamOrgToMonthlyArgs = {
  internalAccountId: Scalars['ID'];
};


export type BillingMutationcreateSetupIntentArgs = {
  internalAccountId: Scalars['ID'];
};


export type BillingMutationendPaidUsageBasedPlanArgs = {
  internalAccountId: Scalars['ID'];
};


export type BillingMutationstartFreeUsageBasedPlanArgs = {
  internalAccountId: Scalars['ID'];
};


export type BillingMutationstartUsageBasedPlanArgs = {
  internalAccountId: Scalars['ID'];
  paymentMethodId: Scalars['String'];
};


export type BillingMutationsyncAccountWithProvidersArgs = {
  internalAccountId: Scalars['ID'];
};


export type BillingMutationupdatePaymentMethodArgs = {
  internalAccountId: Scalars['ID'];
  paymentMethodId: Scalars['String'];
};

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUALLY = 'SEMI_ANNUALLY',
  YEARLY = 'YEARLY'
}

export type BillingPlan = {
  __typename?: 'BillingPlan';
  addons: Array<BillingPlanAddon>;
  /** Retrieve all capabilities for the plan */
  allCapabilities: Array<BillingPlanCapability>;
  /** Retrieve a list of all effective capability limits for this plan */
  allLimits: Array<BillingPlanLimit>;
  billingModel: BillingModel;
  billingPeriod?: Maybe<BillingPeriod>;
  /** @deprecated capabilities have been flattened into the BillingPlan type */
  capabilities: BillingPlanCapabilities;
  clientVersions: Scalars['Boolean'];
  clients: Scalars['Boolean'];
  contracts: Scalars['Boolean'];
  datadog: Scalars['Boolean'];
  description?: Maybe<Scalars['String']>;
  /** Retrieve the limit applied to this plan for a capability */
  effectiveLimit?: Maybe<Scalars['Long']>;
  errors: Scalars['Boolean'];
  federation: Scalars['Boolean'];
  /** Check whether a capability is enabled for the plan */
  hasCapability?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  isTrial: Scalars['Boolean'];
  kind: BillingPlanKind;
  launches: Scalars['Boolean'];
  maxAuditInDays: Scalars['Int'];
  maxRangeInDays?: Maybe<Scalars['Int']>;
  /** The maximum number of days that checks stats will be stored */
  maxRangeInDaysForChecks?: Maybe<Scalars['Int']>;
  maxRequestsPerMonth?: Maybe<Scalars['Long']>;
  metrics: Scalars['Boolean'];
  name: Scalars['String'];
  notifications: Scalars['Boolean'];
  operationRegistry: Scalars['Boolean'];
  persistedQueries: Scalars['Boolean'];
  /** The price of every seat */
  pricePerSeatInUsdCents?: Maybe<Scalars['Int']>;
  /** The price of subscribing to this plan with a quantity of 1 (currently always the case) */
  pricePerUnitInUsdCents: Scalars['Int'];
  /** Whether the plan is accessible by all users in QueryRoot.allPlans, QueryRoot.plan, or AccountMutation.setPlan */
  public: Scalars['Boolean'];
  ranges: Array<Scalars['String']>;
  schemaValidation: Scalars['Boolean'];
  tier: BillingPlanTier;
  traces: Scalars['Boolean'];
  userRoles: Scalars['Boolean'];
  webhooks: Scalars['Boolean'];
};


export type BillingPlaneffectiveLimitArgs = {
  label: Scalars['String'];
};


export type BillingPlanhasCapabilityArgs = {
  label: Scalars['String'];
};

export type BillingPlanAddon = {
  __typename?: 'BillingPlanAddon';
  id: Scalars['ID'];
  pricePerUnitInUsdCents: Scalars['Int'];
};

/** Billing plan addon input */
export type BillingPlanAddonInput = {
  code?: InputMaybe<Scalars['String']>;
  usdCentsPrice?: InputMaybe<Scalars['Int']>;
};

export type BillingPlanCapabilities = {
  __typename?: 'BillingPlanCapabilities';
  clientVersions: Scalars['Boolean'];
  clients: Scalars['Boolean'];
  contracts: Scalars['Boolean'];
  datadog: Scalars['Boolean'];
  errors: Scalars['Boolean'];
  federation: Scalars['Boolean'];
  launches: Scalars['Boolean'];
  maxAuditInDays: Scalars['Int'];
  maxRangeInDays?: Maybe<Scalars['Int']>;
  maxRangeInDaysForChecks?: Maybe<Scalars['Int']>;
  maxRequestsPerMonth?: Maybe<Scalars['Long']>;
  metrics: Scalars['Boolean'];
  notifications: Scalars['Boolean'];
  operationRegistry: Scalars['Boolean'];
  persistedQueries: Scalars['Boolean'];
  ranges: Array<Scalars['String']>;
  schemaValidation: Scalars['Boolean'];
  traces: Scalars['Boolean'];
  userRoles: Scalars['Boolean'];
  webhooks: Scalars['Boolean'];
};

export type BillingPlanCapability = {
  __typename?: 'BillingPlanCapability';
  label: Scalars['String'];
  plan: BillingPlan;
  value: Scalars['Boolean'];
};

/** Billing plan input */
export type BillingPlanInput = {
  addons: Array<BillingPlanAddonInput>;
  billingModel: BillingModel;
  billingPeriod: BillingPeriod;
  clientVersions?: InputMaybe<Scalars['Boolean']>;
  clients?: InputMaybe<Scalars['Boolean']>;
  contracts?: InputMaybe<Scalars['Boolean']>;
  datadog?: InputMaybe<Scalars['Boolean']>;
  description: Scalars['String'];
  errors?: InputMaybe<Scalars['Boolean']>;
  federation?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  kind: BillingPlanKind;
  launches?: InputMaybe<Scalars['Boolean']>;
  maxAuditInDays?: InputMaybe<Scalars['Int']>;
  maxRangeInDays?: InputMaybe<Scalars['Int']>;
  maxRangeInDaysForChecks?: InputMaybe<Scalars['Int']>;
  maxRequestsPerMonth?: InputMaybe<Scalars['Long']>;
  metrics?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  notifications?: InputMaybe<Scalars['Boolean']>;
  operationRegistry?: InputMaybe<Scalars['Boolean']>;
  persistedQueries?: InputMaybe<Scalars['Boolean']>;
  pricePerSeatInUsdCents?: InputMaybe<Scalars['Int']>;
  pricePerUnitInUsdCents?: InputMaybe<Scalars['Int']>;
  public: Scalars['Boolean'];
  schemaValidation?: InputMaybe<Scalars['Boolean']>;
  traces?: InputMaybe<Scalars['Boolean']>;
  userRoles?: InputMaybe<Scalars['Boolean']>;
  webhooks?: InputMaybe<Scalars['Boolean']>;
};

export enum BillingPlanKind {
  COMMUNITY = 'COMMUNITY',
  DEDICATED = 'DEDICATED',
  ENTERPRISE_INTERNAL = 'ENTERPRISE_INTERNAL',
  ENTERPRISE_PAID = 'ENTERPRISE_PAID',
  ENTERPRISE_PILOT = 'ENTERPRISE_PILOT',
  ENTERPRISE_TRIAL = 'ENTERPRISE_TRIAL',
  ONE_FREE = 'ONE_FREE',
  ONE_PAID = 'ONE_PAID',
  SERVERLESS = 'SERVERLESS',
  SERVERLESS_FREE = 'SERVERLESS_FREE',
  SERVERLESS_PAID = 'SERVERLESS_PAID',
  STARTER = 'STARTER',
  TEAM_PAID = 'TEAM_PAID',
  TEAM_TRIAL = 'TEAM_TRIAL',
  UNKNOWN = 'UNKNOWN'
}

export type BillingPlanLimit = {
  __typename?: 'BillingPlanLimit';
  label: Scalars['String'];
  plan: BillingPlan;
  value: Scalars['Long'];
};

export type BillingPlanMutation = {
  __typename?: 'BillingPlanMutation';
  /** Archive this billing plan */
  archive?: Maybe<Scalars['Void']>;
  /** Remove the specified capability from this plan */
  clearCapability?: Maybe<Scalars['Void']>;
  /** Remove the specified limit from this plan */
  clearLimit?: Maybe<Scalars['Void']>;
  id: Scalars['ID'];
  /** Reset the specified capability on this plan to the global default value for the capability */
  resetCapability?: Maybe<BillingPlanCapability>;
  /** Reset the specified limit on this plan to the global default value for the limit */
  resetLimit?: Maybe<BillingPlanLimit>;
  /** Sets the specified capability on this plan to the provided value */
  setCapability?: Maybe<BillingPlanCapability>;
  /** Sets the specified limit on this plan to the provided value */
  setLimit?: Maybe<BillingPlanLimit>;
  /** Update a plan */
  updatePlan?: Maybe<BillingPlan>;
};


export type BillingPlanMutationclearCapabilityArgs = {
  label: Scalars['String'];
};


export type BillingPlanMutationclearLimitArgs = {
  label: Scalars['String'];
};


export type BillingPlanMutationresetCapabilityArgs = {
  label: Scalars['String'];
};


export type BillingPlanMutationresetLimitArgs = {
  label: Scalars['String'];
};


export type BillingPlanMutationsetCapabilityArgs = {
  label: Scalars['String'];
  value: Scalars['Boolean'];
};


export type BillingPlanMutationsetLimitArgs = {
  label: Scalars['String'];
  value: Scalars['Long'];
};


export type BillingPlanMutationupdatePlanArgs = {
  input?: InputMaybe<UpdateBillingPlanInput>;
};

export enum BillingPlanTier {
  COMMUNITY = 'COMMUNITY',
  ENTERPRISE = 'ENTERPRISE',
  ONE = 'ONE',
  TEAM = 'TEAM',
  UNKNOWN = 'UNKNOWN',
  USAGE_BASED = 'USAGE_BASED'
}

export type BillingSubscription = {
  __typename?: 'BillingSubscription';
  activatedAt: Scalars['Timestamp'];
  addons: Array<BillingSubscriptionAddon>;
  /** Retrieve all capabilities for this subscription */
  allCapabilities: Array<SubscriptionCapability>;
  /** Retrieve a list of all effective capability limits for this subscription */
  allLimits: Array<SubscriptionLimit>;
  autoRenew: Scalars['Boolean'];
  canceledAt?: Maybe<Scalars['Timestamp']>;
  /** Draft invoice for this subscription */
  currentDraftInvoice?: Maybe<DraftInvoice>;
  currentPeriodEndsAt: Scalars['Timestamp'];
  currentPeriodStartedAt: Scalars['Timestamp'];
  /** Retrieve the limit applied to this subscription for a capability */
  effectiveLimit?: Maybe<Scalars['Long']>;
  expiresAt?: Maybe<Scalars['Timestamp']>;
  /** Renewal grace time for updating seat count */
  graceTimeForNextRenewal?: Maybe<Scalars['Timestamp']>;
  /** Check whether a capability is enabled for the subscription */
  hasCapability?: Maybe<Scalars['Boolean']>;
  maxSelfHostedRequestsPerMonth?: Maybe<Scalars['Int']>;
  maxServerlessRequestsPerMonth?: Maybe<Scalars['Int']>;
  plan: BillingPlan;
  /** The price of every seat */
  pricePerSeatInUsdCents?: Maybe<Scalars['Int']>;
  /** The price of every unit in the subscription (hence multiplied by quantity to get to the basePriceInUsdCents) */
  pricePerUnitInUsdCents: Scalars['Int'];
  quantity: Scalars['Int'];
  /** Total price of the subscription when it next renews, including add-ons (such as seats) */
  renewalTotalPriceInUsdCents: Scalars['Long'];
  state: SubscriptionState;
  /**
   * When this subscription's trial period expires (if it is a trial). Not the same as the
   * subscription's Recurly expiration).
   */
  trialExpiresAt?: Maybe<Scalars['Timestamp']>;
  uuid: Scalars['ID'];
};


export type BillingSubscriptioneffectiveLimitArgs = {
  label: Scalars['String'];
};


export type BillingSubscriptionhasCapabilityArgs = {
  label: Scalars['String'];
};

export type BillingSubscriptionAddon = {
  __typename?: 'BillingSubscriptionAddon';
  id: Scalars['ID'];
  pricePerUnitInUsdCents: Scalars['Int'];
  quantity: Scalars['Int'];
};

export type BillingSubscriptionMutation = {
  __typename?: 'BillingSubscriptionMutation';
  /** Remove the specified capability override for this subscription */
  clearCapability?: Maybe<Scalars['Void']>;
  /** Remove the specified limit override for this subscription */
  clearLimit?: Maybe<Scalars['Void']>;
  /** Sets the capability override on this subscription to the provided value */
  setCapability?: Maybe<SubscriptionCapability>;
  /** Sets the limit override on this subscription to the provided value */
  setLimit?: Maybe<SubscriptionLimit>;
  uuid: Scalars['ID'];
};


export type BillingSubscriptionMutationclearCapabilityArgs = {
  label: Scalars['String'];
};


export type BillingSubscriptionMutationclearLimitArgs = {
  label: Scalars['String'];
};


export type BillingSubscriptionMutationsetCapabilityArgs = {
  label: Scalars['String'];
  value: Scalars['Boolean'];
};


export type BillingSubscriptionMutationsetLimitArgs = {
  label: Scalars['String'];
  value: Scalars['Long'];
};

export type BillingTier = {
  __typename?: 'BillingTier';
  searchAccounts: Array<Account>;
  tier: BillingPlanTier;
};


export type BillingTiersearchAccountsArgs = {
  search?: InputMaybe<Scalars['String']>;
};

/** Columns of BillingUsageStats. */
export enum BillingUsageStatsColumn {
  ACCOUNT_ID = 'ACCOUNT_ID',
  AGENT_VERSION = 'AGENT_VERSION',
  GRAPH_DEPLOYMENT_TYPE = 'GRAPH_DEPLOYMENT_TYPE',
  OPERATION_COUNT = 'OPERATION_COUNT',
  OPERATION_COUNT_PROVIDED_EXPLICITLY = 'OPERATION_COUNT_PROVIDED_EXPLICITLY',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type BillingUsageStatsDimensions = {
  __typename?: 'BillingUsageStatsDimensions';
  accountId?: Maybe<Scalars['ID']>;
  agentVersion?: Maybe<Scalars['String']>;
  graphDeploymentType?: Maybe<Scalars['String']>;
  operationCountProvidedExplicitly?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in BillingUsageStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type BillingUsageStatsFilter = {
  /** Selects rows whose accountId dimension equals the given value if not null. To query for the null value, use {in: {accountId: [null]}} instead. */
  accountId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']>;
  and?: InputMaybe<Array<BillingUsageStatsFilter>>;
  /** Selects rows whose graphDeploymentType dimension equals the given value if not null. To query for the null value, use {in: {graphDeploymentType: [null]}} instead. */
  graphDeploymentType?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<BillingUsageStatsFilterIn>;
  not?: InputMaybe<BillingUsageStatsFilter>;
  /** Selects rows whose operationCountProvidedExplicitly dimension equals the given value if not null. To query for the null value, use {in: {operationCountProvidedExplicitly: [null]}} instead. */
  operationCountProvidedExplicitly?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<BillingUsageStatsFilter>>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in BillingUsageStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type BillingUsageStatsFilterIn = {
  /** Selects rows whose accountId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  accountId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose graphDeploymentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  graphDeploymentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationCountProvidedExplicitly dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationCountProvidedExplicitly?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type BillingUsageStatsMetrics = {
  __typename?: 'BillingUsageStatsMetrics';
  operationCount: Scalars['Long'];
};

export type BillingUsageStatsOrderBySpec = {
  column: BillingUsageStatsColumn;
  direction: Ordering;
};

export type BillingUsageStatsRecord = {
  __typename?: 'BillingUsageStatsRecord';
  /** Dimensions of BillingUsageStats that can be grouped by. */
  groupBy: BillingUsageStatsDimensions;
  /** Metrics of BillingUsageStats that can be aggregated over. */
  metrics: BillingUsageStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export enum BillingUsageStatsWindowSize {
  DAY = 'DAY',
  HOUR = 'HOUR',
  MONTH = 'MONTH',
  NONE = 'NONE'
}

/** The building of a Studio variant (including supergraph composition and any contract filtering) as part of a launch. */
export type Build = {
  __typename?: 'Build';
  /** The inputs provided to the build, including subgraph and contract details. */
  input: BuildInput;
  /** The result of the build. This value is null until the build completes. */
  result?: Maybe<BuildResult>;
};

export type BuildCheckFailed = {
  buildInputs: BuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  /** A list of errors generated by this build. */
  errors: Array<BuildError>;
  id: Scalars['ID'];
  passed: Scalars['Boolean'];
  workflowTask: BuildCheckTask;
};

export type BuildCheckPassed = {
  buildInputs: BuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  id: Scalars['ID'];
  passed: Scalars['Boolean'];
  /** The SHA-256 of the supergraph schema document generated by this build. */
  supergraphSchemaHash: Scalars['SHA256'];
  workflowTask: BuildCheckTask;
};

export type BuildCheckResult = {
  /** The input to the build task. */
  buildInputs: BuildInputs;
  /**
   * The build pipeline track of the build task, which indicates what gateway/router versions the
   *  build pipeline is intended to support (and accordingly controls the version of code).
   */
  buildPipelineTrack: BuildPipelineTrack;
  id: Scalars['ID'];
  /** Whether the build task passed or failed. */
  passed: Scalars['Boolean'];
  /** The workflow build task that generated this result. */
  workflowTask: BuildCheckTask;
};

export type BuildCheckTask = {
  /** The result of the build check. This will be null when the task is initializing or running. */
  buildResult?: Maybe<BuildCheckResult>;
  completedAt?: Maybe<Scalars['Timestamp']>;
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  /**
   * The build input change proposed for this check workflow. Note that for triggered downstream
   *  workflows, this is not the upstream variant's proposed change, but the changes for the downstream
   * variant that are derived from the upstream workflow's results (e.g. the input supergraph schema).
   */
  proposedBuildInputChanges: ProposedBuildInputChanges;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']>;
  workflow: CheckWorkflow;
};

/** The configuration for building a composition graph variant */
export type BuildConfig = {
  __typename?: 'BuildConfig';
  buildPipelineTrack: BuildPipelineTrack;
  /** Show all uses of @tag directives to consumers in Schema Reference and Explorer */
  tagInApiSchema: Scalars['Boolean'];
};

/**
 * Exactly one of the inputs must be set in a build configuration.
 * Which build configuration type is set will determine the type
 * of variant that is created. Existing variants of a given type
 * cannot be updated in-place to be of a different type.
 */
export type BuildConfigInput = {
  /** This list will contain any directives that should get passed through to the api schema from the core schema. Anything included in this list will appear in the consumer facing schema */
  apiDirectivePassThrough: Array<Scalars['String']>;
  /** if buildPipelineTrack is null use the graph default */
  buildPipelineTrack?: InputMaybe<BuildPipelineTrack>;
  composition?: InputMaybe<CompositionConfigInput>;
  contract?: InputMaybe<ContractConfigInput>;
};

/** A single error that occurred during the failed execution of a build. */
export type BuildError = {
  __typename?: 'BuildError';
  code?: Maybe<Scalars['String']>;
  failedStep?: Maybe<Scalars['String']>;
  locations: Array<SourceLocation>;
  message: Scalars['String'];
};

/** Contains the details of an executed build that failed. */
export type BuildFailure = {
  __typename?: 'BuildFailure';
  /** A list of all errors that occurred during the failed build. */
  errorMessages: Array<BuildError>;
};

export type BuildInput = CompositionBuildInput | FilterBuildInput;

export type BuildInputs = CompositionBuildInputs | FilterBuildInputs;

/** Build Pipeline Tracks */
export enum BuildPipelineTrack {
  /** Apollo Federation 1.0 */
  FED_1_0 = 'FED_1_0',
  /** Apollo Federation 1.1 */
  FED_1_1 = 'FED_1_1',
  /** Apollo Federation 2.0 */
  FED_2_0 = 'FED_2_0',
  /** Apollo Federation 2.1 */
  FED_2_1 = 'FED_2_1',
  /** Apollo Federation 2.3 */
  FED_2_3 = 'FED_2_3',
  /** Apollo Federation 2.4 */
  FED_2_4 = 'FED_2_4',
  /** Apollo Federation 2.5 */
  FED_2_5 = 'FED_2_5',
  /** Apollo Federation 2.6 */
  FED_2_6 = 'FED_2_6',
  /** Apollo Federation 2.7 */
  FED_2_7 = 'FED_2_7'
}

export enum BuildPipelineTrackBadge {
  DEPRECATED = 'DEPRECATED',
  EXPERIMENTAL = 'EXPERIMENTAL',
  LATEST = 'LATEST',
  UNSUPPORTED = 'UNSUPPORTED'
}

export type BuildPipelineTrackDetails = {
  __typename?: 'BuildPipelineTrackDetails';
  badge?: Maybe<BuildPipelineTrackBadge>;
  buildPipelineTrack: BuildPipelineTrack;
  /** currently running version of composition for this track, includes patch updates */
  compositionVersion: Scalars['String'];
  deprecatedAt?: Maybe<Scalars['Timestamp']>;
  displayName: Scalars['String'];
  minimumGatewayVersion?: Maybe<Scalars['String']>;
  /** Minimum supported router and gateway versions. Min router   version can be null since fed 1 doesn't have router support. */
  minimumRouterVersion?: Maybe<Scalars['String']>;
  notSupportedAt?: Maybe<Scalars['Timestamp']>;
};

export type BuildResult = BuildFailure | BuildSuccess;

/** Contains the details of an executed build that succeeded. */
export type BuildSuccess = {
  __typename?: 'BuildSuccess';
  /** Contains the supergraph and API schemas created by composition. */
  coreSchema: CoreSchema;
};

export enum CacheControlScope {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC'
}

export enum CacheScope {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  UNKNOWN = 'UNKNOWN',
  UNRECOGNIZED = 'UNRECOGNIZED'
}

export type CannotDeleteLinkedPersistedQueryListError = Error & {
  __typename?: 'CannotDeleteLinkedPersistedQueryListError';
  message: Scalars['String'];
};

export type CannotModifyOperationBodyError = Error & {
  __typename?: 'CannotModifyOperationBodyError';
  message: Scalars['String'];
};

/** A single change that was made to a definition in a schema. */
export type Change = {
  __typename?: 'Change';
  affectedQueries?: Maybe<Array<AffectedQuery>>;
  /** Target arg of change made. */
  argNode?: Maybe<NamedIntrospectionArg>;
  /** Indication of the category of the change (e.g. addition, removal, edit). */
  category: ChangeCategory;
  /**
   * Node related to the top level node that was changed, such as a field in an object,
   * a value in an enum or the object of an interface.
   */
  childNode?: Maybe<NamedIntrospectionValue>;
  /** Indicates the type of change that was made, and to what (e.g., 'TYPE_REMOVED'). */
  code: Scalars['String'];
  /** A human-readable description of the change. */
  description: Scalars['String'];
  /** Top level node affected by the change. */
  parentNode?: Maybe<NamedIntrospectionType>;
  /** The severity of the change (e.g., `FAILURE` or `NOTICE`) */
  severity: ChangeSeverity;
  /** Short description of the change */
  shortDescription?: Maybe<Scalars['String']>;
  /**
   * Indication of the success of the overall change, either failure, warning, or notice.
   * @deprecated use severity instead
   */
  type: ChangeType;
};

/**
 * Defines a set of categories that a schema change
 * can be grouped by.
 */
export enum ChangeCategory {
  ADDITION = 'ADDITION',
  DEPRECATION = 'DEPRECATION',
  EDIT = 'EDIT',
  REMOVAL = 'REMOVAL'
}

/**
 * These schema change codes represent all of the possible changes that can
 * occur during the schema diff algorithm.
 */
export enum ChangeCode {
  /** Type of the argument was changed. */
  ARG_CHANGED_TYPE = 'ARG_CHANGED_TYPE',
  /** Argument was changed from nullable to non-nullable. */
  ARG_CHANGED_TYPE_OPTIONAL_TO_REQUIRED = 'ARG_CHANGED_TYPE_OPTIONAL_TO_REQUIRED',
  /** Default value added or changed for the argument. */
  ARG_DEFAULT_VALUE_CHANGE = 'ARG_DEFAULT_VALUE_CHANGE',
  /** Description was added, removed, or updated for argument. */
  ARG_DESCRIPTION_CHANGE = 'ARG_DESCRIPTION_CHANGE',
  /** Argument to a field was removed. */
  ARG_REMOVED = 'ARG_REMOVED',
  /** Argument to the directive was removed. */
  DIRECTIVE_ARG_REMOVED = 'DIRECTIVE_ARG_REMOVED',
  /** Location of the directive was removed. */
  DIRECTIVE_LOCATION_REMOVED = 'DIRECTIVE_LOCATION_REMOVED',
  /** Directive was removed. */
  DIRECTIVE_REMOVED = 'DIRECTIVE_REMOVED',
  /** Repeatable flag was removed for directive. */
  DIRECTIVE_REPEATABLE_REMOVED = 'DIRECTIVE_REPEATABLE_REMOVED',
  /** Enum was deprecated. */
  ENUM_DEPRECATED = 'ENUM_DEPRECATED',
  /** Reason for enum deprecation changed. */
  ENUM_DEPRECATED_REASON_CHANGE = 'ENUM_DEPRECATED_REASON_CHANGE',
  /** Enum deprecation was removed. */
  ENUM_DEPRECATION_REMOVED = 'ENUM_DEPRECATION_REMOVED',
  /** Description was added, removed, or updated for enum value. */
  ENUM_VALUE_DESCRIPTION_CHANGE = 'ENUM_VALUE_DESCRIPTION_CHANGE',
  /** Field was added to the type. */
  FIELD_ADDED = 'FIELD_ADDED',
  /** Return type for the field was changed. */
  FIELD_CHANGED_TYPE = 'FIELD_CHANGED_TYPE',
  /** Field was deprecated. */
  FIELD_DEPRECATED = 'FIELD_DEPRECATED',
  /** Reason for field deprecation changed. */
  FIELD_DEPRECATED_REASON_CHANGE = 'FIELD_DEPRECATED_REASON_CHANGE',
  /** Field deprecation removed. */
  FIELD_DEPRECATION_REMOVED = 'FIELD_DEPRECATION_REMOVED',
  /** Description was added, removed, or updated for field. */
  FIELD_DESCRIPTION_CHANGE = 'FIELD_DESCRIPTION_CHANGE',
  /** Type of the field in the input object was changed. */
  FIELD_ON_INPUT_OBJECT_CHANGED_TYPE = 'FIELD_ON_INPUT_OBJECT_CHANGED_TYPE',
  /** Field was removed from the type. */
  FIELD_REMOVED = 'FIELD_REMOVED',
  /** Field was removed from the input object. */
  FIELD_REMOVED_FROM_INPUT_OBJECT = 'FIELD_REMOVED_FROM_INPUT_OBJECT',
  /** Non-nullable field was added to the input object. (Deprecated.) */
  NON_NULLABLE_FIELD_ADDED_TO_INPUT_OBJECT = 'NON_NULLABLE_FIELD_ADDED_TO_INPUT_OBJECT',
  /** Nullable field was added to the input type. (Deprecated.) */
  NULLABLE_FIELD_ADDED_TO_INPUT_OBJECT = 'NULLABLE_FIELD_ADDED_TO_INPUT_OBJECT',
  /** Nullable argument was added to the field. */
  OPTIONAL_ARG_ADDED = 'OPTIONAL_ARG_ADDED',
  /** Optional field was added to the input type. */
  OPTIONAL_FIELD_ADDED_TO_INPUT_OBJECT = 'OPTIONAL_FIELD_ADDED_TO_INPUT_OBJECT',
  /** Non-nullable argument was added to the field. */
  REQUIRED_ARG_ADDED = 'REQUIRED_ARG_ADDED',
  /** Non-nullable argument added to directive. */
  REQUIRED_DIRECTIVE_ARG_ADDED = 'REQUIRED_DIRECTIVE_ARG_ADDED',
  /** Required field was added to the input object. */
  REQUIRED_FIELD_ADDED_TO_INPUT_OBJECT = 'REQUIRED_FIELD_ADDED_TO_INPUT_OBJECT',
  /** Type was added to the schema. */
  TYPE_ADDED = 'TYPE_ADDED',
  /** Type now implements the interface. */
  TYPE_ADDED_TO_INTERFACE = 'TYPE_ADDED_TO_INTERFACE',
  /** A new value was added to the enum. */
  TYPE_ADDED_TO_UNION = 'TYPE_ADDED_TO_UNION',
  /**
   * Type was changed from one kind to another.
   * Ex: scalar to object or enum to union.
   */
  TYPE_CHANGED_KIND = 'TYPE_CHANGED_KIND',
  /** Description was added, removed, or updated for type. */
  TYPE_DESCRIPTION_CHANGE = 'TYPE_DESCRIPTION_CHANGE',
  /** Type (object or scalar) was removed from the schema. */
  TYPE_REMOVED = 'TYPE_REMOVED',
  /** Type no longer implements the interface. */
  TYPE_REMOVED_FROM_INTERFACE = 'TYPE_REMOVED_FROM_INTERFACE',
  /** Type is no longer included in the union. */
  TYPE_REMOVED_FROM_UNION = 'TYPE_REMOVED_FROM_UNION',
  /** A new value was added to the enum. */
  VALUE_ADDED_TO_ENUM = 'VALUE_ADDED_TO_ENUM',
  /** Value was removed from the enum. */
  VALUE_REMOVED_FROM_ENUM = 'VALUE_REMOVED_FROM_ENUM'
}

/**
 * Represents the tuple of static information
 * about a particular kind of schema change.
 */
export type ChangeDefinition = {
  __typename?: 'ChangeDefinition';
  category: ChangeCategory;
  code: ChangeCode;
  defaultSeverity: ChangeSeverity;
};

/** Info about a change in the context of an operation it affects */
export type ChangeOnOperation = {
  __typename?: 'ChangeOnOperation';
  /** Human-readable explanation of the impact of this change on the operation */
  impact?: Maybe<Scalars['String']>;
  /** The semantic info about this change, i.e. info about the change that doesn't depend on the operation */
  semanticChange: SemanticChange;
};

export type ChangeProposalComment = {
  createdAt: Scalars['Timestamp'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID'];
  message: Scalars['String'];
  /** true if the schemaCoordinate this comment is on doesn't exist in the diff between the most recent revision & the base sdl */
  outdated: Scalars['Boolean'];
  schemaCoordinate: Scalars['String'];
  /** '#@!api!@#' for api schema, '#@!supergraph!@#' for supergraph schema, subgraph otherwise */
  schemaScope: Scalars['String'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

export enum ChangeSeverity {
  FAILURE = 'FAILURE',
  NOTICE = 'NOTICE'
}

/**
 * Summary of the changes for a schema diff, computed by placing the changes into categories and then
 * counting the size of each category. This categorization can be done in different ways, and
 * accordingly there are multiple fields here for each type of categorization.
 *
 * Note that if an object or interface field is added/removed, there won't be any addition/removal
 * changes generated for its arguments or @deprecated usages. If an enum type is added/removed, there
 * will be addition/removal changes generated for its values, but not for those values' @deprecated
 * usages. Description changes won't be generated for a schema element if that element (or an
 * ancestor) was added/removed.
 */
export type ChangeSummary = {
  __typename?: 'ChangeSummary';
  /** Counts for changes to fields of objects, input objects, and interfaces. */
  field: FieldChangeSummaryCounts;
  /** Counts for all changes. */
  total: TotalChangeSummaryCounts;
  /**
   * Counts for changes to non-field aspects of objects, input objects, and interfaces,
   * and all aspects of enums, unions, and scalars.
   */
  type: TypeChangeSummaryCounts;
};

export enum ChangeType {
  FAILURE = 'FAILURE',
  NOTICE = 'NOTICE'
}

/** An addition made to a Studio variant's changelog after a launch. */
export type ChangelogLaunchResult = {
  __typename?: 'ChangelogLaunchResult';
  createdAt: Scalars['Timestamp'];
  schemaTagID: Scalars['ID'];
};

/** Destination for notifications */
export type Channel = {
  id: Scalars['ID'];
  name: Scalars['String'];
  subscriptions: Array<ChannelSubscription>;
};

export type ChannelSubscription = {
  channels: Array<Channel>;
  enabled: Scalars['Boolean'];
  id: Scalars['ID'];
  variant?: Maybe<Scalars['String']>;
};

/** Graph-level configuration of checks. */
export type CheckConfiguration = {
  __typename?: 'CheckConfiguration';
  /** Time when check configuration was created */
  createdAt: Scalars['Timestamp'];
  /** Whether to run Linting during schema checks. */
  enableLintChecks: Scalars['Boolean'];
  /** Clients to ignore during validation */
  excludedClients: Array<ClientFilter>;
  /** Operation names to ignore during validation */
  excludedOperationNames?: Maybe<Array<Maybe<OperationNameFilter>>>;
  /** Operations to ignore during validation */
  excludedOperations: Array<ExcludedOperation>;
  /** Graph that this check configuration belongs to */
  graphID: Scalars['ID'];
  /** ID of the check configuration */
  id: Scalars['ID'];
  /** Default configuration to include operations on the base variant. */
  includeBaseVariant: Scalars['Boolean'];
  /** Variant overrides for validation */
  includedVariants: Array<Scalars['String']>;
  /** Minimum number of requests within the window for an operation to be considered. */
  operationCountThreshold: Scalars['Int'];
  /**
   * Number of requests within the window for an operation to be considered, relative to
   * total request count. Expected values are between 0 and 0.05 (minimum 5% of
   * total request volume)
   */
  operationCountThresholdPercentage: Scalars['Float'];
  /** How submitted build input diffs are handled when they match (or don't) a Proposal */
  proposalChangeMismatchSeverity: ProposalChangeMismatchSeverity;
  /**
   * Only check operations from the last <timeRangeSeconds> seconds.
   * The default is 7 days (604,800 seconds).
   */
  timeRangeSeconds: Scalars['Long'];
  /** Time when check configuration was last updated */
  updatedAt: Scalars['Timestamp'];
  /** Identity of the last user to update the check configuration */
  updatedBy?: Maybe<Identity>;
};

/** Filter options available when listing checks. */
export type CheckFilterInput = {
  /** A list of git commiters. For cli triggered checks, this is the author. */
  authors?: InputMaybe<Array<Scalars['String']>>;
  branches?: InputMaybe<Array<Scalars['String']>>;
  /** A list of actors triggering this check. For non cli triggered checks, this is the Studio User / author. */
  createdBy?: InputMaybe<Array<ActorInput>>;
  ids?: InputMaybe<Array<Scalars['String']>>;
  includeProposalChecks?: InputMaybe<Scalars['Boolean']>;
  status?: InputMaybe<CheckFilterInputStatusOption>;
  subgraphs?: InputMaybe<Array<Scalars['String']>>;
  variants?: InputMaybe<Array<Scalars['String']>>;
};

/**
 * Options for filtering CheckWorkflows by status
 * This should always match CheckWorkflowStatus
 */
export enum CheckFilterInputStatusOption {
  FAILED = 'FAILED',
  PASSED = 'PASSED',
  PENDING = 'PENDING'
}

/** The result of performing a subgraph check, including all steps. */
export type CheckPartialSchemaResult = {
  __typename?: 'CheckPartialSchemaResult';
  /** Overall result of the check. This will be null if composition validation was unsuccessful. */
  checkSchemaResult?: Maybe<CheckSchemaResult>;
  /** Result of compostion run as part of the overall subgraph check. */
  compositionValidationResult: CompositionValidationResult;
  /** Whether any modifications were detected in the composed core schema. */
  coreSchemaModified: Scalars['Boolean'];
  /** Check workflow associated with the overall subgraph check. */
  workflow?: Maybe<CheckWorkflow>;
};

/** The possible results of a request to initiate schema checks (either a success object or one of multiple `Error` objects). */
export type CheckRequestResult = CheckRequestSuccess | InvalidInputError | PermissionError | PlanError | RateLimitExceededError;

/** Represents a successfully initiated execution of schema checks. This does not indicate the _result_ of the checks, only that they were initiated. */
export type CheckRequestSuccess = {
  __typename?: 'CheckRequestSuccess';
  /** The URL of the Apollo Studio page for this check. */
  targetURL: Scalars['String'];
  /** The unique ID for this execution of schema checks. */
  workflowID: Scalars['ID'];
};

/** Input type to provide when running schema checks asynchronously for a non-federated graph. */
export type CheckSchemaAsyncInput = {
  /** Configuration options for the check execution. */
  config: HistoricQueryParametersInput;
  /** The GitHub context to associate with the check. */
  gitContext: GitContextInput;
  /** The URL of the GraphQL endpoint that Apollo Sandbox introspected to obtain the proposed schema. Required if `isSandbox` is `true`. */
  introspectionEndpoint?: InputMaybe<Scalars['String']>;
  /** If `true`, the check was initiated automatically by a Proposal update. */
  isProposal?: InputMaybe<Scalars['Boolean']>;
  /** If `true`, the check was initiated by Apollo Sandbox. */
  isSandbox: Scalars['Boolean'];
  proposedSchemaDocument?: InputMaybe<Scalars['String']>;
};

/** The result of running schema checks on a graph variant. */
export type CheckSchemaResult = {
  __typename?: 'CheckSchemaResult';
  /** The schema diff and affected operations generated by the schema check. */
  diffToPrevious: SchemaDiff;
  /** The unique ID of this execution of checks. */
  operationsCheckID: Scalars['ID'];
  /** The URL to view the schema diff in Studio. */
  targetUrl?: Maybe<Scalars['String']>;
  /** Workflow associated with this check result */
  workflow?: Maybe<CheckWorkflow>;
};

export type CheckStepCompleted = {
  __typename?: 'CheckStepCompleted';
  id: Scalars['ID'];
  status: CheckStepStatus;
};

export type CheckStepFailed = {
  __typename?: 'CheckStepFailed';
  message: Scalars['String'];
};

export type CheckStepInput = {
  graphID: Scalars['String'];
  graphVariant: Scalars['String'];
  taskID: Scalars['ID'];
  workflowID: Scalars['ID'];
};

export type CheckStepResult = CheckStepCompleted | CheckStepFailed | PermissionError | ValidationError;

export enum CheckStepStatus {
  FAILURE = 'FAILURE',
  SUCCESS = 'SUCCESS'
}

export type CheckWorkflow = {
  __typename?: 'CheckWorkflow';
  /** The supergraph schema provided as the base to check against. */
  baseSchemaHash?: Maybe<Scalars['String']>;
  /** The base subgraphs provided as the base to check against. */
  baseSubgraphs?: Maybe<Array<Subgraph>>;
  /**
   * The variant provided as a base to check against. Only the differences from the
   * base schema will be tested in operations checks.
   */
  baseVariant?: Maybe<GraphVariant>;
  /** The build task associated with this workflow, or null if no such task was scheduled. */
  buildTask?: Maybe<BuildCheckTask>;
  /** The timestamp when the check workflow completed. */
  completedAt?: Maybe<Scalars['Timestamp']>;
  createdAt: Scalars['Timestamp'];
  /** The downstream task associated with this workflow, or null if no such task kind was scheduled. */
  downstreamTask?: Maybe<DownstreamCheckTask>;
  /** Contextual parameters supplied by the runtime environment where the check was run. */
  gitContext?: Maybe<GitContext>;
  /** The graph this check workflow belongs to. */
  graph: Service;
  id: Scalars['ID'];
  /** The name of the implementing service that was responsible for triggering the validation. */
  implementingServiceName?: Maybe<Scalars['String']>;
  /** If this check is triggered for an sdl fetched using introspection, this is the endpoint where that schema was being served. */
  introspectionEndpoint?: Maybe<Scalars['String']>;
  /** Only true if the check was triggered from a proposal update. */
  isProposalCheck: Scalars['Boolean'];
  /** Only true if the check was triggered from Sandbox Checks page. */
  isSandboxCheck: Scalars['Boolean'];
  /** The operations task associated with this workflow, or null if no such task was scheduled. */
  operationsTask?: Maybe<OperationsCheckTask>;
  /** If this check came from a proposal, this is the revision that triggered the check. */
  proposalRevision?: Maybe<ProposalRevision>;
  /** The proposed supergraph schema being checked by this check workflow. */
  proposedSchemaHash?: Maybe<Scalars['String']>;
  /** The proposed subgraphs for this check workflow. */
  proposedSubgraphs?: Maybe<Array<Subgraph>>;
  /** If this check was created by rerunning, the original check workflow that was rerun. */
  rerunOf?: Maybe<CheckWorkflow>;
  /** Checks created by re-running this check, most recent first. */
  reruns?: Maybe<Array<CheckWorkflow>>;
  /** The timestamp when the check workflow started. */
  startedAt?: Maybe<Scalars['Timestamp']>;
  /** Overall status of the workflow, based on the underlying task statuses. */
  status: CheckWorkflowStatus;
  /** The names of the subgraphs with changes that triggered the validation. */
  subgraphNames: Array<Scalars['String']>;
  /** The set of check tasks associated with this workflow, e.g. composition, operations, etc. */
  tasks: Array<CheckWorkflowTask>;
  /** Identity of the user who ran this check */
  triggeredBy?: Maybe<Identity>;
  /** The upstream workflow that triggered this workflow, or null if such an upstream workflow does not exist. */
  upstreamWorkflow?: Maybe<CheckWorkflow>;
  /** Configuration of validation at the time the check was run. */
  validationConfig?: Maybe<SchemaDiffValidationConfig>;
};


export type CheckWorkflowrerunsArgs = {
  limit?: Scalars['Int'];
};

export type CheckWorkflowMutation = {
  __typename?: 'CheckWorkflowMutation';
  /** The graph this check workflow belongs to. */
  graph: Service;
  id: Scalars['ID'];
  /**
   * Re-run a check workflow using the current check configuration. The result is either a workflow ID that
   * can be used to check the status or an error message that explains what went wrong.
   */
  rerunAsync: CheckRequestResult;
};

export enum CheckWorkflowStatus {
  FAILED = 'FAILED',
  PASSED = 'PASSED',
  PENDING = 'PENDING'
}

export type CheckWorkflowTask = {
  completedAt?: Maybe<Scalars['Timestamp']>;
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  /**
   * The status of this task. All tasks start with the PENDING status while initializing. If any
   *  prerequisite task fails, then the task status becomes BLOCKED. Otherwise, if all prerequisite
   *  tasks pass, then this task runs (still having the PENDING status). Once the task completes, the
   *  task status will become either PASSED or FAILED.
   */
  status: CheckWorkflowTaskStatus;
  /** A studio UI url to view the details of this check workflow task */
  targetURL?: Maybe<Scalars['String']>;
  /** The workflow that this task belongs to. */
  workflow: CheckWorkflow;
};

export enum CheckWorkflowTaskStatus {
  BLOCKED = 'BLOCKED',
  FAILED = 'FAILED',
  PASSED = 'PASSED',
  PENDING = 'PENDING'
}

/** A client to be filtered. */
export type ClientFilter = {
  __typename?: 'ClientFilter';
  /** Name of the client is required. */
  name: Scalars['String'];
  /** Version string of the client. */
  version?: Maybe<Scalars['String']>;
};

/**
 * Options to filter by client reference ID, client name, and client version.
 * If passing client version, make sure to either provide a client reference ID or client name.
 */
export type ClientFilterInput = {
  /** name of the client set by the user and reported alongside metrics */
  name: Scalars['String'];
  /** version of the client set by the user and reported alongside metrics */
  version?: InputMaybe<Scalars['String']>;
};

/** Filter options to exclude by client reference ID, client name, and client version. */
export type ClientInfoFilter = {
  name: Scalars['String'];
  /** Ignored */
  referenceID?: InputMaybe<Scalars['ID']>;
  version?: InputMaybe<Scalars['String']>;
};

/** Filter options to exclude clients. Used as an output type for SchemaDiffValidationConfig. */
export type ClientInfoFilterOutput = {
  __typename?: 'ClientInfoFilterOutput';
  name: Scalars['String'];
  version?: Maybe<Scalars['String']>;
};

/** Cloud queries */
export type Cloud = {
  __typename?: 'Cloud';
  /** Return a given RouterConfigVersion */
  configVersion?: Maybe<RouterConfigVersion>;
  /** Return all RouterConfigVersions */
  configVersions: Array<RouterConfigVersion>;
  order?: Maybe<Order>;
  /** The regions where a cloud router can be deployed */
  regions: Array<RegionDescription>;
  /** Return the Cloud Router associated with the provided graphRef */
  router?: Maybe<Router>;
  /** Retrieve a Cloud Router by its internal ID */
  routerByInternalId?: Maybe<Router>;
  /** Retrieve all routers */
  routers: Array<Router>;
  /** Return the Shard associated with the provided id */
  shard?: Maybe<Shard>;
  /** Return all Shards */
  shards: Array<Shard>;
  /** Information about a specific Cloud Router version */
  version: RouterVersionResult;
  /** A list of Cloud Router versions */
  versions: RouterVersionsResult;
};


/** Cloud queries */
export type CloudconfigVersionArgs = {
  name: Scalars['String'];
};


/** Cloud queries */
export type CloudconfigVersionsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


/** Cloud queries */
export type CloudorderArgs = {
  orderId: Scalars['String'];
};


/** Cloud queries */
export type CloudregionsArgs = {
  provider: CloudProvider;
  tier?: InputMaybe<CloudTier>;
};


/** Cloud queries */
export type CloudrouterArgs = {
  id: Scalars['ID'];
};


/** Cloud queries */
export type CloudrouterByInternalIdArgs = {
  internalId: Scalars['ID'];
};


/** Cloud queries */
export type CloudroutersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  statuses?: InputMaybe<Array<RouterStatus>>;
};


/** Cloud queries */
export type CloudshardArgs = {
  id: Scalars['ID'];
};


/** Cloud queries */
export type CloudshardsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  provider?: InputMaybe<CloudProvider>;
  tier?: InputMaybe<CloudTier>;
};


/** Cloud queries */
export type CloudversionArgs = {
  version: Scalars['String'];
};


/** Cloud queries */
export type CloudversionsArgs = {
  input: RouterVersionsInput;
};

/** Build Pipeline Tracks */
export enum CloudBuildPipelineTrackInput {
  /** Apollo Federation 2.5 */
  FED_2_5 = 'FED_2_5',
  /** Apollo Federation 2.6 */
  FED_2_6 = 'FED_2_6',
  /** Apollo Federation 2.7 */
  FED_2_7 = 'FED_2_7'
}

/** Invalid input error */
export type CloudInvalidInputError = {
  __typename?: 'CloudInvalidInputError';
  /** Argument related to the error */
  argument: Scalars['String'];
  /** Location of the error */
  location?: Maybe<Scalars['String']>;
  /** Reason for the error */
  reason: Scalars['String'];
};

/** Cloud mutations */
export type CloudMutation = {
  __typename?: 'CloudMutation';
  /** Create a new RouterConfigVersion */
  createConfigVersion: RouterVersionConfigResult;
  /** Create a new Cloud Router */
  createRouter: CreateRouterResult;
  /** Create a new Shard */
  createShard: ShardResult;
  /** Create a new router version */
  createVersion: CreateRouterVersionResult;
  /** Destroy an existing Cloud Router */
  destroyRouter: DestroyRouterResult;
  order?: Maybe<OrderMutation>;
  /** Fetch a Cloud Router for mutations */
  router?: Maybe<RouterMutation>;
  /** Update a RouterConfigVersion */
  updateConfigVersion: RouterVersionConfigResult;
  /** Update an existing Cloud Router */
  updateRouter: UpdateRouterResult;
  /** Update an existing Shard */
  updateShard: ShardResult;
  /** Update an existing router version */
  updateVersion: UpdateRouterVersionResult;
};


/** Cloud mutations */
export type CloudMutationcreateConfigVersionArgs = {
  input: RouterConfigVersionInput;
};


/** Cloud mutations */
export type CloudMutationcreateRouterArgs = {
  id: Scalars['ID'];
  input: CreateRouterInput;
};


/** Cloud mutations */
export type CloudMutationcreateShardArgs = {
  input: CreateShardInput;
};


/** Cloud mutations */
export type CloudMutationcreateVersionArgs = {
  version: RouterVersionCreateInput;
};


/** Cloud mutations */
export type CloudMutationdestroyRouterArgs = {
  id: Scalars['ID'];
};


/** Cloud mutations */
export type CloudMutationorderArgs = {
  orderId: Scalars['String'];
};


/** Cloud mutations */
export type CloudMutationrouterArgs = {
  id: Scalars['ID'];
};


/** Cloud mutations */
export type CloudMutationupdateConfigVersionArgs = {
  input: RouterConfigVersionInput;
};


/** Cloud mutations */
export type CloudMutationupdateRouterArgs = {
  id: Scalars['ID'];
  input: UpdateRouterInput;
};


/** Cloud mutations */
export type CloudMutationupdateShardArgs = {
  input: UpdateShardInput;
};


/** Cloud mutations */
export type CloudMutationupdateVersionArgs = {
  version: RouterVersionUpdateInput;
};

/** Cloud onboarding information */
export type CloudOnboarding = {
  __typename?: 'CloudOnboarding';
  /** Graph variant reference for Cloud Onboarding */
  graphRef: Scalars['String'];
  /** Cloud provider for Cloud Onboarding */
  provider: CloudProvider;
  /** Region for Cloud Onboarding */
  region: RegionDescription;
  /** Tier for Cloud Onboarding */
  tier: CloudTier;
};

/** Input to create a new Cloud Onboarding */
export type CloudOnboardingInput = {
  /** graph variant name for the onboarding */
  graphRef: Scalars['String'];
  /** The cloud provider */
  provider: CloudProvider;
  /** Region for the Cloud Onboarding */
  region: Scalars['String'];
  /** Tier for the Cloud Onboarding */
  tier: CloudTier;
};

/** List of supported cloud providers */
export enum CloudProvider {
  /** Amazon Web Services */
  AWS = 'AWS',
  /** Fly.io */
  FLY = 'FLY'
}

/** Cloud Router tiers */
export enum CloudTier {
  /** Dedicated tier */
  DEDICATED = 'DEDICATED',
  /** Enterprise Cloud tier */
  ENTERPRISE = 'ENTERPRISE',
  /** Serverless tier */
  SERVERLESS = 'SERVERLESS'
}

/** Validation result */
export type CloudValidationResult = CloudValidationSuccess | InternalServerError | InvalidInputErrors;

/** Config validation success */
export type CloudValidationSuccess = {
  __typename?: 'CloudValidationSuccess';
  message: Scalars['String'];
};

export type CommentFilter = {
  schemaScope?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<Array<CommentStatus>>;
  type: Array<CommentType>;
};

export enum CommentStatus {
  DELETED = 'DELETED',
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED'
}

export enum CommentType {
  CHANGE = 'CHANGE',
  GENERAL = 'GENERAL',
  REVIEW = 'REVIEW'
}

export type CommunicationChannel = {
  id: Scalars['ID'];
  name: Scalars['String'];
};

export enum ComparisonOperator {
  EQUALS = 'EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO',
  NOT_EQUALS = 'NOT_EQUALS',
  UNRECOGNIZED = 'UNRECOGNIZED'
}

export type ComposeAndFilterPreviewBuildResults = {
  __typename?: 'ComposeAndFilterPreviewBuildResults';
  /** The API schema document/SDL generated from composition/filtering. */
  apiSchemaDocument: Scalars['String'];
  /** The supergraph core schema document/SDL generated from composition/filtering. */
  supergraphSchemaDocument: Scalars['String'];
};

export type ComposeAndFilterPreviewComposeError = {
  __typename?: 'ComposeAndFilterPreviewComposeError';
  /** A machine-readable error code. See https://www.apollographql.com/docs/federation/errors/for more info. */
  code?: Maybe<Scalars['String']>;
  /** The step at which composition failed. */
  failedStep?: Maybe<Scalars['String']>;
  /** Source locations related to the error. */
  locations?: Maybe<Array<SourceLocation>>;
  /** A human-readable message describing the error. */
  message: Scalars['String'];
};

export type ComposeAndFilterPreviewComposeFailure = {
  __typename?: 'ComposeAndFilterPreviewComposeFailure';
  /** The list of errors from failed composition. */
  composeErrors: Array<ComposeAndFilterPreviewComposeError>;
};

export type ComposeAndFilterPreviewFilterError = {
  __typename?: 'ComposeAndFilterPreviewFilterError';
  /** The step at which filtering failed. See https://www.apollographql.com/docs/studio/contracts/#contract-errors for more info. */
  failedStep?: Maybe<Scalars['String']>;
  /** A human-readable message describing the error. */
  message: Scalars['String'];
};

export type ComposeAndFilterPreviewFilterFailure = {
  __typename?: 'ComposeAndFilterPreviewFilterFailure';
  /** The results from successful composition. */
  composeResults: ComposeAndFilterPreviewBuildResults;
  /** The list of errors from failed filtering. */
  filterErrors: Array<ComposeAndFilterPreviewFilterError>;
};

export type ComposeAndFilterPreviewResult = ComposeAndFilterPreviewComposeFailure | ComposeAndFilterPreviewFilterFailure | ComposeAndFilterPreviewSuccess;

export type ComposeAndFilterPreviewSubgraphChange = {
  /**
   * The info being changed in the named subgraph. If null, indicates that the named
   *  subgraph should be removed prior to composition.
   */
  info?: InputMaybe<ComposeAndFilterPreviewSubgraphChangeInfo>;
  /** The name of the subgraph being changed. */
  name: Scalars['String'];
};

export type ComposeAndFilterPreviewSubgraphChangeInfo = {
  /**
   * The routing URL of the subgraph. If a subgraph with the same name exists, then this
   * field can be null to indicate the existing subgraph's info should be used; using
   * null otherwise results in an error.
   */
  routingUrl?: InputMaybe<Scalars['String']>;
  /**
   * The schema document/SDL of the subgraph. If a subgraph with the same name exists,
   * then this field can be null to indicate the existing subgraph's info should be
   * used; using null otherwise results in an error.
   */
  schemaDocument?: InputMaybe<Scalars['String']>;
};

export type ComposeAndFilterPreviewSuccess = {
  __typename?: 'ComposeAndFilterPreviewSuccess';
  /** The results from successful composition. */
  composeResults: ComposeAndFilterPreviewBuildResults;
  /** The results from successful filtering, or null if filtering was skipped. */
  filterResults?: Maybe<ComposeAndFilterPreviewBuildResults>;
};

/** The result of supergraph composition that Studio performed in response to an attempted deletion of a subgraph. */
export type CompositionAndRemoveResult = {
  __typename?: 'CompositionAndRemoveResult';
  /** The produced composition config. Will be null if there are any errors */
  compositionConfig?: Maybe<CompositionConfig>;
  createdAt: Scalars['Timestamp'];
  /** Whether the removed implementing service existed. */
  didExist: Scalars['Boolean'];
  /** A list of errors that occurred during composition. Errors mean that Apollo was unable to compose the graph variant's subgraphs into a supergraph schema. If any errors are present, gateways / routers are not updated. */
  errors: Array<Maybe<SchemaCompositionError>>;
  /** ID that points to the results of composition. */
  graphCompositionID: Scalars['String'];
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  /** Whether this composition result resulted in a new supergraph schema passed to Uplink (`true`), or the build failed for any reason (`false`). For dry runs, this value is `true` if Uplink _would have_ been updated with the result. */
  updatedGateway: Scalars['Boolean'];
};

/** The result of supergraph composition that Studio performed in response to an attempted publish of a subgraph. */
export type CompositionAndUpsertResult = {
  __typename?: 'CompositionAndUpsertResult';
  /** The generated composition config, or null if any errors occurred. */
  compositionConfig?: Maybe<CompositionConfig>;
  createdAt: Scalars['Timestamp'];
  /** A list of errors that occurred during composition. Errors mean that Apollo was unable to compose the graph variant's subgraphs into a supergraph schema. If any errors are present, gateways / routers are not updated. */
  errors: Array<Maybe<SchemaCompositionError>>;
  /** ID that points to the results of composition. */
  graphCompositionID: Scalars['String'];
  /** The Launch result part of this subgraph publish. */
  launch?: Maybe<Launch>;
  /** Human-readable text describing the launch result of the subgraph publish. */
  launchCliCopy?: Maybe<Scalars['String']>;
  /** The URL of the Studio page for this update's associated launch, if available. */
  launchUrl?: Maybe<Scalars['String']>;
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  /** All subgraphs that were created from this mutation */
  subgraphsCreated: Array<Scalars['String']>;
  /** All subgraphs that were updated from this mutation */
  subgraphsUpdated: Array<Scalars['String']>;
  /** Whether this composition result resulted in a new supergraph schema passed to Uplink (`true`), or the build failed for any reason (`false`). For dry runs, this value is `true` if Uplink _would have_ been updated with the result. */
  updatedGateway: Scalars['Boolean'];
  /** Whether a new subgraph was created as part of this publish. */
  wasCreated: Scalars['Boolean'];
  /** Whether an implementingService was updated as part of this mutation */
  wasUpdated: Scalars['Boolean'];
};

export type CompositionBuildCheckFailed = BuildCheckFailed & BuildCheckResult & CompositionBuildCheckResult & {
  __typename?: 'CompositionBuildCheckFailed';
  buildInputs: CompositionBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  compositionPackageVersion?: Maybe<Scalars['String']>;
  errors: Array<BuildError>;
  id: Scalars['ID'];
  passed: Scalars['Boolean'];
  workflowTask: CompositionCheckTask;
};

export type CompositionBuildCheckPassed = BuildCheckPassed & BuildCheckResult & CompositionBuildCheckResult & {
  __typename?: 'CompositionBuildCheckPassed';
  buildInputs: CompositionBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  compositionPackageVersion?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  passed: Scalars['Boolean'];
  supergraphSchemaHash: Scalars['SHA256'];
  workflowTask: CompositionCheckTask;
};

export type CompositionBuildCheckResult = {
  buildInputs: CompositionBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  /** The version of the OSS apollo composition package used during build */
  compositionPackageVersion?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  passed: Scalars['Boolean'];
  workflowTask: CompositionCheckTask;
};

export type CompositionBuildInput = {
  __typename?: 'CompositionBuildInput';
  subgraphs: Array<Subgraph>;
  version?: Maybe<Scalars['String']>;
};

export type CompositionBuildInputSubgraph = {
  __typename?: 'CompositionBuildInputSubgraph';
  /** The name of the subgraph. */
  name: Scalars['String'];
  /** The routing URL of the subgraph. */
  routingUrl: Scalars['String'];
  /** The SHA-256 of the schema document of the subgraph. */
  schemaHash: Scalars['SHA256'];
};

export type CompositionBuildInputs = {
  __typename?: 'CompositionBuildInputs';
  /**
   * The build pipeline track used for composition. Note this is also the build pipeline track used
   *  for any triggered downstream check workflows as well.
   */
  buildPipelineTrack: BuildPipelineTrack;
  /** The subgraphs used for composition. */
  subgraphs: Array<CompositionBuildInputSubgraph>;
};

export type CompositionCheckTask = BuildCheckTask & CheckWorkflowTask & {
  __typename?: 'CompositionCheckTask';
  /** The result of the composition build check. This will be null when the task is initializing or running. */
  buildResult?: Maybe<CompositionBuildCheckResult>;
  completedAt?: Maybe<Scalars['Timestamp']>;
  /**
   * Whether the build's output supergraph core schema differs from that of the active publish for
   * the workflow's variant at the time this field executed (NOT at the time the check workflow
   * started).
   */
  coreSchemaModified: Scalars['Boolean'];
  createdAt: Scalars['Timestamp'];
  graphID: Scalars['ID'];
  id: Scalars['ID'];
  proposedBuildInputChanges: ProposedCompositionBuildInputChanges;
  /**
   * An old version of buildResult that returns a very old GraphQL type that generally should be
   * avoided. This field will soon be deprecated.
   */
  result?: Maybe<CompositionResult>;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']>;
  workflow: CheckWorkflow;
};

/** Composition configuration exposed to the gateway. */
export type CompositionConfig = {
  __typename?: 'CompositionConfig';
  /**
   * List of GCS links for implementing services that comprise a composed graph. Is empty if tag/inaccessible is enabled.
   * @deprecated Soon we will stop writing to GCS locations
   */
  implementingServiceLocations: Array<ImplementingServiceLocation>;
  /** The resulting API schema's SHA256 hash, represented as a hexadecimal string. */
  schemaHash: Scalars['String'];
};

export type CompositionConfigInput = {
  subgraphs: Array<SubgraphInput>;
};

/** The result of supergraph composition that Studio performed. */
export type CompositionPublishResult = CompositionResult & {
  __typename?: 'CompositionPublishResult';
  /** The generated composition config, or null if any errors occurred. */
  compositionConfig?: Maybe<CompositionConfig>;
  createdAt: Scalars['Timestamp'];
  /** A list of errors that occurred during composition. Errors mean that Apollo was unable to compose the graph variant's subgraphs into a supergraph schema. If any errors are present, gateways / routers are not updated. */
  errors: Array<SchemaCompositionError>;
  /** The unique ID for this instance of composition. */
  graphCompositionID: Scalars['ID'];
  graphID: Scalars['ID'];
  /** Null if CompositionPublishResult was not on a Proposal Variant */
  proposalRevision?: Maybe<ProposalRevision>;
  /**
   * Cloud router configuration associated with this build event.
   * It will be non-null for any cloud-router variant, and null for any not cloudy variant/graph
   */
  routerConfig?: Maybe<Scalars['String']>;
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  /** The supergraph SDL generated by composition. */
  supergraphSdl?: Maybe<Scalars['GraphQLDocument']>;
  /** Whether this composition result updated gateway/router instances via Uplink (`true`), or it was a dry run (`false`). */
  updatedGateway: Scalars['Boolean'];
};

/** The result of supergraph composition performed by Apollo Studio, often as the result of a subgraph check or subgraph publish. See individual implementations for more details. */
export type CompositionResult = {
  createdAt: Scalars['Timestamp'];
  /** A list of errors that occurred during composition. Errors mean that Apollo was unable to compose the graph variant's subgraphs into a supergraph schema. If any errors are present, gateways / routers are not updated. */
  errors: Array<SchemaCompositionError>;
  /** The unique ID for this instance of composition. */
  graphCompositionID: Scalars['ID'];
  /**
   * Cloud router configuration associated with this build event.
   * It will be non-null for any cloud-router variant, and null for any not cloudy variant/graph
   */
  routerConfig?: Maybe<Scalars['String']>;
  /** List of subgraphs included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  /** Supergraph SDL generated by composition. */
  supergraphSdl?: Maybe<Scalars['GraphQLDocument']>;
};

export type CompositionStatusSubscription = ChannelSubscription & {
  __typename?: 'CompositionStatusSubscription';
  channels: Array<Channel>;
  createdAt: Scalars['Timestamp'];
  enabled: Scalars['Boolean'];
  id: Scalars['ID'];
  lastUpdatedAt: Scalars['Timestamp'];
  variant?: Maybe<Scalars['String']>;
};

/** The composition config exposed to the gateway */
export type CompositionValidationDetails = {
  __typename?: 'CompositionValidationDetails';
  /** Hash of the composed schema */
  schemaHash?: Maybe<Scalars['String']>;
};

/** The result of composition validation run by Apollo Studio during a subgraph check. */
export type CompositionValidationResult = CompositionResult & {
  __typename?: 'CompositionValidationResult';
  /** Describes whether composition succeeded. */
  compositionSuccess: Scalars['Boolean'];
  /**
   * Akin to a composition config, represents the subgraph schemas and corresponding subgraphs that were used
   * in running composition. Will be null if any errors are encountered. Also may contain a schema hash if
   * one could be computed, which can be used for schema validation.
   */
  compositionValidationDetails?: Maybe<CompositionValidationDetails>;
  createdAt: Scalars['Timestamp'];
  /** A list of errors that occurred during composition. Errors mean that Apollo was unable to compose the graph variant's subgraphs into a supergraph schema. If any errors are present, gateways / routers are not updated. */
  errors: Array<SchemaCompositionError>;
  /** The unique ID for this instance of composition. */
  graphCompositionID: Scalars['ID'];
  /**
   * The implementing service that was responsible for triggering the validation
   * @deprecated The proposed subgraph is now exposed under proposedSubgraphs, a list. If a single subgraph check was run the list will be one subgraph long.
   */
  proposedImplementingService: FederatedImplementingServicePartialSchema;
  /** DO NOT USE, NOT YET IMPLEMENTED. The subgraphs with changes that were responsible for triggering the validation */
  proposedSubgraphs: Array<FederatedImplementingServicePartialSchema>;
  /**
   * Cloud router configuration associated with this build event.
   * It will be non-null for any cloud-router variant, and null for any not cloudy variant/graph
   */
  routerConfig?: Maybe<Scalars['String']>;
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  /** The supergraph schema document generated by composition. */
  supergraphSdl?: Maybe<Scalars['GraphQLDocument']>;
  /** If created as part of a check workflow, the associated workflow task. */
  workflowTask?: Maybe<CompositionCheckTask>;
};

export type ContractConfigInput = {
  baseGraphRef: Scalars['String'];
  filterConfigInput: FilterConfigInput;
};

export type ContractPreview = {
  __typename?: 'ContractPreview';
  result: ContractPreviewResult;
  upstreamLaunch: Launch;
};

export type ContractPreviewErrors = {
  __typename?: 'ContractPreviewErrors';
  errors: Array<Scalars['String']>;
  failedAt: ContractVariantFailedStep;
};

export type ContractPreviewResult = ContractPreviewErrors | ContractPreviewSuccess;

export type ContractPreviewSuccess = {
  __typename?: 'ContractPreviewSuccess';
  apiDocument: Scalars['String'];
  coreDocument: Scalars['String'];
  fieldCount: Scalars['Int'];
  typeCount: Scalars['Int'];
};

export enum ContractVariantFailedStep {
  ADD_DIRECTIVE_DEFINITIONS_IF_NOT_PRESENT = 'ADD_DIRECTIVE_DEFINITIONS_IF_NOT_PRESENT',
  ADD_INACCESSIBLE_SPEC_PURPOSE = 'ADD_INACCESSIBLE_SPEC_PURPOSE',
  DIRECTIVE_DEFINITION_LOCATION_AUGMENTING = 'DIRECTIVE_DEFINITION_LOCATION_AUGMENTING',
  EMPTY_ENUM_MASKING = 'EMPTY_ENUM_MASKING',
  EMPTY_INPUT_OBJECT_MASKING = 'EMPTY_INPUT_OBJECT_MASKING',
  EMPTY_OBJECT_AND_INTERFACE_FIELD_MASKING = 'EMPTY_OBJECT_AND_INTERFACE_FIELD_MASKING',
  EMPTY_OBJECT_AND_INTERFACE_MASKING = 'EMPTY_OBJECT_AND_INTERFACE_MASKING',
  EMPTY_UNION_MASKING = 'EMPTY_UNION_MASKING',
  INPUT_VALIDATION = 'INPUT_VALIDATION',
  PARSING = 'PARSING',
  PARSING_TAG_DIRECTIVES = 'PARSING_TAG_DIRECTIVES',
  PARTIAL_INTERFACE_MASKING = 'PARTIAL_INTERFACE_MASKING',
  SCHEMA_RETRIEVAL = 'SCHEMA_RETRIEVAL',
  TAG_INHERITING = 'TAG_INHERITING',
  TAG_MATCHING = 'TAG_MATCHING',
  TO_API_SCHEMA = 'TO_API_SCHEMA',
  TO_FILTER_SCHEMA = 'TO_FILTER_SCHEMA',
  UNKNOWN = 'UNKNOWN',
  UNREACHABLE_TYPE_MASKING = 'UNREACHABLE_TYPE_MASKING',
  VERSION_CHECK = 'VERSION_CHECK'
}

export type ContractVariantUpsertErrors = {
  __typename?: 'ContractVariantUpsertErrors';
  /** A list of all errors that occurred when attempting to create or update a contract variant. */
  errorMessages: Array<Scalars['String']>;
};

export type ContractVariantUpsertResult = ContractVariantUpsertErrors | ContractVariantUpsertSuccess;

export type ContractVariantUpsertSuccess = {
  __typename?: 'ContractVariantUpsertSuccess';
  /** The updated contract variant */
  contractVariant: GraphVariant;
  /** Human-readable text describing the launch result of the contract update. */
  launchCliCopy?: Maybe<Scalars['String']>;
  /** The URL of the Studio page for this update's associated launch, if available. */
  launchUrl?: Maybe<Scalars['String']>;
};

export type Coordinate = {
  __typename?: 'Coordinate';
  byteOffset: Scalars['Int'];
  column: Scalars['Int'];
  line: Scalars['Int'];
};

/** Contains the supergraph and API schemas generated by composition. */
export type CoreSchema = {
  __typename?: 'CoreSchema';
  /** The composed API schema document. */
  apiDocument: Scalars['GraphQLDocument'];
  /** The composed supergraph schema document. */
  coreDocument: Scalars['GraphQLDocument'];
  /** The supergraph schema document's SHA256 hash, represented as a hexadecimal string. */
  coreHash: Scalars['String'];
  fieldCount: Scalars['Int'];
  tags: Array<Scalars['String']>;
  typeCount: Scalars['Int'];
};

/** Input to create a new AWS shard */
export type CreateAwsShardInput = {
  accountId: Scalars['String'];
  coldStartTargetGroupArns?: InputMaybe<Array<Scalars['String']>>;
  ecsClusterArn: Scalars['String'];
  iamRoleArn: Scalars['String'];
  loadbalancerSecurityGroupId: Scalars['String'];
  loadbalancers: Array<AwsLoadBalancerInput>;
  permissionsBoundaryArn: Scalars['String'];
  region: Scalars['String'];
  subnetIds: Array<Scalars['String']>;
  vpcId: Scalars['String'];
};

/** Input to create a new Fly shard */
export type CreateFlyShardInput = {
  endpoint: Scalars['String'];
  etcdEndpoints: Array<Scalars['String']>;
  organizationId: Scalars['String'];
  region: Scalars['String'];
};

/** Result from the createCloudOnboarding mutation */
export type CreateOnboardingResult = CreateOnboardingSuccess | InternalServerError | InvalidInputErrors;

/** Success creating a CloudOnboarding */
export type CreateOnboardingSuccess = {
  __typename?: 'CreateOnboardingSuccess';
  onboarding: CloudOnboarding;
};

export type CreateOperationCollectionResult = OperationCollection | PermissionError | ValidationError;

export type CreatePersistedQueryListResult = {
  __typename?: 'CreatePersistedQueryListResult';
  persistedQueryList: PersistedQueryList;
};

export type CreatePersistedQueryListResultOrError = CreatePersistedQueryListResult | PermissionError;

/** An error that occurs when creating a proposal fails. */
export type CreateProposalError = Error & {
  __typename?: 'CreateProposalError';
  /** The error's details. */
  message: Scalars['String'];
};

export type CreateProposalInput = {
  description?: InputMaybe<Scalars['String']>;
  displayName: Scalars['String'];
  sourceVariantName: Scalars['String'];
};

export type CreateProposalResult = CreateProposalError | GraphVariant | PermissionError | ValidationError;

/** Input to create a new Cloud Router */
export type CreateRouterInput = {
  /**
   * Number of GCUs allocated for the Cloud Router
   *
   * This is ignored for serverless Cloud Routers
   */
  gcus?: InputMaybe<Scalars['Int']>;
  /** Graph composition ID, also known as launch ID */
  graphCompositionId?: InputMaybe<Scalars['String']>;
  /** Unique identifier for ordering orders */
  orderingId: Scalars['String'];
  /** Configuration for the Cloud Router */
  routerConfig?: InputMaybe<Scalars['String']>;
  /** Router version for the Cloud Router */
  routerVersion?: InputMaybe<Scalars['String']>;
};

/** Represents the possible outcomes of a createRouter mutation */
export type CreateRouterResult = CreateRouterSuccess | InternalServerError | InvalidInputErrors;

/**
 * Success branch of a createRouter mutation
 *
 * id of the order can be polled
 * via Query.cloud().order(id: ID!) to check-in on the progress
 * of the underlying operation
 */
export type CreateRouterSuccess = {
  __typename?: 'CreateRouterSuccess';
  order: Order;
};

/** Result of a createVersion mutation */
export type CreateRouterVersionResult = CloudInvalidInputError | InternalServerError | RouterVersion;

/** Input to create a new Shard */
export type CreateShardInput = {
  aws?: InputMaybe<CreateAwsShardInput>;
  fly?: InputMaybe<CreateFlyShardInput>;
  gcuCapacity?: InputMaybe<Scalars['Int']>;
  gcuUsage?: InputMaybe<Scalars['Int']>;
  provider: CloudProvider;
  reason?: InputMaybe<Scalars['String']>;
  routerCapacity?: InputMaybe<Scalars['Int']>;
  routerUsage?: InputMaybe<Scalars['Int']>;
  shardId: Scalars['String'];
  status?: InputMaybe<ShardStatus>;
  tier: CloudTier;
};

export type CronExecution = {
  __typename?: 'CronExecution';
  completedAt?: Maybe<Scalars['Timestamp']>;
  failure?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  job: CronJob;
  resolvedAt?: Maybe<Scalars['Timestamp']>;
  resolvedBy?: Maybe<Actor>;
  schedule: Scalars['String'];
  startedAt: Scalars['Timestamp'];
};

export type CronJob = {
  __typename?: 'CronJob';
  group: Scalars['String'];
  name: Scalars['String'];
  recentExecutions: Array<CronExecution>;
};


export type CronJobrecentExecutionsArgs = {
  n?: InputMaybe<Scalars['Int']>;
};

export type CustomerAccount = {
  __typename?: 'CustomerAccount';
  id: Scalars['ID'];
  name: Scalars['String'];
  next?: Maybe<Scalars['String']>;
  studioOrgId: Scalars['ID'];
  traits: AccountCustomerTraits;
};

export type CustomerOrg = {
  __typename?: 'CustomerOrg';
  accounts: Array<CustomerAccount>;
  externalSlackChannelId?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  internalSlackChannelId?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  next?: Maybe<Scalars['String']>;
  sfdcId: Scalars['ID'];
  traits: OrgCustomerTraits;
};

export type CustomerSupportSlackError = {
  __typename?: 'CustomerSupportSlackError';
  message: Scalars['String'];
};

export enum DatadogApiRegion {
  EU = 'EU',
  EU1 = 'EU1',
  US = 'US',
  US1 = 'US1',
  US1FED = 'US1FED',
  US3 = 'US3',
  US5 = 'US5'
}

export type DatadogMetricsConfig = {
  __typename?: 'DatadogMetricsConfig';
  apiKey: Scalars['String'];
  apiRegion: DatadogApiRegion;
  enabled: Scalars['Boolean'];
  legacyMetricNames: Scalars['Boolean'];
};

export type DeleteCommentInput = {
  id: Scalars['String'];
};

export type DeleteCommentResult = DeleteCommentSuccess | NotFoundError | PermissionError | ValidationError;

export type DeleteCommentSuccess = {
  __typename?: 'DeleteCommentSuccess';
  comment?: Maybe<DeleteCommentSuccessResult>;
};

export type DeleteCommentSuccessResult = ParentChangeProposalComment | ParentGeneralProposalComment;

export type DeleteOperationCollectionResult = DeleteOperationCollectionSuccess | PermissionError;

export type DeleteOperationCollectionSuccess = {
  __typename?: 'DeleteOperationCollectionSuccess';
  sandboxOwner?: Maybe<User>;
  variants: Array<GraphVariant>;
};

export type DeletePersistedQueryListResult = {
  __typename?: 'DeletePersistedQueryListResult';
  graph: Service;
};

export type DeletePersistedQueryListResultOrError = CannotDeleteLinkedPersistedQueryListError | DeletePersistedQueryListResult | PermissionError;

export type DeleteProposalSubgraphInput = {
  previousLaunchId?: InputMaybe<Scalars['ID']>;
  subgraphName: Scalars['String'];
  summary: Scalars['String'];
};

export type DeleteProposalSubgraphResult = PermissionError | Proposal | ValidationError;

/** The result of attempting to delete a graph variant. */
export type DeleteSchemaTagResult = {
  __typename?: 'DeleteSchemaTagResult';
  /** Whether the variant was deleted or not. */
  deleted: Scalars['Boolean'];
};

export enum DeletionTargetType {
  ACCOUNT = 'ACCOUNT',
  USER = 'USER'
}

/** Represents the possible outcomes of a destroyRouter mutation */
export type DestroyRouterResult = DestroyRouterSuccess | InternalServerError | InvalidInputErrors;

/** Success branch of a destroyRouter mutation */
export type DestroyRouterSuccess = {
  __typename?: 'DestroyRouterSuccess';
  /**
   * Order for the destroyRouter mutation
   *
   * This could be empty if the router is already destroyed or doesn't exist, but should still
   * be treated as a success.
   */
  order?: Maybe<Order>;
};

/** Support for a single directive on a graph variant */
export type DirectiveSupportStatus = {
  __typename?: 'DirectiveSupportStatus';
  /** whether the directive is supported on the current graph variant */
  enabled: Scalars['Boolean'];
  /** name of the directive */
  name: Scalars['String'];
};

/** The result of a schema checks workflow that was run on a downstream variant as part of checks for the corresponding source variant. Most commonly, these downstream checks are [contract checks](https://www.apollographql.com/docs/studio/contracts#contract-checks). */
export type DownstreamCheckResult = {
  __typename?: 'DownstreamCheckResult';
  /** Whether the downstream check workflow blocks the upstream check workflow from completing. */
  blocking: Scalars['Boolean'];
  /** The ID of the graph that the downstream variant belongs to. */
  downstreamGraphID: Scalars['String'];
  /** The name of the downstream variant. */
  downstreamVariantName: Scalars['String'];
  /**
   * The downstream checks workflow that this result corresponds to. This value is null
   * if the workflow hasn't been initialized yet, or if the downstream variant was deleted.
   */
  downstreamWorkflow?: Maybe<CheckWorkflow>;
  /**
   * Whether the downstream check workflow is causing the upstream check workflow to fail. This occurs
   * when the downstream check workflow is both blocking and failing. This may be null while the
   * downstream check workflow is pending.
   */
  failsUpstreamWorkflow?: Maybe<Scalars['Boolean']>;
  /** The downstream checks task that this result corresponds to. */
  workflowTask: DownstreamCheckTask;
};

export type DownstreamCheckTask = CheckWorkflowTask & {
  __typename?: 'DownstreamCheckTask';
  completedAt?: Maybe<Scalars['Timestamp']>;
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  /**
   * A list of results for all downstream checks triggered as part of the source variant's checks workflow.
   * This value is null if the task hasn't been initialized yet, or if the build task fails (the build task is a
   * prerequisite to this task). This value is _not_ null _while_ the task is running. The returned list is empty
   * if the source variant has no downstream variants.
   */
  results?: Maybe<Array<DownstreamCheckResult>>;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']>;
  workflow: CheckWorkflow;
};

export enum DownstreamLaunchInitiation {
  /**
   * Initiate the creation of downstream launches associated with this subgraph publication asynchronously.
   * The resulting API response may not provide specific details about triggered downstream launches.
   */
  ASYNC = 'ASYNC',
  /**
   * Initiate the creation of downstream Launches associated with this subgraph publication synchronously.
   * Use this option to ensure that any downstream launches will be started before the publish mutation returns.
   * Note that this does not require launches to complete, but it does ensure that the downstream launch IDs are
   * available to be queried from a `CompositionAndUpsertResult`.
   */
  SYNC = 'SYNC'
}

export type DraftInvoice = {
  __typename?: 'DraftInvoice';
  billingPeriodEndsAt: Scalars['Timestamp'];
  billingPeriodStartsAt: Scalars['Timestamp'];
  /** The approximate date in the future we expect the customer to be billed if they fully complete the billing cycle */
  expectedInvoiceAt: Scalars['Timestamp'];
  /** When this invoice was sent to the customer, if it's been sent */
  invoicedAt?: Maybe<Scalars['Timestamp']>;
  /** Breakdown of this invoice's charges. May be empty if we don't have a breakdown */
  lineItems?: Maybe<Array<InvoiceLineItem>>;
  subtotalInCents: Scalars['Int'];
  totalInCents: Scalars['Int'];
};

export type DuplicateOperationCollectionResult = OperationCollection | PermissionError | ValidationError;

export type DurationHistogram = {
  __typename?: 'DurationHistogram';
  averageDurationMs?: Maybe<Scalars['Float']>;
  buckets: Array<DurationHistogramBucket>;
  durationMs?: Maybe<Scalars['Float']>;
  /** Counts per durationBucket, where sequences of zeroes are replaced with the negative of their size */
  sparseBuckets: Array<Scalars['Long']>;
  totalCount: Scalars['Long'];
  totalDurationMs: Scalars['Float'];
};


export type DurationHistogramdurationMsArgs = {
  percentile: Scalars['Float'];
};

export type DurationHistogramBucket = {
  __typename?: 'DurationHistogramBucket';
  count: Scalars['Long'];
  index: Scalars['Int'];
  rangeBeginMs: Scalars['Float'];
  rangeEndMs: Scalars['Float'];
};

export type EdgeServerInfo = {
  /** A randomly generated UUID, immutable for the lifetime of the edge server runtime. */
  bootId: Scalars['String'];
  /** A unique identifier for the executable GraphQL served by the edge server. length must be <= 64 characters. */
  executableSchemaId: Scalars['String'];
  /** The graph variant, defaults to 'current' */
  graphVariant?: Scalars['String'];
  /** The version of the edge server reporting agent, e.g. apollo-server-2.8, graphql-java-3.1, etc. length must be <= 256 characters. */
  libraryVersion?: InputMaybe<Scalars['String']>;
  /** The infra environment in which this edge server is running, e.g. localhost, Kubernetes, AWS Lambda, Google CloudRun, AWS ECS, etc. length must be <= 256 characters. */
  platform?: InputMaybe<Scalars['String']>;
  /** The runtime in which the edge server is running, e.g. node 12.03, zulu8.46.0.19-ca-jdk8.0.252-macosx_x64, etc. length must be <= 256 characters. */
  runtimeVersion?: InputMaybe<Scalars['String']>;
  /** If available, an identifier for the edge server instance, such that when restarting this instance it will have the same serverId, with a different bootId. For example, in Kubernetes this might be the pod name. Length must be <= 256 characters. */
  serverId?: InputMaybe<Scalars['String']>;
  /** An identifier used to distinguish the version (from the user's perspective) of the edge server's code itself. For instance, the git sha of the server's repository or the docker sha of the associated image this server runs with. Length must be <= 256 characters. */
  userVersion?: InputMaybe<Scalars['String']>;
};

/** Columns of EdgeServerInfos. */
export enum EdgeServerInfosColumn {
  BOOT_ID = 'BOOT_ID',
  EXECUTABLE_SCHEMA_ID = 'EXECUTABLE_SCHEMA_ID',
  LIBRARY_VERSION = 'LIBRARY_VERSION',
  PLATFORM = 'PLATFORM',
  RUNTIME_VERSION = 'RUNTIME_VERSION',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVER_ID = 'SERVER_ID',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP',
  USER_VERSION = 'USER_VERSION'
}

export type EdgeServerInfosDimensions = {
  __typename?: 'EdgeServerInfosDimensions';
  bootId?: Maybe<Scalars['ID']>;
  executableSchemaId?: Maybe<Scalars['ID']>;
  libraryVersion?: Maybe<Scalars['String']>;
  platform?: Maybe<Scalars['String']>;
  runtimeVersion?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serverId?: Maybe<Scalars['ID']>;
  serviceId?: Maybe<Scalars['ID']>;
  userVersion?: Maybe<Scalars['String']>;
};

/** Filter for data in EdgeServerInfos. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type EdgeServerInfosFilter = {
  and?: InputMaybe<Array<EdgeServerInfosFilter>>;
  /** Selects rows whose bootId dimension equals the given value if not null. To query for the null value, use {in: {bootId: [null]}} instead. */
  bootId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose executableSchemaId dimension equals the given value if not null. To query for the null value, use {in: {executableSchemaId: [null]}} instead. */
  executableSchemaId?: InputMaybe<Scalars['ID']>;
  in?: InputMaybe<EdgeServerInfosFilterIn>;
  /** Selects rows whose libraryVersion dimension equals the given value if not null. To query for the null value, use {in: {libraryVersion: [null]}} instead. */
  libraryVersion?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<EdgeServerInfosFilter>;
  or?: InputMaybe<Array<EdgeServerInfosFilter>>;
  /** Selects rows whose platform dimension equals the given value if not null. To query for the null value, use {in: {platform: [null]}} instead. */
  platform?: InputMaybe<Scalars['String']>;
  /** Selects rows whose runtimeVersion dimension equals the given value if not null. To query for the null value, use {in: {runtimeVersion: [null]}} instead. */
  runtimeVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serverId dimension equals the given value if not null. To query for the null value, use {in: {serverId: [null]}} instead. */
  serverId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose userVersion dimension equals the given value if not null. To query for the null value, use {in: {userVersion: [null]}} instead. */
  userVersion?: InputMaybe<Scalars['String']>;
};

/** Filter for data in EdgeServerInfos. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type EdgeServerInfosFilterIn = {
  /** Selects rows whose bootId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  bootId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose executableSchemaId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  executableSchemaId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose libraryVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  libraryVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose platform dimension is in the given list. A null value in the list means a row with null for that dimension. */
  platform?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose runtimeVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  runtimeVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serverId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serverId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose userVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  userVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type EdgeServerInfosOrderBySpec = {
  column: EdgeServerInfosColumn;
  direction: Ordering;
};

export type EdgeServerInfosRecord = {
  __typename?: 'EdgeServerInfosRecord';
  /** Dimensions of EdgeServerInfos that can be grouped by. */
  groupBy: EdgeServerInfosDimensions;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type EditCommentInput = {
  id: Scalars['String'];
  message: Scalars['String'];
  usersToNotify?: InputMaybe<Array<Scalars['String']>>;
};

export type EditCommentResult = NotFoundError | ParentChangeProposalComment | ParentGeneralProposalComment | PermissionError | ReplyChangeProposalComment | ReplyGeneralProposalComment | ValidationError;

export enum EmailCategory {
  EDUCATIONAL = 'EDUCATIONAL'
}

export type EmailPreferences = {
  __typename?: 'EmailPreferences';
  email: Scalars['String'];
  subscriptions: Array<EmailCategory>;
  unsubscribedFromAll: Scalars['Boolean'];
};

export type EndUsageBasedPlanResult = Account | NotFoundError | PermissionError | ValidationError;

export type EntitiesError = {
  __typename?: 'EntitiesError';
  message: Scalars['String'];
};

export type EntitiesErrorResponse = {
  __typename?: 'EntitiesErrorResponse';
  errors: Array<EntitiesError>;
};

export type EntitiesResponse = {
  __typename?: 'EntitiesResponse';
  entities: Array<Entity>;
};

export type EntitiesResponseOrError = EntitiesErrorResponse | EntitiesResponse;

export type Entity = {
  __typename?: 'Entity';
  subgraphKeys?: Maybe<Array<SubgraphKeyMap>>;
  typename: Scalars['String'];
};

/** GraphQL Error */
export type Error = {
  message: Scalars['String'];
};

/** Columns of ErrorStats. */
export enum ErrorStatsColumn {
  ACCOUNT_ID = 'ACCOUNT_ID',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ERRORS_COUNT = 'ERRORS_COUNT',
  PATH = 'PATH',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REQUESTS_WITH_ERRORS_COUNT = 'REQUESTS_WITH_ERRORS_COUNT',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type ErrorStatsDimensions = {
  __typename?: 'ErrorStatsDimensions';
  accountId?: Maybe<Scalars['ID']>;
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in ErrorStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ErrorStatsFilter = {
  /** Selects rows whose accountId dimension equals the given value if not null. To query for the null value, use {in: {accountId: [null]}} instead. */
  accountId?: InputMaybe<Scalars['ID']>;
  and?: InputMaybe<Array<ErrorStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<ErrorStatsFilterIn>;
  not?: InputMaybe<ErrorStatsFilter>;
  or?: InputMaybe<Array<ErrorStatsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in ErrorStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ErrorStatsFilterIn = {
  /** Selects rows whose accountId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  accountId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type ErrorStatsMetrics = {
  __typename?: 'ErrorStatsMetrics';
  errorsCount: Scalars['Long'];
  requestsWithErrorsCount: Scalars['Long'];
};

export type ErrorStatsOrderBySpec = {
  column: ErrorStatsColumn;
  direction: Ordering;
};

export type ErrorStatsRecord = {
  __typename?: 'ErrorStatsRecord';
  /** Dimensions of ErrorStats that can be grouped by. */
  groupBy: ErrorStatsDimensions;
  /** Metrics of ErrorStats that can be aggregated over. */
  metrics: ErrorStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/**  Input parameters for run explorer operation event. */
export enum EventEnum {
  CLICK_CHECK_LIST = 'CLICK_CHECK_LIST',
  CLICK_GO_TO_GRAPH_SETTINGS = 'CLICK_GO_TO_GRAPH_SETTINGS',
  RUN_EXPLORER_OPERATION = 'RUN_EXPLORER_OPERATION'
}

/** Excluded operation for a graph. */
export type ExcludedOperation = {
  __typename?: 'ExcludedOperation';
  /** Operation ID to exclude from schema check. */
  ID: Scalars['ID'];
};

/** Option to filter by operation ID. */
export type ExcludedOperationInput = {
  /** Operation ID to exclude from schema check. */
  ID: Scalars['ID'];
};

export type FeatureIntros = {
  __typename?: 'FeatureIntros';
  /** @deprecated No longer supported */
  devGraph: Scalars['Boolean'];
  federatedGraph: Scalars['Boolean'];
  freeConsumerSeats: Scalars['Boolean'];
};

/** Feature Intros Input Type */
export type FeatureIntrosInput = {
  federatedGraph?: InputMaybe<Scalars['Boolean']>;
  freeConsumerSeats?: InputMaybe<Scalars['Boolean']>;
};

/** A single subgraph in a supergraph. Every supergraph managed by Apollo Studio includes at least one subgraph. See https://www.apollographql.com/docs/federation/managed-federation/overview/ for more information. */
export type FederatedImplementingService = {
  __typename?: 'FederatedImplementingService';
  /** The subgraph's current active schema, used in supergraph composition for the the associated variant. */
  activePartialSchema: PartialSchema;
  /** The timestamp when the subgraph was created. */
  createdAt: Scalars['Timestamp'];
  /** The timestamp when the subgraph was deleted. Null if it wasn't deleted. */
  deletedAt?: Maybe<Scalars['Timestamp']>;
  /** The ID of the graph this subgraph belongs to. */
  graphID: Scalars['String'];
  /** The name of the graph variant this subgraph belongs to. */
  graphVariant: Scalars['String'];
  /** The subgraph's name. */
  name: Scalars['String'];
  /** The current user-provided version/edition of the subgraph. Typically a Git SHA or docker image ID. */
  revision: Scalars['String'];
  /** The timestamp when the subgraph was most recently updated. */
  updatedAt: Scalars['Timestamp'];
  /** The URL of the subgraph's GraphQL endpoint. */
  url?: Maybe<Scalars['String']>;
};

/** A minimal representation of a federated implementing service, using only a name and partial schema SDL */
export type FederatedImplementingServicePartialSchema = {
  __typename?: 'FederatedImplementingServicePartialSchema';
  /** The name of the implementing service */
  name: Scalars['String'];
  /** The partial schema of the implementing service */
  sdl: Scalars['String'];
};

/** Container for a list of subgraphs composing a supergraph. */
export type FederatedImplementingServices = {
  __typename?: 'FederatedImplementingServices';
  /** The list of underlying subgraphs. */
  services: Array<FederatedImplementingService>;
};

/** Counts of changes at the field level, including objects, interfaces, and input fields. */
export type FieldChangeSummaryCounts = {
  __typename?: 'FieldChangeSummaryCounts';
  /** Number of changes that are additions of fields to object, interface, and input types. */
  additions: Scalars['Int'];
  /**
   * Number of changes that are field edits. This includes fields changing type and any field
   * deprecation and description changes, but also includes any argument changes and any input object
   * field changes.
   */
  edits: Scalars['Int'];
  /** Number of changes that are removals of fields from object, interface, and input types. */
  removals: Scalars['Int'];
};

/** Columns of FieldExecutions. */
export enum FieldExecutionsColumn {
  ERRORS_COUNT = 'ERRORS_COUNT',
  ESTIMATED_EXECUTION_COUNT = 'ESTIMATED_EXECUTION_COUNT',
  FIELD_NAME = 'FIELD_NAME',
  OBSERVED_EXECUTION_COUNT = 'OBSERVED_EXECUTION_COUNT',
  PARENT_TYPE = 'PARENT_TYPE',
  REFERENCING_OPERATION_COUNT = 'REFERENCING_OPERATION_COUNT',
  REQUESTS_WITH_ERRORS_COUNT = 'REQUESTS_WITH_ERRORS_COUNT',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type FieldExecutionsDimensions = {
  __typename?: 'FieldExecutionsDimensions';
  fieldName?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in FieldExecutions. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type FieldExecutionsFilter = {
  and?: InputMaybe<Array<FieldExecutionsFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<FieldExecutionsFilterIn>;
  not?: InputMaybe<FieldExecutionsFilter>;
  or?: InputMaybe<Array<FieldExecutionsFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in FieldExecutions. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type FieldExecutionsFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type FieldExecutionsMetrics = {
  __typename?: 'FieldExecutionsMetrics';
  errorsCount: Scalars['Long'];
  estimatedExecutionCount: Scalars['Long'];
  observedExecutionCount: Scalars['Long'];
  referencingOperationCount: Scalars['Long'];
  requestsWithErrorsCount: Scalars['Long'];
};

export type FieldExecutionsOrderBySpec = {
  column: FieldExecutionsColumn;
  direction: Ordering;
};

export type FieldExecutionsRecord = {
  __typename?: 'FieldExecutionsRecord';
  /** Dimensions of FieldExecutions that can be grouped by. */
  groupBy: FieldExecutionsDimensions;
  /** Metrics of FieldExecutions that can be aggregated over. */
  metrics: FieldExecutionsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type FieldInsights = {
  __typename?: 'FieldInsights';
  /** If the first or last seen timestamps are earlier than this timestamp, we can't tell the exact date that we saw this field since our data is bound by the retention period. */
  earliestRetentionTime?: Maybe<Scalars['Timestamp']>;
  /** The earliest time we saw references or executions for this field. Null if the field has never been seen or it is not in the schema. */
  firstSeen?: Maybe<Scalars['Timestamp']>;
  /** The most recent time we saw references or executions for this field. Null if the field has never been seen or it is not in the schema. */
  lastSeen?: Maybe<Scalars['Timestamp']>;
};

export type FieldInsightsListFilterInInput = {
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type FieldInsightsListFilterInput = {
  clientName?: InputMaybe<Scalars['String']>;
  clientVersion?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<FieldInsightsListFilterInInput>;
  isDeprecated?: InputMaybe<Scalars['Boolean']>;
  isUnused?: InputMaybe<Scalars['Boolean']>;
  or?: InputMaybe<Array<FieldInsightsListFilterInput>>;
  /** Filters on partial string matches of Parent Type and Field Name */
  search?: InputMaybe<Scalars['String']>;
};

export type FieldInsightsListItem = {
  __typename?: 'FieldInsightsListItem';
  /** The count of errors seen for this field. This can be null depending on the sort order. */
  errorCount?: Maybe<Scalars['Long']>;
  /** The count of errors seen for this field per minute. This can be null depending on the sort order. */
  errorCountPerMin?: Maybe<Scalars['Float']>;
  /** The percentage of errors vs successful resolutions for this field. This can be null depending on the sort order. */
  errorPercentage?: Maybe<Scalars['Float']>;
  /** The estimated number of field executions for this field, based on the field execution sample rate. This can be null depending on the sort order. */
  estimatedExecutionCount?: Maybe<Scalars['Long']>;
  /** The number of field executions recorded for this field. This can be null depending on the sort order. */
  executionCount?: Maybe<Scalars['Long']>;
  fieldName: Scalars['String'];
  isDeprecated: Scalars['Boolean'];
  isUnused: Scalars['Boolean'];
  /** The p50 of the latency of the resolution of this field. This can be null depending on the filter and sort order. */
  p50LatencyMs?: Maybe<Scalars['Float']>;
  /** The p90 of the latency of the resolution of this field. This can be null depending on the filter and sort order. */
  p90LatencyMs?: Maybe<Scalars['Float']>;
  /** The p95 of the latency of the resolution of this field. This can be null depending on the filter and sort order. */
  p95LatencyMs?: Maybe<Scalars['Float']>;
  /** The p99 of the latency of the resolution of this field. This can be null depending on the filter and sort order. */
  p99LatencyMs?: Maybe<Scalars['Float']>;
  parentType: Scalars['String'];
  /** The count of operations that reference the field. This can be null depending on the sort order. */
  referencingOperationCount?: Maybe<Scalars['Long']>;
  /** The count of operations that reference the field per minute. This can be null depending on the sort order. */
  referencingOperationCountPerMin?: Maybe<Scalars['Float']>;
};

export enum FieldInsightsListOrderByColumn {
  ERROR_COUNT = 'ERROR_COUNT',
  ERROR_COUNT_PER_MIN = 'ERROR_COUNT_PER_MIN',
  ERROR_PERCENTAGE = 'ERROR_PERCENTAGE',
  ESTIMATED_EXECUTION_COUNT = 'ESTIMATED_EXECUTION_COUNT',
  EXECUTION_COUNT = 'EXECUTION_COUNT',
  PARENT_TYPE_AND_FIELD_NAME = 'PARENT_TYPE_AND_FIELD_NAME',
  REFERENCING_OPERATION_COUNT = 'REFERENCING_OPERATION_COUNT',
  REFERENCING_OPERATION_COUNT_PER_MIN = 'REFERENCING_OPERATION_COUNT_PER_MIN',
  SERVICE_TIME_P50 = 'SERVICE_TIME_P50',
  SERVICE_TIME_P90 = 'SERVICE_TIME_P90',
  SERVICE_TIME_P95 = 'SERVICE_TIME_P95',
  SERVICE_TIME_P99 = 'SERVICE_TIME_P99'
}

export type FieldInsightsListOrderByInput = {
  column: FieldInsightsListOrderByColumn;
  direction: Ordering;
};

/** Information about pagination in a connection. */
export type FieldInsightsListPageInfo = {
  __typename?: 'FieldInsightsListPageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

/** Columns of FieldLatencies. */
export enum FieldLatenciesColumn {
  FIELD_HISTOGRAM = 'FIELD_HISTOGRAM',
  FIELD_NAME = 'FIELD_NAME',
  PARENT_TYPE = 'PARENT_TYPE',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type FieldLatenciesDimensions = {
  __typename?: 'FieldLatenciesDimensions';
  field?: Maybe<Scalars['String']>;
  fieldName?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in FieldLatencies. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type FieldLatenciesFilter = {
  and?: InputMaybe<Array<FieldLatenciesFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<FieldLatenciesFilterIn>;
  not?: InputMaybe<FieldLatenciesFilter>;
  or?: InputMaybe<Array<FieldLatenciesFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in FieldLatencies. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type FieldLatenciesFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type FieldLatenciesMetrics = {
  __typename?: 'FieldLatenciesMetrics';
  fieldHistogram: DurationHistogram;
};

export type FieldLatenciesOrderBySpec = {
  column: FieldLatenciesColumn;
  direction: Ordering;
};

export type FieldLatenciesRecord = {
  __typename?: 'FieldLatenciesRecord';
  /** Dimensions of FieldLatencies that can be grouped by. */
  groupBy: FieldLatenciesDimensions;
  /** Metrics of FieldLatencies that can be aggregated over. */
  metrics: FieldLatenciesMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of FieldUsage. */
export enum FieldUsageColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ESTIMATED_EXECUTION_COUNT = 'ESTIMATED_EXECUTION_COUNT',
  EXECUTION_COUNT = 'EXECUTION_COUNT',
  FIELD_NAME = 'FIELD_NAME',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  PARENT_TYPE = 'PARENT_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REFERENCING_OPERATION_COUNT = 'REFERENCING_OPERATION_COUNT',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type FieldUsageDimensions = {
  __typename?: 'FieldUsageDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  fieldName?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in FieldUsage. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type FieldUsageFilter = {
  and?: InputMaybe<Array<FieldUsageFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<FieldUsageFilterIn>;
  not?: InputMaybe<FieldUsageFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<FieldUsageFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in FieldUsage. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type FieldUsageFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type FieldUsageMetrics = {
  __typename?: 'FieldUsageMetrics';
  estimatedExecutionCount: Scalars['Long'];
  executionCount: Scalars['Long'];
  referencingOperationCount: Scalars['Long'];
};

export type FieldUsageOrderBySpec = {
  column: FieldUsageColumn;
  direction: Ordering;
};

export type FieldUsageRecord = {
  __typename?: 'FieldUsageRecord';
  /** Dimensions of FieldUsage that can be grouped by. */
  groupBy: FieldUsageDimensions;
  /** Metrics of FieldUsage that can be aggregated over. */
  metrics: FieldUsageMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type FilterBuildCheckFailed = BuildCheckFailed & BuildCheckResult & FilterBuildCheckResult & {
  __typename?: 'FilterBuildCheckFailed';
  buildInputs: FilterBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  errors: Array<BuildError>;
  id: Scalars['ID'];
  passed: Scalars['Boolean'];
  workflowTask: FilterCheckTask;
};

export type FilterBuildCheckPassed = BuildCheckPassed & BuildCheckResult & FilterBuildCheckResult & {
  __typename?: 'FilterBuildCheckPassed';
  buildInputs: FilterBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  id: Scalars['ID'];
  passed: Scalars['Boolean'];
  supergraphSchemaHash: Scalars['SHA256'];
  workflowTask: FilterCheckTask;
};

export type FilterBuildCheckResult = {
  buildInputs: FilterBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  id: Scalars['ID'];
  passed: Scalars['Boolean'];
  workflowTask: FilterCheckTask;
};

/** Inputs provided to the build for a contract variant, which filters types and fields from a source variant's schema. */
export type FilterBuildInput = {
  __typename?: 'FilterBuildInput';
  /** Schema filtering rules for the build, such as tags to include or exclude from the source variant schema. */
  filterConfig: FilterConfig;
  /** The source variant schema document's SHA256 hash, represented as a hexadecimal string. */
  schemaHash: Scalars['String'];
};

export type FilterBuildInputs = {
  __typename?: 'FilterBuildInputs';
  /**
   * The build pipeline track used for filtering. Note this is taken from upstream check workflow
   * or launch.
   */
  buildPipelineTrack: BuildPipelineTrack;
  /** The exclude filters used for filtering. */
  exclude: Array<Scalars['String']>;
  /**
   * Whether to hide unreachable objects, interfaces, unions, inputs, enums and scalars from
   * the resulting contract schema.
   */
  hideUnreachableTypes: Scalars['Boolean'];
  /** The include filters used for filtering. */
  include: Array<Scalars['String']>;
  /** The SHA-256 of the supergraph schema document used for filtering. */
  supergraphSchemaHash: Scalars['SHA256'];
};

export type FilterCheckAsyncInput = {
  config: HistoricQueryParametersInput;
  filterChanges: FilterCheckFilterChanges;
  gitContext: GitContextInput;
};

export type FilterCheckFilterChanges = {
  excludeAdditions?: InputMaybe<Array<Scalars['String']>>;
  excludeRemovals?: InputMaybe<Array<Scalars['String']>>;
  hideUnreachableTypesChange?: InputMaybe<Scalars['Boolean']>;
  includeAdditions?: InputMaybe<Array<Scalars['String']>>;
  includeRemovals?: InputMaybe<Array<Scalars['String']>>;
};

export type FilterCheckTask = BuildCheckTask & CheckWorkflowTask & {
  __typename?: 'FilterCheckTask';
  /** The result of the filter build check. This will be null when the task is initializing or running. */
  buildResult?: Maybe<FilterBuildCheckResult>;
  completedAt?: Maybe<Scalars['Timestamp']>;
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  proposedBuildInputChanges: ProposedFilterBuildInputChanges;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']>;
  workflow: CheckWorkflow;
};

/** The filter configuration used to build a contract schema. The configuration consists of lists of tags for schema elements to include or exclude in the resulting schema. */
export type FilterConfig = {
  __typename?: 'FilterConfig';
  /** Tags of schema elements to exclude from the contract schema. */
  exclude: Array<Scalars['String']>;
  /** Whether to hide unreachable objects, interfaces, unions, inputs, enums and scalars from the resulting contract schema. */
  hideUnreachableTypes: Scalars['Boolean'];
  /** Tags of schema elements to include in the contract schema. */
  include: Array<Scalars['String']>;
};

export type FilterConfigInput = {
  /** A list of tags for schema elements to exclude from the resulting contract schema. */
  exclude: Array<Scalars['String']>;
  /**
   * Whether to hide unreachable objects, interfaces, unions, inputs, enums and scalars from
   * the resulting contract schema. Defaults to `false`.
   */
  hideUnreachableTypes?: Scalars['Boolean'];
  /** A list of tags for schema elements to include in the resulting contract schema. */
  include: Array<Scalars['String']>;
};

/** Represents a diff between two versions of a schema as a flat list of changes */
export type FlatDiff = {
  __typename?: 'FlatDiff';
  diff: Array<FlatDiffItem>;
  id: Scalars['ID'];
  summary: FlatDiffSummary;
};

export type FlatDiffAddArgument = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddArgument';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffAddDirective = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddDirective';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffAddDirectiveUsage = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddDirectiveUsage';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffAddEnum = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddEnum';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffAddEnumValue = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddEnumValue';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffAddField = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddField';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffAddImplementation = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddImplementation';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffAddInput = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddInput';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffAddInterface = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddInterface';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffAddObject = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddObject';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffAddScalar = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddScalar';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffAddSchemaDefinition = FlatDiffItem & {
  __typename?: 'FlatDiffAddSchemaDefinition';
  type: FlatDiffType;
};

export type FlatDiffAddSchemaDirectiveUsage = FlatDiffItem & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddSchemaDirectiveUsage';
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffAddSchemaRootOperation = FlatDiffItem & FlatDiffItemRootType & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddSchemaRootOperation';
  rootType: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffAddUnion = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddUnion';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffAddUnionMember = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddUnionMember';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffAddValidLocation = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddValidLocation';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffChangeArgumentDefault = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemNullableValue & {
  __typename?: 'FlatDiffChangeArgumentDefault';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value?: Maybe<Scalars['String']>;
};

export type FlatDiffChangeDescription = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemNullableValue & {
  __typename?: 'FlatDiffChangeDescription';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value?: Maybe<Scalars['String']>;
};

export type FlatDiffChangeDirectiveRepeatable = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffChangeDirectiveRepeatable';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['Boolean'];
};

export type FlatDiffChangeInputFieldDefault = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemNullableValue & {
  __typename?: 'FlatDiffChangeInputFieldDefault';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value?: Maybe<Scalars['String']>;
};

export type FlatDiffChangeSchemaDescription = FlatDiffItem & FlatDiffItemNullableValue & {
  __typename?: 'FlatDiffChangeSchemaDescription';
  type: FlatDiffType;
  value?: Maybe<Scalars['String']>;
};

export type FlatDiffItem = {
  type: FlatDiffType;
};

export type FlatDiffItemCoordinate = {
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffItemNullableValue = {
  type: FlatDiffType;
  value?: Maybe<Scalars['String']>;
};

export type FlatDiffItemRootType = {
  rootType: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffItemValue = {
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffRemoveArgument = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveArgument';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffRemoveDirective = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveDirective';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffRemoveDirectiveUsage = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveDirectiveUsage';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffRemoveEnum = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveEnum';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffRemoveEnumValue = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveEnumValue';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffRemoveField = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveField';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffRemoveImplementation = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveImplementation';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffRemoveInput = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveInput';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffRemoveInterface = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveInterface';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffRemoveObject = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveObject';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffRemoveScalar = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveScalar';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffRemoveSchemaDefinition = FlatDiffItem & {
  __typename?: 'FlatDiffRemoveSchemaDefinition';
  type: FlatDiffType;
};

export type FlatDiffRemoveSchemaDirectiveUsage = FlatDiffItem & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveSchemaDirectiveUsage';
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffRemoveSchemaRootOperation = FlatDiffItem & FlatDiffItemRootType & {
  __typename?: 'FlatDiffRemoveSchemaRootOperation';
  rootType: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffRemoveUnion = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveUnion';
  coordinate: Scalars['String'];
  type: FlatDiffType;
};

export type FlatDiffRemoveUnionMember = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveUnionMember';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffRemoveValidLocation = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveValidLocation';
  coordinate: Scalars['String'];
  type: FlatDiffType;
  value: Scalars['String'];
};

export type FlatDiffResult = FlatDiff | NotFoundError | SchemaValidationError;

/** Represents a summary of a diff between two versions of a schema. */
export type FlatDiffSummary = {
  __typename?: 'FlatDiffSummary';
  directive: FlatDiffTypeSummary;
  enum: FlatDiffTypeSummary;
  input: FlatDiffTypeSummary;
  interface: FlatDiffTypeSummary;
  object: FlatDiffTypeSummary;
  scalar: FlatDiffTypeSummary;
  schema: FlatDiffTypeSummary;
  union: FlatDiffTypeSummary;
};

export enum FlatDiffType {
  ADD_ARGUMENT = 'ADD_ARGUMENT',
  ADD_DIRECTIVE = 'ADD_DIRECTIVE',
  ADD_DIRECTIVE_USAGE = 'ADD_DIRECTIVE_USAGE',
  ADD_ENUM = 'ADD_ENUM',
  ADD_ENUM_VALUE = 'ADD_ENUM_VALUE',
  ADD_FIELD = 'ADD_FIELD',
  ADD_IMPLEMENTATION = 'ADD_IMPLEMENTATION',
  ADD_INPUT = 'ADD_INPUT',
  ADD_INTERFACE = 'ADD_INTERFACE',
  ADD_OBJECT = 'ADD_OBJECT',
  ADD_SCALAR = 'ADD_SCALAR',
  ADD_SCHEMA_DEFINITION = 'ADD_SCHEMA_DEFINITION',
  ADD_SCHEMA_DIRECTIVE_USAGE = 'ADD_SCHEMA_DIRECTIVE_USAGE',
  ADD_SCHEMA_ROOT_OPERATION = 'ADD_SCHEMA_ROOT_OPERATION',
  ADD_UNION = 'ADD_UNION',
  ADD_UNION_MEMBER = 'ADD_UNION_MEMBER',
  ADD_VALID_LOCATION = 'ADD_VALID_LOCATION',
  CHANGE_ARGUMENT_DEFAULT = 'CHANGE_ARGUMENT_DEFAULT',
  CHANGE_DESCRIPTION = 'CHANGE_DESCRIPTION',
  CHANGE_INPUT_FIELD_DEFAULT = 'CHANGE_INPUT_FIELD_DEFAULT',
  CHANGE_REPEATABLE = 'CHANGE_REPEATABLE',
  CHANGE_SCHEMA_DESCRIPTION = 'CHANGE_SCHEMA_DESCRIPTION',
  REMOVE_ARGUMENT = 'REMOVE_ARGUMENT',
  REMOVE_DIRECTIVE = 'REMOVE_DIRECTIVE',
  REMOVE_DIRECTIVE_USAGE = 'REMOVE_DIRECTIVE_USAGE',
  REMOVE_ENUM = 'REMOVE_ENUM',
  REMOVE_ENUM_VALUE = 'REMOVE_ENUM_VALUE',
  REMOVE_FIELD = 'REMOVE_FIELD',
  REMOVE_IMPLEMENTATION = 'REMOVE_IMPLEMENTATION',
  REMOVE_INPUT = 'REMOVE_INPUT',
  REMOVE_INTERFACE = 'REMOVE_INTERFACE',
  REMOVE_OBJECT = 'REMOVE_OBJECT',
  REMOVE_SCALAR = 'REMOVE_SCALAR',
  REMOVE_SCHEMA_DEFINITION = 'REMOVE_SCHEMA_DEFINITION',
  REMOVE_SCHEMA_DIRECTIVE_USAGE = 'REMOVE_SCHEMA_DIRECTIVE_USAGE',
  REMOVE_SCHEMA_ROOT_OPERATION = 'REMOVE_SCHEMA_ROOT_OPERATION',
  REMOVE_UNION = 'REMOVE_UNION',
  REMOVE_UNION_MEMBER = 'REMOVE_UNION_MEMBER',
  REMOVE_VALID_LOCATION = 'REMOVE_VALID_LOCATION'
}

export type FlatDiffTypeSummary = {
  __typename?: 'FlatDiffTypeSummary';
  add: Scalars['Int'];
  change: Scalars['Int'];
  remove: Scalars['Int'];
  typeCount: Scalars['Int'];
};

/** Error connecting to Fly */
export type FlyClientError = {
  __typename?: 'FlyClientError';
  /** Error message */
  message: Scalars['String'];
};

/** Error triggering a rolling update */
export type FlyForceRollingUpdateError = {
  __typename?: 'FlyForceRollingUpdateError';
  /** Concrete error for the flyForceRollingUpdate mutation */
  error: FlyForceRollingUpdateErrorValue;
};

/** Concrete error for the flyForceRollingUpdate mutation */
export type FlyForceRollingUpdateErrorValue = FlyClientError | InvalidRequest;

/** Result of a flyForceRollingUpdate mutation */
export type FlyForceRollingUpdateResult = FlyForceRollingUpdateError | FlyForceRollingUpdateSuccess;

/** Success triggering a rolling update */
export type FlyForceRollingUpdateSuccess = {
  __typename?: 'FlyForceRollingUpdateSuccess';
  /** Whether the app was updated */
  updated: Scalars['Boolean'];
};

export type FlyRouterMutation = {
  __typename?: 'FlyRouterMutation';
  /** Force a rolling update */
  forceRollingUpdate: FlyForceRollingUpdateResult;
};

/** Fly-specific information for a Shard */
export type FlyShard = {
  __typename?: 'FlyShard';
  /** DNS endpoint for the orchestrator */
  endpoint: Scalars['String'];
  /** Endpoints of the Etcd cluster */
  etcdEndpoints: Array<Scalars['String']>;
  /** Fly organization ID */
  organizationId: Scalars['String'];
};

export type GQLBillingPlanFromGrpc = {
  __typename?: 'GQLBillingPlanFromGrpc';
  dbPlan?: Maybe<BillingPlan>;
  matchesDbPlan?: Maybe<Scalars['Boolean']>;
  rawProtoJson?: Maybe<Scalars['String']>;
};

export type GeneralProposalComment = {
  createdAt: Scalars['Timestamp'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID'];
  message: Scalars['String'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

export type GitContext = {
  __typename?: 'GitContext';
  branch?: Maybe<Scalars['String']>;
  commit?: Maybe<Scalars['ID']>;
  commitUrl?: Maybe<Scalars['String']>;
  committer?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
  remoteHost?: Maybe<GitRemoteHost>;
  remoteUrl?: Maybe<Scalars['String']>;
};

/** This is stored with a schema when it is uploaded */
export type GitContextInput = {
  /** The Git repository branch used in the check. */
  branch?: InputMaybe<Scalars['String']>;
  /** The ID of the Git commit used in the check. */
  commit?: InputMaybe<Scalars['ID']>;
  /** The username of the user who created the Git commit used in the check. */
  committer?: InputMaybe<Scalars['String']>;
  /** The commit message of the Git commit used in the check. */
  message?: InputMaybe<Scalars['String']>;
  /** The Git repository's remote URL. */
  remoteUrl?: InputMaybe<Scalars['String']>;
};

export enum GitRemoteHost {
  BITBUCKET = 'BITBUCKET',
  GITHUB = 'GITHUB',
  GITLAB = 'GITLAB'
}

/**
 * Represents a graph API key, which has permissions scoped to a
 * user role for a single Apollo graph.
 */
export type GraphApiKey = ApiKey & {
  __typename?: 'GraphApiKey';
  /** The timestamp when the API key was created. */
  createdAt: Scalars['Timestamp'];
  /** Details of the user or graph that created the API key. */
  createdBy?: Maybe<Identity>;
  /** The API key's ID. */
  id: Scalars['ID'];
  /** The API key's name, for distinguishing it from other keys. */
  keyName?: Maybe<Scalars['String']>;
  /** The permission level assigned to the API key upon creation. */
  role: UserPermission;
  /** The value of the API key. **This is a secret credential!** */
  token: Scalars['String'];
};

export type GraphCapabilities = {
  __typename?: 'GraphCapabilities';
  /**  False if this graph is a cloud supergraph. */
  canPublishMonograph: Scalars['Boolean'];
  /**  Currently, graph URL is not updatable for cloud supergraphs. */
  canUpdateURL: Scalars['Boolean'];
  /**  Minimum Federation Version track required for all variants of this graph. */
  minimumBuildPipelineTrack: BuildPipelineTrack;
};

/** The timing details for the build step of a launch. */
export type GraphCreationError = {
  __typename?: 'GraphCreationError';
  message: Scalars['String'];
};

export type GraphCreationResult = GraphCreationError | Service;

/** Filtering options for graph connections. */
export type GraphFilter = {
  /** Only include graphs in a certain state. */
  state?: InputMaybe<GraphState>;
  /** Only include graphs of certain types. */
  type?: InputMaybe<Array<GraphType>>;
};

/** A union of all containers that can comprise the components of a Studio graph */
export type GraphImplementors = FederatedImplementingServices | NonFederatedImplementingService;

/** The linter configuration for this graph. */
export type GraphLinterConfiguration = {
  __typename?: 'GraphLinterConfiguration';
  /** The set of @tag names allowed in the schema. */
  allowedTagNames: Array<Scalars['String']>;
  /** Whether to ignore @deprecated elements from linting violations. */
  ignoreDeprecated: Scalars['Boolean'];
  /** Whether to ignore @inaccessible elements from linting violations. */
  ignoreInaccessible: Scalars['Boolean'];
  /** The set of lint rules configured for this graph. */
  rules: Array<LinterRuleLevelConfiguration>;
};

/** The changes to the linter configuration for this graph. */
export type GraphLinterConfigurationChangesInput = {
  /** A set of allowed @tag names to be added to the linting configuration for this graph or null if no changes should be made. */
  allowedTagNameAdditions?: InputMaybe<Array<Scalars['String']>>;
  /** A set of @tag names to be removed from the allowed @tag list for this graphs linting configuration or null if no changes should be made. */
  allowedTagNameRemovals?: InputMaybe<Array<Scalars['String']>>;
  /** Change whether @deprecated elements should be linted or null if no changes should be made. */
  ignoreDeprecated?: InputMaybe<Scalars['Boolean']>;
  /** Change whether @inaccessible elements should be linted or null if no changes should be made. */
  ignoreInaccessible?: InputMaybe<Scalars['Boolean']>;
  /** A set of rule changes or null if no changes should be made. */
  rules?: InputMaybe<Array<LinterRuleLevelConfigurationChangesInput>>;
};

export type GraphQLDoc = {
  __typename?: 'GraphQLDoc';
  graph: Service;
  hash: Scalars['ID'];
  source: Scalars['GraphQLDocument'];
};

/** Various states a graph can be in. */
export enum GraphState {
  /** The graph has not been configured with any variants. */
  CONFIGURED = 'CONFIGURED',
  /** The graph has not been configured with any variants. */
  NOT_CONFIGURED = 'NOT_CONFIGURED'
}

export enum GraphType {
  CLASSIC = 'CLASSIC',
  CLOUD_SUPERGRAPH = 'CLOUD_SUPERGRAPH',
  SELF_HOSTED_SUPERGRAPH = 'SELF_HOSTED_SUPERGRAPH'
}

/** A graph variant */
export type GraphVariant = {
  __typename?: 'GraphVariant';
  /** As new schema tags keep getting published, activeSchemaPublish refers to the latest. */
  activeSchemaPublish?: Maybe<SchemaTag>;
  /** The list of BuildPipelineTracks and their associated details that this variant is allowed to set in their build configuration. */
  allowedTracks: Array<BuildPipelineTrackDetails>;
  /**
   * If this variant doesn't conduct a build (monograph) then this field will be null
   * For contract variants the build config is set based on the upstream composition variant.
   */
  buildConfig?: Maybe<BuildConfig>;
  /** The time the variant's federation version and/or the supported directives was last updated */
  buildConfigUpdatedAt?: Maybe<Scalars['Timestamp']>;
  checkConfiguration: VariantCheckConfiguration;
  /** Compose and filter preview contract schema built from this source variant. */
  composeAndFilterPreview?: Maybe<ComposeAndFilterPreviewResult>;
  /** Federation version this variant uses */
  compositionVersion?: Maybe<Scalars['String']>;
  /** The filter configuration used to build a contract schema. The configuration consists of lists of tags for schema elements to include or exclude in the resulting schema. */
  contractFilterConfig?: Maybe<FilterConfig>;
  /**
   * A human-readable description of the filter configuration of this contract variant, or null if this isn't a contract
   * variant.
   */
  contractFilterConfigDescription?: Maybe<Scalars['String']>;
  /** Preview a Contract schema built from this source variant. */
  contractPreview: ContractPreview;
  /** Time the variant was created */
  createdAt: Scalars['Timestamp'];
  derivedVariantCount: Scalars['Int'];
  /** Returns the list of variants derived from this variant. This currently includes contracts only. */
  derivedVariants?: Maybe<Array<GraphVariant>>;
  /** A list of the entities across all subgraphs, exposed to consumers & up. This value is null for non-federated variants. */
  entities?: Maybe<EntitiesResponseOrError>;
  /** The last instant that field execution information (resolver execution via field-level instrumentation) was reported for this variant */
  fieldExecutionsLastReportedAt?: Maybe<Scalars['Timestamp']>;
  /**
   * Returns details about a field in the schema. Unless an error occurs, we will currently always return a non-null
   * response here, with the timestamps set to null if there is no usage of the field or if field doesn't exist in the
   * schema. However we are keeping the return type as nullable in case we want to update this later in a
   * backwards-compatible way to make null mean that the field doesn't exist in the schema at all.
   */
  fieldInsights?: Maybe<FieldInsights>;
  /** Returns a paginated list of field insights list items, including all fields from the active schema for this variant. */
  fieldInsightsList: GraphVariantFieldInsightsListItemConnection;
  /** The last instant that field usage information (usage of fields via referencing operations) was reported for this variant */
  fieldUsageLastReportedAt?: Maybe<Scalars['Timestamp']>;
  /** The graph that this variant belongs to. */
  graph: Service;
  /** Graph ID of the variant. Prefer using graph { id } when feasible. */
  graphId: Scalars['String'];
  /** If the variant has managed subgraphs. */
  hasManagedSubgraphs?: Maybe<Scalars['Boolean']>;
  /**
   * Represents whether this variant has a supergraph schema. Note that this can only be true for variants with build steps
   * (running e.g. federation composition or contracts filtering). This will be false for a variant with a build step if it
   * has never successfully published.
   */
  hasSupergraphSchema: Scalars['Boolean'];
  /** The variant's global identifier in the form `graphID@variant`. */
  id: Scalars['ID'];
  internalVariantUUID: Scalars['String'];
  /** Represents whether this variant is a Contract. */
  isContract?: Maybe<Scalars['Boolean']>;
  /** Is this variant one of the current user's favorite variants? */
  isFavoriteOfCurrentUser: Scalars['Boolean'];
  /**
   * If the variant has managed subgraphs.
   * @deprecated Replaced by hasManagedSubgraphs
   */
  isFederated?: Maybe<Scalars['Boolean']>;
  /** Represents whether this variant is a Proposal. */
  isProposal?: Maybe<Scalars['Boolean']>;
  /** If the variant is protected */
  isProtected: Scalars['Boolean'];
  isPublic: Scalars['Boolean'];
  /** Represents whether this variant should be listed in the public variants directory. This can only be true if the variant is also public. */
  isPubliclyListed: Scalars['Boolean'];
  /** Represents whether Apollo has verified the authenticity of this public variant. This can only be true if the variant is also public. */
  isVerified: Scalars['Boolean'];
  /** Latest approved launch for the variant, and what is served through Uplink. */
  latestApprovedLaunch?: Maybe<Launch>;
  /** Latest launch for the variant, whether successful or not. */
  latestLaunch?: Maybe<Launch>;
  /** The details of the variant's most recent publication. */
  latestPublication?: Maybe<SchemaTag>;
  /** Retrieve a launch for this variant by ID. */
  launch?: Maybe<Launch>;
  /** A list of launches ordered by date, asc or desc depending on orderBy. The maximum limit is 100. */
  launchHistory?: Maybe<Array<Launch>>;
  /** Count of total launch history */
  launchHistoryLength?: Maybe<Scalars['Long']>;
  links?: Maybe<Array<LinkInfo>>;
  /** The variant's name (e.g., `staging`). */
  name: Scalars['String'];
  /** A list of the saved [operation collections](https://www.apollographql.com/docs/studio/explorer/operation-collections/) associated with this variant. */
  operationCollections: Array<OperationCollection>;
  /** A list of the saved [operation collections](https://www.apollographql.com/docs/studio/explorer/operation-collections/) associated with this variant, paged. */
  operationCollectionsConnection?: Maybe<GraphVariantOperationCollectionConnection>;
  /** Returns a paginated list of operation insights list items. */
  operationInsightsList: GraphVariantOperationInsightsListItemConnection;
  /** The merged/computed/effective check configuration for the operations check task. */
  operationsCheckConfiguration?: Maybe<OperationsCheckConfiguration>;
  /** Which permissions the current user has for interacting with this variant */
  permissions: GraphVariantPermissions;
  /** The Persisted Query List linked to this variant, if any. */
  persistedQueryList?: Maybe<PersistedQueryList>;
  /** Generate a federated operation plan for a given operation */
  plan?: Maybe<QueryPlan>;
  /** Explorer setting for postflight script to run before the actual GraphQL operations is run. */
  postflightScript?: Maybe<Scalars['String']>;
  /** Explorer setting for preflight script to run before the actual GraphQL operations is run. */
  preflightScript?: Maybe<Scalars['String']>;
  proposal?: Maybe<Proposal>;
  readme: Readme;
  /** Registry stats for this particular graph variant */
  registryStatsWindow?: Maybe<RegistryStatsWindow>;
  /** The total number of requests for this variant in the last 24 hours */
  requestsInLastDay?: Maybe<Scalars['Long']>;
  /** Router associated with this graph variant */
  router?: Maybe<Router>;
  routerConfig?: Maybe<Scalars['String']>;
  /** If the graphql endpoint is set up to accept cookies. */
  sendCookies?: Maybe<Scalars['Boolean']>;
  /** Explorer setting for shared headers for a graph */
  sharedHeaders?: Maybe<Scalars['String']>;
  /** The variant this variant is derived from. This property currently only exists on contract variants. */
  sourceVariant?: Maybe<GraphVariant>;
  /** Returns the details of the subgraph with the provided `name`, or null if this variant doesn't include a subgraph with that name. */
  subgraph?: Maybe<FederatedImplementingService>;
  /** A list of the subgraphs included in this variant. This value is null for non-federated variants. Set `includeDeleted` to `true` to include deleted subgraphs. */
  subgraphs?: Maybe<Array<FederatedImplementingService>>;
  /** The URL of the variant's GraphQL endpoint for subscription operations. */
  subscriptionUrl?: Maybe<Scalars['String']>;
  /** A list of supported directives */
  supportedDirectives?: Maybe<Array<DirectiveSupportStatus>>;
  /**
   * A list of the subgraphs that have been published to since the variant was created.
   * Does not include subgraphs that were created & deleted since the variant was created.
   */
  updatedSubgraphs?: Maybe<Array<FederatedImplementingService>>;
  /** The URL of the variant's GraphQL endpoint for query and mutation operations. For subscription operations, use `subscriptionUrl`. */
  url?: Maybe<Scalars['String']>;
  /** The last instant that usage information (e.g. operation stat, client stats) was reported for this variant */
  usageLastReportedAt?: Maybe<Scalars['Timestamp']>;
  /** Validate router configuration for this graph variant */
  validateRouter: CloudValidationResult;
};


/** A graph variant */
export type GraphVariantcomposeAndFilterPreviewArgs = {
  filterConfig?: InputMaybe<FilterConfigInput>;
  subgraphChanges?: InputMaybe<Array<ComposeAndFilterPreviewSubgraphChange>>;
};


/** A graph variant */
export type GraphVariantcontractPreviewArgs = {
  filters: FilterConfigInput;
};


/** A graph variant */
export type GraphVariantfieldInsightsArgs = {
  fieldName: Scalars['String'];
  parentType: Scalars['String'];
};


/** A graph variant */
export type GraphVariantfieldInsightsListArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FieldInsightsListFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  from: Scalars['Timestamp'];
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<FieldInsightsListOrderByInput>;
  to: Scalars['Timestamp'];
};


/** A graph variant */
export type GraphVariantlaunchArgs = {
  id: Scalars['ID'];
};


/** A graph variant */
export type GraphVariantlaunchHistoryArgs = {
  limit?: Scalars['Int'];
  offset?: Scalars['Int'];
  orderBy?: LaunchHistoryOrder;
};


/** A graph variant */
export type GraphVariantoperationCollectionsConnectionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A graph variant */
export type GraphVariantoperationInsightsListArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<OperationInsightsListFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  from: Scalars['Timestamp'];
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OperationInsightsListOrderByInput>;
  to: Scalars['Timestamp'];
};


/** A graph variant */
export type GraphVariantoperationsCheckConfigurationArgs = {
  overrides?: InputMaybe<OperationsCheckConfigurationOverridesInput>;
};


/** A graph variant */
export type GraphVariantplanArgs = {
  document: Scalars['GraphQLDocument'];
  operationName?: InputMaybe<Scalars['String']>;
};


/** A graph variant */
export type GraphVariantregistryStatsWindowArgs = {
  from: Scalars['Timestamp'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']>;
};


/** A graph variant */
export type GraphVariantsubgraphArgs = {
  name: Scalars['ID'];
};


/** A graph variant */
export type GraphVariantsubgraphsArgs = {
  includeDeleted?: Scalars['Boolean'];
};


/** A graph variant */
export type GraphVariantvalidateRouterArgs = {
  config: RouterConfigInput;
};

export type GraphVariantFieldInsightsListItemConnection = {
  __typename?: 'GraphVariantFieldInsightsListItemConnection';
  /** A list of edges from the graph variant to its field insights list items. */
  edges?: Maybe<Array<GraphVariantFieldInsightsListItemEdge>>;
  /** A list of field insights list items that belong to a graph variant. */
  nodes?: Maybe<Array<FieldInsightsListItem>>;
  /** Information to aid in pagination. */
  pageInfo: FieldInsightsListPageInfo;
  /** The total number of field insights list items connected to the graph variant */
  totalCount: Scalars['Int'];
};

/** An edge between a graph variant and a field insights list item. */
export type GraphVariantFieldInsightsListItemEdge = {
  __typename?: 'GraphVariantFieldInsightsListItemEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** A field insights list item attached to the graph variant. */
  node?: Maybe<FieldInsightsListItem>;
};

/** Ways to filter graph variants. */
export enum GraphVariantFilter {
  /** All Variants */
  ALL = 'ALL',
  /** Variants favorited by the current user */
  FAVORITES = 'FAVORITES'
}

/** Result of looking up a variant by ref */
export type GraphVariantLookup = GraphVariant | InvalidRefFormat;

/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutation = {
  __typename?: 'GraphVariantMutation';
  addLinkToVariant: GraphVariant;
  buildConfig?: Maybe<GraphVariant>;
  createRouter: CreateRouterResult;
  /** Delete the variant. */
  delete: DeleteSchemaTagResult;
  destroyRouter: DestroyRouterResult;
  /** Graph ID of the variant */
  graphId: Scalars['String'];
  /** Global identifier for the graph variant, in the form `graph@variant`. */
  id: Scalars['ID'];
  internalVariantUUID: Scalars['String'];
  linkPersistedQueryList: LinkPersistedQueryListResultOrError;
  /** Name of the variant, like `variant`. */
  name: Scalars['String'];
  relaunch: RelaunchResult;
  removeLinkFromVariant: GraphVariant;
  /** Gets the router attached to a graph variant */
  router?: Maybe<RouterMutation>;
  runLintCheck: CheckStepResult;
  /** Mutation called by CheckCoordinator to find associated proposals to the schema diffs in a check workflow */
  runProposalsCheck: CheckStepResult;
  service: Service;
  setIsFavoriteOfCurrentUser: GraphVariant;
  /**
   * _Asynchronously_ kicks off operation checks for a proposed non-federated
   * schema change against its associated graph.
   *
   * Returns a `CheckRequestSuccess` object with a workflow ID that you can use
   * to check status, or an error object if the checks workflow failed to start.
   */
  submitCheckSchemaAsync: CheckRequestResult;
  /** Submit a request for a Filter Schema Check and receive a result with a workflow ID that can be used to check status, or an error message that explains what went wrong. */
  submitFilterCheckAsync: CheckRequestResult;
  /**
   *  _Asynchronously_ kicks off composition and operation checks for all proposed subgraphs schema changes against its associated supergraph.
   *
   *  Returns a `CheckRequestSuccess` object with a workflow ID that you can use
   *  to check status, or an error object if the checks workflow failed to start.
   *
   * Rate limited to 5k per min.
   */
  submitMultiSubgraphCheckAsync: CheckRequestResult;
  /**
   * _Asynchronously_ kicks off composition and operation checks for a proposed subgraph schema change against its associated supergraph.
   *
   * Returns a `CheckRequestSuccess` object with a workflow ID that you can use
   * to check status, or an error object if the checks workflow failed to start.
   *
   * Rate limited to 5k per min.
   */
  submitSubgraphCheckAsync: CheckRequestResult;
  unlinkPersistedQueryList: UnlinkPersistedQueryListResultOrError;
  updateCheckConfigurationDownstreamVariants: VariantCheckConfiguration;
  updateCheckConfigurationEnableOperationsCheck?: Maybe<VariantCheckConfiguration>;
  updateCheckConfigurationExcludedClients: VariantCheckConfiguration;
  updateCheckConfigurationExcludedOperations: VariantCheckConfiguration;
  updateCheckConfigurationIncludedVariants: VariantCheckConfiguration;
  updateCheckConfigurationTimeRange: VariantCheckConfiguration;
  updateIsProtected?: Maybe<GraphVariant>;
  updatePostflightScript?: Maybe<GraphVariant>;
  updatePreflightScript?: Maybe<GraphVariant>;
  updateRouter: UpdateRouterResult;
  updateSendCookies?: Maybe<GraphVariant>;
  updateSharedHeaders?: Maybe<GraphVariant>;
  updateSubscriptionURL?: Maybe<GraphVariant>;
  updateURL?: Maybe<GraphVariant>;
  updateVariantIsPublic?: Maybe<GraphVariant>;
  updateVariantIsPubliclyListed?: Maybe<GraphVariant>;
  updateVariantIsVerified?: Maybe<GraphVariant>;
  /** Updates the [README](https://www.apollographql.com/docs/studio/org/graphs/#the-readme-page) of this variant. */
  updateVariantReadme?: Maybe<GraphVariant>;
  upsertRouterConfig?: Maybe<UpsertRouterResult>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationaddLinkToVariantArgs = {
  title?: InputMaybe<Scalars['String']>;
  type: LinkInfoType;
  url: Scalars['String'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationbuildConfigArgs = {
  tagInApiSchema?: Scalars['Boolean'];
  version: BuildPipelineTrack;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationcreateRouterArgs = {
  input: CreateRouterInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationlinkPersistedQueryListArgs = {
  persistedQueryListId: Scalars['ID'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationremoveLinkFromVariantArgs = {
  linkInfoId: Scalars['ID'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationrunLintCheckArgs = {
  input: RunLintCheckInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationrunProposalsCheckArgs = {
  input: RunProposalsCheckInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationsetIsFavoriteOfCurrentUserArgs = {
  favorite: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationsubmitCheckSchemaAsyncArgs = {
  input: CheckSchemaAsyncInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationsubmitFilterCheckAsyncArgs = {
  input: FilterCheckAsyncInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationsubmitMultiSubgraphCheckAsyncArgs = {
  input: MultiSubgraphCheckAsyncInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationsubmitSubgraphCheckAsyncArgs = {
  input: SubgraphCheckAsyncInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateCheckConfigurationDownstreamVariantsArgs = {
  blockingDownstreamVariants?: InputMaybe<Array<Scalars['String']>>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateCheckConfigurationEnableOperationsCheckArgs = {
  enabled: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateCheckConfigurationExcludedClientsArgs = {
  appendGraphSettings: Scalars['Boolean'];
  excludedClients?: InputMaybe<Array<ClientFilterInput>>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateCheckConfigurationExcludedOperationsArgs = {
  appendGraphSettings: Scalars['Boolean'];
  excludedOperationNames?: InputMaybe<Array<OperationNameFilterInput>>;
  excludedOperations?: InputMaybe<Array<OperationInfoFilterInput>>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateCheckConfigurationIncludedVariantsArgs = {
  includedVariants?: InputMaybe<Array<Scalars['String']>>;
  useGraphSettings: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateCheckConfigurationTimeRangeArgs = {
  operationCountThreshold?: InputMaybe<Scalars['Int']>;
  operationCountThresholdPercentage?: InputMaybe<Scalars['Float']>;
  timeRangeSeconds?: InputMaybe<Scalars['Long']>;
  useGraphSettings: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateIsProtectedArgs = {
  isProtected: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdatePostflightScriptArgs = {
  postflightScript?: InputMaybe<Scalars['String']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdatePreflightScriptArgs = {
  preflightScript?: InputMaybe<Scalars['String']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateRouterArgs = {
  input: UpdateRouterInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateSendCookiesArgs = {
  sendCookies: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateSharedHeadersArgs = {
  sharedHeaders?: InputMaybe<Scalars['String']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateSubscriptionURLArgs = {
  subscriptionUrl?: InputMaybe<Scalars['String']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateURLArgs = {
  url?: InputMaybe<Scalars['String']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateVariantIsPublicArgs = {
  isPublic: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateVariantIsPubliclyListedArgs = {
  isPubliclyListed: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateVariantIsVerifiedArgs = {
  isVerified: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupdateVariantReadmeArgs = {
  readme: Scalars['String'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationupsertRouterConfigArgs = {
  configuration: Scalars['String'];
};

export type GraphVariantOperationCollectionConnection = {
  __typename?: 'GraphVariantOperationCollectionConnection';
  /** A list of edges from the graph variant to its operation collections. */
  edges?: Maybe<Array<GraphVariantOperationCollectionEdge>>;
  /** A list of operation collections attached to a graph variant. */
  nodes?: Maybe<Array<OperationCollection>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

/** An edge between a graph variant and an operation collection. */
export type GraphVariantOperationCollectionEdge = {
  __typename?: 'GraphVariantOperationCollectionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** An operation collection attached to a graph variant. */
  node?: Maybe<OperationCollection>;
};

export type GraphVariantOperationInsightsListItemConnection = {
  __typename?: 'GraphVariantOperationInsightsListItemConnection';
  /** A list of edges from the graph variant to its operation insights list items. */
  edges?: Maybe<Array<GraphVariantOperationInsightsListItemEdge>>;
  /** A list of operation insights list items that belong to a graph variant. */
  nodes?: Maybe<Array<OperationInsightsListItem>>;
  /** Information to aid in pagination. */
  pageInfo: OperationInsightsListPageInfo;
  /** The total number of operation insights list items connected to the graph variant. */
  totalCount: Scalars['Int'];
};

export type GraphVariantOperationInsightsListItemEdge = {
  __typename?: 'GraphVariantOperationInsightsListItemEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** A operation insights list items attached to the graph variant. */
  node?: Maybe<OperationInsightsListItem>;
};

/** Individual permissions for the current user when interacting with a particular Studio graph variant. */
export type GraphVariantPermissions = {
  __typename?: 'GraphVariantPermissions';
  canCreateCollectionInVariant: Scalars['Boolean'];
  /** If this variant is a Proposal, will match the Proposal.canEditProposal field (can the current user can edit this Proposal either by authorship or role level). False if this GraphVariant is not a Proposal. */
  canEditProposal: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to manage/update this variant's build configuration (e.g., build pipeline version). */
  canManageBuildConfig: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to manage/update cloud routers */
  canManageCloudRouter: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to update variant-level settings for the Apollo Studio Explorer. */
  canManageExplorerSettings: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to publish schemas to this variant. */
  canPushSchemas: Scalars['Boolean'];
  /** Whether the currently authenticated user can read any information about this variant. */
  canQuery: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to view this variant's build configuration details (e.g., build pipeline version). */
  canQueryBuildConfig: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to view details regarding cloud routers */
  canQueryCloudRouter: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to view cloud router logs */
  canQueryCloudRouterLogs: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to view launch history */
  canQueryLaunches: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to download schemas associated to this variant. */
  canQuerySchemas: Scalars['Boolean'];
  canShareCollectionInVariant: Scalars['Boolean'];
  canUpdateVariantLinkInfo: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to update the README for this variant. */
  canUpdateVariantReadme: Scalars['Boolean'];
  variantId: Scalars['ID'];
};

/** Columns of GraphosCloudMetrics. */
export enum GraphosCloudMetricsColumn {
  ACCOUNT_ID = 'ACCOUNT_ID',
  AGENT_VERSION = 'AGENT_VERSION',
  CLOUD_PROVIDER = 'CLOUD_PROVIDER',
  RESPONSE_SIZE = 'RESPONSE_SIZE',
  RESPONSE_SIZE_THROTTLED = 'RESPONSE_SIZE_THROTTLED',
  ROUTER_ID = 'ROUTER_ID',
  ROUTER_OPERATIONS = 'ROUTER_OPERATIONS',
  ROUTER_OPERATIONS_THROTTLED = 'ROUTER_OPERATIONS_THROTTLED',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  SUBGRAPH_FETCHES = 'SUBGRAPH_FETCHES',
  SUBGRAPH_FETCHES_THROTTLED = 'SUBGRAPH_FETCHES_THROTTLED',
  TIER = 'TIER',
  TIMESTAMP = 'TIMESTAMP'
}

export type GraphosCloudMetricsDimensions = {
  __typename?: 'GraphosCloudMetricsDimensions';
  accountId?: Maybe<Scalars['ID']>;
  agentVersion?: Maybe<Scalars['String']>;
  cloudProvider?: Maybe<Scalars['String']>;
  routerId?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  tier?: Maybe<Scalars['String']>;
};

/** Filter for data in GraphosCloudMetrics. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type GraphosCloudMetricsFilter = {
  /** Selects rows whose accountId dimension equals the given value if not null. To query for the null value, use {in: {accountId: [null]}} instead. */
  accountId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']>;
  and?: InputMaybe<Array<GraphosCloudMetricsFilter>>;
  /** Selects rows whose cloudProvider dimension equals the given value if not null. To query for the null value, use {in: {cloudProvider: [null]}} instead. */
  cloudProvider?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<GraphosCloudMetricsFilterIn>;
  not?: InputMaybe<GraphosCloudMetricsFilter>;
  or?: InputMaybe<Array<GraphosCloudMetricsFilter>>;
  /** Selects rows whose routerId dimension equals the given value if not null. To query for the null value, use {in: {routerId: [null]}} instead. */
  routerId?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose tier dimension equals the given value if not null. To query for the null value, use {in: {tier: [null]}} instead. */
  tier?: InputMaybe<Scalars['String']>;
};

/** Filter for data in GraphosCloudMetrics. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type GraphosCloudMetricsFilterIn = {
  /** Selects rows whose accountId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  accountId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose cloudProvider dimension is in the given list. A null value in the list means a row with null for that dimension. */
  cloudProvider?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose routerId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  routerId?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose tier dimension is in the given list. A null value in the list means a row with null for that dimension. */
  tier?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphosCloudMetricsMetrics = {
  __typename?: 'GraphosCloudMetricsMetrics';
  responseSize: Scalars['Long'];
  responseSizeThrottled: Scalars['Long'];
  routerOperations: Scalars['Long'];
  routerOperationsThrottled: Scalars['Long'];
  subgraphFetches: Scalars['Long'];
  subgraphFetchesThrottled: Scalars['Long'];
};

export type GraphosCloudMetricsOrderBySpec = {
  column: GraphosCloudMetricsColumn;
  direction: Ordering;
};

export type GraphosCloudMetricsRecord = {
  __typename?: 'GraphosCloudMetricsRecord';
  /** Dimensions of GraphosCloudMetrics that can be grouped by. */
  groupBy: GraphosCloudMetricsDimensions;
  /** Metrics of GraphosCloudMetrics that can be aggregated over. */
  metrics: GraphosCloudMetricsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export enum HTTPMethod {
  CONNECT = 'CONNECT',
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
  TRACE = 'TRACE',
  UNKNOWN = 'UNKNOWN',
  UNRECOGNIZED = 'UNRECOGNIZED'
}

export type HistoricQueryParameters = {
  /** A list of clients to filter out during validation. */
  excludedClients?: InputMaybe<Array<ClientInfoFilter>>;
  /** A list of operation names to filter out during validation. */
  excludedOperationNames?: InputMaybe<Array<OperationNameFilterInput>>;
  from?: InputMaybe<Scalars['String']>;
  /** A list of operation IDs to filter out during validation. */
  ignoredOperations?: InputMaybe<Array<Scalars['ID']>>;
  /**
   * A list of variants to include in the validation. If no variants are provided
   * then this defaults to the "current" variant along with the base variant. The
   * base variant indicates the schema that generates diff and marks the metrics that
   * are checked for broken queries. We union this base variant with the untagged values('',
   * same as null inside of `in`, and 'current') in this metrics fetch. This strategy
   * supports users who have not tagged their metrics or schema.
   */
  includedVariants?: InputMaybe<Array<Scalars['String']>>;
  /** Minimum number of requests within the window for a query to be considered. */
  queryCountThreshold?: InputMaybe<Scalars['Int']>;
  /**
   * Number of requests within the window for a query to be considered, relative to
   * total request count. Expected values are between 0 and 0.05 (minimum 5% of total
   * request volume)
   */
  queryCountThresholdPercentage?: InputMaybe<Scalars['Float']>;
  to?: InputMaybe<Scalars['String']>;
};

/** Input type to provide when specifying configuration details for schema checks. */
export type HistoricQueryParametersInput = {
  /** Clients to be excluded from check. */
  excludedClients?: InputMaybe<Array<ClientInfoFilter>>;
  /** Operations to be ignored in this schema check, specified by operation name. */
  excludedOperationNames?: InputMaybe<Array<OperationNameFilterInput>>;
  /** Start time for operations to be checked against. Specified as either a) an ISO formatted date/time string or b) a negative number of seconds relative to the time the check request was submitted. */
  from?: InputMaybe<Scalars['String']>;
  /** Operations to be ignored in this schema check, specified by ID. */
  ignoredOperations?: InputMaybe<Array<Scalars['ID']>>;
  /** Graph variants to be included in check. */
  includedVariants?: InputMaybe<Array<Scalars['String']>>;
  /** Maximum number of queries to be checked against the change. */
  queryCountThreshold?: InputMaybe<Scalars['Int']>;
  /** Only fail check if this percentage of operations would be negatively impacted. */
  queryCountThresholdPercentage?: InputMaybe<Scalars['Float']>;
  /** End time for operations to be checked against. Specified as either a) an ISO formatted date/time string or b) a negative number of seconds relative to the time the check request was submitted. */
  to?: InputMaybe<Scalars['String']>;
};

/** An identity (such as a `User` or `Graph`) in Apollo Studio. See implementing types for details. */
export type Identity = {
  /** Returns a representation of the identity as an `Actor` type. */
  asActor: Actor;
  /** The identity's identifier, which is unique among objects of its type. */
  id: Scalars['ID'];
  /** The identity's human-readable name. */
  name: Scalars['String'];
};

/** An actor's identity and info about the client they used to perform the action */
export type IdentityAndClientInfo = {
  __typename?: 'IdentityAndClientInfo';
  /** Client name provided when the actor performed the action */
  clientName?: Maybe<Scalars['String']>;
  /** Client version provided when the actor performed the action */
  clientVersion?: Maybe<Scalars['String']>;
  /** Identity info about the actor */
  identity?: Maybe<Identity>;
};

export type IdentityMutation = ServiceMutation | UserMutation;

export type IgnoreOperationsInChecksResult = {
  __typename?: 'IgnoreOperationsInChecksResult';
  graph: Service;
};

export type IgnoredRule = {
  __typename?: 'IgnoredRule';
  ignoredRule: LintRule;
  schemaCoordinate: Scalars['String'];
  subgraphName?: Maybe<Scalars['String']>;
};

export type IgnoredRuleInput = {
  ignoredRule: LintRule;
  schemaCoordinate: Scalars['String'];
  subgraphName?: InputMaybe<Scalars['String']>;
};

/** The location of the implementing service config file in storage */
export type ImplementingServiceLocation = {
  __typename?: 'ImplementingServiceLocation';
  /** The name of the implementing service */
  name: Scalars['String'];
  /** The path in storage to access the implementing service config file */
  path: Scalars['String'];
};

export type InternalAdminUser = {
  __typename?: 'InternalAdminUser';
  role: InternalMdgAdminRole;
  userID: Scalars['String'];
};

export type InternalIdentity = Identity & {
  __typename?: 'InternalIdentity';
  accounts: Array<Account>;
  asActor: Actor;
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
};

export enum InternalMdgAdminRole {
  INTERNAL_MDG_READ_ONLY = 'INTERNAL_MDG_READ_ONLY',
  INTERNAL_MDG_SALES = 'INTERNAL_MDG_SALES',
  INTERNAL_MDG_SUPER_ADMIN = 'INTERNAL_MDG_SUPER_ADMIN',
  INTERNAL_MDG_SUPPORT = 'INTERNAL_MDG_SUPPORT'
}

/** Generic server error. This should only ever return 'internal server error' as a message */
export type InternalServerError = Error & {
  __typename?: 'InternalServerError';
  /** Message related to the internal error */
  message: Scalars['String'];
};

export type IntrospectionDirective = {
  __typename?: 'IntrospectionDirective';
  args: Array<IntrospectionInputValue>;
  description?: Maybe<Scalars['String']>;
  locations: Array<IntrospectionDirectiveLocation>;
  name: Scalars['String'];
};

export type IntrospectionDirectiveInput = {
  args: Array<IntrospectionInputValueInput>;
  description?: InputMaybe<Scalars['String']>;
  isRepeatable?: InputMaybe<Scalars['Boolean']>;
  locations: Array<IntrospectionDirectiveLocation>;
  name: Scalars['String'];
};

/** __DirectiveLocation introspection type */
export enum IntrospectionDirectiveLocation {
  /** Location adjacent to an argument definition. */
  ARGUMENT_DEFINITION = 'ARGUMENT_DEFINITION',
  /** Location adjacent to an enum definition. */
  ENUM = 'ENUM',
  /** Location adjacent to an enum value definition. */
  ENUM_VALUE = 'ENUM_VALUE',
  /** Location adjacent to a field. */
  FIELD = 'FIELD',
  /** Location adjacent to a field definition. */
  FIELD_DEFINITION = 'FIELD_DEFINITION',
  /** Location adjacent to a fragment definition. */
  FRAGMENT_DEFINITION = 'FRAGMENT_DEFINITION',
  /** Location adjacent to a fragment spread. */
  FRAGMENT_SPREAD = 'FRAGMENT_SPREAD',
  /** Location adjacent to an inline fragment. */
  INLINE_FRAGMENT = 'INLINE_FRAGMENT',
  /** Location adjacent to an input object field definition. */
  INPUT_FIELD_DEFINITION = 'INPUT_FIELD_DEFINITION',
  /** Location adjacent to an input object type definition. */
  INPUT_OBJECT = 'INPUT_OBJECT',
  /** Location adjacent to an interface definition. */
  INTERFACE = 'INTERFACE',
  /** Location adjacent to a mutation operation. */
  MUTATION = 'MUTATION',
  /** Location adjacent to an object type definition. */
  OBJECT = 'OBJECT',
  /** Location adjacent to a query operation. */
  QUERY = 'QUERY',
  /** Location adjacent to a scalar definition. */
  SCALAR = 'SCALAR',
  /** Location adjacent to a schema definition. */
  SCHEMA = 'SCHEMA',
  /** Location adjacent to a subscription operation. */
  SUBSCRIPTION = 'SUBSCRIPTION',
  /** Location adjacent to a union definition. */
  UNION = 'UNION',
  /** Location adjacent to a variable definition. */
  VARIABLE_DEFINITION = 'VARIABLE_DEFINITION'
}

/** Values associated with introspection result for an enum value */
export type IntrospectionEnumValue = {
  __typename?: 'IntrospectionEnumValue';
  /** @deprecated Use deprecationReason instead */
  depreactionReason?: Maybe<Scalars['String']>;
  deprecationReason?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  isDeprecated: Scalars['Boolean'];
  name: Scalars['String'];
};

/** __EnumValue introspection type */
export type IntrospectionEnumValueInput = {
  deprecationReason?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  isDeprecated: Scalars['Boolean'];
  name: Scalars['String'];
};

/** Values associated with introspection result for field */
export type IntrospectionField = {
  __typename?: 'IntrospectionField';
  args: Array<IntrospectionInputValue>;
  deprecationReason?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  isDeprecated: Scalars['Boolean'];
  name: Scalars['String'];
  type: IntrospectionType;
};

/** __Field introspection type */
export type IntrospectionFieldInput = {
  args: Array<IntrospectionInputValueInput>;
  deprecationReason?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  isDeprecated: Scalars['Boolean'];
  name: Scalars['String'];
  type: IntrospectionTypeInput;
};

/** Values associated with introspection result for an input field */
export type IntrospectionInputValue = {
  __typename?: 'IntrospectionInputValue';
  defaultValue?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  type: IntrospectionType;
};

/** __Value introspection type */
export type IntrospectionInputValueInput = {
  defaultValue?: InputMaybe<Scalars['String']>;
  deprecationReason?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  isDeprecated?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  type: IntrospectionTypeInput;
};

export type IntrospectionSchema = {
  __typename?: 'IntrospectionSchema';
  directives: Array<IntrospectionDirective>;
  mutationType?: Maybe<IntrospectionType>;
  queryType: IntrospectionType;
  subscriptionType?: Maybe<IntrospectionType>;
  types: Array<IntrospectionType>;
};


export type IntrospectionSchematypesArgs = {
  filter?: InputMaybe<TypeFilterConfig>;
};

/** __Schema introspection type */
export type IntrospectionSchemaInput = {
  description?: InputMaybe<Scalars['String']>;
  directives: Array<IntrospectionDirectiveInput>;
  mutationType?: InputMaybe<IntrospectionTypeRefInput>;
  queryType: IntrospectionTypeRefInput;
  subscriptionType?: InputMaybe<IntrospectionTypeRefInput>;
  types?: InputMaybe<Array<IntrospectionTypeInput>>;
};

/** Object containing all possible values for an introspectionType */
export type IntrospectionType = {
  __typename?: 'IntrospectionType';
  /** the base kind of the type this references, ignoring lists and nullability */
  baseKind?: Maybe<IntrospectionTypeKind>;
  description?: Maybe<Scalars['String']>;
  enumValues?: Maybe<Array<IntrospectionEnumValue>>;
  fields?: Maybe<Array<IntrospectionField>>;
  inputFields?: Maybe<Array<IntrospectionInputValue>>;
  interfaces?: Maybe<Array<IntrospectionType>>;
  kind?: Maybe<IntrospectionTypeKind>;
  name?: Maybe<Scalars['String']>;
  ofType?: Maybe<IntrospectionType>;
  possibleTypes?: Maybe<Array<IntrospectionType>>;
  /** printed representation of type, including nested nullability and list ofTypes */
  printed: Scalars['String'];
};


/** Object containing all possible values for an introspectionType */
export type IntrospectionTypeenumValuesArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']>;
};

/** __Type introspection type */
export type IntrospectionTypeInput = {
  description?: InputMaybe<Scalars['String']>;
  enumValues?: InputMaybe<Array<IntrospectionEnumValueInput>>;
  fields?: InputMaybe<Array<IntrospectionFieldInput>>;
  inputFields?: InputMaybe<Array<IntrospectionInputValueInput>>;
  interfaces?: InputMaybe<Array<IntrospectionTypeInput>>;
  kind: IntrospectionTypeKind;
  name?: InputMaybe<Scalars['String']>;
  ofType?: InputMaybe<IntrospectionTypeInput>;
  possibleTypes?: InputMaybe<Array<IntrospectionTypeInput>>;
  specifiedByUrl?: InputMaybe<Scalars['String']>;
};

export enum IntrospectionTypeKind {
  /** Indicates this type is an enum. 'enumValues' is a valid field. */
  ENUM = 'ENUM',
  /** Indicates this type is an input object. 'inputFields' is a valid field. */
  INPUT_OBJECT = 'INPUT_OBJECT',
  /**
   * Indicates this type is an interface. 'fields' and 'possibleTypes' are valid
   * fields
   */
  INTERFACE = 'INTERFACE',
  /** Indicates this type is a list. 'ofType' is a valid field. */
  LIST = 'LIST',
  /** Indicates this type is a non-null. 'ofType' is a valid field. */
  NON_NULL = 'NON_NULL',
  /** Indicates this type is an object. 'fields' and 'interfaces' are valid fields. */
  OBJECT = 'OBJECT',
  /** Indicates this type is a scalar. */
  SCALAR = 'SCALAR',
  /** Indicates this type is a union. 'possibleTypes' is a valid field. */
  UNION = 'UNION'
}

/** Shallow __Type introspection type */
export type IntrospectionTypeRefInput = {
  kind?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

/** An error caused by providing invalid input for a task, such as schema checks. */
export type InvalidInputError = {
  __typename?: 'InvalidInputError';
  /** The error message. */
  message: Scalars['String'];
};

/** Generic input error */
export type InvalidInputErrors = Error & {
  __typename?: 'InvalidInputErrors';
  errors: Array<CloudInvalidInputError>;
  message: Scalars['String'];
};

export type InvalidOperation = {
  __typename?: 'InvalidOperation';
  errors?: Maybe<Array<OperationValidationError>>;
  signature: Scalars['ID'];
};

/** This object is returned when a request to fetch a Studio graph variant provides an invalid graph ref. */
export type InvalidRefFormat = Error & {
  __typename?: 'InvalidRefFormat';
  message: Scalars['String'];
};

/** Invalid request */
export type InvalidRequest = {
  __typename?: 'InvalidRequest';
  /** Error message */
  message: Scalars['String'];
};

export type InvalidTarget = Error & {
  __typename?: 'InvalidTarget';
  message: Scalars['String'];
};

export type Invoice = {
  __typename?: 'Invoice';
  closedAt?: Maybe<Scalars['Timestamp']>;
  collectionMethod?: Maybe<Scalars['String']>;
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  invoiceNumber: Scalars['Int'];
  invoiceNumberV2: Scalars['String'];
  state: InvoiceState;
  totalInCents: Scalars['Int'];
  updatedAt: Scalars['Timestamp'];
  uuid: Scalars['ID'];
};

export type InvoiceLineItem = {
  __typename?: 'InvoiceLineItem';
  /** Line items may be grouped to help the customer better understand their charges */
  groupKey?: Maybe<Scalars['String']>;
  /** Line items may be grouped to help the customer better understand their charges */
  groupValue?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  /**
   * The quantity of 'things' in this line item. (e.g. number of operations, seats, etc).
   * May be null for flat charges.
   */
  quantity?: Maybe<Scalars['Int']>;
  /** The amount this line item costs. */
  totalInCents: Scalars['Int'];
};

export enum InvoiceState {
  COLLECTED = 'COLLECTED',
  FAILED = 'FAILED',
  OPEN = 'OPEN',
  PAST_DUE = 'PAST_DUE',
  UNKNOWN = 'UNKNOWN',
  VOID = 'VOID'
}

/** Represents the complete process of making a set of updates to a deployed graph variant. */
export type Launch = {
  __typename?: 'Launch';
  /** The timestamp when the launch was approved. */
  approvedAt?: Maybe<Scalars['Timestamp']>;
  /** The associated build for this launch (a build includes schema composition and contract filtering). This value is null until the build is initiated. */
  build?: Maybe<Build>;
  /** The inputs provided to this launch's associated build, including subgraph schemas and contract filters. */
  buildInput: BuildInput;
  /** The timestamp when the launch completed. This value is null until the launch completes. */
  completedAt?: Maybe<Scalars['Timestamp']>;
  /** The timestamp when the launch was initiated. */
  createdAt: Scalars['Timestamp'];
  /** Contract launches that were triggered by this launch. */
  downstreamLaunches: Array<Launch>;
  /** The ID of the launch's associated graph. */
  graphId: Scalars['String'];
  /** The name of the launch's associated variant. */
  graphVariant: Scalars['String'];
  /** The unique identifier for this launch. */
  id: Scalars['ID'];
  /** Whether the launch completed. */
  isCompleted?: Maybe<Scalars['Boolean']>;
  /** Whether the result of the launch has been published to the associated graph and variant. This is always false for a failed launch. */
  isPublished?: Maybe<Scalars['Boolean']>;
  /** The most recent launch sequence step that has started but not necessarily completed. */
  latestSequenceStep?: Maybe<LaunchSequenceStep>;
  /** Cloud Router order for this launch ID */
  order: OrderOrError;
  orders: Array<Order>;
  /** The launch right before this one. Null if this is the first on this variant. */
  previousLaunch?: Maybe<Launch>;
  proposalRevision?: Maybe<ProposalRevision>;
  /** A specific publication of a graph variant pertaining to this launch. */
  publication?: Maybe<SchemaTag>;
  /** A list of results from the completed launch. The items included in this list vary depending on whether the launch succeeded, failed, or was superseded. */
  results: Array<LaunchResult>;
  /** Cloud router configuration associated with this build event. It will be non-null for any cloud-router variant, and null for any not cloudy variant/graph. */
  routerConfig?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<SchemaTag>;
  /** A list of all serial steps in the launch sequence. This list can change as the launch progresses. For example, a `LaunchCompletedStep` is appended after a launch completes. */
  sequence: Array<LaunchSequenceStep>;
  /** A shortened version of `Launch.id` that includes only the first 8 characters. */
  shortenedID: Scalars['String'];
  /** The launch's status. If a launch is superseded, its status remains `LAUNCH_INITIATED`. To check for a superseded launch, use `supersededAt`. */
  status: LaunchStatus;
  /** A list of subgraph changes that are included in this launch. */
  subgraphChanges?: Maybe<Array<SubgraphChange>>;
  /** The timestamp when this launch was superseded by another launch. If an active launch is superseded, it terminates. */
  supersededAt?: Maybe<Scalars['Timestamp']>;
  /** The launch that superseded this launch, if any. If an active launch is superseded, it terminates. */
  supersededBy?: Maybe<Launch>;
  /** The source variant launch that caused this launch to be initiated. This value is present only for contract variant launches. Otherwise, it's null. */
  upstreamLaunch?: Maybe<Launch>;
};

export enum LaunchHistoryOrder {
  CREATED_ASC = 'CREATED_ASC',
  CREATED_DESC = 'CREATED_DESC'
}

/** Types of results that can be associated with a `Launch` */
export type LaunchResult = ChangelogLaunchResult;

/** The timing details for the build step of a launch. */
export type LaunchSequenceBuildStep = {
  __typename?: 'LaunchSequenceBuildStep';
  /** The timestamp when the step completed. */
  completedAt?: Maybe<Scalars['Timestamp']>;
  /** The timestamp when the step started. */
  startedAt?: Maybe<Scalars['Timestamp']>;
};

/** The timing details for the completion step of a launch. */
export type LaunchSequenceCompletedStep = {
  __typename?: 'LaunchSequenceCompletedStep';
  /** The timestamp when the step (and therefore the launch) completed. */
  completedAt?: Maybe<Scalars['Timestamp']>;
};

/** The timing details for the initiation step of a launch. */
export type LaunchSequenceInitiatedStep = {
  __typename?: 'LaunchSequenceInitiatedStep';
  /** The timestamp when the step (and therefore the launch) started. */
  startedAt?: Maybe<Scalars['Timestamp']>;
};

/** The timing details for the publish step of a launch. */
export type LaunchSequencePublishStep = {
  __typename?: 'LaunchSequencePublishStep';
  /** The timestamp when the step completed. */
  completedAt?: Maybe<Scalars['Timestamp']>;
  /** The timestamp when the step started. */
  startedAt?: Maybe<Scalars['Timestamp']>;
};

/** Represents the various steps that occur in sequence during a single launch. */
export type LaunchSequenceStep = LaunchSequenceBuildStep | LaunchSequenceCompletedStep | LaunchSequenceInitiatedStep | LaunchSequencePublishStep | LaunchSequenceSupersededStep;

/** The timing details for the superseded step of a launch. This step occurs only if the launch is superseded by another launch. */
export type LaunchSequenceSupersededStep = {
  __typename?: 'LaunchSequenceSupersededStep';
  /** The timestamp when the step completed, thereby ending the execution of this launch in favor of the superseding launch. */
  completedAt?: Maybe<Scalars['Timestamp']>;
};

export enum LaunchStatus {
  LAUNCH_COMPLETED = 'LAUNCH_COMPLETED',
  LAUNCH_FAILED = 'LAUNCH_FAILED',
  LAUNCH_INITIATED = 'LAUNCH_INITIATED'
}

export type LinkInfo = {
  __typename?: 'LinkInfo';
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
  type: LinkInfoType;
  url: Scalars['String'];
};

export enum LinkInfoType {
  DEVELOPER_PORTAL = 'DEVELOPER_PORTAL',
  OTHER = 'OTHER',
  REPOSITORY = 'REPOSITORY'
}

export type LinkPersistedQueryListResult = {
  __typename?: 'LinkPersistedQueryListResult';
  graphVariant: GraphVariant;
  persistedQueryList: PersistedQueryList;
};

export type LinkPersistedQueryListResultOrError = LinkPersistedQueryListResult | ListNotFoundError | PermissionError | VariantAlreadyLinkedError;

export type LintCheckTask = CheckWorkflowTask & {
  __typename?: 'LintCheckTask';
  completedAt?: Maybe<Scalars['Timestamp']>;
  createdAt: Scalars['Timestamp'];
  graphID: Scalars['ID'];
  id: Scalars['ID'];
  result?: Maybe<LintResult>;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']>;
  workflow: CheckWorkflow;
};

/** A single rule violation. */
export type LintDiagnostic = {
  __typename?: 'LintDiagnostic';
  /** The category used for grouping similar rules. */
  category: LinterRuleCategory;
  /** The schema coordinate of this diagnostic. */
  coordinate: Scalars['String'];
  /** The graph's configured level for the rule. */
  level: LintDiagnosticLevel;
  /** The message describing the rule violation. */
  message: Scalars['String'];
  /** The lint rule being violated. */
  rule: LintRule;
  /** The human readable position in the file of the rule violation. */
  sourceLocations: Array<Location>;
};

/** The severity level of an lint result. */
export enum LintDiagnosticLevel {
  ERROR = 'ERROR',
  IGNORED = 'IGNORED',
  WARNING = 'WARNING'
}

/** The result of linting a schema. */
export type LintResult = {
  __typename?: 'LintResult';
  /** The set of lint rule violations found in the schema. */
  diagnostics: Array<LintDiagnostic>;
  /** Stats generated from the resulting diagnostics. */
  stats: LintStats;
};

export enum LintRule {
  ALL_ELEMENTS_REQUIRE_DESCRIPTION = 'ALL_ELEMENTS_REQUIRE_DESCRIPTION',
  CONTACT_DIRECTIVE_MISSING = 'CONTACT_DIRECTIVE_MISSING',
  DEFINED_TYPES_ARE_UNUSED = 'DEFINED_TYPES_ARE_UNUSED',
  DEPRECATED_DIRECTIVE_MISSING_REASON = 'DEPRECATED_DIRECTIVE_MISSING_REASON',
  DIRECTIVE_COMPOSITION = 'DIRECTIVE_COMPOSITION',
  DIRECTIVE_NAMES_SHOULD_BE_CAMEL_CASE = 'DIRECTIVE_NAMES_SHOULD_BE_CAMEL_CASE',
  DOES_NOT_PARSE = 'DOES_NOT_PARSE',
  ENUM_PREFIX = 'ENUM_PREFIX',
  ENUM_SUFFIX = 'ENUM_SUFFIX',
  ENUM_USED_AS_INPUT_WITHOUT_SUFFIX = 'ENUM_USED_AS_INPUT_WITHOUT_SUFFIX',
  ENUM_USED_AS_OUTPUT_DESPITE_SUFFIX = 'ENUM_USED_AS_OUTPUT_DESPITE_SUFFIX',
  ENUM_VALUES_SHOULD_BE_SCREAMING_SNAKE_CASE = 'ENUM_VALUES_SHOULD_BE_SCREAMING_SNAKE_CASE',
  FIELD_NAMES_SHOULD_BE_CAMEL_CASE = 'FIELD_NAMES_SHOULD_BE_CAMEL_CASE',
  FROM_SUBGRAPH_DOES_NOT_EXIST = 'FROM_SUBGRAPH_DOES_NOT_EXIST',
  INCONSISTENT_ARGUMENT_PRESENCE = 'INCONSISTENT_ARGUMENT_PRESENCE',
  INCONSISTENT_BUT_COMPATIBLE_ARGUMENT_TYPE = 'INCONSISTENT_BUT_COMPATIBLE_ARGUMENT_TYPE',
  INCONSISTENT_BUT_COMPATIBLE_FIELD_TYPE = 'INCONSISTENT_BUT_COMPATIBLE_FIELD_TYPE',
  INCONSISTENT_DEFAULT_VALUE_PRESENCE = 'INCONSISTENT_DEFAULT_VALUE_PRESENCE',
  INCONSISTENT_DESCRIPTION = 'INCONSISTENT_DESCRIPTION',
  INCONSISTENT_ENTITY = 'INCONSISTENT_ENTITY',
  INCONSISTENT_ENUM_VALUE_FOR_INPUT_ENUM = 'INCONSISTENT_ENUM_VALUE_FOR_INPUT_ENUM',
  INCONSISTENT_ENUM_VALUE_FOR_OUTPUT_ENUM = 'INCONSISTENT_ENUM_VALUE_FOR_OUTPUT_ENUM',
  INCONSISTENT_EXECUTABLE_DIRECTIVE_LOCATIONS = 'INCONSISTENT_EXECUTABLE_DIRECTIVE_LOCATIONS',
  INCONSISTENT_EXECUTABLE_DIRECTIVE_PRESENCE = 'INCONSISTENT_EXECUTABLE_DIRECTIVE_PRESENCE',
  INCONSISTENT_EXECUTABLE_DIRECTIVE_REPEATABLE = 'INCONSISTENT_EXECUTABLE_DIRECTIVE_REPEATABLE',
  INCONSISTENT_INPUT_OBJECT_FIELD = 'INCONSISTENT_INPUT_OBJECT_FIELD',
  INCONSISTENT_INTERFACE_VALUE_TYPE_FIELD = 'INCONSISTENT_INTERFACE_VALUE_TYPE_FIELD',
  INCONSISTENT_NON_REPEATABLE_DIRECTIVE_ARGUMENTS = 'INCONSISTENT_NON_REPEATABLE_DIRECTIVE_ARGUMENTS',
  INCONSISTENT_OBJECT_VALUE_TYPE_FIELD = 'INCONSISTENT_OBJECT_VALUE_TYPE_FIELD',
  INCONSISTENT_RUNTIME_TYPES_FOR_SHAREABLE_RETURN = 'INCONSISTENT_RUNTIME_TYPES_FOR_SHAREABLE_RETURN',
  INCONSISTENT_TYPE_SYSTEM_DIRECTIVE_LOCATIONS = 'INCONSISTENT_TYPE_SYSTEM_DIRECTIVE_LOCATIONS',
  INCONSISTENT_TYPE_SYSTEM_DIRECTIVE_REPEATABLE = 'INCONSISTENT_TYPE_SYSTEM_DIRECTIVE_REPEATABLE',
  INCONSISTENT_UNION_MEMBER = 'INCONSISTENT_UNION_MEMBER',
  INPUT_ARGUMENT_NAMES_SHOULD_BE_CAMEL_CASE = 'INPUT_ARGUMENT_NAMES_SHOULD_BE_CAMEL_CASE',
  INPUT_TYPE_SUFFIX = 'INPUT_TYPE_SUFFIX',
  INTERFACE_PREFIX = 'INTERFACE_PREFIX',
  INTERFACE_SUFFIX = 'INTERFACE_SUFFIX',
  MERGED_NON_REPEATABLE_DIRECTIVE_ARGUMENTS = 'MERGED_NON_REPEATABLE_DIRECTIVE_ARGUMENTS',
  NO_EXECUTABLE_DIRECTIVE_INTERSECTION = 'NO_EXECUTABLE_DIRECTIVE_INTERSECTION',
  OBJECT_PREFIX = 'OBJECT_PREFIX',
  OBJECT_SUFFIX = 'OBJECT_SUFFIX',
  OVERRIDDEN_FIELD_CAN_BE_REMOVED = 'OVERRIDDEN_FIELD_CAN_BE_REMOVED',
  OVERRIDE_DIRECTIVE_CAN_BE_REMOVED = 'OVERRIDE_DIRECTIVE_CAN_BE_REMOVED',
  QUERY_DOCUMENT_DECLARATION = 'QUERY_DOCUMENT_DECLARATION',
  RESTY_FIELD_NAMES = 'RESTY_FIELD_NAMES',
  TAG_DIRECTIVE_USES_UNKNOWN_NAME = 'TAG_DIRECTIVE_USES_UNKNOWN_NAME',
  TYPE_NAMES_SHOULD_BE_PASCAL_CASE = 'TYPE_NAMES_SHOULD_BE_PASCAL_CASE',
  TYPE_PREFIX = 'TYPE_PREFIX',
  TYPE_SUFFIX = 'TYPE_SUFFIX',
  UNUSED_ENUM_TYPE = 'UNUSED_ENUM_TYPE'
}

/** Stats generated from linting a schema against the graph's linter configuration. */
export type LintStats = {
  __typename?: 'LintStats';
  /** Total number of lint errors. */
  errorsCount: Scalars['Int'];
  /** Total number of lint rules ignored. */
  ignoredCount: Scalars['Int'];
  /** Total number of lint rules violated. */
  totalCount: Scalars['Int'];
  /** Total number of lint warnings. */
  warningsCount: Scalars['Int'];
};

export type LinterIgnoredRuleChangesInput = {
  ruleViolationsToEnable: Array<IgnoredRuleInput>;
  ruleViolationsToIgnore: Array<IgnoredRuleInput>;
};

/** The category used for grouping similar rules. */
export enum LinterRuleCategory {
  /** These rules are generated during composition. */
  COMPOSITION = 'COMPOSITION',
  /** These rules enforce naming conventions. */
  NAMING = 'NAMING',
  /** These rules define conventions for the entire schema and directive usage outside of composition. */
  OTHER = 'OTHER'
}

export type LinterRuleLevelConfiguration = {
  __typename?: 'LinterRuleLevelConfiguration';
  /** Illustrative code showcasing the potential violation of this rule. */
  badExampleCode?: Maybe<Scalars['String']>;
  /** The category used for grouping similar rules. */
  category: LinterRuleCategory;
  /** A human readable description of the rule. */
  description: Scalars['String'];
  /** Illustrative code showcasing the fix for the potential violation of this rule. */
  goodExampleCode?: Maybe<Scalars['String']>;
  /** The configured level for the rule. */
  level: LintDiagnosticLevel;
  /** The name for this lint rule. */
  rule: LintRule;
};

export type LinterRuleLevelConfigurationChangesInput = {
  level: LintDiagnosticLevel;
  rule: LintRule;
};

export type ListNotFoundError = Error & {
  __typename?: 'ListNotFoundError';
  listId: Scalars['ID'];
  message: Scalars['String'];
};

export type Location = {
  __typename?: 'Location';
  end?: Maybe<Coordinate>;
  start?: Maybe<Coordinate>;
  subgraphName?: Maybe<Scalars['String']>;
};

/** Level of the log entry */
export enum LogLevel {
  /** Debug log entry */
  DEBUG = 'DEBUG',
  /** Error log entry */
  ERROR = 'ERROR',
  /** Informational log entry */
  INFO = 'INFO',
  /** Warning log entry */
  WARN = 'WARN'
}

/** Order log message */
export type LogMessage = {
  __typename?: 'LogMessage';
  /** Log level */
  level: LogLevel;
  /** Log message contents */
  message: Scalars['String'];
  /** Timestamp in UTC */
  timestamp: Scalars['DateTime'];
};

export enum LoginFlowSource {
  INTERNAL_SSO = 'INTERNAL_SSO',
  InternalSSO = 'InternalSSO'
}

export type MarkChangesForOperationAsSafeResult = {
  __typename?: 'MarkChangesForOperationAsSafeResult';
  /**
   * Nice to have for the frontend since the Apollo cache is already watching for AffectedQuery to update.
   * This might return null if no behavior changes were found for the affected operation ID.
   * This is a weird situation that should never happen.
   */
  affectedOperation?: Maybe<AffectedQuery>;
  message: Scalars['String'];
  success: Scalars['Boolean'];
};

export type MediaUploadInfo = {
  __typename?: 'MediaUploadInfo';
  csrfToken: Scalars['String'];
  maxContentLength: Scalars['Int'];
  url: Scalars['String'];
};

export type Message = {
  __typename?: 'Message';
  auditLog: Array<AuditLog>;
  channels: Array<SlackCommunicationChannel>;
  confirmations: Array<Maybe<MessageConfirmation>>;
  content: MessageContent;
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  modifiedAt: Scalars['Timestamp'];
  state: State;
  user: RequesterUser;
};

export type MessageConfirmation = {
  __typename?: 'MessageConfirmation';
  channel?: Maybe<SlackCommunicationChannel>;
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  modifiedAt: Scalars['Timestamp'];
  slackMessage: SlackMessageMeta;
  state: SlackPublishState;
};

export type MessageContent = {
  __typename?: 'MessageContent';
  body: Scalars['String'];
  buttonText?: Maybe<Scalars['String']>;
  buttonURL?: Maybe<Scalars['String']>;
  header: Scalars['String'];
};

export type MessageInput = {
  body_text: Scalars['String'];
  button_text?: InputMaybe<Scalars['String']>;
  button_url?: InputMaybe<Scalars['String']>;
  channel_id: Array<Scalars['ID']>;
  header_text: Scalars['String'];
};

export type MessageMutationResult = CustomerSupportSlackError | Message;

export type MetricStatWindow = {
  __typename?: 'MetricStatWindow';
  timestamp: Scalars['Timestamp'];
  value: Scalars['Long'];
  windowSize: BillingUsageStatsWindowSize;
};

export type MoveOperationCollectionEntryResult = InvalidTarget | MoveOperationCollectionEntrySuccess | PermissionError;

export type MoveOperationCollectionEntrySuccess = {
  __typename?: 'MoveOperationCollectionEntrySuccess';
  operation: OperationCollectionEntry;
  originCollection: OperationCollection;
  targetCollection: OperationCollection;
};

/** Input type to provide when running schema checks against multiple subgraph changes asynchronously for a federated supergraph. */
export type MultiSubgraphCheckAsyncInput = {
  /** Configuration options for the check execution. */
  config: HistoricQueryParametersInput;
  /** The GitHub context to associate with the check. */
  gitContext: GitContextInput;
  /** The graph ref of the Studio graph and variant to run checks against (such as `my-graph@current`). */
  graphRef?: InputMaybe<Scalars['ID']>;
  /** The URL of the GraphQL endpoint that Apollo Sandbox introspected to obtain the proposed schema. Required if `isSandbox` is `true`. */
  introspectionEndpoint?: InputMaybe<Scalars['String']>;
  /** If `true`, the check was initiated automatically by a Proposal update. */
  isProposal?: InputMaybe<Scalars['Boolean']>;
  /** If `true`, the check was initiated by Apollo Sandbox. */
  isSandbox: Scalars['Boolean'];
  /** The source variant that this check should use the operations check configuration from */
  sourceVariant?: InputMaybe<Scalars['String']>;
  /** The changed subgraph schemas to check. */
  subgraphsToCheck: Array<InputMaybe<SubgraphSdlCheckInput>>;
  /** The user that triggered this check. If null, defaults to authContext to determine user. */
  triggeredBy?: InputMaybe<ActorInput>;
};

/** GraphQL mutations */
export type Mutation = {
  __typename?: 'Mutation';
  account?: Maybe<AccountMutation>;
  approveMessage: MessageMutationResult;
  billing?: Maybe<BillingMutation>;
  /** Cloud mutations */
  cloud: CloudMutation;
  createMessage: MessageMutationResult;
  /** Creates an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/) for a given variant, or creates a [sandbox collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/#sandbox-collections) without an associated variant. */
  createOperationCollection: CreateOperationCollectionResult;
  editMessage: MessageMutationResult;
  /**
   * Finalize a password reset with a token included in the E-mail link,
   * returns the corresponding login email when successful
   */
  finalizePasswordReset?: Maybe<Scalars['String']>;
  /** Provides access to mutation fields for modifying a Studio graph with the provided ID. */
  graph?: Maybe<ServiceMutation>;
  /** Join an account with a token */
  joinAccount?: Maybe<Account>;
  me?: Maybe<IdentityMutation>;
  newAccount?: Maybe<Account>;
  /** Define a new billing plan */
  newBillingPlan?: Maybe<BillingPlan>;
  /** Define a new boolean capability to be applied to billing plans and subscriptions */
  newCapability?: Maybe<BillingCapability>;
  /** Define a new numeric limit to be applied to billing plans and subscriptions */
  newLimit?: Maybe<BillingLimit>;
  newService?: Maybe<Service>;
  operationCollection?: Maybe<OperationCollectionMutation>;
  plan?: Maybe<BillingPlanMutation>;
  /** Provides access to mutation fields for modifying a GraphOS Schema Proposals with the provided ID. Learn more at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
  proposal: ProposalMutationResult;
  proposalByVariantRef: ProposalMutationResult;
  publishSlackMessage: MessageMutationResult;
  publishSlackTest: MessageMutationResult;
  /** Push a lead to Marketo by program ID */
  pushMarketoLead: Scalars['Boolean'];
  recallMessage: MessageMutationResult;
  /** Report a running GraphQL server's schema. */
  reportSchema?: Maybe<ReportSchemaResult>;
  /** Ask for a user's password to be reset by E-mail */
  resetPassword?: Maybe<Scalars['Void']>;
  resolveAllInternalCronExecutions?: Maybe<Scalars['Void']>;
  resolveInternalCronExecution?: Maybe<CronExecution>;
  service?: Maybe<ServiceMutation>;
  /** Set the subscriptions for a given email */
  setSubscriptions?: Maybe<EmailPreferences>;
  /** Set the studio settings for the current user */
  setUserSettings?: Maybe<UserSettings>;
  signUp?: Maybe<User>;
  ssoV2: SsoMutation;
  /** This is called by the form shown to users after they delete their user or organization account. */
  submitPostDeletionFeedback?: Maybe<Scalars['Void']>;
  /** Mutation for basic engagement tracking in studio */
  track?: Maybe<Scalars['Void']>;
  /** Apollo Kotlin usage tracking. */
  trackApolloKotlinUsage?: Maybe<Scalars['Void']>;
  /** Router usage tracking. Reserved to https://router.apollo.dev/telemetry (https://github.com/apollographql/orbiter). */
  trackRouterUsage?: Maybe<Scalars['Void']>;
  /** Rover session tracking. Reserved to https://rover.apollo.dev/telemetry (https://github.com/apollographql/orbiter). */
  trackRoverSession?: Maybe<Scalars['Void']>;
  transferOdysseyProgress: Scalars['Boolean'];
  /** Unsubscribe a given email from all emails */
  unsubscribeFromAll?: Maybe<EmailPreferences>;
  updateSurvey: Survey;
  /**
   * Provides access to mutation fields for modifying an Apollo user with the
   * provided ID.
   */
  user?: Maybe<UserMutation>;
};


/** GraphQL mutations */
export type MutationaccountArgs = {
  id: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationapproveMessageArgs = {
  messageId: Scalars['ID'];
  state: State;
};


/** GraphQL mutations */
export type MutationcreateMessageArgs = {
  message: MessageInput;
};


/** GraphQL mutations */
export type MutationcreateOperationCollectionArgs = {
  description?: InputMaybe<Scalars['String']>;
  isSandbox: Scalars['Boolean'];
  isShared: Scalars['Boolean'];
  minEditRole?: InputMaybe<UserPermission>;
  name: Scalars['String'];
  variantRefs?: InputMaybe<Array<Scalars['ID']>>;
};


/** GraphQL mutations */
export type MutationeditMessageArgs = {
  messageId: Scalars['ID'];
  messageUpdates: MessageInput;
};


/** GraphQL mutations */
export type MutationfinalizePasswordResetArgs = {
  newPassword: Scalars['String'];
  resetToken: Scalars['String'];
};


/** GraphQL mutations */
export type MutationgraphArgs = {
  id: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationjoinAccountArgs = {
  accountId: Scalars['ID'];
  joinToken: Scalars['String'];
};


/** GraphQL mutations */
export type MutationnewAccountArgs = {
  companyUrl?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  organizationName?: InputMaybe<Scalars['String']>;
  planId?: InputMaybe<Scalars['String']>;
};


/** GraphQL mutations */
export type MutationnewBillingPlanArgs = {
  plan: BillingPlanInput;
};


/** GraphQL mutations */
export type MutationnewCapabilityArgs = {
  capability: BillingCapabilityInput;
};


/** GraphQL mutations */
export type MutationnewLimitArgs = {
  limit: BillingLimitInput;
};


/** GraphQL mutations */
export type MutationnewServiceArgs = {
  accountId: Scalars['ID'];
  description?: InputMaybe<Scalars['String']>;
  hiddenFromUninvitedNonAdminAccountMembers?: Scalars['Boolean'];
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  onboardingArchitecture?: InputMaybe<OnboardingArchitecture>;
  title?: InputMaybe<Scalars['String']>;
};


/** GraphQL mutations */
export type MutationoperationCollectionArgs = {
  id: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationplanArgs = {
  id: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationproposalArgs = {
  id: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationproposalByVariantRefArgs = {
  variantRef: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationpublishSlackMessageArgs = {
  messageId: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationpublishSlackTestArgs = {
  messageId: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationpushMarketoLeadArgs = {
  input: PushMarketoLeadInput;
  programId: Scalars['ID'];
  programStatus?: InputMaybe<Scalars['String']>;
  source?: InputMaybe<Scalars['String']>;
};


/** GraphQL mutations */
export type MutationrecallMessageArgs = {
  slackChannelId: Scalars['ID'];
  slackMessageId: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationreportSchemaArgs = {
  coreSchema?: InputMaybe<Scalars['String']>;
  report: SchemaReport;
};


/** GraphQL mutations */
export type MutationresetPasswordArgs = {
  email: Scalars['String'];
};


/** GraphQL mutations */
export type MutationresolveAllInternalCronExecutionsArgs = {
  group?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};


/** GraphQL mutations */
export type MutationresolveInternalCronExecutionArgs = {
  id: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationserviceArgs = {
  id: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationsetSubscriptionsArgs = {
  email: Scalars['String'];
  subscriptions: Array<EmailCategory>;
  token: Scalars['String'];
};


/** GraphQL mutations */
export type MutationsetUserSettingsArgs = {
  newSettings?: InputMaybe<UserSettingsInput>;
};


/** GraphQL mutations */
export type MutationsignUpArgs = {
  email: Scalars['String'];
  fullName: Scalars['String'];
  password: Scalars['String'];
  referrer?: InputMaybe<Scalars['String']>;
  trackingGoogleClientId?: InputMaybe<Scalars['String']>;
  trackingMarketoClientId?: InputMaybe<Scalars['String']>;
  userSegment?: InputMaybe<UserSegment>;
  utmCampaign?: InputMaybe<Scalars['String']>;
  utmMedium?: InputMaybe<Scalars['String']>;
  utmSource?: InputMaybe<Scalars['String']>;
};


/** GraphQL mutations */
export type MutationsubmitPostDeletionFeedbackArgs = {
  feedback: Scalars['String'];
  targetIdentifier: Scalars['ID'];
  targetType: DeletionTargetType;
};


/** GraphQL mutations */
export type MutationtrackArgs = {
  event: EventEnum;
  graphID: Scalars['String'];
  graphVariant?: Scalars['String'];
};


/** GraphQL mutations */
export type MutationtrackApolloKotlinUsageArgs = {
  events: Array<ApolloKotlinUsageEventInput>;
  instanceId: Scalars['ID'];
  properties: Array<ApolloKotlinUsagePropertyInput>;
};


/** GraphQL mutations */
export type MutationtrackRouterUsageArgs = {
  ci?: InputMaybe<Scalars['String']>;
  os: Scalars['String'];
  sessionId: Scalars['ID'];
  usage: Array<RouterUsageInput>;
  version: Scalars['String'];
};


/** GraphQL mutations */
export type MutationtrackRoverSessionArgs = {
  anonymousId: Scalars['ID'];
  arguments: Array<RoverArgumentInput>;
  ci?: InputMaybe<Scalars['String']>;
  command: Scalars['String'];
  cwdHash: Scalars['SHA256'];
  os: Scalars['String'];
  remoteUrlHash?: InputMaybe<Scalars['SHA256']>;
  sessionId: Scalars['ID'];
  version: Scalars['String'];
};


/** GraphQL mutations */
export type MutationtransferOdysseyProgressArgs = {
  from: Scalars['ID'];
  to: Scalars['ID'];
};


/** GraphQL mutations */
export type MutationunsubscribeFromAllArgs = {
  email: Scalars['String'];
  token: Scalars['String'];
};


/** GraphQL mutations */
export type MutationupdateSurveyArgs = {
  internalAccountId: Scalars['String'];
  surveyId: Scalars['String'];
  surveyState: Array<SurveyQuestionInput>;
};


/** GraphQL mutations */
export type MutationuserArgs = {
  id: Scalars['ID'];
};

export type NamedIntrospectionArg = {
  __typename?: 'NamedIntrospectionArg';
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type NamedIntrospectionArgNoDescription = {
  __typename?: 'NamedIntrospectionArgNoDescription';
  name?: Maybe<Scalars['String']>;
};

/**
 * The shared fields for a named introspection type. Currently this is returned for the
 * top level value affected by a change. In the future, we may update this
 * type to be an interface, which is extended by the more specific types:
 * scalar, object, input object, union, interface, and enum
 *
 * For an in-depth look at where these types come from, see:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/659eb50d3/types/graphql/utilities/introspectionQuery.d.ts#L31-L37
 */
export type NamedIntrospectionType = {
  __typename?: 'NamedIntrospectionType';
  description?: Maybe<Scalars['String']>;
  kind?: Maybe<IntrospectionTypeKind>;
  name?: Maybe<Scalars['String']>;
};

export type NamedIntrospectionTypeNoDescription = {
  __typename?: 'NamedIntrospectionTypeNoDescription';
  name?: Maybe<Scalars['String']>;
};

/**
 * Introspection values that can be children of other types for changes, such
 * as input fields, objects in interfaces, enum values. In the future, this
 * value could become an interface to allow fields specific to the types
 * returned.
 */
export type NamedIntrospectionValue = {
  __typename?: 'NamedIntrospectionValue';
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  printedType?: Maybe<Scalars['String']>;
};

export type NamedIntrospectionValueNoDescription = {
  __typename?: 'NamedIntrospectionValueNoDescription';
  name?: Maybe<Scalars['String']>;
  printedType?: Maybe<Scalars['String']>;
};

/** A non-federated service for a monolithic graph. */
export type NonFederatedImplementingService = {
  __typename?: 'NonFederatedImplementingService';
  /** Timestamp of when this implementing service was created. */
  createdAt: Scalars['Timestamp'];
  /**
   * Identifies which graph this non-implementing service belongs to.
   * Formerly known as "service_id".
   */
  graphID: Scalars['String'];
  /**
   * Specifies which variant of a graph this implementing service belongs to".
   * Formerly known as "tag".
   */
  graphVariant: Scalars['String'];
};

/** An error that occurs when a requested object is not found. */
export type NotFoundError = Error & {
  __typename?: 'NotFoundError';
  /** The error message. */
  message: Scalars['String'];
};

export enum NotificationStatus {
  ALL = 'ALL',
  NONE = 'NONE'
}

export type OdysseyAttempt = {
  __typename?: 'OdysseyAttempt';
  completedAt?: Maybe<Scalars['Timestamp']>;
  id: Scalars['ID'];
  pass?: Maybe<Scalars['Boolean']>;
  responses: Array<OdysseyResponse>;
  startedAt: Scalars['Timestamp'];
  testId: Scalars['String'];
};

export type OdysseyCertification = {
  __typename?: 'OdysseyCertification';
  certificationId: Scalars['String'];
  earnedAt: Scalars['Timestamp'];
  icon?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  owner?: Maybe<OdysseyCertificationOwner>;
  source?: Maybe<Scalars['String']>;
};

export type OdysseyCertificationOwner = {
  __typename?: 'OdysseyCertificationOwner';
  fullName: Scalars['String'];
  id: Scalars['ID'];
};

export type OdysseyCourse = {
  __typename?: 'OdysseyCourse';
  completedAt?: Maybe<Scalars['Timestamp']>;
  enrolledAt?: Maybe<Scalars['Timestamp']>;
  id: Scalars['ID'];
  language?: Maybe<Scalars['String']>;
};

export type OdysseyCourseInput = {
  completedAt?: InputMaybe<Scalars['Timestamp']>;
  courseId: Scalars['String'];
  isBeta?: InputMaybe<Scalars['Boolean']>;
  language?: InputMaybe<Scalars['String']>;
};

export type OdysseyResponse = {
  __typename?: 'OdysseyResponse';
  correct?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  questionId: Scalars['String'];
  values: Array<OdysseyValue>;
};

export type OdysseyResponseCorrectnessInput = {
  correct: Scalars['Boolean'];
  id: Scalars['ID'];
};

export type OdysseyResponseInput = {
  attemptId: Scalars['ID'];
  correct?: InputMaybe<Scalars['Boolean']>;
  questionId: Scalars['String'];
  values: Array<Scalars['String']>;
};

export type OdysseyTask = {
  __typename?: 'OdysseyTask';
  completedAt?: Maybe<Scalars['Timestamp']>;
  id: Scalars['ID'];
  value?: Maybe<Scalars['String']>;
};

export type OdysseyTaskInput = {
  completedAt?: InputMaybe<Scalars['Timestamp']>;
  taskId: Scalars['String'];
  value?: InputMaybe<Scalars['String']>;
};

export type OdysseyValue = {
  __typename?: 'OdysseyValue';
  id: Scalars['ID'];
  value: Scalars['String'];
};

export type OidcConnection = SsoConnection & {
  __typename?: 'OidcConnection';
  clientId: Scalars['ID'];
  discoveryUri?: Maybe<Scalars['String']>;
  domains: Array<Scalars['String']>;
  id: Scalars['ID'];
  idpId: Scalars['ID'];
  issuer: Scalars['String'];
};

export type OidcConnectionInput = {
  clientId: Scalars['String'];
  clientSecret: Scalars['String'];
  discoveryURI?: InputMaybe<Scalars['String']>;
  domains: Array<Scalars['String']>;
  idpId: Scalars['String'];
  issuer: Scalars['String'];
};

export enum OnboardingArchitecture {
  MONOLITH = 'MONOLITH',
  SUPERGRAPH = 'SUPERGRAPH'
}

export type Operation = {
  __typename?: 'Operation';
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  signature?: Maybe<Scalars['String']>;
  truncated: Scalars['Boolean'];
};

export type OperationAcceptedChange = {
  __typename?: 'OperationAcceptedChange';
  acceptedAt: Scalars['Timestamp'];
  acceptedBy?: Maybe<Identity>;
  change: StoredApprovedChange;
  checkID: Scalars['ID'];
  graphID: Scalars['ID'];
  id: Scalars['ID'];
  operationID: Scalars['String'];
};

/** Columns of OperationCheckStats. */
export enum OperationCheckStatsColumn {
  CACHED_REQUESTS_COUNT = 'CACHED_REQUESTS_COUNT',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP',
  UNCACHED_REQUESTS_COUNT = 'UNCACHED_REQUESTS_COUNT'
}

export type OperationCheckStatsDimensions = {
  __typename?: 'OperationCheckStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in OperationCheckStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type OperationCheckStatsFilter = {
  and?: InputMaybe<Array<OperationCheckStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<OperationCheckStatsFilterIn>;
  not?: InputMaybe<OperationCheckStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<OperationCheckStatsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in OperationCheckStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type OperationCheckStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type OperationCheckStatsMetrics = {
  __typename?: 'OperationCheckStatsMetrics';
  cachedRequestsCount: Scalars['Long'];
  uncachedRequestsCount: Scalars['Long'];
};

export type OperationCheckStatsOrderBySpec = {
  column: OperationCheckStatsColumn;
  direction: Ordering;
};

export type OperationCheckStatsRecord = {
  __typename?: 'OperationCheckStatsRecord';
  /** Dimensions of OperationCheckStats that can be grouped by. */
  groupBy: OperationCheckStatsDimensions;
  /** Metrics of OperationCheckStats that can be aggregated over. */
  metrics: OperationCheckStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** A list of saved GraphQL operations. */
export type OperationCollection = {
  __typename?: 'OperationCollection';
  /** The timestamp when the collection was created. */
  createdAt: Scalars['Timestamp'];
  /** The user or other entity that created the collection. */
  createdBy?: Maybe<Identity>;
  /** The collection's description. A `null` description was never set, and empty string description was set to be empty string by a user, or other entity. */
  description?: Maybe<Scalars['String']>;
  /**
   * If a user has any of these roles, they will be able to edit this
   * collection.
   * @deprecated deprecated in favour of minEditRole
   */
  editRoles?: Maybe<Array<UserPermission>>;
  id: Scalars['ID'];
  /** Whether the current user has marked the collection as a favorite. */
  isFavorite: Scalars['Boolean'];
  /** Whether the collection is a [sandbox collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/#sandbox-collections). */
  isSandbox: Scalars['Boolean'];
  /** Whether the collection is shared across its associated organization. */
  isShared: Scalars['Boolean'];
  /** The timestamp when the collection was most recently updated. */
  lastUpdatedAt: Scalars['Timestamp'];
  /** The user or other entity that most recently updated the collection. */
  lastUpdatedBy?: Maybe<Identity>;
  /** The minimum role a user needs to edit this collection. Valid values: null, CONSUMER, OBSERVER, DOCUMENTER, CONTRIBUTOR, GRAPH_ADMIN. This value is always `null` if `isShared` is `false`. If `null` when `isShared` is `true`, the minimum role is `GRAPH_ADMIN`. */
  minEditRole?: Maybe<UserPermission>;
  /** The collection's name. */
  name: Scalars['String'];
  /** Returns the operation in the collection with the specified ID, if any. */
  operation?: Maybe<OperationCollectionEntryResult>;
  /** A list of the GraphQL operations that belong to the collection. */
  operations: Array<OperationCollectionEntry>;
  /** The permissions that the current user has for the collection. */
  permissions: OperationCollectionPermissions;
  variants: Array<GraphVariant>;
};


/** A list of saved GraphQL operations. */
export type OperationCollectionoperationArgs = {
  id: Scalars['ID'];
};

/** A saved operation entry within an Operation Collection. */
export type OperationCollectionEntry = {
  __typename?: 'OperationCollectionEntry';
  collection: OperationCollection;
  /** The timestamp when the entry was created. */
  createdAt: Scalars['Timestamp'];
  /** The user or other entity that created the entry. */
  createdBy?: Maybe<Identity>;
  /** Details of the entry's associated operation, such as its `body` and `variables`. */
  currentOperationRevision: OperationCollectionEntryState;
  id: Scalars['ID'];
  /** The timestamp when the entry was most recently updated. */
  lastUpdatedAt: Scalars['Timestamp'];
  /** The user or other entity that most recently updated the entry. */
  lastUpdatedBy?: Maybe<Identity>;
  /** The entry's name. */
  name: Scalars['String'];
  /** The entry's lexicographical ordering index within its containing collection. */
  orderingIndex: Scalars['String'];
};

/** Provides fields for modifying an operation in a collection. */
export type OperationCollectionEntryMutation = {
  __typename?: 'OperationCollectionEntryMutation';
  moveToCollection: MoveOperationCollectionEntryResult;
  reorderEntry?: Maybe<UpdateOperationCollectionResult>;
  /** Updates the name of an operation. */
  updateName?: Maybe<UpdateOperationCollectionEntryResult>;
  /** Updates the body, headers, and/or variables of an operation. */
  updateValues?: Maybe<UpdateOperationCollectionEntryResult>;
};


/** Provides fields for modifying an operation in a collection. */
export type OperationCollectionEntryMutationmoveToCollectionArgs = {
  collectionId: Scalars['ID'];
  lowerOrderingBound?: InputMaybe<Scalars['String']>;
  upperOrderingBound?: InputMaybe<Scalars['String']>;
};


/** Provides fields for modifying an operation in a collection. */
export type OperationCollectionEntryMutationreorderEntryArgs = {
  lowerOrderingBound?: InputMaybe<Scalars['String']>;
  upperOrderingBound?: InputMaybe<Scalars['String']>;
};


/** Provides fields for modifying an operation in a collection. */
export type OperationCollectionEntryMutationupdateNameArgs = {
  name: Scalars['String'];
};


/** Provides fields for modifying an operation in a collection. */
export type OperationCollectionEntryMutationupdateValuesArgs = {
  operationInput: OperationCollectionEntryStateInput;
};

export type OperationCollectionEntryMutationResult = NotFoundError | OperationCollectionEntryMutation | PermissionError;

/** Possible return values when querying for an entry in an operation collection (either the entry object or an `Error` object). */
export type OperationCollectionEntryResult = NotFoundError | OperationCollectionEntry;

/** The most recent body, variable and header values of a saved operation entry. */
export type OperationCollectionEntryState = {
  __typename?: 'OperationCollectionEntryState';
  /** The raw body of the entry's GraphQL operation. */
  body: Scalars['String'];
  /** The timestamp when the entry state was created. */
  createdAt: Scalars['Timestamp'];
  /** The user or other entity that created this entry state. */
  createdBy?: Maybe<Identity>;
  /** Headers for the entry's GraphQL operation. */
  headers?: Maybe<Array<OperationHeader>>;
  /** The post operation workflow automation script for this entry's GraphQL operation */
  postflightOperationScript?: Maybe<Scalars['String']>;
  /** The pre operation workflow automation script for this entry's GraphQL operation */
  script?: Maybe<Scalars['String']>;
  /** Variables for the entry's GraphQL operation, as a JSON string. */
  variables?: Maybe<Scalars['String']>;
};

/** Fields for creating or modifying an operation collection entry. */
export type OperationCollectionEntryStateInput = {
  /** The operation's query body. */
  body: Scalars['String'];
  /** The operation's headers. */
  headers?: InputMaybe<Array<OperationHeaderInput>>;
  /** The operation's postflight workflow script */
  postflightOperationScript?: InputMaybe<Scalars['String']>;
  /** The operation's preflight workflow script */
  script?: InputMaybe<Scalars['String']>;
  /** The operation's variables. */
  variables?: InputMaybe<Scalars['String']>;
};

/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutation = {
  __typename?: 'OperationCollectionMutation';
  /** Adds an operation to this collection. */
  addOperation?: Maybe<AddOperationCollectionEntryResult>;
  /** Adds operations to this collection. */
  addOperations?: Maybe<AddOperationCollectionEntriesResult>;
  /** @deprecated Will throw NotImplemented */
  addToVariant: AddOperationCollectionToVariantResult;
  /** Deletes this operation collection. This also deletes all of the collection's associated operations. */
  delete?: Maybe<DeleteOperationCollectionResult>;
  /** Deletes an operation from this collection. */
  deleteOperation?: Maybe<RemoveOperationCollectionEntryResult>;
  duplicateCollection: DuplicateOperationCollectionResult;
  operation?: Maybe<OperationCollectionEntryMutationResult>;
  /** @deprecated Will throw NotImplemented */
  removeFromVariant: RemoveOperationCollectionFromVariantResult;
  /** Updates the minimum role a user needs to be able to modify this collection. */
  setMinEditRole?: Maybe<UpdateOperationCollectionResult>;
  /** Updates this collection's description. */
  updateDescription?: Maybe<UpdateOperationCollectionResult>;
  /** Updates whether the current user has marked this collection as a favorite. */
  updateIsFavorite?: Maybe<UpdateOperationCollectionResult>;
  /** Updates whether this collection is shared across its associated organization. */
  updateIsShared?: Maybe<UpdateOperationCollectionResult>;
  /** Updates this operation collection's name. */
  updateName?: Maybe<UpdateOperationCollectionResult>;
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationaddOperationArgs = {
  name: Scalars['String'];
  operationInput: OperationCollectionEntryStateInput;
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationaddOperationsArgs = {
  operations: Array<AddOperationInput>;
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationaddToVariantArgs = {
  variantRef: Scalars['ID'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationdeleteOperationArgs = {
  id: Scalars['ID'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationduplicateCollectionArgs = {
  description?: InputMaybe<Scalars['String']>;
  isSandbox: Scalars['Boolean'];
  isShared: Scalars['Boolean'];
  name: Scalars['String'];
  variantRef?: InputMaybe<Scalars['ID']>;
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationoperationArgs = {
  id: Scalars['ID'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationremoveFromVariantArgs = {
  variantRef: Scalars['ID'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationsetMinEditRoleArgs = {
  editRole?: InputMaybe<UserPermission>;
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationupdateDescriptionArgs = {
  description?: InputMaybe<Scalars['String']>;
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationupdateIsFavoriteArgs = {
  isFavorite: Scalars['Boolean'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationupdateIsSharedArgs = {
  isShared: Scalars['Boolean'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationupdateNameArgs = {
  name: Scalars['String'];
};

/** Whether the current user can perform various actions on the associated collection. */
export type OperationCollectionPermissions = {
  __typename?: 'OperationCollectionPermissions';
  /** Whether the current user can edit operations in the associated collection. */
  canEditOperations: Scalars['Boolean'];
  /** Whether the current user can delete or update the associated collection's metadata, such as its name and description. */
  canManage: Scalars['Boolean'];
  /** Whether the current user can read operations in the associated collection. */
  canReadOperations: Scalars['Boolean'];
};

export type OperationCollectionResult = NotFoundError | OperationCollection | PermissionError | ValidationError;

export type OperationDocument = {
  __typename?: 'OperationDocument';
  /** Operation document body */
  body: Scalars['String'];
  /** Operation name */
  name?: Maybe<Scalars['String']>;
};

export type OperationDocumentInput = {
  /** Operation document body */
  body: Scalars['String'];
  /** Operation name */
  name?: InputMaybe<Scalars['String']>;
};

/** Saved headers on a saved operation. */
export type OperationHeader = {
  __typename?: 'OperationHeader';
  /** The header's name. */
  name: Scalars['String'];
  /** The header's value. */
  value: Scalars['String'];
};

export type OperationHeaderInput = {
  /** The header's name. */
  name: Scalars['String'];
  /** The header's value. */
  value: Scalars['String'];
};

export type OperationInfoFilter = {
  __typename?: 'OperationInfoFilter';
  id: Scalars['String'];
};

export type OperationInfoFilterInput = {
  id: Scalars['String'];
};

export type OperationInsightsListFilterInInput = {
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type OperationInsightsListFilterInput = {
  clientName?: InputMaybe<Scalars['String']>;
  clientVersion?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<OperationInsightsListFilterInInput>;
  isUnnamed?: InputMaybe<Scalars['Boolean']>;
  isUnregistered?: InputMaybe<Scalars['Boolean']>;
  operationTypes?: InputMaybe<Array<OperationType>>;
  or?: InputMaybe<Array<OperationInsightsListFilterInput>>;
  search?: InputMaybe<Scalars['String']>;
};

export type OperationInsightsListItem = {
  __typename?: 'OperationInsightsListItem';
  cacheHitRate: Scalars['Float'];
  /** The p50 of the latency across cached requests. This can be null depending on the filter and sort order. */
  cacheTtlP50Ms?: Maybe<Scalars['Float']>;
  /** A substring of the query signature for unnamed operations, otherwise the operation name. */
  displayName: Scalars['String'];
  errorCount: Scalars['Long'];
  errorCountPerMin: Scalars['Float'];
  errorPercentage: Scalars['Float'];
  /** The unique id for this operation. */
  id: Scalars['ID'];
  /** The operation name or null if the operation is unnamed. */
  name?: Maybe<Scalars['String']>;
  requestCount: Scalars['Long'];
  requestCountPerMin: Scalars['Float'];
  /** The p50 of the latency across all requests. This can be null depending on the filter and sort order. */
  serviceTimeP50Ms?: Maybe<Scalars['Float']>;
  /** The p90 of the latency across all requests. This can be null depending on the filter and sort order. */
  serviceTimeP90Ms?: Maybe<Scalars['Float']>;
  /** The p95 of the latency across all requests. This can be null depending on the filter and sort order. */
  serviceTimeP95Ms?: Maybe<Scalars['Float']>;
  /** The p99 of the latency across all requests. This can be null depending on the filter and sort order. */
  serviceTimeP99Ms?: Maybe<Scalars['Float']>;
  /** The query signature size as a number of UTF8 bytes. This can be null if the sort order is not SIGNATURE_BYTES. */
  signatureBytes?: Maybe<Scalars['Long']>;
  /** The total duration across all requests. This can be null depending on the filter and sort order. */
  totalDurationMs?: Maybe<Scalars['Float']>;
  type?: Maybe<OperationType>;
};

export enum OperationInsightsListOrderByColumn {
  CACHE_HIT_RATE = 'CACHE_HIT_RATE',
  CACHE_TTL_P50 = 'CACHE_TTL_P50',
  ERROR_COUNT = 'ERROR_COUNT',
  ERROR_COUNT_PER_MIN = 'ERROR_COUNT_PER_MIN',
  ERROR_PERCENTAGE = 'ERROR_PERCENTAGE',
  OPERATION_NAME = 'OPERATION_NAME',
  REQUEST_COUNT = 'REQUEST_COUNT',
  REQUEST_COUNT_PER_MIN = 'REQUEST_COUNT_PER_MIN',
  SERVICE_TIME_P50 = 'SERVICE_TIME_P50',
  SERVICE_TIME_P90 = 'SERVICE_TIME_P90',
  SERVICE_TIME_P95 = 'SERVICE_TIME_P95',
  SERVICE_TIME_P99 = 'SERVICE_TIME_P99',
  SIGNATURE_BYTES = 'SIGNATURE_BYTES',
  TOTAL_DURATION_MS = 'TOTAL_DURATION_MS'
}

export type OperationInsightsListOrderByInput = {
  /** The order column used for the operation results. Defaults to ordering by operation names. */
  column: OperationInsightsListOrderByColumn;
  /** The direction used to order operation results. Defaults to ascending order. */
  direction: Ordering;
};

/** Information about pagination in a connection. */
export type OperationInsightsListPageInfo = {
  __typename?: 'OperationInsightsListPageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

/** Operation name filter configuration for a graph. */
export type OperationNameFilter = {
  __typename?: 'OperationNameFilter';
  /** name of the operation by the user and reported alongside metrics */
  name: Scalars['String'];
  version?: Maybe<Scalars['String']>;
};

/** Options to filter by operation name. */
export type OperationNameFilterInput = {
  /** name of the operation set by the user and reported alongside metrics */
  name: Scalars['String'];
  version?: InputMaybe<Scalars['String']>;
};

export enum OperationType {
  MUTATION = 'MUTATION',
  QUERY = 'QUERY',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export type OperationValidationError = {
  __typename?: 'OperationValidationError';
  message: Scalars['String'];
};

export type OperationsCheckConfiguration = {
  __typename?: 'OperationsCheckConfiguration';
  /** During the operations check, ignore clients matching any of the <excludedClients> filters. */
  excludedClients: Array<ClientFilter>;
  /** During the operations check, ignore operations matching any of the <excludedOperationNames> filters. */
  excludedOperationNames: Array<OperationNameFilter>;
  /** During the operations check, ignore operations matching any of the <excludedOperations> filters. */
  excludedOperations: Array<OperationInfoFilter>;
  /**
   * The start of the time range for the operations check, expressed as an offset from the time the
   * check request was received (in seconds) or an ISO-8601 timestamp. This was either provided by the
   * user or computed from variant- or graph-level settings.
   * @deprecated Use fromNormalized instead
   */
  from: Scalars['String'];
  /** The start of the time range for the operations check. */
  fromNormalized: Scalars['Timestamp'];
  /**
   * During the operations check, fetch operations from the metrics data for <includedVariants>
   * variants.
   */
  includedVariants: Array<Scalars['String']>;
  /**
   * During the operations check, ignore operations that executed less than <operationCountThreshold>
   * times in the time range.
   */
  operationCountThreshold: Scalars['Int'];
  /**
   * Duration the operations check, ignore operations that constituted less than
   * <operationCountThresholdPercentage>% of the operations in the time range.
   */
  operationCountThresholdPercentage: Scalars['Float'];
  /**
   * The end of the time range for the operations check, expressed as an offset from the time the
   * check request was received (in seconds) or an ISO-8601 timestamp. This was either provided by the
   * user or computed from variant- or graph-level settings.
   * @deprecated Use toNormalized instead
   */
  to: Scalars['String'];
  /** The end of the time range for the operations check. */
  toNormalized: Scalars['Timestamp'];
};

export type OperationsCheckConfigurationOverridesInput = {
  /**
   * During the operations check, ignore clients matching any of the <excludedClients> filters.
   * Providing null will use variant- or graph-level settings instead.
   */
  excludedClients?: InputMaybe<Array<ClientFilterInput>>;
  /**
   * During the operations check, ignore operations matching any of the <excludedOperationNames>
   * filters. Providing null will use variant- or graph-level settings instead.
   */
  excludedOperationNames?: InputMaybe<Array<OperationNameFilterInput>>;
  /**
   * During the operations check, ignore operations matching any of the <excludedOperations> filters.
   * Providing null will use variant- or graph-level settings instead.
   */
  excludedOperations?: InputMaybe<Array<OperationInfoFilterInput>>;
  /**
   * The start of the time range for the operations check, expressed as an offset from the time the
   * check request is received (in seconds) or an ISO-8601 timestamp. Providing null here and
   * useMaxRetention as false will use variant- or graph-level settings instead. It is an error to
   * provide a non-null value here and useMaxRetention as true.
   */
  from?: InputMaybe<Scalars['String']>;
  /**
   * During the operations check, fetch operations from the metrics data for <includedVariants>
   * variants. Providing null will use variant- or graph-level settings instead.
   */
  includedVariants?: InputMaybe<Array<Scalars['String']>>;
  /**
   * During the operations check, ignore operations that executed less than <operationCountThreshold>
   * times in the time range. Providing null will use variant- or graph-level settings instead.
   */
  operationCountThreshold?: InputMaybe<Scalars['Int']>;
  /**
   * During the operations check, ignore operations that executed less than <operationCountThreshold>
   * times in the time range. Expected values are between 0% and 5%. Providing null will use variant-
   * or graph-level settings instead.
   */
  operationCountThresholdPercentage?: InputMaybe<Scalars['Float']>;
  /**
   * The end of the time range for the operations check, expressed as an offset from the time the
   * check request is received (in seconds) or an ISO-8601 timestamp. Providing null here and
   * useMaxRetention as false will use variant- or graph-level settings instead. It is an error to
   * provide a non-null value here and useMaxRetention as true.
   */
  to?: InputMaybe<Scalars['String']>;
  /**
   * During the operations check, use the maximum time range allowed by the graph's plan's retention.
   * Providing false here and from/to as null will use variant- or graph-level settings instead. It is
   * an error to provide true here and from/to as non-null.
   */
  useMaxRetention?: Scalars['Boolean'];
};

export type OperationsCheckResult = {
  __typename?: 'OperationsCheckResult';
  /** Operations affected by all changes in diff */
  affectedQueries?: Maybe<Array<AffectedQuery>>;
  /** Summary/counts for all changes in diff */
  changeSummary: ChangeSummary;
  /** List of schema changes with associated affected clients and operations */
  changes: Array<Change>;
  /** Indication of the success of the change, either failure, warning, or notice. */
  checkSeverity: ChangeSeverity;
  /** The variant that was used as a base to check against */
  checkedVariant: GraphVariant;
  createdAt: Scalars['Timestamp'];
  /** The threshold that was crossed; null if the threshold was not exceeded */
  crossedOperationThreshold?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  /** Number of affected query operations that are neither marked as SAFE or IGNORED */
  numberOfAffectedOperations: Scalars['Int'];
  /** Number of operations that were validated during schema diff */
  numberOfCheckedOperations: Scalars['Int'];
  workflowTask: OperationsCheckTask;
};

export type OperationsCheckTask = CheckWorkflowTask & {
  __typename?: 'OperationsCheckTask';
  completedAt?: Maybe<Scalars['Timestamp']>;
  createdAt: Scalars['Timestamp'];
  graphID: Scalars['ID'];
  id: Scalars['ID'];
  /**
   * The result of the operations check. This will be null when the task is initializing or running,
   * or when the build task fails (which is a prerequisite task to this one).
   */
  result?: Maybe<OperationsCheckResult>;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']>;
  workflow: CheckWorkflow;
};

/** Cloud Router order */
export type Order = {
  __typename?: 'Order';
  /**
   * Completion percentage of the order (between 0 and 100)
   *
   * This will only return data for IN_PROGRESS, COMPLETED, or SUPERSEDED states
   */
  completionPercentage?: Maybe<Scalars['Int']>;
  /** When this Order was created */
  createdAt: Scalars['NaiveDateTime'];
  /** Order identifier */
  id: Scalars['ID'];
  /** Introspect why call to `ready` failed */
  introspectReady: Scalars['String'];
  logs: Array<LogMessage>;
  /** Order type */
  orderType: OrderType;
  /** Checks if machines are ready to serve requests */
  ready: Scalars['Boolean'];
  /** Checks if we can serve requests through the external endpoint */
  readyExternal: Scalars['Boolean'];
  /** Reason for ERRORED or ROLLING_BACK orders */
  reason?: Maybe<Scalars['String']>;
  /** Router associated with this Order */
  router: Router;
  /** Checks if the service is updated */
  serviceReady: Scalars['Boolean'];
  /** Shard associated with this Order */
  shard: Shard;
  /** Order status */
  status: OrderStatus;
  /** Last time this Order was updated */
  updatedAt?: Maybe<Scalars['NaiveDateTime']>;
};

/** The order does not exist */
export type OrderDoesNotExistError = {
  __typename?: 'OrderDoesNotExistError';
  tryAgainSeconds: Scalars['Int'];
};

/** Catch-all failure result of a failed order mutation. */
export type OrderError = {
  __typename?: 'OrderError';
  /** Error message */
  message: Scalars['String'];
};

export type OrderMutation = {
  __typename?: 'OrderMutation';
  /** Create an ALB rule */
  createAlbRule: OrderResult;
  /** Create a new app */
  createApp: OrderResult;
  /** Create CNAME record */
  createCname: OrderResult;
  /** Create an IAM Role */
  createIamRole: OrderResult;
  /** Create machines */
  createMachines: OrderResult;
  /** Create a security group */
  createSecurityGroup: OrderResult;
  /** Create an ECS service */
  createService: OrderResult;
  /** Create a target group */
  createTargetGroup: OrderResult;
  /** Create a task definition */
  createTaskDefinition: OrderResult;
  /** Delete an ALB rule */
  deleteAlbRule: OrderResult;
  /** Delete API key */
  deleteApiKey: OrderResult;
  /** Delete application */
  deleteApp: OrderResult;
  /** Delete CNAME */
  deleteCname: OrderResult;
  /** Delete an IAM Role */
  deleteIamRole: OrderResult;
  /** Delete machines */
  deleteMachines: OrderResult;
  /** Delete a security group */
  deleteSecurityGroup: OrderResult;
  /** Delete an ECS service */
  deleteService: OrderResult;
  /** Delete a target group */
  deleteTargetGroup: OrderResult;
  /** Delete a task definition */
  deleteTaskDefinition: OrderResult;
  /** Force rollback of the order */
  forceRollback: OrderResult;
  /** Rollback an ALB rule */
  rollbackAlbRule: OrderResult;
  /** Rollback application */
  rollbackApp: OrderResult;
  /** Rollback CNAME record */
  rollbackCname: OrderResult;
  /** Rollback etcd data */
  rollbackEtcd: OrderResult;
  /** Rollback an IAM Role */
  rollbackIamRole: OrderResult;
  /** Rollback router information */
  rollbackInfo: OrderResult;
  /** Rollback machines */
  rollbackMachines: OrderResult;
  /** Rollback router information */
  rollbackSecrets: OrderResult;
  /** Rollback a security group */
  rollbackSecurityGroup: OrderResult;
  /** Rollback an ECS service */
  rollbackService: OrderResult;
  /** Rollback a target group */
  rollbackTargetGroup: OrderResult;
  /** Rollback a task definition */
  rollbackTaskDefinition: OrderResult;
  /** Set default environment variables */
  setDefaultVars: OrderResult;
  /** Update Etcd cluster */
  updateEtcd: OrderResult;
  /** Update an IAM Role */
  updateIamRole: OrderResult;
  /** Update router information */
  updateInfo: OrderResult;
  /** Update a Service */
  updateService: OrderResult;
  /** Update order status */
  updateStatus: OrderResult;
  /** Update order status with a reason and cause */
  updateStatusWithReason: OrderResult;
  /** Update a task definition */
  updateTaskDefinition: OrderResult;
};


export type OrderMutationupdateStatusArgs = {
  status: OrderStatus;
};


export type OrderMutationupdateStatusWithReasonArgs = {
  cause: ReasonCause;
  reason: Scalars['String'];
  status: OrderStatus;
};

/** Return an Order or an error */
export type OrderOrError = Order | OrderDoesNotExistError;

/** Represents the possible outcomes of an order mutation */
export type OrderResult = InvalidInputErrors | Order | OrderError;

/** Represents the different status for an order */
export enum OrderStatus {
  /** Order was successfully completed */
  COMPLETED = 'COMPLETED',
  /** Order was unsuccessful */
  ERRORED = 'ERRORED',
  /** New Order in progress */
  PENDING = 'PENDING',
  /**
   * Order is currently rolling back
   *
   * All resources created as part of this Order are being deleted
   */
  ROLLING_BACK = 'ROLLING_BACK',
  /**
   * Order has been superseded by another, more recent order
   *
   * This can happen if two update orders arrive in close succession and we already
   * started to process the newer order first.
   */
  SUPERSEDED = 'SUPERSEDED'
}

/** Represents the different types of order */
export enum OrderType {
  /** Create a new Cloud Router */
  CREATE_ROUTER = 'CREATE_ROUTER',
  /** Destroy an existing Cloud Router */
  DESTROY_ROUTER = 'DESTROY_ROUTER',
  /** Update an existing Cloud Router */
  UPDATE_ROUTER = 'UPDATE_ROUTER'
}

export enum Ordering {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING'
}

export type OrgCustomerTraits = {
  __typename?: 'OrgCustomerTraits';
  healthScore?: Maybe<Scalars['Float']>;
  nextRenewalDate?: Maybe<Scalars['Int']>;
  tier?: Maybe<Scalars['String']>;
  usersCount?: Maybe<Scalars['Int']>;
};

/** A reusable invite link for an organization. */
export type OrganizationInviteLink = {
  __typename?: 'OrganizationInviteLink';
  createdAt: Scalars['Timestamp'];
  /** A joinToken that can be passed to Mutation.joinAccount to join the organization. */
  joinToken: Scalars['String'];
  /** The role that the user will receive if they join the organization with this link. */
  role: UserPermission;
};

export type OrganizationSSO = {
  __typename?: 'OrganizationSSO';
  connection?: Maybe<SsoConnection>;
  defaultRole: UserPermission;
  idpid: Scalars['ID'];
  provider: OrganizationSSOProvider;
};

export enum OrganizationSSOProvider {
  PINGONE = 'PINGONE'
}

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

/** PagerDuty notification channel */
export type PagerDutyChannel = Channel & {
  __typename?: 'PagerDutyChannel';
  id: Scalars['ID'];
  name: Scalars['String'];
  routingKey: Scalars['String'];
  subscriptions: Array<ChannelSubscription>;
};

/** PagerDuty notification channel parameters */
export type PagerDutyChannelInput = {
  name?: InputMaybe<Scalars['String']>;
  routingKey: Scalars['String'];
};

export type ParentChangeProposalComment = ChangeProposalComment & ProposalComment & {
  __typename?: 'ParentChangeProposalComment';
  createdAt: Scalars['Timestamp'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID'];
  message: Scalars['String'];
  /** true if the schemaCoordinate this comment is on doesn't exist in the diff between the most recent revision & the base sdl */
  outdated: Scalars['Boolean'];
  replies: Array<ReplyChangeProposalComment>;
  replyCount: Scalars['Int'];
  schemaCoordinate: Scalars['String'];
  /** '#@!api!@#' for api schema, '#@!supergraph!@#' for supergraph schema, subgraph otherwise */
  schemaScope: Scalars['String'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

export type ParentGeneralProposalComment = GeneralProposalComment & ProposalComment & {
  __typename?: 'ParentGeneralProposalComment';
  createdAt: Scalars['Timestamp'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID'];
  message: Scalars['String'];
  replies: Array<ReplyGeneralProposalComment>;
  replyCount: Scalars['Int'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

export type ParentProposalComment = ParentChangeProposalComment | ParentGeneralProposalComment;

/** SAML certificate information parsed from an IdP's metadata XML */
export type ParsedSamlCertInfo = {
  __typename?: 'ParsedSamlCertInfo';
  notAfter: Scalars['Timestamp'];
  notBefore: Scalars['Timestamp'];
  pem: Scalars['String'];
  subjectDN: Scalars['String'];
};

/** SAML metadata parsed from an IdP's metadata XML */
export type ParsedSamlIdpMetadata = {
  __typename?: 'ParsedSamlIdpMetadata';
  entityId: Scalars['String'];
  ssoUrl: Scalars['String'];
  verificationCerts: Array<ParsedSamlCertInfo>;
  wantsSignedRequests: Scalars['Boolean'];
};

/** The schema for a single published subgraph in Studio. */
export type PartialSchema = {
  __typename?: 'PartialSchema';
  /** Timestamp for when the partial schema was created */
  createdAt: Scalars['Timestamp'];
  /** If this sdl is currently actively composed in the gateway, this is true */
  isLive: Scalars['Boolean'];
  /** The subgraph schema document as SDL. */
  sdl: Scalars['String'];
};

/**
 * Input for registering a partial schema to an implementing service.
 * One of the fields must be specified (validated server-side).
 *
 * If a new partialSchemaSDL is passed in, this operation will store it before
 * creating the association.
 *
 * If both the sdl and hash are specified, an error will be thrown if the provided
 * hash doesn't match our hash of the sdl contents. If the sdl field is specified,
 * the hash does not need to be and will be computed server-side.
 */
export type PartialSchemaInput = {
  /**
   * Hash of the partial schema to associate; error is thrown if only the hash is
   * specified and the hash has not been seen before
   */
  hash?: InputMaybe<Scalars['String']>;
  /**
   * Contents of the partial schema in SDL syntax, but may reference types
   * that aren't defined in this document
   */
  sdl?: InputMaybe<Scalars['String']>;
};

export type Permission = {
  __typename?: 'Permission';
  csAdmin?: Maybe<Scalars['String']>;
  sudo: Scalars['Boolean'];
};

/** An error that's returned when the current user doesn't have sufficient permissions to perform an action. */
export type PermissionError = Error & {
  __typename?: 'PermissionError';
  /** The error message. */
  message: Scalars['String'];
};

/** Information about the act of publishing operations to the list */
export type PersistedQueriesPublish = {
  __typename?: 'PersistedQueriesPublish';
  operationCounts: PersistedQueriesPublishOperationCounts;
  publishedAt: Scalars['Timestamp'];
};

export type PersistedQueriesPublishOperationCounts = {
  __typename?: 'PersistedQueriesPublishOperationCounts';
  /** The number of new operations added to the list by this publish. */
  added: Scalars['Int'];
  /** The number of operations included in this publish whose metadata and body were unchanged from the previous list revision. */
  identical: Scalars['Int'];
  /** The number of operations removed from the list by this publish. */
  removed: Scalars['Int'];
  /** The number of operations in this list that were not mentioned by this publish. */
  unaffected: Scalars['Int'];
  /** The number of operations whose metadata or body were changed by this publish. */
  updated: Scalars['Int'];
};

export type PersistedQuery = {
  __typename?: 'PersistedQuery';
  body: Scalars['GraphQLDocument'];
  firstPublishedAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  lastPublishedAt: Scalars['Timestamp'];
  name: Scalars['String'];
  type: OperationType;
};

export type PersistedQueryConnection = {
  __typename?: 'PersistedQueryConnection';
  edges: Array<PersistedQueryEdge>;
  pageInfo: PageInfo;
};

export type PersistedQueryEdge = {
  __typename?: 'PersistedQueryEdge';
  cursor: Scalars['String'];
  node: PersistedQuery;
};

/** Operations to be published to the Persisted Query List. */
export type PersistedQueryInput = {
  /** The GraphQL document for this operation, including all necessary fragment definitions. */
  body: Scalars['GraphQLDocument'];
  /** An opaque identifier for this operation. This should map uniquely to an operation body; editing the body should generally result in a new ID. Apollo's tools generally use the lowercase hex SHA256 of the operation body. */
  id: Scalars['ID'];
  /** A name for the operation. Typically this is the name of the actual GraphQL operation in the body. This does not need to be unique within a Persisted Query List; as a client project evolves and its operations change, multiple operations with the same name (but different body and id) can be published. */
  name: Scalars['String'];
  /** The operation's type. */
  type: OperationType;
};

/** TODO */
export type PersistedQueryList = {
  __typename?: 'PersistedQueryList';
  builds: PersistedQueryListBuildConnection;
  createdAt: Scalars['Timestamp'];
  createdBy?: Maybe<User>;
  currentBuild: PersistedQueryListBuild;
  description: Scalars['String'];
  graph: Service;
  /** The immutable ID for this Persisted Query List. */
  id: Scalars['ID'];
  lastUpdatedAt: Scalars['Timestamp'];
  /** All variants linked to this Persisted Query List, if any. */
  linkedVariants: Array<GraphVariant>;
  /** The list's name; can be changed and does not need to be unique. */
  name: Scalars['String'];
  operation?: Maybe<PersistedQuery>;
  operations: PersistedQueryConnection;
};


/** TODO */
export type PersistedQueryListbuildsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** TODO */
export type PersistedQueryListoperationArgs = {
  id: Scalars['ID'];
};


/** TODO */
export type PersistedQueryListoperationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Information about a particular revision of the list, as produced by a particular publish. */
export type PersistedQueryListBuild = {
  __typename?: 'PersistedQueryListBuild';
  /** A unique ID for this build revision; primarily useful as a client cache ID. */
  id: Scalars['String'];
  /** The persisted query list that this build built. */
  list: PersistedQueryList;
  /** The chunks that made up this build. We do not commit to keeping the full contents of older revisions indefinitely, so this may be null for suitably old revisions. */
  manifestChunks?: Maybe<Array<PersistedQueryListManifestChunk>>;
  /** Information about the publish operation that created this build. */
  publish: PersistedQueriesPublish;
  /** The revision of this Persisted Query List. Revision 0 is the initial empty list; each publish increments the revision by 1. */
  revision: Scalars['Int'];
  /** The total number of operations in the list after this build. Compare to PersistedQueriesPublish.operationCounts. */
  totalOperationsInList: Scalars['Int'];
};

export type PersistedQueryListBuildConnection = {
  __typename?: 'PersistedQueryListBuildConnection';
  edges: Array<PersistedQueryListBuildEdge>;
  pageInfo: PageInfo;
};

export type PersistedQueryListBuildEdge = {
  __typename?: 'PersistedQueryListBuildEdge';
  cursor: Scalars['String'];
  node: PersistedQueryListBuild;
};

export type PersistedQueryListManifestChunk = {
  __typename?: 'PersistedQueryListManifestChunk';
  id: Scalars['ID'];
  json: Scalars['String'];
  list: PersistedQueryList;
};

export type PersistedQueryListMutation = {
  __typename?: 'PersistedQueryListMutation';
  delete: DeletePersistedQueryListResultOrError;
  id: Scalars['ID'];
  /** Updates this Persisted Query List by publishing a set of operations and removing other operations. Operations not mentioned remain in the list unchanged. */
  publishOperations: PublishOperationsResultOrError;
  updateMetadata: UpdatePersistedQueryListMetadataResultOrError;
};


export type PersistedQueryListMutationpublishOperationsArgs = {
  allowOverwrittenOperations?: InputMaybe<Scalars['Boolean']>;
  operations?: InputMaybe<Array<PersistedQueryInput>>;
  removeOperations?: InputMaybe<Array<Scalars['ID']>>;
};


export type PersistedQueryListMutationupdateMetadataArgs = {
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

/** An error related to an organization's Apollo Studio plan. */
export type PlanError = {
  __typename?: 'PlanError';
  /** The error message. */
  message: Scalars['String'];
};

/** GraphQL representation of an AWS private subgraph */
export type PrivateSubgraph = {
  __typename?: 'PrivateSubgraph';
  /** The cloud provider where the subgraph is hosted */
  cloudProvider: CloudProvider;
  /** The domain URL of the private subgraph */
  domainUrl?: Maybe<Scalars['String']>;
  /** The name of the subgraph, if set */
  name?: Maybe<Scalars['String']>;
  /** The private subgraph's region */
  region: RegionDescription;
  /** The status of the resource share */
  status: PrivateSubgraphShareStatus;
};

export type PrivateSubgraphMutation = {
  __typename?: 'PrivateSubgraphMutation';
  /** Synchronize private subgraphs to your Apollo account */
  sync: Array<PrivateSubgraph>;
};


export type PrivateSubgraphMutationsyncArgs = {
  input: SyncPrivateSubgraphsInput;
};

/** The status of an association between a private subgraph and your Apollo account */
export enum PrivateSubgraphShareStatus {
  /** The private subgraph is connected to the Apollo service network */
  CONNECTED = 'CONNECTED',
  /** The private subgraph is disconnected to the Apollo service network */
  DISCONNECTED = 'DISCONNECTED',
  /** The private subgraph's connection to the Apollo service network has errored */
  ERRORED = 'ERRORED',
  /** The private subgraph's connection is pending */
  PENDING = 'PENDING',
  /** The private subgraph's disconnection is pending */
  PENDING_DISCONNECTION = 'PENDING_DISCONNECTION',
  /** The current state of the association is unknown */
  UNKNOWN = 'UNKNOWN'
}

export type PromoteSchemaError = {
  __typename?: 'PromoteSchemaError';
  code: PromoteSchemaErrorCode;
  message: Scalars['String'];
};

export enum PromoteSchemaErrorCode {
  CANNOT_PROMOTE_SCHEMA_FOR_FEDERATED_GRAPH = 'CANNOT_PROMOTE_SCHEMA_FOR_FEDERATED_GRAPH'
}

export type PromoteSchemaResponse = {
  __typename?: 'PromoteSchemaResponse';
  code: PromoteSchemaResponseCode;
  tag: SchemaTag;
};

export enum PromoteSchemaResponseCode {
  NO_CHANGES_DETECTED = 'NO_CHANGES_DETECTED',
  PROMOTION_SUCCESS = 'PROMOTION_SUCCESS'
}

export type PromoteSchemaResponseOrError = PromoteSchemaError | PromoteSchemaResponse;

export type Proposal = {
  __typename?: 'Proposal';
  activities: ProposalActivityConnection;
  /** The variant this Proposal is under the hood. */
  backingVariant: GraphVariant;
  /** Can the current user can edit THIS proposal, either by authorship or role level */
  canEditProposal: Scalars['Boolean'];
  comment?: Maybe<ProposalCommentResult>;
  createdAt: Scalars['Timestamp'];
  /**
   * null if user is deleted, or if user removed from org
   * and others in the org no longer have access to this user's info
   */
  createdBy?: Maybe<Identity>;
  /** The description of this Proposal. */
  description: Scalars['String'];
  descriptionUpdatedAt?: Maybe<Scalars['Timestamp']>;
  descriptionUpdatedBy?: Maybe<Identity>;
  displayName: Scalars['String'];
  id: Scalars['ID'];
  implementedChanges: Array<ProposalImplementedChange>;
  /** True if only some of the changes in this proposal are currently published to the implementation variant */
  isPartiallyImplemented: Scalars['Boolean'];
  latestRevision: ProposalRevision;
  parentComments: Array<ParentProposalComment>;
  rebaseConflicts?: Maybe<RebaseConflictResult>;
  /**  null if user deleted or removed from org */
  requestedReviewers: Array<Maybe<ProposalRequestedReviewer>>;
  reviews: Array<ProposalReview>;
  /** The variant this Proposal was cloned/sourced from. */
  sourceVariant: GraphVariant;
  status: ProposalStatus;
  updatedAt: Scalars['Timestamp'];
  updatedBy?: Maybe<Identity>;
};


export type ProposalactivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProposalcommentArgs = {
  id: Scalars['ID'];
};


export type ProposalparentCommentsArgs = {
  filter?: InputMaybe<CommentFilter>;
};

export type ProposalActivity = {
  __typename?: 'ProposalActivity';
  activity?: Maybe<ProposalActivityAction>;
  createdAt: Scalars['Timestamp'];
  createdBy?: Maybe<Identity>;
  id: Scalars['ID'];
  target?: Maybe<ProposalActivityTarget>;
};

export enum ProposalActivityAction {
  /** When the system changes a Proposal's status back to OPEN from APPROVED when approvals drop below min approvals. */
  APPROVAL_WITHDRAWN = 'APPROVAL_WITHDRAWN',
  /** When a user manually sets a Proposal to Close */
  CLOSE_PROPOSAL = 'CLOSE_PROPOSAL',
  /** When a Comment is added to a Proposal. */
  COMMENT_ADDED = 'COMMENT_ADDED',
  /** When a subgraph in a Proposal is deleted. */
  DELETE_SUBGRAPH = 'DELETE_SUBGRAPH',
  /** When a diff in a Proposal publish is found to already be in the Implementation target variant that fully implements the Proposal. Status of the Proposal will change to IMPLEMENTED. */
  FULLY_IMPLEMENTED_PROPOSAL_ORIGIN = 'FULLY_IMPLEMENTED_PROPOSAL_ORIGIN',
  /**  When a diff in an Implementation variant publish is found in a Proposal that fully implements the Proposal. Status of the Proposal will change to IMPLEMENTED. */
  FULLY_IMPLEMENTED_VARIANT_ORIGIN = 'FULLY_IMPLEMENTED_VARIANT_ORIGIN',
  /** When the system changes a Proposal's status to APPROVED when the min approvals have been met. */
  MET_MIN_APPROVALS_PROPOSAL = 'MET_MIN_APPROVALS_PROPOSAL',
  /** When a user manually sets a Proposal to Open */
  OPEN_PROPOSAL = 'OPEN_PROPOSAL',
  /** When a diff in a Proposal publish is found to already be in the Implementation target variant that partially implements the Proposal. Does not change the status of the Proposal, but isPartiallyImplemented will return true. */
  PARTIALLY_IMPLEMENTED_PROPOSAL_ORIGIN = 'PARTIALLY_IMPLEMENTED_PROPOSAL_ORIGIN',
  /** When a diff in an Implementation variant publish is found in a Proposal that partially implements the Proposal. Does not change the status of the Proposal, but isPartiallyImplemented will return true. */
  PARTIALLY_IMPLEMENTED_VARIANT_ORIGIN = 'PARTIALLY_IMPLEMENTED_VARIANT_ORIGIN',
  /** When a new revision is published to subgraphs in a Proposal. */
  PUBLISH_SUBGRAPHS = 'PUBLISH_SUBGRAPHS',
  /** When a Proposal is moved to DRAFT from another status not on creation. */
  RETURN_TO_DRAFT_PROPOSAL = 'RETURN_TO_DRAFT_PROPOSAL',
  /** When a Review is added to a Proposal. */
  REVIEW_ADDED = 'REVIEW_ADDED'
}

export type ProposalActivityConnection = {
  __typename?: 'ProposalActivityConnection';
  edges?: Maybe<Array<ProposalActivityEdge>>;
  nodes: Array<ProposalActivity>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ProposalActivityEdge = {
  __typename?: 'ProposalActivityEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  node?: Maybe<ProposalActivity>;
};

export type ProposalActivityTarget = ParentChangeProposalComment | ParentGeneralProposalComment | Proposal | ProposalFullImplementationProposalOrigin | ProposalFullImplementationVariantOrigin | ProposalPartialImplementationProposalOrigin | ProposalPartialImplementationVariantOrigin | ProposalReview | ProposalRevision;

export enum ProposalChangeMismatchSeverity {
  ERROR = 'ERROR',
  OFF = 'OFF',
  WARN = 'WARN'
}

export type ProposalComment = {
  createdAt: Scalars['Timestamp'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID'];
  message: Scalars['String'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

export type ProposalCommentResult = NotFoundError | ParentChangeProposalComment | ParentGeneralProposalComment | ReplyChangeProposalComment | ReplyGeneralProposalComment;

export enum ProposalCoverage {
  FULL = 'FULL',
  NONE = 'NONE',
  OVERRIDDEN = 'OVERRIDDEN',
  PARTIAL = 'PARTIAL',
  PENDING = 'PENDING'
}

export type ProposalFullImplementationProposalOrigin = ProposalImplementation & {
  __typename?: 'ProposalFullImplementationProposalOrigin';
  /** the time this Proposal became implemented in the implementation target variant. */
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  /** the diff that was matched between the Proposal and the implementation target variant. TODO to deserialize this back into a DiffItem NEBULA-2726 */
  jsonDiff: Array<Scalars['String']>;
  /** Revision containing a diff that fully implements this Proposal in the implementation target variant. */
  revision: ProposalRevision;
  /** the target variant this Proposal became implemented in. */
  variant: GraphVariant;
};

export type ProposalFullImplementationVariantOrigin = ProposalImplementation & {
  __typename?: 'ProposalFullImplementationVariantOrigin';
  /** the time this Proposal became implemented in the implementation target variant. */
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  /** the diff that was matched between the Proposal and the implementation target variant. TODO to deserialize this back into a DiffItem NEBULA-2726 */
  jsonDiff: Array<Scalars['String']>;
  /** launch containing a diff that fully implements this Proposal in the implementation target variant. null if user does not have access to launches */
  launch?: Maybe<Launch>;
  /** the target variant this Proposal became implemented in. */
  variant: GraphVariant;
};

export type ProposalImplementation = {
  /** the time this Proposal became implemented in the implementation target variant. */
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  /** the diff that was matched between the Proposal and the implementation target variant */
  jsonDiff: Array<Scalars['String']>;
  /** the target variant this Proposal became implemented in. */
  variant: GraphVariant;
};

export type ProposalImplementedChange = {
  __typename?: 'ProposalImplementedChange';
  diffItem: FlatDiffItem;
  launchId: Scalars['ID'];
  subgraph: Scalars['String'];
};

/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutation = {
  __typename?: 'ProposalMutation';
  addComment: AddCommentResult;
  deleteComment: DeleteCommentResult;
  /** Delete a subgraph from this proposal. This will write the summary to proposals, record the most up to date diff, and call registry's removeImplementingServiceAndTriggerComposition. If composition is successful, this will update running routers. */
  deleteSubgraph: DeleteProposalSubgraphResult;
  editComment: EditCommentResult;
  /** The GraphOS Schema Proposal being modified by this mutation. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
  proposal?: Maybe<Proposal>;
  /** This mutation creates a new revision of a proposal by publishing multiple subgraphs, saving the summary and recording a diff. If composition is successful, this will update running routers. See the documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals/creation/#save-revisions */
  publishSubgraphs: PublishProposalSubgraphResult;
  /** If a check workflow is not found for a revision, it attempts to create one. If there is a check workflow present, it re-runs the check and associates the new check to the provided revision. */
  reRunCheckForRevision: ReRunCheckForRevisionResult;
  /** Removes all requested reviewers and their reviews that are not part of the new set of default reviewers. Adds any new default reviewers to the list of requested reviewers for this proposal. */
  replaceReviewersWithDefaultReviewers: ReplaceReviewersWithDefaultReviewersResult;
  /** Updates the description of this Proposal variant. Returns ValidationError if description exceeds max length of 10k characters. */
  updateDescription: UpdateProposalResult;
  /** Update the title of this proposal. */
  updateDisplayName: UpdateProposalResult;
  /** Update the list of requested reviewers for this proposal. */
  updateRequestedReviewers: UpdateRequestedReviewersResult;
  updateStatus: UpdateProposalResult;
  updateUpdatedByInfo: UpdateProposalResult;
  upsertReview: UpsertReviewResult;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationaddCommentArgs = {
  input: AddCommentInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationdeleteCommentArgs = {
  input: DeleteCommentInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationdeleteSubgraphArgs = {
  input: DeleteProposalSubgraphInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationeditCommentArgs = {
  input: EditCommentInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationpublishSubgraphsArgs = {
  input: PublishProposalSubgraphsInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationreRunCheckForRevisionArgs = {
  input: ReRunCheckForRevisionInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationupdateDescriptionArgs = {
  input: UpdateDescriptionInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationupdateDisplayNameArgs = {
  displayName: Scalars['String'];
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationupdateRequestedReviewersArgs = {
  input: UpdateRequestedReviewersInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationupdateStatusArgs = {
  status: ProposalStatus;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationupdateUpdatedByInfoArgs = {
  timestamp: Scalars['Timestamp'];
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationupsertReviewArgs = {
  input: UpsertReviewInput;
};

export type ProposalMutationResult = NotFoundError | PermissionError | ProposalMutation | ValidationError;

export type ProposalPartialImplementationProposalOrigin = ProposalImplementation & {
  __typename?: 'ProposalPartialImplementationProposalOrigin';
  /** the time this Proposal became partially implemented in the implementation target variant. */
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  /** the diff that was matched between the Proposal and the implementation target variant. TODO to deserialize this back into a DiffItem NEBULA-2726 */
  jsonDiff: Array<Scalars['String']>;
  /** Revision containing a diff that partially implements this Proposal in the implementation target variant. */
  revision: ProposalRevision;
  /** the target variant this Proposal became partially implemented in. */
  variant: GraphVariant;
};

export type ProposalPartialImplementationVariantOrigin = ProposalImplementation & {
  __typename?: 'ProposalPartialImplementationVariantOrigin';
  /** the time this Proposal became partially implemented in the implementation target variant. */
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  /** the diff that was matched between the Proposal and the implementation target variant. TODO to deserialize this back into a DiffItem NEBULA-2726 */
  jsonDiff: Array<Scalars['String']>;
  /** launch containing a diff that partially implements this Proposal in the implementation target variant. null if user does not have access to launches */
  launch?: Maybe<Launch>;
  /** the target variant this Proposal became partially implemented in. */
  variant: GraphVariant;
};

export type ProposalRequestedReviewer = {
  __typename?: 'ProposalRequestedReviewer';
  currentReview?: Maybe<ProposalReview>;
  user?: Maybe<Identity>;
};

export type ProposalReview = {
  __typename?: 'ProposalReview';
  comment?: Maybe<ReviewProposalComment>;
  createdAt: Scalars['Timestamp'];
  createdBy?: Maybe<Identity>;
  decision: ReviewDecision;
  isDismissed: Scalars['Boolean'];
  updatedAt?: Maybe<Scalars['Timestamp']>;
  updatedBy?: Maybe<Identity>;
};

export type ProposalRevision = {
  __typename?: 'ProposalRevision';
  /** On publish, checks are triggered on a proposal automatically. However, if an error occurred triggering a check on publish, we skip attempting the check to avoid blocking the publish from succeeding. This is the only case this field would be null. */
  checkWorkflow?: Maybe<CheckWorkflow>;
  createdAt: Scalars['Timestamp'];
  createdBy?: Maybe<Identity>;
  id: Scalars['ID'];
  launch?: Maybe<Launch>;
  /** null if this is the first revision */
  previousRevision?: Maybe<ProposalRevision>;
  summary: Scalars['String'];
};

export type ProposalRoles = {
  __typename?: 'ProposalRoles';
  create: UserPermission;
  edit: UserPermission;
};

export enum ProposalStatus {
  APPROVED = 'APPROVED',
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT',
  IMPLEMENTED = 'IMPLEMENTED',
  OPEN = 'OPEN'
}

export type ProposalVariantCreationErrors = {
  __typename?: 'ProposalVariantCreationErrors';
  /** A list of all errors that occurred when attempting to create a proposal variant. */
  errorMessages: Array<Scalars['String']>;
};

export type ProposalVariantCreationResult = GraphVariant | ProposalVariantCreationErrors;

/** Filtering options for graph connections. */
export type ProposalVariantsFilter = {
  /** Only include proposals that were created with these variants as a base. */
  sourceVariants?: InputMaybe<Array<Scalars['String']>>;
  /** Only include proposals of a certain status. */
  status?: InputMaybe<Array<ProposalStatus>>;
  /** Only include proposals that have updated these subgraph names */
  subgraphs?: InputMaybe<Array<Scalars['String']>>;
};

/** Proposal variants, limited & offset based on Service.proposalVariants & the total count */
export type ProposalVariantsResult = {
  __typename?: 'ProposalVariantsResult';
  /** The total number of proposal variants on this graph */
  totalCount: Scalars['Int'];
  variants: Array<GraphVariant>;
};

export type ProposalsCheckTask = CheckWorkflowTask & {
  __typename?: 'ProposalsCheckTask';
  completedAt?: Maybe<Scalars['Timestamp']>;
  createdAt: Scalars['Timestamp'];
  /** The results of this proposal check were overridden */
  didOverrideProposalsCheckTask: Scalars['Boolean'];
  /** Diff items in this Check task. */
  diffs: Array<ProposalsCheckTaskDiff>;
  graphID: Scalars['ID'];
  id: Scalars['ID'];
  /** Indicates the level of coverage a check's changeset is in approved Proposals. PENDING while Check is still running. */
  proposalCoverage: ProposalCoverage;
  /** Proposals with their state at the time the check was run associated to this check task. */
  relatedProposalResults: Array<RelatedProposalResult>;
  /** @deprecated use relatedProposalResults instead */
  relatedProposals: Array<Proposal>;
  /** The configured severity at the time the check was run. If the check failed, this is the severity that should be shown. While this Check is PENDING defaults to Service's severityLevel. */
  severityLevel: ProposalChangeMismatchSeverity;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']>;
  workflow: CheckWorkflow;
};

/** A diff item in this Check Task and their related Proposals. */
export type ProposalsCheckTaskDiff = {
  __typename?: 'ProposalsCheckTaskDiff';
  /** A diff item in this Check Task. */
  diffItem: FlatDiffItem;
  /** If this diff item is associated with an approved Proposal. */
  hasApprovedProposal: Scalars['Boolean'];
  /** Proposals associated with this diff. */
  relatedProposalResults: Array<RelatedProposalResult>;
  /** The subgraph this diff belongs to. */
  subgraph: Scalars['String'];
};

export type ProposalsMustBeApprovedByADefaultReviewerResult = PermissionError | Service | ValidationError;

export type ProposedBuildInputChanges = ProposedCompositionBuildInputChanges | ProposedFilterBuildInputChanges;

export type ProposedCompositionBuildInputChanges = {
  __typename?: 'ProposedCompositionBuildInputChanges';
  /** The proposed new build pipeline track, or null if no such change was proposed. */
  buildPipelineTrackChange?: Maybe<BuildPipelineTrack>;
  /** Any proposed upserts to subgraphs, or the empty list if no such changes were proposed. */
  subgraphUpserts: Array<ProposedCompositionBuildInputSubgraphUpsert>;
};

export type ProposedCompositionBuildInputSubgraphUpsert = {
  __typename?: 'ProposedCompositionBuildInputSubgraphUpsert';
  /** The name of the subgraph changed in this subgraph upsert. */
  name: Scalars['String'];
  /** The SHA-256 of the schema document in this subgraph upsert. */
  schemaHash?: Maybe<Scalars['SHA256']>;
};

export type ProposedFilterBuildInputChanges = {
  __typename?: 'ProposedFilterBuildInputChanges';
  /** The proposed new build pipeline track, or null if no such change was proposed. */
  buildPipelineTrackChange?: Maybe<BuildPipelineTrack>;
  /** Any proposed additions to exclude filters, or the empty list if no such changes were proposed. */
  excludeAdditions: Array<Scalars['String']>;
  /** Any proposed removals to exclude filters, or the empty list if no such changes were proposed. */
  excludeRemovals: Array<Scalars['String']>;
  /** The proposed value for whether to hide unreachable schema elements, or null if no such change was proposed. */
  hideUnreachableTypesChange?: Maybe<Scalars['Boolean']>;
  /** Any proposed additions to include filters, or the empty list if no such changes were proposed. */
  includeAdditions: Array<Scalars['String']>;
  /** Any proposed removals to include filters, or the empty list if no such changes were proposed. */
  includeRemovals: Array<Scalars['String']>;
  /** The proposed new build pipeline track, or null if no such change was proposed. */
  supergraphSchemaHashChange?: Maybe<Scalars['SHA256']>;
};

export type Protobuf = {
  __typename?: 'Protobuf';
  json: Scalars['String'];
  object: Scalars['Object'];
  raw: Scalars['Blob'];
  text: Scalars['String'];
};

/** The result of a successful call to PersistedQueryListMutation.publishOperations. */
export type PublishOperationsResult = {
  __typename?: 'PublishOperationsResult';
  /** The build created by this publish operation. */
  build: PersistedQueryListBuild;
  /** Returns `true` if no changes were made by this publish (and no new revision was created). Otherwise, returns `false`. */
  unchanged: Scalars['Boolean'];
};

/** The interface returned by PersistedQueryListMutation.publishOperations. */
export type PublishOperationsResultOrError = CannotModifyOperationBodyError | PermissionError | PublishOperationsResult;

export type PublishProposalSubgraphResult = NotFoundError | PermissionError | Proposal | SchemaValidationError | ValidationError;

export type PublishProposalSubgraphsInput = {
  gitContext?: InputMaybe<GitContextInput>;
  previousLaunchId: Scalars['ID'];
  revision: Scalars['String'];
  subgraphInputs: Array<PublishSubgraphsSubgraphInput>;
  summary: Scalars['String'];
};

/** The result attempting to publish subgraphs with async build. */
export type PublishSubgraphsAsyncBuildResult = {
  __typename?: 'PublishSubgraphsAsyncBuildResult';
  /** The Launch result part of this subgraph publish. */
  launch?: Maybe<Launch>;
  /** Human-readable text describing the launch result of the subgraph publish. */
  launchCliCopy?: Maybe<Scalars['String']>;
  /** The URL of the Studio page for this update's associated launch, if available. */
  launchUrl?: Maybe<Scalars['String']>;
};

export type PublishSubgraphsSubgraphInput = {
  activePartialSchema: PartialSchemaInput;
  name: Scalars['String'];
  url?: InputMaybe<Scalars['String']>;
};

export type PushMarketoLeadInput = {
  /** Clearbit enriched LinkedIn URL */
  Clearbit_LinkedIn_URL__c?: InputMaybe<Scalars['String']>;
  /** Company domain */
  Company_Domain__c?: InputMaybe<Scalars['String']>;
  /** GDPR Explicit Opt in */
  Explicit_Opt_in__c?: InputMaybe<Scalars['Boolean']>;
  /** Google Click ID */
  Google_Click_ID__c?: InputMaybe<Scalars['String']>;
  /** GA Client ID */
  Google_User_ID__c?: InputMaybe<Scalars['String']>;
  /** GraphQL Production Stage */
  GraphQL_Production_Stage__c?: InputMaybe<Scalars['String']>;
  /** Job Function */
  Job_Function__c?: InputMaybe<Scalars['String']>;
  /** Lead Message */
  Lead_Message__c?: InputMaybe<Scalars['String']>;
  /** Lead Source Detail */
  Lead_Source_Detail__c?: InputMaybe<Scalars['String']>;
  /** Lead Source Most Recent Detail */
  Lead_Source_Most_Recent_Detail__c?: InputMaybe<Scalars['String']>;
  /** Lead Source Most Recent */
  Lead_Source_Most_Recent__c?: InputMaybe<Scalars['String']>;
  /** Referrer */
  Referrer__c?: InputMaybe<Scalars['String']>;
  /** Studio User Id */
  Studio_User_Id__c?: InputMaybe<Scalars['String']>;
  /** UTM Campaign First Touch */
  UTM_Campaign_First_Touch__c?: InputMaybe<Scalars['String']>;
  /** UTM Campaign */
  UTM_Campaign__c?: InputMaybe<Scalars['String']>;
  /** UTM ICID */
  UTM_ICID__c?: InputMaybe<Scalars['String']>;
  /** UTM Medium First Touch */
  UTM_Medium_First_Touch__c?: InputMaybe<Scalars['String']>;
  /** UTM Medium */
  UTM_Medium__c?: InputMaybe<Scalars['String']>;
  /** UTM Source First Touch */
  UTM_Source_First_Touch__c?: InputMaybe<Scalars['String']>;
  /** UTM Source */
  UTM_Source__c?: InputMaybe<Scalars['String']>;
  /** UTM Term */
  UTM_Term__c?: InputMaybe<Scalars['String']>;
  /** Company name */
  company?: InputMaybe<Scalars['String']>;
  /** Country */
  country?: InputMaybe<Scalars['String']>;
  /** Email address */
  email?: InputMaybe<Scalars['String']>;
  /** First name */
  firstName?: InputMaybe<Scalars['String']>;
  /** Last name */
  lastName?: InputMaybe<Scalars['String']>;
  /** Phone number */
  phone?: InputMaybe<Scalars['String']>;
};

/** Queries defined by this subgraph */
export type Query = {
  __typename?: 'Query';
  /** Account by ID */
  account?: Maybe<Account>;
  /** Retrieve account by billing provider identifier */
  accountByBillingCode?: Maybe<Account>;
  /** Retrieve account by internal id */
  accountByInternalID?: Maybe<Account>;
  /** Whether an account ID is available for mutation{newAccount(id:)} */
  accountIDAvailable: Scalars['Boolean'];
  /** All accounts */
  allAccounts?: Maybe<Array<Account>>;
  /** All accounts on team billable plans with active subscriptions */
  allActiveTeamBillingAccounts?: Maybe<Array<Account>>;
  /** All available billing plan capabilities */
  allBillingCapabilities: Array<BillingCapability>;
  /** All available billing plan limits */
  allBillingLimits: Array<BillingLimit>;
  /** All available plans */
  allBillingPlans: Array<BillingPlan>;
  allPublicVariants?: Maybe<Array<GraphVariant>>;
  /** All auto-renewing team accounts on active annual plans */
  allRenewingNonEnterpriseAnnualAccounts?: Maybe<Array<Account>>;
  allSelfHostedCommercialRuntimeEntitlements: Array<Maybe<RouterEntitlement>>;
  /** All services */
  allServices?: Maybe<Array<Service>>;
  /** All timezones with their offsets from UTC */
  allTimezoneOffsets: Array<TimezoneOffset>;
  /** All users */
  allUsers?: Maybe<Array<User>>;
  auditLog: Array<Maybe<AuditLog>>;
  billingAdmin?: Maybe<BillingAdminQuery>;
  /** Retrieves all past and current subscriptions for an account, even if the account has been deleted */
  billingSubscriptionHistory: Array<Maybe<BillingSubscription>>;
  billingTier?: Maybe<BillingTier>;
  /** If this is true, the user is an Apollo administrator who can ignore restrictions based purely on billing plan. */
  canBypassPlanRestrictions: Scalars['Boolean'];
  /** Cloud queries */
  cloud: Cloud;
  /** Escaped JSON string of the public key used for verifying entitlement JWTs */
  commercialRuntimePublicKey: Scalars['String'];
  csCommunicationChannel?: Maybe<CommunicationChannel>;
  csCommunicationChannels: Array<Maybe<CommunicationChannel>>;
  customerOrg?: Maybe<CustomerOrg>;
  customerOrgs: Array<Maybe<CustomerOrg>>;
  diffSchemas: Array<Change>;
  /** Get the unsubscribe settings for a given email. */
  emailPreferences?: Maybe<EmailPreferences>;
  /** Past and current enterprise trial accounts */
  enterpriseTrialAccounts?: Maybe<Array<Account>>;
  /** Returns the root URL of the Apollo Studio frontend. */
  frontendUrlRoot: Scalars['String'];
  getAdminUsers: Array<AdminUser>;
  getAllMessages: Array<Maybe<Message>>;
  getMessage?: Maybe<Message>;
  getRecallLog: Array<Maybe<AuditLog>>;
  /** Returns details of the graph with the provided ID. */
  graph?: Maybe<Service>;
  /** Get status of identity subgraph */
  identitySubgraphStatus: Scalars['String'];
  internalActiveCronJobs: Array<CronJob>;
  internalAdminUsers?: Maybe<Array<InternalAdminUser>>;
  internalUnresolvedCronExecutionFailures: Array<CronExecution>;
  /** Returns details of the authenticated `User` or `Graph` executing this query. If this is an unauthenticated query (i.e., no API key is provided), this field returns null. */
  me?: Maybe<Identity>;
  myPermissions: Permission;
  odysseyCertification?: Maybe<OdysseyCertification>;
  /** Returns the [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/) for the provided ID. */
  operationCollection: OperationCollectionResult;
  operationCollectionEntries: Array<OperationCollectionEntry>;
  /** Returns details of the Studio organization with the provided ID. */
  organization?: Maybe<Account>;
  /** Look up a plan by ID */
  plan?: Maybe<BillingPlan>;
  proposal?: Maybe<Proposal>;
  /** A list of public variants that have been selected to be shown on our Graph Directory. */
  publiclyListedVariants?: Maybe<Array<GraphVariant>>;
  /** Accounts with enterprise subscriptions that have expired in the past 45 days */
  recentlyExpiredEnterpriseAccounts?: Maybe<Array<Account>>;
  /** Search all accounts */
  searchAccounts: Array<Account>;
  /** Service by ID */
  service?: Maybe<Service>;
  /** Accounts with enterprise subscriptions that will expire within the next 30 days */
  soonToExpireEnterpriseAccounts?: Maybe<Array<Account>>;
  sso: SsoQuery;
  /** Query statistics across all services. For admins only; normal users must go through AccountsStatsWindow or ServiceStatsWindow. */
  stats: StatsWindow;
  /** Get the studio settings for the current user */
  studioSettings?: Maybe<UserSettings>;
  /** Schema transformation for the Apollo platform API. Renames types. Internal to Apollo. */
  transformSchemaForPlatformApi?: Maybe<Scalars['GraphQLDocument']>;
  /** Returns details of the Apollo user with the provided ID. */
  user?: Maybe<User>;
  /** Returns details of the Apollo users with the provided IDs. */
  users?: Maybe<Array<User>>;
  /** Returns details of a Studio graph variant with the provided graph ref. A graph ref has the format `graphID@variantName` (or just `graphID` for the default variant `current`). Returns null if the graph or variant doesn't exist, or if the graph isn't accessible by the current actor. */
  variant?: Maybe<GraphVariantLookup>;
  zendeskUploadToken: Scalars['String'];
};


/** Queries defined by this subgraph */
export type QueryaccountArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QueryaccountByBillingCodeArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QueryaccountByInternalIDArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QueryaccountIDAvailableArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QueryallAccountsArgs = {
  search?: InputMaybe<Scalars['String']>;
  tier?: InputMaybe<BillingPlanTier>;
};


/** Queries defined by this subgraph */
export type QueryallServicesArgs = {
  search?: InputMaybe<Scalars['String']>;
};


/** Queries defined by this subgraph */
export type QueryallUsersArgs = {
  search?: InputMaybe<Scalars['String']>;
};


/** Queries defined by this subgraph */
export type QueryauditLogArgs = {
  messageId: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QuerybillingSubscriptionHistoryArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


/** Queries defined by this subgraph */
export type QuerybillingTierArgs = {
  tier: BillingPlanTier;
};


/** Queries defined by this subgraph */
export type QuerycsCommunicationChannelArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QuerycustomerOrgArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QuerycustomerOrgsArgs = {
  nextHash?: InputMaybe<Scalars['String']>;
};


/** Queries defined by this subgraph */
export type QuerydiffSchemasArgs = {
  baseSchema: Scalars['String'];
  nextSchema: Scalars['String'];
};


/** Queries defined by this subgraph */
export type QueryemailPreferencesArgs = {
  email: Scalars['String'];
  token: Scalars['String'];
};


/** Queries defined by this subgraph */
export type QuerygetMessageArgs = {
  messageId: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QuerygetRecallLogArgs = {
  messageId: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QuerygraphArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QueryodysseyCertificationArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QueryoperationCollectionArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QueryoperationCollectionEntriesArgs = {
  collectionEntryIds: Array<Scalars['ID']>;
};


/** Queries defined by this subgraph */
export type QueryorganizationArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QueryplanArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


/** Queries defined by this subgraph */
export type QueryproposalArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QuerysearchAccountsArgs = {
  search?: InputMaybe<Scalars['String']>;
};


/** Queries defined by this subgraph */
export type QueryserviceArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QuerystatsArgs = {
  from: Scalars['Timestamp'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']>;
};


/** Queries defined by this subgraph */
export type QuerytransformSchemaForPlatformApiArgs = {
  baseSchema: Scalars['GraphQLDocument'];
};


/** Queries defined by this subgraph */
export type QueryuserArgs = {
  id: Scalars['ID'];
};


/** Queries defined by this subgraph */
export type QueryusersArgs = {
  ids: Array<Scalars['ID']>;
};


/** Queries defined by this subgraph */
export type QueryvariantArgs = {
  ref: Scalars['ID'];
};

/** query documents to validate against */
export type QueryDocumentInput = {
  document?: InputMaybe<Scalars['String']>;
};

export type QueryPlan = {
  __typename?: 'QueryPlan';
  json: Scalars['String'];
  object: Scalars['Object'];
  text: Scalars['String'];
};

/** Columns of QueryStats. */
export enum QueryStatsColumn {
  ACCOUNT_ID = 'ACCOUNT_ID',
  CACHED_HISTOGRAM = 'CACHED_HISTOGRAM',
  CACHED_REQUESTS_COUNT = 'CACHED_REQUESTS_COUNT',
  CACHE_TTL_HISTOGRAM = 'CACHE_TTL_HISTOGRAM',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  FORBIDDEN_OPERATION_COUNT = 'FORBIDDEN_OPERATION_COUNT',
  FROM_ENGINEPROXY = 'FROM_ENGINEPROXY',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REGISTERED_OPERATION_COUNT = 'REGISTERED_OPERATION_COUNT',
  REQUESTS_WITH_ERRORS_COUNT = 'REQUESTS_WITH_ERRORS_COUNT',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP',
  UNCACHED_HISTOGRAM = 'UNCACHED_HISTOGRAM',
  UNCACHED_REQUESTS_COUNT = 'UNCACHED_REQUESTS_COUNT'
}

export type QueryStatsDimensions = {
  __typename?: 'QueryStatsDimensions';
  accountId?: Maybe<Scalars['ID']>;
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  fromEngineproxy?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  querySignatureLength?: Maybe<Scalars['Int']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in QueryStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type QueryStatsFilter = {
  /** Selects rows whose accountId dimension equals the given value if not null. To query for the null value, use {in: {accountId: [null]}} instead. */
  accountId?: InputMaybe<Scalars['ID']>;
  and?: InputMaybe<Array<QueryStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose fromEngineproxy dimension equals the given value if not null. To query for the null value, use {in: {fromEngineproxy: [null]}} instead. */
  fromEngineproxy?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<QueryStatsFilterIn>;
  not?: InputMaybe<QueryStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<QueryStatsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in QueryStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type QueryStatsFilterIn = {
  /** Selects rows whose accountId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  accountId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose fromEngineproxy dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fromEngineproxy?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type QueryStatsMetrics = {
  __typename?: 'QueryStatsMetrics';
  cacheTtlHistogram: DurationHistogram;
  cachedHistogram: DurationHistogram;
  cachedRequestsCount: Scalars['Long'];
  forbiddenOperationCount: Scalars['Long'];
  registeredOperationCount: Scalars['Long'];
  requestsWithErrorsCount: Scalars['Long'];
  totalLatencyHistogram: DurationHistogram;
  totalRequestCount: Scalars['Long'];
  uncachedHistogram: DurationHistogram;
  uncachedRequestsCount: Scalars['Long'];
};

export type QueryStatsOrderBySpec = {
  column: QueryStatsColumn;
  direction: Ordering;
};

export type QueryStatsRecord = {
  __typename?: 'QueryStatsRecord';
  /** Dimensions of QueryStats that can be grouped by. */
  groupBy: QueryStatsDimensions;
  /** Metrics of QueryStats that can be aggregated over. */
  metrics: QueryStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Query Trigger */
export type QueryTrigger = ChannelSubscription & {
  __typename?: 'QueryTrigger';
  channels: Array<Channel>;
  comparisonOperator: ComparisonOperator;
  enabled: Scalars['Boolean'];
  excludedOperationNames: Array<Scalars['String']>;
  id: Scalars['ID'];
  metric: QueryTriggerMetric;
  operationNames: Array<Scalars['String']>;
  percentile?: Maybe<Scalars['Float']>;
  scope: QueryTriggerScope;
  serviceId: Scalars['String'];
  state: QueryTriggerState;
  threshold: Scalars['Float'];
  variant?: Maybe<Scalars['String']>;
  window: QueryTriggerWindow;
};

/** Query trigger */
export type QueryTriggerInput = {
  channelIds?: InputMaybe<Array<Scalars['String']>>;
  comparisonOperator: ComparisonOperator;
  enabled?: InputMaybe<Scalars['Boolean']>;
  excludedOperationNames?: InputMaybe<Array<Scalars['String']>>;
  metric: QueryTriggerMetric;
  operationNames?: InputMaybe<Array<Scalars['String']>>;
  percentile?: InputMaybe<Scalars['Float']>;
  scope?: InputMaybe<QueryTriggerScope>;
  threshold: Scalars['Float'];
  variant?: InputMaybe<Scalars['String']>;
  window: QueryTriggerWindow;
};

export enum QueryTriggerMetric {
  /** Number of requests within the window that resulted in an error. Ignores `percentile`. */
  ERROR_COUNT = 'ERROR_COUNT',
  /** Number of error requests divided by total number of requests. Ignores `percentile`. */
  ERROR_PERCENTAGE = 'ERROR_PERCENTAGE',
  /** Number of requests within the window. Ignores `percentile`. */
  REQUEST_COUNT = 'REQUEST_COUNT',
  /** Request latency in ms. Requires `percentile`. */
  REQUEST_SERVICE_TIME = 'REQUEST_SERVICE_TIME'
}

export enum QueryTriggerScope {
  ALL = 'ALL',
  ANY = 'ANY',
  UNRECOGNIZED = 'UNRECOGNIZED'
}

/** Query trigger state */
export type QueryTriggerState = {
  __typename?: 'QueryTriggerState';
  evaluatedAt: Scalars['Timestamp'];
  lastTriggeredAt?: Maybe<Scalars['Timestamp']>;
  operations: Array<QueryTriggerStateOperation>;
  triggered: Scalars['Boolean'];
};

export type QueryTriggerStateOperation = {
  __typename?: 'QueryTriggerStateOperation';
  count: Scalars['Long'];
  operation: Scalars['String'];
  triggered: Scalars['Boolean'];
  value: Scalars['Float'];
};

export enum QueryTriggerWindow {
  FIFTEEN_MINUTES = 'FIFTEEN_MINUTES',
  FIVE_MINUTES = 'FIVE_MINUTES',
  ONE_MINUTE = 'ONE_MINUTE',
  UNRECOGNIZED = 'UNRECOGNIZED'
}

/** An error that occurs when the rate limit on this operation has been exceeded. */
export type RateLimitExceededError = {
  __typename?: 'RateLimitExceededError';
  /** The error message. */
  message: Scalars['String'];
};

export type ReRunCheckForRevisionInput = {
  revisionId: Scalars['ID'];
};

export type ReRunCheckForRevisionResult = NotFoundError | PermissionError | Proposal | ValidationError;

/** The README documentation for a graph variant, which is displayed in Studio. */
export type Readme = {
  __typename?: 'Readme';
  /** The contents of the README in plaintext. */
  content: Scalars['String'];
  /** The README's unique ID. `a15177c0-b003-4837-952a-dbfe76062eb1` for the default README */
  id: Scalars['ID'];
  /**
   * The timestamp when the README was most recently updated. `1970-01-01T00:00:00Z` for the default README
   * @deprecated Deprecated in favour of lastUpdatedTime
   */
  lastUpdatedAt: Scalars['Timestamp'];
  /** The actor that most recently updated the README (usually a `User`). `null` for the default README, or if the `User` was deleted. */
  lastUpdatedBy?: Maybe<Identity>;
  /** The timestamp when the README was most recently updated. `null` for the default README */
  lastUpdatedTime?: Maybe<Scalars['Timestamp']>;
};

/** Responsibility for an errored order */
export enum ReasonCause {
  /**
   * Could not complete an order due to internal reason
   *
   * This could be due to intermittent issues, bug in our code, etc.
   */
  INTERNAL = 'INTERNAL',
  /**
   * Could not complete an order due to invalid User input
   *
   * For example, the user provided an invalid router configuration or supergraph schema.
   */
  USER = 'USER'
}

export type RebaseConflictError = {
  __typename?: 'RebaseConflictError';
  errorMessages: Array<Scalars['String']>;
};

export type RebaseConflictResult = RebaseConflictError | SchemaValidationError;

/** Description for a Cloud Router region */
export type RegionDescription = {
  __typename?: 'RegionDescription';
  /** Region identifier */
  code: Scalars['String'];
  /** Country of the region, in ISO 3166-1 alpha-2 code */
  country: Scalars['String'];
  /** Full name of the region */
  name: Scalars['String'];
  /** Cloud Provider related to this region */
  provider: CloudProvider;
  /** State of the Region */
  state: RegionState;
};

/** Possible state of a region */
export enum RegionState {
  /**
   * Active region
   *
   * Can be used for Cloud Routers
   */
  ACTIVE = 'ACTIVE',
  /** Does not appear in the API */
  HIDDEN = 'HIDDEN',
  /**
   * Inactive region
   *
   * Cannot yet be used for Cloud Routers
   */
  INACTIVE = 'INACTIVE'
}

export type RegisterOperationsMutationResponse = {
  __typename?: 'RegisterOperationsMutationResponse';
  invalidOperations?: Maybe<Array<InvalidOperation>>;
  newOperations?: Maybe<Array<RegisteredOperation>>;
  registrationSuccess: Scalars['Boolean'];
};

export type RegisteredClientIdentityInput = {
  identifier: Scalars['String'];
  name: Scalars['String'];
  version?: InputMaybe<Scalars['String']>;
};

export type RegisteredOperation = {
  __typename?: 'RegisteredOperation';
  signature: Scalars['ID'];
};

export type RegisteredOperationInput = {
  document?: InputMaybe<Scalars['String']>;
  metadata?: InputMaybe<RegisteredOperationMetadataInput>;
  signature: Scalars['ID'];
};

export type RegisteredOperationMetadataInput = {
  /** This will be used to link existing records in Engine to a new ID. */
  engineSignature?: InputMaybe<Scalars['String']>;
};

export type RegistryStatsWindow = {
  __typename?: 'RegistryStatsWindow';
  schemaCheckStats: Array<AccountChecksStatsRecord>;
  schemaPublishStats: Array<AccountPublishesStatsRecord>;
};

export type RegistrySubscription = ChannelSubscription & {
  __typename?: 'RegistrySubscription';
  channel?: Maybe<Channel>;
  /** @deprecated Use channels list instead */
  channels: Array<Channel>;
  createdAt: Scalars['Timestamp'];
  enabled: Scalars['Boolean'];
  id: Scalars['ID'];
  lastUpdatedAt: Scalars['Timestamp'];
  options: SubscriptionOptions;
  variant?: Maybe<Scalars['String']>;
};

/** A Proposal related to a Proposal Check Task. */
export type RelatedProposalResult = {
  __typename?: 'RelatedProposalResult';
  /** The latest revision at the time the check was run, defaults to current revision if nothing found for time of the check. */
  latestRevisionAtCheck: ProposalRevision;
  /** The Proposal related to the check. State may have changed since the Check was run. */
  proposal: Proposal;
  /** The status of the Proposal at the time the check was run, defaults to current state if nothing found for time of the check. */
  statusAtCheck: ProposalStatus;
};

export type RelaunchComplete = {
  __typename?: 'RelaunchComplete';
  latestLaunch: Launch;
  updated: Scalars['Boolean'];
};

export type RelaunchError = {
  __typename?: 'RelaunchError';
  message: Scalars['String'];
};

export type RelaunchResult = RelaunchComplete | RelaunchError;

export type RemoveOperationCollectionEntryResult = OperationCollection | PermissionError;

export type RemoveOperationCollectionFromVariantResult = GraphVariant | NotFoundError | PermissionError | ValidationError;

export type ReorderOperationCollectionResult = OperationCollection | PermissionError;

export type ReplaceReviewersWithDefaultReviewersResult = PermissionError | Proposal | ValidationError;

export type ReplyChangeProposalComment = ChangeProposalComment & ProposalComment & {
  __typename?: 'ReplyChangeProposalComment';
  createdAt: Scalars['Timestamp'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID'];
  message: Scalars['String'];
  /** true if the schemaCoordinate this comment is on doesn't exist in the diff between the most recent revision & the base sdl */
  outdated: Scalars['Boolean'];
  schemaCoordinate: Scalars['String'];
  /** '#@!api!@#' for api schema, '#@!supergraph!@#' for supergraph schema, subgraph otherwise */
  schemaScope: Scalars['String'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

export type ReplyGeneralProposalComment = GeneralProposalComment & ProposalComment & {
  __typename?: 'ReplyGeneralProposalComment';
  createdAt: Scalars['Timestamp'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID'];
  message: Scalars['String'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

export type ReportSchemaError = ReportSchemaResult & {
  __typename?: 'ReportSchemaError';
  code: ReportSchemaErrorCode;
  inSeconds: Scalars['Int'];
  message: Scalars['String'];
  withCoreSchema: Scalars['Boolean'];
};

export enum ReportSchemaErrorCode {
  BOOT_ID_IS_NOT_VALID_UUID = 'BOOT_ID_IS_NOT_VALID_UUID',
  BOOT_ID_IS_REQUIRED = 'BOOT_ID_IS_REQUIRED',
  CORE_SCHEMA_HASH_IS_NOT_SCHEMA_SHA256 = 'CORE_SCHEMA_HASH_IS_NOT_SCHEMA_SHA256',
  CORE_SCHEMA_HASH_IS_REQUIRED = 'CORE_SCHEMA_HASH_IS_REQUIRED',
  CORE_SCHEMA_HASH_IS_TOO_LONG = 'CORE_SCHEMA_HASH_IS_TOO_LONG',
  EXECUTABLE_SCHEMA_ID_IS_NOT_SCHEMA_SHA256 = 'EXECUTABLE_SCHEMA_ID_IS_NOT_SCHEMA_SHA256',
  EXECUTABLE_SCHEMA_ID_IS_REQUIRED = 'EXECUTABLE_SCHEMA_ID_IS_REQUIRED',
  EXECUTABLE_SCHEMA_ID_IS_TOO_LONG = 'EXECUTABLE_SCHEMA_ID_IS_TOO_LONG',
  GRAPH_REF_INVALID_FORMAT = 'GRAPH_REF_INVALID_FORMAT',
  GRAPH_REF_IS_REQUIRED = 'GRAPH_REF_IS_REQUIRED',
  GRAPH_VARIANT_DOES_NOT_MATCH_REGEX = 'GRAPH_VARIANT_DOES_NOT_MATCH_REGEX',
  GRAPH_VARIANT_IS_REQUIRED = 'GRAPH_VARIANT_IS_REQUIRED',
  LIBRARY_VERSION_IS_TOO_LONG = 'LIBRARY_VERSION_IS_TOO_LONG',
  PLATFORM_IS_TOO_LONG = 'PLATFORM_IS_TOO_LONG',
  RUNTIME_VERSION_IS_TOO_LONG = 'RUNTIME_VERSION_IS_TOO_LONG',
  SCHEMA_IS_NOT_PARSABLE = 'SCHEMA_IS_NOT_PARSABLE',
  SCHEMA_IS_NOT_VALID = 'SCHEMA_IS_NOT_VALID',
  SERVER_ID_IS_TOO_LONG = 'SERVER_ID_IS_TOO_LONG',
  USER_VERSION_IS_TOO_LONG = 'USER_VERSION_IS_TOO_LONG'
}

export type ReportSchemaResponse = ReportSchemaResult & {
  __typename?: 'ReportSchemaResponse';
  inSeconds: Scalars['Int'];
  withCoreSchema: Scalars['Boolean'];
};

export type ReportSchemaResult = {
  inSeconds: Scalars['Int'];
  withCoreSchema: Scalars['Boolean'];
};

export type ReportServerInfoError = ReportServerInfoResult & {
  __typename?: 'ReportServerInfoError';
  code: ReportSchemaErrorCode;
  inSeconds: Scalars['Int'];
  message: Scalars['String'];
  withExecutableSchema: Scalars['Boolean'];
};

export type ReportServerInfoResponse = ReportServerInfoResult & {
  __typename?: 'ReportServerInfoResponse';
  inSeconds: Scalars['Int'];
  withExecutableSchema: Scalars['Boolean'];
};

export type ReportServerInfoResult = {
  inSeconds: Scalars['Int'];
  withExecutableSchema: Scalars['Boolean'];
};

export type RequestCountsPerGraphVariant = {
  __typename?: 'RequestCountsPerGraphVariant';
  cachedRequestsCount: Scalars['Long'];
  graphID: Scalars['String'];
  uncachedRequestsCount: Scalars['Long'];
  variant?: Maybe<Scalars['String']>;
};

export type RequesterUser = {
  __typename?: 'RequesterUser';
  email: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
};

export enum Resolution {
  R1D = 'R1D',
  R1H = 'R1H',
  R1M = 'R1M',
  R5M = 'R5M',
  R6H = 'R6H',
  R15M = 'R15M'
}

export enum ResponseHints {
  NONE = 'NONE',
  SAMPLE_RESPONSES = 'SAMPLE_RESPONSES',
  SUBGRAPHS = 'SUBGRAPHS',
  TIMINGS = 'TIMINGS',
  TRACE_TIMINGS = 'TRACE_TIMINGS'
}

export enum ReviewDecision {
  APPROVED = 'APPROVED',
  NOT_APPROVED = 'NOT_APPROVED'
}

export type ReviewProposalComment = ProposalComment & {
  __typename?: 'ReviewProposalComment';
  createdAt: Scalars['Timestamp'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID'];
  message: Scalars['String'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

export type RoleOverride = {
  __typename?: 'RoleOverride';
  /** @deprecated RoleOverride can only be queried via a Graph, so any fields here should instead be selected via the parent object. */
  graph: Service;
  lastUpdatedAt: Scalars['Timestamp'];
  role: UserPermission;
  user: User;
};

export type Router = {
  __typename?: 'Router';
  /** Order currently modifying this Cloud Router */
  currentOrder?: Maybe<Order>;
  /**
   * Custom URLs that can be used to reach the Cloud Router
   *
   * This will be null if the Cloud Router is in a deleted status or does not support custom
   * domains.
   * @deprecated use Router.endpoints instead
   */
  customDomains?: Maybe<Array<Scalars['String']>>;
  /** Set of endpoints that can be used to reach a Cloud Router */
  endpoints: RouterEndpoints;
  /**
   * Number of Graph Compute Units (GCUs) associated with this Cloud Router
   *
   * This value is not present for Cloud Routers on the `SERVERLESS` tier.
   */
  gcus?: Maybe<Scalars['Int']>;
  /** graphRef representing the Cloud Router */
  id: Scalars['ID'];
  /**
   * Cloud Router version applied for the next launch
   *
   * If this value is not null, any subsequent launch will use this version instead of the
   * current one. This can happen when a new STABLE version is available, but we could not
   * automatically update this Cloud Router, for example due to configuration issues.
   */
  nextRouterVersion?: Maybe<RouterVersion>;
  /** Retrieves a specific Order related to this Cloud Router */
  order?: Maybe<Order>;
  /** Retrieves all Orders related to this Cloud Router */
  orders: Array<Order>;
  /**
   * URL where the Cloud Router can be found
   *
   * This will be null if the Cloud Router is in a deleted status
   * @deprecated use Router.endpoints instead
   */
  routerUrl?: Maybe<Scalars['String']>;
  /** Current version of the Cloud Router */
  routerVersion: RouterVersion;
  /** Return the list of secrets for this Cloud Router with their hash values */
  secrets: Array<Secret>;
  /** Shard associated with this Cloud Router */
  shard?: Maybe<Shard>;
  /** Current status of the Cloud Router */
  status: RouterStatus;
  /**
   * Last time when the Cloud Router was updated
   *
   * If the Cloud Router was never updated, this value will be null
   */
  updatedAt?: Maybe<Scalars['NaiveDateTime']>;
};


export type RouterorderArgs = {
  orderId: Scalars['ID'];
};


export type RouterordersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

/** Router configuration input */
export type RouterConfigInput = {
  /**
   * Number of GCUs allocated for the Cloud Router
   *
   * This is ignored for serverless Cloud Routers
   */
  gcus?: InputMaybe<Scalars['Int']>;
  /** Graph composition ID, also known as launch ID */
  graphCompositionId?: InputMaybe<Scalars['String']>;
  /** Configuration for the Cloud Router */
  routerConfig?: InputMaybe<Scalars['String']>;
  /** Router version for the Cloud Router */
  routerVersion?: InputMaybe<Scalars['String']>;
};

export type RouterConfigVersion = {
  __typename?: 'RouterConfigVersion';
  /** JSON schema for validating the router configuration */
  configSchema?: Maybe<Scalars['String']>;
  /** Name of the RouterConfigVersion */
  name: Scalars['String'];
};


export type RouterConfigVersionconfigSchemaArgs = {
  tier: CloudTier;
};

/** Input to create a RouterConfigVersion */
export type RouterConfigVersionInput = {
  /** Configuration schema mapping for the RouterConfigVersion */
  configSchemas: Scalars['JSONObject'];
  /** Name of the RouterConfigVersion */
  configVersion: Scalars['String'];
};

/** Represents the possible outcomes of an addCustomDomain or removeCustomDomain mutation */
export type RouterCustomDomainResult = InternalServerError | InvalidInputErrors | RouterCustomDomainSuccess;

/** Successe branch of  an addCustomDomain or removeCustomDomain mutation */
export type RouterCustomDomainSuccess = {
  __typename?: 'RouterCustomDomainSuccess';
  customDomains: Array<Scalars['String']>;
};

/** List of endpoints for Cloud Router */
export type RouterEndpoints = {
  __typename?: 'RouterEndpoints';
  /**
   * Set of custom Cloud Router endpoints
   *
   * This is null if the cloud router is in a deleted state, or if it does not support
   * custom endpoints.
   */
  custom?: Maybe<Array<Scalars['String']>>;
  /**
   * Default Cloud Router endpoint
   *
   * This is null if the cloud router is in a deleted state, or if the default endpoint is
   * disabled.
   */
  default?: Maybe<Scalars['String']>;
};

export type RouterEntitlement = {
  __typename?: 'RouterEntitlement';
  /** The id of the account this license was generated for. */
  accountId: Scalars['String'];
  /** Which audiences this license applies to. */
  audience: Array<RouterEntitlementAudience>;
  /** Router will stop serving requests after this time if commercial features are in use. */
  haltAt?: Maybe<Scalars['Timestamp']>;
  /** RFC 8037 Ed25519 JWT signed representation of sibling fields. Restricted to internal services only. */
  jwt: Scalars['String'];
  /** Organization this license applies to. */
  subject: Scalars['String'];
  /** Router will warn users after this time if commercial features are in use. */
  warnAt?: Maybe<Scalars['Timestamp']>;
};

export enum RouterEntitlementAudience {
  /** Routers in Apollo hosted cloud. */
  CLOUD = 'CLOUD',
  /** Routers in offline environments with license files supplied from a URL or locally. */
  OFFLINE = 'OFFLINE',
  /** Routers in self-hosted environments fetching their license from uplink. */
  SELF_HOSTED = 'SELF_HOSTED'
}

/** Represents the possible outcomes of a setGcus mutation */
export type RouterGcusResult = InternalServerError | InvalidInputErrors | RouterGcusSuccess;

/** Success branch of a setGcus mutation */
export type RouterGcusSuccess = {
  __typename?: 'RouterGcusSuccess';
  order: Order;
};

export type RouterMutation = {
  __typename?: 'RouterMutation';
  /** Add a custom domain for this Cloud Router */
  addCustomDomain: RouterCustomDomainResult;
  /** Router mutations for Cloud Routers hosted on Fly */
  fly?: Maybe<FlyRouterMutation>;
  /** Pause this Cloud Router */
  pause: RouterPauseResult;
  /** Remove a custom domain for this Cloud Router */
  removeCustomDomain: RouterCustomDomainResult;
  /** Set a custom path for this Router */
  setCustomPath: RouterPathResult;
  /** Set the number of GCUs associated with this Router */
  setGcus: RouterGcusResult;
  /** Set the version used for the next update for this Cloud Router */
  setNextVersion: SetNextVersionResult;
  /** Set secrets for this Cloud Router */
  setSecrets: RouterSecretsResult;
};


export type RouterMutationaddCustomDomainArgs = {
  customDomain: Scalars['String'];
};


export type RouterMutationremoveCustomDomainArgs = {
  customDomain: Scalars['String'];
};


export type RouterMutationsetCustomPathArgs = {
  path: Scalars['String'];
};


export type RouterMutationsetGcusArgs = {
  gcus: Scalars['Int'];
};


export type RouterMutationsetNextVersionArgs = {
  version: Scalars['String'];
};


export type RouterMutationsetSecretsArgs = {
  input: RouterSecretsInput;
};

/** Represents the possible outcomes of a setCustomPath mutation */
export type RouterPathResult = InternalServerError | InvalidInputErrors | RouterPathSuccess;

/** Success branch of a setCustomPath mutation */
export type RouterPathSuccess = {
  __typename?: 'RouterPathSuccess';
  order: Order;
};

/** Represents the possible outcomes of a pause mutation */
export type RouterPauseResult = InternalServerError | InvalidInputErrors | RouterPauseSuccess;

/** Success branch of a pause mutation */
export type RouterPauseSuccess = {
  __typename?: 'RouterPauseSuccess';
  success: Scalars['Boolean'];
};

/** User input for a RouterSecrets mutation */
export type RouterSecretsInput = {
  /** Secrets to create or update */
  secrets?: InputMaybe<Array<SecretInput>>;
  /** Secrets to remove */
  unsetSecrets?: InputMaybe<Array<Scalars['String']>>;
};

/** Represents the possible outcomes of a RouterSecrets mutation */
export type RouterSecretsResult = InternalServerError | InvalidInputErrors | RouterSecretsSuccess;

/** Success branch of a RouterSecrets mutation. */
export type RouterSecretsSuccess = {
  __typename?: 'RouterSecretsSuccess';
  order: Order;
  secrets: Array<Secret>;
};

/** Current status of Cloud Routers */
export enum RouterStatus {
  /** Cloud Router is not yet provisioned */
  CREATING = 'CREATING',
  /** Router has been deleted */
  DELETED = 'DELETED',
  /**
   * Cloud Router is running, but currently being deleted
   *
   * This is the only mutation state that doesn't support rollback. If we fail to
   * delete a Router, the workflows are configured to stop and keep the router into
   * the Deleting status.
   */
  DELETING = 'DELETING',
  /**
   * Current order is rolling back to the last known good state
   *
   * After a RollingBack state, a Router can move either into Running state (from a
   * Update order) or Deleted (from a Create order).
   *
   * If we fail to roll back, the workflows are configured to stop and keep the router
   * into the RollingBack status.
   */
  ROLLING_BACK = 'ROLLING_BACK',
  /** Current router is running and able to server requests */
  RUNNING = 'RUNNING',
  /** Cloud Router is running, but currently being updated */
  UPDATING = 'UPDATING'
}

export type RouterUpsertFailure = {
  __typename?: 'RouterUpsertFailure';
  message: Scalars['String'];
};

/** A generic key→count type so that router usage metrics can be added to without modifying the `trackRouterUsage` mutation */
export type RouterUsageInput = {
  count: Scalars['Int'];
  key: Scalars['String'];
};

/** Router Version */
export type RouterVersion = {
  __typename?: 'RouterVersion';
  /** Build number */
  build: Scalars['String'];
  /** JSON schema for validating the router configuration for this router version */
  configSchema: Scalars['String'];
  /** Config version for this router version */
  configVersion: Scalars['String'];
  /** Core version identifier */
  core: Scalars['String'];
  /** Latest supported BuildPipelineTrack for this version */
  latestSupportedPipelineTrack?: Maybe<BuildPipelineTrack>;
  /** Status of a router version */
  status: Status;
  /** Version identifier */
  version: Scalars['String'];
};


/** Router Version */
export type RouterVersionconfigSchemaArgs = {
  tier?: InputMaybe<CloudTier>;
};

/** Result of a RouterConfigVersion mutation */
export type RouterVersionConfigResult = CloudInvalidInputError | InternalServerError | RouterConfigVersion;

/** Input to create a new router version */
export type RouterVersionCreateInput = {
  /** Version of the configuration */
  configVersion: Scalars['String'];
  /** Latest supported BuildPipelineTrack for this version */
  latestSupportedPipelineTrack: CloudBuildPipelineTrackInput;
  /** Version status */
  status: Status;
  /** Version identifier */
  version: Scalars['String'];
};

/** Result of a router version query */
export type RouterVersionResult = InternalServerError | InvalidInputErrors | RouterVersion;

/** Input for updating a router version */
export type RouterVersionUpdateInput = {
  /** Version of the configuration */
  configVersion?: InputMaybe<Scalars['String']>;
  /** Latest supported BuildPipelineTrack for this version */
  latestSupportedPipelineTrack?: InputMaybe<CloudBuildPipelineTrackInput>;
  /** Version status */
  status?: InputMaybe<Status>;
  /** Version identifier */
  version: Scalars['String'];
};

/** List of router versions */
export type RouterVersions = {
  __typename?: 'RouterVersions';
  versions: Array<RouterVersion>;
};

/** Input for filtering router versions */
export type RouterVersionsInput = {
  /** Name of the branch */
  branch?: InputMaybe<Scalars['String']>;
  /** Maximum number of versions to return */
  limit?: InputMaybe<Scalars['Int']>;
  /** Status of the version */
  status?: InputMaybe<Status>;
};

/** Result of a router versions query */
export type RouterVersionsResult = InternalServerError | InvalidInputErrors | RouterVersions;

export type RoverArgumentInput = {
  key: Scalars['String'];
  value?: InputMaybe<Scalars['Object']>;
};

export type RunLintCheckInput = {
  baseSchema: SchemaHashInput;
  checkStep: CheckStepInput;
  proposedSchema: SchemaHashInput;
};

/** Inputs needed to find all relevant proposals to a check workflow */
export type RunProposalsCheckInput = {
  /** List of subgraph names and hashes from the state of this variant when the check was run. */
  baseSubgraphs: Array<SubgraphCheckInput>;
  /** Supergraph hash that was most recently published when the check was run */
  baseSupergraphHash: Scalars['String'];
  /** List of subgraph names and hashes that are being proposed in the check task */
  proposedSubgraphs: Array<SubgraphCheckInput>;
  /** Supergraph hash that is the output of the check's composition task */
  proposedSupergraphHash: Scalars['String'];
  /** If this check was created by rerunning, the original check workflow task that was rerun */
  rerunOfTaskId?: InputMaybe<Scalars['ID']>;
  /** The severity to assign the check results if matching proposals are not found */
  severityLevel: ProposalChangeMismatchSeverity;
  /** The check workflow task id. Used by Task entities to resolve the results */
  workflowTaskId: Scalars['String'];
};

export type SafAssessment = {
  __typename?: 'SafAssessment';
  /** The date and time the assessment was completed. */
  completedAt?: Maybe<Scalars['Date']>;
  /** The time that the assessment was deleted. */
  deletedAt?: Maybe<Scalars['Date']>;
  /** The graph that this assessment belongs to. */
  graph: Service;
  id: Scalars['ID'];
  /** The plan items for this assessment. */
  planItems: Array<SafPlanItem>;
  /** The responses for this assessment. */
  responses: Array<SafResponse>;
  /** The date and time the assessment was started. */
  startedAt: Scalars['Date'];
};

export type SafAssessmentMutation = {
  __typename?: 'SafAssessmentMutation';
  /** Delete the assessment. */
  delete: SafAssessment;
  id: Scalars['String'];
  /** Mutations for a specific plan item. */
  planItem?: Maybe<SafPlanItemMutation>;
  /** Reorder the plan items for a given assessment. */
  reorderPlanItems: Array<SafPlanItem>;
  /** Save a response for a question. */
  saveResponse: SafResponse;
  /** Submit the assessment. */
  submit: SafAssessment;
};


export type SafAssessmentMutationplanItemArgs = {
  id: Scalars['ID'];
};


export type SafAssessmentMutationreorderPlanItemsArgs = {
  ids: Array<Scalars['ID']>;
};


export type SafAssessmentMutationsaveResponseArgs = {
  input: SafResponseInput;
};


export type SafAssessmentMutationsubmitArgs = {
  organizationId?: InputMaybe<Scalars['String']>;
  planItemIds: Array<Scalars['String']>;
};

export type SafPlanItem = {
  __typename?: 'SafPlanItem';
  bestPracticeId: Scalars['String'];
  id: Scalars['ID'];
  isDeprioritized: Scalars['Boolean'];
  notes: Scalars['String'];
  order: Scalars['Int'];
};

export type SafPlanItemInput = {
  isDeprioritized: Scalars['Boolean'];
  notes: Scalars['String'];
  order: Scalars['Int'];
};

export type SafPlanItemMutation = {
  __typename?: 'SafPlanItemMutation';
  /** Update a plan item. */
  update: SafPlanItem;
};


export type SafPlanItemMutationupdateArgs = {
  input: SafPlanItemInput;
};

export type SafResponse = {
  __typename?: 'SafResponse';
  /** The assessment that this response belongs to. */
  assessment?: Maybe<SafAssessment>;
  /** Additional context or feedback about the question. */
  comment: Scalars['String'];
  id: Scalars['ID'];
  /** The ID of the question that this response is for. */
  questionId: Scalars['String'];
  /** A list of responses for this question. */
  response: Array<Scalars['String']>;
};

export type SafResponseInput = {
  comment: Scalars['String'];
  questionId: Scalars['String'];
  response: Array<Scalars['String']>;
};

export type SamlCertInfo = {
  __typename?: 'SamlCertInfo';
  id: Scalars['ID'];
  notAfter: Scalars['Timestamp'];
  notBefore: Scalars['Timestamp'];
  pem: Scalars['String'];
  subjectDN: Scalars['String'];
};

export type SamlConnection = SsoConnection & {
  __typename?: 'SamlConnection';
  domains: Array<Scalars['String']>;
  id: Scalars['ID'];
  idpId: Scalars['ID'];
  metadata: SamlIdpMetadata;
};

export type SamlConnectionInput = {
  domains: Array<Scalars['String']>;
  entityId: Scalars['String'];
  idpId: Scalars['String'];
  ssoUrl: Scalars['String'];
  verificationCerts: Array<Scalars['String']>;
  wantsSignedRequests?: InputMaybe<Scalars['Boolean']>;
};

export type SamlConnectionMutation = {
  __typename?: 'SamlConnectionMutation';
  addVerificationCert?: Maybe<SamlConnection>;
  updateIdpId?: Maybe<SamlConnection>;
};


export type SamlConnectionMutationaddVerificationCertArgs = {
  pem: Scalars['String'];
};


export type SamlConnectionMutationupdateIdpIdArgs = {
  idpId: Scalars['String'];
};

export type SamlIdpMetadata = {
  __typename?: 'SamlIdpMetadata';
  entityId: Scalars['String'];
  ssoUrl: Scalars['String'];
  verificationCerts: Array<SamlCertInfo>;
  wantsSignedRequests: Scalars['Boolean'];
};

export type ScheduledSummary = ChannelSubscription & {
  __typename?: 'ScheduledSummary';
  /** @deprecated Use channels list instead */
  channel?: Maybe<Channel>;
  channels: Array<Channel>;
  enabled: Scalars['Boolean'];
  id: Scalars['ID'];
  timezone: Scalars['String'];
  variant: Scalars['String'];
};

/** A GraphQL schema document and associated metadata. */
export type Schema = {
  __typename?: 'Schema';
  createTemporaryURL?: Maybe<TemporaryURL>;
  /** The timestamp of initial ingestion of a schema to a graph. */
  createdAt: Scalars['Timestamp'];
  /** The GraphQL schema document. */
  document: Scalars['GraphQLDocument'];
  /** The number of fields; this includes user defined fields only, excluding built-in types and fields */
  fieldCount: Scalars['Int'];
  gitContext?: Maybe<GitContext>;
  /** The GraphQL schema document's SHA256 hash, represented as a hexadecimal string. */
  hash: Scalars['ID'];
  introspection: IntrospectionSchema;
  /**
   * The list of schema coordinates ('TypeName.fieldName') in the schema
   * that can be measured by usage reporting.
   * Currently only supports object types and interface types.
   */
  observableCoordinates?: Maybe<Array<SchemaCoordinate>>;
  /** The number of types; this includes user defined types only, excluding built-in types */
  typeCount: Scalars['Int'];
};


/** A GraphQL schema document and associated metadata. */
export type SchemacreateTemporaryURLArgs = {
  expiresInSeconds?: Scalars['Int'];
};

/** An error that occurred while running schema composition on a set of subgraph schemas. */
export type SchemaCompositionError = {
  __typename?: 'SchemaCompositionError';
  /** A machine-readable error code. */
  code?: Maybe<Scalars['String']>;
  /** Source locations related to the error. */
  locations: Array<Maybe<SourceLocation>>;
  /** A human-readable message describing the error. */
  message: Scalars['String'];
};

export type SchemaCoordinate = {
  __typename?: 'SchemaCoordinate';
  /** The printed coordinate value, e.g. 'ParentType.fieldName' */
  coordinate: Scalars['String'];
  id: Scalars['ID'];
  /** Whether the coordinate being referred to is marked as deprecated */
  isDeprecated: Scalars['Boolean'];
};

export type SchemaCoordinateFilterInput = {
  /**
   * If true, only include deprecated coordinates.
   * If false, filter out deprecated coordinates.
   */
  deprecated?: InputMaybe<Scalars['Boolean']>;
};

/** The result of computing the difference between two schemas, usually as part of schema checks. */
export type SchemaDiff = {
  __typename?: 'SchemaDiff';
  /**
   * Clients affected by all changes in the diff.
   * @deprecated Unsupported.
   */
  affectedClients?: Maybe<Array<AffectedClient>>;
  /** Operations affected by all changes in the diff. */
  affectedQueries?: Maybe<Array<AffectedQuery>>;
  /** Numeric summaries for each type of change in the diff. */
  changeSummary: ChangeSummary;
  /** A list of all schema changes in the diff, including their severity. */
  changes: Array<Change>;
  /** The number of GraphQL operations affected by the diff's changes that are neither marked as safe nor ignored. */
  numberOfAffectedOperations: Scalars['Int'];
  /** The number of GraphQL operations that were validated during the check. */
  numberOfCheckedOperations?: Maybe<Scalars['Int']>;
  /** Indicates the overall safety of the changes included in the diff, based on operation history (e.g., `FAILURE` or `NOTICE`). */
  severity: ChangeSeverity;
  /** The tag against which this diff was created */
  tag?: Maybe<Scalars['String']>;
  /** @deprecated use severity instead */
  type: ChangeType;
  /** Configuration of validation */
  validationConfig?: Maybe<SchemaDiffValidationConfig>;
};

export type SchemaDiffValidationConfig = {
  __typename?: 'SchemaDiffValidationConfig';
  /** Clients to ignore during validation. */
  excludedClients?: Maybe<Array<ClientInfoFilterOutput>>;
  /** Operation names to ignore during validation. */
  excludedOperationNames?: Maybe<Array<Maybe<OperationNameFilter>>>;
  /**
   * delta in seconds from current time that determines the start of the window
   * for reported metrics included in a schema diff. A day window from the present
   * day would have a `from` value of -86400. In rare cases, this could be an ISO
   * timestamp if the user passed one in on diff creation
   */
  from?: Maybe<Scalars['Timestamp']>;
  /** Operation IDs to ignore during validation. */
  ignoredOperations?: Maybe<Array<Scalars['ID']>>;
  /** Variants to include during validation. */
  includedVariants?: Maybe<Array<Scalars['String']>>;
  /** Minimum number of requests within the window for a query to be considered. */
  queryCountThreshold?: Maybe<Scalars['Int']>;
  /**
   * Number of requests within the window for a query to be considered, relative to
   * total request count. Expected values are between 0 and 0.05 (minimum 5% of
   * total request volume)
   */
  queryCountThresholdPercentage?: Maybe<Scalars['Float']>;
  /**
   * delta in seconds from current time that determines the end of the
   * window for reported metrics included in a schema diff. A day window
   * from the present day would have a `to` value of -0. In rare
   * cases, this could be an ISO timestamp if the user passed one in on diff
   * creation
   */
  to?: Maybe<Scalars['Timestamp']>;
};

export type SchemaHashInput = {
  /** If provided fetches build messages that are added to linter results. */
  buildID?: InputMaybe<Scalars['ID']>;
  /** SHA256 of the schema sdl. */
  hash: Scalars['String'];
  subgraphs?: InputMaybe<Array<SubgraphHashInput>>;
};

export type SchemaPublishSubscription = ChannelSubscription & {
  __typename?: 'SchemaPublishSubscription';
  channels: Array<Channel>;
  createdAt: Scalars['Timestamp'];
  enabled: Scalars['Boolean'];
  id: Scalars['ID'];
  lastUpdatedAt: Scalars['Timestamp'];
  variant?: Maybe<Scalars['String']>;
};

export type SchemaReport = {
  /** A randomly generated UUID, immutable for the lifetime of the edge server runtime. */
  bootId: Scalars['String'];
  /** The hex SHA256 hash of the schema being reported. Note that for a GraphQL server with a core schema, this should be the core schema, not the API schema. */
  coreSchemaHash: Scalars['String'];
  /** The graph ref (eg, 'id@variant') */
  graphRef: Scalars['String'];
  /** The version of the edge server reporting agent, e.g. apollo-server-2.8, graphql-java-3.1, etc. length must be <= 256 characters. */
  libraryVersion?: InputMaybe<Scalars['String']>;
  /** The infra environment in which this edge server is running, e.g. localhost, Kubernetes, AWS Lambda, Google CloudRun, AWS ECS, etc. length must be <= 256 characters. */
  platform?: InputMaybe<Scalars['String']>;
  /** The runtime in which the edge server is running, e.g. node 12.03, zulu8.46.0.19-ca-jdk8.0.252-macosx_x64, etc. length must be <= 256 characters. */
  runtimeVersion?: InputMaybe<Scalars['String']>;
  /** If available, an identifier for the edge server instance, such that when restarting this instance it will have the same serverId, with a different bootId. For example, in Kubernetes this might be the pod name. Length must be <= 256 characters. */
  serverId?: InputMaybe<Scalars['String']>;
  /** An identifier used to distinguish the version (from the user's perspective) of the edge server's code itself. For instance, the git sha of the server's repository or the docker sha of the associated image this server runs with. Length must be <= 256 characters. */
  userVersion?: InputMaybe<Scalars['String']>;
};

/** Contains details for an individual publication of an individual graph variant. */
export type SchemaTag = {
  __typename?: 'SchemaTag';
  /** The result of federated composition executed for this publication. This result includes either a supergraph schema or error details, depending on whether composition succeeded. This value is null when the publication is for a non-federated graph. */
  compositionResult?: Maybe<CompositionResult>;
  createdAt: Scalars['Timestamp'];
  /** A schema diff comparing against the schema from the most recent previous successful publication. */
  diffToPrevious?: Maybe<SchemaDiff>;
  gitContext?: Maybe<GitContext>;
  /**
   * List of previously uploaded SchemaTags under the same tag name, starting with
   * the selected published schema record. Sorted in reverse chronological order
   * by creation date (newest publish first).
   *
   * Note: This does not include the history of checked schemas
   */
  history: Array<SchemaTag>;
  /**
   * Number of tagged schemas created under the same tag name.
   * Also represents the maximum size of the history's limit argument.
   */
  historyLength: Scalars['Int'];
  /**
   * Number of schemas tagged prior to this one under the same tag name, its position
   * in the tag history.
   */
  historyOrder: Scalars['Int'];
  /** The identifier for this specific publication. */
  id: Scalars['ID'];
  /**
   * The launch for this publication. This value is non-null for contract variants, and sometimes null
   * for composition variants (specifically for older publications). This value is null for other
   * variants.
   */
  launch?: Maybe<Launch>;
  /** The timestamp when the variant was published to. */
  publishedAt: Scalars['Timestamp'];
  /**
   * The Identity that published this schema and their client info, or null if this isn't
   * a publish. Sub-fields may be null if they weren't recorded.
   */
  publishedBy?: Maybe<IdentityAndClientInfo>;
  /** The schema that was published to the variant. */
  schema: Schema;
  slackNotificationBody?: Maybe<Scalars['String']>;
  /** @deprecated Please use variant { name } instead */
  tag: Scalars['String'];
  /** The variant that was published to." */
  variant: GraphVariant;
  webhookNotificationBody: Scalars['String'];
};


/** Contains details for an individual publication of an individual graph variant. */
export type SchemaTaghistoryArgs = {
  includeUnchanged?: Scalars['Boolean'];
  limit?: Scalars['Int'];
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<SchemaTagHistoryOrder>;
};


/** Contains details for an individual publication of an individual graph variant. */
export type SchemaTaghistoryLengthArgs = {
  includeUnchanged?: Scalars['Boolean'];
};


/** Contains details for an individual publication of an individual graph variant. */
export type SchemaTagslackNotificationBodyArgs = {
  graphDisplayName: Scalars['String'];
};

export enum SchemaTagHistoryOrder {
  CREATED_ASC = 'CREATED_ASC',
  CREATED_DESC = 'CREATED_DESC'
}

/** An error that occurs when an invalid schema is passed in as user input */
export type SchemaValidationError = Error & {
  __typename?: 'SchemaValidationError';
  issues: Array<SchemaValidationIssue>;
  /** The error's details. */
  message: Scalars['String'];
};

/** An error that occurs when an invalid schema is passed in as user input */
export type SchemaValidationIssue = {
  __typename?: 'SchemaValidationIssue';
  message: Scalars['String'];
};

/** How many seats of the given types does an organization have (regardless of plan type)? */
export type Seats = {
  __typename?: 'Seats';
  /** How many members that are free in this organization. */
  free: Scalars['Int'];
  /** How many members that are not free in this organization. */
  fullPrice: Scalars['Int'];
};

/** Cloud Router secret */
export type Secret = {
  __typename?: 'Secret';
  /** When the secret was created */
  createdAt: Scalars['DateTime'];
  /** Hash of the secret */
  hash: Scalars['String'];
  /** Name of the secret */
  name: Scalars['String'];
};

/** Input for creating or updating secrets */
export type SecretInput = {
  /** Name of the secret */
  name: Scalars['String'];
  /**
   * Value for that secret
   *
   * This can only be used for input, as it is not possible to retrieve the value of secrets.
   */
  value: Scalars['String'];
};

export type SemanticChange = {
  __typename?: 'SemanticChange';
  /** Target arg of change made. */
  argNode?: Maybe<NamedIntrospectionArg>;
  /**
   * Node related to the top level node that was changed, such as a field in an object,
   * a value in an enum or the object of an interface
   */
  childNode?: Maybe<NamedIntrospectionValue>;
  /** Semantic metadata about the type of change */
  definition: ChangeDefinition;
  /** Top level node affected by the change */
  parentNode?: Maybe<NamedIntrospectionType>;
  /** Short description of the change */
  shortDescription?: Maybe<Scalars['String']>;
};

/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type Service = Identity & {
  __typename?: 'Service';
  /** The organization that this graph belongs to. */
  account?: Maybe<Account>;
  accountId?: Maybe<Scalars['ID']>;
  /** A list of the graph API keys that are active for this graph. */
  apiKeys?: Maybe<Array<GraphApiKey>>;
  /** Provides a view of the graph as an `Actor` type. */
  asActor: Actor;
  /**
   * Get an URL to which an avatar image can be uploaded. Client uploads by sending a PUT request
   * with the image data to MediaUploadInfo.url. Client SHOULD set the "Content-Type" header to the
   * browser-inferred MIME type, and SHOULD set the "x-apollo-content-filename" header to the
   * filename, if such information is available. Client MUST set the "x-apollo-csrf-token" header to
   * MediaUploadInfo.csrfToken.
   */
  avatarUpload?: Maybe<AvatarUploadResult>;
  /**
   * Get an image URL for the service's avatar. Note that CORS is not enabled for these URLs. The size
   * argument is used for bandwidth reduction, and should be the size of the image as displayed in the
   * application. Apollo's media server will downscale larger images to at least the requested size,
   * but this will not happen for third-party media servers.
   */
  avatarUrl?: Maybe<Scalars['String']>;
  /** Get available notification endpoints */
  channels?: Maybe<Array<Channel>>;
  /** Get check configuration for this graph. */
  checkConfiguration?: Maybe<CheckConfiguration>;
  /** Get a check workflow for this graph by its ID */
  checkWorkflow?: Maybe<CheckWorkflow>;
  /** Get a check workflow task for this graph by its ID */
  checkWorkflowTask?: Maybe<CheckWorkflowTask>;
  /** Get check workflows for this graph ordered by creation time, most recent first. */
  checkWorkflows: Array<CheckWorkflow>;
  /**
   * List of options available for filtering checks for this graph by git committer.
   * If a filter is passed, constrains results to match the filter.
   * For cli triggered checks, this is the author.
   * @deprecated Use checksCommitterOptions instead
   */
  checksAuthorOptions: Array<Scalars['String']>;
  /**
   * List of options available for filtering checks for this graph by branch.
   * If a filter is passed, constrains results to match the filter.
   */
  checksBranchOptions: Array<Scalars['String']>;
  /**
   * List of options available for filtering checks for this graph by git committer.
   * If a filter is passed, constrains results to match the filter.
   * For cli triggered checks, this is the author.
   */
  checksCommitterOptions: Array<Scalars['String']>;
  /**
   * List of options available for filtering checks for this graph by created by field.
   * If a filter is passed, constrains results to match the filter.
   * For non cli triggered checks, this is the Studio User / author.
   */
  checksCreatedByOptions: Array<Identity>;
  /**
   * List of options available for filtering checks for this graph by subgraph name.
   * If a filter is passed, constrains results to match the filter.
   */
  checksSubgraphOptions: Array<Scalars['String']>;
  /** Get a composition build check result for this graph by its ID */
  compositionBuildCheckResult?: Maybe<CompositionBuildCheckResult>;
  /** Given a graphCompositionID, return the results of composition. This can represent either a validation or a publish. */
  compositionResultById?: Maybe<CompositionResult>;
  createdAt: Scalars['Timestamp'];
  createdBy?: Maybe<Identity>;
  datadogMetricsConfig?: Maybe<DatadogMetricsConfig>;
  defaultBuildPipelineTrack?: Maybe<Scalars['String']>;
  /** The time the default build pipeline track version was updated. */
  defaultBuildPipelineTrackUpdatedAt?: Maybe<Scalars['Timestamp']>;
  defaultProposalReviewers: Array<Maybe<Identity>>;
  deletedAt?: Maybe<Scalars['Timestamp']>;
  description?: Maybe<Scalars['String']>;
  /** @deprecated No longer supported */
  devGraphOwner?: Maybe<User>;
  /** Get a GraphQL document by hash */
  doc?: Maybe<GraphQLDoc>;
  /**
   * Get a GraphQL document by hash
   * @deprecated Use doc instead
   */
  document?: Maybe<Scalars['GraphQLDocument']>;
  flatDiff: FlatDiffResult;
  /** The capabilities that are supported for this graph */
  graphCapabilities: GraphCapabilities;
  graphType: GraphType;
  /**
   * When this is true, this graph will be hidden from non-admin members of the org who haven't been explicitly assigned a
   * role on this graph.
   */
  hiddenFromUninvitedNonAdminAccountMembers: Scalars['Boolean'];
  /** The graph's globally unique identifier. */
  id: Scalars['ID'];
  /** List of ignored rule violations for the linter */
  ignoredLinterViolations: Array<IgnoredRule>;
  /**
   * List of subgraphs that comprise a graph. A non-federated graph should have a single implementing service.
   * Set includeDeleted to see deleted subgraphs.
   */
  implementingServices?: Maybe<GraphImplementors>;
  lastReportedAt?: Maybe<Scalars['Timestamp']>;
  /** Linter configuration for this graph. */
  linterConfiguration: GraphLinterConfiguration;
  /** Current identity, null if not authenticated. */
  me?: Maybe<Identity>;
  minProposalApprovers: Scalars['Int'];
  minProposalRoles: ProposalRoles;
  /** The composition result that was most recently published to a graph variant. */
  mostRecentCompositionPublish?: Maybe<CompositionPublishResult>;
  /** Permissions of the current user in this graph. */
  myRole?: Maybe<UserPermission>;
  name: Scalars['String'];
  onboardingArchitecture?: Maybe<OnboardingArchitecture>;
  operation?: Maybe<Operation>;
  /** Get request counts by variant for operation checks */
  operationCheckRequestsByVariant: Array<RequestCountsPerGraphVariant>;
  /** Gets the operations and their approved changes for this graph, checkID, and operationID. */
  operationsAcceptedChanges: Array<OperationAcceptedChange>;
  /** Get an operations check result for a specific check ID */
  operationsCheck?: Maybe<OperationsCheckResult>;
  /** The Persisted Query List associated with this graph with the given ID. */
  persistedQueryList?: Maybe<PersistedQueryList>;
  persistedQueryLists?: Maybe<Array<PersistedQueryList>>;
  /** A template that is the base description for new schema proposals */
  proposalDescriptionTemplate?: Maybe<Scalars['String']>;
  /** The current active user's Proposal notification status on this graph. */
  proposalNotificationStatus: NotificationStatus;
  /**
   * A list of the proposal variants for this graph sorted by created at date.
   * limit defaults to Int.MAX_VALUE, offset defaults to 0
   */
  proposalVariants: ProposalVariantsResult;
  /** If the graph setting for the proposals implementation variant has been set, this will be non null. */
  proposalsImplementationVariant?: Maybe<GraphVariant>;
  /** Must one of the default reviewers approve proposals */
  proposalsMustBeApprovedByADefaultReviewer: Scalars['Boolean'];
  /** Get query triggers for a given variant. If variant is null all the triggers for this service will be gotten. */
  queryTriggers?: Maybe<Array<QueryTrigger>>;
  readme?: Maybe<Readme>;
  /** Registry specific stats for this graph. */
  registryStatsWindow?: Maybe<RegistryStatsWindow>;
  /**
   * Whether registry subscriptions (with any options) are enabled. If variant is not passed, returns true if configuration is present for any variant
   * @deprecated This field will be removed
   */
  registrySubscriptionsEnabled: Scalars['Boolean'];
  reportingEnabled: Scalars['Boolean'];
  /** The list of members that can access this graph, accounting for graph role overrides */
  roleOverrides?: Maybe<Array<RoleOverride>>;
  /** Describes the permissions that the active user has for this graph. */
  roles?: Maybe<ServiceRoles>;
  /** Get a specific assessment for this graph by its ID. */
  safAssessment?: Maybe<SafAssessment>;
  /** All assessments for this graph. */
  safAssessments: Array<SafAssessment>;
  scheduledSummaries: Array<ScheduledSummary>;
  /** Get a schema by hash or current tag */
  schema?: Maybe<Schema>;
  /** The current publish associated to a given variant (with 'tag' as the variant name). */
  schemaTag?: Maybe<SchemaTag>;
  schemaTagById?: Maybe<SchemaTag>;
  /**
   * Get schema tags, with optional filtering to a set of tags. Always sorted by creation
   * date in reverse chronological order.
   */
  schemaTags?: Maybe<Array<SchemaTag>>;
  /** @deprecated use Service.statsWindow instead */
  stats: ServiceStatsWindow;
  statsWindow?: Maybe<ServiceStatsWindow>;
  /** Generate a test schema publish notification body */
  testSchemaPublishBody: Scalars['String'];
  /** The graph's name. */
  title: Scalars['String'];
  /** Count checkWorkflows for the given filter. Used for paginating with checkWorkflows. */
  totalCheckWorkflowCount: Scalars['Int'];
  trace?: Maybe<Trace>;
  traceStorageEnabled: Scalars['Boolean'];
  /**
   * Provides details of the graph variant with the provided `name`, if a variant
   * with that name exists for this graph. Otherwise, returns null.
   *
   *  For a list of _all_ variants associated with a graph, use `Graph.variants` instead.
   */
  variant?: Maybe<GraphVariant>;
  /** A list of the variants for this graph. */
  variants: Array<GraphVariant>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceavatarUrlArgs = {
  size?: Scalars['Int'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicechannelsArgs = {
  channelIds?: InputMaybe<Array<Scalars['ID']>>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicecheckWorkflowArgs = {
  id: Scalars['ID'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicecheckWorkflowTaskArgs = {
  id: Scalars['ID'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicecheckWorkflowsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
  limit?: Scalars['Int'];
  offset?: Scalars['Int'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicechecksAuthorOptionsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicechecksBranchOptionsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicechecksCommitterOptionsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicechecksCreatedByOptionsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicechecksSubgraphOptionsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicecompositionBuildCheckResultArgs = {
  id: Scalars['ID'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicecompositionResultByIdArgs = {
  id: Scalars['ID'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicedocArgs = {
  hash?: InputMaybe<Scalars['SHA256']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicedocumentArgs = {
  hash?: InputMaybe<Scalars['SHA256']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceflatDiffArgs = {
  newSdlHash?: InputMaybe<Scalars['SHA256']>;
  oldSdlHash?: InputMaybe<Scalars['SHA256']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceimplementingServicesArgs = {
  graphVariant: Scalars['String'];
  includeDeleted?: InputMaybe<Scalars['Boolean']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicelastReportedAtArgs = {
  graphVariant?: InputMaybe<Scalars['String']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicemostRecentCompositionPublishArgs = {
  graphVariant: Scalars['String'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceoperationArgs = {
  id: Scalars['ID'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceoperationCheckRequestsByVariantArgs = {
  from: Scalars['Timestamp'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceoperationsAcceptedChangesArgs = {
  checkID: Scalars['ID'];
  operationID: Scalars['String'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceoperationsCheckArgs = {
  checkID: Scalars['ID'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicepersistedQueryListArgs = {
  id: Scalars['ID'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceproposalVariantsArgs = {
  filterBy?: InputMaybe<ProposalVariantsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicequeryTriggersArgs = {
  graphVariant?: InputMaybe<Scalars['String']>;
  operationNames?: InputMaybe<Array<Scalars['String']>>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceregistryStatsWindowArgs = {
  from: Scalars['Timestamp'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceregistrySubscriptionsEnabledArgs = {
  graphVariant?: InputMaybe<Scalars['String']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicesafAssessmentArgs = {
  id: Scalars['ID'];
  includeDeleted?: Scalars['Boolean'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicesafAssessmentsArgs = {
  includeDeleted?: Scalars['Boolean'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceschemaArgs = {
  hash?: InputMaybe<Scalars['ID']>;
  tag?: InputMaybe<Scalars['String']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceschemaTagArgs = {
  tag: Scalars['String'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceschemaTagByIdArgs = {
  id: Scalars['ID'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceschemaTagsArgs = {
  tags?: InputMaybe<Array<Scalars['String']>>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicestatsArgs = {
  from: Scalars['Timestamp'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicestatsWindowArgs = {
  from: Scalars['Timestamp'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicetestSchemaPublishBodyArgs = {
  variant: Scalars['String'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicetotalCheckWorkflowCountArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicetraceArgs = {
  id: Scalars['ID'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicevariantArgs = {
  name: Scalars['String'];
};

/** Columns of ServiceBillingUsageStats. */
export enum ServiceBillingUsageStatsColumn {
  AGENT_VERSION = 'AGENT_VERSION',
  GRAPH_DEPLOYMENT_TYPE = 'GRAPH_DEPLOYMENT_TYPE',
  OPERATION_COUNT = 'OPERATION_COUNT',
  OPERATION_COUNT_PROVIDED_EXPLICITLY = 'OPERATION_COUNT_PROVIDED_EXPLICITLY',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP'
}

export type ServiceBillingUsageStatsDimensions = {
  __typename?: 'ServiceBillingUsageStatsDimensions';
  agentVersion?: Maybe<Scalars['String']>;
  graphDeploymentType?: Maybe<Scalars['String']>;
  operationCountProvidedExplicitly?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
};

/** Filter for data in ServiceBillingUsageStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceBillingUsageStatsFilter = {
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']>;
  and?: InputMaybe<Array<ServiceBillingUsageStatsFilter>>;
  /** Selects rows whose graphDeploymentType dimension equals the given value if not null. To query for the null value, use {in: {graphDeploymentType: [null]}} instead. */
  graphDeploymentType?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<ServiceBillingUsageStatsFilterIn>;
  not?: InputMaybe<ServiceBillingUsageStatsFilter>;
  /** Selects rows whose operationCountProvidedExplicitly dimension equals the given value if not null. To query for the null value, use {in: {operationCountProvidedExplicitly: [null]}} instead. */
  operationCountProvidedExplicitly?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<ServiceBillingUsageStatsFilter>>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
};

/** Filter for data in ServiceBillingUsageStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceBillingUsageStatsFilterIn = {
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose graphDeploymentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  graphDeploymentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationCountProvidedExplicitly dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationCountProvidedExplicitly?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type ServiceBillingUsageStatsMetrics = {
  __typename?: 'ServiceBillingUsageStatsMetrics';
  operationCount: Scalars['Long'];
};

export type ServiceBillingUsageStatsOrderBySpec = {
  column: ServiceBillingUsageStatsColumn;
  direction: Ordering;
};

export type ServiceBillingUsageStatsRecord = {
  __typename?: 'ServiceBillingUsageStatsRecord';
  /** Dimensions of ServiceBillingUsageStats that can be grouped by. */
  groupBy: ServiceBillingUsageStatsDimensions;
  /** Metrics of ServiceBillingUsageStats that can be aggregated over. */
  metrics: ServiceBillingUsageStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of ServiceEdgeServerInfos. */
export enum ServiceEdgeServerInfosColumn {
  BOOT_ID = 'BOOT_ID',
  EXECUTABLE_SCHEMA_ID = 'EXECUTABLE_SCHEMA_ID',
  LIBRARY_VERSION = 'LIBRARY_VERSION',
  PLATFORM = 'PLATFORM',
  RUNTIME_VERSION = 'RUNTIME_VERSION',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVER_ID = 'SERVER_ID',
  TIMESTAMP = 'TIMESTAMP',
  USER_VERSION = 'USER_VERSION'
}

export type ServiceEdgeServerInfosDimensions = {
  __typename?: 'ServiceEdgeServerInfosDimensions';
  bootId?: Maybe<Scalars['ID']>;
  executableSchemaId?: Maybe<Scalars['ID']>;
  libraryVersion?: Maybe<Scalars['String']>;
  platform?: Maybe<Scalars['String']>;
  runtimeVersion?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serverId?: Maybe<Scalars['ID']>;
  userVersion?: Maybe<Scalars['String']>;
};

/** Filter for data in ServiceEdgeServerInfos. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceEdgeServerInfosFilter = {
  and?: InputMaybe<Array<ServiceEdgeServerInfosFilter>>;
  /** Selects rows whose bootId dimension equals the given value if not null. To query for the null value, use {in: {bootId: [null]}} instead. */
  bootId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose executableSchemaId dimension equals the given value if not null. To query for the null value, use {in: {executableSchemaId: [null]}} instead. */
  executableSchemaId?: InputMaybe<Scalars['ID']>;
  in?: InputMaybe<ServiceEdgeServerInfosFilterIn>;
  /** Selects rows whose libraryVersion dimension equals the given value if not null. To query for the null value, use {in: {libraryVersion: [null]}} instead. */
  libraryVersion?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<ServiceEdgeServerInfosFilter>;
  or?: InputMaybe<Array<ServiceEdgeServerInfosFilter>>;
  /** Selects rows whose platform dimension equals the given value if not null. To query for the null value, use {in: {platform: [null]}} instead. */
  platform?: InputMaybe<Scalars['String']>;
  /** Selects rows whose runtimeVersion dimension equals the given value if not null. To query for the null value, use {in: {runtimeVersion: [null]}} instead. */
  runtimeVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serverId dimension equals the given value if not null. To query for the null value, use {in: {serverId: [null]}} instead. */
  serverId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose userVersion dimension equals the given value if not null. To query for the null value, use {in: {userVersion: [null]}} instead. */
  userVersion?: InputMaybe<Scalars['String']>;
};

/** Filter for data in ServiceEdgeServerInfos. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceEdgeServerInfosFilterIn = {
  /** Selects rows whose bootId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  bootId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose executableSchemaId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  executableSchemaId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose libraryVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  libraryVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose platform dimension is in the given list. A null value in the list means a row with null for that dimension. */
  platform?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose runtimeVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  runtimeVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serverId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serverId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose userVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  userVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type ServiceEdgeServerInfosOrderBySpec = {
  column: ServiceEdgeServerInfosColumn;
  direction: Ordering;
};

export type ServiceEdgeServerInfosRecord = {
  __typename?: 'ServiceEdgeServerInfosRecord';
  /** Dimensions of ServiceEdgeServerInfos that can be grouped by. */
  groupBy: ServiceEdgeServerInfosDimensions;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of ServiceErrorStats. */
export enum ServiceErrorStatsColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ERRORS_COUNT = 'ERRORS_COUNT',
  PATH = 'PATH',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REQUESTS_WITH_ERRORS_COUNT = 'REQUESTS_WITH_ERRORS_COUNT',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP'
}

export type ServiceErrorStatsDimensions = {
  __typename?: 'ServiceErrorStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
};

/** Filter for data in ServiceErrorStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceErrorStatsFilter = {
  and?: InputMaybe<Array<ServiceErrorStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<ServiceErrorStatsFilterIn>;
  not?: InputMaybe<ServiceErrorStatsFilter>;
  or?: InputMaybe<Array<ServiceErrorStatsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
};

/** Filter for data in ServiceErrorStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceErrorStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type ServiceErrorStatsMetrics = {
  __typename?: 'ServiceErrorStatsMetrics';
  errorsCount: Scalars['Long'];
  requestsWithErrorsCount: Scalars['Long'];
};

export type ServiceErrorStatsOrderBySpec = {
  column: ServiceErrorStatsColumn;
  direction: Ordering;
};

export type ServiceErrorStatsRecord = {
  __typename?: 'ServiceErrorStatsRecord';
  /** Dimensions of ServiceErrorStats that can be grouped by. */
  groupBy: ServiceErrorStatsDimensions;
  /** Metrics of ServiceErrorStats that can be aggregated over. */
  metrics: ServiceErrorStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of ServiceFieldExecutions. */
export enum ServiceFieldExecutionsColumn {
  ERRORS_COUNT = 'ERRORS_COUNT',
  ESTIMATED_EXECUTION_COUNT = 'ESTIMATED_EXECUTION_COUNT',
  FIELD_NAME = 'FIELD_NAME',
  OBSERVED_EXECUTION_COUNT = 'OBSERVED_EXECUTION_COUNT',
  PARENT_TYPE = 'PARENT_TYPE',
  REFERENCING_OPERATION_COUNT = 'REFERENCING_OPERATION_COUNT',
  REQUESTS_WITH_ERRORS_COUNT = 'REQUESTS_WITH_ERRORS_COUNT',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP'
}

export type ServiceFieldExecutionsDimensions = {
  __typename?: 'ServiceFieldExecutionsDimensions';
  fieldName?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
};

/** Filter for data in ServiceFieldExecutions. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceFieldExecutionsFilter = {
  and?: InputMaybe<Array<ServiceFieldExecutionsFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<ServiceFieldExecutionsFilterIn>;
  not?: InputMaybe<ServiceFieldExecutionsFilter>;
  or?: InputMaybe<Array<ServiceFieldExecutionsFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
};

/** Filter for data in ServiceFieldExecutions. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceFieldExecutionsFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type ServiceFieldExecutionsMetrics = {
  __typename?: 'ServiceFieldExecutionsMetrics';
  errorsCount: Scalars['Long'];
  estimatedExecutionCount: Scalars['Long'];
  observedExecutionCount: Scalars['Long'];
  referencingOperationCount: Scalars['Long'];
  requestsWithErrorsCount: Scalars['Long'];
};

export type ServiceFieldExecutionsOrderBySpec = {
  column: ServiceFieldExecutionsColumn;
  direction: Ordering;
};

export type ServiceFieldExecutionsRecord = {
  __typename?: 'ServiceFieldExecutionsRecord';
  /** Dimensions of ServiceFieldExecutions that can be grouped by. */
  groupBy: ServiceFieldExecutionsDimensions;
  /** Metrics of ServiceFieldExecutions that can be aggregated over. */
  metrics: ServiceFieldExecutionsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of ServiceFieldLatencies. */
export enum ServiceFieldLatenciesColumn {
  FIELD_HISTOGRAM = 'FIELD_HISTOGRAM',
  FIELD_NAME = 'FIELD_NAME',
  PARENT_TYPE = 'PARENT_TYPE',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP'
}

export type ServiceFieldLatenciesDimensions = {
  __typename?: 'ServiceFieldLatenciesDimensions';
  field?: Maybe<Scalars['String']>;
  fieldName?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
};

/** Filter for data in ServiceFieldLatencies. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceFieldLatenciesFilter = {
  and?: InputMaybe<Array<ServiceFieldLatenciesFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<ServiceFieldLatenciesFilterIn>;
  not?: InputMaybe<ServiceFieldLatenciesFilter>;
  or?: InputMaybe<Array<ServiceFieldLatenciesFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
};

/** Filter for data in ServiceFieldLatencies. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceFieldLatenciesFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type ServiceFieldLatenciesMetrics = {
  __typename?: 'ServiceFieldLatenciesMetrics';
  fieldHistogram: DurationHistogram;
};

export type ServiceFieldLatenciesOrderBySpec = {
  column: ServiceFieldLatenciesColumn;
  direction: Ordering;
};

export type ServiceFieldLatenciesRecord = {
  __typename?: 'ServiceFieldLatenciesRecord';
  /** Dimensions of ServiceFieldLatencies that can be grouped by. */
  groupBy: ServiceFieldLatenciesDimensions;
  /** Metrics of ServiceFieldLatencies that can be aggregated over. */
  metrics: ServiceFieldLatenciesMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of ServiceFieldUsage. */
export enum ServiceFieldUsageColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ESTIMATED_EXECUTION_COUNT = 'ESTIMATED_EXECUTION_COUNT',
  EXECUTION_COUNT = 'EXECUTION_COUNT',
  FIELD_NAME = 'FIELD_NAME',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  PARENT_TYPE = 'PARENT_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REFERENCING_OPERATION_COUNT = 'REFERENCING_OPERATION_COUNT',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP'
}

export type ServiceFieldUsageDimensions = {
  __typename?: 'ServiceFieldUsageDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  fieldName?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
};

/** Filter for data in ServiceFieldUsage. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceFieldUsageFilter = {
  and?: InputMaybe<Array<ServiceFieldUsageFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<ServiceFieldUsageFilterIn>;
  not?: InputMaybe<ServiceFieldUsageFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<ServiceFieldUsageFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
};

/** Filter for data in ServiceFieldUsage. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceFieldUsageFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type ServiceFieldUsageMetrics = {
  __typename?: 'ServiceFieldUsageMetrics';
  estimatedExecutionCount: Scalars['Long'];
  executionCount: Scalars['Long'];
  referencingOperationCount: Scalars['Long'];
};

export type ServiceFieldUsageOrderBySpec = {
  column: ServiceFieldUsageColumn;
  direction: Ordering;
};

export type ServiceFieldUsageRecord = {
  __typename?: 'ServiceFieldUsageRecord';
  /** Dimensions of ServiceFieldUsage that can be grouped by. */
  groupBy: ServiceFieldUsageDimensions;
  /** Metrics of ServiceFieldUsage that can be aggregated over. */
  metrics: ServiceFieldUsageMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of ServiceGraphosCloudMetrics. */
export enum ServiceGraphosCloudMetricsColumn {
  AGENT_VERSION = 'AGENT_VERSION',
  CLOUD_PROVIDER = 'CLOUD_PROVIDER',
  RESPONSE_SIZE = 'RESPONSE_SIZE',
  RESPONSE_SIZE_THROTTLED = 'RESPONSE_SIZE_THROTTLED',
  ROUTER_ID = 'ROUTER_ID',
  ROUTER_OPERATIONS = 'ROUTER_OPERATIONS',
  ROUTER_OPERATIONS_THROTTLED = 'ROUTER_OPERATIONS_THROTTLED',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SUBGRAPH_FETCHES = 'SUBGRAPH_FETCHES',
  SUBGRAPH_FETCHES_THROTTLED = 'SUBGRAPH_FETCHES_THROTTLED',
  TIER = 'TIER',
  TIMESTAMP = 'TIMESTAMP'
}

export type ServiceGraphosCloudMetricsDimensions = {
  __typename?: 'ServiceGraphosCloudMetricsDimensions';
  agentVersion?: Maybe<Scalars['String']>;
  cloudProvider?: Maybe<Scalars['String']>;
  routerId?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  tier?: Maybe<Scalars['String']>;
};

/** Filter for data in ServiceGraphosCloudMetrics. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceGraphosCloudMetricsFilter = {
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']>;
  and?: InputMaybe<Array<ServiceGraphosCloudMetricsFilter>>;
  /** Selects rows whose cloudProvider dimension equals the given value if not null. To query for the null value, use {in: {cloudProvider: [null]}} instead. */
  cloudProvider?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<ServiceGraphosCloudMetricsFilterIn>;
  not?: InputMaybe<ServiceGraphosCloudMetricsFilter>;
  or?: InputMaybe<Array<ServiceGraphosCloudMetricsFilter>>;
  /** Selects rows whose routerId dimension equals the given value if not null. To query for the null value, use {in: {routerId: [null]}} instead. */
  routerId?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose tier dimension equals the given value if not null. To query for the null value, use {in: {tier: [null]}} instead. */
  tier?: InputMaybe<Scalars['String']>;
};

/** Filter for data in ServiceGraphosCloudMetrics. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceGraphosCloudMetricsFilterIn = {
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose cloudProvider dimension is in the given list. A null value in the list means a row with null for that dimension. */
  cloudProvider?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose routerId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  routerId?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose tier dimension is in the given list. A null value in the list means a row with null for that dimension. */
  tier?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type ServiceGraphosCloudMetricsMetrics = {
  __typename?: 'ServiceGraphosCloudMetricsMetrics';
  responseSize: Scalars['Long'];
  responseSizeThrottled: Scalars['Long'];
  routerOperations: Scalars['Long'];
  routerOperationsThrottled: Scalars['Long'];
  subgraphFetches: Scalars['Long'];
  subgraphFetchesThrottled: Scalars['Long'];
};

export type ServiceGraphosCloudMetricsOrderBySpec = {
  column: ServiceGraphosCloudMetricsColumn;
  direction: Ordering;
};

export type ServiceGraphosCloudMetricsRecord = {
  __typename?: 'ServiceGraphosCloudMetricsRecord';
  /** Dimensions of ServiceGraphosCloudMetrics that can be grouped by. */
  groupBy: ServiceGraphosCloudMetricsDimensions;
  /** Metrics of ServiceGraphosCloudMetrics that can be aggregated over. */
  metrics: ServiceGraphosCloudMetricsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutation = {
  __typename?: 'ServiceMutation';
  /**
   * Checks a proposed subgraph schema change against a published subgraph.
   * If the proposal composes successfully, perform a usage check for the resulting supergraph schema.
   * @deprecated Use GraphVariant.submitSubgraphCheckAsync instead.
   * This mutation polls to wait for the check to finish,
   * while subgraphSubgraphCheckAsync triggers returns
   * without waiting for the check to finish.
   */
  checkPartialSchema: CheckPartialSchemaResult;
  /**
   * Checks a proposed schema against the schema that has been published to
   * a particular variant, using metrics corresponding to `historicParameters`.
   * Callers can set `historicParameters` directly or rely on defaults set in the
   * graph's check configuration (7 days by default).
   * If they do not set `historicParameters` but set `useMaximumRetention`,
   * validation will use the maximum retention the graph has access to.
   */
  checkSchema: CheckSchemaResult;
  /** Make changes to a check workflow. */
  checkWorkflow?: Maybe<CheckWorkflowMutation>;
  createCompositionStatusSubscription: SchemaPublishSubscription;
  createPersistedQueryList: CreatePersistedQueryListResultOrError;
  /** Creates a proposal variant from a source variant and a name, description. See the documentation for proposal creation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals/creation */
  createProposal: CreateProposalResult;
  /** Creates a proposal variant from a source variant and a name, description. Do not call this from any clients, this resolver is exclusively for inter-service proposal -> kotlin registry communication. */
  createProposalVariant: ProposalVariantCreationResult;
  /** Create a new assessment for this graph. */
  createSafAssessment: SafAssessment;
  createSchemaPublishSubscription: SchemaPublishSubscription;
  /** Update the default build pipeline track for this graph. */
  defaultBuildPipelineTrack?: Maybe<BuildPipelineTrack>;
  /** Soft delete a graph. Data associated with the graph is not permanently deleted; Apollo support can undo. */
  delete?: Maybe<Scalars['Void']>;
  /** Delete the service's avatar. Requires Service.roles.canUpdateAvatar to be true. */
  deleteAvatar?: Maybe<AvatarDeleteError>;
  /** Delete an existing channel */
  deleteChannel: Scalars['Boolean'];
  /** Delete an existing query trigger */
  deleteQueryTrigger: Scalars['Boolean'];
  /** Deletes this service's current subscriptions specific to the ID, returns true if it existed */
  deleteRegistrySubscription: Scalars['Boolean'];
  /**
   * Deletes this service's current registry subscription(s) specific to its graph variant,
   * returns a list of subscription IDs that were deleted.
   */
  deleteRegistrySubscriptions: Array<Scalars['ID']>;
  deleteScheduledSummary: Scalars['Boolean'];
  /** Delete a variant by name. */
  deleteSchemaTag: DeleteSchemaTagResult;
  /** Given a UTC timestamp, delete all traces associated with this Service, on that corresponding day. If a timestamp to is provided, deletes all days inclusive. */
  deleteTraces?: Maybe<Scalars['Void']>;
  disableDatadogForwardingLegacyMetricNames?: Maybe<Service>;
  /** Hard delete a graph and all data associated with it. Its ID cannot be reused. */
  hardDelete?: Maybe<Scalars['Void']>;
  /** @deprecated Use service.id */
  id: Scalars['ID'];
  /**
   * Ignore an operation in future checks;
   * changes affecting it will be tracked,
   * but won't affect the outcome of the check.
   * Returns true if the operation is newly ignored,
   * false if it already was.
   */
  ignoreOperationsInChecks?: Maybe<IgnoreOperationsInChecksResult>;
  /** Lint a single schema using the graph's linter configuration. */
  lintSchema: LintResult;
  /**
   * Mark the changeset that affects an operation in a given check instance as safe.
   * Note that only operations marked as behavior changes are allowed to be marked as safe.
   */
  markChangesForOperationAsSafe: MarkChangesForOperationAsSafeResult;
  /** Generates a new graph API key for this graph with the specified permission level. */
  newKey: GraphApiKey;
  /** Mutation to set whether a proposals check task's results should be overridden or not */
  overrideProposalsCheckTask?: Maybe<Scalars['Boolean']>;
  /** Adds an override to the given users permission for this graph */
  overrideUserPermission?: Maybe<Service>;
  /** Provides access to mutation fields for modifying a Persisted Query List with the provided ID. */
  persistedQueryList: PersistedQueryListMutation;
  /** Promote the schema with the given SHA-256 hash to active for the given variant/tag. */
  promoteSchema: PromoteSchemaResponseOrError;
  proposalsMustBeApprovedByADefaultReviewer?: Maybe<ProposalsMustBeApprovedByADefaultReviewerResult>;
  /** Publish to a subgraph. If composition is successful, this will update running routers. */
  publishSubgraph?: Maybe<CompositionAndUpsertResult>;
  /** Publishes multiple subgraphs. If composition is successful, this will update running routers. */
  publishSubgraphs?: Maybe<CompositionAndUpsertResult>;
  /** Publishes multiple subgraphs, running the build async. */
  publishSubgraphsAsyncBuild?: Maybe<PublishSubgraphsAsyncBuildResult>;
  registerOperationsWithResponse?: Maybe<RegisterOperationsMutationResponse>;
  /** Removes a subgraph. If composition is successful, this will update running routers. */
  removeImplementingServiceAndTriggerComposition: CompositionAndRemoveResult;
  /** Deletes the existing graph API key with the provided ID, if any. */
  removeKey?: Maybe<Scalars['Void']>;
  /** Sets a new name for the graph API key with the provided ID, if any. This does not invalidate the key or change its value. */
  renameKey?: Maybe<GraphApiKey>;
  /** @deprecated use Mutation.reportSchema instead */
  reportServerInfo?: Maybe<ReportServerInfoResult>;
  /** Mutations for a specific assessment. */
  safAssessment?: Maybe<SafAssessmentMutation>;
  service: Service;
  setDefaultBuildPipelineTrack?: Maybe<Scalars['String']>;
  setMinProposalApprovers: SetMinApproversResult;
  /** The minimum role for create & edit is graph admin */
  setMinProposalRoles: SetProposalRolesResult;
  setProposalDefaultReviewers: SetProposalDefaultReviewersResult;
  /** Updates the template for schema proposal descriptions. Deletes the template if the input string is null or empty */
  setProposalDescriptionTemplate?: Maybe<SetProposalDescriptionTemplateResult>;
  /** Set the variant for this graph that all proposals depend on for 'IMPLEMENTED' status. TODO maya switch this to canManageProposalSettings. If variantName is passed as null, implementation variant is deleted. */
  setProposalImplementationVariant: SetProposalImplementationVariantResult;
  /** Sets the current active user's Proposals notification status on this graph. */
  setProposalNotificationStatus: SetProposalNotificationStatusResult;
  /**
   * Store a given schema document. This schema will be attached to the graph but
   * not be associated with any variant. On success, returns the schema hash.
   */
  storeSchemaDocument: StoreSchemaResponseOrError;
  /** Test Slack notification channel */
  testSlackChannel?: Maybe<Scalars['Void']>;
  testSubscriptionForChannel: Scalars['String'];
  transfer?: Maybe<Service>;
  undelete?: Maybe<Service>;
  /**
   * Revert the effects of ignoreOperation.
   * Returns true if the operation is no longer ignored,
   * false if it wasn't.
   */
  unignoreOperationsInChecks?: Maybe<UnignoreOperationsInChecksResult>;
  /** Unmark changes for an operation as safe. */
  unmarkChangesForOperationAsSafe: MarkChangesForOperationAsSafeResult;
  /** Update schema check configuration for a graph. */
  updateCheckConfiguration: CheckConfiguration;
  updateDatadogMetricsConfig?: Maybe<DatadogMetricsConfig>;
  updateDescription?: Maybe<Service>;
  /** Update hiddenFromUninvitedNonAdminAccountMembers */
  updateHiddenFromUninvitedNonAdminAccountMembers?: Maybe<Service>;
  /** Update rule violations to ignore for this graph. */
  updateIgnoredRuleViolations: Array<IgnoredRule>;
  /** Update the linter configuration for this graph. */
  updateLinterConfiguration: GraphLinterConfiguration;
  updateReadme?: Maybe<Service>;
  updateTitle?: Maybe<Service>;
  /** Publish a schema to this variant, either via a document or an introspection query result. */
  uploadSchema?: Maybe<UploadSchemaMutationResponse>;
  upsertChannel?: Maybe<Channel>;
  /** Creates a contract schema from a source variant and a set of filter configurations */
  upsertContractVariant: ContractVariantUpsertResult;
  /** Publish to a subgraph. If composition is successful, this will update running routers. */
  upsertImplementingServiceAndTriggerComposition?: Maybe<CompositionAndUpsertResult>;
  /** Create/update PagerDuty notification channel */
  upsertPagerDutyChannel?: Maybe<PagerDutyChannel>;
  upsertQueryTrigger?: Maybe<QueryTrigger>;
  /** Create or update a subscription for a service. */
  upsertRegistrySubscription: RegistrySubscription;
  upsertScheduledSummary?: Maybe<ScheduledSummary>;
  /** Create/update Slack notification channel */
  upsertSlackChannel?: Maybe<SlackChannel>;
  upsertWebhookChannel?: Maybe<WebhookChannel>;
  validateOperations: ValidateOperationsResult;
  /**
   * This mutation will not result in any changes to the implementing service
   * Run composition with the Implementing Service's partial schema replaced with the one provided
   * in the mutation's input. Store the composed schema, return the hash of the composed schema,
   * and any warnings and errors pertaining to composition.
   * This mutation will not run validation against operations.
   * @deprecated Use GraphVariant.submitSubgraphCheckAsync instead
   */
  validatePartialSchemaOfImplementingServiceAgainstGraph: CompositionValidationResult;
  /** Make changes to a graph variant. */
  variant?: Maybe<GraphVariantMutation>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationcheckPartialSchemaArgs = {
  frontend?: InputMaybe<Scalars['String']>;
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant: Scalars['String'];
  historicParameters?: InputMaybe<HistoricQueryParameters>;
  implementingServiceName: Scalars['String'];
  introspectionEndpoint?: InputMaybe<Scalars['String']>;
  isProposalCheck?: Scalars['Boolean'];
  isSandboxCheck?: Scalars['Boolean'];
  partialSchema: PartialSchemaInput;
  triggeredBy?: InputMaybe<ActorInput>;
  useMaximumRetention?: InputMaybe<Scalars['Boolean']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationcheckSchemaArgs = {
  baseSchemaTag?: InputMaybe<Scalars['String']>;
  frontend?: InputMaybe<Scalars['String']>;
  gitContext?: InputMaybe<GitContextInput>;
  historicParameters?: InputMaybe<HistoricQueryParameters>;
  introspectionEndpoint?: InputMaybe<Scalars['String']>;
  isProposalCheck?: Scalars['Boolean'];
  isSandboxCheck?: Scalars['Boolean'];
  proposedSchema?: InputMaybe<IntrospectionSchemaInput>;
  proposedSchemaDocument?: InputMaybe<Scalars['String']>;
  proposedSchemaHash?: InputMaybe<Scalars['String']>;
  useMaximumRetention?: InputMaybe<Scalars['Boolean']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationcheckWorkflowArgs = {
  id: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationcreateCompositionStatusSubscriptionArgs = {
  channelID: Scalars['ID'];
  variant: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationcreatePersistedQueryListArgs = {
  description?: InputMaybe<Scalars['String']>;
  linkedVariants?: InputMaybe<Array<Scalars['String']>>;
  name: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationcreateProposalArgs = {
  input: CreateProposalInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationcreateProposalVariantArgs = {
  sourceVariantName: Scalars['ID'];
  triggeredBy?: InputMaybe<ActorInput>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationcreateSchemaPublishSubscriptionArgs = {
  channelID: Scalars['ID'];
  variant: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationdefaultBuildPipelineTrackArgs = {
  buildPipelineTrack: BuildPipelineTrack;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationdeleteChannelArgs = {
  id: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationdeleteQueryTriggerArgs = {
  id: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationdeleteRegistrySubscriptionArgs = {
  id: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationdeleteRegistrySubscriptionsArgs = {
  variant: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationdeleteScheduledSummaryArgs = {
  id: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationdeleteSchemaTagArgs = {
  tag: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationdeleteTracesArgs = {
  from: Scalars['Timestamp'];
  to?: InputMaybe<Scalars['Timestamp']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationignoreOperationsInChecksArgs = {
  ids: Array<Scalars['ID']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationlintSchemaArgs = {
  baseSdl?: InputMaybe<Scalars['String']>;
  sdl: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationmarkChangesForOperationAsSafeArgs = {
  checkID: Scalars['ID'];
  operationID: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationnewKeyArgs = {
  keyName?: InputMaybe<Scalars['String']>;
  role?: UserPermission;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationoverrideProposalsCheckTaskArgs = {
  shouldOverride: Scalars['Boolean'];
  taskId: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationoverrideUserPermissionArgs = {
  permission?: InputMaybe<UserPermission>;
  userID: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationpersistedQueryListArgs = {
  id: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationpromoteSchemaArgs = {
  graphVariant: Scalars['String'];
  historicParameters?: InputMaybe<HistoricQueryParameters>;
  overrideComposedSchema?: Scalars['Boolean'];
  sha256: Scalars['SHA256'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationproposalsMustBeApprovedByADefaultReviewerArgs = {
  mustBeApproved: Scalars['Boolean'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationpublishSubgraphArgs = {
  activePartialSchema: PartialSchemaInput;
  downstreamLaunchInitiation?: InputMaybe<DownstreamLaunchInitiation>;
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant: Scalars['String'];
  name: Scalars['String'];
  revision: Scalars['String'];
  url?: InputMaybe<Scalars['String']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationpublishSubgraphsArgs = {
  downstreamLaunchInitiation?: InputMaybe<DownstreamLaunchInitiation>;
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant: Scalars['String'];
  revision: Scalars['String'];
  subgraphInputs: Array<PublishSubgraphsSubgraphInput>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationpublishSubgraphsAsyncBuildArgs = {
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant: Scalars['String'];
  revision: Scalars['String'];
  subgraphInputs: Array<PublishSubgraphsSubgraphInput>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationregisterOperationsWithResponseArgs = {
  clientIdentity?: InputMaybe<RegisteredClientIdentityInput>;
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant?: Scalars['String'];
  manifestVersion?: InputMaybe<Scalars['Int']>;
  operations: Array<RegisteredOperationInput>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationremoveImplementingServiceAndTriggerCompositionArgs = {
  dryRun?: Scalars['Boolean'];
  graphVariant: Scalars['String'];
  name: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationremoveKeyArgs = {
  id: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationrenameKeyArgs = {
  id: Scalars['ID'];
  newKeyName?: InputMaybe<Scalars['String']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationreportServerInfoArgs = {
  executableSchema?: InputMaybe<Scalars['String']>;
  info: EdgeServerInfo;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationsafAssessmentArgs = {
  id: Scalars['ID'];
  includeDeleted?: Scalars['Boolean'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationsetDefaultBuildPipelineTrackArgs = {
  version: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationsetMinProposalApproversArgs = {
  input: SetMinProposalApproversInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationsetMinProposalRolesArgs = {
  input: SetProposalRolesInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationsetProposalDefaultReviewersArgs = {
  input: SetProposalDefaultReviewersInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationsetProposalDescriptionTemplateArgs = {
  input: SetProposalDescriptionTemplateInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationsetProposalImplementationVariantArgs = {
  variantName?: InputMaybe<Scalars['String']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationsetProposalNotificationStatusArgs = {
  input: SetProposalNotificationStatusInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationstoreSchemaDocumentArgs = {
  schemaDocument: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationtestSlackChannelArgs = {
  id: Scalars['ID'];
  notification: SlackNotificationInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationtestSubscriptionForChannelArgs = {
  channelID: Scalars['ID'];
  subscriptionID: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationtransferArgs = {
  to: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationunignoreOperationsInChecksArgs = {
  ids: Array<Scalars['ID']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationunmarkChangesForOperationAsSafeArgs = {
  checkID: Scalars['ID'];
  operationID: Scalars['ID'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupdateCheckConfigurationArgs = {
  enableLintChecks?: InputMaybe<Scalars['Boolean']>;
  excludedClients?: InputMaybe<Array<ClientFilterInput>>;
  excludedOperationNames?: InputMaybe<Array<OperationNameFilterInput>>;
  excludedOperations?: InputMaybe<Array<ExcludedOperationInput>>;
  includeBaseVariant?: InputMaybe<Scalars['Boolean']>;
  includedVariants?: InputMaybe<Array<Scalars['String']>>;
  operationCountThreshold?: InputMaybe<Scalars['Int']>;
  operationCountThresholdPercentage?: InputMaybe<Scalars['Float']>;
  proposalChangeMismatchSeverity?: InputMaybe<ProposalChangeMismatchSeverity>;
  timeRangeSeconds?: InputMaybe<Scalars['Long']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupdateDatadogMetricsConfigArgs = {
  apiKey?: InputMaybe<Scalars['String']>;
  apiRegion?: InputMaybe<DatadogApiRegion>;
  enabled?: InputMaybe<Scalars['Boolean']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupdateDescriptionArgs = {
  description: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupdateHiddenFromUninvitedNonAdminAccountMembersArgs = {
  hiddenFromUninvitedNonAdminAccountMembers: Scalars['Boolean'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupdateIgnoredRuleViolationsArgs = {
  changes: LinterIgnoredRuleChangesInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupdateLinterConfigurationArgs = {
  changes: GraphLinterConfigurationChangesInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupdateReadmeArgs = {
  readme: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupdateTitleArgs = {
  title: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationuploadSchemaArgs = {
  errorOnBadRequest?: Scalars['Boolean'];
  gitContext?: InputMaybe<GitContextInput>;
  historicParameters?: InputMaybe<HistoricQueryParameters>;
  overrideComposedSchema?: Scalars['Boolean'];
  schema?: InputMaybe<IntrospectionSchemaInput>;
  schemaDocument?: InputMaybe<Scalars['String']>;
  tag: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupsertChannelArgs = {
  id?: InputMaybe<Scalars['ID']>;
  pagerDutyChannel?: InputMaybe<PagerDutyChannelInput>;
  slackChannel?: InputMaybe<SlackChannelInput>;
  webhookChannel?: InputMaybe<WebhookChannelInput>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupsertContractVariantArgs = {
  contractVariantName: Scalars['String'];
  filterConfig: FilterConfigInput;
  initiateLaunch?: Scalars['Boolean'];
  sourceVariant?: InputMaybe<Scalars['String']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupsertImplementingServiceAndTriggerCompositionArgs = {
  activePartialSchema: PartialSchemaInput;
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant: Scalars['String'];
  name: Scalars['String'];
  revision: Scalars['String'];
  url?: InputMaybe<Scalars['String']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupsertPagerDutyChannelArgs = {
  channel: PagerDutyChannelInput;
  id?: InputMaybe<Scalars['ID']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupsertQueryTriggerArgs = {
  id?: InputMaybe<Scalars['ID']>;
  trigger: QueryTriggerInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupsertRegistrySubscriptionArgs = {
  channelID?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
  options?: InputMaybe<SubscriptionOptionsInput>;
  variant?: InputMaybe<Scalars['String']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupsertScheduledSummaryArgs = {
  channelID?: InputMaybe<Scalars['ID']>;
  enabled?: InputMaybe<Scalars['Boolean']>;
  id?: InputMaybe<Scalars['ID']>;
  tag?: InputMaybe<Scalars['String']>;
  timezone?: InputMaybe<Scalars['String']>;
  variant?: InputMaybe<Scalars['String']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupsertSlackChannelArgs = {
  channel: SlackChannelInput;
  id?: InputMaybe<Scalars['ID']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationupsertWebhookChannelArgs = {
  id?: InputMaybe<Scalars['ID']>;
  name?: InputMaybe<Scalars['String']>;
  secretToken?: InputMaybe<Scalars['String']>;
  url: Scalars['String'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationvalidateOperationsArgs = {
  gitContext?: InputMaybe<GitContextInput>;
  operations: Array<OperationDocumentInput>;
  tag?: InputMaybe<Scalars['String']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationvalidatePartialSchemaOfImplementingServiceAgainstGraphArgs = {
  graphVariant: Scalars['String'];
  implementingServiceName: Scalars['String'];
  partialSchema: PartialSchemaInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationvariantArgs = {
  name: Scalars['String'];
};

/** Columns of ServiceOperationCheckStats. */
export enum ServiceOperationCheckStatsColumn {
  CACHED_REQUESTS_COUNT = 'CACHED_REQUESTS_COUNT',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP',
  UNCACHED_REQUESTS_COUNT = 'UNCACHED_REQUESTS_COUNT'
}

export type ServiceOperationCheckStatsDimensions = {
  __typename?: 'ServiceOperationCheckStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
};

/** Filter for data in ServiceOperationCheckStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceOperationCheckStatsFilter = {
  and?: InputMaybe<Array<ServiceOperationCheckStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<ServiceOperationCheckStatsFilterIn>;
  not?: InputMaybe<ServiceOperationCheckStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<ServiceOperationCheckStatsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
};

/** Filter for data in ServiceOperationCheckStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceOperationCheckStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type ServiceOperationCheckStatsMetrics = {
  __typename?: 'ServiceOperationCheckStatsMetrics';
  cachedRequestsCount: Scalars['Long'];
  uncachedRequestsCount: Scalars['Long'];
};

export type ServiceOperationCheckStatsOrderBySpec = {
  column: ServiceOperationCheckStatsColumn;
  direction: Ordering;
};

export type ServiceOperationCheckStatsRecord = {
  __typename?: 'ServiceOperationCheckStatsRecord';
  /** Dimensions of ServiceOperationCheckStats that can be grouped by. */
  groupBy: ServiceOperationCheckStatsDimensions;
  /** Metrics of ServiceOperationCheckStats that can be aggregated over. */
  metrics: ServiceOperationCheckStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of ServiceQueryStats. */
export enum ServiceQueryStatsColumn {
  CACHED_HISTOGRAM = 'CACHED_HISTOGRAM',
  CACHED_REQUESTS_COUNT = 'CACHED_REQUESTS_COUNT',
  CACHE_TTL_HISTOGRAM = 'CACHE_TTL_HISTOGRAM',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  FORBIDDEN_OPERATION_COUNT = 'FORBIDDEN_OPERATION_COUNT',
  FROM_ENGINEPROXY = 'FROM_ENGINEPROXY',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REGISTERED_OPERATION_COUNT = 'REGISTERED_OPERATION_COUNT',
  REQUESTS_WITH_ERRORS_COUNT = 'REQUESTS_WITH_ERRORS_COUNT',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP',
  UNCACHED_HISTOGRAM = 'UNCACHED_HISTOGRAM',
  UNCACHED_REQUESTS_COUNT = 'UNCACHED_REQUESTS_COUNT'
}

export type ServiceQueryStatsDimensions = {
  __typename?: 'ServiceQueryStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  fromEngineproxy?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  querySignatureLength?: Maybe<Scalars['Int']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
};

/** Filter for data in ServiceQueryStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceQueryStatsFilter = {
  and?: InputMaybe<Array<ServiceQueryStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose fromEngineproxy dimension equals the given value if not null. To query for the null value, use {in: {fromEngineproxy: [null]}} instead. */
  fromEngineproxy?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<ServiceQueryStatsFilterIn>;
  not?: InputMaybe<ServiceQueryStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<ServiceQueryStatsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
};

/** Filter for data in ServiceQueryStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceQueryStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose fromEngineproxy dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fromEngineproxy?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type ServiceQueryStatsMetrics = {
  __typename?: 'ServiceQueryStatsMetrics';
  cacheTtlHistogram: DurationHistogram;
  cachedHistogram: DurationHistogram;
  cachedRequestsCount: Scalars['Long'];
  forbiddenOperationCount: Scalars['Long'];
  registeredOperationCount: Scalars['Long'];
  requestsWithErrorsCount: Scalars['Long'];
  totalLatencyHistogram: DurationHistogram;
  totalRequestCount: Scalars['Long'];
  uncachedHistogram: DurationHistogram;
  uncachedRequestsCount: Scalars['Long'];
};

export type ServiceQueryStatsOrderBySpec = {
  column: ServiceQueryStatsColumn;
  direction: Ordering;
};

export type ServiceQueryStatsRecord = {
  __typename?: 'ServiceQueryStatsRecord';
  /** Dimensions of ServiceQueryStats that can be grouped by. */
  groupBy: ServiceQueryStatsDimensions;
  /** Metrics of ServiceQueryStats that can be aggregated over. */
  metrics: ServiceQueryStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Individual permissions for the current user when interacting with a particular Studio graph. */
export type ServiceRoles = {
  __typename?: 'ServiceRoles';
  /** Whether the currently authenticated user is permitted to perform schema checks (i.e., run `rover (sub)graph check`). */
  canCheckSchemas: Scalars['Boolean'];
  canCreateProposal: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to create new graph variants. */
  canCreateVariants: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to delete the graph in question */
  canDelete: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to delete proposal variants. */
  canDeleteProposalVariants: Scalars['Boolean'];
  /** Given the graph's setting regarding proposal permission levels, can the current user edit Proposals authored by other users */
  canEditProposal: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to manage user access to the graph in question. */
  canManageAccess: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to manage the build configuration (e.g., build pipeline version). */
  canManageBuildConfig: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to manage third-party integrations (e.g., Datadog forwarding). */
  canManageIntegrations: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to manage graph-level API keys. */
  canManageKeys: Scalars['Boolean'];
  canManagePersistedQueryLists: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to manage proposal permission settings for this graph. */
  canManageProposalPermissions: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to manage proposal settings, like setting the implementation variant, on this graph. */
  canManageProposalSettings: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to perform basic administration of variants (e.g., make a variant public). */
  canManageVariants: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to view details about the build configuration (e.g. build pipeline version). */
  canQueryBuildConfig: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to view details of the check configuration for this graph. */
  canQueryCheckConfiguration: Scalars['Boolean'];
  canQueryDeletedImplementingServices: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to view which subgraphs the graph is composed of. */
  canQueryImplementingServices: Scalars['Boolean'];
  canQueryIntegrations: Scalars['Boolean'];
  canQueryPersistedQueryLists: Scalars['Boolean'];
  canQueryPrivateInfo: Scalars['Boolean'];
  canQueryProposals: Scalars['Boolean'];
  canQueryPublicInfo: Scalars['Boolean'];
  canQueryReadmeAuthor: Scalars['Boolean'];
  canQueryRoleOverrides: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to download schemas owned by this graph. */
  canQuerySchemas: Scalars['Boolean'];
  canQueryStats: Scalars['Boolean'];
  canQueryTokens: Scalars['Boolean'];
  canQueryTraces: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to register operations (i.e. `apollo client:push`) for this graph. */
  canRegisterOperations: Scalars['Boolean'];
  canStoreSchemasWithoutVariant: Scalars['Boolean'];
  canUndelete: Scalars['Boolean'];
  canUpdateAvatar: Scalars['Boolean'];
  canUpdateDescription: Scalars['Boolean'];
  canUpdateTitle: Scalars['Boolean'];
  /** Whether the currently authenticated user is permitted to make updates to the check configuration for this graph. */
  canWriteCheckConfiguration: Scalars['Boolean'];
  service: Service;
};

/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindow = {
  __typename?: 'ServiceStatsWindow';
  billingUsageStats: Array<ServiceBillingUsageStatsRecord>;
  edgeServerInfos: Array<ServiceEdgeServerInfosRecord>;
  errorStats: Array<ServiceErrorStatsRecord>;
  fieldExecutions: Array<ServiceFieldExecutionsRecord>;
  fieldLatencies: Array<ServiceFieldLatenciesRecord>;
  fieldStats: Array<ServiceFieldLatenciesRecord>;
  fieldUsage: Array<ServiceFieldUsageRecord>;
  graphosCloudMetrics: Array<ServiceGraphosCloudMetricsRecord>;
  operationCheckStats: Array<ServiceOperationCheckStatsRecord>;
  queryStats: Array<ServiceQueryStatsRecord>;
  /** From field rounded down to the nearest resolution. */
  roundedDownFrom: Scalars['Timestamp'];
  /** To field rounded up to the nearest resolution. */
  roundedUpTo: Scalars['Timestamp'];
  tracePathErrorsRefs: Array<ServiceTracePathErrorsRefsRecord>;
  traceRefs: Array<ServiceTraceRefsRecord>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowbillingUsageStatsArgs = {
  filter?: InputMaybe<ServiceBillingUsageStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceBillingUsageStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowedgeServerInfosArgs = {
  filter?: InputMaybe<ServiceEdgeServerInfosFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceEdgeServerInfosOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowerrorStatsArgs = {
  filter?: InputMaybe<ServiceErrorStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowfieldExecutionsArgs = {
  filter?: InputMaybe<ServiceFieldExecutionsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceFieldExecutionsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowfieldLatenciesArgs = {
  filter?: InputMaybe<ServiceFieldLatenciesFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceFieldLatenciesOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowfieldStatsArgs = {
  filter?: InputMaybe<ServiceFieldLatenciesFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceFieldLatenciesOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowfieldUsageArgs = {
  filter?: InputMaybe<ServiceFieldUsageFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceFieldUsageOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowgraphosCloudMetricsArgs = {
  filter?: InputMaybe<ServiceGraphosCloudMetricsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceGraphosCloudMetricsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowoperationCheckStatsArgs = {
  filter?: InputMaybe<ServiceOperationCheckStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceOperationCheckStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowqueryStatsArgs = {
  filter?: InputMaybe<ServiceQueryStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceQueryStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowtracePathErrorsRefsArgs = {
  filter?: InputMaybe<ServiceTracePathErrorsRefsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceTracePathErrorsRefsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowtraceRefsArgs = {
  filter?: InputMaybe<ServiceTraceRefsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ServiceTraceRefsOrderBySpec>>;
};

/** Columns of ServiceTracePathErrorsRefs. */
export enum ServiceTracePathErrorsRefsColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  DURATION_BUCKET = 'DURATION_BUCKET',
  ERRORS_COUNT_IN_PATH = 'ERRORS_COUNT_IN_PATH',
  ERRORS_COUNT_IN_TRACE = 'ERRORS_COUNT_IN_TRACE',
  ERROR_MESSAGE = 'ERROR_MESSAGE',
  PATH = 'PATH',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP',
  TRACE_HTTP_STATUS_CODE = 'TRACE_HTTP_STATUS_CODE',
  TRACE_ID = 'TRACE_ID',
  TRACE_SIZE_BYTES = 'TRACE_SIZE_BYTES',
  TRACE_STARTS_AT = 'TRACE_STARTS_AT'
}

export type ServiceTracePathErrorsRefsDimensions = {
  __typename?: 'ServiceTracePathErrorsRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationBucket?: Maybe<Scalars['Int']>;
  errorMessage?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  traceHttpStatusCode?: Maybe<Scalars['Int']>;
  traceId?: Maybe<Scalars['ID']>;
  traceStartsAt?: Maybe<Scalars['Timestamp']>;
};

/** Filter for data in ServiceTracePathErrorsRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceTracePathErrorsRefsFilter = {
  and?: InputMaybe<Array<ServiceTracePathErrorsRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']>;
  /** Selects rows whose errorMessage dimension equals the given value if not null. To query for the null value, use {in: {errorMessage: [null]}} instead. */
  errorMessage?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<ServiceTracePathErrorsRefsFilterIn>;
  not?: InputMaybe<ServiceTracePathErrorsRefsFilter>;
  or?: InputMaybe<Array<ServiceTracePathErrorsRefsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose traceHttpStatusCode dimension equals the given value if not null. To query for the null value, use {in: {traceHttpStatusCode: [null]}} instead. */
  traceHttpStatusCode?: InputMaybe<Scalars['Int']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in ServiceTracePathErrorsRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceTracePathErrorsRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  /** Selects rows whose errorMessage dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorMessage?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose traceHttpStatusCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceHttpStatusCode?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type ServiceTracePathErrorsRefsMetrics = {
  __typename?: 'ServiceTracePathErrorsRefsMetrics';
  errorsCountInPath: Scalars['Long'];
  errorsCountInTrace: Scalars['Long'];
  traceSizeBytes: Scalars['Long'];
};

export type ServiceTracePathErrorsRefsOrderBySpec = {
  column: ServiceTracePathErrorsRefsColumn;
  direction: Ordering;
};

export type ServiceTracePathErrorsRefsRecord = {
  __typename?: 'ServiceTracePathErrorsRefsRecord';
  /** Dimensions of ServiceTracePathErrorsRefs that can be grouped by. */
  groupBy: ServiceTracePathErrorsRefsDimensions;
  /** Metrics of ServiceTracePathErrorsRefs that can be aggregated over. */
  metrics: ServiceTracePathErrorsRefsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of ServiceTraceRefs. */
export enum ServiceTraceRefsColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  DURATION_BUCKET = 'DURATION_BUCKET',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP',
  TRACE_COUNT = 'TRACE_COUNT',
  TRACE_ID = 'TRACE_ID'
}

export type ServiceTraceRefsDimensions = {
  __typename?: 'ServiceTraceRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationBucket?: Maybe<Scalars['Int']>;
  generatedTraceId?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  traceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in ServiceTraceRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceTraceRefsFilter = {
  and?: InputMaybe<Array<ServiceTraceRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<ServiceTraceRefsFilterIn>;
  not?: InputMaybe<ServiceTraceRefsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<ServiceTraceRefsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in ServiceTraceRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceTraceRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type ServiceTraceRefsMetrics = {
  __typename?: 'ServiceTraceRefsMetrics';
  traceCount: Scalars['Long'];
};

export type ServiceTraceRefsOrderBySpec = {
  column: ServiceTraceRefsColumn;
  direction: Ordering;
};

export type ServiceTraceRefsRecord = {
  __typename?: 'ServiceTraceRefsRecord';
  /** Dimensions of ServiceTraceRefs that can be grouped by. */
  groupBy: ServiceTraceRefsDimensions;
  /** Metrics of ServiceTraceRefs that can be aggregated over. */
  metrics: ServiceTraceRefsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type SetMinApproversResult = PermissionError | Service | ValidationError;

export type SetMinProposalApproversInput = {
  minApprovers?: InputMaybe<Scalars['Int']>;
};

/** Represents the possible outcomes of a setNextVersion mutation */
export type SetNextVersionResult = InternalServerError | InvalidInputErrors | RouterVersion;

export type SetProposalDefaultReviewersInput = {
  reviewerUserIds: Array<Scalars['ID']>;
};

export type SetProposalDefaultReviewersResult = PermissionError | Service | ValidationError;

export type SetProposalDescriptionTemplateInput = {
  descriptionTemplate?: InputMaybe<Scalars['String']>;
};

export type SetProposalDescriptionTemplateResult = PermissionError | Service | ValidationError;

export type SetProposalImplementationVariantResult = PermissionError | Service | ValidationError;

export type SetProposalNotificationStatusInput = {
  /** NotificationStatus to set for the current active user.  */
  status: NotificationStatus;
};

export type SetProposalNotificationStatusResult = PermissionError | Service | ValidationError;

export type SetProposalRolesInput = {
  create?: InputMaybe<UserPermission>;
  edit?: InputMaybe<UserPermission>;
};

export type SetProposalRolesResult = PermissionError | Service | ValidationError;

export type SetupIntentResult = NotFoundError | PermissionError | SetupIntentSuccess;

export type SetupIntentSuccess = {
  __typename?: 'SetupIntentSuccess';
  clientSecret: Scalars['String'];
};

/**
 * Shard for Cloud Routers
 *
 * This represents a specific shard where a Cloud Router can run
 */
export type Shard = {
  __typename?: 'Shard';
  gcuCapacity?: Maybe<Scalars['Int']>;
  gcuUsage: Scalars['Int'];
  id: Scalars['ID'];
  provider: CloudProvider;
  /** Details of this shard for a specific provider */
  providerDetails: ShardProvider;
  reason?: Maybe<Scalars['String']>;
  region: RegionDescription;
  routerCapacity?: Maybe<Scalars['Int']>;
  routerUsage: Scalars['Int'];
  routers: Array<Router>;
  status: ShardStatus;
  tier: CloudTier;
};


/**
 * Shard for Cloud Routers
 *
 * This represents a specific shard where a Cloud Router can run
 */
export type ShardroutersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

/** Provider-specific information for a Shard */
export type ShardProvider = AwsShard | FlyShard;

/** Represents the possible outcomes of a shard mutation */
export type ShardResult = InternalServerError | InvalidInputErrors | ShardSuccess;

/** Current status of Cloud Shards */
export enum ShardStatus {
  /** The Shard is active and ready to accept new Cloud Routers */
  ACTIVE = 'ACTIVE',
  /** The Shard no long exists */
  DELETED = 'DELETED',
  /** The Shard is working as expected, but should not be used to provision new Cloud Routers */
  DEPRECATED = 'DEPRECATED',
  /**
   * The Shard is suffering from a temporary degradation that might impact provisioning new
   * Cloud Routers
   */
  IMPAIRED = 'IMPAIRED',
  /**
   * The Shard is currently being updated and should temporarily not be used to provision new
   * Cloud Routers
   */
  UPDATING = 'UPDATING'
}

/** Success branch of an shard mutation */
export type ShardSuccess = {
  __typename?: 'ShardSuccess';
  shard: Shard;
};

/** Slack notification channel */
export type SlackChannel = Channel & {
  __typename?: 'SlackChannel';
  id: Scalars['ID'];
  name: Scalars['String'];
  subscriptions: Array<ChannelSubscription>;
  url: Scalars['String'];
};

/** Slack notification channel parameters */
export type SlackChannelInput = {
  name?: InputMaybe<Scalars['String']>;
  url: Scalars['String'];
};

export type SlackCommunicationChannel = CommunicationChannel & {
  __typename?: 'SlackCommunicationChannel';
  id: Scalars['ID'];
  name: Scalars['String'];
  purpose?: Maybe<Scalars['String']>;
  topic?: Maybe<Scalars['String']>;
};

export type SlackMessageMeta = {
  __typename?: 'SlackMessageMeta';
  id: Scalars['ID'];
};

export type SlackNotificationField = {
  key: Scalars['String'];
  value: Scalars['String'];
};

/** Slack notification message */
export type SlackNotificationInput = {
  color?: InputMaybe<Scalars['String']>;
  fallback: Scalars['String'];
  fields?: InputMaybe<Array<SlackNotificationField>>;
  iconUrl?: InputMaybe<Scalars['String']>;
  text?: InputMaybe<Scalars['String']>;
  timestamp?: InputMaybe<Scalars['Timestamp']>;
  title?: InputMaybe<Scalars['String']>;
  titleLink?: InputMaybe<Scalars['String']>;
  username?: InputMaybe<Scalars['String']>;
};

export enum SlackPublishState {
  errored = 'errored',
  published = 'published',
  recalled = 'recalled'
}

/** A location in a source code file. */
export type SourceLocation = {
  __typename?: 'SourceLocation';
  /** Column number. */
  column: Scalars['Int'];
  /** Line number. */
  line: Scalars['Int'];
};

export type SsoConfig = {
  __typename?: 'SsoConfig';
  connection?: Maybe<SsoConnection>;
  defaultRole: UserPermission;
};

export type SsoConnection = {
  domains: Array<Scalars['String']>;
  id: Scalars['ID'];
  idpId: Scalars['ID'];
};

export type SsoMutation = {
  __typename?: 'SsoMutation';
  deleteSsoConnection?: Maybe<Scalars['Void']>;
  disableSsoConnection?: Maybe<Scalars['Void']>;
  enableSsoConnection?: Maybe<Scalars['Void']>;
};


export type SsoMutationdeleteSsoConnectionArgs = {
  id: Scalars['ID'];
};


export type SsoMutationdisableSsoConnectionArgs = {
  id: Scalars['ID'];
};


export type SsoMutationenableSsoConnectionArgs = {
  id: Scalars['ID'];
};

export type SsoQuery = {
  __typename?: 'SsoQuery';
  /** Parses a SAML IDP metadata XML string and returns the parsed metadata */
  parseSamlIdpMetadata?: Maybe<ParsedSamlIdpMetadata>;
};


export type SsoQueryparseSamlIdpMetadataArgs = {
  metadata: Scalars['String'];
};

export type StartUsageBasedPlanResult = Account | NotFoundError | PermissionError | StartUsageBasedPlanSuccess | ValidationError;

export type StartUsageBasedPlanSuccess = {
  __typename?: 'StartUsageBasedPlanSuccess';
  customerPlanId: Scalars['String'];
};

export enum State {
  approved = 'approved',
  denied = 'denied',
  errored = 'errored',
  pending = 'pending',
  published = 'published'
}

/** A time window with a specified granularity. */
export type StatsWindow = {
  __typename?: 'StatsWindow';
  billingUsageStats: Array<BillingUsageStatsRecord>;
  edgeServerInfos: Array<EdgeServerInfosRecord>;
  errorStats: Array<ErrorStatsRecord>;
  fieldExecutions: Array<FieldExecutionsRecord>;
  fieldLatencies: Array<FieldLatenciesRecord>;
  fieldUsage: Array<FieldUsageRecord>;
  graphosCloudMetrics: Array<GraphosCloudMetricsRecord>;
  operationCheckStats: Array<OperationCheckStatsRecord>;
  queryStats: Array<QueryStatsRecord>;
  /** From field rounded down to the nearest resolution. */
  roundedDownFrom: Scalars['Timestamp'];
  /** To field rounded up to the nearest resolution. */
  roundedUpTo: Scalars['Timestamp'];
  tracePathErrorsRefs: Array<TracePathErrorsRefsRecord>;
  traceRefs: Array<TraceRefsRecord>;
};


/** A time window with a specified granularity. */
export type StatsWindowbillingUsageStatsArgs = {
  filter?: InputMaybe<BillingUsageStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<BillingUsageStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowedgeServerInfosArgs = {
  filter?: InputMaybe<EdgeServerInfosFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<EdgeServerInfosOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowerrorStatsArgs = {
  filter?: InputMaybe<ErrorStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowfieldExecutionsArgs = {
  filter?: InputMaybe<FieldExecutionsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<FieldExecutionsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowfieldLatenciesArgs = {
  filter?: InputMaybe<FieldLatenciesFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<FieldLatenciesOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowfieldUsageArgs = {
  filter?: InputMaybe<FieldUsageFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<FieldUsageOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowgraphosCloudMetricsArgs = {
  filter?: InputMaybe<GraphosCloudMetricsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<GraphosCloudMetricsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowoperationCheckStatsArgs = {
  filter?: InputMaybe<OperationCheckStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<OperationCheckStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowqueryStatsArgs = {
  filter?: InputMaybe<QueryStatsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<QueryStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowtracePathErrorsRefsArgs = {
  filter?: InputMaybe<TracePathErrorsRefsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TracePathErrorsRefsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowtraceRefsArgs = {
  filter?: InputMaybe<TraceRefsFilter>;
  limit?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<TraceRefsOrderBySpec>>;
};

/** Possible status of a Cloud Router version */
export enum Status {
  /**
   * Deprecated version of a Cloud Router
   *
   * New Cloud Routers should not use this version, and this will not be
   * supported at some point in the future.
   */
  DEPRECATED = 'DEPRECATED',
  /**
   * Upcoming or experimental version of a Cloud Router
   *
   * This should only be used internally, or to preview new features to
   * customers.
   */
  NEXT = 'NEXT',
  /** Cloud Router Version is ready to be used by end users */
  STABLE = 'STABLE'
}

export type StoreSchemaError = {
  __typename?: 'StoreSchemaError';
  code: StoreSchemaErrorCode;
  message: Scalars['String'];
};

export enum StoreSchemaErrorCode {
  SCHEMA_IS_NOT_PARSABLE = 'SCHEMA_IS_NOT_PARSABLE',
  SCHEMA_IS_NOT_VALID = 'SCHEMA_IS_NOT_VALID'
}

export type StoreSchemaResponse = {
  __typename?: 'StoreSchemaResponse';
  sha256: Scalars['SHA256'];
};

export type StoreSchemaResponseOrError = StoreSchemaError | StoreSchemaResponse;

export type StoredApprovedChange = {
  __typename?: 'StoredApprovedChange';
  argNode?: Maybe<NamedIntrospectionArgNoDescription>;
  childNode?: Maybe<NamedIntrospectionValueNoDescription>;
  code: ChangeCode;
  parentNode?: Maybe<NamedIntrospectionTypeNoDescription>;
};

export type StringToString = {
  __typename?: 'StringToString';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type StringToStringInput = {
  key: Scalars['String'];
  value: Scalars['String'];
};

/** A subgraph in a federated Studio supergraph. */
export type Subgraph = {
  __typename?: 'Subgraph';
  /** The subgraph schema document's SHA256 hash, represented as a hexadecimal string. */
  hash: Scalars['String'];
  /** The subgraph's registered name. */
  name: Scalars['String'];
  /** The number of fields in this subgraph */
  numberOfFields?: Maybe<Scalars['Int']>;
  /** The number of types in this subgraph */
  numberOfTypes?: Maybe<Scalars['Int']>;
  /** The revision string of this publish if provided */
  revision?: Maybe<Scalars['String']>;
  /** The subgraph's routing URL, provided to gateways that use managed federation. */
  routingURL: Scalars['String'];
  /** The subgraph schema document. */
  sdl: Scalars['String'];
  /** Timestamp of when the subgraph was published. */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};


/** A subgraph in a federated Studio supergraph. */
export type SubgraphsdlArgs = {
  graphId: Scalars['ID'];
};

/** A change made to a subgraph as part of a launch. */
export type SubgraphChange = {
  __typename?: 'SubgraphChange';
  /** The subgraph's name. */
  name: Scalars['ID'];
  /** The type of change that was made. */
  type: SubgraphChangeType;
};

export enum SubgraphChangeType {
  ADDITION = 'ADDITION',
  DELETION = 'DELETION',
  MODIFICATION = 'MODIFICATION'
}

/** Input type to provide when running schema checks asynchronously for a federated supergraph. */
export type SubgraphCheckAsyncInput = {
  /** Configuration options for the check execution. */
  config: HistoricQueryParametersInput;
  /** The GitHub context to associate with the check. */
  gitContext: GitContextInput;
  /** The graph ref of the Studio graph and variant to run checks against (such as `my-graph@current`). */
  graphRef?: InputMaybe<Scalars['ID']>;
  /** The URL of the GraphQL endpoint that Apollo Sandbox introspected to obtain the proposed schema. Required if `isSandbox` is `true`. */
  introspectionEndpoint?: InputMaybe<Scalars['String']>;
  /** If `true`, the check was initiated automatically by a Proposal update. */
  isProposal?: InputMaybe<Scalars['Boolean']>;
  /** If `true`, the check was initiated by Apollo Sandbox. */
  isSandbox: Scalars['Boolean'];
  /** The proposed subgraph schema to perform checks with. */
  proposedSchema: Scalars['GraphQLDocument'];
  /** The source variant that this check should use the operations check configuration from */
  sourceVariant?: InputMaybe<Scalars['String']>;
  /** The name of the subgraph to check schema changes for. */
  subgraphName: Scalars['String'];
  /** The user that triggered this check. If null, defaults to authContext to determine user. */
  triggeredBy?: InputMaybe<ActorInput>;
};

/** A subgraph in a federated Studio supergraph. */
export type SubgraphCheckInput = {
  /** The subgraph schema document's SHA256 hash, represented as a hexadecimal string. */
  hash: Scalars['String'];
  /** The subgraph's registered name. */
  name: Scalars['String'];
};

export type SubgraphConfig = {
  __typename?: 'SubgraphConfig';
  id: Scalars['ID'];
  name: Scalars['String'];
  schemaHash: Scalars['String'];
  sdl: Scalars['String'];
  url: Scalars['String'];
};

export type SubgraphHashInput = {
  /** SHA256 of the subgraph schema sdl. */
  hash: Scalars['String'];
  name: Scalars['String'];
};

export type SubgraphInput = {
  /** We are either going to pass in a document or a schema reference */
  document?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  routingURL: Scalars['String'];
  /**
   * Reference to a schema in studio.
   * If this is a mutable ref i.e. graphRef then it will link (tbd)
   * If it is a stable ref i.e. hash then it
   */
  schemaRef?: InputMaybe<Scalars['String']>;
};

export type SubgraphKeyMap = {
  __typename?: 'SubgraphKeyMap';
  keys: Array<Scalars['String']>;
  subgraphName: Scalars['String'];
};

export type SubgraphSdlCheckInput = {
  name: Scalars['String'];
  sdl: Scalars['GraphQLDocument'];
};

export type SubscriptionCapability = {
  __typename?: 'SubscriptionCapability';
  label: Scalars['String'];
  subscription: BillingSubscription;
  value: Scalars['Boolean'];
};

export type SubscriptionLimit = {
  __typename?: 'SubscriptionLimit';
  label: Scalars['String'];
  subscription: BillingSubscription;
  value: Scalars['Long'];
};

export type SubscriptionOptions = {
  __typename?: 'SubscriptionOptions';
  /** Enables notifications for schema updates */
  schemaUpdates: Scalars['Boolean'];
};

export type SubscriptionOptionsInput = {
  /** Enables notifications for schema updates */
  schemaUpdates: Scalars['Boolean'];
};

export enum SubscriptionState {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  FUTURE = 'FUTURE',
  PAST_DUE = 'PAST_DUE',
  PAUSED = 'PAUSED',
  PENDING = 'PENDING',
  UNKNOWN = 'UNKNOWN'
}

export type Survey = {
  __typename?: 'Survey';
  id: Scalars['String'];
  isComplete: Scalars['Boolean'];
  questionAnswers: Array<SurveyQuestionAnswer>;
  shouldShow: Scalars['Boolean'];
};

export type SurveyQuestionAnswer = {
  __typename?: 'SurveyQuestionAnswer';
  answerValue?: Maybe<Scalars['String']>;
  questionKey: Scalars['String'];
};

export type SurveyQuestionInput = {
  answerValue?: InputMaybe<Scalars['String']>;
  questionKey: Scalars['String'];
};

export type SyncBillingAccountResult = PermissionError | SyncBillingAccountSuccess;

export type SyncBillingAccountSuccess = {
  __typename?: 'SyncBillingAccountSuccess';
  message: Scalars['String'];
};

/** User input for a resource share mutation */
export type SyncPrivateSubgraphsInput = {
  /** A unique identifier for the private subgraph */
  identifier: Scalars['String'];
  /** The cloud provider where the private subgraph is hosted */
  provider: CloudProvider;
};

export type TemporaryURL = {
  __typename?: 'TemporaryURL';
  url: Scalars['String'];
};

export enum ThemeName {
  DARK = 'DARK',
  LIGHT = 'LIGHT'
}

/** Throttle error */
export type ThrottleError = Error & {
  __typename?: 'ThrottleError';
  message: Scalars['String'];
  retryAfter?: Maybe<Scalars['Int']>;
};

export enum TicketPriority {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3'
}

export enum TicketStatus {
  CLOSED = 'CLOSED',
  HOLD = 'HOLD',
  NEW = 'NEW',
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  SOLVED = 'SOLVED'
}

export type TimezoneOffset = {
  __typename?: 'TimezoneOffset';
  minutesOffsetFromUTC: Scalars['Int'];
  zoneID: Scalars['String'];
};

/** Counts of changes. */
export type TotalChangeSummaryCounts = {
  __typename?: 'TotalChangeSummaryCounts';
  /**
   * Number of changes that are additions. This includes adding types, adding fields to object, input
   * object, and interface types, adding values to enums, adding members to interfaces and unions, and
   * adding arguments.
   */
  additions: Scalars['Int'];
  /** Number of changes that are new usages of the @deprecated directive. */
  deprecations: Scalars['Int'];
  /**
   * Number of changes that are edits. This includes types changing kind, fields and arguments
   * changing type, arguments changing default value, and any description changes. This also includes
   * edits to @deprecated reason strings.
   */
  edits: Scalars['Int'];
  /**
   * Number of changes that are removals. This includes removing types, removing fields from object,
   * input object, and interface types, removing values from enums, removing members from interfaces
   * and unions, and removing arguments. This also includes removing @deprecated usages.
   */
  removals: Scalars['Int'];
};

export type Trace = {
  __typename?: 'Trace';
  agentVersion?: Maybe<Scalars['String']>;
  cacheMaxAgeMs?: Maybe<Scalars['Float']>;
  cacheScope?: Maybe<CacheScope>;
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationMs: Scalars['Float'];
  endTime: Scalars['Timestamp'];
  http?: Maybe<TraceHTTP>;
  id: Scalars['ID'];
  /**
   * True if the report containing the trace was submitted as potentially incomplete, which can happen if the Router's
   * trace buffer fills up while constructing the trace. If this is true, the trace might be missing some nodes.
   */
  isIncomplete: Scalars['Boolean'];
  operationName?: Maybe<Scalars['String']>;
  protobuf: Protobuf;
  root: TraceNode;
  signature: Scalars['String'];
  startTime: Scalars['Timestamp'];
  unexecutedOperationBody?: Maybe<Scalars['String']>;
  unexecutedOperationName?: Maybe<Scalars['String']>;
  variablesJSON: Array<StringToString>;
};

export type TraceError = {
  __typename?: 'TraceError';
  json: Scalars['String'];
  locations: Array<TraceSourceLocation>;
  message: Scalars['String'];
  timestamp?: Maybe<Scalars['Timestamp']>;
};

export type TraceHTTP = {
  __typename?: 'TraceHTTP';
  method: HTTPMethod;
  requestHeaders: Array<StringToString>;
  responseHeaders: Array<StringToString>;
  statusCode: Scalars['Int'];
};

export type TraceNode = {
  __typename?: 'TraceNode';
  cacheMaxAgeMs?: Maybe<Scalars['Float']>;
  cacheScope?: Maybe<CacheScope>;
  /** The total number of children, including the ones that were truncated. */
  childCount: Scalars['Int'];
  /**
   * The immediate children of the node. There is a maximum number of children we will return so
   * this might be truncated, but childCount will always have the total count.
   */
  children: Array<TraceNode>;
  /** Whether the children of this node have been truncated because the number of children is over the max. */
  childrenAreTruncated: Scalars['Boolean'];
  /**
   * The IDs of the immediate children of the node. There is a maximum number of children we will
   * return so this might be truncated, but childCount will always have the total count.
   */
  childrenIds: Array<Scalars['ID']>;
  /**
   * All children, and the children of those children, and so on. Children that have been truncated
   * are not included.
   */
  descendants: Array<TraceNode>;
  /**
   * All IDs of children, and the IDs of the children of those children, and so on. Children that
   * have been truncated are not included.
   */
  descendantsIds: Array<Scalars['ID']>;
  /**
   * The end time of the node. If this is a fetch node (meaning isFetch is true), this will be the
   * time that the gateway/router received the response from the subgraph server in the
   * gateway/routers clock time.
   */
  endTime: Scalars['Timestamp'];
  errors: Array<TraceError>;
  id: Scalars['ID'];
  /**
   * Whether the fetch node in question is a descendent of a Deferred node in the trace's query plan. The nodes
   * in query plans can be complicated and nested, so this is a fairly simple representation of the structure.
   */
  isDeferredFetch: Scalars['Boolean'];
  /**
   * Whether the node in question represents a fetch node within a query plan. If so, this will contain
   * children with timestamps that are calculated by the router/gateway rather than subgraph and the
   * fields subgraphStartTime and subgraphEndTime will be non-null.
   */
  isFetch: Scalars['Boolean'];
  key?: Maybe<Scalars['StringOrInt']>;
  originalFieldName?: Maybe<Scalars['String']>;
  parent: Scalars['ID'];
  parentId?: Maybe<Scalars['ID']>;
  path: Array<Scalars['String']>;
  /**
   * The start time of the node. If this is a fetch node (meaning isFetch is true), this will be the
   * time that the gateway/router sent the request to the subgraph server in the gateway/router's clock
   * time.
   */
  startTime: Scalars['Timestamp'];
  /**
   * Only present when the node in question is a fetch node, this will indicate the timestamp at which
   * the subgraph server returned a response to the gateway/router. This timestamp is based on the
   * subgraph server's clock, so if there is a clock skew between the subgraph and the gateway/router,
   * this and endTime will not be in sync. If this is a fetch node but we don't receive subgraph traces
   * (e.g. if the subgraph doesn't support federated traces), this value will be null.
   */
  subgraphEndTime?: Maybe<Scalars['Timestamp']>;
  /**
   * Only present when the node in question is a fetch node, this will indicate the timestamp at which
   * the fetch was received by the subgraph server. This timestamp is based on the subgraph server's
   * clock, so if there is a clock skew between the subgraph and the gateway/router, this and startTime
   * will not be in sync. If this is a fetch node but we don't receive subgraph traces (e.g. if the
   * subgraph doesn't support federated traces), this value will be null.
   */
  subgraphStartTime?: Maybe<Scalars['Timestamp']>;
  type?: Maybe<Scalars['String']>;
};

/** Columns of TracePathErrorsRefs. */
export enum TracePathErrorsRefsColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  DURATION_BUCKET = 'DURATION_BUCKET',
  ERRORS_COUNT_IN_PATH = 'ERRORS_COUNT_IN_PATH',
  ERRORS_COUNT_IN_TRACE = 'ERRORS_COUNT_IN_TRACE',
  ERROR_MESSAGE = 'ERROR_MESSAGE',
  PATH = 'PATH',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP',
  TRACE_HTTP_STATUS_CODE = 'TRACE_HTTP_STATUS_CODE',
  TRACE_ID = 'TRACE_ID',
  TRACE_SIZE_BYTES = 'TRACE_SIZE_BYTES',
  TRACE_STARTS_AT = 'TRACE_STARTS_AT'
}

export type TracePathErrorsRefsDimensions = {
  __typename?: 'TracePathErrorsRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationBucket?: Maybe<Scalars['Int']>;
  errorMessage?: Maybe<Scalars['String']>;
  /** If metrics were collected from a federated service, this field will be prefixed with `service:<SERVICE_NAME>.` */
  path?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  traceHttpStatusCode?: Maybe<Scalars['Int']>;
  traceId?: Maybe<Scalars['ID']>;
  traceStartsAt?: Maybe<Scalars['Timestamp']>;
};

/** Filter for data in TracePathErrorsRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type TracePathErrorsRefsFilter = {
  and?: InputMaybe<Array<TracePathErrorsRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']>;
  /** Selects rows whose errorMessage dimension equals the given value if not null. To query for the null value, use {in: {errorMessage: [null]}} instead. */
  errorMessage?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<TracePathErrorsRefsFilterIn>;
  not?: InputMaybe<TracePathErrorsRefsFilter>;
  or?: InputMaybe<Array<TracePathErrorsRefsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose traceHttpStatusCode dimension equals the given value if not null. To query for the null value, use {in: {traceHttpStatusCode: [null]}} instead. */
  traceHttpStatusCode?: InputMaybe<Scalars['Int']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in TracePathErrorsRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type TracePathErrorsRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  /** Selects rows whose errorMessage dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorMessage?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose traceHttpStatusCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceHttpStatusCode?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type TracePathErrorsRefsMetrics = {
  __typename?: 'TracePathErrorsRefsMetrics';
  errorsCountInPath: Scalars['Long'];
  errorsCountInTrace: Scalars['Long'];
  traceSizeBytes: Scalars['Long'];
};

export type TracePathErrorsRefsOrderBySpec = {
  column: TracePathErrorsRefsColumn;
  direction: Ordering;
};

export type TracePathErrorsRefsRecord = {
  __typename?: 'TracePathErrorsRefsRecord';
  /** Dimensions of TracePathErrorsRefs that can be grouped by. */
  groupBy: TracePathErrorsRefsDimensions;
  /** Metrics of TracePathErrorsRefs that can be aggregated over. */
  metrics: TracePathErrorsRefsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of TraceRefs. */
export enum TraceRefsColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  DURATION_BUCKET = 'DURATION_BUCKET',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  SCHEMA_HASH = 'SCHEMA_HASH',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP',
  TRACE_COUNT = 'TRACE_COUNT',
  TRACE_ID = 'TRACE_ID'
}

export type TraceRefsDimensions = {
  __typename?: 'TraceRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationBucket?: Maybe<Scalars['Int']>;
  generatedTraceId?: Maybe<Scalars['String']>;
  operationSubtype?: Maybe<Scalars['String']>;
  operationType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  traceId?: Maybe<Scalars['ID']>;
};

/** Filter for data in TraceRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type TraceRefsFilter = {
  and?: InputMaybe<Array<TraceRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<TraceRefsFilterIn>;
  not?: InputMaybe<TraceRefsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<TraceRefsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']>;
};

/** Filter for data in TraceRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type TraceRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type TraceRefsMetrics = {
  __typename?: 'TraceRefsMetrics';
  traceCount: Scalars['Long'];
};

export type TraceRefsOrderBySpec = {
  column: TraceRefsColumn;
  direction: Ordering;
};

export type TraceRefsRecord = {
  __typename?: 'TraceRefsRecord';
  /** Dimensions of TraceRefs that can be grouped by. */
  groupBy: TraceRefsDimensions;
  /** Metrics of TraceRefs that can be aggregated over. */
  metrics: TraceRefsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type TraceSourceLocation = {
  __typename?: 'TraceSourceLocation';
  column: Scalars['Int'];
  line: Scalars['Int'];
};

/** Counts of changes at the type level, including interfaces, unions, enums, scalars, input objects, etc. */
export type TypeChangeSummaryCounts = {
  __typename?: 'TypeChangeSummaryCounts';
  /** Number of changes that are additions of types. */
  additions: Scalars['Int'];
  /**
   * Number of changes that are edits. This includes types changing kind and any type description
   * changes, but also includes adding/removing values from enums, adding/removing members from
   * interfaces and unions, and any enum value deprecation and description changes.
   */
  edits: Scalars['Int'];
  /** Number of changes that are removals of types. */
  removals: Scalars['Int'];
};

/**
 * the TypeFilterConfig is used to isolate
 * types, and subsequent fields, through
 * various configuration settings.
 *
 * It defaults to filter towards user defined
 * types only
 */
export type TypeFilterConfig = {
  /** include abstract types (interfaces and unions) */
  includeAbstractTypes?: InputMaybe<Scalars['Boolean']>;
  /** include built in scalars (i.e. Boolean, Int, etc) */
  includeBuiltInTypes?: InputMaybe<Scalars['Boolean']>;
  /** include reserved introspection types (i.e. __Type) */
  includeIntrospectionTypes?: InputMaybe<Scalars['Boolean']>;
};

export type URI = {
  __typename?: 'URI';
  /** A GCS URI */
  gcs: Scalars['String'];
};

export type UnignoreOperationsInChecksResult = {
  __typename?: 'UnignoreOperationsInChecksResult';
  graph: Service;
};

export type UnlinkPersistedQueryListResult = {
  __typename?: 'UnlinkPersistedQueryListResult';
  graphVariant: GraphVariant;
  unlinkedPersistedQueryList: PersistedQueryList;
};

export type UnlinkPersistedQueryListResultOrError = PermissionError | UnlinkPersistedQueryListResult | VariantAlreadyUnlinkedError;

/** Input to update an AWS shard */
export type UpdateAwsShardInput = {
  accountId?: InputMaybe<Scalars['String']>;
  coldStartTargetGroupArns?: InputMaybe<Array<Scalars['String']>>;
  ecsClusterArn?: InputMaybe<Scalars['String']>;
  iamRoleArn?: InputMaybe<Scalars['String']>;
  loadbalancerSecurityGroupId?: InputMaybe<Scalars['String']>;
  loadbalancers?: InputMaybe<Array<AwsLoadBalancerInput>>;
  permissionsBoundaryArn?: InputMaybe<Scalars['String']>;
  region?: InputMaybe<Scalars['String']>;
  subnetIds?: InputMaybe<Array<Scalars['String']>>;
  vpcId?: InputMaybe<Scalars['String']>;
};

export type UpdateBillingPlanInput = {
  billingModel: BillingModel;
  clientVersions: Scalars['Boolean'];
  clients: Scalars['Boolean'];
  contracts: Scalars['Boolean'];
  datadog: Scalars['Boolean'];
  errors: Scalars['Boolean'];
  federation: Scalars['Boolean'];
  intervalLength: Scalars['Int'];
  intervalUnit: Scalars['String'];
  kind: BillingPlanKind;
  launches: Scalars['Boolean'];
  maxAuditInDays: Scalars['Int'];
  maxRangeInDays: Scalars['Int'];
  maxSelfHostedRequestsPerMonth: Scalars['Long'];
  metrics: Scalars['Boolean'];
  notifications: Scalars['Boolean'];
  operationRegistry: Scalars['Boolean'];
  persistedQueries: Scalars['Boolean'];
  proposals: Scalars['Boolean'];
  public: Scalars['Boolean'];
  schemaValidation: Scalars['Boolean'];
  traces: Scalars['Boolean'];
  userRoles: Scalars['Boolean'];
  webhooks: Scalars['Boolean'];
};

/** Input to update a proposal description */
export type UpdateDescriptionInput = {
  /** A proposal description */
  description: Scalars['String'];
};

/** Input to update a Fly shard */
export type UpdateFlyShardInput = {
  endpoint?: InputMaybe<Scalars['String']>;
  etcdEndpoints?: InputMaybe<Array<Scalars['String']>>;
  organizationId?: InputMaybe<Scalars['String']>;
  region?: InputMaybe<Scalars['String']>;
};

export type UpdateOperationCollectionEntryResult = OperationCollectionEntry | PermissionError | ValidationError;

export type UpdateOperationCollectionResult = OperationCollection | PermissionError | ValidationError;

export type UpdatePaymentMethodResult = Account | NotFoundError | PermissionError | UpdatePaymentMethodSuccess;

export type UpdatePaymentMethodSuccess = {
  __typename?: 'UpdatePaymentMethodSuccess';
  paymentMethodId: Scalars['String'];
};

export type UpdatePersistedQueryListMetadataResult = {
  __typename?: 'UpdatePersistedQueryListMetadataResult';
  persistedQueryList: PersistedQueryList;
};

export type UpdatePersistedQueryListMetadataResultOrError = PermissionError | UpdatePersistedQueryListMetadataResult;

export type UpdateProposalResult = PermissionError | Proposal | ValidationError;

export type UpdateRequestedReviewersInput = {
  reviewerUserIdsToAdd?: InputMaybe<Array<Scalars['ID']>>;
  reviewerUserIdsToRemove?: InputMaybe<Array<Scalars['ID']>>;
};

export type UpdateRequestedReviewersResult = PermissionError | Proposal | ValidationError;

/** Input for updating a  Cloud Router */
export type UpdateRouterInput = {
  /**
   * Number of GCUs allocated for the Cloud Router
   *
   * This is ignored for serverless Cloud Routers
   */
  gcus?: InputMaybe<Scalars['Int']>;
  /** Graph composition ID, also known as launch ID */
  graphCompositionId?: InputMaybe<Scalars['String']>;
  /** Unique identifier for ordering orders */
  orderingId: Scalars['String'];
  /** Configuration for the Cloud Router */
  routerConfig?: InputMaybe<Scalars['String']>;
  /** Router version for the Cloud Router */
  routerVersion?: InputMaybe<Scalars['String']>;
};

/** Represents the possible outcomes of an updateRouter mutation */
export type UpdateRouterResult = InternalServerError | InvalidInputErrors | UpdateRouterSuccess;

/**
 * Success branch of an updateRouter mutation.
 * id of the order can be polled via Query.cloud().order(id: ID!) to check-in
 * on the progress of the underlying operation
 */
export type UpdateRouterSuccess = {
  __typename?: 'UpdateRouterSuccess';
  order: Order;
};

/** Result of an updateVersion mutation */
export type UpdateRouterVersionResult = CloudInvalidInputError | InternalServerError | RouterVersion;

/** Input to update an existing Shard */
export type UpdateShardInput = {
  aws?: InputMaybe<UpdateAwsShardInput>;
  fly?: InputMaybe<UpdateFlyShardInput>;
  gcuCapacity?: InputMaybe<Scalars['Int']>;
  gcuUsage?: InputMaybe<Scalars['Int']>;
  reason?: InputMaybe<Scalars['String']>;
  routerCapacity?: InputMaybe<Scalars['Int']>;
  routerUsage?: InputMaybe<Scalars['Int']>;
  shardId: Scalars['String'];
  status?: InputMaybe<ShardStatus>;
};

/** Describes the result of publishing a schema to a graph variant. */
export type UploadSchemaMutationResponse = {
  __typename?: 'UploadSchemaMutationResponse';
  /** A machine-readable response code that indicates the type of result (e.g., `UPLOAD_SUCCESS` or `NO_CHANGES`) */
  code: Scalars['String'];
  /** A Human-readable message describing the type of result. */
  message: Scalars['String'];
  /** If the publish operation succeeded, this contains its details. Otherwise, this is null. */
  publication?: Maybe<SchemaTag>;
  /** Whether the schema publish operation succeeded (`true`) or encountered errors (`false`). */
  success: Scalars['Boolean'];
  /** If successful, the corresponding publication. */
  tag?: Maybe<SchemaTag>;
};

export type UpsertReviewInput = {
  comment?: InputMaybe<Scalars['String']>;
  decision: ReviewDecision;
  revisionId: Scalars['ID'];
};

export type UpsertReviewResult = PermissionError | Proposal | ValidationError;

export type UpsertRouterResult = GraphVariant | RouterUpsertFailure;

/** A registered Apollo Studio user. */
export type User = Identity & {
  __typename?: 'User';
  acceptedPrivacyPolicyAt?: Maybe<Scalars['Timestamp']>;
  /** Returns a list of all active user API keys for the user. */
  apiKeys: Array<UserApiKey>;
  /** Returns a representation of this user as an `Actor` type. Useful when determining which actor (usually a `User` or `Graph`) performed a particular action in Studio. */
  asActor: Actor;
  /**
   * Get an URL to which an avatar image can be uploaded. Client uploads by sending a PUT request
   * with the image data to MediaUploadInfo.url. Client SHOULD set the "Content-Type" header to the
   * browser-inferred MIME type, and SHOULD set the "x-apollo-content-filename" header to the
   * filename, if such information is available. Client MUST set the "x-apollo-csrf-token" header to
   * MediaUploadInfo.csrfToken.
   */
  avatarUpload?: Maybe<AvatarUploadResult>;
  /**
   * Get an image URL for the user's avatar. Note that CORS is not enabled for these URLs. The size
   * argument is used for bandwidth reduction, and should be the size of the image as displayed in the
   * application. Apollo's media server will downscale larger images to at least the requested size,
   * but this will not happen for third-party media servers.
   */
  avatarUrl?: Maybe<Scalars['String']>;
  betaFeaturesOn: Scalars['Boolean'];
  canUpdateAvatar: Scalars['Boolean'];
  canUpdateEmail: Scalars['Boolean'];
  canUpdateFullName: Scalars['Boolean'];
  createdAt: Scalars['Timestamp'];
  email?: Maybe<Scalars['String']>;
  emailModifiedAt?: Maybe<Scalars['Timestamp']>;
  emailVerified: Scalars['Boolean'];
  featureIntros?: Maybe<FeatureIntros>;
  fullName: Scalars['String'];
  /** The user's GitHub username, if they log in via GitHub. May be null even for GitHub users in some edge cases. */
  githubUsername?: Maybe<Scalars['String']>;
  /** The user's unique ID. */
  id: Scalars['ID'];
  /**
   * This role is reserved exclusively for internal Apollo employees, and it controls what access they may have to other
   * organizations. Only admins are allowed to see this field.
   */
  internalAdminRole?: Maybe<InternalMdgAdminRole>;
  /** Whether or not this user is and internal Apollo employee */
  isInternalUser: Scalars['Boolean'];
  isSsoV2: Scalars['Boolean'];
  /** Last time any API token from this user was used against AGM services */
  lastAuthenticatedAt?: Maybe<Scalars['Timestamp']>;
  loginFlowSource?: Maybe<LoginFlowSource>;
  logoutAfterIdleMs?: Maybe<Scalars['Int']>;
  /** A list of the user's memberships in Apollo Studio organizations. */
  memberships: Array<UserMembership>;
  /** The user's first and last name. */
  name: Scalars['String'];
  odysseyAttempt?: Maybe<OdysseyAttempt>;
  odysseyAttempts?: Maybe<Array<OdysseyAttempt>>;
  odysseyCertification?: Maybe<OdysseyCertification>;
  odysseyCertifications: Array<OdysseyCertification>;
  odysseyCourse?: Maybe<OdysseyCourse>;
  odysseyCourses?: Maybe<Array<OdysseyCourse>>;
  /** @deprecated Unused. Remove from application usage */
  odysseyHasEarlyAccess: Scalars['Boolean'];
  /** @deprecated Unused. Remove from application usage */
  odysseyHasRequestedEarlyAccess: Scalars['Boolean'];
  odysseyTasks?: Maybe<Array<OdysseyTask>>;
  sandboxOperationCollections: Array<OperationCollection>;
  synchronized: Scalars['Boolean'];
  /** List of Zendesk tickets this user has submitted */
  tickets?: Maybe<Array<ZendeskTicket>>;
  type: UserType;
};


/** A registered Apollo Studio user. */
export type UserapiKeysArgs = {
  includeCookies?: InputMaybe<Scalars['Boolean']>;
};


/** A registered Apollo Studio user. */
export type UseravatarUrlArgs = {
  size?: Scalars['Int'];
};


/** A registered Apollo Studio user. */
export type UserodysseyAttemptArgs = {
  id: Scalars['ID'];
};


/** A registered Apollo Studio user. */
export type UserodysseyCertificationArgs = {
  certificationId: Scalars['ID'];
};


/** A registered Apollo Studio user. */
export type UserodysseyCourseArgs = {
  courseId: Scalars['ID'];
};


/** A registered Apollo Studio user. */
export type UserodysseyTasksArgs = {
  in?: InputMaybe<Array<Scalars['ID']>>;
};

/**
 * Represents a user API key, which has permissions identical to
 * its associated Apollo user.
 */
export type UserApiKey = ApiKey & {
  __typename?: 'UserApiKey';
  /** The API key's ID. */
  id: Scalars['ID'];
  /** The API key's name, for distinguishing it from other keys. */
  keyName?: Maybe<Scalars['String']>;
  /** The value of the API key. **This is a secret credential!** */
  token: Scalars['String'];
};

/** A single user's membership in a single Apollo Studio organization. */
export type UserMembership = {
  __typename?: 'UserMembership';
  /** The organization that the user belongs to. */
  account: Account;
  /** The timestamp when the user was added to the organization. */
  createdAt: Scalars['Timestamp'];
  /** The user's permission level within the organization. */
  permission: UserPermission;
  /** The user that belongs to the organization. */
  user: User;
};

export type UserMutation = {
  __typename?: 'UserMutation';
  acceptPrivacyPolicy?: Maybe<Scalars['Void']>;
  /** Change the user's password */
  changePassword?: Maybe<Scalars['Void']>;
  completeOdysseyAttempt?: Maybe<OdysseyAttempt>;
  createOdysseyAttempt?: Maybe<OdysseyAttempt>;
  createOdysseyCertification?: Maybe<OdysseyCertification>;
  createOdysseyCourses?: Maybe<Array<OdysseyCourse>>;
  createOdysseyTasks?: Maybe<Array<OdysseyTask>>;
  /** Delete the user's avatar. Requires User.canUpdateAvatar to be true. */
  deleteAvatar?: Maybe<AvatarDeleteError>;
  deleteOdysseyAttempt?: Maybe<OdysseyAttempt>;
  deleteOdysseyCertification?: Maybe<OdysseyCertification>;
  deleteOdysseyCourse?: Maybe<OdysseyCourse>;
  deleteOdysseyTasks: Array<Maybe<OdysseyTask>>;
  /** Hard deletes the associated user. Throws an error otherwise with reason included. */
  hardDelete?: Maybe<Scalars['Void']>;
  /** Creates a new user API key for this user. */
  newKey: UserApiKey;
  /**
   * If this user has no active user API keys, this creates one for the user.
   * If this user has at least one active user API key, this returns one of those keys at random and does _not_ create a new key.
   */
  provisionKey?: Maybe<ApiKeyProvision>;
  /** Refresh information about the user from its upstream service (e.g. list of organizations from GitHub) */
  refresh?: Maybe<User>;
  /** Deletes the user API key with the provided ID, if any. */
  removeKey?: Maybe<Scalars['Void']>;
  /** Sets a new name for the user API key with the provided ID, if any. This does not invalidate the key or change its value. */
  renameKey?: Maybe<UserApiKey>;
  resendVerificationEmail?: Maybe<Scalars['Void']>;
  setOdysseyCourse?: Maybe<OdysseyCourse>;
  setOdysseyCourseLanguage: OdysseyCourse;
  setOdysseyResponse?: Maybe<OdysseyResponse>;
  setOdysseyTask?: Maybe<OdysseyTask>;
  /** Submit a zendesk ticket for this user */
  submitZendeskTicket?: Maybe<ZendeskTicket>;
  /** Update information about a user; all arguments are optional */
  update?: Maybe<User>;
  /** Updates this users' preference concerning opting into beta features. */
  updateBetaFeaturesOn?: Maybe<User>;
  /** Update the status of a feature for this. For example, if you want to hide an introductory popup. */
  updateFeatureIntros?: Maybe<User>;
  updateOdysseyAttempt?: Maybe<OdysseyAttempt>;
  /**
   * Update user to have the given internal mdg admin role.
   * It is necessary to be an MDG_INTERNAL_SUPER_ADMIN to perform update.
   * Additionally, upserting a null value explicitly revokes this user's
   * admin status.
   */
  updateRole?: Maybe<User>;
  user: User;
  verifyEmail?: Maybe<User>;
};


export type UserMutationchangePasswordArgs = {
  newPassword: Scalars['String'];
  previousPassword: Scalars['String'];
};


export type UserMutationcompleteOdysseyAttemptArgs = {
  id: Scalars['ID'];
  pass: Scalars['Boolean'];
  responses: Array<OdysseyResponseCorrectnessInput>;
};


export type UserMutationcreateOdysseyAttemptArgs = {
  testId: Scalars['String'];
};


export type UserMutationcreateOdysseyCertificationArgs = {
  certificationId: Scalars['String'];
  source?: InputMaybe<Scalars['String']>;
};


export type UserMutationcreateOdysseyCoursesArgs = {
  courses: Array<OdysseyCourseInput>;
};


export type UserMutationcreateOdysseyTasksArgs = {
  tasks: Array<OdysseyTaskInput>;
};


export type UserMutationdeleteOdysseyAttemptArgs = {
  id: Scalars['ID'];
};


export type UserMutationdeleteOdysseyCertificationArgs = {
  id: Scalars['ID'];
};


export type UserMutationdeleteOdysseyCourseArgs = {
  courseId: Scalars['String'];
};


export type UserMutationdeleteOdysseyTasksArgs = {
  taskIds: Array<Scalars['String']>;
};


export type UserMutationnewKeyArgs = {
  keyName: Scalars['String'];
};


export type UserMutationprovisionKeyArgs = {
  keyName?: Scalars['String'];
};


export type UserMutationremoveKeyArgs = {
  id: Scalars['ID'];
};


export type UserMutationrenameKeyArgs = {
  id: Scalars['ID'];
  newKeyName?: InputMaybe<Scalars['String']>;
};


export type UserMutationsetOdysseyCourseArgs = {
  course: OdysseyCourseInput;
};


export type UserMutationsetOdysseyCourseLanguageArgs = {
  courseId: Scalars['ID'];
  language: Scalars['String'];
};


export type UserMutationsetOdysseyResponseArgs = {
  response: OdysseyResponseInput;
};


export type UserMutationsetOdysseyTaskArgs = {
  courseId?: InputMaybe<Scalars['ID']>;
  courseLanguage?: InputMaybe<Scalars['String']>;
  task: OdysseyTaskInput;
};


export type UserMutationsubmitZendeskTicketArgs = {
  collaborators?: InputMaybe<Array<Scalars['String']>>;
  email: Scalars['String'];
  ticket: ZendeskTicketInput;
};


export type UserMutationupdateArgs = {
  email?: InputMaybe<Scalars['String']>;
  fullName?: InputMaybe<Scalars['String']>;
  referrer?: InputMaybe<Scalars['String']>;
  trackingGoogleClientId?: InputMaybe<Scalars['String']>;
  trackingMarketoClientId?: InputMaybe<Scalars['String']>;
  userSegment?: InputMaybe<UserSegment>;
  utmCampaign?: InputMaybe<Scalars['String']>;
  utmMedium?: InputMaybe<Scalars['String']>;
  utmSource?: InputMaybe<Scalars['String']>;
};


export type UserMutationupdateBetaFeaturesOnArgs = {
  betaFeaturesOn: Scalars['Boolean'];
};


export type UserMutationupdateFeatureIntrosArgs = {
  newFeatureIntros?: InputMaybe<FeatureIntrosInput>;
};


export type UserMutationupdateOdysseyAttemptArgs = {
  completedAt?: InputMaybe<Scalars['Timestamp']>;
  id: Scalars['ID'];
  pass?: InputMaybe<Scalars['Boolean']>;
};


export type UserMutationupdateRoleArgs = {
  newRole?: InputMaybe<InternalMdgAdminRole>;
};


export type UserMutationverifyEmailArgs = {
  token: Scalars['String'];
};

export enum UserPermission {
  BILLING_MANAGER = 'BILLING_MANAGER',
  CONSUMER = 'CONSUMER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  DOCUMENTER = 'DOCUMENTER',
  GRAPH_ADMIN = 'GRAPH_ADMIN',
  LEGACY_GRAPH_KEY = 'LEGACY_GRAPH_KEY',
  OBSERVER = 'OBSERVER',
  ORG_ADMIN = 'ORG_ADMIN',
  PERSISTED_QUERY_PUBLISHER = 'PERSISTED_QUERY_PUBLISHER'
}

export enum UserSegment {
  JOIN_MY_TEAM = 'JOIN_MY_TEAM',
  LOCAL_DEVELOPMENT = 'LOCAL_DEVELOPMENT',
  NOT_SPECIFIED = 'NOT_SPECIFIED',
  ODYSSEY = 'ODYSSEY',
  PRODUCTION_GRAPHS = 'PRODUCTION_GRAPHS',
  SANDBOX = 'SANDBOX',
  SANDBOX_OPERATION_COLLECTIONS = 'SANDBOX_OPERATION_COLLECTIONS',
  SANDBOX_PREFLIGHT_SCRIPTS = 'SANDBOX_PREFLIGHT_SCRIPTS',
  TRY_TEAM = 'TRY_TEAM'
}

export type UserSettings = {
  __typename?: 'UserSettings';
  appNavCollapsed: Scalars['Boolean'];
  autoManageVariables: Scalars['Boolean'];
  id: Scalars['String'];
  mockingResponses: Scalars['Boolean'];
  preflightScriptEnabled: Scalars['Boolean'];
  responseHints: ResponseHints;
  tableMode: Scalars['Boolean'];
  themeName: ThemeName;
};

/** Explorer user settings input */
export type UserSettingsInput = {
  appNavCollapsed?: InputMaybe<Scalars['Boolean']>;
  autoManageVariables?: InputMaybe<Scalars['Boolean']>;
  mockingResponses?: InputMaybe<Scalars['Boolean']>;
  preflightScriptEnabled?: InputMaybe<Scalars['Boolean']>;
  responseHints?: InputMaybe<ResponseHints>;
  tableMode?: InputMaybe<Scalars['Boolean']>;
  themeName?: InputMaybe<ThemeName>;
};

export enum UserType {
  APOLLO = 'APOLLO',
  GITHUB = 'GITHUB',
  SSO = 'SSO'
}

export type ValidateOperationsResult = {
  __typename?: 'ValidateOperationsResult';
  validationResults: Array<ValidationResult>;
};

/** An error that occurs when an operation contains invalid user input. */
export type ValidationError = Error & {
  __typename?: 'ValidationError';
  /** The error's details. */
  message: Scalars['String'];
};

export enum ValidationErrorCode {
  DEPRECATED_FIELD = 'DEPRECATED_FIELD',
  INVALID_OPERATION = 'INVALID_OPERATION',
  NON_PARSEABLE_DOCUMENT = 'NON_PARSEABLE_DOCUMENT'
}

export enum ValidationErrorType {
  FAILURE = 'FAILURE',
  INVALID = 'INVALID',
  WARNING = 'WARNING'
}

/**
 * Represents a single validation error, with information relating to the error
 * and its respective operation
 */
export type ValidationResult = {
  __typename?: 'ValidationResult';
  /** The validation result's error code */
  code: ValidationErrorCode;
  /** Description of the validation error */
  description: Scalars['String'];
  /** The operation related to this validation result */
  operation: OperationDocument;
  /** The type of validation error thrown - warning, failure, or invalid. */
  type: ValidationErrorType;
};

export type VariantAlreadyLinkedError = Error & {
  __typename?: 'VariantAlreadyLinkedError';
  message: Scalars['String'];
};

export type VariantAlreadyUnlinkedError = Error & {
  __typename?: 'VariantAlreadyUnlinkedError';
  message: Scalars['String'];
};

/** Variant-level configuration of checks. */
export type VariantCheckConfiguration = {
  __typename?: 'VariantCheckConfiguration';
  /** Time when the check configuration was created. */
  createdAt: Scalars['Timestamp'];
  /**
   * Downstream checks configuration for which downstream variants should affect this variant's check
   * status.
   */
  downstreamVariantsConfig: VariantCheckConfigurationDownstreamVariants;
  /** Operation checks configuration for which clients to ignore. */
  excludedClientsConfig: VariantCheckConfigurationExcludedClients;
  /** Operation checks configuration for which operation to ignore. */
  excludedOperationsConfig: VariantCheckConfigurationExcludedOperations;
  /** Graph that this check configuration belongs to */
  graphID: Scalars['String'];
  /** Graph variant that this check configuration belongs to */
  graphVariant: Scalars['String'];
  /** ID of the check configuration */
  id: Scalars['ID'];
  /** Operation checks configuration for which variants' metrics data to include. */
  includedVariantsConfig: VariantCheckConfigurationIncludedVariants;
  /** Whether operations checks are enabled. */
  operationsChecksEnabled: Scalars['Boolean'];
  /** Operation checks configuration for time range and associated thresholds. */
  timeRangeConfig: VariantCheckConfigurationTimeRange;
  /** Time when the check configuration was updated. */
  updatedAt: Scalars['Timestamp'];
  /** Identity of the last actor to update the check configuration, if available. */
  updatedBy?: Maybe<Identity>;
};

export type VariantCheckConfigurationDownstreamVariants = {
  __typename?: 'VariantCheckConfigurationDownstreamVariants';
  /**
   * During downstream checks, this variant's check workflow will wait for all downstream check
   * workflows for <blockingDownstreamVariants> variants to complete, and if any of them fail, then
   * this variant's check workflow will fail.
   */
  blockingDownstreamVariants: Array<Scalars['String']>;
};

export type VariantCheckConfigurationExcludedClients = {
  __typename?: 'VariantCheckConfigurationExcludedClients';
  /**
   * When true, indicates that graph-level configuration is appended to the variant-level
   * configuration. The default at variant creation is true.
   */
  appendGraphSettings: Scalars['Boolean'];
  /**
   * During operation checks, ignore clients matching any of the <excludedClients> filters. The
   * default at variant creation is the empty list.
   */
  excludedClients: Array<ClientFilter>;
};

export type VariantCheckConfigurationExcludedOperations = {
  __typename?: 'VariantCheckConfigurationExcludedOperations';
  /**
   * When true, indicates that graph-level configuration is appended to the variant-level
   * configuration. The default at variant creation is true.
   */
  appendGraphSettings: Scalars['Boolean'];
  /**
   * During operation checks, ignore operations matching any of the <excludedOperationNames> filters.
   * The default at variant creation is the empty list.
   */
  excludedOperationNames: Array<OperationNameFilter>;
  /**
   * During operation checks, ignore operations matching any of the <excludedOperations> filters. The
   * default at variant creation is the empty list.
   */
  excludedOperations: Array<OperationInfoFilter>;
};

export type VariantCheckConfigurationIncludedVariants = {
  __typename?: 'VariantCheckConfigurationIncludedVariants';
  /**
   * During operation checks, fetch operations from the metrics data for <includedVariants> variants.
   * Non-null if useGraphSettings is false and is otherwise null.
   */
  includedVariants?: Maybe<Array<Scalars['String']>>;
  /**
   * When true, indicates that graph-level configuration is used for this variant setting. The default
   * at variant creation is true.
   */
  useGraphSettings: Scalars['Boolean'];
};

export type VariantCheckConfigurationTimeRange = {
  __typename?: 'VariantCheckConfigurationTimeRange';
  /**
   * During operation checks, ignore operations that executed less than <operationCountThreshold>
   * times in the time range. Non-null if useGraphSettings is false and is otherwise null.
   */
  operationCountThreshold?: Maybe<Scalars['Int']>;
  /**
   * Duration operation checks, ignore operations that constituted less than
   * <operationCountThresholdPercentage>% of the operations in the time range. Expected values are
   * between 0% and 5%. Non-null if useGraphSettings is false and is otherwise null.
   */
  operationCountThresholdPercentage?: Maybe<Scalars['Float']>;
  /**
   * During operation checks, fetch operations from the last <timeRangeSeconds> seconds. Non-null if
   * useGraphSettings is false and is otherwise null.
   */
  timeRangeSeconds?: Maybe<Scalars['Long']>;
  /**
   * When true, indicates that graph-level configuration is used for this variant setting. The default
   * at variant creation is true.
   */
  useGraphSettings: Scalars['Boolean'];
};

export type VariantCreationConfig = {
  buildConfigInput: BuildConfigInput;
  endpointSlug?: InputMaybe<Scalars['String']>;
  variantName: Scalars['String'];
};

/** Webhook notification channel */
export type WebhookChannel = Channel & {
  __typename?: 'WebhookChannel';
  id: Scalars['ID'];
  name: Scalars['String'];
  secretToken?: Maybe<Scalars['String']>;
  subscriptions: Array<ChannelSubscription>;
  url: Scalars['String'];
};

/** PagerDuty notification channel parameters */
export type WebhookChannelInput = {
  name?: InputMaybe<Scalars['String']>;
  secretToken?: InputMaybe<Scalars['String']>;
  url: Scalars['String'];
};

export type ZendeskTicket = {
  __typename?: 'ZendeskTicket';
  createdAt: Scalars['Timestamp'];
  description: Scalars['String'];
  graph?: Maybe<Service>;
  id: Scalars['Int'];
  organization?: Maybe<Account>;
  priority: TicketPriority;
  status?: Maybe<TicketStatus>;
  subject: Scalars['String'];
  user?: Maybe<User>;
};

/** Zendesk ticket input */
export type ZendeskTicketInput = {
  description: Scalars['String'];
  graphId?: InputMaybe<Scalars['String']>;
  graphType?: InputMaybe<GraphType>;
  organizationId?: InputMaybe<Scalars['String']>;
  priority: TicketPriority;
  subject: Scalars['String'];
  uploadToken?: InputMaybe<Scalars['String']>;
};

export type SchemaReportMutationVariables = Exact<{
  report: SchemaReport;
  coreSchema?: InputMaybe<Scalars['String']>;
}>;


export type SchemaReportMutation = { __typename?: 'Mutation', reportSchema?: { __typename: 'ReportSchemaError', message: string, code: ReportSchemaErrorCode } | { __typename: 'ReportSchemaResponse', inSeconds: number, withCoreSchema: boolean } | null };
