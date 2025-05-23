export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Blob: { input: any; output: any; }
  Cursor: { input: any; output: any; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  FederationVersion: { input: any; output: any; }
  GraphQLDocument: { input: any; output: any; }
  JSON: { input: any; output: any; }
  Long: { input: any; output: any; }
  NaiveDateTime: { input: any; output: any; }
  Object: { input: any; output: any; }
  SHA256: { input: any; output: any; }
  StringOrInt: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
  Void: { input: any; output: any; }
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
  avatarUrl?: Maybe<Scalars['String']['output']>;
  billingContactEmail?: Maybe<Scalars['String']['output']>;
  billingInfo?: Maybe<BillingInfo>;
  billingInsights: BillingInsights;
  capabilities?: Maybe<AccountCapabilities>;
  /** Fetch a CloudOnboarding associated with this account */
  cloudOnboarding?: Maybe<CloudOnboarding>;
  companyUrl?: Maybe<Scalars['String']['output']>;
  /** The time at which the account was created */
  createdAt?: Maybe<Scalars['Timestamp']['output']>;
  currentBillingMonth?: Maybe<BillingMonth>;
  currentPlan: BillingPlan;
  currentSubscription?: Maybe<BillingSubscription>;
  eligibleForUsageBasedPlan: Scalars['Boolean']['output'];
  expiredTrialDismissedAt?: Maybe<Scalars['Timestamp']['output']>;
  expiredTrialSubscription?: Maybe<BillingSubscription>;
  graphIDAvailable: Scalars['Boolean']['output'];
  /** Graphs belonging to this organization. */
  graphs: Array<Service>;
  /** Graphs belonging to this organization. */
  graphsConnection?: Maybe<AccountGraphConnection>;
  hasBeenOnTrial: Scalars['Boolean']['output'];
  hasBillingInfo?: Maybe<Scalars['Boolean']['output']>;
  /** Globally unique identifier, which isn't guaranteed stable (can be changed by administrators). */
  id: Scalars['ID']['output'];
  /**
   * Internal immutable identifier for the account. Only visible to Apollo admins (because it really
   * shouldn't be used in normal client apps).
   */
  internalID: Scalars['ID']['output'];
  invitations?: Maybe<Array<AccountInvitation>>;
  invoices: Array<Invoice>;
  isLocked?: Maybe<Scalars['Boolean']['output']>;
  isOnExpiredTrial: Scalars['Boolean']['output'];
  isOnTrial: Scalars['Boolean']['output'];
  isSelfServiceDeletable?: Maybe<Scalars['Boolean']['output']>;
  limits?: Maybe<AccountLimits>;
  lockDetails?: Maybe<AccountLockDetails>;
  /** The user memberships belonging to an Organization */
  memberships?: Maybe<Array<AccountMembership>>;
  /** Name of the organization, which can change over time and isn't unique. */
  name: Scalars['String']['output'];
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
  provisionedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** Returns a different registry related stats pertaining to this account. */
  registryStatsWindow?: Maybe<RegistryStatsWindow>;
  requests?: Maybe<Scalars['Long']['output']>;
  requestsInCurrentBillingPeriod?: Maybe<Scalars['Long']['output']>;
  roles?: Maybe<AccountRoles>;
  routerEntitlement?: Maybe<RouterEntitlement>;
  /** How many seats would be included in your next bill, as best estimated today */
  seatCountForNextBill?: Maybe<Scalars['Int']['output']>;
  seats?: Maybe<Seats>;
  secondaryIDs: Array<Scalars['ID']['output']>;
  /**
   * Graphs belonging to this organization.
   * @deprecated Use graphs field instead
   */
  services: Array<Service>;
  /** The session length in seconds for a user in this org */
  sessionDurationInSeconds?: Maybe<Scalars['Int']['output']>;
  /**
   * If non-null, this organization tracks its members through an upstream IdP;
   * invitations are not possible on SSO-synchronized account.
   */
  sso?: Maybe<OrganizationSso>;
  ssoV2?: Maybe<SsoConfig>;
  /** @deprecated no longer relevant; it's only ever populated for enterprise accounts */
  state?: Maybe<AccountState>;
  /** A list of reusable invitations for the organization. */
  staticInvitations?: Maybe<Array<OrganizationInviteLink>>;
  /** @deprecated use Account.statsWindow instead */
  stats: AccountStatsWindow;
  statsWindow?: Maybe<AccountStatsWindow>;
  subscriptions: Array<BillingSubscription>;
  /** Gets a ticket for this org, by id */
  supportTicket?: Maybe<SupportTicket>;
  /** List of support tickets submitted for this org */
  supportTickets?: Maybe<Array<SupportTicket>>;
  survey?: Maybe<Survey>;
  /**
   * All Variants within the Graphs belonging to this organization. Can be limited to those favorited by the current user.
   * @deprecated use Service.variants instead
   */
  variants?: Maybe<AccountGraphVariantConnection>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountAvatarUrlArgs = {
  size?: Scalars['Int']['input'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountBillingInsightsArgs = {
  from: Scalars['Date']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  to?: InputMaybe<Scalars['Date']['input']>;
  windowSize?: InputMaybe<BillingUsageStatsWindowSize>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountCloudOnboardingArgs = {
  graphRef: Scalars['String']['input'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountGraphIdAvailableArgs = {
  id: Scalars['ID']['input'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountGraphsArgs = {
  filterBy?: InputMaybe<GraphFilter>;
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountGraphsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filterBy?: InputMaybe<GraphFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountInvitationsArgs = {
  includeAccepted?: Scalars['Boolean']['input'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountOperationUsageArgs = {
  forWindow?: InputMaybe<AccountOperationUsageWindowInput>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountPrivateSubgraphsArgs = {
  cloudProvider: CloudProvider;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountRegistryStatsWindowArgs = {
  from: Scalars['Timestamp']['input'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']['input']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountRequestsArgs = {
  from: Scalars['Timestamp']['input'];
  to: Scalars['Timestamp']['input'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountServicesArgs = {
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountStatsArgs = {
  from: Scalars['Timestamp']['input'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']['input']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountStatsWindowArgs = {
  from: Scalars['Timestamp']['input'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']['input']>;
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountSupportTicketArgs = {
  id: Scalars['ID']['input'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountSurveyArgs = {
  id: Scalars['String']['input'];
};


/** An organization in Apollo Studio. Can have multiple members and graphs. */
export type AccountVariantsArgs = {
  filterBy?: InputMaybe<GraphVariantFilter>;
};

/** Columns of AccountBillingUsageStats. */
export enum AccountBillingUsageStatsColumn {
  AGENT_ID = 'AGENT_ID',
  AGENT_VERSION = 'AGENT_VERSION',
  GRAPH_DEPLOYMENT_TYPE = 'GRAPH_DEPLOYMENT_TYPE',
  OPERATION_COUNT = 'OPERATION_COUNT',
  OPERATION_COUNT_PROVIDED_EXPLICITLY = 'OPERATION_COUNT_PROVIDED_EXPLICITLY',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  ROUTER_FEATURES_ENABLED = 'ROUTER_FEATURES_ENABLED',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type AccountBillingUsageStatsDimensions = {
  __typename?: 'AccountBillingUsageStatsDimensions';
  agentId?: Maybe<Scalars['String']['output']>;
  agentVersion?: Maybe<Scalars['String']['output']>;
  graphDeploymentType?: Maybe<Scalars['String']['output']>;
  operationCountProvidedExplicitly?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  routerFeaturesEnabled?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in AccountBillingUsageStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountBillingUsageStatsFilter = {
  /** Selects rows whose agentId dimension equals the given value if not null. To query for the null value, use {in: {agentId: [null]}} instead. */
  agentId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']['input']>;
  and?: InputMaybe<Array<AccountBillingUsageStatsFilter>>;
  /** Selects rows whose graphDeploymentType dimension equals the given value if not null. To query for the null value, use {in: {graphDeploymentType: [null]}} instead. */
  graphDeploymentType?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<AccountBillingUsageStatsFilterIn>;
  not?: InputMaybe<AccountBillingUsageStatsFilter>;
  /** Selects rows whose operationCountProvidedExplicitly dimension equals the given value if not null. To query for the null value, use {in: {operationCountProvidedExplicitly: [null]}} instead. */
  operationCountProvidedExplicitly?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<AccountBillingUsageStatsFilter>>;
  /** Selects rows whose routerFeaturesEnabled dimension equals the given value if not null. To query for the null value, use {in: {routerFeaturesEnabled: [null]}} instead. */
  routerFeaturesEnabled?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in AccountBillingUsageStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountBillingUsageStatsFilterIn = {
  /** Selects rows whose agentId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose graphDeploymentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  graphDeploymentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationCountProvidedExplicitly dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationCountProvidedExplicitly?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose routerFeaturesEnabled dimension is in the given list. A null value in the list means a row with null for that dimension. */
  routerFeaturesEnabled?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type AccountBillingUsageStatsMetrics = {
  __typename?: 'AccountBillingUsageStatsMetrics';
  operationCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

export type AccountCapabilities = {
  __typename?: 'AccountCapabilities';
  clientVersions: Scalars['Boolean']['output'];
  clients: Scalars['Boolean']['output'];
  cloudGraphs: Scalars['Boolean']['output'];
  connectorsInRouter: Scalars['Boolean']['output'];
  contracts: Scalars['Boolean']['output'];
  customSessionLengths: Scalars['Boolean']['output'];
  datadog: Scalars['Boolean']['output'];
  federation: Scalars['Boolean']['output'];
  launches: Scalars['Boolean']['output'];
  linting: Scalars['Boolean']['output'];
  metrics: Scalars['Boolean']['output'];
  notifications: Scalars['Boolean']['output'];
  operationRegistry: Scalars['Boolean']['output'];
  persistedQueries: Scalars['Boolean']['output'];
  proposals: Scalars['Boolean']['output'];
  schemaValidation: Scalars['Boolean']['output'];
  sso: Scalars['Boolean']['output'];
  traces: Scalars['Boolean']['output'];
  userRoles: Scalars['Boolean']['output'];
  webhooks: Scalars['Boolean']['output'];
};

/** Columns of AccountCardinalityStats. */
export enum AccountCardinalityStatsColumn {
  CLIENT_NAME_CARDINALITY = 'CLIENT_NAME_CARDINALITY',
  CLIENT_VERSION_CARDINALITY = 'CLIENT_VERSION_CARDINALITY',
  OPERATION_SHAPE_CARDINALITY = 'OPERATION_SHAPE_CARDINALITY',
  SCHEMA_COORDINATE_CARDINALITY = 'SCHEMA_COORDINATE_CARDINALITY',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type AccountCardinalityStatsDimensions = {
  __typename?: 'AccountCardinalityStatsDimensions';
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in AccountCardinalityStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountCardinalityStatsFilter = {
  and?: InputMaybe<Array<AccountCardinalityStatsFilter>>;
  in?: InputMaybe<AccountCardinalityStatsFilterIn>;
  not?: InputMaybe<AccountCardinalityStatsFilter>;
  or?: InputMaybe<Array<AccountCardinalityStatsFilter>>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in AccountCardinalityStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountCardinalityStatsFilterIn = {
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type AccountCardinalityStatsMetrics = {
  __typename?: 'AccountCardinalityStatsMetrics';
  clientNameCardinality: Scalars['Float']['output'];
  clientVersionCardinality: Scalars['Float']['output'];
  operationShapeCardinality: Scalars['Float']['output'];
  schemaCoordinateCardinality: Scalars['Float']['output'];
};

export type AccountCardinalityStatsOrderBySpec = {
  column: AccountCardinalityStatsColumn;
  direction: Ordering;
};

export type AccountCardinalityStatsRecord = {
  __typename?: 'AccountCardinalityStatsRecord';
  /** Dimensions of AccountCardinalityStats that can be grouped by. */
  groupBy: AccountCardinalityStatsDimensions;
  /** Metrics of AccountCardinalityStats that can be aggregated over. */
  metrics: AccountCardinalityStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp']['output'];
};

export type AccountChecksStatsMetrics = {
  __typename?: 'AccountChecksStatsMetrics';
  totalFailedChecks: Scalars['Long']['output'];
  totalSuccessfulChecks: Scalars['Long']['output'];
};

export type AccountChecksStatsRecord = {
  __typename?: 'AccountChecksStatsRecord';
  id: Scalars['ID']['output'];
  metrics: AccountChecksStatsMetrics;
  timestamp: Scalars['Timestamp']['output'];
};

/** Columns of AccountCoordinateUsage. */
export enum AccountCoordinateUsageColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ESTIMATED_EXECUTION_COUNT = 'ESTIMATED_EXECUTION_COUNT',
  EXECUTION_COUNT = 'EXECUTION_COUNT',
  KIND = 'KIND',
  NAMED_ATTRIBUTE = 'NAMED_ATTRIBUTE',
  NAMED_TYPE = 'NAMED_TYPE',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REFERENCING_OPERATION_COUNT = 'REFERENCING_OPERATION_COUNT',
  REQUEST_COUNT_NULL = 'REQUEST_COUNT_NULL',
  REQUEST_COUNT_UNDEFINED = 'REQUEST_COUNT_UNDEFINED',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type AccountCoordinateUsageDimensions = {
  __typename?: 'AccountCoordinateUsageDimensions';
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  kind?: Maybe<Scalars['String']['output']>;
  namedAttribute?: Maybe<Scalars['String']['output']>;
  namedType?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['String']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in AccountCoordinateUsage. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountCoordinateUsageFilter = {
  and?: InputMaybe<Array<AccountCoordinateUsageFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<AccountCoordinateUsageFilterIn>;
  /** Selects rows whose kind dimension equals the given value if not null. To query for the null value, use {in: {kind: [null]}} instead. */
  kind?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose namedAttribute dimension equals the given value if not null. To query for the null value, use {in: {namedAttribute: [null]}} instead. */
  namedAttribute?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose namedType dimension equals the given value if not null. To query for the null value, use {in: {namedType: [null]}} instead. */
  namedType?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<AccountCoordinateUsageFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<AccountCoordinateUsageFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in AccountCoordinateUsage. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountCoordinateUsageFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose kind dimension is in the given list. A null value in the list means a row with null for that dimension. */
  kind?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose namedAttribute dimension is in the given list. A null value in the list means a row with null for that dimension. */
  namedAttribute?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose namedType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  namedType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type AccountCoordinateUsageMetrics = {
  __typename?: 'AccountCoordinateUsageMetrics';
  estimatedExecutionCount: Scalars['Long']['output'];
  executionCount: Scalars['Long']['output'];
  referencingOperationCount: Scalars['Long']['output'];
  requestCountNull: Scalars['Long']['output'];
  requestCountUndefined: Scalars['Long']['output'];
};

export type AccountCoordinateUsageOrderBySpec = {
  column: AccountCoordinateUsageColumn;
  direction: Ordering;
};

export type AccountCoordinateUsageRecord = {
  __typename?: 'AccountCoordinateUsageRecord';
  /** Dimensions of AccountCoordinateUsage that can be grouped by. */
  groupBy: AccountCoordinateUsageDimensions;
  /** Metrics of AccountCoordinateUsage that can be aggregated over. */
  metrics: AccountCoordinateUsageMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp']['output'];
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
  bootId?: Maybe<Scalars['ID']['output']>;
  executableSchemaId?: Maybe<Scalars['ID']['output']>;
  libraryVersion?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<Scalars['String']['output']>;
  runtimeVersion?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serverId?: Maybe<Scalars['ID']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
  userVersion?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in AccountEdgeServerInfos. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountEdgeServerInfosFilter = {
  and?: InputMaybe<Array<AccountEdgeServerInfosFilter>>;
  /** Selects rows whose bootId dimension equals the given value if not null. To query for the null value, use {in: {bootId: [null]}} instead. */
  bootId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose executableSchemaId dimension equals the given value if not null. To query for the null value, use {in: {executableSchemaId: [null]}} instead. */
  executableSchemaId?: InputMaybe<Scalars['ID']['input']>;
  in?: InputMaybe<AccountEdgeServerInfosFilterIn>;
  /** Selects rows whose libraryVersion dimension equals the given value if not null. To query for the null value, use {in: {libraryVersion: [null]}} instead. */
  libraryVersion?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<AccountEdgeServerInfosFilter>;
  or?: InputMaybe<Array<AccountEdgeServerInfosFilter>>;
  /** Selects rows whose platform dimension equals the given value if not null. To query for the null value, use {in: {platform: [null]}} instead. */
  platform?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose runtimeVersion dimension equals the given value if not null. To query for the null value, use {in: {runtimeVersion: [null]}} instead. */
  runtimeVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serverId dimension equals the given value if not null. To query for the null value, use {in: {serverId: [null]}} instead. */
  serverId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose userVersion dimension equals the given value if not null. To query for the null value, use {in: {userVersion: [null]}} instead. */
  userVersion?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in AccountEdgeServerInfos. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountEdgeServerInfosFilterIn = {
  /** Selects rows whose bootId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  bootId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose executableSchemaId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  executableSchemaId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose libraryVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  libraryVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose platform dimension is in the given list. A null value in the list means a row with null for that dimension. */
  platform?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose runtimeVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  runtimeVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serverId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serverId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose userVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  userVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
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
  timestamp: Scalars['Timestamp']['output'];
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in AccountErrorStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountErrorStatsFilter = {
  and?: InputMaybe<Array<AccountErrorStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<AccountErrorStatsFilterIn>;
  not?: InputMaybe<AccountErrorStatsFilter>;
  or?: InputMaybe<Array<AccountErrorStatsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in AccountErrorStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountErrorStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type AccountErrorStatsMetrics = {
  __typename?: 'AccountErrorStatsMetrics';
  errorsCount: Scalars['Long']['output'];
  requestsWithErrorsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

/** Columns of AccountFederatedErrorStats. */
export enum AccountFederatedErrorStatsColumn {
  AGENT_VERSION = 'AGENT_VERSION',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ERROR_CODE = 'ERROR_CODE',
  ERROR_COUNT = 'ERROR_COUNT',
  ERROR_PATH = 'ERROR_PATH',
  ERROR_SERVICE = 'ERROR_SERVICE',
  OPERATION_ID = 'OPERATION_ID',
  OPERATION_NAME = 'OPERATION_NAME',
  OPERATION_TYPE = 'OPERATION_TYPE',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  SEVERITY = 'SEVERITY',
  TIMESTAMP = 'TIMESTAMP'
}

export type AccountFederatedErrorStatsDimensions = {
  __typename?: 'AccountFederatedErrorStatsDimensions';
  agentVersion?: Maybe<Scalars['String']['output']>;
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  errorPath?: Maybe<Scalars['String']['output']>;
  errorService?: Maybe<Scalars['String']['output']>;
  operationId?: Maybe<Scalars['String']['output']>;
  operationName?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
  severity?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in AccountFederatedErrorStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountFederatedErrorStatsFilter = {
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']['input']>;
  and?: InputMaybe<Array<AccountFederatedErrorStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorCode dimension equals the given value if not null. To query for the null value, use {in: {errorCode: [null]}} instead. */
  errorCode?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorPath dimension equals the given value if not null. To query for the null value, use {in: {errorPath: [null]}} instead. */
  errorPath?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorService dimension equals the given value if not null. To query for the null value, use {in: {errorService: [null]}} instead. */
  errorService?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<AccountFederatedErrorStatsFilterIn>;
  not?: InputMaybe<AccountFederatedErrorStatsFilter>;
  /** Selects rows whose operationId dimension equals the given value if not null. To query for the null value, use {in: {operationId: [null]}} instead. */
  operationId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationName dimension equals the given value if not null. To query for the null value, use {in: {operationName: [null]}} instead. */
  operationName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<AccountFederatedErrorStatsFilter>>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose severity dimension equals the given value if not null. To query for the null value, use {in: {severity: [null]}} instead. */
  severity?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in AccountFederatedErrorStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountFederatedErrorStatsFilterIn = {
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorCode?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorPath dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorPath?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorService dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorService?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose severity dimension is in the given list. A null value in the list means a row with null for that dimension. */
  severity?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type AccountFederatedErrorStatsMetrics = {
  __typename?: 'AccountFederatedErrorStatsMetrics';
  errorCount: Scalars['Long']['output'];
};

export type AccountFederatedErrorStatsOrderBySpec = {
  column: AccountFederatedErrorStatsColumn;
  direction: Ordering;
};

export type AccountFederatedErrorStatsRecord = {
  __typename?: 'AccountFederatedErrorStatsRecord';
  /** Dimensions of AccountFederatedErrorStats that can be grouped by. */
  groupBy: AccountFederatedErrorStatsDimensions;
  /** Metrics of AccountFederatedErrorStats that can be aggregated over. */
  metrics: AccountFederatedErrorStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp']['output'];
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
  fieldName?: Maybe<Scalars['String']['output']>;
  parentType?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in AccountFieldExecutions. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountFieldExecutionsFilter = {
  and?: InputMaybe<Array<AccountFieldExecutionsFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<AccountFieldExecutionsFilterIn>;
  not?: InputMaybe<AccountFieldExecutionsFilter>;
  or?: InputMaybe<Array<AccountFieldExecutionsFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in AccountFieldExecutions. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountFieldExecutionsFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type AccountFieldExecutionsMetrics = {
  __typename?: 'AccountFieldExecutionsMetrics';
  errorsCount: Scalars['Long']['output'];
  estimatedExecutionCount: Scalars['Long']['output'];
  observedExecutionCount: Scalars['Long']['output'];
  referencingOperationCount: Scalars['Long']['output'];
  requestsWithErrorsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
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
  field?: Maybe<Scalars['String']['output']>;
  fieldName?: Maybe<Scalars['String']['output']>;
  parentType?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in AccountFieldLatencies. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountFieldLatenciesFilter = {
  and?: InputMaybe<Array<AccountFieldLatenciesFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<AccountFieldLatenciesFilterIn>;
  not?: InputMaybe<AccountFieldLatenciesFilter>;
  or?: InputMaybe<Array<AccountFieldLatenciesFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in AccountFieldLatencies. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountFieldLatenciesFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
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
  timestamp: Scalars['Timestamp']['output'];
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  fieldName?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  parentType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in AccountFieldUsage. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountFieldUsageFilter = {
  and?: InputMaybe<Array<AccountFieldUsageFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<AccountFieldUsageFilterIn>;
  not?: InputMaybe<AccountFieldUsageFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<AccountFieldUsageFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in AccountFieldUsage. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountFieldUsageFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type AccountFieldUsageMetrics = {
  __typename?: 'AccountFieldUsageMetrics';
  estimatedExecutionCount: Scalars['Long']['output'];
  executionCount: Scalars['Long']['output'];
  referencingOperationCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
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
  cursor: Scalars['String']['output'];
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
  cursor: Scalars['String']['output'];
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
  agentVersion?: Maybe<Scalars['String']['output']>;
  cloudProvider?: Maybe<Scalars['String']['output']>;
  routerId?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
  tier?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in AccountGraphosCloudMetrics. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountGraphosCloudMetricsFilter = {
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']['input']>;
  and?: InputMaybe<Array<AccountGraphosCloudMetricsFilter>>;
  /** Selects rows whose cloudProvider dimension equals the given value if not null. To query for the null value, use {in: {cloudProvider: [null]}} instead. */
  cloudProvider?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<AccountGraphosCloudMetricsFilterIn>;
  not?: InputMaybe<AccountGraphosCloudMetricsFilter>;
  or?: InputMaybe<Array<AccountGraphosCloudMetricsFilter>>;
  /** Selects rows whose routerId dimension equals the given value if not null. To query for the null value, use {in: {routerId: [null]}} instead. */
  routerId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose tier dimension equals the given value if not null. To query for the null value, use {in: {tier: [null]}} instead. */
  tier?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in AccountGraphosCloudMetrics. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountGraphosCloudMetricsFilterIn = {
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose cloudProvider dimension is in the given list. A null value in the list means a row with null for that dimension. */
  cloudProvider?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose routerId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  routerId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose tier dimension is in the given list. A null value in the list means a row with null for that dimension. */
  tier?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type AccountGraphosCloudMetricsMetrics = {
  __typename?: 'AccountGraphosCloudMetricsMetrics';
  responseSize: Scalars['Long']['output'];
  responseSizeThrottled: Scalars['Long']['output'];
  routerOperations: Scalars['Long']['output'];
  routerOperationsThrottled: Scalars['Long']['output'];
  subgraphFetches: Scalars['Long']['output'];
  subgraphFetchesThrottled: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

/** An invitation for a user to join an organization. */
export type AccountInvitation = {
  __typename?: 'AccountInvitation';
  /** An accepted invitation cannot be used anymore */
  acceptedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** Who accepted the invitation */
  acceptedBy?: Maybe<User>;
  /** Time the invitation was created */
  createdAt: Scalars['Timestamp']['output'];
  /** Who created the invitation */
  createdBy?: Maybe<User>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Last time we sent an email for the invitation */
  lastSentAt?: Maybe<Scalars['Timestamp']['output']>;
  /** Access role for the invitee */
  role: UserPermission;
};

export type AccountLimits = {
  __typename?: 'AccountLimits';
  maxAuditInDays?: Maybe<Scalars['Int']['output']>;
  maxGraphOSSeats?: Maybe<Scalars['Long']['output']>;
  maxRangeInDays?: Maybe<Scalars['Int']['output']>;
  maxRangeInDaysForChecks?: Maybe<Scalars['Int']['output']>;
  maxRequestsPerMonth?: Maybe<Scalars['Long']['output']>;
};

export type AccountLockDetails = {
  __typename?: 'AccountLockDetails';
  actor?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  timestamp?: Maybe<Scalars['Timestamp']['output']>;
  type?: Maybe<AccountLockType>;
};

export enum AccountLockType {
  AUTOMATED_TRIAL_END = 'AUTOMATED_TRIAL_END',
  MANUAL = 'MANUAL'
}

/** The membership association between a user and an organization. */
export type AccountMembership = {
  __typename?: 'AccountMembership';
  account: Account;
  /** The timestamp when the user was added to the organization. */
  createdAt: Scalars['Timestamp']['output'];
  /** If this membership is a free seat (based on role) */
  free?: Maybe<Scalars['Boolean']['output']>;
  /** @deprecated Use role instead. */
  permission: UserPermission;
  /** The user's role within the organization'. */
  role: UserPermission;
  /** The user that belongs to the organization. */
  user: User;
};

export type AccountMutation = {
  __typename?: 'AccountMutation';
  addOidcConfigurationToBaseConnection?: Maybe<OidcConnection>;
  addSamlMetadataToBaseConnection?: Maybe<SamlConnection>;
  /** @deprecated Use saml { addVerificationCert } instead */
  addSamlVerificationCert?: Maybe<Scalars['Void']['output']>;
  auditExport?: Maybe<AuditLogExportMutation>;
  /**
   * Cancel account subscriptions, subscriptions will remain active until the end of the paid period.
   * Currently only works for Recurly subscriptions on team plans.
   */
  cancelSubscriptions?: Maybe<Account>;
  createBaseSsoConnection?: Maybe<BaseConnection>;
  /** Create a CloudOnboarding for this account */
  createCloudOnboarding: CreateOnboardingResult;
  createGraph: GraphCreationResult;
  createOidcConfigurationUrl?: Maybe<Scalars['String']['output']>;
  createStaticInvitation?: Maybe<OrganizationInviteLink>;
  currentSubscription?: Maybe<BillingSubscriptionMutation>;
  /** Delete the account's avatar. Requires Account.canUpdateAvatar to be true. */
  deleteAvatar?: Maybe<AvatarDeleteError>;
  ensureRecurlyAccountExists?: Maybe<RecurlyAccountDetails>;
  /** If the org is on an enterprise trial, extend the trial by the given number of days, or the default number of days for that plan if numDays is not set. */
  extendTrial?: Maybe<Account>;
  finalizeSsoReconfiguration?: Maybe<Scalars['Void']['output']>;
  finalizeSsoV2Migration?: Maybe<Scalars['Void']['output']>;
  /** Hard delete an account and all associated services */
  hardDelete?: Maybe<Scalars['Void']['output']>;
  /** Get reference to the account ID */
  internalID?: Maybe<Scalars['String']['output']>;
  /** Send an invitation to join the organization by E-mail */
  invite?: Maybe<AccountInvitation>;
  /** Lock an account, which limits the functionality available with regard to its graphs. */
  lock?: Maybe<Account>;
  /** See Account type. Field is needed by extending subgraph. */
  name?: Maybe<Scalars['String']['output']>;
  /** Mutations for interacting with an Apollo account's private subgraphs on GraphOS */
  privateSubgraph: PrivateSubgraphMutation;
  reAddSsoUser?: Maybe<Scalars['Void']['output']>;
  /**
   * Reactivate a canceled current subscription.
   * Currently only works for Recurly subscriptions on team plans.
   */
  reactivateCurrentSubscription?: Maybe<Account>;
  /** Delete an invitation */
  removeInvitation?: Maybe<Scalars['Void']['output']>;
  /** Remove a member of the account */
  removeMember?: Maybe<Account>;
  replaceSsoConnectionDomains?: Maybe<SsoConnection>;
  /** Trigger a request for an audit export */
  requestAuditExport?: Maybe<Account>;
  /** Send a new E-mail for an existing invitation */
  resendInvitation?: Maybe<AccountInvitation>;
  revokeStaticInvitation?: Maybe<OrganizationInviteLink>;
  /** Revokes a user's sessions within the organization */
  revokeUserSessions?: Maybe<Scalars['Void']['output']>;
  saml?: Maybe<SamlConnectionMutation>;
  /** See Account type. Field is needed by extending subgraph. */
  seats?: Maybe<Seats>;
  /** Create or update a custom session length for an org */
  setCustomSessionLength: Scalars['Int']['output'];
  /** Apollo admins only: set the billing plan to an arbitrary plan effective immediately terminating any current paid plan. */
  setPlan?: Maybe<Scalars['Void']['output']>;
  /** This is called by the form shown to users after they cancel their team subscription. */
  submitTeamCancellationFeedback?: Maybe<Scalars['Void']['output']>;
  /** Apollo admins only: Terminate the ongoing subscription in the account as soon as possible, without refunds. */
  terminateSubscription?: Maybe<Account>;
  /**
   * Apollo admins only: terminate any ongoing subscriptions in the account, without refunds
   * Currently only works for Recurly subscriptions.
   */
  terminateSubscriptions?: Maybe<Account>;
  trackTermsAccepted?: Maybe<Scalars['Void']['output']>;
  /** Unlock a locked account. */
  unlock?: Maybe<Account>;
  /** Update the billing address for a Recurly token */
  updateBillingAddress?: Maybe<Account>;
  /** Update the billing information from a Recurly token */
  updateBillingInfo?: Maybe<Scalars['Void']['output']>;
  updateCompanyUrl?: Maybe<Account>;
  /** Set the E-mail address of the account, used notably for billing */
  updateEmail?: Maybe<Scalars['Void']['output']>;
  /** Update the account ID */
  updateID?: Maybe<Account>;
  updateLegacySsoProvider?: Maybe<Scalars['Void']['output']>;
  /** Update the company name */
  updateName?: Maybe<Scalars['Void']['output']>;
  /** Updates the OIDC metadata for an existing SSO connection. Connection must be disabled prior to the update. */
  updateOidcConnectionMetadata?: Maybe<OidcConnection>;
  /** Updates the role assigned to new SSO users. */
  updateSSODefaultRole?: Maybe<OrganizationSso>;
  /** Updates the SAML metadata for an existing SSO connection. Connection must be disabled prior to the update. */
  updateSamlConnectionMetadata?: Maybe<SamlConnection>;
  /**
   * Update a user's role within an organization
   * @deprecated Use updateUserRole instead.
   */
  updateUserPermission?: Maybe<User>;
  /** Update a user's role within an organization */
  updateUserRole?: Maybe<User>;
};


export type AccountMutationAddOidcConfigurationToBaseConnectionArgs = {
  config: OidcConfigurationInput;
  connectionId: Scalars['ID']['input'];
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
};


export type AccountMutationAddSamlMetadataToBaseConnectionArgs = {
  connectionId: Scalars['ID']['input'];
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  metadata: SamlConfigurationInput;
};


export type AccountMutationAddSamlVerificationCertArgs = {
  pem: Scalars['String']['input'];
};


export type AccountMutationAuditExportArgs = {
  id: Scalars['String']['input'];
};


export type AccountMutationCreateBaseSsoConnectionArgs = {
  domains: Array<Scalars['String']['input']>;
  idpId?: InputMaybe<Scalars['String']['input']>;
  useLegacyIdpId?: InputMaybe<Scalars['Boolean']['input']>;
};


export type AccountMutationCreateCloudOnboardingArgs = {
  input: CloudOnboardingInput;
};


export type AccountMutationCreateGraphArgs = {
  graphType: GraphType;
  hiddenFromUninvitedNonAdmin: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  variantCreationConfig?: InputMaybe<VariantCreationConfig>;
};


export type AccountMutationCreateOidcConfigurationUrlArgs = {
  id: Scalars['ID']['input'];
};


export type AccountMutationCreateStaticInvitationArgs = {
  role: UserPermission;
};


export type AccountMutationExtendTrialArgs = {
  numDays?: InputMaybe<Scalars['Int']['input']>;
};


export type AccountMutationFinalizeSsoReconfigurationArgs = {
  deleteExistingWebApiKeys?: InputMaybe<Scalars['Boolean']['input']>;
  newConnectionId: Scalars['ID']['input'];
  verifySsoSessionExists?: InputMaybe<Scalars['Boolean']['input']>;
};


export type AccountMutationFinalizeSsoV2MigrationArgs = {
  deleteExistingWebApiKeys?: InputMaybe<Scalars['Boolean']['input']>;
  deleteNonSsoMemberships?: InputMaybe<Scalars['Boolean']['input']>;
  verifySsoSessionExists?: InputMaybe<Scalars['Boolean']['input']>;
};


export type AccountMutationInviteArgs = {
  email: Scalars['String']['input'];
  role?: InputMaybe<UserPermission>;
};


export type AccountMutationLockArgs = {
  reason?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<AccountLockType>;
};


export type AccountMutationReAddSsoUserArgs = {
  role: UserPermission;
  userId: Scalars['ID']['input'];
};


export type AccountMutationRemoveInvitationArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type AccountMutationRemoveMemberArgs = {
  id: Scalars['ID']['input'];
};


export type AccountMutationReplaceSsoConnectionDomainsArgs = {
  domains: Array<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


export type AccountMutationRequestAuditExportArgs = {
  actors?: InputMaybe<Array<ActorInput>>;
  from: Scalars['Timestamp']['input'];
  graphIds?: InputMaybe<Array<Scalars['String']['input']>>;
  to: Scalars['Timestamp']['input'];
};


export type AccountMutationResendInvitationArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type AccountMutationRevokeStaticInvitationArgs = {
  token: Scalars['String']['input'];
};


export type AccountMutationRevokeUserSessionsArgs = {
  userId: Scalars['ID']['input'];
};


export type AccountMutationSetCustomSessionLengthArgs = {
  sessionDurationInSeconds: Scalars['Int']['input'];
};


export type AccountMutationSetPlanArgs = {
  id: Scalars['ID']['input'];
};


export type AccountMutationSubmitTeamCancellationFeedbackArgs = {
  feedback: Scalars['String']['input'];
};


export type AccountMutationTerminateSubscriptionArgs = {
  providerId: Scalars['ID']['input'];
};


export type AccountMutationTrackTermsAcceptedArgs = {
  at: Scalars['Timestamp']['input'];
};


export type AccountMutationUpdateBillingAddressArgs = {
  billingAddress: BillingAddressInput;
};


export type AccountMutationUpdateBillingInfoArgs = {
  token: Scalars['String']['input'];
};


export type AccountMutationUpdateCompanyUrlArgs = {
  companyUrl?: InputMaybe<Scalars['String']['input']>;
};


export type AccountMutationUpdateEmailArgs = {
  email: Scalars['String']['input'];
};


export type AccountMutationUpdateIdArgs = {
  id: Scalars['ID']['input'];
};


export type AccountMutationUpdateLegacySsoProviderArgs = {
  ssoProvider: OrganizationSsoProvider;
};


export type AccountMutationUpdateNameArgs = {
  name: Scalars['String']['input'];
};


export type AccountMutationUpdateOidcConnectionMetadataArgs = {
  connectionId: Scalars['ID']['input'];
  metadata: OidcConfigurationUpdateInput;
};


export type AccountMutationUpdateSsoDefaultRoleArgs = {
  role: UserPermission;
};


export type AccountMutationUpdateSamlConnectionMetadataArgs = {
  connectionId: Scalars['ID']['input'];
  metadata: SamlConfigurationInput;
};


export type AccountMutationUpdateUserPermissionArgs = {
  permission: UserPermission;
  userID: Scalars['ID']['input'];
};


export type AccountMutationUpdateUserRoleArgs = {
  role: UserPermission;
  userID: Scalars['ID']['input'];
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in AccountOperationCheckStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountOperationCheckStatsFilter = {
  and?: InputMaybe<Array<AccountOperationCheckStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<AccountOperationCheckStatsFilterIn>;
  not?: InputMaybe<AccountOperationCheckStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<AccountOperationCheckStatsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in AccountOperationCheckStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountOperationCheckStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type AccountOperationCheckStatsMetrics = {
  __typename?: 'AccountOperationCheckStatsMetrics';
  cachedRequestsCount: Scalars['Long']['output'];
  uncachedRequestsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

export type AccountOperationUsage = {
  __typename?: 'AccountOperationUsage';
  selfHosted: BillableMetricStats;
  serverless: BillableMetricStats;
  totalOperations: BillableMetricStats;
};

export type AccountOperationUsageWindowInput = {
  from: Scalars['Date']['input'];
  limit?: Scalars['Int']['input'];
  to: Scalars['Date']['input'];
  windowSize?: BillingUsageStatsWindowSize;
};

export type AccountPublishesStatsMetrics = {
  __typename?: 'AccountPublishesStatsMetrics';
  totalPublishes: Scalars['Long']['output'];
};

export type AccountPublishesStatsRecord = {
  __typename?: 'AccountPublishesStatsRecord';
  id: Scalars['ID']['output'];
  metrics: AccountPublishesStatsMetrics;
  timestamp: Scalars['Timestamp']['output'];
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
  PERSISTED_QUERY_ID = 'PERSISTED_QUERY_ID',
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  fromEngineproxy?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  persistedQueryId?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  querySignature?: Maybe<Scalars['String']['output']>;
  querySignatureLength?: Maybe<Scalars['Int']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in AccountQueryStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountQueryStatsFilter = {
  and?: InputMaybe<Array<AccountQueryStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose fromEngineproxy dimension equals the given value if not null. To query for the null value, use {in: {fromEngineproxy: [null]}} instead. */
  fromEngineproxy?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<AccountQueryStatsFilterIn>;
  not?: InputMaybe<AccountQueryStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<AccountQueryStatsFilter>>;
  /** Selects rows whose persistedQueryId dimension equals the given value if not null. To query for the null value, use {in: {persistedQueryId: [null]}} instead. */
  persistedQueryId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in AccountQueryStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountQueryStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose fromEngineproxy dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fromEngineproxy?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose persistedQueryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  persistedQueryId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type AccountQueryStatsMetrics = {
  __typename?: 'AccountQueryStatsMetrics';
  cacheTtlHistogram: DurationHistogram;
  cachedHistogram: DurationHistogram;
  cachedRequestsCount: Scalars['Long']['output'];
  forbiddenOperationCount: Scalars['Long']['output'];
  registeredOperationCount: Scalars['Long']['output'];
  requestsWithErrorsCount: Scalars['Long']['output'];
  totalLatencyHistogram: DurationHistogram;
  totalRequestCount: Scalars['Long']['output'];
  uncachedHistogram: DurationHistogram;
  uncachedRequestsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

export type AccountRoles = {
  __typename?: 'AccountRoles';
  canAudit: Scalars['Boolean']['output'];
  canCreateService: Scalars['Boolean']['output'];
  canDelete: Scalars['Boolean']['output'];
  canManageMembers: Scalars['Boolean']['output'];
  canManageSessions: Scalars['Boolean']['output'];
  canProvisionSSO: Scalars['Boolean']['output'];
  canQuery: Scalars['Boolean']['output'];
  canQueryAudit: Scalars['Boolean']['output'];
  canQueryBillingInfo: Scalars['Boolean']['output'];
  canQueryMembers: Scalars['Boolean']['output'];
  canQueryStats: Scalars['Boolean']['output'];
  canReadTickets: Scalars['Boolean']['output'];
  canRemoveMembers: Scalars['Boolean']['output'];
  canSetConstrainedPlan: Scalars['Boolean']['output'];
  canUpdateBillingInfo: Scalars['Boolean']['output'];
  canUpdateMetadata: Scalars['Boolean']['output'];
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
  cardinalityStats: Array<AccountCardinalityStatsRecord>;
  coordinateUsage: Array<AccountCoordinateUsageRecord>;
  edgeServerInfos: Array<AccountEdgeServerInfosRecord>;
  errorStats: Array<AccountErrorStatsRecord>;
  federatedErrorStats: Array<AccountFederatedErrorStatsRecord>;
  fieldExecutions: Array<AccountFieldExecutionsRecord>;
  fieldLatencies: Array<AccountFieldLatenciesRecord>;
  fieldUsage: Array<AccountFieldUsageRecord>;
  graphosCloudMetrics: Array<AccountGraphosCloudMetricsRecord>;
  operationCheckStats: Array<AccountOperationCheckStatsRecord>;
  queryStats: Array<AccountQueryStatsRecord>;
  /** From field rounded down to the nearest resolution. */
  roundedDownFrom: Scalars['Timestamp']['output'];
  /** To field rounded up to the nearest resolution. */
  roundedUpTo: Scalars['Timestamp']['output'];
  tracePathErrorsRefs: Array<AccountTracePathErrorsRefsRecord>;
  traceRefs: Array<AccountTraceRefsRecord>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowBillingUsageStatsArgs = {
  filter?: InputMaybe<AccountBillingUsageStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountBillingUsageStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowCardinalityStatsArgs = {
  filter?: InputMaybe<AccountCardinalityStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountCardinalityStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowCoordinateUsageArgs = {
  filter?: InputMaybe<AccountCoordinateUsageFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountCoordinateUsageOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowEdgeServerInfosArgs = {
  filter?: InputMaybe<AccountEdgeServerInfosFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountEdgeServerInfosOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowErrorStatsArgs = {
  filter?: InputMaybe<AccountErrorStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowFederatedErrorStatsArgs = {
  filter?: InputMaybe<AccountFederatedErrorStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountFederatedErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowFieldExecutionsArgs = {
  filter?: InputMaybe<AccountFieldExecutionsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountFieldExecutionsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowFieldLatenciesArgs = {
  filter?: InputMaybe<AccountFieldLatenciesFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountFieldLatenciesOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowFieldUsageArgs = {
  filter?: InputMaybe<AccountFieldUsageFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountFieldUsageOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowGraphosCloudMetricsArgs = {
  filter?: InputMaybe<AccountGraphosCloudMetricsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountGraphosCloudMetricsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowOperationCheckStatsArgs = {
  filter?: InputMaybe<AccountOperationCheckStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountOperationCheckStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowQueryStatsArgs = {
  filter?: InputMaybe<AccountQueryStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountQueryStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowTracePathErrorsRefsArgs = {
  filter?: InputMaybe<AccountTracePathErrorsRefsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountTracePathErrorsRefsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowTraceRefsArgs = {
  filter?: InputMaybe<AccountTraceRefsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<AccountTraceRefsOrderBySpec>>;
};

/** Columns of AccountTracePathErrorsRefs. */
export enum AccountTracePathErrorsRefsColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  DURATION_BUCKET = 'DURATION_BUCKET',
  ERRORS_COUNT_IN_PATH = 'ERRORS_COUNT_IN_PATH',
  ERRORS_COUNT_IN_TRACE = 'ERRORS_COUNT_IN_TRACE',
  ERROR_CODE = 'ERROR_CODE',
  ERROR_MESSAGE = 'ERROR_MESSAGE',
  ERROR_SERVICE = 'ERROR_SERVICE',
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  durationBucket?: Maybe<Scalars['Int']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  errorService?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
  traceHttpStatusCode?: Maybe<Scalars['Int']['output']>;
  traceId?: Maybe<Scalars['ID']['output']>;
  traceStartsAt?: Maybe<Scalars['Timestamp']['output']>;
};

/** Filter for data in AccountTracePathErrorsRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountTracePathErrorsRefsFilter = {
  and?: InputMaybe<Array<AccountTracePathErrorsRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']['input']>;
  /** Selects rows whose errorCode dimension equals the given value if not null. To query for the null value, use {in: {errorCode: [null]}} instead. */
  errorCode?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorMessage dimension equals the given value if not null. To query for the null value, use {in: {errorMessage: [null]}} instead. */
  errorMessage?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorService dimension equals the given value if not null. To query for the null value, use {in: {errorService: [null]}} instead. */
  errorService?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<AccountTracePathErrorsRefsFilterIn>;
  not?: InputMaybe<AccountTracePathErrorsRefsFilter>;
  or?: InputMaybe<Array<AccountTracePathErrorsRefsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose traceHttpStatusCode dimension equals the given value if not null. To query for the null value, use {in: {traceHttpStatusCode: [null]}} instead. */
  traceHttpStatusCode?: InputMaybe<Scalars['Int']['input']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in AccountTracePathErrorsRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountTracePathErrorsRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Selects rows whose errorCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorCode?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorMessage dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorMessage?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorService dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorService?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose traceHttpStatusCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceHttpStatusCode?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type AccountTracePathErrorsRefsMetrics = {
  __typename?: 'AccountTracePathErrorsRefsMetrics';
  errorsCountInPath: Scalars['Long']['output'];
  errorsCountInTrace: Scalars['Long']['output'];
  traceSizeBytes: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  durationBucket?: Maybe<Scalars['Int']['output']>;
  generatedTraceId?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  querySignature?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
  traceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in AccountTraceRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type AccountTraceRefsFilter = {
  and?: InputMaybe<Array<AccountTraceRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<AccountTraceRefsFilterIn>;
  not?: InputMaybe<AccountTraceRefsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<AccountTraceRefsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in AccountTraceRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type AccountTraceRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type AccountTraceRefsMetrics = {
  __typename?: 'AccountTraceRefsMetrics';
  traceCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

/** Represents an actor that performs actions in Apollo Studio. Most actors are either a `USER` or a `GRAPH` (based on a request's provided API key), and they have the corresponding `ActorType`. */
export type Actor = {
  __typename?: 'Actor';
  actorId: Scalars['ID']['output'];
  type: ActorType;
};

/** Input type to provide when specifying an `Actor` in operation arguments. See also the `Actor` object type. */
export type ActorInput = {
  actorId: Scalars['ID']['input'];
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
  message: Scalars['String']['input'];
  parentCommentId?: InputMaybe<Scalars['String']['input']>;
  revisionId: Scalars['String']['input'];
  schemaCoordinate?: InputMaybe<Scalars['String']['input']>;
  schemaScope?: InputMaybe<Scalars['String']['input']>;
  usersToNotify?: InputMaybe<Array<Scalars['String']['input']>>;
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
  name: Scalars['String']['input'];
};

export type AffectedClient = {
  __typename?: 'AffectedClient';
  /**
   * ID, often the name, of the client set by the user and reported alongside metrics
   * @deprecated Unsupported.
   */
  clientReferenceId?: Maybe<Scalars['ID']['output']>;
  /**
   * version of the client set by the user and reported alongside metrics
   * @deprecated Unsupported.
   */
  clientVersion?: Maybe<Scalars['String']['output']>;
};

export type AffectedQuery = {
  __typename?: 'AffectedQuery';
  /** If the operation would be approved if the check ran again. Returns null if queried from SchemaDiff.changes.affectedQueries.alreadyApproved */
  alreadyApproved?: Maybe<Scalars['Boolean']['output']>;
  /** If the operation would be ignored if the check ran again */
  alreadyIgnored?: Maybe<Scalars['Boolean']['output']>;
  /** List of changes affecting this query. Returns null if queried from SchemaDiff.changes.affectedQueries.changes */
  changes?: Maybe<Array<ChangeOnOperation>>;
  /** Name to display to the user for the operation */
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Determines if this query validates against the proposed schema */
  isValid?: Maybe<Scalars['Boolean']['output']>;
  /** Whether this operation was ignored and its severity was downgraded for that reason */
  markedAsIgnored?: Maybe<Scalars['Boolean']['output']>;
  /** Whether the changes were marked as safe and its severity was downgraded for that reason */
  markedAsSafe?: Maybe<Scalars['Boolean']['output']>;
  /** Name provided for the operation, which can be empty string if it is an anonymous operation */
  name?: Maybe<Scalars['String']['output']>;
  /** First 128 characters of query signature for display */
  signature?: Maybe<Scalars['String']['output']>;
};

/**
 * Represents an API key that's used to authenticate a
 * particular Apollo user or graph.
 */
export type ApiKey = {
  /** The API key's ID. */
  id: Scalars['ID']['output'];
  /** The API key's name, for distinguishing it from other keys. */
  keyName?: Maybe<Scalars['String']['output']>;
  /** The value of the API key. **This is a secret credential!** */
  token: Scalars['String']['output'];
};

export type ApiKeyProvision = {
  __typename?: 'ApiKeyProvision';
  apiKey: ApiKey;
  created: Scalars['Boolean']['output'];
};

/** A generic event for the `trackApolloKotlinUsage` mutation */
export type ApolloKotlinUsageEventInput = {
  /** When the event occurred */
  date: Scalars['Timestamp']['input'];
  /** Optional parameters attached to the event */
  payload?: InputMaybe<Scalars['Object']['input']>;
  /** Type of event */
  type: Scalars['ID']['input'];
};

/** A generic property for the `trackApolloKotlinUsage` mutation */
export type ApolloKotlinUsagePropertyInput = {
  /** Optional parameters attached to the property */
  payload?: InputMaybe<Scalars['Object']['input']>;
  /** Type of property */
  type: Scalars['ID']['input'];
};

export type AuditLogExport = {
  __typename?: 'AuditLogExport';
  /** The list of actors to filter the audit export */
  actors?: Maybe<Array<Identity>>;
  bigqueryTriggeredAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The time when the audit export was completed */
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The time when the audit export was reqeusted */
  createdAt: Scalars['Timestamp']['output'];
  /** List of URLs to download the audits for the requested range */
  downloadUrls?: Maybe<Array<Scalars['String']['output']>>;
  exportedFiles?: Maybe<Array<Scalars['String']['output']>>;
  /** The starting point of audits to include in export */
  from: Scalars['Timestamp']['output'];
  /** The list of graphs to filter the audit export */
  graphs?: Maybe<Array<Service>>;
  /** The id for the audit export */
  id: Scalars['ID']['output'];
  /** The user that initiated the audit export */
  requester?: Maybe<User>;
  /** The status of the audit export */
  status: AuditStatus;
  /** The end point of audits to include in export */
  to: Scalars['Timestamp']['output'];
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
  clientMessage: Scalars['String']['output'];
  code: AvatarDeleteErrorCode;
  serverMessage: Scalars['String']['output'];
};

export enum AvatarDeleteErrorCode {
  SSO_USERS_CANNOT_DELETE_SELF_AVATAR = 'SSO_USERS_CANNOT_DELETE_SELF_AVATAR'
}

export type AvatarUploadError = {
  __typename?: 'AvatarUploadError';
  clientMessage: Scalars['String']['output'];
  code: AvatarUploadErrorCode;
  serverMessage: Scalars['String']['output'];
};

export enum AvatarUploadErrorCode {
  SSO_USERS_CANNOT_UPLOAD_SELF_AVATAR = 'SSO_USERS_CANNOT_UPLOAD_SELF_AVATAR'
}

export type AvatarUploadResult = AvatarUploadError | MediaUploadInfo;

/** AWS Load Balancer information */
export type AwsLoadBalancer = {
  __typename?: 'AwsLoadBalancer';
  /** ARN for the load balancer */
  arn: Scalars['String']['output'];
  /** DNS endpoint for the load balancer */
  endpoint: Scalars['String']['output'];
  /** ARN for the HTTPS listener for the load balancer */
  listenerArn: Scalars['String']['output'];
};

/** Input for AWS Load Balancer */
export type AwsLoadBalancerInput = {
  arn: Scalars['String']['input'];
  endpoint: Scalars['String']['input'];
  listenerArn: Scalars['String']['input'];
};

/** AWS-specific information for a Shard */
export type AwsShard = {
  __typename?: 'AwsShard';
  /** AWS Account ID where the Shard is hosted */
  accountId: Scalars['String']['output'];
  /** ARNs of the target groups for sleeping Cloud Routers */
  coldStartTargetGroupArns?: Maybe<Array<Scalars['String']['output']>>;
  /** ARN of the ECS Cluster */
  ecsClusterArn: Scalars['String']['output'];
  /** ARN of the IAM role to perform provisioning operations on this shard */
  iamRoleArn: Scalars['String']['output'];
  /** ID of the security group for the load balancer */
  loadbalancerSecurityGroupId: Scalars['String']['output'];
  /** Load balancers for this Cloud Router */
  loadbalancers: Array<AwsLoadBalancer>;
  /** ARN of the IAM permissions boundaries for IAM roles provisioned in this shard */
  permissionsBoundaryArn: Scalars['String']['output'];
  /** IDs of the subnets */
  subnetIds: Array<Scalars['String']['output']>;
  /** ID of the VPC */
  vpcId: Scalars['String']['output'];
};

export type BaseConnection = SsoConnection & {
  __typename?: 'BaseConnection';
  domains: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  idpId: Scalars['ID']['output'];
  scim?: Maybe<SsoScimProvisioningDetails>;
  /** @deprecated Use stateV2 instead */
  state: SsoConnectionState;
  stateV2: SsoConnectionStateV2;
};

export type BillableMetricStats = {
  __typename?: 'BillableMetricStats';
  planThreshold?: Maybe<Scalars['Int']['output']>;
  stats: Array<MetricStatWindow>;
};

export type BillingAddress = {
  __typename?: 'BillingAddress';
  address1?: Maybe<Scalars['String']['output']>;
  address2?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  zip?: Maybe<Scalars['String']['output']>;
};

/** Billing address input */
export type BillingAddressInput = {
  address1: Scalars['String']['input'];
  address2?: InputMaybe<Scalars['String']['input']>;
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  state: Scalars['String']['input'];
  zip: Scalars['String']['input'];
};

export type BillingAdminQuery = {
  __typename?: 'BillingAdminQuery';
  /** Look up the current plan of an account by calling the grpc service */
  currentPlanFromGrpc?: Maybe<GqlBillingPlanFromGrpc>;
};


export type BillingAdminQueryCurrentPlanFromGrpcArgs = {
  internalAccountId: Scalars['ID']['input'];
};

export type BillingCapability = {
  __typename?: 'BillingCapability';
  defaultValue: Scalars['Boolean']['output'];
  intendedUse: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

/** Billing capability input */
export type BillingCapabilityInput = {
  defaultValue: Scalars['Boolean']['input'];
  intendedUse: Scalars['String']['input'];
  label: Scalars['String']['input'];
};

export type BillingInfo = {
  __typename?: 'BillingInfo';
  address: BillingAddress;
  cardType?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastFour?: Maybe<Scalars['Int']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  month?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  vatNumber?: Maybe<Scalars['String']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

export type BillingInsights = {
  __typename?: 'BillingInsights';
  totalOperations: Array<BillingInsightsUsage>;
  totalSampledOperations: Array<BillingInsightsUsage>;
};

export type BillingInsightsUsage = {
  __typename?: 'BillingInsightsUsage';
  timestamp: Scalars['Timestamp']['output'];
  totalOperationCount: Scalars['Long']['output'];
};

export type BillingLimit = {
  __typename?: 'BillingLimit';
  defaultValue: Scalars['Long']['output'];
  intendedUse: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

/** Billing limit input */
export type BillingLimitInput = {
  defaultValue?: InputMaybe<Scalars['Long']['input']>;
  intendedUse: Scalars['String']['input'];
  label: Scalars['String']['input'];
};

export enum BillingModel {
  REQUEST_BASED = 'REQUEST_BASED',
  SEAT_BASED = 'SEAT_BASED'
}

export type BillingMonth = {
  __typename?: 'BillingMonth';
  end: Scalars['Timestamp']['output'];
  requests: Scalars['Long']['output'];
  start: Scalars['Timestamp']['output'];
};

export type BillingMutation = {
  __typename?: 'BillingMutation';
  /** Temporary utility mutation to convert annual team plan orgs to monthly team plans */
  convertAnnualTeamOrgToMonthly?: Maybe<Scalars['Void']['output']>;
  createSetupIntent?: Maybe<SetupIntentResult>;
  /** Admin mutation for manually creating usage exports for testing usage-based pricing of Scale plans. */
  createUsageExport?: Maybe<Scalars['Void']['output']>;
  endPaidUsageBasedPlan?: Maybe<EndUsageBasedPlanResult>;
  reloadPlans: Array<BillingPlan>;
  startFreeUsageBasedPlan?: Maybe<StartUsageBasedPlanResult>;
  startUsageBasedPlan?: Maybe<StartUsageBasedPlanResult>;
  /** @deprecated No longer supported */
  syncAccountWithProviders?: Maybe<SyncBillingAccountResult>;
  /** Mutation to sync an Apollo Plan with a Stripe product */
  syncStripePlan?: Maybe<Scalars['Void']['output']>;
  updatePaymentMethod?: Maybe<UpdatePaymentMethodResult>;
};


export type BillingMutationConvertAnnualTeamOrgToMonthlyArgs = {
  internalAccountId: Scalars['ID']['input'];
};


export type BillingMutationCreateSetupIntentArgs = {
  internalAccountId: Scalars['ID']['input'];
};


export type BillingMutationCreateUsageExportArgs = {
  date: Scalars['Date']['input'];
  internalAccountIds: Array<Scalars['ID']['input']>;
  startAtHour: Scalars['Int']['input'];
};


export type BillingMutationEndPaidUsageBasedPlanArgs = {
  internalAccountId: Scalars['ID']['input'];
};


export type BillingMutationStartFreeUsageBasedPlanArgs = {
  internalAccountId: Scalars['ID']['input'];
};


export type BillingMutationStartUsageBasedPlanArgs = {
  internalAccountId: Scalars['ID']['input'];
  paymentMethodId: Scalars['String']['input'];
};


export type BillingMutationSyncAccountWithProvidersArgs = {
  internalAccountId: Scalars['ID']['input'];
};


export type BillingMutationSyncStripePlanArgs = {
  planKind: BillingPlanKind;
  planReadableId?: InputMaybe<Scalars['String']['input']>;
  stripeProductId: Scalars['ID']['input'];
};


export type BillingMutationUpdatePaymentMethodArgs = {
  internalAccountId: Scalars['ID']['input'];
  paymentMethodId: Scalars['String']['input'];
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
  /** @deprecated use AccountCapabilities.clientVersions */
  clientVersions: Scalars['Boolean']['output'];
  /** @deprecated use AccountCapabilities.clients */
  clients: Scalars['Boolean']['output'];
  /** @deprecated use AccountCapabilities.contracts */
  contracts: Scalars['Boolean']['output'];
  /** @deprecated use AccountCapabilities.datadog */
  datadog: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  /** Retrieve the limit applied to this plan for a capability */
  effectiveLimit?: Maybe<Scalars['Long']['output']>;
  errors: Scalars['Boolean']['output'];
  /** @deprecated use AccountCapabilities.federation */
  federation: Scalars['Boolean']['output'];
  /** Check whether a capability is enabled for the plan */
  hasCapability?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  isTrial: Scalars['Boolean']['output'];
  kind: BillingPlanKind;
  /** @deprecated use AccountCapabilities.launches */
  launches: Scalars['Boolean']['output'];
  /** @deprecated use AccountLimits.maxAuditInDays */
  maxAuditInDays: Scalars['Int']['output'];
  /** @deprecated use AccountLimits.maxRangeInDays */
  maxRangeInDays?: Maybe<Scalars['Int']['output']>;
  /**
   * The maximum number of days that checks stats will be stored
   * @deprecated use AccountLimits.maxRangeInDaysForChecks
   */
  maxRangeInDaysForChecks?: Maybe<Scalars['Int']['output']>;
  /** @deprecated use AccountLimits.maxRequestsPerMonth */
  maxRequestsPerMonth?: Maybe<Scalars['Long']['output']>;
  /** @deprecated use AccountCapabilities.metrics */
  metrics: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  /** @deprecated use AccountCapabilities.notifications */
  notifications: Scalars['Boolean']['output'];
  /** @deprecated use AccountCapabilities.operationRegistry */
  operationRegistry: Scalars['Boolean']['output'];
  /** @deprecated use AccountCapabilities.persistedQueries */
  persistedQueries: Scalars['Boolean']['output'];
  /** The price of every seat */
  pricePerSeatInUsdCents?: Maybe<Scalars['Int']['output']>;
  /** The price of subscribing to this plan with a quantity of 1 (currently always the case) */
  pricePerUnitInUsdCents: Scalars['Int']['output'];
  provider?: Maybe<BillingProvider>;
  /** Whether the plan is accessible by all users in QueryRoot.allPlans, QueryRoot.plan, or AccountMutation.setPlan */
  public: Scalars['Boolean']['output'];
  ranges: Array<Scalars['String']['output']>;
  readableId: Scalars['ID']['output'];
  /** @deprecated use AccountCapabilities.schemaValidation */
  schemaValidation: Scalars['Boolean']['output'];
  /** @deprecated use AccountCapabilities.sso */
  sso?: Maybe<Scalars['Boolean']['output']>;
  tier: BillingPlanTier;
  /** @deprecated use AccountCapabilities.traces */
  traces: Scalars['Boolean']['output'];
  /** @deprecated use AccountCapabilities.userRoles */
  userRoles: Scalars['Boolean']['output'];
  /** @deprecated use AccountCapabilities.webhooks */
  webhooks: Scalars['Boolean']['output'];
};


export type BillingPlanEffectiveLimitArgs = {
  label: Scalars['String']['input'];
};


export type BillingPlanHasCapabilityArgs = {
  label: Scalars['String']['input'];
};

export type BillingPlanAddon = {
  __typename?: 'BillingPlanAddon';
  id: Scalars['ID']['output'];
  pricePerUnitInUsdCents: Scalars['Int']['output'];
};

/** Billing plan addon input */
export type BillingPlanAddonInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  usdCentsPrice?: InputMaybe<Scalars['Int']['input']>;
};

export type BillingPlanCapability = {
  __typename?: 'BillingPlanCapability';
  label: Scalars['String']['output'];
  plan: BillingPlan;
  value: Scalars['Boolean']['output'];
};

/** Billing plan input */
export type BillingPlanInput = {
  addons: Array<BillingPlanAddonInput>;
  billingModel: BillingModel;
  billingPeriod: BillingPeriod;
  clientVersions?: InputMaybe<Scalars['Boolean']['input']>;
  clients?: InputMaybe<Scalars['Boolean']['input']>;
  contracts?: InputMaybe<Scalars['Boolean']['input']>;
  datadog?: InputMaybe<Scalars['Boolean']['input']>;
  description: Scalars['String']['input'];
  errors?: InputMaybe<Scalars['Boolean']['input']>;
  federation?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
  kind: BillingPlanKind;
  launches?: InputMaybe<Scalars['Boolean']['input']>;
  maxAuditInDays?: InputMaybe<Scalars['Int']['input']>;
  maxRangeInDays?: InputMaybe<Scalars['Int']['input']>;
  maxRangeInDaysForChecks?: InputMaybe<Scalars['Int']['input']>;
  maxRequestsPerMonth?: InputMaybe<Scalars['Long']['input']>;
  metrics?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  notifications?: InputMaybe<Scalars['Boolean']['input']>;
  operationRegistry?: InputMaybe<Scalars['Boolean']['input']>;
  persistedQueries?: InputMaybe<Scalars['Boolean']['input']>;
  pricePerSeatInUsdCents?: InputMaybe<Scalars['Int']['input']>;
  pricePerUnitInUsdCents?: InputMaybe<Scalars['Int']['input']>;
  public: Scalars['Boolean']['input'];
  schemaValidation?: InputMaybe<Scalars['Boolean']['input']>;
  traces?: InputMaybe<Scalars['Boolean']['input']>;
  userRoles?: InputMaybe<Scalars['Boolean']['input']>;
  webhooks?: InputMaybe<Scalars['Boolean']['input']>;
};

/**
 * Overall class that a billing plan falls into. This is slightly more granular than BillingPlanTier
 * because it differentiates between trials, pilots, internal-only plans, etc.
 */
export enum BillingPlanKind {
  /** Original version of the default free plan that we still support but is no longer offered */
  COMMUNITY = 'COMMUNITY',
  /** Custom plan for serverless customers that is configured and billed manually in Stripe */
  DEDICATED = 'DEDICATED',
  ENTERPRISE_INTERNAL = 'ENTERPRISE_INTERNAL',
  ENTERPRISE_PAID = 'ENTERPRISE_PAID',
  ENTERPRISE_PILOT = 'ENTERPRISE_PILOT',
  ENTERPRISE_TRIAL = 'ENTERPRISE_TRIAL',
  /** 2025 version of the default free plan */
  FREE = 'FREE',
  /** @deprecated Part of initial 2022 serverless implementation; was never used in production */
  ONE_FREE = 'ONE_FREE',
  /** @deprecated Part of initial 2022 serverless implementation; was never used in production */
  ONE_PAID = 'ONE_PAID',
  PLACEHOLDER_FREE = 'PLACEHOLDER_FREE',
  PLACEHOLDER_PAID = 'PLACEHOLDER_PAID',
  /** Sales assisted Scale plan currently configured in Recurly. */
  SCALE = 'SCALE',
  SCALE_ADVANCED = 'SCALE_ADVANCED',
  /** New Scale plans configured in Stripe. */
  SCALE_BASIC = 'SCALE_BASIC',
  SCALE_PLATFORM = 'SCALE_PLATFORM',
  /** @deprecated Part of initial 2022 serverless implementation; was never used in production */
  SERVERLESS = 'SERVERLESS',
  /** 2022 version of the 'serverless' free plan that we still support but is no longer offered */
  SERVERLESS_FREE = 'SERVERLESS_FREE',
  /** 2022 version of the 'serverless' paid plan that we still support but is no longer offered */
  SERVERLESS_PAID = 'SERVERLESS_PAID',
  /** @deprecated Part of initial 2022 serverless implementation; was never used in production */
  STARTER = 'STARTER',
  /** Original version of the non-enterprise paid plan (configured in Recurly) that we still support but is no longer offered */
  TEAM_PAID = 'TEAM_PAID',
  /** Original version of the non-enterprise trial plan (configured in Recurly) that we still support but is no longer offered */
  TEAM_TRIAL = 'TEAM_TRIAL',
  UNKNOWN = 'UNKNOWN'
}

export type BillingPlanLimit = {
  __typename?: 'BillingPlanLimit';
  label: Scalars['String']['output'];
  plan: BillingPlan;
  value?: Maybe<Scalars['Long']['output']>;
};

export type BillingPlanMutation = {
  __typename?: 'BillingPlanMutation';
  /** Archive this billing plan */
  archive?: Maybe<Scalars['Void']['output']>;
  /** Remove the specified capability from this plan */
  clearCapability?: Maybe<Scalars['Void']['output']>;
  /** Remove the specified limit from this plan */
  clearLimit?: Maybe<Scalars['Void']['output']>;
  id: Scalars['ID']['output'];
  /** Reset the specified capability on this plan to the global default value for the capability */
  resetCapability?: Maybe<BillingPlanCapability>;
  /** Reset the specified limit on this plan to the global default value for the limit */
  resetLimit?: Maybe<BillingPlanLimit>;
  /** Sets the specified capability on this plan to the provided value */
  setCapability?: Maybe<BillingPlanCapability>;
  /** Sets the specified limit on this plan to the provided value */
  setLimit?: Maybe<BillingPlanLimit>;
  updateDescriptors?: Maybe<BillingPlan>;
  /** Update a plan */
  updatePlan?: Maybe<BillingPlan>;
  /** Add Stripe pricing rates for this plan */
  upsertStripeRates?: Maybe<Scalars['Void']['output']>;
};


export type BillingPlanMutationClearCapabilityArgs = {
  label: Scalars['String']['input'];
};


export type BillingPlanMutationClearLimitArgs = {
  label: Scalars['String']['input'];
};


export type BillingPlanMutationResetCapabilityArgs = {
  label: Scalars['String']['input'];
};


export type BillingPlanMutationResetLimitArgs = {
  label: Scalars['String']['input'];
};


export type BillingPlanMutationSetCapabilityArgs = {
  label: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
};


export type BillingPlanMutationSetLimitArgs = {
  label: Scalars['String']['input'];
  value?: InputMaybe<Scalars['Long']['input']>;
};


export type BillingPlanMutationUpdateDescriptorsArgs = {
  input?: InputMaybe<UpdateBillingPlanDescriptorsInput>;
};


export type BillingPlanMutationUpdatePlanArgs = {
  input?: InputMaybe<UpdateBillingPlanInput>;
};


export type BillingPlanMutationUpsertStripeRatesArgs = {
  priceIds: Array<Scalars['String']['input']>;
};

export enum BillingPlanTier {
  /** Original version of the default free plan that we still support but is no longer offered */
  COMMUNITY = 'COMMUNITY',
  ENTERPRISE = 'ENTERPRISE',
  /** 2025 version of the 'serverless' free plan */
  FREE = 'FREE',
  /** @deprecated Part of initial 2022 serverless implementation; was never used in production */
  ONE = 'ONE',
  /** 2025 version of the 'serverless' paid plan */
  SCALE = 'SCALE',
  /** Original version of the non-enterprise paid plan (configured in Recurly) that we still support but is no longer offered */
  TEAM = 'TEAM',
  UNKNOWN = 'UNKNOWN',
  /** 2022 version of the 'serverless' free plan that we still support but is no longer offered */
  USAGE_BASED = 'USAGE_BASED'
}

export enum BillingProvider {
  APOLLO_NO_INVOICING = 'APOLLO_NO_INVOICING',
  METRONOME = 'METRONOME',
  NONE = 'NONE',
  RECURLY = 'RECURLY',
  STRIPE = 'STRIPE'
}

export type BillingSubscription = {
  __typename?: 'BillingSubscription';
  activatedAt: Scalars['Timestamp']['output'];
  addons: Array<BillingSubscriptionAddon>;
  /** Retrieve all capabilities for this subscription */
  allCapabilities: Array<SubscriptionCapability>;
  /** Retrieve a list of all effective capability limits for this subscription */
  allLimits: Array<SubscriptionLimit>;
  autoRenew: Scalars['Boolean']['output'];
  canceledAt?: Maybe<Scalars['Timestamp']['output']>;
  /**
   * Draft invoice for this subscription
   * @deprecated This data came from Metronome and we no longer use Metronome
   */
  currentDraftInvoice?: Maybe<DraftInvoice>;
  currentPeriodEndsAt: Scalars['Timestamp']['output'];
  currentPeriodStartedAt: Scalars['Timestamp']['output'];
  /** Retrieve the limit applied to this subscription for a capability */
  effectiveLimit?: Maybe<Scalars['Long']['output']>;
  expiresAt?: Maybe<Scalars['Timestamp']['output']>;
  /** Renewal grace time for updating seat count */
  graceTimeForNextRenewal?: Maybe<Scalars['Timestamp']['output']>;
  /** Check whether a capability is enabled for the subscription */
  hasCapability?: Maybe<Scalars['Boolean']['output']>;
  maxSelfHostedRequestsPerMonth?: Maybe<Scalars['Int']['output']>;
  maxServerlessRequestsPerMonth?: Maybe<Scalars['Int']['output']>;
  plan: BillingPlan;
  /** The price of every seat */
  pricePerSeatInUsdCents?: Maybe<Scalars['Int']['output']>;
  /** The price of every unit in the subscription (hence multiplied by quantity to get to the basePriceInUsdCents) */
  pricePerUnitInUsdCents: Scalars['Int']['output'];
  quantity: Scalars['Int']['output'];
  /** Total price of the subscription when it next renews, including add-ons (such as seats) */
  renewalTotalPriceInUsdCents: Scalars['Long']['output'];
  state: SubscriptionState;
  /**
   * When this subscription's trial period expires (if it is a trial). Not the same as the
   * subscription's Recurly expiration).
   */
  trialExpiresAt?: Maybe<Scalars['Timestamp']['output']>;
  uuid: Scalars['ID']['output'];
};


export type BillingSubscriptionEffectiveLimitArgs = {
  label: Scalars['String']['input'];
};


export type BillingSubscriptionHasCapabilityArgs = {
  label: Scalars['String']['input'];
};

export type BillingSubscriptionAddon = {
  __typename?: 'BillingSubscriptionAddon';
  id: Scalars['ID']['output'];
  pricePerUnitInUsdCents: Scalars['Int']['output'];
  quantity: Scalars['Int']['output'];
};

export type BillingSubscriptionMutation = {
  __typename?: 'BillingSubscriptionMutation';
  /** Remove the specified capability override for this subscription */
  clearCapability?: Maybe<Scalars['Void']['output']>;
  /** Remove the specified limit override for this subscription */
  clearLimit?: Maybe<Scalars['Void']['output']>;
  /** Sets the capability override on this subscription to the provided value */
  setCapability?: Maybe<SubscriptionCapability>;
  /** Sets the limit override on this subscription to the provided value */
  setLimit?: Maybe<SubscriptionLimit>;
  uuid: Scalars['ID']['output'];
};


export type BillingSubscriptionMutationClearCapabilityArgs = {
  label: Scalars['String']['input'];
};


export type BillingSubscriptionMutationClearLimitArgs = {
  label: Scalars['String']['input'];
};


export type BillingSubscriptionMutationSetCapabilityArgs = {
  label: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
};


export type BillingSubscriptionMutationSetLimitArgs = {
  label: Scalars['String']['input'];
  value?: InputMaybe<Scalars['Long']['input']>;
};

export type BillingTier = {
  __typename?: 'BillingTier';
  searchAccounts: Array<Account>;
  tier: BillingPlanTier;
};


export type BillingTierSearchAccountsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};

/** Columns of BillingUsageStats. */
export enum BillingUsageStatsColumn {
  ACCOUNT_ID = 'ACCOUNT_ID',
  AGENT_ID = 'AGENT_ID',
  AGENT_VERSION = 'AGENT_VERSION',
  GRAPH_DEPLOYMENT_TYPE = 'GRAPH_DEPLOYMENT_TYPE',
  OPERATION_COUNT = 'OPERATION_COUNT',
  OPERATION_COUNT_PROVIDED_EXPLICITLY = 'OPERATION_COUNT_PROVIDED_EXPLICITLY',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  ROUTER_FEATURES_ENABLED = 'ROUTER_FEATURES_ENABLED',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type BillingUsageStatsDimensions = {
  __typename?: 'BillingUsageStatsDimensions';
  accountId?: Maybe<Scalars['ID']['output']>;
  agentId?: Maybe<Scalars['String']['output']>;
  agentVersion?: Maybe<Scalars['String']['output']>;
  graphDeploymentType?: Maybe<Scalars['String']['output']>;
  operationCountProvidedExplicitly?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  routerFeaturesEnabled?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in BillingUsageStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type BillingUsageStatsFilter = {
  /** Selects rows whose accountId dimension equals the given value if not null. To query for the null value, use {in: {accountId: [null]}} instead. */
  accountId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose agentId dimension equals the given value if not null. To query for the null value, use {in: {agentId: [null]}} instead. */
  agentId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']['input']>;
  and?: InputMaybe<Array<BillingUsageStatsFilter>>;
  /** Selects rows whose graphDeploymentType dimension equals the given value if not null. To query for the null value, use {in: {graphDeploymentType: [null]}} instead. */
  graphDeploymentType?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<BillingUsageStatsFilterIn>;
  not?: InputMaybe<BillingUsageStatsFilter>;
  /** Selects rows whose operationCountProvidedExplicitly dimension equals the given value if not null. To query for the null value, use {in: {operationCountProvidedExplicitly: [null]}} instead. */
  operationCountProvidedExplicitly?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<BillingUsageStatsFilter>>;
  /** Selects rows whose routerFeaturesEnabled dimension equals the given value if not null. To query for the null value, use {in: {routerFeaturesEnabled: [null]}} instead. */
  routerFeaturesEnabled?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in BillingUsageStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type BillingUsageStatsFilterIn = {
  /** Selects rows whose accountId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  accountId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose agentId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose graphDeploymentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  graphDeploymentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationCountProvidedExplicitly dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationCountProvidedExplicitly?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose routerFeaturesEnabled dimension is in the given list. A null value in the list means a row with null for that dimension. */
  routerFeaturesEnabled?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type BillingUsageStatsMetrics = {
  __typename?: 'BillingUsageStatsMetrics';
  operationCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
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
  /** The unique identifier for this build. */
  id: Scalars['ID']['output'];
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
  id: Scalars['ID']['output'];
  passed: Scalars['Boolean']['output'];
  workflowTask: BuildCheckTask;
};

export type BuildCheckPassed = {
  buildInputs: BuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  id: Scalars['ID']['output'];
  passed: Scalars['Boolean']['output'];
  /** The SHA-256 of the supergraph schema document generated by this build. */
  supergraphSchemaHash: Scalars['SHA256']['output'];
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
  id: Scalars['ID']['output'];
  /** Whether the build task passed or failed. */
  passed: Scalars['Boolean']['output'];
  /** The workflow build task that generated this result. */
  workflowTask: BuildCheckTask;
};

export type BuildCheckTask = {
  /** The result of the build check. This will be null when the task is initializing or running. */
  buildResult?: Maybe<BuildCheckResult>;
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  /**
   * The build input change proposed for this check workflow. Note that for triggered downstream
   *  workflows, this is not the upstream variant's proposed change, but the changes for the downstream
   * variant that are derived from the upstream workflow's results (e.g. the input supergraph schema).
   */
  proposedBuildInputChanges: ProposedBuildInputChanges;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']['output']>;
  workflow: CheckWorkflow;
};

/** The configuration for building a composition graph variant */
export type BuildConfig = {
  __typename?: 'BuildConfig';
  buildPipelineTrack: BuildPipelineTrack;
  /** Show all uses of @tag directives to consumers in Schema Reference and Explorer */
  tagInApiSchema: Scalars['Boolean']['output'];
};

/**
 * Exactly one of the inputs must be set in a build configuration.
 * Which build configuration type is set will determine the type
 * of variant that is created. Existing variants of a given type
 * cannot be updated in-place to be of a different type.
 */
export type BuildConfigInput = {
  /** This list will contain any directives that should get passed through to the api schema from the core schema. Anything included in this list will appear in the consumer facing schema */
  apiDirectivePassThrough: Array<Scalars['String']['input']>;
  /** if buildPipelineTrack is null use the graph default */
  buildPipelineTrack?: InputMaybe<BuildPipelineTrack>;
  composition?: InputMaybe<CompositionConfigInput>;
  contract?: InputMaybe<ContractConfigInput>;
};

/** A single error that occurred during the failed execution of a build. */
export type BuildError = {
  __typename?: 'BuildError';
  code?: Maybe<Scalars['String']['output']>;
  failedStep?: Maybe<Scalars['String']['output']>;
  locations: Array<SourceLocation>;
  message: Scalars['String']['output'];
};

/** Contains the details of an executed build that failed. */
export type BuildFailure = {
  __typename?: 'BuildFailure';
  errorCount: Scalars['Int']['output'];
  /** A list of all errors that occurred during the failed build. */
  errorMessages: Array<BuildError>;
};

export type BuildInput = CompositionBuildInput | FilterBuildInput;

export type BuildInputs = CompositionBuildInputs | FilterBuildInputs;

export enum BuildPipelineTrack {
  FED_1_0 = 'FED_1_0',
  FED_1_1 = 'FED_1_1',
  FED_2_0 = 'FED_2_0',
  FED_2_1 = 'FED_2_1',
  FED_2_3 = 'FED_2_3',
  FED_2_4 = 'FED_2_4',
  FED_2_5 = 'FED_2_5',
  FED_2_6 = 'FED_2_6',
  FED_2_7 = 'FED_2_7',
  FED_2_8 = 'FED_2_8',
  FED_2_9 = 'FED_2_9',
  FED_2_10 = 'FED_2_10',
  FED_2_11 = 'FED_2_11',
  FED_NEXT = 'FED_NEXT'
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
  compositionVersion: Scalars['String']['output'];
  deprecatedAt?: Maybe<Scalars['Timestamp']['output']>;
  displayName: Scalars['String']['output'];
  minimumGatewayVersion?: Maybe<Scalars['String']['output']>;
  /** Minimum supported router and gateway versions. Min router   version can be null since fed 1 doesn't have router support. */
  minimumRouterVersion?: Maybe<Scalars['String']['output']>;
  notSupportedAt?: Maybe<Scalars['Timestamp']['output']>;
};

export type BuildResult = BuildFailure | BuildSuccess;

export type BuildRouterVersionInput = {
  cloudRouterBranch?: InputMaybe<Scalars['String']['input']>;
  routerBranch?: InputMaybe<Scalars['String']['input']>;
  routerRepository?: InputMaybe<Scalars['String']['input']>;
};

export type BuildRouterVersionResult = BuildRouterVersionSuccess | CloudRouterTestingInvalidInputErrors;

export type BuildRouterVersionSuccess = {
  __typename?: 'BuildRouterVersionSuccess';
  jobId: Scalars['ID']['output'];
};

/** Contains the details of an executed build that succeeded. */
export type BuildSuccess = {
  __typename?: 'BuildSuccess';
  /** Contains the supergraph and API schemas created by composition. */
  coreSchema: CoreSchema;
};

export enum CacheScope {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  UNKNOWN = 'UNKNOWN',
  UNRECOGNIZED = 'UNRECOGNIZED'
}

/** The result of a failed call to PersistedQueryListMutation.delete due to linked variant(s). */
export type CannotDeleteLinkedPersistedQueryListError = Error & {
  __typename?: 'CannotDeleteLinkedPersistedQueryListError';
  message: Scalars['String']['output'];
};

export type CannotModifyOperationBodyError = Error & {
  __typename?: 'CannotModifyOperationBodyError';
  message: Scalars['String']['output'];
};

/** Columns of CardinalityStats. */
export enum CardinalityStatsColumn {
  CLIENT_NAME_CARDINALITY = 'CLIENT_NAME_CARDINALITY',
  CLIENT_VERSION_CARDINALITY = 'CLIENT_VERSION_CARDINALITY',
  OPERATION_SHAPE_CARDINALITY = 'OPERATION_SHAPE_CARDINALITY',
  SCHEMA_COORDINATE_CARDINALITY = 'SCHEMA_COORDINATE_CARDINALITY',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type CardinalityStatsDimensions = {
  __typename?: 'CardinalityStatsDimensions';
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in CardinalityStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type CardinalityStatsFilter = {
  and?: InputMaybe<Array<CardinalityStatsFilter>>;
  in?: InputMaybe<CardinalityStatsFilterIn>;
  not?: InputMaybe<CardinalityStatsFilter>;
  or?: InputMaybe<Array<CardinalityStatsFilter>>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in CardinalityStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type CardinalityStatsFilterIn = {
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type CardinalityStatsMetrics = {
  __typename?: 'CardinalityStatsMetrics';
  clientNameCardinality: Scalars['Float']['output'];
  clientVersionCardinality: Scalars['Float']['output'];
  operationShapeCardinality: Scalars['Float']['output'];
  schemaCoordinateCardinality: Scalars['Float']['output'];
};

export type CardinalityStatsOrderBySpec = {
  column: CardinalityStatsColumn;
  direction: Ordering;
};

export type CardinalityStatsRecord = {
  __typename?: 'CardinalityStatsRecord';
  /** Dimensions of CardinalityStats that can be grouped by. */
  groupBy: CardinalityStatsDimensions;
  /** Metrics of CardinalityStats that can be aggregated over. */
  metrics: CardinalityStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp']['output'];
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
  code: Scalars['String']['output'];
  /** A human-readable description of the change. */
  description: Scalars['String']['output'];
  /** Top level node affected by the change. */
  parentNode?: Maybe<NamedIntrospectionType>;
  /** The severity of the change (e.g., `FAILURE` or `NOTICE`) */
  severity: ChangeSeverity;
  /** Short description of the change */
  shortDescription?: Maybe<Scalars['String']['output']>;
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
  /** A default value was added to an input object field. */
  INPUT_OBJECT_FIELD_DEFAULT_VALUE_ADDED = 'INPUT_OBJECT_FIELD_DEFAULT_VALUE_ADDED',
  /** The default value of an input object field was changed. */
  INPUT_OBJECT_FIELD_DEFAULT_VALUE_CHANGE = 'INPUT_OBJECT_FIELD_DEFAULT_VALUE_CHANGE',
  /** The default value of an input object field was removed. */
  INPUT_OBJECT_FIELD_DEFAULT_VALUE_REMOVED = 'INPUT_OBJECT_FIELD_DEFAULT_VALUE_REMOVED',
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
  impact?: Maybe<Scalars['String']['output']>;
  /** The semantic info about this change, i.e. info about the change that doesn't depend on the operation */
  semanticChange: SemanticChange;
};

export type ChangeProposalComment = {
  createdAt: Scalars['Timestamp']['output'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  /** true if the schemaCoordinate this comment is on doesn't exist in the diff between the most recent revision & the base sdl */
  outdated: Scalars['Boolean']['output'];
  schemaCoordinate: Scalars['String']['output'];
  /** '#@!api!@#' for api schema, '#@!supergraph!@#' for supergraph schema, subgraph otherwise */
  schemaScope: Scalars['String']['output'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']['output']>;
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
  createdAt: Scalars['Timestamp']['output'];
  schemaTagID: Scalars['ID']['output'];
};

/** Destination for notifications */
export type Channel = {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  subscriptions: Array<ChannelSubscription>;
};

export type ChannelSubscription = {
  channels: Array<Channel>;
  enabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  variant?: Maybe<Scalars['String']['output']>;
};

/** Graph-level configuration of checks. */
export type CheckConfiguration = {
  __typename?: 'CheckConfiguration';
  /** Time when check configuration was created */
  createdAt: Scalars['Timestamp']['output'];
  /**
   * During operation checks, if this option is enabled, the check will not fail or
   * mark any operations as broken/changed if the default value has changed, only
   * if the default value is removed completely.
   */
  downgradeDefaultValueChange: Scalars['Boolean']['output'];
  /**
   * During operation checks, if this option is enabled, it evaluates a check
   * run against zero operations as a pass instead of a failure.
   */
  downgradeStaticChecks: Scalars['Boolean']['output'];
  enableCustomChecks: Scalars['Boolean']['output'];
  /** Whether to run Linting during schema checks. */
  enableLintChecks: Scalars['Boolean']['output'];
  /** Clients to ignore during validation */
  excludedClients: Array<ClientFilter>;
  /** Operation names to ignore during validation */
  excludedOperationNames?: Maybe<Array<Maybe<OperationNameFilter>>>;
  /** Operations to ignore during validation */
  excludedOperations: Array<ExcludedOperation>;
  /** Graph that this check configuration belongs to */
  graphID: Scalars['ID']['output'];
  /** ID of the check configuration */
  id: Scalars['ID']['output'];
  /** Default configuration to include operations on the base variant. */
  includeBaseVariant: Scalars['Boolean']['output'];
  /** Variant overrides for validation */
  includedVariants: Array<Scalars['String']['output']>;
  /** Minimum number of requests within the window for an operation to be considered. */
  operationCountThreshold: Scalars['Int']['output'];
  /**
   * Number of requests within the window for an operation to be considered, relative to
   * total request count. Expected values are between 0 and 0.05 (minimum 5% of
   * total request volume)
   */
  operationCountThresholdPercentage: Scalars['Float']['output'];
  /** How submitted build input diffs are handled when they match (or don't) a Proposal */
  proposalChangeMismatchSeverity: ProposalChangeMismatchSeverity;
  /**
   * Only check operations from the last <timeRangeSeconds> seconds.
   * The default is 7 days (604,800 seconds).
   */
  timeRangeSeconds: Scalars['Long']['output'];
  /** Time when check configuration was last updated */
  updatedAt: Scalars['Timestamp']['output'];
  /** Identity of the last user to update the check configuration */
  updatedBy?: Maybe<Identity>;
};

/** Filter options available when listing checks. */
export type CheckFilterInput = {
  /** A list of git commiters. For cli triggered checks, this is the author. */
  authors?: InputMaybe<Array<Scalars['String']['input']>>;
  branches?: InputMaybe<Array<Scalars['String']['input']>>;
  /** A list of actors triggering this check. For non cli triggered checks, this is the Studio User / author. */
  createdBy?: InputMaybe<Array<ActorInput>>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  includeProposalChecks?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<CheckFilterInputStatusOption>;
  subgraphs?: InputMaybe<Array<Scalars['String']['input']>>;
  variants?: InputMaybe<Array<Scalars['String']['input']>>;
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
  coreSchemaModified: Scalars['Boolean']['output'];
  /** Check workflow associated with the overall subgraph check. */
  workflow?: Maybe<CheckWorkflow>;
};

/** The possible results of a request to initiate schema checks (either a success object or one of multiple `Error` objects). */
export type CheckRequestResult = CheckRequestSuccess | InvalidInputError | PermissionError | PlanError | RateLimitExceededError;

/** Represents a successfully initiated execution of schema checks. This does not indicate the _result_ of the checks, only that they were initiated. */
export type CheckRequestSuccess = {
  __typename?: 'CheckRequestSuccess';
  /** The URL of the Apollo Studio page for this check. */
  targetURL: Scalars['String']['output'];
  /** The unique ID for this execution of schema checks. */
  workflowID: Scalars['ID']['output'];
};

/** Input type to provide when running schema checks asynchronously for a non-federated graph. */
export type CheckSchemaAsyncInput = {
  /** Configuration options for the check execution. */
  config: HistoricQueryParametersInput;
  /** The GitHub context to associate with the check. */
  gitContext: GitContextInput;
  /** The URL of the GraphQL endpoint that Apollo Sandbox introspected to obtain the proposed schema. Required if `isSandbox` is `true`. */
  introspectionEndpoint?: InputMaybe<Scalars['String']['input']>;
  /** If `true`, the check was initiated automatically by a Proposal update. */
  isProposal?: InputMaybe<Scalars['Boolean']['input']>;
  /** If `true`, the check was initiated by Apollo Sandbox. */
  isSandbox: Scalars['Boolean']['input'];
  proposedSchemaDocument?: InputMaybe<Scalars['String']['input']>;
};

/** The result of running schema checks on a graph variant. */
export type CheckSchemaResult = {
  __typename?: 'CheckSchemaResult';
  /** The schema diff and affected operations generated by the schema check. */
  diffToPrevious: SchemaDiff;
  /** The unique ID of this execution of checks. */
  operationsCheckID: Scalars['ID']['output'];
  /** The URL to view the schema diff in Studio. */
  targetUrl?: Maybe<Scalars['String']['output']>;
  /** Workflow associated with this check result */
  workflow?: Maybe<CheckWorkflow>;
};

export type CheckStepCompleted = {
  __typename?: 'CheckStepCompleted';
  id: Scalars['ID']['output'];
  status: CheckStepStatus;
};

export type CheckStepFailed = {
  __typename?: 'CheckStepFailed';
  message: Scalars['String']['output'];
};

export type CheckStepInput = {
  graphID: Scalars['String']['input'];
  graphVariant: Scalars['String']['input'];
  taskID: Scalars['ID']['input'];
  workflowID: Scalars['ID']['input'];
};

export type CheckStepResult = CheckStepCompleted | CheckStepFailed | PermissionError | ValidationError;

export enum CheckStepStatus {
  FAILURE = 'FAILURE',
  SUCCESS = 'SUCCESS'
}

/** An individual diagnostic violation of a custom check task. */
export type CheckViolation = {
  __typename?: 'CheckViolation';
  /**
   * The schema coordinate of this rule violation as defined by RFC:
   * 		https://github.com/graphql/graphql-wg/blob/main/rfcs/SchemaCoordinates.md
   * 		Optional for violations that aren't specific to a single schema element
   */
  coordinate?: Maybe<Scalars['String']['output']>;
  /** The violation level for the rule. */
  level: ViolationLevel;
  /** A human-readable message describing the rule violation, rendered as markdown in Apollo Studio. Maximum length: 512 characters. */
  message: Scalars['String']['output'];
  /** The rule being violated. This is used to group multiple violations together in Studio. Max character length is 128. */
  rule: Scalars['String']['output'];
  /** The start and end position in the file of the rule violation. Used to display rule violations in the context of your schema diff. */
  sourceLocations?: Maybe<Array<FileLocation>>;
};

/** An individual diagnostic violation of a custom check task. */
export type CheckViolationInput = {
  /**
   * The schema coordinate of this rule violation as defined by RFC:
   * 		https://github.com/graphql/graphql-wg/blob/main/rfcs/SchemaCoordinates.md
   * 		Optional for violations that aren't specific to a single schema element
   */
  coordinate?: InputMaybe<Scalars['String']['input']>;
  /** The violation level for the rule. */
  level: ViolationLevel;
  /** A human-readable message describing the rule violation, rendered as markdown in Apollo Studio. Maximum length: 512 characters. */
  message: Scalars['String']['input'];
  /** The rule being violated. This is used to group multiple violations together in Studio. Max character length is 128. */
  rule: Scalars['String']['input'];
  /** The start and end position in the file of the rule violation. Used to display rule violations in the context of your schema diff. */
  sourceLocations?: InputMaybe<Array<FileLocationInput>>;
};

export type CheckWorkflow = {
  __typename?: 'CheckWorkflow';
  /** The supergraph schema provided as the base to check against. */
  baseSchemaHash?: Maybe<Scalars['String']['output']>;
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
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  /** The downstream task associated with this workflow, or null if no such task kind was scheduled. */
  downstreamTask?: Maybe<DownstreamCheckTask>;
  /** Contextual parameters supplied by the runtime environment where the check was run. */
  gitContext?: Maybe<GitContext>;
  /** The graph this check workflow belongs to. */
  graph: Service;
  id: Scalars['ID']['output'];
  /** The name of the implementing service that was responsible for triggering the validation. */
  implementingServiceName?: Maybe<Scalars['String']['output']>;
  /** If this check is triggered for an sdl fetched using introspection, this is the endpoint where that schema was being served. */
  introspectionEndpoint?: Maybe<Scalars['String']['output']>;
  /** Only true if the check was triggered from a proposal update. */
  isProposalCheck: Scalars['Boolean']['output'];
  /** Only true if the check was triggered from Sandbox Checks page. */
  isSandboxCheck: Scalars['Boolean']['output'];
  /** The operations task associated with this workflow, or null if no such task was scheduled. */
  operationsTask?: Maybe<OperationsCheckTask>;
  /** If this check came from a proposal, this is the revision that triggered the check. */
  proposalRevision?: Maybe<ProposalRevision>;
  /** The proposed supergraph schema being checked by this check workflow. */
  proposedSchemaHash?: Maybe<Scalars['String']['output']>;
  /** The proposed subgraphs for this check workflow. */
  proposedSubgraphs?: Maybe<Array<Subgraph>>;
  /** If this check was created by rerunning, the original check workflow that was rerun. */
  rerunOf?: Maybe<CheckWorkflow>;
  /** Checks created by re-running this check, most recent first. */
  reruns?: Maybe<Array<CheckWorkflow>>;
  /** The timestamp when the check workflow started. */
  startedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** Overall status of the workflow, based on the underlying task statuses. */
  status: CheckWorkflowStatus;
  /** The names of the subgraphs with changes that triggered the validation. */
  subgraphNames: Array<Scalars['String']['output']>;
  /** The set of check tasks associated with this workflow, e.g. composition, operations, etc. */
  tasks: Array<CheckWorkflowTask>;
  /** Identity of the user who ran this check */
  triggeredBy?: Maybe<Identity>;
  /** The upstream workflow that triggered this workflow, or null if such an upstream workflow does not exist. */
  upstreamWorkflow?: Maybe<CheckWorkflow>;
  /** Configuration of validation at the time the check was run. */
  validationConfig?: Maybe<SchemaDiffValidationConfig>;
};


export type CheckWorkflowRerunsArgs = {
  limit?: Scalars['Int']['input'];
};

export type CheckWorkflowMutation = {
  __typename?: 'CheckWorkflowMutation';
  /** The graph this check workflow belongs to. */
  graph: Service;
  id: Scalars['ID']['output'];
  /**
   * Re-run a check workflow using the current check configuration. The result is either a workflow ID that
   * can be used to check the status or an error message that explains what went wrong.
   */
  rerunAsync: CheckRequestResult;
};


export type CheckWorkflowMutationRerunAsyncArgs = {
  input?: InputMaybe<RerunAsyncInput>;
};

export enum CheckWorkflowStatus {
  FAILED = 'FAILED',
  PASSED = 'PASSED',
  PENDING = 'PENDING'
}

export type CheckWorkflowTask = {
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  /**
   * The status of this task. All tasks start with the PENDING status while initializing. If any
   *  prerequisite task fails, then the task status becomes BLOCKED. Otherwise, if all prerequisite
   *  tasks pass, then this task runs (still having the PENDING status). Once the task completes, the
   *  task status will become either PASSED or FAILED.
   */
  status: CheckWorkflowTaskStatus;
  /** A studio UI url to view the details of this check workflow task */
  targetURL?: Maybe<Scalars['String']['output']>;
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
  name: Scalars['String']['output'];
  /** Version string of the client. */
  version?: Maybe<Scalars['String']['output']>;
};

/**
 * Options to filter by client reference ID, client name, and client version.
 * If passing client version, make sure to either provide a client reference ID or client name.
 */
export type ClientFilterInput = {
  /** name of the client set by the user and reported alongside metrics */
  name: Scalars['String']['input'];
  /** version of the client set by the user and reported alongside metrics */
  version?: InputMaybe<Scalars['String']['input']>;
};

/** Filter options to exclude by client reference ID, client name, and client version. */
export type ClientInfoFilter = {
  name: Scalars['String']['input'];
  /** Ignored */
  referenceID?: InputMaybe<Scalars['ID']['input']>;
  version?: InputMaybe<Scalars['String']['input']>;
};

/** Filter options to exclude clients. Used as an output type for SchemaDiffValidationConfig. */
export type ClientInfoFilterOutput = {
  __typename?: 'ClientInfoFilterOutput';
  name: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
};

/** Cloud queries */
export type Cloud = {
  __typename?: 'Cloud';
  /** Return a given RouterConfigVersion */
  configVersion?: Maybe<RouterConfigVersion>;
  /** Return all RouterConfigVersions */
  configVersions: Array<RouterConfigVersion>;
  /** Cloud Router constants */
  constants: CloudConstants;
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
export type CloudConfigVersionArgs = {
  name: Scalars['String']['input'];
};


/** Cloud queries */
export type CloudConfigVersionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


/** Cloud queries */
export type CloudOrderArgs = {
  orderId: Scalars['String']['input'];
};


/** Cloud queries */
export type CloudRegionsArgs = {
  provider: CloudProvider;
  tier?: InputMaybe<CloudTier>;
};


/** Cloud queries */
export type CloudRouterArgs = {
  id: Scalars['ID']['input'];
};


/** Cloud queries */
export type CloudRouterByInternalIdArgs = {
  internalId: Scalars['ID']['input'];
};


/** Cloud queries */
export type CloudRoutersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  statuses?: InputMaybe<Array<RouterStatus>>;
};


/** Cloud queries */
export type CloudShardArgs = {
  id: Scalars['ID']['input'];
};


/** Cloud queries */
export type CloudShardsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  provider?: InputMaybe<CloudProvider>;
  tier?: InputMaybe<CloudTier>;
};


/** Cloud queries */
export type CloudVersionArgs = {
  version: Scalars['String']['input'];
};


/** Cloud queries */
export type CloudVersionsArgs = {
  input: RouterVersionsInput;
};

/** Constants for Cloud Routers */
export type CloudConstants = {
  __typename?: 'CloudConstants';
  /** Minimum duration between last request and auto-deleting a Serverless Cloud Router */
  durationBeforeDeleteSecs: Scalars['Int']['output'];
  /**
   * Minimum duration between last request and the auto-delete warning for a Serverless
   * Cloud Router
   */
  durationBeforeDeleteWarningSecs: Scalars['Int']['output'];
  /** Minimum duration between last request and auto-pausing a Serverless Cloud Router */
  durationBeforeSleepSecs: Scalars['Int']['output'];
  /**
   * Minimum duration between last request and the auto-pause warning for a Serverless
   * Cloud Router
   */
  durationBeforeSleepWarningSecs: Scalars['Int']['output'];
};

/** Invalid input error */
export type CloudInvalidInputError = {
  __typename?: 'CloudInvalidInputError';
  /** Argument related to the error */
  argument: Scalars['String']['output'];
  /** Location of the error */
  location?: Maybe<Scalars['String']['output']>;
  /** Reason for the error */
  reason: Scalars['String']['output'];
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
export type CloudMutationCreateConfigVersionArgs = {
  input: RouterConfigVersionInput;
};


/** Cloud mutations */
export type CloudMutationCreateRouterArgs = {
  id: Scalars['ID']['input'];
  input: CreateRouterInput;
};


/** Cloud mutations */
export type CloudMutationCreateShardArgs = {
  input: CreateShardInput;
};


/** Cloud mutations */
export type CloudMutationCreateVersionArgs = {
  version: RouterVersionCreateInput;
};


/** Cloud mutations */
export type CloudMutationDestroyRouterArgs = {
  id: Scalars['ID']['input'];
};


/** Cloud mutations */
export type CloudMutationOrderArgs = {
  orderId: Scalars['String']['input'];
};


/** Cloud mutations */
export type CloudMutationRouterArgs = {
  id: Scalars['ID']['input'];
};


/** Cloud mutations */
export type CloudMutationUpdateConfigVersionArgs = {
  input: RouterConfigVersionInput;
};


/** Cloud mutations */
export type CloudMutationUpdateRouterArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRouterInput;
};


/** Cloud mutations */
export type CloudMutationUpdateShardArgs = {
  input: UpdateShardInput;
};


/** Cloud mutations */
export type CloudMutationUpdateVersionArgs = {
  version: RouterVersionUpdateInput;
};

/** Cloud onboarding information */
export type CloudOnboarding = {
  __typename?: 'CloudOnboarding';
  /** Graph variant reference for Cloud Onboarding */
  graphRef: Scalars['String']['output'];
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
  graphRef: Scalars['String']['input'];
  /** The cloud provider */
  provider: CloudProvider;
  /** Region for the Cloud Onboarding */
  region: Scalars['String']['input'];
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

/** Generic input error */
export type CloudRouterTestingInvalidInputErrors = {
  __typename?: 'CloudRouterTestingInvalidInputErrors';
  errors: Array<Scalars['String']['output']>;
  message: Scalars['String']['output'];
};

export type CloudRouterTestingToolPaginationInput = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type CloudTesting = {
  __typename?: 'CloudTesting';
  routerVersionBuild?: Maybe<RouterVersionBuildResult>;
  routerVersionBuilds: RouterVersionBuildPageResults;
  testRouter?: Maybe<TestRouter>;
};


export type CloudTestingRouterVersionBuildArgs = {
  id: Scalars['ID']['input'];
};


export type CloudTestingRouterVersionBuildsArgs = {
  input: RouterVersionBuildsInput;
};


export type CloudTestingTestRouterArgs = {
  id: Scalars['ID']['input'];
};

export type CloudTestingMutation = {
  __typename?: 'CloudTestingMutation';
  buildRouterVersion: BuildRouterVersionResult;
  cancelAllRouterVersionBuilds: Scalars['Boolean']['output'];
  cancelRouterVersionBuild: Scalars['Boolean']['output'];
  deleteAllRouterLaunches: Scalars['Boolean']['output'];
  deleteAllRouterVersionBuilds: Scalars['Boolean']['output'];
  deleteTestRouter: DeleteTestRouterResult;
  launchTestRouter: LaunchTestRouterResult;
};


export type CloudTestingMutationBuildRouterVersionArgs = {
  input: BuildRouterVersionInput;
};


export type CloudTestingMutationCancelRouterVersionBuildArgs = {
  id: Scalars['ID']['input'];
};


export type CloudTestingMutationDeleteTestRouterArgs = {
  id: Scalars['ID']['input'];
};


export type CloudTestingMutationLaunchTestRouterArgs = {
  input: LaunchTestRouterInput;
};

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
  message: Scalars['String']['output'];
};

export type CommentFilter = {
  schemaScope?: InputMaybe<Scalars['String']['input']>;
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
  apiSchemaDocument: Scalars['String']['output'];
  /** The supergraph core schema document/SDL generated from composition/filtering. */
  supergraphSchemaDocument: Scalars['String']['output'];
};

export type ComposeAndFilterPreviewComposeError = {
  __typename?: 'ComposeAndFilterPreviewComposeError';
  /** A machine-readable error code. See https://www.apollographql.com/docs/federation/errors/for more info. */
  code?: Maybe<Scalars['String']['output']>;
  /** The step at which composition failed. */
  failedStep?: Maybe<Scalars['String']['output']>;
  /** Source locations related to the error. */
  locations?: Maybe<Array<SourceLocation>>;
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
};

export type ComposeAndFilterPreviewComposeFailure = {
  __typename?: 'ComposeAndFilterPreviewComposeFailure';
  /** The list of errors from failed composition. */
  composeErrors: Array<ComposeAndFilterPreviewComposeError>;
};

export type ComposeAndFilterPreviewFilterError = {
  __typename?: 'ComposeAndFilterPreviewFilterError';
  /** The step at which filtering failed. See https://www.apollographql.com/docs/studio/contracts/#contract-errors for more info. */
  failedStep?: Maybe<Scalars['String']['output']>;
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
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
  name: Scalars['String']['input'];
};

export type ComposeAndFilterPreviewSubgraphChangeInfo = {
  /**
   * The routing URL of the subgraph. If a subgraph with the same name exists, then this
   * field can be null to indicate the existing subgraph's info should be used; using
   * null otherwise results in an error.
   */
  routingUrl?: InputMaybe<Scalars['String']['input']>;
  /**
   * The schema document/SDL of the subgraph. If a subgraph with the same name exists,
   * then this field can be null to indicate the existing subgraph's info should be
   * used; using null otherwise results in an error.
   */
  schemaDocument?: InputMaybe<Scalars['String']['input']>;
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
  createdAt: Scalars['Timestamp']['output'];
  /** Whether the removed implementing service existed. */
  didExist: Scalars['Boolean']['output'];
  /** A list of errors that occurred during composition. Errors mean that Apollo was unable to compose the graph variant's subgraphs into a supergraph schema. If any errors are present, gateways / routers are not updated. */
  errors: Array<Maybe<SchemaCompositionError>>;
  /** ID that points to the results of composition. */
  graphCompositionID: Scalars['String']['output'];
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  /** Whether this composition result resulted in a new supergraph schema passed to Uplink (`true`), or the build failed for any reason (`false`). For dry runs, this value is `true` if Uplink _would have_ been updated with the result. */
  updatedGateway: Scalars['Boolean']['output'];
};

/** The result of supergraph composition that Studio performed in response to an attempted publish of a subgraph. */
export type CompositionAndUpsertResult = {
  __typename?: 'CompositionAndUpsertResult';
  /** The generated composition config, or null if any errors occurred. */
  compositionConfig?: Maybe<CompositionConfig>;
  createdAt: Scalars['Timestamp']['output'];
  /** A list of errors that occurred during composition. Errors mean that Apollo was unable to compose the graph variant's subgraphs into a supergraph schema. If any errors are present, gateways / routers are not updated. */
  errors: Array<Maybe<SchemaCompositionError>>;
  /** ID that points to the results of composition. */
  graphCompositionID: Scalars['String']['output'];
  /** The Launch result part of this subgraph publish. */
  launch?: Maybe<Launch>;
  /** Human-readable text describing the launch result of the subgraph publish. */
  launchCliCopy?: Maybe<Scalars['String']['output']>;
  /** The URL of the Studio page for this update's associated launch, if available. */
  launchUrl?: Maybe<Scalars['String']['output']>;
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  /** All subgraphs that were created from this mutation */
  subgraphsCreated: Array<Scalars['String']['output']>;
  /** All subgraphs that were updated from this mutation */
  subgraphsUpdated: Array<Scalars['String']['output']>;
  /** Whether this composition result resulted in a new supergraph schema passed to Uplink (`true`), or the build failed for any reason (`false`). For dry runs, this value is `true` if Uplink _would have_ been updated with the result. */
  updatedGateway: Scalars['Boolean']['output'];
  /** Whether a new subgraph was created as part of this publish. */
  wasCreated: Scalars['Boolean']['output'];
  /** Whether an implementingService was updated as part of this mutation */
  wasUpdated: Scalars['Boolean']['output'];
};

export type CompositionBuildCheckFailed = BuildCheckFailed & BuildCheckResult & CompositionBuildCheckResult & {
  __typename?: 'CompositionBuildCheckFailed';
  buildInputs: CompositionBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  compositionPackageVersion?: Maybe<Scalars['String']['output']>;
  errors: Array<BuildError>;
  id: Scalars['ID']['output'];
  passed: Scalars['Boolean']['output'];
  workflowTask: CompositionCheckTask;
};

export type CompositionBuildCheckPassed = BuildCheckPassed & BuildCheckResult & CompositionBuildCheckResult & {
  __typename?: 'CompositionBuildCheckPassed';
  buildInputs: CompositionBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  compositionPackageVersion?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  passed: Scalars['Boolean']['output'];
  supergraphSchemaHash: Scalars['SHA256']['output'];
  workflowTask: CompositionCheckTask;
};

export type CompositionBuildCheckResult = {
  buildInputs: CompositionBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  /** The version of the OSS apollo composition package used during build */
  compositionPackageVersion?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  passed: Scalars['Boolean']['output'];
  workflowTask: CompositionCheckTask;
};

export type CompositionBuildInput = {
  __typename?: 'CompositionBuildInput';
  subgraphs: Array<Subgraph>;
  version?: Maybe<Scalars['String']['output']>;
};

export type CompositionBuildInputSubgraph = {
  __typename?: 'CompositionBuildInputSubgraph';
  /** The name of the subgraph. */
  name: Scalars['String']['output'];
  /** The routing URL of the subgraph. */
  routingUrl: Scalars['String']['output'];
  /** The SHA-256 of the schema document of the subgraph. */
  schemaHash: Scalars['SHA256']['output'];
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
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  /**
   * Whether the build's output supergraph core schema differs from that of the active publish for
   * the workflow's variant at the time this field executed (NOT at the time the check workflow
   * started).
   */
  coreSchemaModified: Scalars['Boolean']['output'];
  createdAt: Scalars['Timestamp']['output'];
  graphID: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  proposedBuildInputChanges: ProposedCompositionBuildInputChanges;
  /**
   * An old version of buildResult that returns a very old GraphQL type that generally should be
   * avoided. This field will soon be deprecated.
   */
  result?: Maybe<CompositionResult>;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']['output']>;
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
  schemaHash: Scalars['String']['output'];
};

export type CompositionConfigInput = {
  subgraphs: Array<SubgraphInput>;
};

/** The result of supergraph composition that Studio performed. */
export type CompositionPublishResult = CompositionResult & {
  __typename?: 'CompositionPublishResult';
  /** The generated composition config, or null if any errors occurred. */
  compositionConfig?: Maybe<CompositionConfig>;
  createdAt: Scalars['Timestamp']['output'];
  /** A list of errors that occurred during composition. Errors mean that Apollo was unable to compose the graph variant's subgraphs into a supergraph schema. If any errors are present, gateways / routers are not updated. */
  errors: Array<SchemaCompositionError>;
  /** The unique ID for this instance of composition. */
  graphCompositionID: Scalars['ID']['output'];
  graphID: Scalars['ID']['output'];
  /** Null if CompositionPublishResult was not on a Proposal Variant */
  proposalRevision?: Maybe<ProposalRevision>;
  /**
   * Cloud router configuration associated with this build event.
   * It will be non-null for any cloud-router variant, and null for any not cloudy variant/graph
   */
  routerConfig?: Maybe<Scalars['String']['output']>;
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  /** The supergraph SDL generated by composition. */
  supergraphSdl?: Maybe<Scalars['GraphQLDocument']['output']>;
  /** Whether this composition result updated gateway/router instances via Uplink (`true`), or it was a dry run (`false`). */
  updatedGateway: Scalars['Boolean']['output'];
};

/** The result of supergraph composition performed by Apollo Studio, often as the result of a subgraph check or subgraph publish. See individual implementations for more details. */
export type CompositionResult = {
  createdAt: Scalars['Timestamp']['output'];
  /** A list of errors that occurred during composition. Errors mean that Apollo was unable to compose the graph variant's subgraphs into a supergraph schema. If any errors are present, gateways / routers are not updated. */
  errors: Array<SchemaCompositionError>;
  /** The unique ID for this instance of composition. */
  graphCompositionID: Scalars['ID']['output'];
  /**
   * Cloud router configuration associated with this build event.
   * It will be non-null for any cloud-router variant, and null for any not cloudy variant/graph
   */
  routerConfig?: Maybe<Scalars['String']['output']>;
  /** List of subgraphs included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  /** Supergraph SDL generated by composition. */
  supergraphSdl?: Maybe<Scalars['GraphQLDocument']['output']>;
};

export type CompositionStatusSubscription = ChannelSubscription & {
  __typename?: 'CompositionStatusSubscription';
  channels: Array<Channel>;
  createdAt: Scalars['Timestamp']['output'];
  enabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  lastUpdatedAt: Scalars['Timestamp']['output'];
  variant?: Maybe<Scalars['String']['output']>;
};

/** The composition config exposed to the gateway */
export type CompositionValidationDetails = {
  __typename?: 'CompositionValidationDetails';
  /** Hash of the composed schema */
  schemaHash?: Maybe<Scalars['String']['output']>;
};

/** The result of composition validation run by Apollo Studio during a subgraph check. */
export type CompositionValidationResult = CompositionResult & {
  __typename?: 'CompositionValidationResult';
  /** Describes whether composition succeeded. */
  compositionSuccess: Scalars['Boolean']['output'];
  /**
   * Akin to a composition config, represents the subgraph schemas and corresponding subgraphs that were used
   * in running composition. Will be null if any errors are encountered. Also may contain a schema hash if
   * one could be computed, which can be used for schema validation.
   */
  compositionValidationDetails?: Maybe<CompositionValidationDetails>;
  createdAt: Scalars['Timestamp']['output'];
  /** A list of errors that occurred during composition. Errors mean that Apollo was unable to compose the graph variant's subgraphs into a supergraph schema. If any errors are present, gateways / routers are not updated. */
  errors: Array<SchemaCompositionError>;
  /** The unique ID for this instance of composition. */
  graphCompositionID: Scalars['ID']['output'];
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
  routerConfig?: Maybe<Scalars['String']['output']>;
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  /** The supergraph schema document generated by composition. */
  supergraphSdl?: Maybe<Scalars['GraphQLDocument']['output']>;
  /** If created as part of a check workflow, the associated workflow task. */
  workflowTask?: Maybe<CompositionCheckTask>;
};

export type ContractConfigInput = {
  baseGraphRef: Scalars['String']['input'];
  filterConfigInput: FilterConfigInput;
};

export type ContractPreview = {
  __typename?: 'ContractPreview';
  result: ContractPreviewResult;
  upstreamLaunch: Launch;
};

export type ContractPreviewErrors = {
  __typename?: 'ContractPreviewErrors';
  errors: Array<Scalars['String']['output']>;
  failedAt: ContractVariantFailedStep;
};

export type ContractPreviewResult = ContractPreviewErrors | ContractPreviewSuccess;

export type ContractPreviewSuccess = {
  __typename?: 'ContractPreviewSuccess';
  apiDocument: Scalars['String']['output'];
  coreDocument: Scalars['String']['output'];
  fieldCount: Scalars['Int']['output'];
  typeCount: Scalars['Int']['output'];
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
  errorMessages: Array<Scalars['String']['output']>;
};

export type ContractVariantUpsertResult = ContractVariantUpsertErrors | ContractVariantUpsertSuccess;

export type ContractVariantUpsertSuccess = {
  __typename?: 'ContractVariantUpsertSuccess';
  /** The updated contract variant */
  contractVariant: GraphVariant;
  /** Human-readable text describing the launch result of the contract update. */
  launchCliCopy?: Maybe<Scalars['String']['output']>;
  /** The URL of the Studio page for this update's associated launch, if available. */
  launchUrl?: Maybe<Scalars['String']['output']>;
};

export type Coordinate = {
  __typename?: 'Coordinate';
  byteOffset: Scalars['Int']['output'];
  column: Scalars['Int']['output'];
  line: Scalars['Int']['output'];
};

export type CoordinateInsights = {
  __typename?: 'CoordinateInsights';
  /** If the first or last seen timestamps are earlier than this timestamp, we can't tell the exact date that we saw this coordinate since our data is bound by the retention period. */
  earliestRetentionTime?: Maybe<Scalars['Timestamp']['output']>;
  /** The earliest time we saw references or executions for this coordinate. Null if the coordinate has never been seen or it is not in the schema. */
  firstSeen?: Maybe<Scalars['Timestamp']['output']>;
  /** The most recent time we saw references or executions for this coordinate. Null if the coordinate has never been seen or it is not in the schema. */
  lastSeen?: Maybe<Scalars['Timestamp']['output']>;
};

export type CoordinateInsightsListFilterInInput = {
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CoordinateInsightsListFilterInput = {
  clientName?: InputMaybe<Scalars['String']['input']>;
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  coordinateKind?: InputMaybe<CoordinateKind>;
  in?: InputMaybe<CoordinateInsightsListFilterInInput>;
  isDeprecated?: InputMaybe<Scalars['Boolean']['input']>;
  isUnused?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<CoordinateInsightsListFilterInput>>;
  /** Filters on partial string matches of Named Type and Named Attribute */
  search?: InputMaybe<Scalars['String']['input']>;
};

export type CoordinateInsightsListItem = {
  __typename?: 'CoordinateInsightsListItem';
  /** The estimated number of field executions for this field, based on the field execution sample rate. This can be null depending on the sort order. */
  estimatedExecutionCount?: Maybe<Scalars['Long']['output']>;
  /** The number of field executions recorded for this field. This can be null depending on the sort order. */
  executionCount?: Maybe<Scalars['Long']['output']>;
  isDeprecated: Scalars['Boolean']['output'];
  isUnused: Scalars['Boolean']['output'];
  namedAttribute: Scalars['String']['output'];
  namedType: Scalars['String']['output'];
  /** The count of operations that reference the coordinate. This can be null depending on the sort order. */
  referencingOperationCount?: Maybe<Scalars['Long']['output']>;
  /** The count of operations that reference the coordinate per minute. This can be null depending on the sort order. */
  referencingOperationCountPerMin?: Maybe<Scalars['Float']['output']>;
};

export enum CoordinateInsightsListOrderByColumn {
  ESTIMATED_EXECUTION_COUNT = 'ESTIMATED_EXECUTION_COUNT',
  EXECUTION_COUNT = 'EXECUTION_COUNT',
  REFERENCING_OPERATION_COUNT = 'REFERENCING_OPERATION_COUNT',
  REFERENCING_OPERATION_COUNT_PER_MIN = 'REFERENCING_OPERATION_COUNT_PER_MIN',
  SCHEMA_COORDINATE = 'SCHEMA_COORDINATE'
}

export type CoordinateInsightsListOrderByInput = {
  column: CoordinateInsightsListOrderByColumn;
  direction: Ordering;
};

/** Information about pagination in a connection. */
export type CoordinateInsightsListPageInfo = {
  __typename?: 'CoordinateInsightsListPageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum CoordinateKind {
  ENUM_VALUE = 'ENUM_VALUE',
  INPUT_OBJECT_FIELD = 'INPUT_OBJECT_FIELD',
  OBJECT_FIELD = 'OBJECT_FIELD'
}

/** Columns of CoordinateUsage. */
export enum CoordinateUsageColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ESTIMATED_EXECUTION_COUNT = 'ESTIMATED_EXECUTION_COUNT',
  EXECUTION_COUNT = 'EXECUTION_COUNT',
  KIND = 'KIND',
  NAMED_ATTRIBUTE = 'NAMED_ATTRIBUTE',
  NAMED_TYPE = 'NAMED_TYPE',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REFERENCING_OPERATION_COUNT = 'REFERENCING_OPERATION_COUNT',
  REQUEST_COUNT_NULL = 'REQUEST_COUNT_NULL',
  REQUEST_COUNT_UNDEFINED = 'REQUEST_COUNT_UNDEFINED',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  TIMESTAMP = 'TIMESTAMP'
}

export type CoordinateUsageDimensions = {
  __typename?: 'CoordinateUsageDimensions';
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  kind?: Maybe<Scalars['String']['output']>;
  namedAttribute?: Maybe<Scalars['String']['output']>;
  namedType?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['String']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in CoordinateUsage. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type CoordinateUsageFilter = {
  and?: InputMaybe<Array<CoordinateUsageFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<CoordinateUsageFilterIn>;
  /** Selects rows whose kind dimension equals the given value if not null. To query for the null value, use {in: {kind: [null]}} instead. */
  kind?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose namedAttribute dimension equals the given value if not null. To query for the null value, use {in: {namedAttribute: [null]}} instead. */
  namedAttribute?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose namedType dimension equals the given value if not null. To query for the null value, use {in: {namedType: [null]}} instead. */
  namedType?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<CoordinateUsageFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<CoordinateUsageFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in CoordinateUsage. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type CoordinateUsageFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose kind dimension is in the given list. A null value in the list means a row with null for that dimension. */
  kind?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose namedAttribute dimension is in the given list. A null value in the list means a row with null for that dimension. */
  namedAttribute?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose namedType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  namedType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type CoordinateUsageMetrics = {
  __typename?: 'CoordinateUsageMetrics';
  estimatedExecutionCount: Scalars['Long']['output'];
  executionCount: Scalars['Long']['output'];
  referencingOperationCount: Scalars['Long']['output'];
  requestCountNull: Scalars['Long']['output'];
  requestCountUndefined: Scalars['Long']['output'];
};

export type CoordinateUsageOrderBySpec = {
  column: CoordinateUsageColumn;
  direction: Ordering;
};

export type CoordinateUsageRecord = {
  __typename?: 'CoordinateUsageRecord';
  /** Dimensions of CoordinateUsage that can be grouped by. */
  groupBy: CoordinateUsageDimensions;
  /** Metrics of CoordinateUsage that can be aggregated over. */
  metrics: CoordinateUsageMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp']['output'];
};

/** Contains the supergraph and API schemas generated by composition. */
export type CoreSchema = {
  __typename?: 'CoreSchema';
  /** The composed API schema document. */
  apiDocument: Scalars['GraphQLDocument']['output'];
  /** The API schema document's SHA256 hash, represented as a hexadecimal string. */
  apiHash: Scalars['String']['output'];
  /** The composed supergraph schema document. */
  coreDocument: Scalars['GraphQLDocument']['output'];
  /** The supergraph schema document's SHA256 hash, represented as a hexadecimal string. */
  coreHash: Scalars['String']['output'];
  fieldCount: Scalars['Int']['output'];
  tags: Array<Scalars['String']['output']>;
  typeCount: Scalars['Int']['output'];
};

/** Input to create a new AWS shard */
export type CreateAwsShardInput = {
  accountId: Scalars['String']['input'];
  coldStartTargetGroupArns?: InputMaybe<Array<Scalars['String']['input']>>;
  ecsClusterArn: Scalars['String']['input'];
  iamRoleArn: Scalars['String']['input'];
  loadbalancerSecurityGroupId: Scalars['String']['input'];
  loadbalancers: Array<AwsLoadBalancerInput>;
  permissionsBoundaryArn: Scalars['String']['input'];
  region: Scalars['String']['input'];
  subnetIds: Array<Scalars['String']['input']>;
  vpcId: Scalars['String']['input'];
};

/** Result from the createCloudOnboarding mutation */
export type CreateOnboardingResult = CreateOnboardingSuccess | InternalServerError | InvalidInputErrors;

/** Success creating a CloudOnboarding */
export type CreateOnboardingSuccess = {
  __typename?: 'CreateOnboardingSuccess';
  onboarding: CloudOnboarding;
};

export type CreateOperationCollectionResult = NotFoundError | OperationCollection | PermissionError | ValidationError;

/** The result of a successful call to GraphMutation.createPersistedQueryList. */
export type CreatePersistedQueryListResult = {
  __typename?: 'CreatePersistedQueryListResult';
  persistedQueryList: PersistedQueryList;
};

/** The result/error union returned by GraphMutation.createPersistedQueryList. */
export type CreatePersistedQueryListResultOrError = CreatePersistedQueryListResult | PermissionError;

/** An error that occurs when creating a proposal fails. */
export type CreateProposalError = Error & {
  __typename?: 'CreateProposalError';
  /** The error's details. */
  message: Scalars['String']['output'];
};

export type CreateProposalInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayName: Scalars['String']['input'];
  sourceVariantName: Scalars['String']['input'];
};

export type CreateProposalLifecycleSubscriptionInput = {
  events: Array<ProposalLifecycleEvent>;
  webhookChannelID: Scalars['ID']['input'];
};

export type CreateProposalLifecycleSubscriptionResult = PermissionError | ProposalLifecycleSubscription | ValidationError;

export type CreateProposalResult = CreateProposalError | GraphVariant | PermissionError | ValidationError;

/** Input to create a new Cloud Router */
export type CreateRouterInput = {
  /**
   * Number of GCUs allocated for the Cloud Router
   *
   * This is ignored for serverless Cloud Routers
   */
  gcus?: InputMaybe<Scalars['Int']['input']>;
  /** Graph composition ID, also known as launch ID */
  graphCompositionId?: InputMaybe<Scalars['String']['input']>;
  /** Unique identifier for ordering orders */
  orderingId: Scalars['String']['input'];
  /** Configuration for the Cloud Router */
  routerConfig?: InputMaybe<Scalars['String']['input']>;
  /** Router version for the Cloud Router */
  routerVersion?: InputMaybe<Scalars['String']['input']>;
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
export type CreateRouterVersionResult = InternalServerError | InvalidInputErrors | RouterVersion;

export type CreateRuleEnforcementInput = {
  graphVariant?: InputMaybe<Scalars['String']['input']>;
  params?: InputMaybe<Array<StringToStringInput>>;
  policy: EnforcementPolicy;
};

/** Input to create a new Shard */
export type CreateShardInput = {
  aws?: InputMaybe<CreateAwsShardInput>;
  gcuCapacity?: InputMaybe<Scalars['Int']['input']>;
  gcuUsage?: InputMaybe<Scalars['Int']['input']>;
  provider: CloudProvider;
  reason?: InputMaybe<Scalars['String']['input']>;
  routerCapacity?: InputMaybe<Scalars['Int']['input']>;
  routerUsage?: InputMaybe<Scalars['Int']['input']>;
  shardId: Scalars['String']['input'];
  status?: InputMaybe<ShardStatus>;
  tier: CloudTier;
};

export type CronExecution = {
  __typename?: 'CronExecution';
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  failure?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  job: CronJob;
  resolvedAt?: Maybe<Scalars['Timestamp']['output']>;
  resolvedBy?: Maybe<Actor>;
  schedule: Scalars['String']['output'];
  startedAt: Scalars['Timestamp']['output'];
};

export type CronJob = {
  __typename?: 'CronJob';
  group: Scalars['String']['output'];
  name: Scalars['String']['output'];
  recentExecutions: Array<CronExecution>;
};


export type CronJobRecentExecutionsArgs = {
  n?: InputMaybe<Scalars['Int']['input']>;
};

export type CustomCheckCallbackInput = {
  /** Sets the status of your check task. Setting this status to FAILURE will cause the entire check workflow to fail. */
  status: CheckStepStatus;
  /** The ID of the custom check task, provided in the webhook payload. */
  taskId: Scalars['ID']['input'];
  /** The violations found by your check task. Max length is 1000 */
  violations?: InputMaybe<Array<CheckViolationInput>>;
  /** The ID of the workflow that the custom check task is a member of, provided in the webhook payload. */
  workflowId: Scalars['ID']['input'];
};

/** Result of a custom check task callback mutation. */
export type CustomCheckCallbackResult = CustomCheckResult | PermissionError | TaskError | ValidationError;

/** Custom check configuration detailing webhook integration. */
export type CustomCheckConfiguration = {
  __typename?: 'CustomCheckConfiguration';
  channel: CustomCheckWebhookChannel;
  id: Scalars['ID']['output'];
};

/** Result of a custom check configuration update mutation. */
export type CustomCheckConfigurationResult = CustomCheckConfiguration | PermissionError | ValidationError;

export type CustomCheckResult = {
  __typename?: 'CustomCheckResult';
  violations: Array<CheckViolation>;
};

export type CustomCheckTask = CheckWorkflowTask & {
  __typename?: 'CustomCheckTask';
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  graphID: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  result?: Maybe<CustomCheckResult>;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']['output']>;
  workflow: CheckWorkflow;
};

/** Configuration of a webhook integration for a custom check. */
export type CustomCheckWebhookChannel = {
  __typename?: 'CustomCheckWebhookChannel';
  /** The time when this CustomCheckWebhookChannel was created. */
  createdAt: Scalars['Timestamp']['output'];
  /** The Identity that created this CustomCheckWebhookChannel. null if the Identity has been deleted. */
  createdBy?: Maybe<Identity>;
  /** The ID for this webhook channel */
  id: Scalars['ID']['output'];
  /** The last time this subscription was updated, if never updated will be the createdAt time. */
  lastUpdatedAt: Scalars['Timestamp']['output'];
  /** The Identity that last updated this CustomCheckWebhookChannel, or the creator if no one has updated. null if the Identity has been deleted. */
  lastUpdatedBy?: Maybe<Identity>;
  /** Whether or not a secret token has been set on this channel. */
  secretTokenIsSet: Scalars['Boolean']['output'];
  /** The URL to send the webhook to. */
  url: Scalars['String']['output'];
  /** The variant name if this channel is only configured for a specific variant. If null, this configuration applies to all variants. */
  variant?: Maybe<Scalars['String']['output']>;
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
  apiKey: Scalars['String']['output'];
  apiRegion: DatadogApiRegion;
  enabled: Scalars['Boolean']['output'];
  legacyMetricNames: Scalars['Boolean']['output'];
};

export type DeleteCommentInput = {
  id: Scalars['String']['input'];
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

/** The result of a successful call to PersistedQueryListMutation.deleteOperationsByFilter. */
export type DeleteOperationsByFilterResult = {
  __typename?: 'DeleteOperationsByFilterResult';
  /** The build created by this delete operation. */
  build?: Maybe<PersistedQueryListBuild>;
  /** Returns `true` if no changes were made by this operation (and no new revision was created). Otherwise, returns `false`. */
  unchanged: Scalars['Boolean']['output'];
};

/** The result/error union returned by PersistedQueryListMutation.deleteOperationsByFilter. */
export type DeleteOperationsByFilterResultOrError = DeleteOperationsByFilterResult | PermissionError;

/** The result of a successful call to PersistedQueryListMutation.delete. */
export type DeletePersistedQueryListResult = {
  __typename?: 'DeletePersistedQueryListResult';
  graph: Service;
};

/** The result/error union returned by PersistedQueryListMutation.delete. */
export type DeletePersistedQueryListResultOrError = CannotDeleteLinkedPersistedQueryListError | DeletePersistedQueryListResult | PermissionError;

export type DeleteProposalLifecycleSubscriptionInput = {
  id: Scalars['String']['input'];
};

export type DeleteProposalLifecycleSubscriptionResult = DeleteProposalLifecycleSubscriptionSuccess | NotFoundError | PermissionError;

export type DeleteProposalLifecycleSubscriptionSuccess = {
  __typename?: 'DeleteProposalLifecycleSubscriptionSuccess';
  /** The id of the ProposalLifecycleSubscription that was deleted */
  id: Scalars['ID']['output'];
};

export type DeleteProposalSubgraphInput = {
  previousLaunchId?: InputMaybe<Scalars['ID']['input']>;
  subgraphName: Scalars['String']['input'];
  summary: Scalars['String']['input'];
};

export type DeleteProposalSubgraphResult = PermissionError | Proposal | ValidationError;

/** The result of attempting to delete a graph variant. */
export type DeleteSchemaTagResult = {
  __typename?: 'DeleteSchemaTagResult';
  /** Whether the variant was deleted or not. */
  deleted: Scalars['Boolean']['output'];
};

export type DeleteTestRouterResult = CloudRouterTestingInvalidInputErrors | DeleteTestRouterSuccess;

export type DeleteTestRouterSuccess = {
  __typename?: 'DeleteTestRouterSuccess';
  jobId: Scalars['String']['output'];
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
  enabled: Scalars['Boolean']['output'];
  /** name of the directive */
  name: Scalars['String']['output'];
};

/** The result of a schema checks workflow that was run on a downstream variant as part of checks for the corresponding source variant. Most commonly, these downstream checks are [contract checks](https://www.apollographql.com/docs/studio/contracts#contract-checks). */
export type DownstreamCheckResult = {
  __typename?: 'DownstreamCheckResult';
  /** Whether the downstream check workflow blocks the upstream check workflow from completing. */
  blocking: Scalars['Boolean']['output'];
  /** The ID of the graph that the downstream variant belongs to. */
  downstreamGraphID: Scalars['String']['output'];
  /** The name of the downstream variant. */
  downstreamVariantName: Scalars['String']['output'];
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
  failsUpstreamWorkflow?: Maybe<Scalars['Boolean']['output']>;
  /** The downstream checks task that this result corresponds to. */
  workflowTask: DownstreamCheckTask;
};

export type DownstreamCheckTask = CheckWorkflowTask & {
  __typename?: 'DownstreamCheckTask';
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  /**
   * A list of results for all downstream checks triggered as part of the source variant's checks workflow.
   * This value is null if the task hasn't been initialized yet, or if the build task fails (the build task is a
   * prerequisite to this task). This value is _not_ null _while_ the task is running. The returned list is empty
   * if the source variant has no downstream variants.
   */
  results?: Maybe<Array<DownstreamCheckResult>>;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']['output']>;
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
  /** @deprecated This data came from Metronome and we no longer use Metronome */
  billingPeriodEndsAt: Scalars['Timestamp']['output'];
  /** @deprecated This data came from Metronome and we no longer use Metronome */
  billingPeriodStartsAt: Scalars['Timestamp']['output'];
  /**
   * The approximate date in the future we expect the customer to be billed if they fully complete the billing cycle
   * @deprecated This data came from Metronome and we no longer use Metronome
   */
  expectedInvoiceAt: Scalars['Timestamp']['output'];
  /**
   * When this invoice was sent to the customer, if it's been sent
   * @deprecated This data came from Metronome and we no longer use Metronome
   */
  invoicedAt?: Maybe<Scalars['Timestamp']['output']>;
  /**
   * Breakdown of this invoice's charges. May be empty if we don't have a breakdown
   * @deprecated This data came from Metronome and we no longer use Metronome
   */
  lineItems?: Maybe<Array<InvoiceLineItem>>;
  /** @deprecated This data came from Metronome and we no longer use Metronome */
  subtotalInCents: Scalars['Int']['output'];
  /** @deprecated This data came from Metronome and we no longer use Metronome */
  totalInCents: Scalars['Int']['output'];
};

export type DuplicateOperationCollectionResult = OperationCollection | PermissionError | ValidationError;

export type DurationHistogram = {
  __typename?: 'DurationHistogram';
  averageDurationMs?: Maybe<Scalars['Float']['output']>;
  buckets: Array<DurationHistogramBucket>;
  durationMs?: Maybe<Scalars['Float']['output']>;
  /** Counts per durationBucket, where sequences of zeroes are replaced with the negative of their size */
  sparseBuckets: Array<Scalars['Long']['output']>;
  totalCount: Scalars['Long']['output'];
  totalDurationMs: Scalars['Float']['output'];
};


export type DurationHistogramDurationMsArgs = {
  percentile: Scalars['Float']['input'];
};

export type DurationHistogramBucket = {
  __typename?: 'DurationHistogramBucket';
  count: Scalars['Long']['output'];
  index: Scalars['Int']['output'];
  rangeBeginMs: Scalars['Float']['output'];
  rangeEndMs: Scalars['Float']['output'];
};

export type EdgeServerInfo = {
  /** A randomly generated UUID, immutable for the lifetime of the edge server runtime. */
  bootId: Scalars['String']['input'];
  /** A unique identifier for the executable GraphQL served by the edge server. length must be <= 64 characters. */
  executableSchemaId: Scalars['String']['input'];
  /** The graph variant, defaults to 'current' */
  graphVariant?: Scalars['String']['input'];
  /** The version of the edge server reporting agent, e.g. apollo-server-2.8, graphql-java-3.1, etc. length must be <= 256 characters. */
  libraryVersion?: InputMaybe<Scalars['String']['input']>;
  /** The infra environment in which this edge server is running, e.g. localhost, Kubernetes, AWS Lambda, Google CloudRun, AWS ECS, etc. length must be <= 256 characters. */
  platform?: InputMaybe<Scalars['String']['input']>;
  /** The runtime in which the edge server is running, e.g. node 12.03, zulu8.46.0.19-ca-jdk8.0.252-macosx_x64, etc. length must be <= 256 characters. */
  runtimeVersion?: InputMaybe<Scalars['String']['input']>;
  /** If available, an identifier for the edge server instance, such that when restarting this instance it will have the same serverId, with a different bootId. For example, in Kubernetes this might be the pod name. Length must be <= 256 characters. */
  serverId?: InputMaybe<Scalars['String']['input']>;
  /** An identifier used to distinguish the version (from the user's perspective) of the edge server's code itself. For instance, the git sha of the server's repository or the docker sha of the associated image this server runs with. Length must be <= 256 characters. */
  userVersion?: InputMaybe<Scalars['String']['input']>;
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
  bootId?: Maybe<Scalars['ID']['output']>;
  executableSchemaId?: Maybe<Scalars['ID']['output']>;
  libraryVersion?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<Scalars['String']['output']>;
  runtimeVersion?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serverId?: Maybe<Scalars['ID']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
  userVersion?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in EdgeServerInfos. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type EdgeServerInfosFilter = {
  and?: InputMaybe<Array<EdgeServerInfosFilter>>;
  /** Selects rows whose bootId dimension equals the given value if not null. To query for the null value, use {in: {bootId: [null]}} instead. */
  bootId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose executableSchemaId dimension equals the given value if not null. To query for the null value, use {in: {executableSchemaId: [null]}} instead. */
  executableSchemaId?: InputMaybe<Scalars['ID']['input']>;
  in?: InputMaybe<EdgeServerInfosFilterIn>;
  /** Selects rows whose libraryVersion dimension equals the given value if not null. To query for the null value, use {in: {libraryVersion: [null]}} instead. */
  libraryVersion?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<EdgeServerInfosFilter>;
  or?: InputMaybe<Array<EdgeServerInfosFilter>>;
  /** Selects rows whose platform dimension equals the given value if not null. To query for the null value, use {in: {platform: [null]}} instead. */
  platform?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose runtimeVersion dimension equals the given value if not null. To query for the null value, use {in: {runtimeVersion: [null]}} instead. */
  runtimeVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serverId dimension equals the given value if not null. To query for the null value, use {in: {serverId: [null]}} instead. */
  serverId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose userVersion dimension equals the given value if not null. To query for the null value, use {in: {userVersion: [null]}} instead. */
  userVersion?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in EdgeServerInfos. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type EdgeServerInfosFilterIn = {
  /** Selects rows whose bootId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  bootId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose executableSchemaId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  executableSchemaId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose libraryVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  libraryVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose platform dimension is in the given list. A null value in the list means a row with null for that dimension. */
  platform?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose runtimeVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  runtimeVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serverId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serverId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose userVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  userVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
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
  timestamp: Scalars['Timestamp']['output'];
};

export type EditCommentInput = {
  id: Scalars['String']['input'];
  message: Scalars['String']['input'];
  usersToNotify?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type EditCommentResult = NotFoundError | ParentChangeProposalComment | ParentGeneralProposalComment | PermissionError | ReplyChangeProposalComment | ReplyGeneralProposalComment | ValidationError;

export type Education = {
  __typename?: 'Education';
  recentPages: Array<RecentPage>;
};


export type EducationRecentPagesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export enum EmailCategory {
  EDUCATIONAL = 'EDUCATIONAL'
}

export type EmailPreferences = {
  __typename?: 'EmailPreferences';
  email: Scalars['String']['output'];
  subscriptions: Array<EmailCategory>;
  unsubscribedFromAll: Scalars['Boolean']['output'];
};

export type EndUsageBasedPlanResult = Account | NotFoundError | PermissionError | ValidationError;

export enum EnforcementPolicy {
  CLIENT_NAME_CARDINALITY = 'CLIENT_NAME_CARDINALITY',
  CLIENT_VERSION_CARDINALITY = 'CLIENT_VERSION_CARDINALITY',
  OPERATION_ID_CARDINALITY = 'OPERATION_ID_CARDINALITY'
}

export type EntitiesError = {
  __typename?: 'EntitiesError';
  message: Scalars['String']['output'];
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
  typename: Scalars['String']['output'];
};

/** GraphQL Error */
export type Error = {
  message: Scalars['String']['output'];
};

export type ErrorInsightsListFilterInInput = {
  agent?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  code?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  service?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  serviceOrAgent?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ErrorInsightsListFilterInput = {
  agent?: InputMaybe<Scalars['String']['input']>;
  clientName?: InputMaybe<Scalars['String']['input']>;
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ErrorInsightsListFilterInInput>;
  operationId?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<ErrorInsightsListFilterInput>>;
  path?: InputMaybe<Scalars['String']['input']>;
  service?: InputMaybe<Scalars['String']['input']>;
  serviceOrAgent?: InputMaybe<Scalars['String']['input']>;
};

export enum ErrorInsightsListGroupByColumn {
  AGENT = 'AGENT',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  CODE = 'CODE',
  OPERATION_ID = 'OPERATION_ID',
  OPERATION_NAME = 'OPERATION_NAME',
  PATH = 'PATH',
  SERVICE = 'SERVICE',
  SERVICE_OR_AGENT = 'SERVICE_OR_AGENT',
  SEVERITY = 'SEVERITY'
}

export type ErrorInsightsListItem = {
  __typename?: 'ErrorInsightsListItem';
  agent?: Maybe<Scalars['String']['output']>;
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use errorCount instead */
  count: Scalars['Long']['output'];
  errorCount: Scalars['Long']['output'];
  operationCount?: Maybe<Scalars['Long']['output']>;
  operationId?: Maybe<Scalars['String']['output']>;
  operationName?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  service?: Maybe<Scalars['String']['output']>;
  serviceOrAgent?: Maybe<Scalars['String']['output']>;
  severity?: Maybe<ErrorInsightsSeverity>;
  traceRefs?: Maybe<ErrorTraceRefsResult>;
};


export type ErrorInsightsListItemTraceRefsArgs = {
  limit?: Scalars['Int']['input'];
};

export enum ErrorInsightsListOrderByColumn {
  AGENT = 'AGENT',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  CODE = 'CODE',
  COUNT = 'COUNT',
  OPERATION_ID = 'OPERATION_ID',
  OPERATION_NAME = 'OPERATION_NAME',
  PATH = 'PATH',
  SERVICE_OR_AGENT = 'SERVICE_OR_AGENT',
  SEVERITY = 'SEVERITY',
  TIMESTAMP = 'TIMESTAMP'
}

export type ErrorInsightsListOrderByInput = {
  column: ErrorInsightsListOrderByColumn;
  direction: Ordering;
};

/** Information about pagination in a connection. */
export type ErrorInsightsListPageInfo = {
  __typename?: 'ErrorInsightsListPageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum ErrorInsightsSeverity {
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN',
  WARN = 'WARN'
}

export enum ErrorInsightsStrategy {
  ERROR_STATS = 'ERROR_STATS',
  FEDERATED_ERROR_STATS = 'FEDERATED_ERROR_STATS',
  MIXED = 'MIXED'
}

export type ErrorInsightsTimeseriesRecord = {
  __typename?: 'ErrorInsightsTimeseriesRecord';
  data: ErrorInsightsListItem;
  strategy: ErrorInsightsStrategy;
  timestamp: Scalars['Timestamp']['output'];
};

export type ErrorInsightsTimeseriesResult = {
  __typename?: 'ErrorInsightsTimeseriesResult';
  records: Array<ErrorInsightsTimeseriesRecord>;
  roundedDownFrom: Scalars['Timestamp']['output'];
  roundedUpTo: Scalars['Timestamp']['output'];
  totalErrors: Scalars['Int']['output'];
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
  accountId?: Maybe<Scalars['ID']['output']>;
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in ErrorStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ErrorStatsFilter = {
  /** Selects rows whose accountId dimension equals the given value if not null. To query for the null value, use {in: {accountId: [null]}} instead. */
  accountId?: InputMaybe<Scalars['ID']['input']>;
  and?: InputMaybe<Array<ErrorStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ErrorStatsFilterIn>;
  not?: InputMaybe<ErrorStatsFilter>;
  or?: InputMaybe<Array<ErrorStatsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in ErrorStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ErrorStatsFilterIn = {
  /** Selects rows whose accountId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  accountId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type ErrorStatsMetrics = {
  __typename?: 'ErrorStatsMetrics';
  errorsCount: Scalars['Long']['output'];
  requestsWithErrorsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

export type ErrorTraceRef = {
  __typename?: 'ErrorTraceRef';
  errorMessage?: Maybe<Scalars['String']['output']>;
  operationId: Scalars['String']['output'];
  timestamp: Scalars['Timestamp']['output'];
  traceId: Scalars['String']['output'];
};

export type ErrorTraceRefsResult = {
  __typename?: 'ErrorTraceRefsResult';
  items: Array<ErrorTraceRef>;
  totalCount: Scalars['Int']['output'];
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
  ID: Scalars['ID']['output'];
};

/** Option to filter by operation ID. */
export type ExcludedOperationInput = {
  /** Operation ID to exclude from schema check. */
  ID: Scalars['ID']['input'];
};

export type ExtendedRefsUsage = {
  __typename?: 'ExtendedRefsUsage';
  /** The first time usage of this feature was reported for this variant to Apollo by the Router, or null if such usage has never been reported. */
  firstSeenAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The last time usage of this feature was reported for this variant to Apollo by the Router, or null if such usage has never been reported. */
  lastSeenAt?: Maybe<Scalars['Timestamp']['output']>;
};

export type FeatureIntros = {
  __typename?: 'FeatureIntros';
  /** @deprecated No longer supported */
  devGraph: Scalars['Boolean']['output'];
  federatedGraph: Scalars['Boolean']['output'];
  freeConsumerSeats: Scalars['Boolean']['output'];
};

/** Feature Intros Input Type */
export type FeatureIntrosInput = {
  federatedGraph?: InputMaybe<Scalars['Boolean']['input']>;
  freeConsumerSeats?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Columns of FederatedErrorStats. */
export enum FederatedErrorStatsColumn {
  AGENT_VERSION = 'AGENT_VERSION',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ERROR_CODE = 'ERROR_CODE',
  ERROR_COUNT = 'ERROR_COUNT',
  ERROR_PATH = 'ERROR_PATH',
  ERROR_SERVICE = 'ERROR_SERVICE',
  OPERATION_ID = 'OPERATION_ID',
  OPERATION_NAME = 'OPERATION_NAME',
  OPERATION_TYPE = 'OPERATION_TYPE',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SERVICE_ID = 'SERVICE_ID',
  SEVERITY = 'SEVERITY',
  TIMESTAMP = 'TIMESTAMP'
}

export type FederatedErrorStatsDimensions = {
  __typename?: 'FederatedErrorStatsDimensions';
  agentVersion?: Maybe<Scalars['String']['output']>;
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  errorPath?: Maybe<Scalars['String']['output']>;
  errorService?: Maybe<Scalars['String']['output']>;
  operationId?: Maybe<Scalars['String']['output']>;
  operationName?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
  severity?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in FederatedErrorStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type FederatedErrorStatsFilter = {
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']['input']>;
  and?: InputMaybe<Array<FederatedErrorStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorCode dimension equals the given value if not null. To query for the null value, use {in: {errorCode: [null]}} instead. */
  errorCode?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorPath dimension equals the given value if not null. To query for the null value, use {in: {errorPath: [null]}} instead. */
  errorPath?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorService dimension equals the given value if not null. To query for the null value, use {in: {errorService: [null]}} instead. */
  errorService?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<FederatedErrorStatsFilterIn>;
  not?: InputMaybe<FederatedErrorStatsFilter>;
  /** Selects rows whose operationId dimension equals the given value if not null. To query for the null value, use {in: {operationId: [null]}} instead. */
  operationId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationName dimension equals the given value if not null. To query for the null value, use {in: {operationName: [null]}} instead. */
  operationName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<FederatedErrorStatsFilter>>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose severity dimension equals the given value if not null. To query for the null value, use {in: {severity: [null]}} instead. */
  severity?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in FederatedErrorStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type FederatedErrorStatsFilterIn = {
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorCode?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorPath dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorPath?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorService dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorService?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose severity dimension is in the given list. A null value in the list means a row with null for that dimension. */
  severity?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type FederatedErrorStatsMetrics = {
  __typename?: 'FederatedErrorStatsMetrics';
  errorCount: Scalars['Long']['output'];
};

export type FederatedErrorStatsOrderBySpec = {
  column: FederatedErrorStatsColumn;
  direction: Ordering;
};

export type FederatedErrorStatsRecord = {
  __typename?: 'FederatedErrorStatsRecord';
  /** Dimensions of FederatedErrorStats that can be grouped by. */
  groupBy: FederatedErrorStatsDimensions;
  /** Metrics of FederatedErrorStats that can be aggregated over. */
  metrics: FederatedErrorStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp']['output'];
};

/** A single subgraph in a supergraph. Every supergraph managed by Apollo Studio includes at least one subgraph. See https://www.apollographql.com/docs/federation/managed-federation/overview/ for more information. */
export type FederatedImplementingService = {
  __typename?: 'FederatedImplementingService';
  /** The subgraph's current active schema, used in supergraph composition for the the associated variant. */
  activePartialSchema: PartialSchema;
  /** The timestamp when the subgraph was created. */
  createdAt: Scalars['Timestamp']['output'];
  /** The timestamp when the subgraph was deleted. Null if it wasn't deleted. */
  deletedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The ID of the graph this subgraph belongs to. */
  graphID: Scalars['String']['output'];
  /** The name of the graph variant this subgraph belongs to. */
  graphVariant: Scalars['String']['output'];
  /** The subgraph's name. */
  name: Scalars['String']['output'];
  /** The current user-provided version/edition of the subgraph. Typically a Git SHA or docker image ID. */
  revision: Scalars['String']['output'];
  /** The timestamp when the subgraph was most recently updated. */
  updatedAt: Scalars['Timestamp']['output'];
  /** The URL of the subgraph's GraphQL endpoint. */
  url?: Maybe<Scalars['String']['output']>;
};

/** A minimal representation of a federated implementing service, using only a name and partial schema SDL */
export type FederatedImplementingServicePartialSchema = {
  __typename?: 'FederatedImplementingServicePartialSchema';
  /** The name of the implementing service */
  name: Scalars['String']['output'];
  /** The partial schema of the implementing service */
  sdl: Scalars['String']['output'];
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
  additions: Scalars['Int']['output'];
  /**
   * Number of changes that are field edits. This includes fields changing type and any field
   * deprecation and description changes, but also includes any argument changes and any input object
   * field changes.
   */
  edits: Scalars['Int']['output'];
  /** Number of changes that are removals of fields from object, interface, and input types. */
  removals: Scalars['Int']['output'];
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
  fieldName?: Maybe<Scalars['String']['output']>;
  parentType?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in FieldExecutions. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type FieldExecutionsFilter = {
  and?: InputMaybe<Array<FieldExecutionsFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<FieldExecutionsFilterIn>;
  not?: InputMaybe<FieldExecutionsFilter>;
  or?: InputMaybe<Array<FieldExecutionsFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in FieldExecutions. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type FieldExecutionsFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type FieldExecutionsMetrics = {
  __typename?: 'FieldExecutionsMetrics';
  errorsCount: Scalars['Long']['output'];
  estimatedExecutionCount: Scalars['Long']['output'];
  observedExecutionCount: Scalars['Long']['output'];
  referencingOperationCount: Scalars['Long']['output'];
  requestsWithErrorsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

export type FieldInsights = {
  __typename?: 'FieldInsights';
  /** If the first or last seen timestamps are earlier than this timestamp, we can't tell the exact date that we saw this field since our data is bound by the retention period. */
  earliestRetentionTime?: Maybe<Scalars['Timestamp']['output']>;
  /** The earliest time we saw references or executions for this field. Null if the field has never been seen or it is not in the schema. */
  firstSeen?: Maybe<Scalars['Timestamp']['output']>;
  /** The most recent time we saw references or executions for this field. Null if the field has never been seen or it is not in the schema. */
  lastSeen?: Maybe<Scalars['Timestamp']['output']>;
};

export type FieldInsightsListFilterInInput = {
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type FieldInsightsListFilterInput = {
  clientName?: InputMaybe<Scalars['String']['input']>;
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<FieldInsightsListFilterInInput>;
  isDeprecated?: InputMaybe<Scalars['Boolean']['input']>;
  isUnused?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<FieldInsightsListFilterInput>>;
  /** Filters on partial string matches of Parent Type and Field Name */
  search?: InputMaybe<Scalars['String']['input']>;
};

export type FieldInsightsListItem = {
  __typename?: 'FieldInsightsListItem';
  /** The count of errors seen for this field. This can be null depending on the sort order. */
  errorCount?: Maybe<Scalars['Long']['output']>;
  /** The count of errors seen for this field per minute. This can be null depending on the sort order. */
  errorCountPerMin?: Maybe<Scalars['Float']['output']>;
  /** The percentage of errors vs successful resolutions for this field. This can be null depending on the sort order. */
  errorPercentage?: Maybe<Scalars['Float']['output']>;
  /** The estimated number of field executions for this field, based on the field execution sample rate. This can be null depending on the sort order. */
  estimatedExecutionCount?: Maybe<Scalars['Long']['output']>;
  /** The number of field executions recorded for this field. This can be null depending on the sort order. */
  executionCount?: Maybe<Scalars['Long']['output']>;
  fieldName: Scalars['String']['output'];
  isDeprecated: Scalars['Boolean']['output'];
  isUnused: Scalars['Boolean']['output'];
  /** The p50 of the latency of the resolution of this field. This can be null depending on the filter and sort order. */
  p50LatencyMs?: Maybe<Scalars['Float']['output']>;
  /** The p90 of the latency of the resolution of this field. This can be null depending on the filter and sort order. */
  p90LatencyMs?: Maybe<Scalars['Float']['output']>;
  /** The p95 of the latency of the resolution of this field. This can be null depending on the filter and sort order. */
  p95LatencyMs?: Maybe<Scalars['Float']['output']>;
  /** The p99 of the latency of the resolution of this field. This can be null depending on the filter and sort order. */
  p99LatencyMs?: Maybe<Scalars['Float']['output']>;
  parentType: Scalars['String']['output'];
  /** The count of operations that reference the field. This can be null depending on the sort order. */
  referencingOperationCount?: Maybe<Scalars['Long']['output']>;
  /** The count of operations that reference the field per minute. This can be null depending on the sort order. */
  referencingOperationCountPerMin?: Maybe<Scalars['Float']['output']>;
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
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
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
  field?: Maybe<Scalars['String']['output']>;
  fieldName?: Maybe<Scalars['String']['output']>;
  parentType?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in FieldLatencies. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type FieldLatenciesFilter = {
  and?: InputMaybe<Array<FieldLatenciesFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<FieldLatenciesFilterIn>;
  not?: InputMaybe<FieldLatenciesFilter>;
  or?: InputMaybe<Array<FieldLatenciesFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in FieldLatencies. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type FieldLatenciesFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
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
  timestamp: Scalars['Timestamp']['output'];
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  fieldName?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  parentType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in FieldUsage. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type FieldUsageFilter = {
  and?: InputMaybe<Array<FieldUsageFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<FieldUsageFilterIn>;
  not?: InputMaybe<FieldUsageFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<FieldUsageFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in FieldUsage. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type FieldUsageFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type FieldUsageMetrics = {
  __typename?: 'FieldUsageMetrics';
  estimatedExecutionCount: Scalars['Long']['output'];
  executionCount: Scalars['Long']['output'];
  referencingOperationCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

export type FileCoordinate = {
  __typename?: 'FileCoordinate';
  byteOffset: Scalars['Int']['output'];
  column: Scalars['Int']['output'];
  line: Scalars['Int']['output'];
};

export type FileCoordinateInput = {
  byteOffset: Scalars['Int']['input'];
  column: Scalars['Int']['input'];
  line: Scalars['Int']['input'];
};

export type FileLocation = {
  __typename?: 'FileLocation';
  end: FileCoordinate;
  start: FileCoordinate;
  subgraphName?: Maybe<Scalars['String']['output']>;
};

export type FileLocationInput = {
  end: FileCoordinateInput;
  start: FileCoordinateInput;
  subgraphName?: InputMaybe<Scalars['String']['input']>;
};

export type FilterBuildCheckFailed = BuildCheckFailed & BuildCheckResult & FilterBuildCheckResult & {
  __typename?: 'FilterBuildCheckFailed';
  buildInputs: FilterBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  errors: Array<BuildError>;
  id: Scalars['ID']['output'];
  passed: Scalars['Boolean']['output'];
  workflowTask: FilterCheckTask;
};

export type FilterBuildCheckPassed = BuildCheckPassed & BuildCheckResult & FilterBuildCheckResult & {
  __typename?: 'FilterBuildCheckPassed';
  buildInputs: FilterBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  id: Scalars['ID']['output'];
  passed: Scalars['Boolean']['output'];
  supergraphSchemaHash: Scalars['SHA256']['output'];
  workflowTask: FilterCheckTask;
};

export type FilterBuildCheckResult = {
  buildInputs: FilterBuildInputs;
  buildPipelineTrack: BuildPipelineTrack;
  id: Scalars['ID']['output'];
  passed: Scalars['Boolean']['output'];
  workflowTask: FilterCheckTask;
};

/** Inputs provided to the build for a contract variant, which filters types and fields from a source variant's schema. */
export type FilterBuildInput = {
  __typename?: 'FilterBuildInput';
  /** Schema filtering rules for the build, such as tags to include or exclude from the source variant schema. */
  filterConfig: FilterConfig;
  /** The source variant schema document's SHA256 hash, represented as a hexadecimal string. */
  schemaHash: Scalars['String']['output'];
};

export type FilterBuildInputs = {
  __typename?: 'FilterBuildInputs';
  /**
   * The build pipeline track used for filtering. Note this is taken from upstream check workflow
   * or launch.
   */
  buildPipelineTrack: BuildPipelineTrack;
  /** The exclude filters used for filtering. */
  exclude: Array<Scalars['String']['output']>;
  /**
   * Whether to hide unreachable objects, interfaces, unions, inputs, enums and scalars from
   * the resulting contract schema.
   */
  hideUnreachableTypes: Scalars['Boolean']['output'];
  /** The include filters used for filtering. */
  include: Array<Scalars['String']['output']>;
  /** The SHA-256 of the supergraph schema document used for filtering. */
  supergraphSchemaHash: Scalars['SHA256']['output'];
};

export type FilterCheckAsyncInput = {
  config: HistoricQueryParametersInput;
  filterChanges: FilterCheckFilterChanges;
  gitContext: GitContextInput;
};

export type FilterCheckFilterChanges = {
  excludeAdditions?: InputMaybe<Array<Scalars['String']['input']>>;
  excludeRemovals?: InputMaybe<Array<Scalars['String']['input']>>;
  hideUnreachableTypesChange?: InputMaybe<Scalars['Boolean']['input']>;
  includeAdditions?: InputMaybe<Array<Scalars['String']['input']>>;
  includeRemovals?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type FilterCheckTask = BuildCheckTask & CheckWorkflowTask & {
  __typename?: 'FilterCheckTask';
  /** The result of the filter build check. This will be null when the task is initializing or running. */
  buildResult?: Maybe<FilterBuildCheckResult>;
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  proposedBuildInputChanges: ProposedFilterBuildInputChanges;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']['output']>;
  workflow: CheckWorkflow;
};

/** The filter configuration used to build a contract schema. The configuration consists of lists of tags for schema elements to include or exclude in the resulting schema. */
export type FilterConfig = {
  __typename?: 'FilterConfig';
  /** Tags of schema elements to exclude from the contract schema. */
  exclude: Array<Scalars['String']['output']>;
  /** Whether to hide unreachable objects, interfaces, unions, inputs, enums and scalars from the resulting contract schema. */
  hideUnreachableTypes: Scalars['Boolean']['output'];
  /** Tags of schema elements to include in the contract schema. */
  include: Array<Scalars['String']['output']>;
};

export type FilterConfigInput = {
  /** A list of tags for schema elements to exclude from the resulting contract schema. */
  exclude: Array<Scalars['String']['input']>;
  /**
   * Whether to hide unreachable objects, interfaces, unions, inputs, enums and scalars from
   * the resulting contract schema. Defaults to `false`.
   */
  hideUnreachableTypes?: Scalars['Boolean']['input'];
  /** A list of tags for schema elements to include in the resulting contract schema. */
  include: Array<Scalars['String']['input']>;
};

/** Represents a diff between two versions of a schema as a flat list of changes */
export type FlatDiff = {
  __typename?: 'FlatDiff';
  diff: Array<FlatDiffItem>;
  id: Scalars['ID']['output'];
  summary: FlatDiffSummary;
};

export type FlatDiffAddArgument = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddArgument';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffAddDirective = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddDirective';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffAddDirectiveUsage = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddDirectiveUsage';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffAddEnum = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddEnum';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffAddEnumValue = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddEnumValue';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffAddField = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddField';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffAddImplementation = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddImplementation';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffAddInput = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddInput';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffAddInterface = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddInterface';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffAddObject = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddObject';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffAddScalar = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddScalar';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffAddSchemaDefinition = FlatDiffItem & {
  __typename?: 'FlatDiffAddSchemaDefinition';
  type: FlatDiffType;
};

export type FlatDiffAddSchemaDirectiveUsage = FlatDiffItem & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddSchemaDirectiveUsage';
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffAddSchemaRootOperation = FlatDiffItem & FlatDiffItemRootType & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddSchemaRootOperation';
  rootType: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffAddUnion = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffAddUnion';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffAddUnionMember = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddUnionMember';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffAddValidLocation = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffAddValidLocation';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffChangeArgumentDefault = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemNullableValue & {
  __typename?: 'FlatDiffChangeArgumentDefault';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value?: Maybe<Scalars['String']['output']>;
};

export type FlatDiffChangeDescription = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemNullableValue & {
  __typename?: 'FlatDiffChangeDescription';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value?: Maybe<Scalars['String']['output']>;
};

export type FlatDiffChangeDirectiveRepeatable = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffChangeDirectiveRepeatable';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['Boolean']['output'];
};

export type FlatDiffChangeInputFieldDefault = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemNullableValue & {
  __typename?: 'FlatDiffChangeInputFieldDefault';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value?: Maybe<Scalars['String']['output']>;
};

export type FlatDiffChangeSchemaDescription = FlatDiffItem & FlatDiffItemNullableValue & {
  __typename?: 'FlatDiffChangeSchemaDescription';
  type: FlatDiffType;
  value?: Maybe<Scalars['String']['output']>;
};

export type FlatDiffItem = {
  type: FlatDiffType;
};

export type FlatDiffItemCoordinate = {
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffItemNullableValue = {
  type: FlatDiffType;
  value?: Maybe<Scalars['String']['output']>;
};

export type FlatDiffItemRootType = {
  rootType: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffItemValue = {
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffRemoveArgument = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveArgument';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffRemoveDirective = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveDirective';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffRemoveDirectiveUsage = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveDirectiveUsage';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffRemoveEnum = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveEnum';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffRemoveEnumValue = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveEnumValue';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffRemoveField = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveField';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffRemoveImplementation = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveImplementation';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffRemoveInput = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveInput';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffRemoveInterface = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveInterface';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffRemoveObject = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveObject';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffRemoveScalar = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveScalar';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffRemoveSchemaDefinition = FlatDiffItem & {
  __typename?: 'FlatDiffRemoveSchemaDefinition';
  type: FlatDiffType;
};

export type FlatDiffRemoveSchemaDirectiveUsage = FlatDiffItem & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveSchemaDirectiveUsage';
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffRemoveSchemaRootOperation = FlatDiffItem & FlatDiffItemRootType & {
  __typename?: 'FlatDiffRemoveSchemaRootOperation';
  rootType: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffRemoveUnion = FlatDiffItem & FlatDiffItemCoordinate & {
  __typename?: 'FlatDiffRemoveUnion';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
};

export type FlatDiffRemoveUnionMember = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveUnionMember';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
};

export type FlatDiffRemoveValidLocation = FlatDiffItem & FlatDiffItemCoordinate & FlatDiffItemValue & {
  __typename?: 'FlatDiffRemoveValidLocation';
  coordinate: Scalars['String']['output'];
  type: FlatDiffType;
  value: Scalars['String']['output'];
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
  add: Scalars['Int']['output'];
  change: Scalars['Int']['output'];
  remove: Scalars['Int']['output'];
  typeCount: Scalars['Int']['output'];
};

/** Fly-specific information for a Shard */
export type FlyShard = {
  __typename?: 'FlyShard';
  /** DNS endpoint for the orchestrator */
  endpoint: Scalars['String']['output'];
  /** Endpoints of the Etcd cluster */
  etcdEndpoints: Array<Scalars['String']['output']>;
  /** Fly organization ID */
  organizationId: Scalars['String']['output'];
};

export type GqlBillingPlanFromGrpc = {
  __typename?: 'GQLBillingPlanFromGrpc';
  dbPlan?: Maybe<BillingPlan>;
  matchesDbPlan?: Maybe<Scalars['Boolean']['output']>;
  rawProtoJson?: Maybe<Scalars['String']['output']>;
};

export type GeneralProposalComment = {
  createdAt: Scalars['Timestamp']['output'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']['output']>;
};

export type GitContext = {
  __typename?: 'GitContext';
  branch?: Maybe<Scalars['String']['output']>;
  commit?: Maybe<Scalars['ID']['output']>;
  commitUrl?: Maybe<Scalars['String']['output']>;
  committer?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  remoteHost?: Maybe<GitRemoteHost>;
  remoteUrl?: Maybe<Scalars['String']['output']>;
};

/** This is stored with a schema when it is uploaded */
export type GitContextInput = {
  /** The Git repository branch used in the check. */
  branch?: InputMaybe<Scalars['String']['input']>;
  /** The ID of the Git commit used in the check. */
  commit?: InputMaybe<Scalars['ID']['input']>;
  /** The username of the user who created the Git commit used in the check. */
  committer?: InputMaybe<Scalars['String']['input']>;
  /** The commit message of the Git commit used in the check. */
  message?: InputMaybe<Scalars['String']['input']>;
  /** The Git repository's remote URL. */
  remoteUrl?: InputMaybe<Scalars['String']['input']>;
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
  createdAt: Scalars['Timestamp']['output'];
  /** Details of the user or graph that created the API key. */
  createdBy?: Maybe<Identity>;
  /** The API key's ID. */
  id: Scalars['ID']['output'];
  /** The API key's name, for distinguishing it from other keys. */
  keyName?: Maybe<Scalars['String']['output']>;
  /** The permission level assigned to the API key upon creation. */
  role: UserPermission;
  /** The value of the API key. **This is a secret credential!** */
  token: Scalars['String']['output'];
};

export type GraphCapabilities = {
  __typename?: 'GraphCapabilities';
  /**  False if this graph is a cloud supergraph. */
  canPublishMonograph: Scalars['Boolean']['output'];
  /**  Currently, graph URL is not updatable for cloud supergraphs. */
  canUpdateURL: Scalars['Boolean']['output'];
  /**  Minimum Federation Version track required for all variants of this graph. */
  minimumBuildPipelineTrack: BuildPipelineTrack;
};

/** The timing details for the build step of a launch. */
export type GraphCreationError = {
  __typename?: 'GraphCreationError';
  message: Scalars['String']['output'];
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
  allowedTagNames: Array<Scalars['String']['output']>;
  /** Whether to ignore @deprecated elements from linting violations. */
  ignoreDeprecated: Scalars['Boolean']['output'];
  /** Whether to ignore @inaccessible elements from linting violations. */
  ignoreInaccessible: Scalars['Boolean']['output'];
  /** The set of lint rules configured for this graph. */
  rules: Array<LinterRuleLevelConfiguration>;
};

/** The changes to the linter configuration for this graph. */
export type GraphLinterConfigurationChangesInput = {
  /** A set of allowed @tag names to be added to the linting configuration for this graph or null if no changes should be made. */
  allowedTagNameAdditions?: InputMaybe<Array<Scalars['String']['input']>>;
  /** A set of @tag names to be removed from the allowed @tag list for this graphs linting configuration or null if no changes should be made. */
  allowedTagNameRemovals?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Change whether @deprecated elements should be linted or null if no changes should be made. */
  ignoreDeprecated?: InputMaybe<Scalars['Boolean']['input']>;
  /** Change whether @inaccessible elements should be linted or null if no changes should be made. */
  ignoreInaccessible?: InputMaybe<Scalars['Boolean']['input']>;
  /** A set of rule changes or null if no changes should be made. */
  rules?: InputMaybe<Array<LinterRuleLevelConfigurationChangesInput>>;
};

export type GraphQlDoc = {
  __typename?: 'GraphQLDoc';
  graph: Service;
  hash: Scalars['ID']['output'];
  source: Scalars['GraphQLDocument']['output'];
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
  allowedTracks: Array<Maybe<BuildPipelineTrackDetails>>;
  /**
   * If this variant doesn't conduct a build (monograph) then this field will be null
   * For contract variants the build config is set based on the upstream composition variant.
   */
  buildConfig?: Maybe<BuildConfig>;
  /** The time the variant's federation version and/or the supported directives was last updated */
  buildConfigUpdatedAt?: Maybe<Scalars['Timestamp']['output']>;
  checkConfiguration: VariantCheckConfiguration;
  /** Compose and filter preview contract schema built from this source variant. */
  composeAndFilterPreview?: Maybe<ComposeAndFilterPreviewResult>;
  /**
   * Federation version this variant uses
   * @deprecated Use federationVersion instead.
   */
  compositionVersion?: Maybe<Scalars['String']['output']>;
  /** The filter configuration used to build a contract schema. The configuration consists of lists of tags for schema elements to include or exclude in the resulting schema. */
  contractFilterConfig?: Maybe<FilterConfig>;
  /**
   * A human-readable description of the filter configuration of this contract variant, or null if this isn't a contract
   * variant.
   */
  contractFilterConfigDescription?: Maybe<Scalars['String']['output']>;
  /** Preview a Contract schema built from this source variant. */
  contractPreview: ContractPreview;
  /**
   * Returns details about a coordinate in the schema. Unless an error occurs, we will currently always return a non-null
   * response here, with the timestamps set to null if there is no usage of the coordinate or if coordinate doesn't exist in the
   * schema. However, we are keeping the return type as nullable in case we want to update this later in a
   * backwards-compatible way (e.g. a null response meaning that the coordinate doesn't exist in the schema at all).
   */
  coordinateInsights?: Maybe<CoordinateInsights>;
  /** Returns a paginated list of coordinate insights list items, including all coordinates from the active schema for this variant. */
  coordinateInsightsList: GraphVariantCoordinateInsightsListItemConnection;
  /** Time the variant was created */
  createdAt: Scalars['Timestamp']['output'];
  /** Custom check configuration for this graph. */
  customCheckConfiguration?: Maybe<CustomCheckConfiguration>;
  derivedVariantCount: Scalars['Int']['output'];
  /** Returns the list of variants derived from this variant. This currently includes contracts only. */
  derivedVariants?: Maybe<Array<GraphVariant>>;
  /** A list of the entities across all subgraphs, exposed to consumers & up. This value is null for non-federated variants. */
  entities?: Maybe<EntitiesResponseOrError>;
  /** Returns a paginated list of error insights list items, including service and code for which the error originated from. */
  errorInsightsList: GraphVariantErrorInsightsListItemConnection;
  /** Returns a time series list of error counts over time for this variant within a given time range. */
  errorInsightsTimeseries: ErrorInsightsTimeseriesResult;
  /** Details about 'enhanced reference' reporting for traces sent to Apollo by Router for this variant. */
  extendedRefsUsage: ExtendedRefsUsage;
  /** Federation version this variant uses */
  federationVersion?: Maybe<Scalars['String']['output']>;
  /** The last instant that field execution information (resolver execution via field-level instrumentation) was reported for this variant */
  fieldExecutionsLastReportedAt?: Maybe<Scalars['Timestamp']['output']>;
  /**
   * Returns details about a field in the schema. Unless an error occurs, we will currently always return a non-null
   * response here, with the timestamps set to null if there is no usage of the field or if field doesn't exist in the
   * schema. However, we are keeping the return type as nullable in case we want to update this later in a
   * backwards-compatible way (e.g. a null response meaning that the field doesn't exist in the schema at all).
   */
  fieldInsights?: Maybe<FieldInsights>;
  /** Returns a paginated list of field insights list items, including all fields from the active schema for this variant. */
  fieldInsightsList: GraphVariantFieldInsightsListItemConnection;
  /** The last instant that field usage information (usage of fields via referencing operations) was reported for this variant */
  fieldUsageLastReportedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The graph that this variant belongs to. */
  graph: Service;
  /** Graph ID of the variant. Prefer using graph { id } when feasible. */
  graphId: Scalars['String']['output'];
  /** If the variant has managed subgraphs. */
  hasManagedSubgraphs?: Maybe<Scalars['Boolean']['output']>;
  /**
   * Represents whether this variant has a supergraph schema. Note that this can only be true for variants with build steps
   * (running e.g. federation composition or contracts filtering). This will be false for a variant with a build step if it
   * has never successfully published.
   */
  hasSupergraphSchema: Scalars['Boolean']['output'];
  /** The variant's global identifier in the form `graphID@variant`. */
  id: Scalars['ID']['output'];
  internalVariantUUID: Scalars['String']['output'];
  /** Represents whether this variant is a Contract. */
  isContract?: Maybe<Scalars['Boolean']['output']>;
  /** Is this variant one of the current user's favorite variants? */
  isFavoriteOfCurrentUser: Scalars['Boolean']['output'];
  /**
   * If the variant has managed subgraphs.
   * @deprecated Replaced by hasManagedSubgraphs
   */
  isFederated?: Maybe<Scalars['Boolean']['output']>;
  /** Represents whether this variant is a Proposal. */
  isProposal?: Maybe<Scalars['Boolean']['output']>;
  /** If the variant is protected */
  isProtected: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  /** Represents whether this variant should be listed in the public variants directory. This can only be true if the variant is also public. */
  isPubliclyListed: Scalars['Boolean']['output'];
  /** Represents whether Apollo has verified the authenticity of this public variant. This can only be true if the variant is also public. */
  isVerified: Scalars['Boolean']['output'];
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
  launchHistoryLength?: Maybe<Scalars['Long']['output']>;
  /** A list of launches metadata ordered by date, asc or desc depending on orderBy. The maximum limit is 100. */
  launchSummaries?: Maybe<Array<LaunchSummary>>;
  links?: Maybe<Array<LinkInfo>>;
  /** The variant's name (e.g., `staging`). */
  name: Scalars['String']['output'];
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
  postflightScript?: Maybe<Scalars['String']['output']>;
  /** Explorer setting for preflight script to run before the actual GraphQL operations is run. */
  preflightScript?: Maybe<Scalars['String']['output']>;
  /** Returns the proposal-related fields for this graph variant if the variant is a proposal; otherwise, returns null. */
  proposal?: Maybe<Proposal>;
  readme: Readme;
  /** Registry stats for this particular graph variant */
  registryStatsWindow?: Maybe<RegistryStatsWindow>;
  /** The total number of requests for this variant in the last 24 hours */
  requestsInLastDay?: Maybe<Scalars['Long']['output']>;
  /** Router associated with this graph variant */
  router?: Maybe<Router>;
  routerConfig?: Maybe<Scalars['String']['output']>;
  /** The first time the Router reported usage of this variant to Apollo. */
  routerFirstSeenAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The last time the Router reported usage of this variant to Apollo. */
  routerLastSeenAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The list of rule enforcements for this variant, if any. */
  ruleEnforcements: Array<RuleEnforcement>;
  /** If the graphql endpoint is set up to accept cookies. */
  sendCookies?: Maybe<Scalars['Boolean']['output']>;
  /** Explorer setting for shared headers for a graph */
  sharedHeaders?: Maybe<Scalars['String']['output']>;
  /** The variant this variant is derived from. This property currently only exists on contract variants. */
  sourceVariant?: Maybe<GraphVariant>;
  /** Returns the details of the subgraph with the provided `name`, or null if this variant doesn't include a subgraph with that name. */
  subgraph?: Maybe<FederatedImplementingService>;
  /** A list of the subgraphs included in this variant. This value is null for non-federated variants. Set `includeDeleted` to `true` to include deleted subgraphs. */
  subgraphs?: Maybe<Array<FederatedImplementingService>>;
  /** The URL of the variant's GraphQL endpoint for subscription operations. */
  subscriptionUrl?: Maybe<Scalars['String']['output']>;
  /** A list of supported directives */
  supportedDirectives?: Maybe<Array<DirectiveSupportStatus>>;
  /** Returns the top N operations by a few different metrics */
  topNOperations: TopNOperationsResult;
  /**
   * Returns a list of the top operations reported for this variant within a given time range. This API is rate limited,
   * and will return an error if too many requests are made for a graph.
   */
  topOperationsReport: Array<TopOperationRecord>;
  /**
   * A list of the subgraphs that have been published to since the variant was created.
   * Does not include subgraphs that were created & deleted since the variant was created.
   *
   * TODO: @deprecated(reason: "use GraphVariant.updatedSubgraphsSinceCreation instead")
   */
  updatedSubgraphs?: Maybe<Array<FederatedImplementingService>>;
  /** A list of the subgraphs that have been published to since the variant was created. Does not include subgraphs that were created & deleted since the variant was created since that is not a change compared to initial; however includes subgraphs that were only deleted because that is a change compared to the initial. */
  updatedSubgraphsSinceCreation?: Maybe<Array<Subgraph>>;
  /** The URL of the variant's GraphQL endpoint for query and mutation operations. For subscription operations, use `subscriptionUrl`. */
  url?: Maybe<Scalars['String']['output']>;
  /** The last instant that usage information (e.g. operation stat, client stats) was reported for this variant */
  usageLastReportedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** Validate router configuration for this graph variant */
  validateRouter: CloudValidationResult;
};


/** A graph variant */
export type GraphVariantComposeAndFilterPreviewArgs = {
  filterConfig?: InputMaybe<FilterConfigInput>;
  subgraphChanges?: InputMaybe<Array<ComposeAndFilterPreviewSubgraphChange>>;
};


/** A graph variant */
export type GraphVariantContractPreviewArgs = {
  filters: FilterConfigInput;
};


/** A graph variant */
export type GraphVariantCoordinateInsightsArgs = {
  coordinateKind: CoordinateKind;
  namedAttribute: Scalars['String']['input'];
  namedType: Scalars['String']['input'];
};


/** A graph variant */
export type GraphVariantCoordinateInsightsListArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<CoordinateInsightsListFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  from: Scalars['Timestamp']['input'];
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CoordinateInsightsListOrderByInput>;
  to: Scalars['Timestamp']['input'];
};


/** A graph variant */
export type GraphVariantErrorInsightsListArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ErrorInsightsListFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  from: Scalars['Timestamp']['input'];
  groupBy?: InputMaybe<Array<ErrorInsightsListGroupByColumn>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ErrorInsightsListOrderByInput>;
  to: Scalars['Timestamp']['input'];
};


/** A graph variant */
export type GraphVariantErrorInsightsTimeseriesArgs = {
  filter?: InputMaybe<ErrorInsightsListFilterInput>;
  from: Scalars['Timestamp']['input'];
  groupBy: ErrorInsightsListGroupByColumn;
  resolution: Resolution;
  to: Scalars['Timestamp']['input'];
};


/** A graph variant */
export type GraphVariantFieldInsightsArgs = {
  fieldName: Scalars['String']['input'];
  parentType: Scalars['String']['input'];
};


/** A graph variant */
export type GraphVariantFieldInsightsListArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FieldInsightsListFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  from: Scalars['Timestamp']['input'];
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FieldInsightsListOrderByInput>;
  to: Scalars['Timestamp']['input'];
};


/** A graph variant */
export type GraphVariantLaunchArgs = {
  id: Scalars['ID']['input'];
};


/** A graph variant */
export type GraphVariantLaunchHistoryArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: LaunchHistoryOrder;
};


/** A graph variant */
export type GraphVariantLaunchSummariesArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: LaunchHistoryOrder;
};


/** A graph variant */
export type GraphVariantOperationCollectionsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A graph variant */
export type GraphVariantOperationInsightsListArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<OperationInsightsListFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  from: Scalars['Timestamp']['input'];
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<OperationInsightsListOrderByInput>;
  to: Scalars['Timestamp']['input'];
};


/** A graph variant */
export type GraphVariantOperationsCheckConfigurationArgs = {
  overrides?: InputMaybe<OperationsCheckConfigurationOverridesInput>;
};


/** A graph variant */
export type GraphVariantPlanArgs = {
  document: Scalars['GraphQLDocument']['input'];
  operationName?: InputMaybe<Scalars['String']['input']>;
};


/** A graph variant */
export type GraphVariantRegistryStatsWindowArgs = {
  from: Scalars['Timestamp']['input'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']['input']>;
};


/** A graph variant */
export type GraphVariantSubgraphArgs = {
  name: Scalars['ID']['input'];
};


/** A graph variant */
export type GraphVariantSubgraphsArgs = {
  includeDeleted?: Scalars['Boolean']['input'];
};


/** A graph variant */
export type GraphVariantTopNOperationsArgs = {
  filter?: InputMaybe<TopNOperationsFilterInput>;
  from: Scalars['Timestamp']['input'];
  to: Scalars['Timestamp']['input'];
  topN?: InputMaybe<Scalars['Int']['input']>;
};


/** A graph variant */
export type GraphVariantTopOperationsReportArgs = {
  filter?: InputMaybe<TopOperationsReportVariantFilterInput>;
  from: Scalars['Timestamp']['input'];
  limit?: Scalars['Int']['input'];
  orderBy?: InputMaybe<TopOperationsReportOrderByInput>;
  to: Scalars['Timestamp']['input'];
};


/** A graph variant */
export type GraphVariantValidateRouterArgs = {
  config: RouterConfigInput;
};

export type GraphVariantCoordinateInsightsListItemConnection = {
  __typename?: 'GraphVariantCoordinateInsightsListItemConnection';
  /** A list of edges from the graph variant to its coordinate insights list items. */
  edges?: Maybe<Array<GraphVariantCoordinateInsightsListItemEdge>>;
  /** A list of coordinate insights list items that belong to a graph variant. */
  nodes?: Maybe<Array<CoordinateInsightsListItem>>;
  /** Information to aid in pagination. */
  pageInfo: CoordinateInsightsListPageInfo;
  /** The total number of coordinate insights list items connected to the graph variant */
  totalCount: Scalars['Int']['output'];
};

/** An edge between a graph variant and a coordinate insights list item. */
export type GraphVariantCoordinateInsightsListItemEdge = {
  __typename?: 'GraphVariantCoordinateInsightsListItemEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** A coordinate insights list item attached to the graph variant. */
  node?: Maybe<CoordinateInsightsListItem>;
};

export type GraphVariantErrorInsightsListItemConnection = {
  __typename?: 'GraphVariantErrorInsightsListItemConnection';
  /** A list of edges from the graph variant to its error insights list items. */
  edges?: Maybe<Array<GraphVariantErrorInsightsListItemEdge>>;
  /** A list of error insights list items that belong to a graph variant. */
  nodes?: Maybe<Array<ErrorInsightsListItem>>;
  /** Information to aid in pagination. */
  pageInfo: ErrorInsightsListPageInfo;
  /** The total number of error insights list items connected to the graph variant. */
  totalCount: Scalars['Int']['output'];
};

export type GraphVariantErrorInsightsListItemEdge = {
  __typename?: 'GraphVariantErrorInsightsListItemEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** A error insights list items attached to the graph variant. */
  node?: Maybe<ErrorInsightsListItem>;
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
  totalCount: Scalars['Int']['output'];
};

/** An edge between a graph variant and a field insights list item. */
export type GraphVariantFieldInsightsListItemEdge = {
  __typename?: 'GraphVariantFieldInsightsListItemEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
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
  /**
   * Callback mutation for submitting custom check results once your validation has run.
   * Results are returned with the SUCCESS or FAILURE of your validations, the task and workflow ids
   * to associate results, with and an optional list of violations to provide more details to users.
   * The Schema Check will wait for this response for 10 minutes and not complete until the results are returned.
   * After 10 minutes have passed without a callback request being received, the task will be marked as timed out.
   */
  customCheckCallback: CustomCheckCallbackResult;
  /** Delete the variant. */
  delete: DeleteSchemaTagResult;
  destroyRouter: DestroyRouterResult;
  /** Graph ID of the variant */
  graphId: Scalars['String']['output'];
  /** Global identifier for the graph variant, in the form `graph@variant`. */
  id: Scalars['ID']['output'];
  internalVariantUUID: Scalars['String']['output'];
  /** Links a specified PersistedQueryList to the variant of the parent GraphVariantMutation. */
  linkPersistedQueryList: LinkPersistedQueryListResultOrError;
  /** Name of the variant, like `variant`. */
  name: Scalars['String']['output'];
  /** Provides access to mutation fields for modifying a GraphOS Schema Proposal, if this GraphVariant is a proposal variant; else returns NotFoundError. Learn more at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
  proposal: ProposalMutationResult;
  /** Send a custom check request with a fake task id to your configured endpoint. */
  queueTestCustomChecksRequest: QueueTestCustomChecksRequestResult;
  relaunch: RelaunchResult;
  removeLinkFromVariant: GraphVariant;
  /** Gets the router attached to a graph variant */
  router?: Maybe<RouterMutation>;
  runLintCheck: CheckStepResult;
  /** Mutation called by CheckCoordinator to find associated proposals to the schema diffs in a check workflow */
  runProposalsCheck: CheckStepResult;
  service: Service;
  setCustomCheckConfiguration: CustomCheckConfigurationResult;
  setIsFavoriteOfCurrentUser: GraphVariant;
  /**
   * _Asynchronously_ kicks off operation checks for a proposed non-federated
   * schema change against its associated graph.
   *
   * Returns a `CheckRequestSuccess` object with a workflow ID that you can use
   * to check status, or an error object if the checks workflow failed to start.
   *
   * Rate limited to 3000 per min. Schema checks cannot be performed on contract variants.
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
   * Rate limited to 3000 per min. Subgraph checks cannot be performed on contract variants.
   */
  submitMultiSubgraphCheckAsync: CheckRequestResult;
  /**
   * _Asynchronously_ kicks off composition and operation checks for a proposed subgraph schema change against its associated supergraph.
   *
   * Returns a `CheckRequestSuccess` object with a workflow ID that you can use
   * to check status, or an error object if the checks workflow failed to start.
   *
   * Rate limited to 3000 per min. Subgraph checks cannot be performed on contract variants.
   */
  submitSubgraphCheckAsync: CheckRequestResult;
  /** Triggers the Proposals implementation check for active proposals that are sourced from this variant for a given graph composition id */
  triggerProposalsImplementationHandler?: Maybe<GraphVariant>;
  /** Unlinks a specified PersistedQueryList from the variant of the parent GraphVariantMutation. */
  unlinkPersistedQueryList: UnlinkPersistedQueryListResultOrError;
  updateCheckConfigurationCustomChecks: VariantCheckConfiguration;
  updateCheckConfigurationDowngradeChecks: VariantCheckConfiguration;
  updateCheckConfigurationDownstreamVariants: VariantCheckConfiguration;
  updateCheckConfigurationEnableOperationsCheck?: Maybe<VariantCheckConfiguration>;
  updateCheckConfigurationExcludedClients: VariantCheckConfiguration;
  updateCheckConfigurationExcludedOperations: VariantCheckConfiguration;
  updateCheckConfigurationIncludedVariants: VariantCheckConfiguration;
  updateCheckConfigurationProposalChangeMismatchSeverity: VariantCheckConfiguration;
  updateCheckConfigurationTimeRange: VariantCheckConfiguration;
  updateIsProtected?: Maybe<GraphVariant>;
  updatePostflightScript?: Maybe<GraphVariant>;
  updatePreflightScript?: Maybe<GraphVariant>;
  updateRouter: UpdateRouterResult;
  updateSendCookies?: Maybe<GraphVariant>;
  updateSharedHeaders?: Maybe<GraphVariant>;
  updateSubscriptionURL?: Maybe<GraphVariant>;
  updateURL?: Maybe<GraphVariant>;
  /** Updates the [federation version](https://www.apollographql.com/docs/graphos/reference/router/federation-version-support) of this variant */
  updateVariantFederationVersion?: Maybe<GraphVariant>;
  updateVariantIsPublic?: Maybe<GraphVariant>;
  updateVariantIsPubliclyListed?: Maybe<GraphVariant>;
  updateVariantIsVerified?: Maybe<GraphVariant>;
  /** Updates the [README](https://www.apollographql.com/docs/studio/org/graphs/#the-readme-page) of this variant. */
  updateVariantReadme?: Maybe<GraphVariant>;
  upsertRouterConfig?: Maybe<UpsertRouterResult>;
  variant: GraphVariant;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationAddLinkToVariantArgs = {
  title?: InputMaybe<Scalars['String']['input']>;
  type: LinkInfoType;
  url: Scalars['String']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationBuildConfigArgs = {
  skipLaunch?: InputMaybe<Scalars['Boolean']['input']>;
  tagInApiSchema?: Scalars['Boolean']['input'];
  version: BuildPipelineTrack;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationCreateRouterArgs = {
  input: CreateRouterInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationCustomCheckCallbackArgs = {
  input: CustomCheckCallbackInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationLinkPersistedQueryListArgs = {
  persistedQueryListId: Scalars['ID']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationRemoveLinkFromVariantArgs = {
  linkInfoId: Scalars['ID']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationRunLintCheckArgs = {
  input: RunLintCheckInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationRunProposalsCheckArgs = {
  input: RunProposalsCheckInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationSetCustomCheckConfigurationArgs = {
  input: SetCustomCheckConfigurationInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationSetIsFavoriteOfCurrentUserArgs = {
  favorite: Scalars['Boolean']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationSubmitCheckSchemaAsyncArgs = {
  input: CheckSchemaAsyncInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationSubmitFilterCheckAsyncArgs = {
  input: FilterCheckAsyncInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationSubmitMultiSubgraphCheckAsyncArgs = {
  input: MultiSubgraphCheckAsyncInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationSubmitSubgraphCheckAsyncArgs = {
  input: SubgraphCheckAsyncInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationTriggerProposalsImplementationHandlerArgs = {
  graphCompositionId: Scalars['ID']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateCheckConfigurationCustomChecksArgs = {
  enableCustomChecks?: InputMaybe<Scalars['Boolean']['input']>;
  useGraphSettings: Scalars['Boolean']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateCheckConfigurationDowngradeChecksArgs = {
  downgradeDefaultValueChange?: InputMaybe<Scalars['Boolean']['input']>;
  downgradeStaticChecks?: InputMaybe<Scalars['Boolean']['input']>;
  useGraphSettings: Scalars['Boolean']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateCheckConfigurationDownstreamVariantsArgs = {
  blockingDownstreamVariants?: InputMaybe<Array<Scalars['String']['input']>>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateCheckConfigurationEnableOperationsCheckArgs = {
  enabled: Scalars['Boolean']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateCheckConfigurationExcludedClientsArgs = {
  appendGraphSettings: Scalars['Boolean']['input'];
  excludedClients?: InputMaybe<Array<ClientFilterInput>>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateCheckConfigurationExcludedOperationsArgs = {
  appendGraphSettings: Scalars['Boolean']['input'];
  excludedOperationNames?: InputMaybe<Array<OperationNameFilterInput>>;
  excludedOperations?: InputMaybe<Array<OperationInfoFilterInput>>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateCheckConfigurationIncludedVariantsArgs = {
  includedVariants?: InputMaybe<Array<Scalars['String']['input']>>;
  useGraphSettings: Scalars['Boolean']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateCheckConfigurationProposalChangeMismatchSeverityArgs = {
  proposalChangeMismatchSeverity?: InputMaybe<ProposalChangeMismatchSeverity>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateCheckConfigurationTimeRangeArgs = {
  operationCountThreshold?: InputMaybe<Scalars['Int']['input']>;
  operationCountThresholdPercentage?: InputMaybe<Scalars['Float']['input']>;
  timeRangeSeconds?: InputMaybe<Scalars['Long']['input']>;
  useGraphSettings: Scalars['Boolean']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateIsProtectedArgs = {
  isProtected: Scalars['Boolean']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdatePostflightScriptArgs = {
  postflightScript?: InputMaybe<Scalars['String']['input']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdatePreflightScriptArgs = {
  preflightScript?: InputMaybe<Scalars['String']['input']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateRouterArgs = {
  input: UpdateRouterInput;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateSendCookiesArgs = {
  sendCookies: Scalars['Boolean']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateSharedHeadersArgs = {
  sharedHeaders?: InputMaybe<Scalars['String']['input']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateSubscriptionUrlArgs = {
  subscriptionUrl?: InputMaybe<Scalars['String']['input']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateUrlArgs = {
  url?: InputMaybe<Scalars['String']['input']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateVariantFederationVersionArgs = {
  version: BuildPipelineTrack;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateVariantIsPublicArgs = {
  isPublic: Scalars['Boolean']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateVariantIsPubliclyListedArgs = {
  isPubliclyListed: Scalars['Boolean']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateVariantIsVerifiedArgs = {
  isVerified: Scalars['Boolean']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateVariantReadmeArgs = {
  readme: Scalars['String']['input'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpsertRouterConfigArgs = {
  configuration: Scalars['String']['input'];
};

export type GraphVariantOperationCollectionConnection = {
  __typename?: 'GraphVariantOperationCollectionConnection';
  /** A list of edges from the graph variant to its operation collections. */
  edges?: Maybe<Array<GraphVariantOperationCollectionEdge>>;
  /** A list of operation collections attached to a graph variant. */
  nodes?: Maybe<Array<OperationCollection>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge between a graph variant and an operation collection. */
export type GraphVariantOperationCollectionEdge = {
  __typename?: 'GraphVariantOperationCollectionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
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
  totalCount: Scalars['Int']['output'];
};

export type GraphVariantOperationInsightsListItemEdge = {
  __typename?: 'GraphVariantOperationInsightsListItemEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** A operation insights list items attached to the graph variant. */
  node?: Maybe<OperationInsightsListItem>;
};

/** Individual permissions for the current user when interacting with a particular Studio graph variant. */
export type GraphVariantPermissions = {
  __typename?: 'GraphVariantPermissions';
  canCreateCollectionInVariant: Scalars['Boolean']['output'];
  /** If this variant is a Proposal, will match the Proposal.canEditProposal field (can the current user can edit this Proposal either by authorship or role level). False if this GraphVariant is not a Proposal. */
  canEditProposal: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to manage/update this variant's build configuration (e.g., build pipeline version). */
  canManageBuildConfig: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to manage/update cloud routers */
  canManageCloudRouter: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to update variant-level settings for the Apollo Studio Explorer. */
  canManageExplorerSettings: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to publish schemas to this variant. */
  canPushSchemas: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user can read any information about this variant. */
  canQuery: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to view this variant's build configuration details (e.g., build pipeline version). */
  canQueryBuildConfig: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to view details regarding cloud routers */
  canQueryCloudRouter: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to view cloud router logs */
  canQueryCloudRouterLogs: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to view launch history */
  canQueryLaunches: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to download schemas associated to this variant. */
  canQuerySchemas: Scalars['Boolean']['output'];
  canShareCollectionInVariant: Scalars['Boolean']['output'];
  canUpdateVariantLinkInfo: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to update the README for this variant. */
  canUpdateVariantReadme: Scalars['Boolean']['output'];
  variantId: Scalars['ID']['output'];
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
  accountId?: Maybe<Scalars['ID']['output']>;
  agentVersion?: Maybe<Scalars['String']['output']>;
  cloudProvider?: Maybe<Scalars['String']['output']>;
  routerId?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
  tier?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in GraphosCloudMetrics. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type GraphosCloudMetricsFilter = {
  /** Selects rows whose accountId dimension equals the given value if not null. To query for the null value, use {in: {accountId: [null]}} instead. */
  accountId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']['input']>;
  and?: InputMaybe<Array<GraphosCloudMetricsFilter>>;
  /** Selects rows whose cloudProvider dimension equals the given value if not null. To query for the null value, use {in: {cloudProvider: [null]}} instead. */
  cloudProvider?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<GraphosCloudMetricsFilterIn>;
  not?: InputMaybe<GraphosCloudMetricsFilter>;
  or?: InputMaybe<Array<GraphosCloudMetricsFilter>>;
  /** Selects rows whose routerId dimension equals the given value if not null. To query for the null value, use {in: {routerId: [null]}} instead. */
  routerId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose tier dimension equals the given value if not null. To query for the null value, use {in: {tier: [null]}} instead. */
  tier?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in GraphosCloudMetrics. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type GraphosCloudMetricsFilterIn = {
  /** Selects rows whose accountId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  accountId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose cloudProvider dimension is in the given list. A null value in the list means a row with null for that dimension. */
  cloudProvider?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose routerId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  routerId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose tier dimension is in the given list. A null value in the list means a row with null for that dimension. */
  tier?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type GraphosCloudMetricsMetrics = {
  __typename?: 'GraphosCloudMetricsMetrics';
  responseSize: Scalars['Long']['output'];
  responseSizeThrottled: Scalars['Long']['output'];
  routerOperations: Scalars['Long']['output'];
  routerOperationsThrottled: Scalars['Long']['output'];
  subgraphFetches: Scalars['Long']['output'];
  subgraphFetchesThrottled: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

export enum HttpMethod {
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
  from?: InputMaybe<Scalars['String']['input']>;
  /** A list of operation IDs to filter out during validation. */
  ignoredOperations?: InputMaybe<Array<Scalars['ID']['input']>>;
  /**
   * A list of variants to include in the validation. If no variants are provided
   * then this defaults to the "current" variant along with the base variant. The
   * base variant indicates the schema that generates diff and marks the metrics that
   * are checked for broken queries. We union this base variant with the untagged values('',
   * same as null inside of `in`, and 'current') in this metrics fetch. This strategy
   * supports users who have not tagged their metrics or schema.
   */
  includedVariants?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Minimum number of requests within the window for a query to be considered. */
  queryCountThreshold?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Number of requests within the window for a query to be considered, relative to
   * total request count. Expected values are between 0 and 0.05 (minimum 5% of total
   * request volume)
   */
  queryCountThresholdPercentage?: InputMaybe<Scalars['Float']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

/** Input type to provide when specifying configuration details for schema checks. */
export type HistoricQueryParametersInput = {
  /** Clients to be excluded from check. */
  excludedClients?: InputMaybe<Array<ClientInfoFilter>>;
  /** Operations to be ignored in this schema check, specified by operation name. */
  excludedOperationNames?: InputMaybe<Array<OperationNameFilterInput>>;
  /** Start time for operations to be checked against. Specified as either a) an ISO formatted date/time string or b) a negative number of seconds relative to the time the check request was submitted. */
  from?: InputMaybe<Scalars['String']['input']>;
  /** Operations to be ignored in this schema check, specified by ID. */
  ignoredOperations?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Graph variants to be included in check. */
  includedVariants?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Maximum number of queries to be checked against the change. */
  queryCountThreshold?: InputMaybe<Scalars['Int']['input']>;
  /** Only fail check if this percentage of operations would be negatively impacted. */
  queryCountThresholdPercentage?: InputMaybe<Scalars['Float']['input']>;
  /** End time for operations to be checked against. Specified as either a) an ISO formatted date/time string or b) a negative number of seconds relative to the time the check request was submitted. */
  to?: InputMaybe<Scalars['String']['input']>;
};

/** An identity (such as a `User` or `Graph`) in Apollo Studio. See implementing types for details. */
export type Identity = {
  /** Returns a representation of the identity as an `Actor` type. */
  asActor: Actor;
  /** The identity's identifier, which is unique among objects of its type. */
  id: Scalars['ID']['output'];
  /** The identity's human-readable name. */
  name: Scalars['String']['output'];
};

/** An actor's identity and info about the client they used to perform the action */
export type IdentityAndClientInfo = {
  __typename?: 'IdentityAndClientInfo';
  /** Client name provided when the actor performed the action */
  clientName?: Maybe<Scalars['String']['output']>;
  /** Client version provided when the actor performed the action */
  clientVersion?: Maybe<Scalars['String']['output']>;
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
  schemaCoordinate: Scalars['String']['output'];
  subgraphName?: Maybe<Scalars['String']['output']>;
};

export type IgnoredRuleInput = {
  ignoredRule: LintRule;
  schemaCoordinate: Scalars['String']['input'];
  subgraphName?: InputMaybe<Scalars['String']['input']>;
};

/** The location of the implementing service config file in storage */
export type ImplementingServiceLocation = {
  __typename?: 'ImplementingServiceLocation';
  /** The name of the implementing service */
  name: Scalars['String']['output'];
  /** The path in storage to access the implementing service config file */
  path: Scalars['String']['output'];
};

export type InternalAdminUser = {
  __typename?: 'InternalAdminUser';
  role: InternalMdgAdminRole;
  userID: Scalars['String']['output'];
};

export type InternalIdentity = Identity & {
  __typename?: 'InternalIdentity';
  accounts: Array<Account>;
  asActor: Actor;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export enum InternalMdgAdminRole {
  INTERNAL_MDG_ADMIN = 'INTERNAL_MDG_ADMIN',
  INTERNAL_MDG_READ_ONLY = 'INTERNAL_MDG_READ_ONLY',
  INTERNAL_MDG_SALES = 'INTERNAL_MDG_SALES',
  INTERNAL_MDG_SUPER_ADMIN = 'INTERNAL_MDG_SUPER_ADMIN',
  INTERNAL_MDG_SUPPORT = 'INTERNAL_MDG_SUPPORT'
}

/** Generic server error. This should only ever return 'internal server error' as a message */
export type InternalServerError = Error & {
  __typename?: 'InternalServerError';
  /** Message related to the internal error */
  message: Scalars['String']['output'];
};

export type IntrospectionDirective = {
  __typename?: 'IntrospectionDirective';
  args: Array<IntrospectionInputValue>;
  description?: Maybe<Scalars['String']['output']>;
  locations: Array<IntrospectionDirectiveLocation>;
  name: Scalars['String']['output'];
};

export type IntrospectionDirectiveInput = {
  args: Array<IntrospectionInputValueInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  isRepeatable?: InputMaybe<Scalars['Boolean']['input']>;
  locations: Array<IntrospectionDirectiveLocation>;
  name: Scalars['String']['input'];
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
  depreactionReason?: Maybe<Scalars['String']['output']>;
  deprecationReason?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  isDeprecated: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

/** __EnumValue introspection type */
export type IntrospectionEnumValueInput = {
  deprecationReason?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isDeprecated: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};

/** Values associated with introspection result for field */
export type IntrospectionField = {
  __typename?: 'IntrospectionField';
  args: Array<IntrospectionInputValue>;
  deprecationReason?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  isDeprecated: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  type: IntrospectionType;
};

/** __Field introspection type */
export type IntrospectionFieldInput = {
  args: Array<IntrospectionInputValueInput>;
  deprecationReason?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isDeprecated: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  type: IntrospectionTypeInput;
};

/** Values associated with introspection result for an input field */
export type IntrospectionInputValue = {
  __typename?: 'IntrospectionInputValue';
  defaultValue?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: IntrospectionType;
};

/** __Value introspection type */
export type IntrospectionInputValueInput = {
  defaultValue?: InputMaybe<Scalars['String']['input']>;
  deprecationReason?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isDeprecated?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
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


export type IntrospectionSchemaTypesArgs = {
  filter?: InputMaybe<TypeFilterConfig>;
};

/** __Schema introspection type */
export type IntrospectionSchemaInput = {
  description?: InputMaybe<Scalars['String']['input']>;
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
  description?: Maybe<Scalars['String']['output']>;
  enumValues?: Maybe<Array<IntrospectionEnumValue>>;
  fields?: Maybe<Array<IntrospectionField>>;
  inputFields?: Maybe<Array<IntrospectionInputValue>>;
  interfaces?: Maybe<Array<IntrospectionType>>;
  kind?: Maybe<IntrospectionTypeKind>;
  name?: Maybe<Scalars['String']['output']>;
  ofType?: Maybe<IntrospectionType>;
  possibleTypes?: Maybe<Array<IntrospectionType>>;
  /** printed representation of type, including nested nullability and list ofTypes */
  printed: Scalars['String']['output'];
};


/** Object containing all possible values for an introspectionType */
export type IntrospectionTypeEnumValuesArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']['input']>;
};

/** __Type introspection type */
export type IntrospectionTypeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  enumValues?: InputMaybe<Array<IntrospectionEnumValueInput>>;
  fields?: InputMaybe<Array<IntrospectionFieldInput>>;
  inputFields?: InputMaybe<Array<IntrospectionInputValueInput>>;
  interfaces?: InputMaybe<Array<IntrospectionTypeInput>>;
  kind: IntrospectionTypeKind;
  name?: InputMaybe<Scalars['String']['input']>;
  ofType?: InputMaybe<IntrospectionTypeInput>;
  possibleTypes?: InputMaybe<Array<IntrospectionTypeInput>>;
  specifiedByUrl?: InputMaybe<Scalars['String']['input']>;
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
  kind?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

/** An error caused by providing invalid input for a task, such as schema checks. */
export type InvalidInputError = {
  __typename?: 'InvalidInputError';
  /** The error message. */
  message: Scalars['String']['output'];
};

/** Generic input error */
export type InvalidInputErrors = Error & {
  __typename?: 'InvalidInputErrors';
  errors: Array<CloudInvalidInputError>;
  message: Scalars['String']['output'];
};

export type InvalidOperation = {
  __typename?: 'InvalidOperation';
  errors?: Maybe<Array<OperationValidationError>>;
  signature: Scalars['ID']['output'];
};

/** This object is returned when a request to fetch a Studio graph variant provides an invalid graph ref. */
export type InvalidRefFormat = Error & {
  __typename?: 'InvalidRefFormat';
  message: Scalars['String']['output'];
};

export type InvalidTarget = Error & {
  __typename?: 'InvalidTarget';
  message: Scalars['String']['output'];
};

export type Invoice = {
  __typename?: 'Invoice';
  closedAt?: Maybe<Scalars['Timestamp']['output']>;
  collectionMethod?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  invoiceNumber: Scalars['Int']['output'];
  invoiceNumberV2: Scalars['String']['output'];
  state: InvoiceState;
  totalInCents: Scalars['Int']['output'];
  updatedAt: Scalars['Timestamp']['output'];
  uuid: Scalars['ID']['output'];
};

export type InvoiceLineItem = {
  __typename?: 'InvoiceLineItem';
  /**
   * Line items may be grouped to help the customer better understand their charges
   * @deprecated This data came from Metronome and we no longer use Metronome
   */
  groupKey?: Maybe<Scalars['String']['output']>;
  /**
   * Line items may be grouped to help the customer better understand their charges
   * @deprecated This data came from Metronome and we no longer use Metronome
   */
  groupValue?: Maybe<Scalars['String']['output']>;
  /** @deprecated This data came from Metronome and we no longer use Metronome */
  name: Scalars['String']['output'];
  /**
   * The quantity of 'things' in this line item. (e.g. number of operations, seats, etc).
   * May be null for flat charges.
   * @deprecated This data came from Metronome and we no longer use Metronome
   */
  quantity?: Maybe<Scalars['Int']['output']>;
  /**
   * The amount this line item costs.
   * @deprecated This data came from Metronome and we no longer use Metronome
   */
  totalInCents: Scalars['Int']['output'];
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
  approvedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The associated build for this launch (a build includes schema composition and contract filtering). This value is null until the build is initiated. */
  build?: Maybe<Build>;
  /** The inputs provided to this launch's associated build, including subgraph schemas and contract filters. */
  buildInput: BuildInput;
  /** The timestamp when the launch completed. This value is null until the launch completes. */
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The timestamp when the launch was initiated. */
  createdAt: Scalars['Timestamp']['output'];
  /** Contract launches that were triggered by this launch. */
  downstreamLaunches: Array<Launch>;
  /** The ID of the launch's associated graph. */
  graphId: Scalars['String']['output'];
  /** The name of the launch's associated variant. */
  graphVariant: Scalars['String']['output'];
  /** The unique identifier for this launch. */
  id: Scalars['ID']['output'];
  /** Whether the launch completed. */
  isCompleted?: Maybe<Scalars['Boolean']['output']>;
  /** Whether the result of the launch has been published to the associated graph and variant. This is always false for a failed launch. */
  isPublished?: Maybe<Scalars['Boolean']['output']>;
  /** The most recent launch sequence step that has started but not necessarily completed. */
  latestSequenceStep?: Maybe<LaunchSequenceStep>;
  /** Cloud Router order for this launch ID */
  order: OrderOrError;
  orders: Array<Order>;
  /** The launch immediately prior to this one. If successOnly is true, returns the most recent successful launch; if false, returns the most recent launch, regardless of success. If no such previous launch exists, returns null. */
  previousLaunch?: Maybe<Launch>;
  proposalRevision?: Maybe<ProposalRevision>;
  /** A specific publication of a graph variant pertaining to this launch. */
  publication?: Maybe<SchemaTag>;
  /** A list of results from the completed launch. The items included in this list vary depending on whether the launch succeeded, failed, or was superseded. */
  results: Array<LaunchResult>;
  /** Cloud router configuration associated with this build event. It will be non-null for any cloud-router variant, and null for any not cloudy variant/graph. */
  routerConfig?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<SchemaTag>;
  /** A list of all serial steps in the launch sequence. This list can change as the launch progresses. For example, a `LaunchCompletedStep` is appended after a launch completes. */
  sequence: Array<LaunchSequenceStep>;
  /** A shortened version of `Launch.id` that includes only the first 8 characters. */
  shortenedID: Scalars['String']['output'];
  /** The launch's status. If a launch is superseded, its status remains `LAUNCH_INITIATED`. To check for a superseded launch, use `supersededAt`. */
  status: LaunchStatus;
  /** A list of subgraph changes that are included in this launch. */
  subgraphChanges?: Maybe<Array<SubgraphChange>>;
  /** The timestamp when this launch was superseded by another launch. If an active launch is superseded, it terminates. */
  supersededAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The launch that superseded this launch, if any. If an active launch is superseded, it terminates. */
  supersededBy?: Maybe<Launch>;
  /** The source variant launch that caused this launch to be initiated. This value is present only for contract variant launches. Otherwise, it's null. */
  upstreamLaunch?: Maybe<Launch>;
};


/** Represents the complete process of making a set of updates to a deployed graph variant. */
export type LaunchPreviousLaunchArgs = {
  successOnly?: InputMaybe<Scalars['Boolean']['input']>;
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
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The timestamp when the step started. */
  startedAt?: Maybe<Scalars['Timestamp']['output']>;
};

/** The timing details for the completion step of a launch. */
export type LaunchSequenceCompletedStep = {
  __typename?: 'LaunchSequenceCompletedStep';
  /** The timestamp when the step (and therefore the launch) completed. */
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
};

/** The timing details for the initiation step of a launch. */
export type LaunchSequenceInitiatedStep = {
  __typename?: 'LaunchSequenceInitiatedStep';
  /** The timestamp when the step (and therefore the launch) started. */
  startedAt?: Maybe<Scalars['Timestamp']['output']>;
};

/** The timing details for the publish step of a launch. */
export type LaunchSequencePublishStep = {
  __typename?: 'LaunchSequencePublishStep';
  /** The timestamp when the step completed. */
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The timestamp when the step started. */
  startedAt?: Maybe<Scalars['Timestamp']['output']>;
};

/** Represents the various steps that occur in sequence during a single launch. */
export type LaunchSequenceStep = LaunchSequenceBuildStep | LaunchSequenceCompletedStep | LaunchSequenceInitiatedStep | LaunchSequencePublishStep | LaunchSequenceSupersededStep;

/** The timing details for the superseded step of a launch. This step occurs only if the launch is superseded by another launch. */
export type LaunchSequenceSupersededStep = {
  __typename?: 'LaunchSequenceSupersededStep';
  /** The timestamp when the step completed, thereby ending the execution of this launch in favor of the superseding launch. */
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
};

export enum LaunchStatus {
  LAUNCH_COMPLETED = 'LAUNCH_COMPLETED',
  LAUNCH_FAILED = 'LAUNCH_FAILED',
  LAUNCH_INITIATED = 'LAUNCH_INITIATED'
}

/** Key information representing the complete process of making a set of updates to a deployed graph variant. */
export type LaunchSummary = {
  __typename?: 'LaunchSummary';
  /** The timestamp when the launch was approved. */
  approvedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** Identifier of the associated build for this launch. This value is null until the build is initiated. */
  buildID?: Maybe<Scalars['ID']['output']>;
  /** The inputs provided to this launch's associated build, including subgraph schemas and contract filters. */
  buildInput: BuildInput;
  /** The timestamp when the launch completed. This value is null until the launch completes. */
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The timestamp when the launch was initiated. */
  createdAt: Scalars['Timestamp']['output'];
  /** The ID of the launch's associated graph. */
  graphId: Scalars['String']['output'];
  /** The name of the launch's associated variant. */
  graphVariant: Scalars['String']['output'];
  /** The unique identifier for this launch. */
  id: Scalars['ID']['output'];
  /** A list of results from the completed launch. The items included in this list vary depending on whether the launch succeeded, failed, or was superseded. */
  results: Array<LaunchResult>;
  /** The launch's status. If a launch is superseded, its status remains `LAUNCH_INITIATED`. To check for a superseded launch, use `supersededAt`. */
  status: LaunchStatus;
};

export type LaunchTestRouterInput = {
  config?: InputMaybe<Scalars['JSON']['input']>;
  provider?: InputMaybe<CloudProvider>;
  routerVersion: Scalars['String']['input'];
  tier?: InputMaybe<CloudTier>;
};

export type LaunchTestRouterResult = CloudRouterTestingInvalidInputErrors | LaunchTestRouterSuccess;

export type LaunchTestRouterSuccess = {
  __typename?: 'LaunchTestRouterSuccess';
  graphRef: Scalars['String']['output'];
  jobId: Scalars['ID']['output'];
};

export type LinkInfo = {
  __typename?: 'LinkInfo';
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  title?: Maybe<Scalars['String']['output']>;
  type: LinkInfoType;
  url: Scalars['String']['output'];
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

/** The result/error union returned by GraphVariantMutation.linkPersistedQueryList. */
export type LinkPersistedQueryListResultOrError = LinkPersistedQueryListResult | ListNotFoundError | PermissionError | VariantAlreadyLinkedError;

export type LintCheckTask = CheckWorkflowTask & {
  __typename?: 'LintCheckTask';
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  graphID: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  result?: Maybe<LintResult>;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']['output']>;
  workflow: CheckWorkflow;
};

/** A single rule violation. */
export type LintDiagnostic = {
  __typename?: 'LintDiagnostic';
  /** The category used for grouping similar rules. */
  category: LinterRuleCategory;
  /** The schema coordinate of this diagnostic. */
  coordinate: Scalars['String']['output'];
  /** The graph's configured level for the rule. */
  level: LintDiagnosticLevel;
  /** The message describing the rule violation. */
  message: Scalars['String']['output'];
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
  NULLABLE_PATH_VARIABLE = 'NULLABLE_PATH_VARIABLE',
  OBJECT_PREFIX = 'OBJECT_PREFIX',
  OBJECT_SUFFIX = 'OBJECT_SUFFIX',
  OVERRIDDEN_FIELD_CAN_BE_REMOVED = 'OVERRIDDEN_FIELD_CAN_BE_REMOVED',
  OVERRIDE_DIRECTIVE_CAN_BE_REMOVED = 'OVERRIDE_DIRECTIVE_CAN_BE_REMOVED',
  OVERRIDE_MIGRATION_IN_PROGRESS = 'OVERRIDE_MIGRATION_IN_PROGRESS',
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
  errorsCount: Scalars['Int']['output'];
  /** Total number of lint rules ignored. */
  ignoredCount: Scalars['Int']['output'];
  /** Total number of lint rules violated. */
  totalCount: Scalars['Int']['output'];
  /** Total number of lint warnings. */
  warningsCount: Scalars['Int']['output'];
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
  badExampleCode?: Maybe<Scalars['String']['output']>;
  /** The category used for grouping similar rules. */
  category: LinterRuleCategory;
  /** A human readable description of the rule. */
  description: Scalars['String']['output'];
  /** Illustrative code showcasing the fix for the potential violation of this rule. */
  goodExampleCode?: Maybe<Scalars['String']['output']>;
  /** The configured level for the rule. */
  level: LintDiagnosticLevel;
  /** The name for this lint rule. */
  rule: LintRule;
};

export type LinterRuleLevelConfigurationChangesInput = {
  level: LintDiagnosticLevel;
  rule: LintRule;
};

/** The result of a failed call to GraphVariantMutation.linkPersistedQueryList when the specified list can't be found. */
export type ListNotFoundError = Error & {
  __typename?: 'ListNotFoundError';
  listId: Scalars['ID']['output'];
  message: Scalars['String']['output'];
};

export type Location = {
  __typename?: 'Location';
  end?: Maybe<Coordinate>;
  start?: Maybe<Coordinate>;
  subgraphName?: Maybe<Scalars['String']['output']>;
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
  message: Scalars['String']['output'];
  /** Timestamp in UTC */
  timestamp: Scalars['DateTime']['output'];
};

export enum LoginFlowSource {
  INTERNAL_SSO = 'INTERNAL_SSO'
}

export type MarkChangesForOperationAsSafeResult = {
  __typename?: 'MarkChangesForOperationAsSafeResult';
  /**
   * Nice to have for the frontend since the Apollo cache is already watching for AffectedQuery to update.
   * This might return null if no behavior changes were found for the affected operation ID.
   * This is a weird situation that should never happen.
   */
  affectedOperation?: Maybe<AffectedQuery>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type MediaUploadInfo = {
  __typename?: 'MediaUploadInfo';
  csrfToken: Scalars['String']['output'];
  maxContentLength: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

/** This type represents a conflict between two versions of a schema i.e. the current proposal and the updated source variant schema */
export type MergeConflict = {
  __typename?: 'MergeConflict';
  /** The diffs that caused the conflict */
  diffItems: Array<FlatDiffItem>;
  /** location of conflicts in the partialMergeSdl */
  locationCoordinate?: Maybe<ParsedSchemaCoordinate>;
  /** message explaining the conflict */
  message?: Maybe<Scalars['String']['output']>;
};

export type MergedSdlWithConflictsData = {
  __typename?: 'MergedSdlWithConflictsData';
  subgraphsWithConflicts: Array<SubgraphWithConflicts>;
};

export type MergedSdlWithConflictsResult = MergedSdlWithConflictsData | NotFoundError;

export type MetricStatWindow = {
  __typename?: 'MetricStatWindow';
  timestamp: Scalars['Timestamp']['output'];
  value: Scalars['Long']['output'];
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
  graphRef?: InputMaybe<Scalars['ID']['input']>;
  /** The URL of the GraphQL endpoint that Apollo Sandbox introspected to obtain the proposed schema. Required if `isSandbox` is `true`. */
  introspectionEndpoint?: InputMaybe<Scalars['String']['input']>;
  /** If `true`, the check was initiated automatically by a Proposal update. */
  isProposal?: InputMaybe<Scalars['Boolean']['input']>;
  /** If `true`, the check was initiated by Apollo Sandbox. */
  isSandbox: Scalars['Boolean']['input'];
  /** The source variant that this check should use the operations check configuration from */
  sourceVariant?: InputMaybe<Scalars['String']['input']>;
  /** The changed subgraph schemas to check. */
  subgraphsToCheck: Array<InputMaybe<SubgraphSdlCheckInput>>;
  /** The user that triggered this check. If null, defaults to authContext to determine user. */
  triggeredBy?: InputMaybe<ActorInput>;
};

/** GraphQL mutations */
export type Mutation = {
  __typename?: 'Mutation';
  /** @deprecated Use Mutation.organization instead. */
  account?: Maybe<AccountMutation>;
  addOidcConfigurationToBaseConnection?: Maybe<SsoConnection>;
  billing?: Maybe<BillingMutation>;
  /**
   * Allows the frontend to check if a SSO configuration key is valid.
   * This helps restrict access to the public SSO configuration page.
   */
  checkSsoConfigurationKey: Scalars['Boolean']['output'];
  /** Cloud mutations */
  cloud: CloudMutation;
  cloudTesting: CloudTestingMutation;
  /** Creates an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/) for a given variant, or creates a [sandbox collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/#sandbox-collections) without an associated variant. */
  createOperationCollection: CreateOperationCollectionResult;
  /**
   * Finalize a password reset with a token included in the E-mail link,
   * returns the corresponding login email when successful
   */
  finalizePasswordReset?: Maybe<Scalars['String']['output']>;
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
  /** Provides access to mutation fields for modifying a an organization with the provided ID. */
  organization?: Maybe<AccountMutation>;
  plan?: Maybe<BillingPlanMutation>;
  /**
   * Provides access to mutation fields for modifying a GraphOS Schema Proposals with the provided ID. Learn more at https://www.apollographql.com/docs/graphos/delivery/schema-proposals
   * @deprecated Use GraphVariantMutation.proposal instead
   */
  proposal: ProposalMutationResult;
  /** @deprecated Use GraphVariantMutation.proposal instead */
  proposalByVariantRef: ProposalMutationResult;
  publishEDUEvent: Scalars['Boolean']['output'];
  /** Push a lead to Marketo by program ID */
  pushMarketoLead: Scalars['Boolean']['output'];
  /** Report a running GraphQL server's schema. */
  reportSchema?: Maybe<ReportSchemaResult>;
  /** Ask for a user's password to be reset by E-mail */
  resetPassword?: Maybe<Scalars['Void']['output']>;
  resolveAllInternalCronExecutions?: Maybe<Scalars['Void']['output']>;
  resolveInternalCronExecution?: Maybe<CronExecution>;
  service?: Maybe<ServiceMutation>;
  /** Set the subscriptions for a given email */
  setSubscriptions?: Maybe<EmailPreferences>;
  /** Set the studio settings for the current user */
  setUserSettings?: Maybe<UserSettings>;
  signUp?: Maybe<User>;
  ssoV2: SsoMutation;
  /** This is called by the form shown to users after they delete their user or organization account. */
  submitPostDeletionFeedback?: Maybe<Scalars['Void']['output']>;
  /** Mutation for basic engagement tracking in studio */
  track?: Maybe<Scalars['Void']['output']>;
  /** Apollo Kotlin usage tracking. */
  trackApolloKotlinUsage?: Maybe<Scalars['Void']['output']>;
  /** Router usage tracking. Reserved to https://router.apollo.dev/telemetry (https://github.com/apollographql/orbiter). */
  trackRouterUsage?: Maybe<Scalars['Void']['output']>;
  /** Rover session tracking. Reserved to https://rover.apollo.dev/telemetry (https://github.com/apollographql/orbiter). */
  trackRoverSession?: Maybe<Scalars['Void']['output']>;
  transferOdysseyProgress: Scalars['Boolean']['output'];
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
export type MutationAccountArgs = {
  id: Scalars['ID']['input'];
};


/** GraphQL mutations */
export type MutationAddOidcConfigurationToBaseConnectionArgs = {
  config: OidcConfigurationInput;
  configurationKey: Scalars['String']['input'];
};


/** GraphQL mutations */
export type MutationCheckSsoConfigurationKeyArgs = {
  key: Scalars['String']['input'];
};


/** GraphQL mutations */
export type MutationCreateOperationCollectionArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  isSandbox: Scalars['Boolean']['input'];
  isShared: Scalars['Boolean']['input'];
  minEditRole?: InputMaybe<UserPermission>;
  name: Scalars['String']['input'];
  variantRefs?: InputMaybe<Array<Scalars['ID']['input']>>;
};


/** GraphQL mutations */
export type MutationFinalizePasswordResetArgs = {
  newPassword: Scalars['String']['input'];
  resetToken: Scalars['String']['input'];
};


/** GraphQL mutations */
export type MutationGraphArgs = {
  id: Scalars['ID']['input'];
};


/** GraphQL mutations */
export type MutationJoinAccountArgs = {
  accountId: Scalars['ID']['input'];
  joinToken: Scalars['String']['input'];
};


/** GraphQL mutations */
export type MutationNewAccountArgs = {
  companyUrl?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  organizationName?: InputMaybe<Scalars['String']['input']>;
  planId?: InputMaybe<Scalars['String']['input']>;
};


/** GraphQL mutations */
export type MutationNewBillingPlanArgs = {
  plan: BillingPlanInput;
};


/** GraphQL mutations */
export type MutationNewCapabilityArgs = {
  capability: BillingCapabilityInput;
};


/** GraphQL mutations */
export type MutationNewLimitArgs = {
  limit: BillingLimitInput;
};


/** GraphQL mutations */
export type MutationNewServiceArgs = {
  accountId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  hiddenFromUninvitedNonAdminAccountMembers?: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  onboardingArchitecture?: InputMaybe<OnboardingArchitecture>;
  title?: InputMaybe<Scalars['String']['input']>;
};


/** GraphQL mutations */
export type MutationOperationCollectionArgs = {
  id: Scalars['ID']['input'];
};


/** GraphQL mutations */
export type MutationOrganizationArgs = {
  id: Scalars['ID']['input'];
};


/** GraphQL mutations */
export type MutationPlanArgs = {
  id: Scalars['ID']['input'];
};


/** GraphQL mutations */
export type MutationProposalArgs = {
  id: Scalars['ID']['input'];
};


/** GraphQL mutations */
export type MutationProposalByVariantRefArgs = {
  variantRef: Scalars['ID']['input'];
};


/** GraphQL mutations */
export type MutationPublishEduEventArgs = {
  data: Scalars['String']['input'];
  type: Scalars['String']['input'];
};


/** GraphQL mutations */
export type MutationPushMarketoLeadArgs = {
  input: PushMarketoLeadInput;
  programId: Scalars['ID']['input'];
  programStatus?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
};


/** GraphQL mutations */
export type MutationReportSchemaArgs = {
  coreSchema?: InputMaybe<Scalars['String']['input']>;
  report: SchemaReport;
};


/** GraphQL mutations */
export type MutationResetPasswordArgs = {
  email: Scalars['String']['input'];
};


/** GraphQL mutations */
export type MutationResolveAllInternalCronExecutionsArgs = {
  group?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


/** GraphQL mutations */
export type MutationResolveInternalCronExecutionArgs = {
  id: Scalars['ID']['input'];
};


/** GraphQL mutations */
export type MutationServiceArgs = {
  id: Scalars['ID']['input'];
};


/** GraphQL mutations */
export type MutationSetSubscriptionsArgs = {
  email: Scalars['String']['input'];
  subscriptions: Array<EmailCategory>;
  token: Scalars['String']['input'];
};


/** GraphQL mutations */
export type MutationSetUserSettingsArgs = {
  newSettings?: InputMaybe<UserSettingsInput>;
};


/** GraphQL mutations */
export type MutationSignUpArgs = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  referrer?: InputMaybe<Scalars['String']['input']>;
  trackingGoogleClientId?: InputMaybe<Scalars['String']['input']>;
  trackingMarketoClientId?: InputMaybe<Scalars['String']['input']>;
  trackingValues?: InputMaybe<UserTrackingInput>;
  userSegment?: InputMaybe<UserSegment>;
  utmCampaign?: InputMaybe<Scalars['String']['input']>;
  utmMedium?: InputMaybe<Scalars['String']['input']>;
  utmSource?: InputMaybe<Scalars['String']['input']>;
};


/** GraphQL mutations */
export type MutationSubmitPostDeletionFeedbackArgs = {
  feedback: Scalars['String']['input'];
  targetIdentifier: Scalars['ID']['input'];
  targetType: DeletionTargetType;
};


/** GraphQL mutations */
export type MutationTrackArgs = {
  event: EventEnum;
  graphID: Scalars['String']['input'];
  graphVariant?: Scalars['String']['input'];
};


/** GraphQL mutations */
export type MutationTrackApolloKotlinUsageArgs = {
  events: Array<ApolloKotlinUsageEventInput>;
  instanceId: Scalars['ID']['input'];
  properties: Array<ApolloKotlinUsagePropertyInput>;
};


/** GraphQL mutations */
export type MutationTrackRouterUsageArgs = {
  ci?: InputMaybe<Scalars['String']['input']>;
  os: Scalars['String']['input'];
  sessionId: Scalars['ID']['input'];
  usage: Array<RouterUsageInput>;
  version: Scalars['String']['input'];
};


/** GraphQL mutations */
export type MutationTrackRoverSessionArgs = {
  anonymousId: Scalars['ID']['input'];
  arguments: Array<RoverArgumentInput>;
  ci?: InputMaybe<Scalars['String']['input']>;
  command: Scalars['String']['input'];
  cwdHash: Scalars['SHA256']['input'];
  os: Scalars['String']['input'];
  remoteUrlHash?: InputMaybe<Scalars['SHA256']['input']>;
  sessionId: Scalars['ID']['input'];
  version: Scalars['String']['input'];
};


/** GraphQL mutations */
export type MutationTransferOdysseyProgressArgs = {
  from: Scalars['ID']['input'];
  to: Scalars['ID']['input'];
};


/** GraphQL mutations */
export type MutationUnsubscribeFromAllArgs = {
  email: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


/** GraphQL mutations */
export type MutationUpdateSurveyArgs = {
  internalAccountId: Scalars['String']['input'];
  surveyId: Scalars['String']['input'];
  surveyIdVersion: Scalars['Int']['input'];
  surveyState: Array<SurveyQuestionInput>;
};


/** GraphQL mutations */
export type MutationUserArgs = {
  id: Scalars['ID']['input'];
};

export type NamedIntrospectionArg = {
  __typename?: 'NamedIntrospectionArg';
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type NamedIntrospectionArgNoDescription = {
  __typename?: 'NamedIntrospectionArgNoDescription';
  name?: Maybe<Scalars['String']['output']>;
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
  description?: Maybe<Scalars['String']['output']>;
  kind?: Maybe<IntrospectionTypeKind>;
  name?: Maybe<Scalars['String']['output']>;
};

export type NamedIntrospectionTypeNoDescription = {
  __typename?: 'NamedIntrospectionTypeNoDescription';
  name?: Maybe<Scalars['String']['output']>;
};

/**
 * Introspection values that can be children of other types for changes, such
 * as input fields, objects in interfaces, enum values. In the future, this
 * value could become an interface to allow fields specific to the types
 * returned.
 */
export type NamedIntrospectionValue = {
  __typename?: 'NamedIntrospectionValue';
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  printedType?: Maybe<Scalars['String']['output']>;
};

export type NamedIntrospectionValueNoDescription = {
  __typename?: 'NamedIntrospectionValueNoDescription';
  name?: Maybe<Scalars['String']['output']>;
  printedType?: Maybe<Scalars['String']['output']>;
};

/** A non-federated service for a monolithic graph. */
export type NonFederatedImplementingService = {
  __typename?: 'NonFederatedImplementingService';
  /** Timestamp of when this implementing service was created. */
  createdAt: Scalars['Timestamp']['output'];
  /**
   * Identifies which graph this non-implementing service belongs to.
   * Formerly known as "service_id".
   */
  graphID: Scalars['String']['output'];
  /**
   * Specifies which variant of a graph this implementing service belongs to".
   * Formerly known as "tag".
   */
  graphVariant: Scalars['String']['output'];
};

/** An error that occurs when a requested object is not found. */
export type NotFoundError = Error & {
  __typename?: 'NotFoundError';
  /** The error message. */
  message: Scalars['String']['output'];
};

export enum NotificationStatus {
  ALL = 'ALL',
  NONE = 'NONE'
}

export type OdysseyAttempt = {
  __typename?: 'OdysseyAttempt';
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  id: Scalars['ID']['output'];
  pass?: Maybe<Scalars['Boolean']['output']>;
  responses: Array<OdysseyResponse>;
  startedAt: Scalars['Timestamp']['output'];
  testId: Scalars['String']['output'];
};

export type OdysseyCertification = {
  __typename?: 'OdysseyCertification';
  certificationId: Scalars['String']['output'];
  earnedAt: Scalars['Timestamp']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  owner?: Maybe<OdysseyCertificationOwner>;
  source?: Maybe<Scalars['String']['output']>;
};

export type OdysseyCertificationOwner = {
  __typename?: 'OdysseyCertificationOwner';
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type OdysseyCourse = {
  __typename?: 'OdysseyCourse';
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  enrolledAt?: Maybe<Scalars['Timestamp']['output']>;
  id: Scalars['ID']['output'];
  language?: Maybe<Scalars['String']['output']>;
};

export type OdysseyCourseInput = {
  completedAt?: InputMaybe<Scalars['Timestamp']['input']>;
  courseId: Scalars['String']['input'];
  isBeta?: InputMaybe<Scalars['Boolean']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
};

export type OdysseyResponse = {
  __typename?: 'OdysseyResponse';
  correct?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  questionId: Scalars['String']['output'];
  values: Array<OdysseyValue>;
};

export type OdysseyResponseCorrectnessInput = {
  correct: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};

export type OdysseyResponseInput = {
  attemptId: Scalars['ID']['input'];
  correct?: InputMaybe<Scalars['Boolean']['input']>;
  questionId: Scalars['String']['input'];
  values: Array<Scalars['String']['input']>;
};

export type OdysseyTask = {
  __typename?: 'OdysseyTask';
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  id: Scalars['ID']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

export type OdysseyTaskInput = {
  completedAt?: InputMaybe<Scalars['Timestamp']['input']>;
  taskId: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

export type OdysseyValue = {
  __typename?: 'OdysseyValue';
  id: Scalars['ID']['output'];
  value: Scalars['String']['output'];
};

export type OidcConfigurationInput = {
  clientId: Scalars['String']['input'];
  clientSecret: Scalars['String']['input'];
  discoveryURI?: InputMaybe<Scalars['String']['input']>;
  issuer: Scalars['String']['input'];
};

export type OidcConfigurationUpdateInput = {
  clientId: Scalars['String']['input'];
  clientSecret?: InputMaybe<Scalars['String']['input']>;
  discoveryURI?: InputMaybe<Scalars['String']['input']>;
  issuer: Scalars['String']['input'];
};

export type OidcConnection = SsoConnection & {
  __typename?: 'OidcConnection';
  clientId: Scalars['ID']['output'];
  discoveryUri?: Maybe<Scalars['String']['output']>;
  domains: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  idpId: Scalars['ID']['output'];
  issuer: Scalars['String']['output'];
  scim?: Maybe<SsoScimProvisioningDetails>;
  /** @deprecated Use stateV2 instead */
  state: SsoConnectionState;
  stateV2: SsoConnectionStateV2;
};

export enum OnboardingArchitecture {
  MONOLITH = 'MONOLITH',
  SUPERGRAPH = 'SUPERGRAPH'
}

export type Operation = {
  __typename?: 'Operation';
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  signature?: Maybe<Scalars['String']['output']>;
  truncated: Scalars['Boolean']['output'];
};

export type OperationAcceptedChange = {
  __typename?: 'OperationAcceptedChange';
  acceptedAt: Scalars['Timestamp']['output'];
  acceptedBy?: Maybe<Identity>;
  change: StoredApprovedChange;
  checkID: Scalars['ID']['output'];
  graphID: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  operationID: Scalars['String']['output'];
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in OperationCheckStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type OperationCheckStatsFilter = {
  and?: InputMaybe<Array<OperationCheckStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<OperationCheckStatsFilterIn>;
  not?: InputMaybe<OperationCheckStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<OperationCheckStatsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in OperationCheckStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type OperationCheckStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type OperationCheckStatsMetrics = {
  __typename?: 'OperationCheckStatsMetrics';
  cachedRequestsCount: Scalars['Long']['output'];
  uncachedRequestsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

/** A list of saved GraphQL operations. */
export type OperationCollection = {
  __typename?: 'OperationCollection';
  /** The timestamp when the collection was created. */
  createdAt: Scalars['Timestamp']['output'];
  /** The user or other entity that created the collection. */
  createdBy?: Maybe<Identity>;
  /** The collection's description. A `null` description was never set, and empty string description was set to be empty string by a user, or other entity. */
  description?: Maybe<Scalars['String']['output']>;
  /**
   * If a user has any of these roles, they will be able to edit this
   * collection.
   * @deprecated deprecated in favour of minEditRole
   */
  editRoles?: Maybe<Array<UserPermission>>;
  id: Scalars['ID']['output'];
  /** Whether the current user has marked the collection as a favorite. */
  isFavorite: Scalars['Boolean']['output'];
  /** Whether the collection is a [sandbox collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/#sandbox-collections). */
  isSandbox: Scalars['Boolean']['output'];
  /** Whether the collection is shared across its associated organization. */
  isShared: Scalars['Boolean']['output'];
  /** The timestamp when the collection was most recently updated. */
  lastUpdatedAt: Scalars['Timestamp']['output'];
  /** The user or other entity that most recently updated the collection. */
  lastUpdatedBy?: Maybe<Identity>;
  /** The minimum role a user needs to edit this collection. Valid values: null, CONSUMER, OBSERVER, DOCUMENTER, CONTRIBUTOR, GRAPH_ADMIN. This value is always `null` if `isShared` is `false`. If `null` when `isShared` is `true`, the minimum role is `GRAPH_ADMIN`. */
  minEditRole?: Maybe<UserPermission>;
  /** The collection's name. */
  name: Scalars['String']['output'];
  /** Returns the operation in the collection with the specified ID, if any. */
  operation?: Maybe<OperationCollectionEntryResult>;
  /** A list of the GraphQL operations that belong to the collection. */
  operations: Array<OperationCollectionEntry>;
  /** The permissions that the current user has for the collection. */
  permissions: OperationCollectionPermissions;
  variants: Array<GraphVariant>;
};


/** A list of saved GraphQL operations. */
export type OperationCollectionOperationArgs = {
  id: Scalars['ID']['input'];
};

/** A saved operation entry within an Operation Collection. */
export type OperationCollectionEntry = {
  __typename?: 'OperationCollectionEntry';
  collection: OperationCollection;
  /** The timestamp when the entry was created. */
  createdAt: Scalars['Timestamp']['output'];
  /** The user or other entity that created the entry. */
  createdBy?: Maybe<Identity>;
  /** Details of the entry's associated operation, such as its `body` and `variables`. */
  currentOperationRevision: OperationCollectionEntryState;
  id: Scalars['ID']['output'];
  /** The timestamp when the entry was most recently updated. */
  lastUpdatedAt: Scalars['Timestamp']['output'];
  /** The user or other entity that most recently updated the entry. */
  lastUpdatedBy?: Maybe<Identity>;
  /** The entry's name. */
  name: Scalars['String']['output'];
  /** The entry's lexicographical ordering index within its containing collection. */
  orderingIndex: Scalars['String']['output'];
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
export type OperationCollectionEntryMutationMoveToCollectionArgs = {
  collectionId: Scalars['ID']['input'];
  lowerOrderingBound?: InputMaybe<Scalars['String']['input']>;
  upperOrderingBound?: InputMaybe<Scalars['String']['input']>;
};


/** Provides fields for modifying an operation in a collection. */
export type OperationCollectionEntryMutationReorderEntryArgs = {
  lowerOrderingBound?: InputMaybe<Scalars['String']['input']>;
  upperOrderingBound?: InputMaybe<Scalars['String']['input']>;
};


/** Provides fields for modifying an operation in a collection. */
export type OperationCollectionEntryMutationUpdateNameArgs = {
  name: Scalars['String']['input'];
};


/** Provides fields for modifying an operation in a collection. */
export type OperationCollectionEntryMutationUpdateValuesArgs = {
  operationInput: OperationCollectionEntryStateInput;
};

export type OperationCollectionEntryMutationResult = NotFoundError | OperationCollectionEntryMutation | PermissionError;

/** Possible return values when querying for an entry in an operation collection (either the entry object or an `Error` object). */
export type OperationCollectionEntryResult = NotFoundError | OperationCollectionEntry;

/** The most recent body, variable and header values of a saved operation entry. */
export type OperationCollectionEntryState = {
  __typename?: 'OperationCollectionEntryState';
  /** The raw body of the entry's GraphQL operation. */
  body: Scalars['String']['output'];
  /** The timestamp when the entry state was created. */
  createdAt: Scalars['Timestamp']['output'];
  /** The user or other entity that created this entry state. */
  createdBy?: Maybe<Identity>;
  /** Headers for the entry's GraphQL operation. */
  headers?: Maybe<Array<OperationHeader>>;
  /** The post operation workflow automation script for this entry's GraphQL operation */
  postflightOperationScript?: Maybe<Scalars['String']['output']>;
  /** The pre operation workflow automation script for this entry's GraphQL operation */
  script?: Maybe<Scalars['String']['output']>;
  /** Variables for the entry's GraphQL operation, as a JSON string. */
  variables?: Maybe<Scalars['String']['output']>;
};

/** Fields for creating or modifying an operation collection entry. */
export type OperationCollectionEntryStateInput = {
  /** The operation's query body. */
  body: Scalars['String']['input'];
  /** The operation's headers. */
  headers?: InputMaybe<Array<OperationHeaderInput>>;
  /** The operation's postflight workflow script */
  postflightOperationScript?: InputMaybe<Scalars['String']['input']>;
  /** The operation's preflight workflow script */
  script?: InputMaybe<Scalars['String']['input']>;
  /** The operation's variables. */
  variables?: InputMaybe<Scalars['String']['input']>;
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
export type OperationCollectionMutationAddOperationArgs = {
  name: Scalars['String']['input'];
  operationInput: OperationCollectionEntryStateInput;
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationAddOperationsArgs = {
  operations: Array<AddOperationInput>;
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationAddToVariantArgs = {
  variantRef: Scalars['ID']['input'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationDeleteOperationArgs = {
  id: Scalars['ID']['input'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationDuplicateCollectionArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  isSandbox: Scalars['Boolean']['input'];
  isShared: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  variantRef?: InputMaybe<Scalars['ID']['input']>;
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationOperationArgs = {
  id: Scalars['ID']['input'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationRemoveFromVariantArgs = {
  variantRef: Scalars['ID']['input'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationSetMinEditRoleArgs = {
  editRole?: InputMaybe<UserPermission>;
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationUpdateDescriptionArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationUpdateIsFavoriteArgs = {
  isFavorite: Scalars['Boolean']['input'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationUpdateIsSharedArgs = {
  isShared: Scalars['Boolean']['input'];
};


/** Provides fields for modifying an [operation collection](https://www.apollographql.com/docs/studio/explorer/operation-collections/). */
export type OperationCollectionMutationUpdateNameArgs = {
  name: Scalars['String']['input'];
};

/** Whether the current user can perform various actions on the associated collection. */
export type OperationCollectionPermissions = {
  __typename?: 'OperationCollectionPermissions';
  /** Whether the current user can edit operations in the associated collection. */
  canEditOperations: Scalars['Boolean']['output'];
  /** Whether the current user can delete or update the associated collection's metadata, such as its name and description. */
  canManage: Scalars['Boolean']['output'];
  /** Whether the current user can read operations in the associated collection. */
  canReadOperations: Scalars['Boolean']['output'];
};

export type OperationCollectionResult = NotFoundError | OperationCollection | PermissionError | ValidationError;

export type OperationDetails = {
  __typename?: 'OperationDetails';
  /** A hashed representation of the signature, commonly used as the operation ID. */
  id: Scalars['String']['output'];
  /** The operation name or null if the operation is unnamed. */
  name?: Maybe<Scalars['String']['output']>;
  /** First 128 characters of query signature for display. */
  signature?: Maybe<Scalars['String']['output']>;
};

export type OperationDocument = {
  __typename?: 'OperationDocument';
  /** Operation document body */
  body: Scalars['String']['output'];
  /** Operation name */
  name?: Maybe<Scalars['String']['output']>;
};

export type OperationDocumentInput = {
  /** Operation document body */
  body: Scalars['String']['input'];
  /** Operation name */
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Saved headers on a saved operation. */
export type OperationHeader = {
  __typename?: 'OperationHeader';
  /** The header's name. */
  name: Scalars['String']['output'];
  /** The header's value. */
  value: Scalars['String']['output'];
};

export type OperationHeaderInput = {
  /** The header's name. */
  name: Scalars['String']['input'];
  /** The header's value. */
  value: Scalars['String']['input'];
};

export type OperationInfoFilter = {
  __typename?: 'OperationInfoFilter';
  id: Scalars['String']['output'];
};

export type OperationInfoFilterInput = {
  id: Scalars['String']['input'];
};

export type OperationInsightsListFilterInInput = {
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type OperationInsightsListFilterInput = {
  clientName?: InputMaybe<Scalars['String']['input']>;
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<OperationInsightsListFilterInInput>;
  isUnnamed?: InputMaybe<Scalars['Boolean']['input']>;
  isUnregistered?: InputMaybe<Scalars['Boolean']['input']>;
  operationTypes?: InputMaybe<Array<OperationType>>;
  or?: InputMaybe<Array<OperationInsightsListFilterInput>>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type OperationInsightsListItem = {
  __typename?: 'OperationInsightsListItem';
  cacheHitRate: Scalars['Float']['output'];
  /** The p50 of the latency across cached requests. This can be null depending on the filter and sort order. */
  cacheTtlP50Ms?: Maybe<Scalars['Float']['output']>;
  /** A substring of the query signature for unnamed operations, otherwise the operation name. */
  displayName: Scalars['String']['output'];
  errorCount: Scalars['Long']['output'];
  errorCountPerMin: Scalars['Float']['output'];
  errorPercentage: Scalars['Float']['output'];
  /** The unique id for this operation. */
  id: Scalars['ID']['output'];
  /** The operation name or null if the operation is unnamed. */
  name?: Maybe<Scalars['String']['output']>;
  requestCount: Scalars['Long']['output'];
  requestCountPerMin: Scalars['Float']['output'];
  /** The p50 of the latency across all requests. This can be null depending on the filter and sort order. */
  serviceTimeP50Ms?: Maybe<Scalars['Float']['output']>;
  /** The p90 of the latency across all requests. This can be null depending on the filter and sort order. */
  serviceTimeP90Ms?: Maybe<Scalars['Float']['output']>;
  /** The p95 of the latency across all requests. This can be null depending on the filter and sort order. */
  serviceTimeP95Ms?: Maybe<Scalars['Float']['output']>;
  /** The p99 of the latency across all requests. This can be null depending on the filter and sort order. */
  serviceTimeP99Ms?: Maybe<Scalars['Float']['output']>;
  /** The query signature size as a number of UTF8 bytes. This can be null if the sort order is not SIGNATURE_BYTES. */
  signatureBytes?: Maybe<Scalars['Long']['output']>;
  /** The total duration across all requests. This can be null depending on the filter and sort order. */
  totalDurationMs?: Maybe<Scalars['Float']['output']>;
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
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Operation name filter configuration for a graph. */
export type OperationNameFilter = {
  __typename?: 'OperationNameFilter';
  /** name of the operation by the user and reported alongside metrics */
  name: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
};

/** Options to filter by operation name. */
export type OperationNameFilterInput = {
  /** name of the operation set by the user and reported alongside metrics */
  name: Scalars['String']['input'];
  version?: InputMaybe<Scalars['String']['input']>;
};

export enum OperationType {
  MUTATION = 'MUTATION',
  QUERY = 'QUERY',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export type OperationValidationError = {
  __typename?: 'OperationValidationError';
  message: Scalars['String']['output'];
};

export type OperationsCheckConfiguration = {
  __typename?: 'OperationsCheckConfiguration';
  /**
   * During operation checks, if this option is enabled, the check will not fail or
   *  mark any operations as broken/changed if the default value has changed, only
   *  if the default value is removed completely.
   */
  downgradeDefaultValueChange: Scalars['Boolean']['output'];
  /**
   * During operation checks, if this option is enabled, it evaluates a check
   * run against zero operations as a pass instead of a failure.
   */
  downgradeStaticChecks: Scalars['Boolean']['output'];
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
  from: Scalars['String']['output'];
  /** The start of the time range for the operations check. */
  fromNormalized: Scalars['Timestamp']['output'];
  /**
   * During the operations check, fetch operations from the metrics data for <includedVariants>
   * variants.
   */
  includedVariants: Array<Scalars['String']['output']>;
  /**
   * During the operations check, ignore operations that executed less than <operationCountThreshold>
   * times in the time range.
   */
  operationCountThreshold: Scalars['Int']['output'];
  /**
   * Duration the operations check, ignore operations that constituted less than
   * <operationCountThresholdPercentage>% of the operations in the time range.
   */
  operationCountThresholdPercentage: Scalars['Float']['output'];
  /**
   * The end of the time range for the operations check, expressed as an offset from the time the
   * check request was received (in seconds) or an ISO-8601 timestamp. This was either provided by the
   * user or computed from variant- or graph-level settings.
   * @deprecated Use toNormalized instead
   */
  to: Scalars['String']['output'];
  /** The end of the time range for the operations check. */
  toNormalized: Scalars['Timestamp']['output'];
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
  from?: InputMaybe<Scalars['String']['input']>;
  /**
   * During the operations check, fetch operations from the metrics data for <includedVariants>
   * variants. Providing null will use variant- or graph-level settings instead.
   */
  includedVariants?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * During the operations check, ignore operations that executed less than <operationCountThreshold>
   * times in the time range. Providing null will use variant- or graph-level settings instead.
   */
  operationCountThreshold?: InputMaybe<Scalars['Int']['input']>;
  /**
   * During the operations check, ignore operations that executed less than <operationCountThreshold>
   * times in the time range. Expected values are between 0% and 5%. Providing null will use variant-
   * or graph-level settings instead.
   */
  operationCountThresholdPercentage?: InputMaybe<Scalars['Float']['input']>;
  /**
   * The end of the time range for the operations check, expressed as an offset from the time the
   * check request is received (in seconds) or an ISO-8601 timestamp. Providing null here and
   * useMaxRetention as false will use variant- or graph-level settings instead. It is an error to
   * provide a non-null value here and useMaxRetention as true.
   */
  to?: InputMaybe<Scalars['String']['input']>;
  /**
   * During the operations check, use the maximum time range allowed by the graph's plan's retention.
   * Providing false here and from/to as null will use variant- or graph-level settings instead. It is
   * an error to provide true here and from/to as non-null.
   */
  useMaxRetention?: Scalars['Boolean']['input'];
};

export type OperationsCheckResult = {
  __typename?: 'OperationsCheckResult';
  /** Operations affected by all changes in diff */
  affectedQueries?: Maybe<Array<AffectedQuery>>;
  /** Indicates whether the changes for this operation check were truncated due to their large quantity. */
  areChangesTruncated: Scalars['Boolean']['output'];
  /** Summary/counts for all changes in diff */
  changeSummary: ChangeSummary;
  /** List of schema changes with associated affected clients and operations */
  changes: Array<Change>;
  /** Indication of the success of the change, either failure, warning, or notice. */
  checkSeverity: ChangeSeverity;
  /** The variant that was used as a base to check against */
  checkedVariant: GraphVariant;
  createdAt: Scalars['Timestamp']['output'];
  /** The threshold that was crossed; null if the threshold was not exceeded */
  crossedOperationThreshold?: Maybe<Scalars['Int']['output']>;
  /** Graph ID of the variant */
  graphID: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Number of affected query operations that are neither marked as SAFE or IGNORED */
  numberOfAffectedOperations: Scalars['Int']['output'];
  /** Number of operations that were validated during schema diff */
  numberOfCheckedOperations: Scalars['Int']['output'];
  /** Total number of schema changes, excluding any truncation. */
  totalNumberOfChanges: Scalars['Int']['output'];
  /** Operations checked against but not affecting the diff. */
  unaffectedOperations?: Maybe<Array<OperationDetails>>;
  workflowTask: OperationsCheckTask;
};

export type OperationsCheckTask = CheckWorkflowTask & {
  __typename?: 'OperationsCheckTask';
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  graphID: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  /**
   * The result of the operations check. This will be null when the task is initializing or running,
   * or when the build task fails (which is a prerequisite task to this one).
   */
  result?: Maybe<OperationsCheckResult>;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']['output']>;
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
  completionPercentage?: Maybe<Scalars['Int']['output']>;
  /** When this Order was created */
  createdAt: Scalars['NaiveDateTime']['output'];
  /** Order identifier */
  id: Scalars['ID']['output'];
  /** Introspect why call to `ready` failed */
  introspectReady: Scalars['String']['output'];
  logs: Array<LogMessage>;
  /** Order type */
  orderType: OrderType;
  /** Checks if we can serve requests through the external endpoint */
  readyExternal: Scalars['Boolean']['output'];
  /** Reason for ERRORED or ROLLING_BACK orders */
  reason?: Maybe<Scalars['String']['output']>;
  /** Router associated with this Order */
  router: Router;
  /** Checks if the service is updated */
  serviceReady: Scalars['Boolean']['output'];
  /** Shard associated with this Order */
  shard: Shard;
  /** Order status */
  status: OrderStatus;
  /** Last time this Order was updated */
  updatedAt?: Maybe<Scalars['NaiveDateTime']['output']>;
};

/** The order does not exist */
export type OrderDoesNotExistError = {
  __typename?: 'OrderDoesNotExistError';
  tryAgainSeconds: Scalars['Int']['output'];
};

/** Catch-all failure result of a failed order mutation. */
export type OrderError = {
  __typename?: 'OrderError';
  /** Error message */
  message: Scalars['String']['output'];
};

export type OrderMutation = {
  __typename?: 'OrderMutation';
  /** Create an ALB rule */
  createAlbRule: OrderResult;
  /** Create CNAME record */
  createCname: OrderResult;
  /** Create an IAM Role */
  createIamRole: OrderResult;
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
  /** Delete CNAME */
  deleteCname: OrderResult;
  /** Delete an IAM Role */
  deleteIamRole: OrderResult;
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
  /** Rollback CNAME record */
  rollbackCname: OrderResult;
  /** Rollback an IAM Role */
  rollbackIamRole: OrderResult;
  /** Rollback router information */
  rollbackInfo: OrderResult;
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
  /** Update an ALB rule */
  updateAlbRule: OrderResult;
  /** Update an IAM Role */
  updateIamRole: OrderResult;
  /** Update router information */
  updateInfo: OrderResult;
  /** Update secrets */
  updateSecrets: OrderResult;
  /** Update a Service */
  updateService: OrderResult;
  /** Update order status */
  updateStatus: OrderResult;
  /** Update order status with a reason and cause */
  updateStatusWithReason: OrderResult;
  /** Update a task definition */
  updateTaskDefinition: OrderResult;
};


export type OrderMutationUpdateStatusArgs = {
  status: OrderStatus;
  updateRouter?: InputMaybe<Scalars['Boolean']['input']>;
};


export type OrderMutationUpdateStatusWithReasonArgs = {
  cause: ReasonCause;
  reason: Scalars['String']['input'];
  status: OrderStatus;
  updateRouter?: InputMaybe<Scalars['Boolean']['input']>;
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

export enum OrderingDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

/** A reusable invite link for an organization. */
export type OrganizationInviteLink = {
  __typename?: 'OrganizationInviteLink';
  createdAt: Scalars['Timestamp']['output'];
  /** A joinToken that can be passed to Mutation.joinAccount to join the organization. */
  joinToken: Scalars['String']['output'];
  /** The role that the user will receive if they join the organization with this link. */
  role: UserPermission;
};

export type OrganizationSso = {
  __typename?: 'OrganizationSSO';
  defaultRole: UserPermission;
  idpid: Scalars['ID']['output'];
  provider: OrganizationSsoProvider;
};

export enum OrganizationSsoProvider {
  APOLLO = 'APOLLO'
}

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** PagerDuty notification channel */
export type PagerDutyChannel = Channel & {
  __typename?: 'PagerDutyChannel';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  routingKey: Scalars['String']['output'];
  subscriptions: Array<ChannelSubscription>;
};

/** PagerDuty notification channel parameters */
export type PagerDutyChannelInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  routingKey: Scalars['String']['input'];
};

export type ParentChangeProposalComment = ChangeProposalComment & ProposalComment & {
  __typename?: 'ParentChangeProposalComment';
  createdAt: Scalars['Timestamp']['output'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  /** true if the schemaCoordinate this comment is on doesn't exist in the diff between the most recent revision & the base sdl */
  outdated: Scalars['Boolean']['output'];
  replies: Array<ReplyChangeProposalComment>;
  replyCount: Scalars['Int']['output'];
  schemaCoordinate: Scalars['String']['output'];
  /** '#@!api!@#' for api schema, '#@!supergraph!@#' for supergraph schema, subgraph otherwise */
  schemaScope: Scalars['String']['output'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']['output']>;
};

export type ParentGeneralProposalComment = GeneralProposalComment & ProposalComment & {
  __typename?: 'ParentGeneralProposalComment';
  createdAt: Scalars['Timestamp']['output'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  replies: Array<ReplyGeneralProposalComment>;
  replyCount: Scalars['Int']['output'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']['output']>;
};

export type ParentProposalComment = ParentChangeProposalComment | ParentGeneralProposalComment;

/** SAML certificate information parsed from an IdP's metadata XML */
export type ParsedSamlCertInfo = {
  __typename?: 'ParsedSamlCertInfo';
  notAfter: Scalars['Timestamp']['output'];
  notBefore: Scalars['Timestamp']['output'];
  pem: Scalars['String']['output'];
  subjectDN: Scalars['String']['output'];
};

/** SAML metadata parsed from an IdP's metadata XML */
export type ParsedSamlIdpMetadata = {
  __typename?: 'ParsedSamlIdpMetadata';
  encryptionCerts: Array<ParsedSamlCertInfo>;
  entityId: Scalars['String']['output'];
  ssoUrl: Scalars['String']['output'];
  verificationCerts: Array<ParsedSamlCertInfo>;
  wantsSignedRequests: Scalars['Boolean']['output'];
};

export type ParsedSchemaCoordinate = {
  __typename?: 'ParsedSchemaCoordinate';
  argName?: Maybe<Scalars['String']['output']>;
  fieldName?: Maybe<Scalars['String']['output']>;
  isDirective?: Maybe<Scalars['Boolean']['output']>;
  typeName: Scalars['String']['output'];
};

/** The schema for a single published subgraph in Studio. */
export type PartialSchema = {
  __typename?: 'PartialSchema';
  /** Timestamp for when the partial schema was created */
  createdAt: Scalars['Timestamp']['output'];
  /** If this sdl is currently actively composed in the gateway, this is true */
  isLive: Scalars['Boolean']['output'];
  /** The subgraph schema document as SDL. */
  sdl: Scalars['String']['output'];
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
  hash?: InputMaybe<Scalars['String']['input']>;
  /**
   * Contents of the partial schema in SDL syntax, but may reference types
   * that aren't defined in this document
   */
  sdl?: InputMaybe<Scalars['String']['input']>;
};

/** An error that's returned when the current user doesn't have sufficient permissions to perform an action. */
export type PermissionError = Error & {
  __typename?: 'PermissionError';
  /** The error message. */
  message: Scalars['String']['output'];
};

/** Information about the act of publishing operations to the list */
export type PersistedQueriesPublish = {
  __typename?: 'PersistedQueriesPublish';
  operationCounts: PersistedQueriesPublishOperationCounts;
  publishedAt: Scalars['Timestamp']['output'];
};

export type PersistedQueriesPublishOperationCounts = {
  __typename?: 'PersistedQueriesPublishOperationCounts';
  /** The number of new operations added to the list by this publish. */
  added: Scalars['Int']['output'];
  /** The number of operations included in this publish whose metadata and body were unchanged from the previous list revision. */
  identical: Scalars['Int']['output'];
  /** The number of operations removed from the list by this publish. */
  removed: Scalars['Int']['output'];
  /** The number of operations in this list that were not mentioned by this publish. */
  unaffected: Scalars['Int']['output'];
  /** The number of operations whose metadata or body were changed by this publish. */
  updated: Scalars['Int']['output'];
};

export type PersistedQuery = {
  __typename?: 'PersistedQuery';
  body: Scalars['GraphQLDocument']['output'];
  /** An optional client name associated with the operation. Two operations with the same ID but different client names are treated as distinct operations. An operation with the same ID and a null client name is treated as a distinct operation as well. */
  clientName?: Maybe<Scalars['String']['output']>;
  firstPublishedAt: Scalars['Timestamp']['output'];
  /** An opaque identifier for this operation. For a given client name, this should map uniquely to an operation body; editing the body should generally result in a new ID. Apollo's tools generally use the lowercase hex SHA256 of the operation body. Note that for (eg) Apollo Client keyFields, you should use both `id` and `clientName`. */
  id: Scalars['ID']['output'];
  lastPublishedAt: Scalars['Timestamp']['output'];
  /** The GraphQL operation name for this operation. */
  name: Scalars['String']['output'];
  type: OperationType;
};

export type PersistedQueryConnection = {
  __typename?: 'PersistedQueryConnection';
  edges: Array<PersistedQueryEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PersistedQueryEdge = {
  __typename?: 'PersistedQueryEdge';
  cursor: Scalars['String']['output'];
  node: PersistedQuery;
};

/** Filter options for persisted query operations */
export type PersistedQueryFilterInput = {
  /** Only include operations whose client name is included in this list */
  clients?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Only include operations whose last published date is before or after the given date */
  lastPublishedAt?: InputMaybe<TimestampFilterInput>;
  /** Only include operations whose names contain this case-insensitive substring */
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Full identifier for an operation in a Persisted Query List. */
export type PersistedQueryIdInput = {
  /** An optional client name to associate with the operation. Two operations with the same ID but different client names are treated as distinct operations. An operation with the same ID and a null client name is treated as a distinct operation as well. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** An opaque identifier for this operation. For a given client name, this should map uniquely to an operation body; editing the body should generally result in a new ID. Apollo's tools generally use the lowercase hex SHA256 of the operation body. */
  id: Scalars['ID']['input'];
};

/** Operations to be published to the Persisted Query List. */
export type PersistedQueryInput = {
  /** The GraphQL document for this operation, including all necessary fragment definitions. */
  body: Scalars['GraphQLDocument']['input'];
  /** An optional client name to associate with the operation. Two operations with the same ID but different client names are treated as distinct operations. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** An opaque identifier for this operation. This should map uniquely to an operation body; editing the body should generally result in a new ID. Apollo's tools generally use the lowercase hex SHA256 of the operation body. */
  id: Scalars['ID']['input'];
  /** A name for the operation. Typically this is the name of the actual GraphQL operation in the body. This does not need to be unique within a Persisted Query List; as a client project evolves and its operations change, multiple operations with the same name (but different body and id) can be published. */
  name: Scalars['String']['input'];
  /** The operation's type. */
  type: OperationType;
};

/** A Persisted Query List for a graph. */
export type PersistedQueryList = {
  __typename?: 'PersistedQueryList';
  builds: PersistedQueryListBuildConnection;
  /** Distinct client names associated with all operations in this Persisted Query List, if any. */
  clientNames: StringConnection;
  createdAt: Scalars['Timestamp']['output'];
  createdBy?: Maybe<User>;
  /** The current build of this PQL. */
  currentBuild: PersistedQueryListBuild;
  description: Scalars['String']['output'];
  graph: Service;
  /** The immutable ID for this Persisted Query List. */
  id: Scalars['ID']['output'];
  lastUpdatedAt: Scalars['Timestamp']['output'];
  /** All variants linked to this Persisted Query List, if any. */
  linkedVariants: Array<GraphVariant>;
  /** The list's name; can be changed and does not need to be unique. */
  name: Scalars['String']['output'];
  operation?: Maybe<PersistedQuery>;
  /** All operations in this Persisted Query List, if any. */
  operations: PersistedQueryConnection;
};


/** A Persisted Query List for a graph. */
export type PersistedQueryListBuildsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A Persisted Query List for a graph. */
export type PersistedQueryListClientNamesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
};


/** A Persisted Query List for a graph. */
export type PersistedQueryListOperationArgs = {
  clientName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


/** A Persisted Query List for a graph. */
export type PersistedQueryListOperationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<PersistedQueryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<PersistedQuerySortInput>;
};

/** Information about a particular revision of the list, as produced by a particular publish. */
export type PersistedQueryListBuild = {
  __typename?: 'PersistedQueryListBuild';
  /** A unique ID for this build revision; primarily useful as a client cache ID. */
  id: Scalars['String']['output'];
  /** The persisted query list that this build built. */
  list: PersistedQueryList;
  /** The chunks that made up this build. We do not commit to keeping the full contents of older revisions indefinitely, so this may be null for suitably old revisions. */
  manifestChunks?: Maybe<Array<PersistedQueryListManifestChunk>>;
  /** Information about the publish operation that created this build. */
  publish: PersistedQueriesPublish;
  /** The revision of this Persisted Query List. Revision 0 is the initial empty list; each publish increments the revision by 1. */
  revision: Scalars['Int']['output'];
  /** The total number of operations in the list after this build. Compare to PersistedQueriesPublish.operationCounts. */
  totalOperationsInList: Scalars['Int']['output'];
};

export type PersistedQueryListBuildConnection = {
  __typename?: 'PersistedQueryListBuildConnection';
  edges: Array<PersistedQueryListBuildEdge>;
  pageInfo: PageInfo;
};

export type PersistedQueryListBuildEdge = {
  __typename?: 'PersistedQueryListBuildEdge';
  cursor: Scalars['String']['output'];
  node: PersistedQueryListBuild;
};

export type PersistedQueryListManifestChunk = {
  __typename?: 'PersistedQueryListManifestChunk';
  /** An immutable identifier for this particular chunk of a PQL. The contents referenced by this ID will never change. */
  id: Scalars['ID']['output'];
  json: Scalars['String']['output'];
  list: PersistedQueryList;
  /** The chunk can be downloaded from any of these URLs, which might be transient. */
  urls: Array<Scalars['String']['output']>;
};

export type PersistedQueryListMutation = {
  __typename?: 'PersistedQueryListMutation';
  /** Deletes this Persisted Query List. */
  delete: DeletePersistedQueryListResultOrError;
  /** Deletes operations from this Persisted Query List based on filter criteria, with the ability to exclude specific operations. */
  deleteOperationsByFilter: DeleteOperationsByFilterResultOrError;
  id: Scalars['ID']['output'];
  /** Updates this Persisted Query List by publishing a set of operations and removing other operations. Operations not mentioned remain in the list unchanged. */
  publishOperations: PublishOperationsResultOrError;
  /** Updates the name and/or description of the specified Persisted Query List. */
  updateMetadata: UpdatePersistedQueryListMetadataResultOrError;
};


export type PersistedQueryListMutationDeleteOperationsByFilterArgs = {
  exclude?: InputMaybe<Array<Scalars['ID']['input']>>;
  filter: PersistedQueryFilterInput;
};


export type PersistedQueryListMutationPublishOperationsArgs = {
  allowOverwrittenOperations?: InputMaybe<Scalars['Boolean']['input']>;
  operations?: InputMaybe<Array<PersistedQueryInput>>;
  remove?: InputMaybe<Array<PersistedQueryIdInput>>;
  removeOperations?: InputMaybe<Array<Scalars['ID']['input']>>;
};


export type PersistedQueryListMutationUpdateMetadataArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Columns available for sorting persisted query operations */
export enum PersistedQuerySortColumn {
  /** Sort by the first published date */
  FIRST_PUBLISHED_AT = 'FIRST_PUBLISHED_AT',
  /** Sort by the last published date */
  LAST_PUBLISHED_AT = 'LAST_PUBLISHED_AT',
  /** Sort by name */
  NAME = 'NAME'
}

/** Sort options for persisted query operations */
export type PersistedQuerySortInput = {
  /** The column to sort by */
  column: PersistedQuerySortColumn;
  /** The direction of sorting */
  direction: Ordering;
};

/** An error related to an organization's Apollo Studio plan. */
export type PlanError = {
  __typename?: 'PlanError';
  /** The error message. */
  message: Scalars['String']['output'];
};

/** GraphQL representation of an AWS private subgraph */
export type PrivateSubgraph = {
  __typename?: 'PrivateSubgraph';
  /** The cloud provider where the subgraph is hosted */
  cloudProvider: CloudProvider;
  /** The domain URL of the private subgraph */
  domainUrl?: Maybe<Scalars['String']['output']>;
  /** The name of the subgraph, if set */
  name?: Maybe<Scalars['String']['output']>;
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


export type PrivateSubgraphMutationSyncArgs = {
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
  message: Scalars['String']['output'];
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
  /**
   * A list of the activities for this proposal.
   * If first and last are not specified, defaults to 25. If one is specified there is a max allowed value of 50.
   */
  activities: ProposalActivityConnection;
  /** The variant this Proposal is under the hood. */
  backingVariant: GraphVariant;
  /** Can the current user can edit THIS proposal, either by authorship or role level */
  canEditProposal: Scalars['Boolean']['output'];
  changes: Array<ProposalChange>;
  comment?: Maybe<ProposalCommentResult>;
  createdAt: Scalars['Timestamp']['output'];
  /**
   * null if user is deleted, or if user removed from org
   * and others in the org no longer have access to this user's info
   */
  createdBy?: Maybe<Identity>;
  /** The description of this Proposal. */
  description: Scalars['String']['output'];
  descriptionUpdatedAt?: Maybe<Scalars['Timestamp']['output']>;
  descriptionUpdatedBy?: Maybe<Identity>;
  displayName: Scalars['String']['output'];
  /** A flag indicating if changes have been detected on the source variant. Will be false if proposal was created prior to the pull upstream feature release on Nov 15, 2024. */
  hasUpstreamChanges: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  implementedChanges: Array<ProposalImplementedChange>;
  /** True if only some of the changes in this proposal are currently published to the implementation variant */
  isPartiallyImplemented: Scalars['Boolean']['output'];
  latestRevision: ProposalRevision;
  mergeBaseCompositionId?: Maybe<Scalars['ID']['output']>;
  /**
   * Use mergedSdlWithConflicts instead.
   * @deprecated Use mergedSdlWithConflicts instead
   */
  mergedSdl: Array<SubgraphWithConflicts>;
  /** Returns a partially merged sdl string and list of conflicts in the sdl by merging the proposals's current sdl and the source variant's current sdl against the source variant's sdl at the time of the last merge or proposal creation. */
  mergedSdlWithConflicts?: Maybe<MergedSdlWithConflictsResult>;
  parentComments: Array<ParentProposalComment>;
  rebaseConflicts?: Maybe<RebaseConflictResult>;
  /**  null if user deleted or removed from org */
  requestedReviewers: Array<Maybe<ProposalRequestedReviewer>>;
  reviews: Array<ProposalReview>;
  revision?: Maybe<ProposalRevisionResult>;
  revisionHistory: ProposalRevisionHistoryResult;
  /** The variant this Proposal was cloned/sourced from. */
  sourceVariant: GraphVariant;
  status: ProposalStatus;
  updatedAt: Scalars['Timestamp']['output'];
  updatedBy?: Maybe<Identity>;
};


export type ProposalActivitiesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type ProposalCommentArgs = {
  id: Scalars['ID']['input'];
};


export type ProposalParentCommentsArgs = {
  filter?: InputMaybe<CommentFilter>;
};


export type ProposalRevisionArgs = {
  id: Scalars['ID']['input'];
};


export type ProposalRevisionHistoryArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  orderBy?: InputMaybe<ProposalRevisionHistoryOrder>;
};

export type ProposalActivity = {
  __typename?: 'ProposalActivity';
  activity?: Maybe<ProposalActivityAction>;
  createdAt: Scalars['Timestamp']['output'];
  createdBy?: Maybe<Identity>;
  id: Scalars['ID']['output'];
  target?: Maybe<ProposalActivityTarget>;
};

export enum ProposalActivityAction {
  /** When the system changes a Proposal's status back to OPEN from APPROVED when approvals drop below min approvals. */
  APPROVAL_WITHDRAWN = 'APPROVAL_WITHDRAWN',
  /** When the system changes a Proposal's status back to OPEN from APPROVED when a change is made after a proposal or review is approved. */
  APPROVAL_WITHDRAWN_ON_PUBLISH = 'APPROVAL_WITHDRAWN_ON_PUBLISH',
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
  totalCount: Scalars['Int']['output'];
};

export type ProposalActivityEdge = {
  __typename?: 'ProposalActivityEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  node?: Maybe<ProposalActivity>;
};

export type ProposalActivityTarget = ParentChangeProposalComment | ParentGeneralProposalComment | Proposal | ProposalFullImplementationProposalOrigin | ProposalFullImplementationVariantOrigin | ProposalPartialImplementationProposalOrigin | ProposalPartialImplementationVariantOrigin | ProposalReview | ProposalRevision;

export type ProposalChange = {
  __typename?: 'ProposalChange';
  diffItem: FlatDiffItem;
  implemented: Scalars['Boolean']['output'];
};

export enum ProposalChangeMismatchSeverity {
  ERROR = 'ERROR',
  OFF = 'OFF',
  WARN = 'WARN'
}

export type ProposalComment = {
  createdAt: Scalars['Timestamp']['output'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']['output']>;
};

export type ProposalCommentResult = NotFoundError | ParentChangeProposalComment | ParentGeneralProposalComment | ReplyChangeProposalComment | ReplyGeneralProposalComment | ReviewProposalComment;

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
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  /** the diff that was matched between the Proposal and the implementation target variant. TODO to deserialize this back into a DiffItem NEBULA-2726 */
  jsonDiff: Array<Scalars['String']['output']>;
  /** Revision containing a diff that fully implements this Proposal in the implementation target variant. */
  revision: ProposalRevision;
  /** the target variant this Proposal became implemented in. */
  variant: GraphVariant;
};

export type ProposalFullImplementationVariantOrigin = ProposalImplementation & {
  __typename?: 'ProposalFullImplementationVariantOrigin';
  /** the time this Proposal became implemented in the implementation target variant. */
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  /** the diff that was matched between the Proposal and the implementation target variant. TODO to deserialize this back into a DiffItem NEBULA-2726 */
  jsonDiff: Array<Scalars['String']['output']>;
  /** launch containing a diff that fully implements this Proposal in the implementation target variant. null if user does not have access to launches */
  launch?: Maybe<Launch>;
  /** the target variant this Proposal became implemented in. */
  variant: GraphVariant;
};

export type ProposalImplementation = {
  /** the time this Proposal became implemented in the implementation target variant. */
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  /** the diff that was matched between the Proposal and the implementation target variant */
  jsonDiff: Array<Scalars['String']['output']>;
  /** the target variant this Proposal became implemented in. */
  variant: GraphVariant;
};

export type ProposalImplementedChange = {
  __typename?: 'ProposalImplementedChange';
  diffItem: FlatDiffItem;
  launchId: Scalars['ID']['output'];
  subgraph: Scalars['String']['output'];
};

export enum ProposalLifecycleEvent {
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  REVISION_SAVED = 'REVISION_SAVED',
  STATUS_CHANGE = 'STATUS_CHANGE'
}

export type ProposalLifecycleSubscription = ChannelSubscription & {
  __typename?: 'ProposalLifecycleSubscription';
  /** The channels that will be notified on this subscription. */
  channels: Array<Channel>;
  /** The time when this ProposalLifecycleSubscription was created. */
  createdAt: Scalars['Timestamp']['output'];
  /** The Identity that created this ProposalLifecycleSubscription. null if the Identity has been deleted. */
  createdBy?: Maybe<Identity>;
  /** True if this ProposalLifecycleSubscription is actively sending notifications. */
  enabled: Scalars['Boolean']['output'];
  /** The ProposalLifecycleEvents that will trigger notifications on this subscription. */
  events: Array<ProposalLifecycleEvent>;
  id: Scalars['ID']['output'];
  /** The last time this subscription was updated, if never updated will be the createdAt time. */
  lastUpdatedAt: Scalars['Timestamp']['output'];
  /** The Identity that last updated this ProposalLifecycleSubscription, or the creator if no one has updated. null if the Identity has been deleted. */
  lastUpdatedBy?: Maybe<Identity>;
  /** Always null for ProposalLifecycleSubscription. */
  variant?: Maybe<Scalars['String']['output']>;
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
  /** Set the mergeBaseCompositionId of this Proposal, if it is null. Must be internal MDG user with sudo. */
  setMergeBaseCompositionId: SetMergeBaseCompositionIdResult;
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
export type ProposalMutationAddCommentArgs = {
  input: AddCommentInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationDeleteCommentArgs = {
  input: DeleteCommentInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationDeleteSubgraphArgs = {
  input: DeleteProposalSubgraphInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationEditCommentArgs = {
  input: EditCommentInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationPublishSubgraphsArgs = {
  input: PublishProposalSubgraphsInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationReRunCheckForRevisionArgs = {
  input: ReRunCheckForRevisionInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationSetMergeBaseCompositionIdArgs = {
  input: SetMergeBaseCompositionIdInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationUpdateDescriptionArgs = {
  input: UpdateDescriptionInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationUpdateDisplayNameArgs = {
  displayName: Scalars['String']['input'];
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationUpdateRequestedReviewersArgs = {
  input: UpdateRequestedReviewersInput;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationUpdateStatusArgs = {
  status: ProposalStatus;
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationUpdateUpdatedByInfoArgs = {
  timestamp: Scalars['Timestamp']['input'];
};


/** Mutations for editing GraphOS Schema Proposals. See documentation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals */
export type ProposalMutationUpsertReviewArgs = {
  input: UpsertReviewInput;
};

export type ProposalMutationResult = NotFoundError | PermissionError | ProposalMutation | ValidationError;

export type ProposalPartialImplementationProposalOrigin = ProposalImplementation & {
  __typename?: 'ProposalPartialImplementationProposalOrigin';
  /** the time this Proposal became partially implemented in the implementation target variant. */
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  /** the diff that was matched between the Proposal and the implementation target variant. TODO to deserialize this back into a DiffItem NEBULA-2726 */
  jsonDiff: Array<Scalars['String']['output']>;
  /** Revision containing a diff that partially implements this Proposal in the implementation target variant. */
  revision: ProposalRevision;
  /** the target variant this Proposal became partially implemented in. */
  variant: GraphVariant;
};

export type ProposalPartialImplementationVariantOrigin = ProposalImplementation & {
  __typename?: 'ProposalPartialImplementationVariantOrigin';
  /** the time this Proposal became partially implemented in the implementation target variant. */
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  /** the diff that was matched between the Proposal and the implementation target variant. TODO to deserialize this back into a DiffItem NEBULA-2726 */
  jsonDiff: Array<Scalars['String']['output']>;
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
  createdAt: Scalars['Timestamp']['output'];
  createdBy?: Maybe<Identity>;
  decision: ReviewDecision;
  id: Scalars['ID']['output'];
  isDismissed: Scalars['Boolean']['output'];
  updatedAt?: Maybe<Scalars['Timestamp']['output']>;
  updatedBy?: Maybe<Identity>;
};

export type ProposalRevision = {
  __typename?: 'ProposalRevision';
  /** On publish, checks are triggered on a proposal automatically. However, if an error occurred triggering a check on publish, we skip attempting the check to avoid blocking the publish from succeeding. This is the only case this field would be null. */
  checkWorkflow?: Maybe<CheckWorkflow>;
  createdAt: Scalars['Timestamp']['output'];
  createdBy?: Maybe<Identity>;
  id: Scalars['ID']['output'];
  isMerge: Scalars['Boolean']['output'];
  launch?: Maybe<Launch>;
  /** ID of the launch that this revision is associated with. For internal use only, correct schema usage would be to access through the Launch, but CONSUMER role has no access to launch, yet they need access to the schema publish. */
  launchId: Scalars['ID']['output'];
  /** Latest composition ID of the proposal's source variant at the time this revision was created. */
  mergeBaseCompositionId?: Maybe<Scalars['ID']['output']>;
  /** Latest launch of the proposal's source variant at the time this revision was created. */
  mergeBaseLaunch?: Maybe<Launch>;
  /** The schema publish of the proposal's source variant at the time this revision was created. Null if the launch is PENDING. */
  mergeBaseSchemaPublish?: Maybe<SchemaTag>;
  /** null if this is the first revision */
  previousRevision?: Maybe<ProposalRevision>;
  /** The schema publish for this revision. Null while the launch is PENDING. */
  schemaPublish?: Maybe<SchemaTag>;
  summary: Scalars['String']['output'];
};

export enum ProposalRevisionHistoryOrder {
  /** List revisions from oldest to newest. */
  CREATED_ASC = 'CREATED_ASC',
  /** List revisions from newest to oldest, default. */
  CREATED_DESC = 'CREATED_DESC'
}

export type ProposalRevisionHistoryResult = {
  __typename?: 'ProposalRevisionHistoryResult';
  revisions: Array<ProposalRevision>;
  /** This is the total number of revisions for the proposal, regardless of the size of the returned list. */
  totalCount: Scalars['Int']['output'];
};

export type ProposalRevisionResult = NotFoundError | ProposalRevision;

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
  errorMessages: Array<Scalars['String']['output']>;
};

export type ProposalVariantCreationResult = GraphVariant | ProposalVariantCreationErrors;

/** Filtering options for graph connections. */
export type ProposalVariantsFilter = {
  /** Only include proposals that were created with these variants as a base. */
  sourceVariants?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Only include proposals of a certain status. */
  status?: InputMaybe<Array<ProposalStatus>>;
  /** Only include proposals that have updated these subgraph names */
  subgraphs?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Proposal variants, limited & offset based on Service.proposalVariants & the total count */
export type ProposalVariantsResult = {
  __typename?: 'ProposalVariantsResult';
  /** The total number of proposal variants on this graph */
  totalCount: Scalars['Int']['output'];
  variants: Array<GraphVariant>;
};

export type ProposalsCheckTask = CheckWorkflowTask & {
  __typename?: 'ProposalsCheckTask';
  completedAt?: Maybe<Scalars['Timestamp']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  /** The results of this proposal check were overridden */
  didOverrideProposalsCheckTask: Scalars['Boolean']['output'];
  /** Diff items in this Check task. Will be empty list if hasExceededMaxDiffs is true. */
  diffs: Array<ProposalsCheckTaskDiff>;
  graphID: Scalars['ID']['output'];
  /** Indicates if the number of diffs in this check has exceeded the maximum allowed. null if this check was run before this field was added. */
  hasExceededMaxDiffs?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  /** Indicates the level of coverage a check's changeset is in approved Proposals. PENDING while Check is still running. */
  proposalCoverage: ProposalCoverage;
  /** Proposals with their state at the time the check was run associated to this check task. */
  relatedProposalResults: Array<RelatedProposalResult>;
  /** @deprecated use relatedProposalResults instead */
  relatedProposals: Array<Proposal>;
  /** The configured severity at the time the check was run. If the check failed, this is the severity that should be shown. While this Check is PENDING defaults to Service's severityLevel. */
  severityLevel: ProposalChangeMismatchSeverity;
  status: CheckWorkflowTaskStatus;
  targetURL?: Maybe<Scalars['String']['output']>;
  workflow: CheckWorkflow;
};

/** A diff item in this Check Task and their related Proposals. */
export type ProposalsCheckTaskDiff = {
  __typename?: 'ProposalsCheckTaskDiff';
  /** A diff item in this Check Task. */
  diffItem: FlatDiffItem;
  /** If this diff item is associated with an approved Proposal. */
  hasApprovedProposal: Scalars['Boolean']['output'];
  /** Proposals associated with this diff. */
  relatedProposalResults: Array<RelatedProposalResult>;
  /** The subgraph this diff belongs to. */
  subgraph: Scalars['String']['output'];
};

/** Filtering options for list of proposals. */
export type ProposalsFilterInput = {
  /** Only include proposals that were created with these variants as a base. */
  sourceVariants?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Only include proposals of a certain status. */
  status?: InputMaybe<Array<ProposalStatus>>;
  /** Only include proposals that have updated these subgraph names */
  subgraphs?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ProposalsMustBeApprovedByADefaultReviewerResult = PermissionError | Service | ValidationError;

/** Proposals, limited & offset based on Service.proposals & the total count */
export type ProposalsResult = {
  __typename?: 'ProposalsResult';
  /** The proposals on this graph. */
  proposals: Array<Proposal>;
  /** The total number of proposals on this graph */
  totalCount: Scalars['Int']['output'];
};

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
  name: Scalars['String']['output'];
  /** The SHA-256 of the schema document in this subgraph upsert. */
  schemaHash?: Maybe<Scalars['SHA256']['output']>;
};

export type ProposedFilterBuildInputChanges = {
  __typename?: 'ProposedFilterBuildInputChanges';
  /** The proposed new build pipeline track, or null if no such change was proposed. */
  buildPipelineTrackChange?: Maybe<BuildPipelineTrack>;
  /** Any proposed additions to exclude filters, or the empty list if no such changes were proposed. */
  excludeAdditions: Array<Scalars['String']['output']>;
  /** Any proposed removals to exclude filters, or the empty list if no such changes were proposed. */
  excludeRemovals: Array<Scalars['String']['output']>;
  /** The proposed value for whether to hide unreachable schema elements, or null if no such change was proposed. */
  hideUnreachableTypesChange?: Maybe<Scalars['Boolean']['output']>;
  /** Any proposed additions to include filters, or the empty list if no such changes were proposed. */
  includeAdditions: Array<Scalars['String']['output']>;
  /** Any proposed removals to include filters, or the empty list if no such changes were proposed. */
  includeRemovals: Array<Scalars['String']['output']>;
  /** The proposed new build pipeline track, or null if no such change was proposed. */
  supergraphSchemaHashChange?: Maybe<Scalars['SHA256']['output']>;
};

export type Protobuf = {
  __typename?: 'Protobuf';
  json: Scalars['String']['output'];
  object: Scalars['Object']['output'];
  raw: Scalars['Blob']['output'];
  text: Scalars['String']['output'];
};

/** The result of a successful call to PersistedQueryListMutation.publishOperations. */
export type PublishOperationsResult = {
  __typename?: 'PublishOperationsResult';
  /** The build created by this publish operation. */
  build: PersistedQueryListBuild;
  /** Returns `true` if no changes were made by this publish (and no new revision was created). Otherwise, returns `false`. */
  unchanged: Scalars['Boolean']['output'];
};

/** The result/error union returned by PersistedQueryListMutation.publishOperations. */
export type PublishOperationsResultOrError = CannotModifyOperationBodyError | PermissionError | PublishOperationsResult;

export type PublishProposalSubgraphResult = NotFoundError | PermissionError | Proposal | SchemaValidationError | ValidationError;

export type PublishProposalSubgraphsInput = {
  gitContext?: InputMaybe<GitContextInput>;
  /** Non null if this publish is a merge revision. The composition id of the source variant updated to. This is necessary to keep track of the last composition id this proposal is updated with. */
  mergeUpdateCompositionId?: InputMaybe<Scalars['ID']['input']>;
  previousLaunchId: Scalars['ID']['input'];
  revision: Scalars['String']['input'];
  subgraphInputs: Array<PublishSubgraphsSubgraphInput>;
  summary: Scalars['String']['input'];
};

/** The result attempting to publish subgraphs with async build. */
export type PublishSubgraphsAsyncBuildResult = {
  __typename?: 'PublishSubgraphsAsyncBuildResult';
  /** The Launch result part of this subgraph publish. */
  launch?: Maybe<Launch>;
  /** Human-readable text describing the launch result of the subgraph publish. */
  launchCliCopy?: Maybe<Scalars['String']['output']>;
  /** The URL of the Studio page for this update's associated launch, if available. */
  launchUrl?: Maybe<Scalars['String']['output']>;
};

export type PublishSubgraphsSubgraphInput = {
  activePartialSchema: PartialSchemaInput;
  name: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};

export type PushMarketoLeadInput = {
  /** Clearbit enriched LinkedIn URL */
  Clearbit_LinkedIn_URL__c?: InputMaybe<Scalars['String']['input']>;
  /** Company domain */
  Company_Domain__c?: InputMaybe<Scalars['String']['input']>;
  /** GDPR Explicit Opt in */
  Explicit_Opt_in__c?: InputMaybe<Scalars['Boolean']['input']>;
  /** Google Click ID */
  Google_Click_ID__c?: InputMaybe<Scalars['String']['input']>;
  /** GA Client ID */
  Google_User_ID__c?: InputMaybe<Scalars['String']['input']>;
  /** GraphQL Production Stage */
  GraphQL_Production_Stage__c?: InputMaybe<Scalars['String']['input']>;
  /** Job Function */
  Job_Function__c?: InputMaybe<Scalars['String']['input']>;
  /** Lead Message */
  Lead_Message__c?: InputMaybe<Scalars['String']['input']>;
  /** Lead Source Detail */
  Lead_Source_Detail__c?: InputMaybe<Scalars['String']['input']>;
  /** Lead Source Most Recent Detail */
  Lead_Source_Most_Recent_Detail__c?: InputMaybe<Scalars['String']['input']>;
  /** Lead Source Most Recent */
  Lead_Source_Most_Recent__c?: InputMaybe<Scalars['String']['input']>;
  /** Referrer */
  Referrer__c?: InputMaybe<Scalars['String']['input']>;
  /** Studio Organization ID */
  Studio_Organization_ID__c?: InputMaybe<Scalars['String']['input']>;
  /** Studio User Id */
  Studio_User_Id__c?: InputMaybe<Scalars['String']['input']>;
  /** UTM Campaign First Touch */
  UTM_Campaign_First_Touch__c?: InputMaybe<Scalars['String']['input']>;
  /** UTM Campaign */
  UTM_Campaign__c?: InputMaybe<Scalars['String']['input']>;
  /** UTM ICID */
  UTM_ICID__c?: InputMaybe<Scalars['String']['input']>;
  /** UTM Medium First Touch */
  UTM_Medium_First_Touch__c?: InputMaybe<Scalars['String']['input']>;
  /** UTM Medium */
  UTM_Medium__c?: InputMaybe<Scalars['String']['input']>;
  /** UTM Source First Touch */
  UTM_Source_First_Touch__c?: InputMaybe<Scalars['String']['input']>;
  /** UTM Source */
  UTM_Source__c?: InputMaybe<Scalars['String']['input']>;
  /** UTM Term */
  UTM_Term__c?: InputMaybe<Scalars['String']['input']>;
  /** Company name */
  company?: InputMaybe<Scalars['String']['input']>;
  /** Country */
  country?: InputMaybe<Scalars['String']['input']>;
  /** Email address */
  email?: InputMaybe<Scalars['String']['input']>;
  /** First name */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Is Graph Champion */
  isGraphChampion?: InputMaybe<Scalars['Boolean']['input']>;
  /** Last name */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Notes Import */
  notesImport?: InputMaybe<Scalars['String']['input']>;
  /** Phone number */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** UTM Campaign Capture Mkto Only */
  uTMCampaignCaptureMktoOnly?: InputMaybe<Scalars['String']['input']>;
  /** UTM ICID Capture Mkto Only */
  uTMICIDCaptureMktoOnly?: InputMaybe<Scalars['String']['input']>;
  /** UTM Medium Capture Mkto Only */
  uTMMediumCaptureMktoOnly?: InputMaybe<Scalars['String']['input']>;
  /** UTM Source Capture Mkto Only */
  uTMSourceCaptureMktoOnly?: InputMaybe<Scalars['String']['input']>;
  /** UTM Term Capture Mkto Only */
  uTMTermCaptureMktoOnly?: InputMaybe<Scalars['String']['input']>;
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
  accountIDAvailable: Scalars['Boolean']['output'];
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
  billingAdmin?: Maybe<BillingAdminQuery>;
  /** Retrieves all past and current subscriptions for an account, even if the account has been deleted */
  billingSubscriptionHistory: Array<Maybe<BillingSubscription>>;
  billingTier?: Maybe<BillingTier>;
  /** If this is true, the user is an Apollo administrator who can ignore restrictions based purely on billing plan. */
  canBypassPlanRestrictions: Scalars['Boolean']['output'];
  /** Cloud queries */
  cloud: Cloud;
  cloudTesting: CloudTesting;
  /** Escaped JSON string of the public key used for verifying entitlement JWTs */
  commercialRuntimePublicKey: Scalars['String']['output'];
  diffSchemas: Array<Change>;
  /** Get the unsubscribe settings for a given email. */
  emailPreferences?: Maybe<EmailPreferences>;
  /** Past and current enterprise trial accounts */
  enterpriseTrialAccounts?: Maybe<Array<Account>>;
  /** Returns the root URL of the Apollo Studio frontend. */
  frontendUrlRoot: Scalars['String']['output'];
  /** Returns details of the graph with the provided ID. */
  graph?: Maybe<Service>;
  internalActiveCronJobs: Array<CronJob>;
  internalAdminUsers?: Maybe<Array<InternalAdminUser>>;
  internalUnresolvedCronExecutionFailures: Array<CronExecution>;
  /** Returns details of the authenticated `User` or `Graph` executing this query. If this is an unauthenticated query (i.e., no API key is provided), this field returns null. */
  me?: Maybe<Identity>;
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
  transformSchemaForPlatformApi?: Maybe<Scalars['GraphQLDocument']['output']>;
  /** Returns details of the Apollo user with the provided ID. */
  user?: Maybe<User>;
  /** Returns details of the Apollo users with the provided IDs. */
  users?: Maybe<Array<User>>;
  /** Returns details of a Studio graph variant with the provided graph ref. A graph ref has the format `graphID@variantName` (or just `graphID` for the default variant `current`). Returns null if the graph or variant doesn't exist, or if the graph isn't accessible by the current actor. */
  variant?: Maybe<GraphVariantLookup>;
};


/** Queries defined by this subgraph */
export type QueryAccountArgs = {
  id: Scalars['ID']['input'];
};


/** Queries defined by this subgraph */
export type QueryAccountByBillingCodeArgs = {
  id: Scalars['ID']['input'];
};


/** Queries defined by this subgraph */
export type QueryAccountByInternalIdArgs = {
  id: Scalars['ID']['input'];
};


/** Queries defined by this subgraph */
export type QueryAccountIdAvailableArgs = {
  id: Scalars['ID']['input'];
};


/** Queries defined by this subgraph */
export type QueryAllAccountsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  tier?: InputMaybe<BillingPlanTier>;
};


/** Queries defined by this subgraph */
export type QueryAllServicesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


/** Queries defined by this subgraph */
export type QueryAllUsersArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


/** Queries defined by this subgraph */
export type QueryBillingSubscriptionHistoryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** Queries defined by this subgraph */
export type QueryBillingTierArgs = {
  tier: BillingPlanTier;
};


/** Queries defined by this subgraph */
export type QueryDiffSchemasArgs = {
  baseSchema: Scalars['String']['input'];
  nextSchema: Scalars['String']['input'];
};


/** Queries defined by this subgraph */
export type QueryEmailPreferencesArgs = {
  email: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


/** Queries defined by this subgraph */
export type QueryGraphArgs = {
  id: Scalars['ID']['input'];
};


/** Queries defined by this subgraph */
export type QueryOdysseyCertificationArgs = {
  id: Scalars['ID']['input'];
};


/** Queries defined by this subgraph */
export type QueryOperationCollectionArgs = {
  id: Scalars['ID']['input'];
};


/** Queries defined by this subgraph */
export type QueryOperationCollectionEntriesArgs = {
  collectionEntryIds: Array<Scalars['ID']['input']>;
};


/** Queries defined by this subgraph */
export type QueryOrganizationArgs = {
  id: Scalars['ID']['input'];
};


/** Queries defined by this subgraph */
export type QueryPlanArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** Queries defined by this subgraph */
export type QueryProposalArgs = {
  id: Scalars['ID']['input'];
};


/** Queries defined by this subgraph */
export type QuerySearchAccountsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


/** Queries defined by this subgraph */
export type QueryServiceArgs = {
  id: Scalars['ID']['input'];
};


/** Queries defined by this subgraph */
export type QueryStatsArgs = {
  from: Scalars['Timestamp']['input'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']['input']>;
};


/** Queries defined by this subgraph */
export type QueryTransformSchemaForPlatformApiArgs = {
  baseSchema: Scalars['GraphQLDocument']['input'];
};


/** Queries defined by this subgraph */
export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


/** Queries defined by this subgraph */
export type QueryUsersArgs = {
  ids: Array<Scalars['ID']['input']>;
};


/** Queries defined by this subgraph */
export type QueryVariantArgs = {
  ref: Scalars['ID']['input'];
};

/** query documents to validate against */
export type QueryDocumentInput = {
  document?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPlan = {
  __typename?: 'QueryPlan';
  json: Scalars['String']['output'];
  object: Scalars['Object']['output'];
  text: Scalars['String']['output'];
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
  PERSISTED_QUERY_ID = 'PERSISTED_QUERY_ID',
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
  accountId?: Maybe<Scalars['ID']['output']>;
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  fromEngineproxy?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  persistedQueryId?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  querySignature?: Maybe<Scalars['String']['output']>;
  querySignatureLength?: Maybe<Scalars['Int']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in QueryStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type QueryStatsFilter = {
  /** Selects rows whose accountId dimension equals the given value if not null. To query for the null value, use {in: {accountId: [null]}} instead. */
  accountId?: InputMaybe<Scalars['ID']['input']>;
  and?: InputMaybe<Array<QueryStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose fromEngineproxy dimension equals the given value if not null. To query for the null value, use {in: {fromEngineproxy: [null]}} instead. */
  fromEngineproxy?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<QueryStatsFilterIn>;
  not?: InputMaybe<QueryStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<QueryStatsFilter>>;
  /** Selects rows whose persistedQueryId dimension equals the given value if not null. To query for the null value, use {in: {persistedQueryId: [null]}} instead. */
  persistedQueryId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in QueryStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type QueryStatsFilterIn = {
  /** Selects rows whose accountId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  accountId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose fromEngineproxy dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fromEngineproxy?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose persistedQueryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  persistedQueryId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type QueryStatsMetrics = {
  __typename?: 'QueryStatsMetrics';
  cacheTtlHistogram: DurationHistogram;
  cachedHistogram: DurationHistogram;
  cachedRequestsCount: Scalars['Long']['output'];
  forbiddenOperationCount: Scalars['Long']['output'];
  registeredOperationCount: Scalars['Long']['output'];
  requestsWithErrorsCount: Scalars['Long']['output'];
  totalLatencyHistogram: DurationHistogram;
  totalRequestCount: Scalars['Long']['output'];
  uncachedHistogram: DurationHistogram;
  uncachedRequestsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

/** Query Trigger */
export type QueryTrigger = ChannelSubscription & {
  __typename?: 'QueryTrigger';
  channels: Array<Channel>;
  comparisonOperator: ComparisonOperator;
  enabled: Scalars['Boolean']['output'];
  excludedOperationNames: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metric: QueryTriggerMetric;
  operationNames: Array<Scalars['String']['output']>;
  percentile?: Maybe<Scalars['Float']['output']>;
  scope: QueryTriggerScope;
  serviceId: Scalars['String']['output'];
  state: QueryTriggerState;
  threshold: Scalars['Float']['output'];
  variant?: Maybe<Scalars['String']['output']>;
  window: QueryTriggerWindow;
};

/** Query trigger */
export type QueryTriggerInput = {
  channelIds?: InputMaybe<Array<Scalars['String']['input']>>;
  comparisonOperator: ComparisonOperator;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  excludedOperationNames?: InputMaybe<Array<Scalars['String']['input']>>;
  metric: QueryTriggerMetric;
  operationNames?: InputMaybe<Array<Scalars['String']['input']>>;
  percentile?: InputMaybe<Scalars['Float']['input']>;
  scope?: InputMaybe<QueryTriggerScope>;
  threshold: Scalars['Float']['input'];
  variant?: InputMaybe<Scalars['String']['input']>;
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
  evaluatedAt: Scalars['Timestamp']['output'];
  lastTriggeredAt?: Maybe<Scalars['Timestamp']['output']>;
  operations: Array<QueryTriggerStateOperation>;
  triggered: Scalars['Boolean']['output'];
};

export type QueryTriggerStateOperation = {
  __typename?: 'QueryTriggerStateOperation';
  count: Scalars['Long']['output'];
  operation: Scalars['String']['output'];
  triggered: Scalars['Boolean']['output'];
  value: Scalars['Float']['output'];
};

export enum QueryTriggerWindow {
  FIFTEEN_MINUTES = 'FIFTEEN_MINUTES',
  FIVE_MINUTES = 'FIVE_MINUTES',
  ONE_MINUTE = 'ONE_MINUTE',
  UNRECOGNIZED = 'UNRECOGNIZED'
}

/** Result of calling a test request to a custom check endpoint. */
export type QueueTestCustomChecksRequestResult = GraphVariant | PermissionError | ValidationError;

export type QueueTestProposalLifecycleNotificationError = {
  __typename?: 'QueueTestProposalLifecycleNotificationError';
  message: Scalars['String']['output'];
};

export type QueueTestProposalLifecycleNotificationInput = {
  channelId: Scalars['ID']['input'];
  subscriptionId: Scalars['ID']['input'];
};

export type QueueTestProposalLifecycleNotificationResult = NotFoundError | PermissionError | QueueTestProposalLifecycleNotificationError | QueueTestProposalLifecycleNotificationSuccess | ValidationError;

export type QueueTestProposalLifecycleNotificationSuccess = {
  __typename?: 'QueueTestProposalLifecycleNotificationSuccess';
  queued?: Maybe<Scalars['Boolean']['output']>;
};

export type RateLimit = {
  __typename?: 'RateLimit';
  count: Scalars['Long']['output'];
  durationMs: Scalars['Long']['output'];
};

/** An error that occurs when the rate limit on this operation has been exceeded. */
export type RateLimitExceededError = {
  __typename?: 'RateLimitExceededError';
  /** The error message. */
  message: Scalars['String']['output'];
};

export type ReRunCheckForRevisionInput = {
  revisionId: Scalars['ID']['input'];
};

export type ReRunCheckForRevisionResult = NotFoundError | PermissionError | Proposal | ValidationError;

/** The README documentation for a graph variant, which is displayed in Studio. */
export type Readme = {
  __typename?: 'Readme';
  /** The contents of the README in plaintext. */
  content: Scalars['String']['output'];
  /** The README's unique ID. `a15177c0-b003-4837-952a-dbfe76062eb1` for the default README */
  id: Scalars['ID']['output'];
  /**
   * The timestamp when the README was most recently updated. `1970-01-01T00:00:00Z` for the default README
   * @deprecated Deprecated in favour of lastUpdatedTime
   */
  lastUpdatedAt: Scalars['Timestamp']['output'];
  /** The actor that most recently updated the README (usually a `User`). `null` for the default README, or if the `User` was deleted. */
  lastUpdatedBy?: Maybe<Identity>;
  /** The timestamp when the README was most recently updated. `null` for the default README */
  lastUpdatedTime?: Maybe<Scalars['Timestamp']['output']>;
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

export type RebaseConflict = {
  __typename?: 'RebaseConflict';
  location?: Maybe<ParsedSchemaCoordinate>;
  message?: Maybe<Scalars['String']['output']>;
};

export type RebaseConflictData = {
  __typename?: 'RebaseConflictData';
  conflicts: Array<RebaseConflict>;
  count: Scalars['Int']['output'];
};

export type RebaseConflictResult = NotFoundError | RebaseConflictData | SchemaValidationError;

export type RecentPage = {
  __typename?: 'RecentPage';
  timestamp: Scalars['Timestamp']['output'];
  url: Scalars['String']['output'];
};

/** Details of account data stored in Recurly */
export type RecurlyAccountDetails = {
  __typename?: 'RecurlyAccountDetails';
  accountCode: Scalars['String']['output'];
  createdAt: Scalars['Timestamp']['output'];
};

/** Description for a Cloud Router region */
export type RegionDescription = {
  __typename?: 'RegionDescription';
  /** Region identifier */
  code: Scalars['String']['output'];
  /** Country of the region, in ISO 3166-1 alpha-2 code */
  country: Scalars['String']['output'];
  /** Full name of the region */
  name: Scalars['String']['output'];
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
  registrationSuccess: Scalars['Boolean']['output'];
};

export type RegisteredClientIdentityInput = {
  identifier: Scalars['String']['input'];
  name: Scalars['String']['input'];
  version?: InputMaybe<Scalars['String']['input']>;
};

export type RegisteredOperation = {
  __typename?: 'RegisteredOperation';
  signature: Scalars['ID']['output'];
};

export type RegisteredOperationInput = {
  document?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<RegisteredOperationMetadataInput>;
  signature: Scalars['ID']['input'];
};

export type RegisteredOperationMetadataInput = {
  /** This will be used to link existing records in Engine to a new ID. */
  engineSignature?: InputMaybe<Scalars['String']['input']>;
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
  createdAt: Scalars['Timestamp']['output'];
  enabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  lastUpdatedAt: Scalars['Timestamp']['output'];
  options: SubscriptionOptions;
  variant?: Maybe<Scalars['String']['output']>;
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
  updated: Scalars['Boolean']['output'];
};

export type RelaunchError = {
  __typename?: 'RelaunchError';
  message: Scalars['String']['output'];
};

export type RelaunchResult = RelaunchComplete | RelaunchError;

export type RemoveOperationCollectionEntryResult = OperationCollection | PermissionError;

export type RemoveOperationCollectionFromVariantResult = GraphVariant | NotFoundError | PermissionError | ValidationError;

export type ReorderOperationCollectionResult = OperationCollection | PermissionError;

export type ReplaceReviewersWithDefaultReviewersResult = PermissionError | Proposal | ValidationError;

export type ReplyChangeProposalComment = ChangeProposalComment & ProposalComment & {
  __typename?: 'ReplyChangeProposalComment';
  createdAt: Scalars['Timestamp']['output'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  /** true if the schemaCoordinate this comment is on doesn't exist in the diff between the most recent revision & the base sdl */
  outdated: Scalars['Boolean']['output'];
  schemaCoordinate: Scalars['String']['output'];
  /** '#@!api!@#' for api schema, '#@!supergraph!@#' for supergraph schema, subgraph otherwise */
  schemaScope: Scalars['String']['output'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']['output']>;
};

export type ReplyGeneralProposalComment = GeneralProposalComment & ProposalComment & {
  __typename?: 'ReplyGeneralProposalComment';
  createdAt: Scalars['Timestamp']['output'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']['output']>;
};

export type ReportSchemaError = ReportSchemaResult & {
  __typename?: 'ReportSchemaError';
  code: ReportSchemaErrorCode;
  inSeconds: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  withCoreSchema: Scalars['Boolean']['output'];
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
  inSeconds: Scalars['Int']['output'];
  withCoreSchema: Scalars['Boolean']['output'];
};

export type ReportSchemaResult = {
  inSeconds: Scalars['Int']['output'];
  withCoreSchema: Scalars['Boolean']['output'];
};

export type ReportServerInfoError = ReportServerInfoResult & {
  __typename?: 'ReportServerInfoError';
  code: ReportSchemaErrorCode;
  inSeconds: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  withExecutableSchema: Scalars['Boolean']['output'];
};

export type ReportServerInfoResponse = ReportServerInfoResult & {
  __typename?: 'ReportServerInfoResponse';
  inSeconds: Scalars['Int']['output'];
  withExecutableSchema: Scalars['Boolean']['output'];
};

export type ReportServerInfoResult = {
  inSeconds: Scalars['Int']['output'];
  withExecutableSchema: Scalars['Boolean']['output'];
};

export type RequestCountsPerGraphVariant = {
  __typename?: 'RequestCountsPerGraphVariant';
  cachedRequestsCount: Scalars['Long']['output'];
  graphID: Scalars['String']['output'];
  uncachedRequestsCount: Scalars['Long']['output'];
  variant?: Maybe<Scalars['String']['output']>;
};

export type RerunAsyncInput = {
  sourceVariant?: InputMaybe<Scalars['String']['input']>;
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
  createdAt: Scalars['Timestamp']['output'];
  /** null if the user is deleted */
  createdBy?: Maybe<Identity>;
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  status: CommentStatus;
  /** null if never updated */
  updatedAt?: Maybe<Scalars['Timestamp']['output']>;
};

export type RoleOverride = {
  __typename?: 'RoleOverride';
  /** @deprecated RoleOverride can only be queried via a Graph, so any fields here should instead be selected via the parent object. */
  graph: Service;
  lastUpdatedAt: Scalars['Timestamp']['output'];
  role: UserPermission;
  user: User;
};

export type Router = {
  __typename?: 'Router';
  /** Capabilities for this Cloud Router */
  capabilities?: Maybe<RouterCapabilities>;
  /** Constants for Cloud Routers */
  constants: CloudConstants;
  /** Date when the Cloud Router was created */
  createdAt: Scalars['NaiveDateTime']['output'];
  /** Order currently modifying this Cloud Router */
  currentOrder?: Maybe<Order>;
  /**
   * Custom URLs that can be used to reach the Cloud Router
   *
   * This will be null if the Cloud Router is in a deleted status or does not support custom
   * domains.
   * @deprecated use Router.endpoints instead
   */
  customDomains?: Maybe<Array<Scalars['String']['output']>>;
  /** Set of endpoints that can be used to reach a Cloud Router */
  endpoints: RouterEndpoints;
  /**
   * Number of Graph Compute Units (GCUs) associated with this Cloud Router
   *
   * This value is not present for Cloud Routers on the `SERVERLESS` tier.
   */
  gcus?: Maybe<Scalars['Int']['output']>;
  /** Return the GraphVariant associated with this Router */
  graphVariant?: Maybe<GraphVariant>;
  /** graphRef representing the Cloud Router */
  id: Scalars['ID']['output'];
  /** Internal identifier for a Cloud Router */
  internalId?: Maybe<Scalars['ID']['output']>;
  /**
   * Cloud Router version applied for the next launch
   *
   * If this value is not null, any subsequent launch will use this version instead of the
   * current one. This can happen when a new STABLE version is available, but we could not
   * automatically update this Cloud Router, for example due to configuration issues.
   */
  nextRouterVersion?: Maybe<RouterVersion>;
  /**
   * The next scheduled router status, useful for telling when a router will be transitioning in
   * the near future to another staus. If no change in status is scheduled, this field will be
   * null
   */
  nextStatus?: Maybe<RouterStatus>;
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
  routerUrl?: Maybe<Scalars['String']['output']>;
  /**
   * Current version of the Cloud Router
   *
   * This will be null if the Cloud Router is in a deleted status.
   */
  routerVersion?: Maybe<RouterVersion>;
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
  updatedAt?: Maybe<Scalars['NaiveDateTime']['output']>;
};


export type RouterOrderArgs = {
  orderId: Scalars['ID']['input'];
};


export type RouterOrdersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type RouterAdminMutation = {
  __typename?: 'RouterAdminMutation';
  /** Pre-create a custom domain for this Cloud Router, but don't enable routing yet */
  preCreateCustomDomain: RouterPreCreateDomainResult;
  /** Override the lastTraffic for Serverless Cloud Routers */
  setLastTraffic: RouterSetLastTrafficResult;
  /** Update the Cloud Router state so it will display a `nextStatus` value */
  setNextStatus: RouterSetNextStatusResult;
  /** Sleep this Cloud Router */
  sleep: RouterSleepResult;
  /** Wake up this Cloud Router */
  wakeUp: RouterWakeUpResult;
};


export type RouterAdminMutationPreCreateCustomDomainArgs = {
  customDomain: Scalars['String']['input'];
};


export type RouterAdminMutationSetLastTrafficArgs = {
  lastTraffic: Scalars['NaiveDateTime']['input'];
};


export type RouterAdminMutationSetNextStatusArgs = {
  nextStatus: RouterStatus;
};

/** Capabilities for this Cloud Router */
export type RouterCapabilities = {
  __typename?: 'RouterCapabilities';
  /** This Cloud Router can router traffic from custom domains */
  customDomains: Scalars['Boolean']['output'];
  /** This Cloud Router supports using a custom path */
  customPath: Scalars['Boolean']['output'];
  /** This Cloud Router supports getting and settings GCUs */
  gcus: Scalars['Boolean']['output'];
  /** This Cloud Router can use private subgraphs */
  privateSubgraphs: Scalars['Boolean']['output'];
};

/** Router configuration input */
export type RouterConfigInput = {
  /**
   * Number of GCUs allocated for the Cloud Router
   *
   * This is ignored for serverless Cloud Routers
   */
  gcus?: InputMaybe<Scalars['Int']['input']>;
  /** Graph composition ID, also known as launch ID */
  graphCompositionId?: InputMaybe<Scalars['String']['input']>;
  /** Configuration for the Cloud Router */
  routerConfig?: InputMaybe<Scalars['String']['input']>;
  /** Router version for the Cloud Router */
  routerVersion?: InputMaybe<Scalars['String']['input']>;
};

export type RouterConfigVersion = {
  __typename?: 'RouterConfigVersion';
  /** JSON schema for validating the router configuration */
  configSchema?: Maybe<Scalars['String']['output']>;
  /** Name of the RouterConfigVersion */
  name: Scalars['String']['output'];
};

/** Input to create a RouterConfigVersion */
export type RouterConfigVersionInput = {
  /** Configuration schema mapping for the RouterConfigVersion */
  configSchema: Scalars['String']['input'];
  /** Name of the RouterConfigVersion */
  configVersion: Scalars['String']['input'];
};

/**
 * List of endpoints for Cloud Router
 *
 * ## Endpoint states
 *
 * If a Router is in the `DELETED` state, all the fields on this object will return `null`.
 *
 * For all other states, this table list all the possible valid states, and the mutations that can
 * be performed on them.
 *
 * | Default Enabled? | Primary Endpoint | Custom Endpoints | Allowed endpoint mutations                                           |
 * | Yes              | Default          | null             | N/A (this Router does not support custom endpoints)                  |
 * | Yes              | Default          | []               | addCustomDomain, enableDefaultEndpoint, resetPrimaryEndpoint         |
 * | Yes              | Default          | ["1", "2", "3"]  | addCustomDomain, enableDefaultEndpoint, removeCustomDomain("1", "2", or "3"), resetPrimaryEndpoint, setPrimaryEndpoint ("1", "2", or "3") |
 * | Yes              | Custom 1         | ["1", "2", "3"]  | addCustomDomain, disableDefaultEndpoint, enableDefaultEndpoint, removeCustomDomain("2" or "3"), resetPrimaryEndpoint, setPrimaryEndpoint ("1", "2", or "3") |
 * | No               | Custom 1         | ["1", "2", "3"]  | addCustomDomain, disableDefaultEndpoint, enableDefaultEndpoint, removeCustomDomain("2" or "3"), setPrimaryEndpoint ("1", "2", or "3") |
 */
export type RouterEndpoints = {
  __typename?: 'RouterEndpoints';
  /**
   * Set of custom Cloud Router endpoints
   *
   * This is null if the cloud router is in a deleted state, or if it does not support
   * custom endpoints.
   */
  custom?: Maybe<Array<Scalars['String']['output']>>;
  /**
   * Default Cloud Router endpoint
   *
   * This is null if the cloud router is in a deleted state.
   */
  default?: Maybe<Scalars['String']['output']>;
  /**
   * Whether the default Cloud Router endpoint is enabled
   *
   * If the default endpoint is not enabled (`false`), this Cloud Router cannot receive traffic
   * on the default endpoint.
   *
   * This is null if the cloud router is in a deleted state.
   */
  defaultEnabled?: Maybe<Scalars['Boolean']['output']>;
  /**
   * Primary Cloud Router endpoint
   *
   * This is null if the cloud router is in a deleted state.
   */
  primary?: Maybe<Scalars['String']['output']>;
};

/** Represents the possible outcomes of an endpoint mutation */
export type RouterEndpointsResult = InternalServerError | InvalidInputErrors | RouterEndpointsSuccess;

/** Successe branch of  an addEndpoint or removeEndpoint mutation */
export type RouterEndpointsSuccess = {
  __typename?: 'RouterEndpointsSuccess';
  endpoints: RouterEndpoints;
};

export type RouterEntitlement = {
  __typename?: 'RouterEntitlement';
  /** The id of the account this license was generated for. */
  accountId: Scalars['String']['output'];
  /** Which audiences this license applies to. */
  audience: Array<RouterEntitlementAudience>;
  /** Router will stop serving requests after this time if commercial features are in use. */
  haltAt?: Maybe<Scalars['Timestamp']['output']>;
  /** RFC 8037 Ed25519 JWT signed representation of sibling fields. Restricted to internal services only. */
  jwt: Scalars['String']['output'];
  /** Organization this license applies to. */
  subject: Scalars['String']['output'];
  throughputLimit?: Maybe<RateLimit>;
  /** Router will warn users after this time if commercial features are in use. */
  warnAt?: Maybe<Scalars['Timestamp']['output']>;
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
  addCustomDomain: RouterEndpointsResult;
  /** Admin mutations for this Router */
  admin: RouterAdminMutation;
  /**
   * Disable the default endpoint
   *
   * This mutation will only work if the Router is not in a DELETED state and the default
   * endpoint is not the primary endpoint.
   */
  disableDefaultEndpoint: RouterEndpointsResult;
  /**
   * Enable the default endpoint
   *
   * This mutation will only work if the Router is not in a DELETED state
   */
  enableDefaultEndpoint: RouterEndpointsResult;
  /** Remove a custom domain for this Cloud Router */
  removeCustomDomain: RouterEndpointsResult;
  /**
   * Reset the primary endpoint to the default endpoint
   *
   * This mutation will only work if the Router is not in a DELETED state, and the default
   * endpoint is enabled.
   */
  resetPrimaryEndpoint: RouterEndpointsResult;
  /** Set a custom path for this Router */
  setCustomPath: RouterPathResult;
  /** Set the number of GCUs associated with this Router */
  setGcus: RouterGcusResult;
  /** Set the version used for the next update for this Cloud Router */
  setNextVersion: SetNextVersionResult;
  /**
   * Set the primary endpoint to a custom endpoint
   *
   * This mutation will only work if the Router is not in a DELETED state, and the primary
   * endpoint correspond to the full endpoint name (e.g. `https://api.mycompany.com/graphql`) of
   * an existing custom endpoint.
   */
  setPrimaryEndpoint: RouterEndpointsResult;
  /** Set secrets for this Cloud Router */
  setSecrets: RouterSecretsResult;
  /**
   * Sleep this Cloud Router
   * @deprecated use Router.admin.sleep instead
   */
  sleep: RouterSleepResult;
};


export type RouterMutationAddCustomDomainArgs = {
  customDomain: Scalars['String']['input'];
};


export type RouterMutationRemoveCustomDomainArgs = {
  customDomain: Scalars['String']['input'];
};


export type RouterMutationSetCustomPathArgs = {
  path: Scalars['String']['input'];
};


export type RouterMutationSetGcusArgs = {
  gcus: Scalars['Int']['input'];
};


export type RouterMutationSetNextVersionArgs = {
  version: Scalars['String']['input'];
};


export type RouterMutationSetPrimaryEndpointArgs = {
  endpoint: Scalars['String']['input'];
};


export type RouterMutationSetSecretsArgs = {
  input: RouterSecretsInput;
};

/** Represents the possible outcomes of a setCustomPath mutation */
export type RouterPathResult = InternalServerError | InvalidInputErrors | RouterPathSuccess;

/** Success branch of a setCustomPath mutation */
export type RouterPathSuccess = {
  __typename?: 'RouterPathSuccess';
  endpoints: RouterEndpoints;
  order: Order;
};

/** "Represents the possible outcomes of a ", RouterPreCreateDomain, " mutation" */
export type RouterPreCreateDomainResult = InternalServerError | InvalidInputErrors | RouterPreCreateDomainSuccess;

/** Success branch of a preCreateCustomDomain mutation */
export type RouterPreCreateDomainSuccess = {
  __typename?: 'RouterPreCreateDomainSuccess';
  success: Scalars['Boolean']['output'];
};

/** User input for a RouterSecrets mutation */
export type RouterSecretsInput = {
  /** Secrets to create or update */
  secrets?: InputMaybe<Array<SecretInput>>;
  /** Secrets to remove */
  unsetSecrets?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Represents the possible outcomes of a RouterSecrets mutation */
export type RouterSecretsResult = InternalServerError | InvalidInputErrors | RouterSecretsSuccess;

/** Success branch of a RouterSecrets mutation. */
export type RouterSecretsSuccess = {
  __typename?: 'RouterSecretsSuccess';
  order: Order;
  secrets: Array<Secret>;
};

/** "Represents the possible outcomes of a ", RouterSetLastTraffic, " mutation" */
export type RouterSetLastTrafficResult = InternalServerError | InvalidInputErrors | RouterSetLastTrafficSuccess;

/** Success branch of a setLastTraffic mutation */
export type RouterSetLastTrafficSuccess = {
  __typename?: 'RouterSetLastTrafficSuccess';
  success: Scalars['Boolean']['output'];
};

/** "Represents the possible outcomes of a ", RouterSetNextStatus, " mutation" */
export type RouterSetNextStatusResult = InternalServerError | InvalidInputErrors | RouterSetNextStatusSuccess;

/** Success branch of a setNextStatus mutation */
export type RouterSetNextStatusSuccess = {
  __typename?: 'RouterSetNextStatusSuccess';
  success: Scalars['Boolean']['output'];
};

/** "Represents the possible outcomes of a ", RouterSleep, " mutation" */
export type RouterSleepResult = InternalServerError | InvalidInputErrors | RouterSleepSuccess;

/** Success branch of a sleep mutation */
export type RouterSleepSuccess = {
  __typename?: 'RouterSleepSuccess';
  success: Scalars['Boolean']['output'];
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
  /** Router has been put to sleep. This state should only be possible for Serverless routers */
  SLEEPING = 'SLEEPING',
  /** Cloud Router is running, but currently being updated */
  UPDATING = 'UPDATING'
}

export type RouterUpsertFailure = {
  __typename?: 'RouterUpsertFailure';
  message: Scalars['String']['output'];
};

/** A generic key→count type so that router usage metrics can be added to without modifying the `trackRouterUsage` mutation */
export type RouterUsageInput = {
  count: Scalars['Int']['input'];
  key: Scalars['String']['input'];
};

/** Router Version */
export type RouterVersion = {
  __typename?: 'RouterVersion';
  /** Build number */
  build: Scalars['String']['output'];
  /** JSON schema for validating the router configuration for this router version */
  configSchema: Scalars['String']['output'];
  /** Config version for this router version */
  configVersion: Scalars['String']['output'];
  /** Core version identifier */
  core: Scalars['String']['output'];
  /** Latest supported BuildPipelineTrack for this version */
  latestSupportedPipelineTrack?: Maybe<Scalars['String']['output']>;
  /** Status of a router version */
  status: Status;
  /** Version identifier */
  version: Scalars['String']['output'];
};

export type RouterVersionBuild = {
  __typename?: 'RouterVersionBuild';
  jobId: Scalars['String']['output'];
  routerVersion?: Maybe<Scalars['String']['output']>;
  status: RouterVersionBuildStatus;
};

export type RouterVersionBuildError = {
  __typename?: 'RouterVersionBuildError';
  jobId: Scalars['String']['output'];
  routerVersion?: Maybe<Scalars['String']['output']>;
};

export type RouterVersionBuildPageResults = {
  __typename?: 'RouterVersionBuildPageResults';
  count: Scalars['Int']['output'];
  cursor?: Maybe<Scalars['Cursor']['output']>;
  results: Array<RouterVersionBuildResult>;
};

export type RouterVersionBuildResult = RouterVersionBuild | RouterVersionBuildError;

export enum RouterVersionBuildStatus {
  BUILDING = 'BUILDING',
  CANCELLED = 'CANCELLED',
  COMPLETE = 'COMPLETE',
  PENDING = 'PENDING'
}

export enum RouterVersionBuildsField {
  CREATED_AT = 'CREATED_AT'
}

export type RouterVersionBuildsInput = {
  orderBy?: InputMaybe<RouterVersionBuildsOrderByInput>;
  pagination?: InputMaybe<CloudRouterTestingToolPaginationInput>;
};

export type RouterVersionBuildsOrderByInput = {
  direction: OrderingDirection;
  field: RouterVersionBuildsField;
};

/** Result of a RouterConfigVersion mutation */
export type RouterVersionConfigResult = CloudInvalidInputError | InternalServerError | RouterConfigVersion;

/** Input to create a new router version */
export type RouterVersionCreateInput = {
  /** Version of the configuration */
  configVersion: Scalars['String']['input'];
  /** Latest supported BuildPipelineTrack for this version */
  latestSupportedPipelineTrack: Scalars['String']['input'];
  /** Version status */
  status: Status;
  /** Version identifier */
  version: Scalars['String']['input'];
};

/** Result of a router version query */
export type RouterVersionResult = InternalServerError | InvalidInputErrors | RouterVersion;

/** Input for updating a router version */
export type RouterVersionUpdateInput = {
  /** Version of the configuration */
  configVersion?: InputMaybe<Scalars['String']['input']>;
  /** Latest supported BuildPipelineTrack for this version */
  latestSupportedPipelineTrack?: InputMaybe<Scalars['String']['input']>;
  /** Version status */
  status?: InputMaybe<Status>;
  /** Version identifier */
  version: Scalars['String']['input'];
};

/** List of router versions */
export type RouterVersions = {
  __typename?: 'RouterVersions';
  versions: Array<RouterVersion>;
};

/** Input for filtering router versions */
export type RouterVersionsInput = {
  /** Name of the branch */
  branch?: InputMaybe<Scalars['String']['input']>;
  /** Maximum number of versions to return */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Status of the version */
  status?: InputMaybe<Status>;
};

/** Result of a router versions query */
export type RouterVersionsResult = InternalServerError | InvalidInputErrors | RouterVersions;

/** "Represents the possible outcomes of a ", RouterWakeUp, " mutation" */
export type RouterWakeUpResult = InternalServerError | InvalidInputErrors | RouterWakeUpSuccess;

/** Success branch of a wakeUp mutation */
export type RouterWakeUpSuccess = {
  __typename?: 'RouterWakeUpSuccess';
  success: Scalars['Boolean']['output'];
};

export type RoverArgumentInput = {
  key: Scalars['String']['input'];
  value?: InputMaybe<Scalars['Object']['input']>;
};

export type RuleEnforcement = {
  __typename?: 'RuleEnforcement';
  /** The instant this enforcement was created. */
  createdAt: Scalars['Timestamp']['output'];
  /** Identifying info for the creator of this enforcement. */
  createdBy: Scalars['String']['output'];
  /** The instant this enforcement was deleted. */
  deletedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** The identifier for the graph this this enforcement applies to. */
  graphId: Scalars['String']['output'];
  /** The name of the variant that this enforcement applies to. */
  graphVariant?: Maybe<Scalars['String']['output']>;
  /** The ID of this enforcement. */
  id: Scalars['ID']['output'];
  /** A list of key/value pairs representing any parameters necessary for the policy's enforcement. */
  params?: Maybe<Array<StringToString>>;
  /** The policy that this enforcement belongs to. */
  policy: EnforcementPolicy;
  /** The instant this enforcement was last updated. */
  updatedAt: Scalars['Timestamp']['output'];
};

export type RuleEnforcementError = {
  __typename?: 'RuleEnforcementError';
  message: Scalars['String']['output'];
};

export type RuleEnforcementResult = RuleEnforcement | RuleEnforcementError;

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
  baseSupergraphHash: Scalars['String']['input'];
  /** List of subgraph names and hashes that are being proposed in the check task */
  proposedSubgraphs: Array<SubgraphCheckInput>;
  /** Supergraph hash that is the output of the check's composition task */
  proposedSupergraphHash: Scalars['String']['input'];
  /** If this check was created by rerunning, the original check workflow task that was rerun */
  rerunOfTaskId?: InputMaybe<Scalars['ID']['input']>;
  /** The severity to assign the check results if matching proposals are not found */
  severityLevel: ProposalChangeMismatchSeverity;
  /** The check workflow task id. Used by Task entities to resolve the results */
  workflowTaskId: Scalars['String']['input'];
};

export type SafAssessment = {
  __typename?: 'SafAssessment';
  /** The date and time the assessment was completed. */
  completedAt?: Maybe<Scalars['Date']['output']>;
  /** The time that the assessment was deleted. */
  deletedAt?: Maybe<Scalars['Date']['output']>;
  /** The graph that this assessment belongs to. */
  graph: Service;
  id: Scalars['ID']['output'];
  /** The plan items for this assessment. */
  planItems: Array<SafPlanItem>;
  /** The responses for this assessment. */
  responses: Array<SafResponse>;
  /** The date and time the assessment was started. */
  startedAt: Scalars['Date']['output'];
};

export type SafAssessmentMutation = {
  __typename?: 'SafAssessmentMutation';
  /** Delete the assessment. */
  delete: SafAssessment;
  id: Scalars['String']['output'];
  /** Mutations for a specific plan item. */
  planItem?: Maybe<SafPlanItemMutation>;
  /** Reorder the plan items for a given assessment. */
  reorderPlanItems: Array<SafPlanItem>;
  /** Save a response for a question. */
  saveResponse: SafResponse;
  /** Submit the assessment. */
  submit: SafAssessment;
};


export type SafAssessmentMutationPlanItemArgs = {
  id: Scalars['ID']['input'];
};


export type SafAssessmentMutationReorderPlanItemsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type SafAssessmentMutationSaveResponseArgs = {
  input: SafResponseInput;
};


export type SafAssessmentMutationSubmitArgs = {
  organizationId?: InputMaybe<Scalars['String']['input']>;
  planItemIds: Array<Scalars['String']['input']>;
};

export type SafPlanItem = {
  __typename?: 'SafPlanItem';
  bestPracticeId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isDeprioritized: Scalars['Boolean']['output'];
  notes: Scalars['String']['output'];
  order: Scalars['Int']['output'];
};

export type SafPlanItemInput = {
  isDeprioritized: Scalars['Boolean']['input'];
  notes: Scalars['String']['input'];
  order: Scalars['Int']['input'];
};

export type SafPlanItemMutation = {
  __typename?: 'SafPlanItemMutation';
  /** Update a plan item. */
  update: SafPlanItem;
};


export type SafPlanItemMutationUpdateArgs = {
  input: SafPlanItemInput;
};

export type SafResponse = {
  __typename?: 'SafResponse';
  /** The assessment that this response belongs to. */
  assessment?: Maybe<SafAssessment>;
  /** Additional context or feedback about the question. */
  comment: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** The ID of the question that this response is for. */
  questionId: Scalars['String']['output'];
  /** A list of responses for this question. */
  response: Array<Scalars['String']['output']>;
};

export type SafResponseInput = {
  comment: Scalars['String']['input'];
  questionId: Scalars['String']['input'];
  response: Array<Scalars['String']['input']>;
};

export type SamlCertInfo = {
  __typename?: 'SamlCertInfo';
  id: Scalars['ID']['output'];
  notAfter: Scalars['Timestamp']['output'];
  notBefore: Scalars['Timestamp']['output'];
  pem: Scalars['String']['output'];
  subjectDN: Scalars['String']['output'];
};

export type SamlConfigurationInput = {
  encryptionCerts?: InputMaybe<Array<Scalars['String']['input']>>;
  entityId: Scalars['String']['input'];
  ssoUrl: Scalars['String']['input'];
  verificationCerts: Array<Scalars['String']['input']>;
  wantsSignedRequests?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SamlConnection = SsoConnection & {
  __typename?: 'SamlConnection';
  domains: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  idpId: Scalars['ID']['output'];
  metadata: SamlIdpMetadata;
  scim?: Maybe<SsoScimProvisioningDetails>;
  /** @deprecated Use stateV2 instead */
  state: SsoConnectionState;
  stateV2: SsoConnectionStateV2;
};

export type SamlConnectionMutation = {
  __typename?: 'SamlConnectionMutation';
  addEncryptionCert?: Maybe<SamlConnection>;
  addVerificationCert?: Maybe<SamlConnection>;
  updateIdpId?: Maybe<SamlConnection>;
};


export type SamlConnectionMutationAddEncryptionCertArgs = {
  pem: Scalars['String']['input'];
};


export type SamlConnectionMutationAddVerificationCertArgs = {
  pem: Scalars['String']['input'];
};


export type SamlConnectionMutationUpdateIdpIdArgs = {
  idpId: Scalars['String']['input'];
};

export type SamlIdpMetadata = {
  __typename?: 'SamlIdpMetadata';
  encryptionCerts: Array<SamlCertInfo>;
  entityId: Scalars['String']['output'];
  ssoUrl: Scalars['String']['output'];
  verificationCerts: Array<SamlCertInfo>;
  wantsSignedRequests: Scalars['Boolean']['output'];
};

export type ScheduledSummary = ChannelSubscription & {
  __typename?: 'ScheduledSummary';
  /** @deprecated Use channels list instead */
  channel?: Maybe<Channel>;
  channels: Array<Channel>;
  enabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  timezone: Scalars['String']['output'];
  variant: Scalars['String']['output'];
};

/** A GraphQL schema document and associated metadata. */
export type Schema = {
  __typename?: 'Schema';
  createTemporaryURL?: Maybe<TemporaryUrl>;
  /** The timestamp of initial ingestion of a schema to a graph. */
  createdAt: Scalars['Timestamp']['output'];
  /** The GraphQL schema document. */
  document: Scalars['GraphQLDocument']['output'];
  /** The number of fields; this includes user defined fields only, excluding built-in types and fields */
  fieldCount: Scalars['Int']['output'];
  gitContext?: Maybe<GitContext>;
  /** The GraphQL schema document's SHA256 hash, represented as a hexadecimal string. */
  hash: Scalars['ID']['output'];
  introspection: IntrospectionSchema;
  /**
   * The list of schema coordinates ('TypeName.fieldName') in the schema
   * that can be measured by usage reporting.
   * Currently only supports object types and interface types.
   */
  observableCoordinates?: Maybe<Array<SchemaCoordinate>>;
  /** The number of types; this includes user defined types only, excluding built-in types */
  typeCount: Scalars['Int']['output'];
};


/** A GraphQL schema document and associated metadata. */
export type SchemaCreateTemporaryUrlArgs = {
  expiresInSeconds?: Scalars['Int']['input'];
};

/** An error that occurred while running schema composition on a set of subgraph schemas. */
export type SchemaCompositionError = {
  __typename?: 'SchemaCompositionError';
  /** A machine-readable error code. */
  code?: Maybe<Scalars['String']['output']>;
  /** Source locations related to the error. */
  locations: Array<Maybe<SourceLocation>>;
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
};

export type SchemaCoordinate = {
  __typename?: 'SchemaCoordinate';
  /** The printed coordinate value, e.g. 'ParentType.fieldName' */
  coordinate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Whether the coordinate being referred to is marked as deprecated */
  isDeprecated: Scalars['Boolean']['output'];
};

export type SchemaCoordinateFilterInput = {
  /**
   * If true, only include deprecated coordinates.
   * If false, filter out deprecated coordinates.
   */
  deprecated?: InputMaybe<Scalars['Boolean']['input']>;
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
  numberOfAffectedOperations: Scalars['Int']['output'];
  /** The number of GraphQL operations that were validated during the check. */
  numberOfCheckedOperations?: Maybe<Scalars['Int']['output']>;
  /** Indicates the overall safety of the changes included in the diff, based on operation history (e.g., `FAILURE` or `NOTICE`). */
  severity: ChangeSeverity;
  /** The tag against which this diff was created */
  tag?: Maybe<Scalars['String']['output']>;
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
  from?: Maybe<Scalars['Timestamp']['output']>;
  /** Operation IDs to ignore during validation. */
  ignoredOperations?: Maybe<Array<Scalars['ID']['output']>>;
  /** Variants to include during validation. */
  includedVariants?: Maybe<Array<Scalars['String']['output']>>;
  /** Minimum number of requests within the window for a query to be considered. */
  queryCountThreshold?: Maybe<Scalars['Int']['output']>;
  /**
   * Number of requests within the window for a query to be considered, relative to
   * total request count. Expected values are between 0 and 0.05 (minimum 5% of
   * total request volume)
   */
  queryCountThresholdPercentage?: Maybe<Scalars['Float']['output']>;
  /**
   * delta in seconds from current time that determines the end of the
   * window for reported metrics included in a schema diff. A day window
   * from the present day would have a `to` value of -0. In rare
   * cases, this could be an ISO timestamp if the user passed one in on diff
   * creation
   */
  to?: Maybe<Scalars['Timestamp']['output']>;
};

export type SchemaHashInput = {
  /** If provided fetches build messages that are added to linter results. */
  buildID?: InputMaybe<Scalars['ID']['input']>;
  /** SHA256 of the schema sdl. */
  hash: Scalars['String']['input'];
  subgraphs?: InputMaybe<Array<SubgraphHashInput>>;
};

export type SchemaPublishSubscription = ChannelSubscription & {
  __typename?: 'SchemaPublishSubscription';
  channels: Array<Channel>;
  createdAt: Scalars['Timestamp']['output'];
  enabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  lastUpdatedAt: Scalars['Timestamp']['output'];
  variant?: Maybe<Scalars['String']['output']>;
};

export type SchemaReport = {
  /** A randomly generated UUID, immutable for the lifetime of the edge server runtime. */
  bootId: Scalars['String']['input'];
  /** The hex SHA256 hash of the schema being reported. Note that for a GraphQL server with a core schema, this should be the core schema, not the API schema. */
  coreSchemaHash: Scalars['String']['input'];
  /** The graph ref (eg, 'id@variant') */
  graphRef: Scalars['String']['input'];
  /** The version of the edge server reporting agent, e.g. apollo-server-2.8, graphql-java-3.1, etc. length must be <= 256 characters. */
  libraryVersion?: InputMaybe<Scalars['String']['input']>;
  /** The infra environment in which this edge server is running, e.g. localhost, Kubernetes, AWS Lambda, Google CloudRun, AWS ECS, etc. length must be <= 256 characters. */
  platform?: InputMaybe<Scalars['String']['input']>;
  /** The runtime in which the edge server is running, e.g. node 12.03, zulu8.46.0.19-ca-jdk8.0.252-macosx_x64, etc. length must be <= 256 characters. */
  runtimeVersion?: InputMaybe<Scalars['String']['input']>;
  /** If available, an identifier for the edge server instance, such that when restarting this instance it will have the same serverId, with a different bootId. For example, in Kubernetes this might be the pod name. Length must be <= 256 characters. */
  serverId?: InputMaybe<Scalars['String']['input']>;
  /** An identifier used to distinguish the version (from the user's perspective) of the edge server's code itself. For instance, the git sha of the server's repository or the docker sha of the associated image this server runs with. Length must be <= 256 characters. */
  userVersion?: InputMaybe<Scalars['String']['input']>;
};

/** Contains details for an individual publication of an individual graph variant. */
export type SchemaTag = {
  __typename?: 'SchemaTag';
  /** The result of federated composition executed for this publication. This result includes either a supergraph schema or error details, depending on whether composition succeeded. This value is null when the publication is for a non-federated graph. */
  compositionResult?: Maybe<CompositionResult>;
  createdAt: Scalars['Timestamp']['output'];
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
  historyLength: Scalars['Int']['output'];
  /**
   * Number of schemas tagged prior to this one under the same tag name, its position
   * in the tag history.
   */
  historyOrder: Scalars['Int']['output'];
  /** The identifier for this specific publication. */
  id: Scalars['ID']['output'];
  /**
   * The launch for this publication. This value is non-null for contract variants, and sometimes null
   * for composition variants (specifically for older publications). This value is null for other
   * variants.
   */
  launch?: Maybe<Launch>;
  /** The timestamp when the variant was published to. */
  publishedAt: Scalars['Timestamp']['output'];
  /**
   * The Identity that published this schema and their client info, or null if this isn't
   * a publish. Sub-fields may be null if they weren't recorded.
   */
  publishedBy?: Maybe<IdentityAndClientInfo>;
  /** The schema that was published to the variant. */
  schema: Schema;
  slackNotificationBody?: Maybe<Scalars['String']['output']>;
  /** @deprecated Please use variant { name } instead */
  tag: Scalars['String']['output'];
  /** The variant that was published to." */
  variant: GraphVariant;
  webhookNotificationBody: Scalars['String']['output'];
};


/** Contains details for an individual publication of an individual graph variant. */
export type SchemaTagHistoryArgs = {
  includeUnchanged?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<SchemaTagHistoryOrder>;
};


/** Contains details for an individual publication of an individual graph variant. */
export type SchemaTagHistoryLengthArgs = {
  includeUnchanged?: Scalars['Boolean']['input'];
};


/** Contains details for an individual publication of an individual graph variant. */
export type SchemaTagSlackNotificationBodyArgs = {
  graphDisplayName: Scalars['String']['input'];
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
  message: Scalars['String']['output'];
};

/** An error that occurs when an invalid schema is passed in as user input */
export type SchemaValidationIssue = {
  __typename?: 'SchemaValidationIssue';
  message: Scalars['String']['output'];
};

/** How many seats of the given types does an organization have (regardless of plan type)? */
export type Seats = {
  __typename?: 'Seats';
  /** How many members that are free in this organization. */
  free: Scalars['Int']['output'];
  /** How many members that are not free in this organization. */
  fullPrice: Scalars['Int']['output'];
};

/** Cloud Router secret */
export type Secret = {
  __typename?: 'Secret';
  /** When the secret was created */
  createdAt: Scalars['DateTime']['output'];
  /** Hash of the secret */
  hash: Scalars['String']['output'];
  /** Name of the secret */
  name: Scalars['String']['output'];
};

/** Input for creating or updating secrets */
export type SecretInput = {
  /** Name of the secret */
  name: Scalars['String']['input'];
  /**
   * Value for that secret
   *
   * This can only be used for input, as it is not possible to retrieve the value of secrets.
   */
  value: Scalars['String']['input'];
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
  shortDescription?: Maybe<Scalars['String']['output']>;
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
  accountId?: Maybe<Scalars['ID']['output']>;
  /** The `GraphVariant` types of all proposal variants. This is a potentially expensive field to query. */
  allProposalVariants: Array<GraphVariant>;
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
  avatarUrl?: Maybe<Scalars['String']['output']>;
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
  checksAuthorOptions: Array<Scalars['String']['output']>;
  /**
   * List of options available for filtering checks for this graph by branch.
   * If a filter is passed, constrains results to match the filter.
   */
  checksBranchOptions: Array<Scalars['String']['output']>;
  /**
   * List of options available for filtering checks for this graph by git committer.
   * If a filter is passed, constrains results to match the filter.
   * For cli triggered checks, this is the author.
   */
  checksCommitterOptions: Array<Scalars['String']['output']>;
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
  checksSubgraphOptions: Array<Scalars['String']['output']>;
  /** Get a composition build check result for this graph by its ID */
  compositionBuildCheckResult?: Maybe<CompositionBuildCheckResult>;
  /** Given a graphCompositionID, return the results of composition. This can represent either a validation or a publish. */
  compositionResultById?: Maybe<CompositionResult>;
  createdAt: Scalars['Timestamp']['output'];
  createdBy?: Maybe<Identity>;
  /** Custom check configuration for this graph. */
  customCheckConfiguration?: Maybe<CustomCheckConfiguration>;
  datadogMetricsConfig?: Maybe<DatadogMetricsConfig>;
  defaultBuildPipelineTrack?: Maybe<Scalars['String']['output']>;
  /** The time the default build pipeline track version was updated. */
  defaultBuildPipelineTrackUpdatedAt?: Maybe<Scalars['Timestamp']['output']>;
  defaultProposalReviewers: Array<Maybe<Identity>>;
  deletedAt?: Maybe<Scalars['Timestamp']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** @deprecated No longer supported */
  devGraphOwner?: Maybe<User>;
  /** Get a GraphQL document by hash */
  doc?: Maybe<GraphQlDoc>;
  /** Get GraphQL documents by hash, max up to 100 can be requested per query */
  docs?: Maybe<Array<Maybe<GraphQlDoc>>>;
  /**
   * Get a GraphQL document by hash
   * @deprecated Use doc instead
   */
  document?: Maybe<Scalars['GraphQLDocument']['output']>;
  flatDiff: FlatDiffResult;
  /** The capabilities that are supported for this graph */
  graphCapabilities: GraphCapabilities;
  graphType: GraphType;
  /**
   * When this is true, this graph will be hidden from non-admin members of the org who haven't been explicitly assigned a
   * role on this graph.
   */
  hiddenFromUninvitedNonAdminAccountMembers: Scalars['Boolean']['output'];
  /** The graph's globally unique identifier. */
  id: Scalars['ID']['output'];
  /** List of ignored rule violations for the linter */
  ignoredLinterViolations: Array<IgnoredRule>;
  /**
   * List of subgraphs that comprise a graph. A non-federated graph should have a single implementing service.
   * Set includeDeleted to see deleted subgraphs.
   */
  implementingServices?: Maybe<GraphImplementors>;
  lastReportedAt?: Maybe<Scalars['Timestamp']['output']>;
  /** Linter configuration for this graph. */
  linterConfiguration: GraphLinterConfiguration;
  /** Current identity, null if not authenticated. */
  me?: Maybe<Identity>;
  minProposalApprovers: Scalars['Int']['output'];
  minProposalRoles: ProposalRoles;
  /** The composition result that was most recently published to a graph variant. */
  mostRecentCompositionPublish?: Maybe<CompositionPublishResult>;
  /** Permissions of the current user in this graph. */
  myRole?: Maybe<UserPermission>;
  name: Scalars['String']['output'];
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
  proposalDescriptionTemplate?: Maybe<Scalars['String']['output']>;
  /** The current active user's Proposal notification status on this graph. */
  proposalNotificationStatus: NotificationStatus;
  /**
   * A list of the proposals for this graph sorted by created at date.
   * limit defaults to 25 and has an allowed max of 50, offset defaults to 0
   */
  proposals: ProposalsResult;
  /** If the graph setting for the proposals implementation variant has been set, this will be non null. */
  proposalsImplementationVariant?: Maybe<GraphVariant>;
  /** Must one of the default reviewers approve proposals */
  proposalsMustBeApprovedByADefaultReviewer: Scalars['Boolean']['output'];
  /** True if each approving reviewer's review will get dismissed & the proposal status will change from approved to open on new revisions. */
  proposalsMustBeReApprovedOnChange: Scalars['Boolean']['output'];
  /** Get query triggers for a given variant. If variant is null all the triggers for this service will be gotten. */
  queryTriggers?: Maybe<Array<QueryTrigger>>;
  readme?: Maybe<Readme>;
  /** Registry specific stats for this graph. */
  registryStatsWindow?: Maybe<RegistryStatsWindow>;
  /**
   * Whether registry subscriptions (with any options) are enabled. If variant is not passed, returns true if configuration is present for any variant
   * @deprecated This field will be removed
   */
  registrySubscriptionsEnabled: Scalars['Boolean']['output'];
  reportingEnabled: Scalars['Boolean']['output'];
  /** The list of members that can access this graph, accounting for graph role overrides */
  roleOverrides?: Maybe<Array<RoleOverride>>;
  /** Describes the permissions that the active user has for this graph. */
  roles?: Maybe<ServiceRoles>;
  ruleEnforcement?: Maybe<RuleEnforcement>;
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
  testSchemaPublishBody: Scalars['String']['output'];
  /** The graph's name. */
  title: Scalars['String']['output'];
  /** Count checkWorkflows for the given filter. Used for paginating with checkWorkflows. */
  totalCheckWorkflowCount: Scalars['Int']['output'];
  trace?: Maybe<Trace>;
  traceStorageEnabled: Scalars['Boolean']['output'];
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
export type ServiceAvatarUrlArgs = {
  size?: Scalars['Int']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceChannelsArgs = {
  channelIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceCheckWorkflowArgs = {
  id: Scalars['ID']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceCheckWorkflowTaskArgs = {
  id: Scalars['ID']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceCheckWorkflowsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceChecksAuthorOptionsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceChecksBranchOptionsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceChecksCommitterOptionsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceChecksCreatedByOptionsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceChecksSubgraphOptionsArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceCompositionBuildCheckResultArgs = {
  id: Scalars['ID']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceCompositionResultByIdArgs = {
  id: Scalars['ID']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceDocArgs = {
  hash?: InputMaybe<Scalars['SHA256']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceDocsArgs = {
  hashes: Array<Scalars['SHA256']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceDocumentArgs = {
  hash?: InputMaybe<Scalars['SHA256']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceFlatDiffArgs = {
  newSdlHash?: InputMaybe<Scalars['SHA256']['input']>;
  oldSdlHash?: InputMaybe<Scalars['SHA256']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceImplementingServicesArgs = {
  graphVariant: Scalars['String']['input'];
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceLastReportedAtArgs = {
  graphVariant?: InputMaybe<Scalars['String']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceMostRecentCompositionPublishArgs = {
  graphVariant: Scalars['String']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceOperationArgs = {
  id: Scalars['ID']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceOperationCheckRequestsByVariantArgs = {
  from: Scalars['Timestamp']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceOperationsAcceptedChangesArgs = {
  checkID: Scalars['ID']['input'];
  operationID: Scalars['String']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceOperationsCheckArgs = {
  checkID: Scalars['ID']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServicePersistedQueryListArgs = {
  id: Scalars['ID']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceProposalsArgs = {
  filterBy?: InputMaybe<ProposalsFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceQueryTriggersArgs = {
  graphVariant?: InputMaybe<Scalars['String']['input']>;
  operationNames?: InputMaybe<Array<Scalars['String']['input']>>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceRegistryStatsWindowArgs = {
  from: Scalars['Timestamp']['input'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceRegistrySubscriptionsEnabledArgs = {
  graphVariant?: InputMaybe<Scalars['String']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceRuleEnforcementArgs = {
  id: Scalars['ID']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceSafAssessmentArgs = {
  id: Scalars['ID']['input'];
  includeDeleted?: Scalars['Boolean']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceSafAssessmentsArgs = {
  includeDeleted?: Scalars['Boolean']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceSchemaArgs = {
  hash?: InputMaybe<Scalars['ID']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceSchemaTagArgs = {
  tag: Scalars['String']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceSchemaTagByIdArgs = {
  id: Scalars['ID']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceSchemaTagsArgs = {
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceStatsArgs = {
  from: Scalars['Timestamp']['input'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceStatsWindowArgs = {
  from: Scalars['Timestamp']['input'];
  resolution?: InputMaybe<Resolution>;
  to?: InputMaybe<Scalars['Timestamp']['input']>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceTestSchemaPublishBodyArgs = {
  variant: Scalars['String']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceTotalCheckWorkflowCountArgs = {
  filter?: InputMaybe<CheckFilterInput>;
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceTraceArgs = {
  id: Scalars['ID']['input'];
};


/**
 * A graph in Apollo Studio represents a graph in your organization.
 * Each graph has one or more variants, which correspond to the different environments where that graph runs (such as staging and production).
 * Each variant has its own GraphQL schema, which means schemas can differ between environments.
 */
export type ServiceVariantArgs = {
  name: Scalars['String']['input'];
};

/** Columns of ServiceBillingUsageStats. */
export enum ServiceBillingUsageStatsColumn {
  AGENT_ID = 'AGENT_ID',
  AGENT_VERSION = 'AGENT_VERSION',
  GRAPH_DEPLOYMENT_TYPE = 'GRAPH_DEPLOYMENT_TYPE',
  OPERATION_COUNT = 'OPERATION_COUNT',
  OPERATION_COUNT_PROVIDED_EXPLICITLY = 'OPERATION_COUNT_PROVIDED_EXPLICITLY',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  ROUTER_FEATURES_ENABLED = 'ROUTER_FEATURES_ENABLED',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP'
}

export type ServiceBillingUsageStatsDimensions = {
  __typename?: 'ServiceBillingUsageStatsDimensions';
  agentId?: Maybe<Scalars['String']['output']>;
  agentVersion?: Maybe<Scalars['String']['output']>;
  graphDeploymentType?: Maybe<Scalars['String']['output']>;
  operationCountProvidedExplicitly?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  routerFeaturesEnabled?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceBillingUsageStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceBillingUsageStatsFilter = {
  /** Selects rows whose agentId dimension equals the given value if not null. To query for the null value, use {in: {agentId: [null]}} instead. */
  agentId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']['input']>;
  and?: InputMaybe<Array<ServiceBillingUsageStatsFilter>>;
  /** Selects rows whose graphDeploymentType dimension equals the given value if not null. To query for the null value, use {in: {graphDeploymentType: [null]}} instead. */
  graphDeploymentType?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ServiceBillingUsageStatsFilterIn>;
  not?: InputMaybe<ServiceBillingUsageStatsFilter>;
  /** Selects rows whose operationCountProvidedExplicitly dimension equals the given value if not null. To query for the null value, use {in: {operationCountProvidedExplicitly: [null]}} instead. */
  operationCountProvidedExplicitly?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<ServiceBillingUsageStatsFilter>>;
  /** Selects rows whose routerFeaturesEnabled dimension equals the given value if not null. To query for the null value, use {in: {routerFeaturesEnabled: [null]}} instead. */
  routerFeaturesEnabled?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceBillingUsageStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceBillingUsageStatsFilterIn = {
  /** Selects rows whose agentId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose graphDeploymentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  graphDeploymentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationCountProvidedExplicitly dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationCountProvidedExplicitly?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose routerFeaturesEnabled dimension is in the given list. A null value in the list means a row with null for that dimension. */
  routerFeaturesEnabled?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceBillingUsageStatsMetrics = {
  __typename?: 'ServiceBillingUsageStatsMetrics';
  operationCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

/** Columns of ServiceCardinalityStats. */
export enum ServiceCardinalityStatsColumn {
  CLIENT_NAME_CARDINALITY = 'CLIENT_NAME_CARDINALITY',
  CLIENT_VERSION_CARDINALITY = 'CLIENT_VERSION_CARDINALITY',
  OPERATION_SHAPE_CARDINALITY = 'OPERATION_SHAPE_CARDINALITY',
  SCHEMA_COORDINATE_CARDINALITY = 'SCHEMA_COORDINATE_CARDINALITY',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP'
}

export type ServiceCardinalityStatsDimensions = {
  __typename?: 'ServiceCardinalityStatsDimensions';
  schemaTag?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceCardinalityStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceCardinalityStatsFilter = {
  and?: InputMaybe<Array<ServiceCardinalityStatsFilter>>;
  in?: InputMaybe<ServiceCardinalityStatsFilterIn>;
  not?: InputMaybe<ServiceCardinalityStatsFilter>;
  or?: InputMaybe<Array<ServiceCardinalityStatsFilter>>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceCardinalityStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceCardinalityStatsFilterIn = {
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceCardinalityStatsMetrics = {
  __typename?: 'ServiceCardinalityStatsMetrics';
  clientNameCardinality: Scalars['Float']['output'];
  clientVersionCardinality: Scalars['Float']['output'];
  operationShapeCardinality: Scalars['Float']['output'];
  schemaCoordinateCardinality: Scalars['Float']['output'];
};

export type ServiceCardinalityStatsOrderBySpec = {
  column: ServiceCardinalityStatsColumn;
  direction: Ordering;
};

export type ServiceCardinalityStatsRecord = {
  __typename?: 'ServiceCardinalityStatsRecord';
  /** Dimensions of ServiceCardinalityStats that can be grouped by. */
  groupBy: ServiceCardinalityStatsDimensions;
  /** Metrics of ServiceCardinalityStats that can be aggregated over. */
  metrics: ServiceCardinalityStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp']['output'];
};

/** Columns of ServiceCoordinateUsage. */
export enum ServiceCoordinateUsageColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ESTIMATED_EXECUTION_COUNT = 'ESTIMATED_EXECUTION_COUNT',
  EXECUTION_COUNT = 'EXECUTION_COUNT',
  KIND = 'KIND',
  NAMED_ATTRIBUTE = 'NAMED_ATTRIBUTE',
  NAMED_TYPE = 'NAMED_TYPE',
  OPERATION_SUBTYPE = 'OPERATION_SUBTYPE',
  OPERATION_TYPE = 'OPERATION_TYPE',
  QUERY_ID = 'QUERY_ID',
  QUERY_NAME = 'QUERY_NAME',
  REFERENCING_OPERATION_COUNT = 'REFERENCING_OPERATION_COUNT',
  REQUEST_COUNT_NULL = 'REQUEST_COUNT_NULL',
  REQUEST_COUNT_UNDEFINED = 'REQUEST_COUNT_UNDEFINED',
  SCHEMA_TAG = 'SCHEMA_TAG',
  TIMESTAMP = 'TIMESTAMP'
}

export type ServiceCoordinateUsageDimensions = {
  __typename?: 'ServiceCoordinateUsageDimensions';
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  kind?: Maybe<Scalars['String']['output']>;
  namedAttribute?: Maybe<Scalars['String']['output']>;
  namedType?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['String']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceCoordinateUsage. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceCoordinateUsageFilter = {
  and?: InputMaybe<Array<ServiceCoordinateUsageFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ServiceCoordinateUsageFilterIn>;
  /** Selects rows whose kind dimension equals the given value if not null. To query for the null value, use {in: {kind: [null]}} instead. */
  kind?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose namedAttribute dimension equals the given value if not null. To query for the null value, use {in: {namedAttribute: [null]}} instead. */
  namedAttribute?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose namedType dimension equals the given value if not null. To query for the null value, use {in: {namedType: [null]}} instead. */
  namedType?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<ServiceCoordinateUsageFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<ServiceCoordinateUsageFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceCoordinateUsage. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceCoordinateUsageFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose kind dimension is in the given list. A null value in the list means a row with null for that dimension. */
  kind?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose namedAttribute dimension is in the given list. A null value in the list means a row with null for that dimension. */
  namedAttribute?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose namedType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  namedType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceCoordinateUsageMetrics = {
  __typename?: 'ServiceCoordinateUsageMetrics';
  estimatedExecutionCount: Scalars['Long']['output'];
  executionCount: Scalars['Long']['output'];
  referencingOperationCount: Scalars['Long']['output'];
  requestCountNull: Scalars['Long']['output'];
  requestCountUndefined: Scalars['Long']['output'];
};

export type ServiceCoordinateUsageOrderBySpec = {
  column: ServiceCoordinateUsageColumn;
  direction: Ordering;
};

export type ServiceCoordinateUsageRecord = {
  __typename?: 'ServiceCoordinateUsageRecord';
  /** Dimensions of ServiceCoordinateUsage that can be grouped by. */
  groupBy: ServiceCoordinateUsageDimensions;
  /** Metrics of ServiceCoordinateUsage that can be aggregated over. */
  metrics: ServiceCoordinateUsageMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp']['output'];
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
  bootId?: Maybe<Scalars['ID']['output']>;
  executableSchemaId?: Maybe<Scalars['ID']['output']>;
  libraryVersion?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<Scalars['String']['output']>;
  runtimeVersion?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serverId?: Maybe<Scalars['ID']['output']>;
  userVersion?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceEdgeServerInfos. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceEdgeServerInfosFilter = {
  and?: InputMaybe<Array<ServiceEdgeServerInfosFilter>>;
  /** Selects rows whose bootId dimension equals the given value if not null. To query for the null value, use {in: {bootId: [null]}} instead. */
  bootId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose executableSchemaId dimension equals the given value if not null. To query for the null value, use {in: {executableSchemaId: [null]}} instead. */
  executableSchemaId?: InputMaybe<Scalars['ID']['input']>;
  in?: InputMaybe<ServiceEdgeServerInfosFilterIn>;
  /** Selects rows whose libraryVersion dimension equals the given value if not null. To query for the null value, use {in: {libraryVersion: [null]}} instead. */
  libraryVersion?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<ServiceEdgeServerInfosFilter>;
  or?: InputMaybe<Array<ServiceEdgeServerInfosFilter>>;
  /** Selects rows whose platform dimension equals the given value if not null. To query for the null value, use {in: {platform: [null]}} instead. */
  platform?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose runtimeVersion dimension equals the given value if not null. To query for the null value, use {in: {runtimeVersion: [null]}} instead. */
  runtimeVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serverId dimension equals the given value if not null. To query for the null value, use {in: {serverId: [null]}} instead. */
  serverId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose userVersion dimension equals the given value if not null. To query for the null value, use {in: {userVersion: [null]}} instead. */
  userVersion?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceEdgeServerInfos. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceEdgeServerInfosFilterIn = {
  /** Selects rows whose bootId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  bootId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose executableSchemaId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  executableSchemaId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose libraryVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  libraryVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose platform dimension is in the given list. A null value in the list means a row with null for that dimension. */
  platform?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose runtimeVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  runtimeVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serverId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serverId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose userVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  userVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
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
  timestamp: Scalars['Timestamp']['output'];
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceErrorStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceErrorStatsFilter = {
  and?: InputMaybe<Array<ServiceErrorStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ServiceErrorStatsFilterIn>;
  not?: InputMaybe<ServiceErrorStatsFilter>;
  or?: InputMaybe<Array<ServiceErrorStatsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceErrorStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceErrorStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceErrorStatsMetrics = {
  __typename?: 'ServiceErrorStatsMetrics';
  errorsCount: Scalars['Long']['output'];
  requestsWithErrorsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

/** Columns of ServiceFederatedErrorStats. */
export enum ServiceFederatedErrorStatsColumn {
  AGENT_VERSION = 'AGENT_VERSION',
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  ERROR_CODE = 'ERROR_CODE',
  ERROR_COUNT = 'ERROR_COUNT',
  ERROR_PATH = 'ERROR_PATH',
  ERROR_SERVICE = 'ERROR_SERVICE',
  OPERATION_ID = 'OPERATION_ID',
  OPERATION_NAME = 'OPERATION_NAME',
  OPERATION_TYPE = 'OPERATION_TYPE',
  SCHEMA_TAG = 'SCHEMA_TAG',
  SEVERITY = 'SEVERITY',
  TIMESTAMP = 'TIMESTAMP'
}

export type ServiceFederatedErrorStatsDimensions = {
  __typename?: 'ServiceFederatedErrorStatsDimensions';
  agentVersion?: Maybe<Scalars['String']['output']>;
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  errorPath?: Maybe<Scalars['String']['output']>;
  errorService?: Maybe<Scalars['String']['output']>;
  operationId?: Maybe<Scalars['String']['output']>;
  operationName?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  severity?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceFederatedErrorStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceFederatedErrorStatsFilter = {
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']['input']>;
  and?: InputMaybe<Array<ServiceFederatedErrorStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorCode dimension equals the given value if not null. To query for the null value, use {in: {errorCode: [null]}} instead. */
  errorCode?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorPath dimension equals the given value if not null. To query for the null value, use {in: {errorPath: [null]}} instead. */
  errorPath?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorService dimension equals the given value if not null. To query for the null value, use {in: {errorService: [null]}} instead. */
  errorService?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ServiceFederatedErrorStatsFilterIn>;
  not?: InputMaybe<ServiceFederatedErrorStatsFilter>;
  /** Selects rows whose operationId dimension equals the given value if not null. To query for the null value, use {in: {operationId: [null]}} instead. */
  operationId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationName dimension equals the given value if not null. To query for the null value, use {in: {operationName: [null]}} instead. */
  operationName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<ServiceFederatedErrorStatsFilter>>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose severity dimension equals the given value if not null. To query for the null value, use {in: {severity: [null]}} instead. */
  severity?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceFederatedErrorStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceFederatedErrorStatsFilterIn = {
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorCode?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorPath dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorPath?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorService dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorService?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose severity dimension is in the given list. A null value in the list means a row with null for that dimension. */
  severity?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceFederatedErrorStatsMetrics = {
  __typename?: 'ServiceFederatedErrorStatsMetrics';
  errorCount: Scalars['Long']['output'];
};

export type ServiceFederatedErrorStatsOrderBySpec = {
  column: ServiceFederatedErrorStatsColumn;
  direction: Ordering;
};

export type ServiceFederatedErrorStatsRecord = {
  __typename?: 'ServiceFederatedErrorStatsRecord';
  /** Dimensions of ServiceFederatedErrorStats that can be grouped by. */
  groupBy: ServiceFederatedErrorStatsDimensions;
  /** Metrics of ServiceFederatedErrorStats that can be aggregated over. */
  metrics: ServiceFederatedErrorStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp']['output'];
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
  fieldName?: Maybe<Scalars['String']['output']>;
  parentType?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceFieldExecutions. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceFieldExecutionsFilter = {
  and?: InputMaybe<Array<ServiceFieldExecutionsFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ServiceFieldExecutionsFilterIn>;
  not?: InputMaybe<ServiceFieldExecutionsFilter>;
  or?: InputMaybe<Array<ServiceFieldExecutionsFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceFieldExecutions. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceFieldExecutionsFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceFieldExecutionsMetrics = {
  __typename?: 'ServiceFieldExecutionsMetrics';
  errorsCount: Scalars['Long']['output'];
  estimatedExecutionCount: Scalars['Long']['output'];
  observedExecutionCount: Scalars['Long']['output'];
  referencingOperationCount: Scalars['Long']['output'];
  requestsWithErrorsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
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
  field?: Maybe<Scalars['String']['output']>;
  fieldName?: Maybe<Scalars['String']['output']>;
  parentType?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceFieldLatencies. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceFieldLatenciesFilter = {
  and?: InputMaybe<Array<ServiceFieldLatenciesFilter>>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ServiceFieldLatenciesFilterIn>;
  not?: InputMaybe<ServiceFieldLatenciesFilter>;
  or?: InputMaybe<Array<ServiceFieldLatenciesFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceFieldLatencies. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceFieldLatenciesFilterIn = {
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
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
  timestamp: Scalars['Timestamp']['output'];
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  fieldName?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  parentType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceFieldUsage. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceFieldUsageFilter = {
  and?: InputMaybe<Array<ServiceFieldUsageFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose fieldName dimension equals the given value if not null. To query for the null value, use {in: {fieldName: [null]}} instead. */
  fieldName?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ServiceFieldUsageFilterIn>;
  not?: InputMaybe<ServiceFieldUsageFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<ServiceFieldUsageFilter>>;
  /** Selects rows whose parentType dimension equals the given value if not null. To query for the null value, use {in: {parentType: [null]}} instead. */
  parentType?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceFieldUsage. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceFieldUsageFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose fieldName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fieldName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose parentType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  parentType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceFieldUsageMetrics = {
  __typename?: 'ServiceFieldUsageMetrics';
  estimatedExecutionCount: Scalars['Long']['output'];
  executionCount: Scalars['Long']['output'];
  referencingOperationCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
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
  agentVersion?: Maybe<Scalars['String']['output']>;
  cloudProvider?: Maybe<Scalars['String']['output']>;
  routerId?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  tier?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceGraphosCloudMetrics. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceGraphosCloudMetricsFilter = {
  /** Selects rows whose agentVersion dimension equals the given value if not null. To query for the null value, use {in: {agentVersion: [null]}} instead. */
  agentVersion?: InputMaybe<Scalars['String']['input']>;
  and?: InputMaybe<Array<ServiceGraphosCloudMetricsFilter>>;
  /** Selects rows whose cloudProvider dimension equals the given value if not null. To query for the null value, use {in: {cloudProvider: [null]}} instead. */
  cloudProvider?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ServiceGraphosCloudMetricsFilterIn>;
  not?: InputMaybe<ServiceGraphosCloudMetricsFilter>;
  or?: InputMaybe<Array<ServiceGraphosCloudMetricsFilter>>;
  /** Selects rows whose routerId dimension equals the given value if not null. To query for the null value, use {in: {routerId: [null]}} instead. */
  routerId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose tier dimension equals the given value if not null. To query for the null value, use {in: {tier: [null]}} instead. */
  tier?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceGraphosCloudMetrics. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceGraphosCloudMetricsFilterIn = {
  /** Selects rows whose agentVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  agentVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose cloudProvider dimension is in the given list. A null value in the list means a row with null for that dimension. */
  cloudProvider?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose routerId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  routerId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose tier dimension is in the given list. A null value in the list means a row with null for that dimension. */
  tier?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceGraphosCloudMetricsMetrics = {
  __typename?: 'ServiceGraphosCloudMetricsMetrics';
  responseSize: Scalars['Long']['output'];
  responseSizeThrottled: Scalars['Long']['output'];
  routerOperations: Scalars['Long']['output'];
  routerOperationsThrottled: Scalars['Long']['output'];
  subgraphFetches: Scalars['Long']['output'];
  subgraphFetchesThrottled: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
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
  /** Create a new Persisted Query List. */
  createPersistedQueryList: CreatePersistedQueryListResultOrError;
  /** Creates a proposal variant from a source variant and a name, description. See the documentation for proposal creation at https://www.apollographql.com/docs/graphos/delivery/schema-proposals/creation */
  createProposal: CreateProposalResult;
  /** Subscribes a webhook channel to Proposal lifecycle events on this graph. */
  createProposalLifecycleSubscription: CreateProposalLifecycleSubscriptionResult;
  /** Creates a proposal variant from a source variant and a name, description. Do not call this from any clients, this resolver is exclusively for inter-service proposal -> kotlin registry communication. */
  createProposalVariant: ProposalVariantCreationResult;
  createRuleEnforcement: RuleEnforcementResult;
  /** Create a new assessment for this graph. */
  createSafAssessment: SafAssessment;
  createSchemaPublishSubscription: SchemaPublishSubscription;
  /** Update the default build pipeline track for this graph. */
  defaultBuildPipelineTrack?: Maybe<BuildPipelineTrack>;
  /** Soft delete a graph. Data associated with the graph is not permanently deleted; Apollo support can undo. */
  delete?: Maybe<Scalars['Void']['output']>;
  /** Delete the service's avatar. Requires Service.roles.canUpdateAvatar to be true. */
  deleteAvatar?: Maybe<AvatarDeleteError>;
  /** Delete an existing channel */
  deleteChannel: Scalars['Boolean']['output'];
  /** Deletes this service's current subscriptions specific by ID. */
  deleteProposalLifecycleSubscription: DeleteProposalLifecycleSubscriptionResult;
  /** Delete an existing query trigger */
  deleteQueryTrigger: Scalars['Boolean']['output'];
  /** Deletes this service's current subscriptions specific to the ID, returns true if it existed */
  deleteRegistrySubscription: Scalars['Boolean']['output'];
  /**
   * Deletes this service's current registry subscription(s) specific to its graph variant,
   * returns a list of subscription IDs that were deleted.
   */
  deleteRegistrySubscriptions: Array<Scalars['ID']['output']>;
  deleteRuleEnforcement: Scalars['Boolean']['output'];
  deleteScheduledSummary: Scalars['Boolean']['output'];
  /** Delete a variant by name. */
  deleteSchemaTag: DeleteSchemaTagResult;
  /** Given a UTC timestamp, delete all traces associated with this Service, on that corresponding day. If a timestamp to is provided, deletes all days inclusive. */
  deleteTraces?: Maybe<Scalars['Void']['output']>;
  disableDatadogForwardingLegacyMetricNames?: Maybe<Service>;
  /** Hard delete a graph and all data associated with it. Its ID cannot be reused. */
  hardDelete?: Maybe<Scalars['Void']['output']>;
  /** @deprecated Use service.id */
  id: Scalars['ID']['output'];
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
  overrideProposalsCheckTask?: Maybe<Scalars['Boolean']['output']>;
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
  /** Test a subscription by queueing a test notification for the one subscribed event. */
  queueTestProposalLifecycleNotification: QueueTestProposalLifecycleNotificationResult;
  registerOperationsWithResponse?: Maybe<RegisterOperationsMutationResponse>;
  /** Removes a subgraph. If composition is successful, this will update running routers. */
  removeImplementingServiceAndTriggerComposition: CompositionAndRemoveResult;
  /** Deletes the existing graph API key with the provided ID, if any. */
  removeKey?: Maybe<Scalars['Void']['output']>;
  /** Sets a new name for the graph API key with the provided ID, if any. This does not invalidate the key or change its value. */
  renameKey?: Maybe<GraphApiKey>;
  /** @deprecated use Mutation.reportSchema instead */
  reportServerInfo?: Maybe<ReportServerInfoResult>;
  /** Mutations for a specific assessment. */
  safAssessment?: Maybe<SafAssessmentMutation>;
  service: Service;
  setCustomCheckConfiguration: CustomCheckConfigurationResult;
  setDefaultBuildPipelineTrack?: Maybe<Scalars['String']['output']>;
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
  setProposalsMustBeReApprovedOnChange?: Maybe<SetProposalsMustBeReApprovedOnChangeResult>;
  /**
   * Store a given schema document. This schema will be attached to the graph but
   * not be associated with any variant. On success, returns the schema hash.
   */
  storeSchemaDocument: StoreSchemaResponseOrError;
  /** Test Slack notification channel */
  testSlackChannel?: Maybe<Scalars['Void']['output']>;
  testSubscriptionForChannel: Scalars['String']['output'];
  transfer?: Maybe<Service>;
  /** Undelete a soft deleted graph. */
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
  /** Updates the specified proposal lifecycle subscription's subscribed events. */
  updateProposalLifecycleSubscription: UpdateProposalLifecycleSubscriptionResult;
  updateReadme?: Maybe<Service>;
  updateRuleEnforcement: RuleEnforcementResult;
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
export type ServiceMutationCheckPartialSchemaArgs = {
  frontend?: InputMaybe<Scalars['String']['input']>;
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant: Scalars['String']['input'];
  historicParameters?: InputMaybe<HistoricQueryParameters>;
  implementingServiceName: Scalars['String']['input'];
  introspectionEndpoint?: InputMaybe<Scalars['String']['input']>;
  isProposalCheck?: Scalars['Boolean']['input'];
  isSandboxCheck?: Scalars['Boolean']['input'];
  partialSchema: PartialSchemaInput;
  triggeredBy?: InputMaybe<ActorInput>;
  useMaximumRetention?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationCheckSchemaArgs = {
  baseSchemaTag?: InputMaybe<Scalars['String']['input']>;
  frontend?: InputMaybe<Scalars['String']['input']>;
  gitContext?: InputMaybe<GitContextInput>;
  historicParameters?: InputMaybe<HistoricQueryParameters>;
  introspectionEndpoint?: InputMaybe<Scalars['String']['input']>;
  isProposalCheck?: Scalars['Boolean']['input'];
  isSandboxCheck?: Scalars['Boolean']['input'];
  proposedSchema?: InputMaybe<IntrospectionSchemaInput>;
  proposedSchemaDocument?: InputMaybe<Scalars['String']['input']>;
  proposedSchemaHash?: InputMaybe<Scalars['String']['input']>;
  useMaximumRetention?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationCheckWorkflowArgs = {
  id: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationCreateCompositionStatusSubscriptionArgs = {
  channelID: Scalars['ID']['input'];
  variant: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationCreatePersistedQueryListArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationCreateProposalArgs = {
  input: CreateProposalInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationCreateProposalLifecycleSubscriptionArgs = {
  input: CreateProposalLifecycleSubscriptionInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationCreateProposalVariantArgs = {
  sourceVariantName: Scalars['ID']['input'];
  triggeredBy?: InputMaybe<ActorInput>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationCreateRuleEnforcementArgs = {
  input: CreateRuleEnforcementInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationCreateSchemaPublishSubscriptionArgs = {
  channelID: Scalars['ID']['input'];
  variant: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationDefaultBuildPipelineTrackArgs = {
  buildPipelineTrack: BuildPipelineTrack;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationDeleteChannelArgs = {
  id: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationDeleteProposalLifecycleSubscriptionArgs = {
  input: DeleteProposalLifecycleSubscriptionInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationDeleteQueryTriggerArgs = {
  id: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationDeleteRegistrySubscriptionArgs = {
  id: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationDeleteRegistrySubscriptionsArgs = {
  variant: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationDeleteRuleEnforcementArgs = {
  id: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationDeleteScheduledSummaryArgs = {
  id: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationDeleteSchemaTagArgs = {
  tag: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationDeleteTracesArgs = {
  from: Scalars['Timestamp']['input'];
  to?: InputMaybe<Scalars['Timestamp']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationIgnoreOperationsInChecksArgs = {
  ids: Array<Scalars['ID']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationLintSchemaArgs = {
  baseSdl?: InputMaybe<Scalars['String']['input']>;
  sdl: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationMarkChangesForOperationAsSafeArgs = {
  checkID: Scalars['ID']['input'];
  operationID: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationNewKeyArgs = {
  keyName?: InputMaybe<Scalars['String']['input']>;
  role?: UserPermission;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationOverrideProposalsCheckTaskArgs = {
  shouldOverride: Scalars['Boolean']['input'];
  taskId: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationOverrideUserPermissionArgs = {
  permission?: InputMaybe<UserPermission>;
  userID: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationPersistedQueryListArgs = {
  id: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationPromoteSchemaArgs = {
  graphVariant: Scalars['String']['input'];
  historicParameters?: InputMaybe<HistoricQueryParameters>;
  overrideComposedSchema?: Scalars['Boolean']['input'];
  sha256: Scalars['SHA256']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationProposalsMustBeApprovedByADefaultReviewerArgs = {
  mustBeApproved: Scalars['Boolean']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationPublishSubgraphArgs = {
  activePartialSchema: PartialSchemaInput;
  downstreamLaunchInitiation?: InputMaybe<DownstreamLaunchInitiation>;
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant: Scalars['String']['input'];
  name: Scalars['String']['input'];
  revision: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationPublishSubgraphsArgs = {
  downstreamLaunchInitiation?: InputMaybe<DownstreamLaunchInitiation>;
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant: Scalars['String']['input'];
  revision: Scalars['String']['input'];
  subgraphInputs: Array<PublishSubgraphsSubgraphInput>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationPublishSubgraphsAsyncBuildArgs = {
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant: Scalars['String']['input'];
  revision: Scalars['String']['input'];
  subgraphInputs: Array<PublishSubgraphsSubgraphInput>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationQueueTestProposalLifecycleNotificationArgs = {
  input: QueueTestProposalLifecycleNotificationInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationRegisterOperationsWithResponseArgs = {
  clientIdentity?: InputMaybe<RegisteredClientIdentityInput>;
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant?: Scalars['String']['input'];
  manifestVersion?: InputMaybe<Scalars['Int']['input']>;
  operations: Array<RegisteredOperationInput>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationRemoveImplementingServiceAndTriggerCompositionArgs = {
  dryRun?: Scalars['Boolean']['input'];
  graphVariant: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationRemoveKeyArgs = {
  id: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationRenameKeyArgs = {
  id: Scalars['ID']['input'];
  newKeyName?: InputMaybe<Scalars['String']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationReportServerInfoArgs = {
  executableSchema?: InputMaybe<Scalars['String']['input']>;
  info: EdgeServerInfo;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationSafAssessmentArgs = {
  id: Scalars['ID']['input'];
  includeDeleted?: Scalars['Boolean']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationSetCustomCheckConfigurationArgs = {
  input: SetCustomCheckConfigurationInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationSetDefaultBuildPipelineTrackArgs = {
  version: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationSetMinProposalApproversArgs = {
  input: SetMinProposalApproversInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationSetMinProposalRolesArgs = {
  input: SetProposalRolesInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationSetProposalDefaultReviewersArgs = {
  input: SetProposalDefaultReviewersInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationSetProposalDescriptionTemplateArgs = {
  input: SetProposalDescriptionTemplateInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationSetProposalImplementationVariantArgs = {
  variantName?: InputMaybe<Scalars['String']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationSetProposalNotificationStatusArgs = {
  input: SetProposalNotificationStatusInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationSetProposalsMustBeReApprovedOnChangeArgs = {
  approvalRequiredOnChange: Scalars['Boolean']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationStoreSchemaDocumentArgs = {
  schemaDocument: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationTestSlackChannelArgs = {
  id: Scalars['ID']['input'];
  notification: SlackNotificationInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationTestSubscriptionForChannelArgs = {
  channelID: Scalars['ID']['input'];
  subscriptionID: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationTransferArgs = {
  to: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUnignoreOperationsInChecksArgs = {
  ids: Array<Scalars['ID']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUnmarkChangesForOperationAsSafeArgs = {
  checkID: Scalars['ID']['input'];
  operationID: Scalars['ID']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpdateCheckConfigurationArgs = {
  downgradeDefaultValueChange?: InputMaybe<Scalars['Boolean']['input']>;
  downgradeStaticChecks?: InputMaybe<Scalars['Boolean']['input']>;
  enableCustomChecks?: InputMaybe<Scalars['Boolean']['input']>;
  enableLintChecks?: InputMaybe<Scalars['Boolean']['input']>;
  excludedClients?: InputMaybe<Array<ClientFilterInput>>;
  excludedOperationNames?: InputMaybe<Array<OperationNameFilterInput>>;
  excludedOperations?: InputMaybe<Array<ExcludedOperationInput>>;
  includeBaseVariant?: InputMaybe<Scalars['Boolean']['input']>;
  includedVariants?: InputMaybe<Array<Scalars['String']['input']>>;
  operationCountThreshold?: InputMaybe<Scalars['Int']['input']>;
  operationCountThresholdPercentage?: InputMaybe<Scalars['Float']['input']>;
  timeRangeSeconds?: InputMaybe<Scalars['Long']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpdateDatadogMetricsConfigArgs = {
  apiKey?: InputMaybe<Scalars['String']['input']>;
  apiRegion?: InputMaybe<DatadogApiRegion>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpdateDescriptionArgs = {
  description: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpdateHiddenFromUninvitedNonAdminAccountMembersArgs = {
  hiddenFromUninvitedNonAdminAccountMembers: Scalars['Boolean']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpdateIgnoredRuleViolationsArgs = {
  changes: LinterIgnoredRuleChangesInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpdateLinterConfigurationArgs = {
  changes: GraphLinterConfigurationChangesInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpdateProposalLifecycleSubscriptionArgs = {
  input: UpdateProposalLifecycleSubscriptionInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpdateReadmeArgs = {
  readme: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpdateRuleEnforcementArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRuleEnforcementInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpdateTitleArgs = {
  title: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUploadSchemaArgs = {
  errorOnBadRequest?: Scalars['Boolean']['input'];
  gitContext?: InputMaybe<GitContextInput>;
  historicParameters?: InputMaybe<HistoricQueryParameters>;
  overrideComposedSchema?: Scalars['Boolean']['input'];
  schema?: InputMaybe<IntrospectionSchemaInput>;
  schemaDocument?: InputMaybe<Scalars['String']['input']>;
  tag: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpsertChannelArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  pagerDutyChannel?: InputMaybe<PagerDutyChannelInput>;
  slackChannel?: InputMaybe<SlackChannelInput>;
  webhookChannel?: InputMaybe<WebhookChannelInput>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpsertContractVariantArgs = {
  contractVariantName: Scalars['String']['input'];
  filterConfig: FilterConfigInput;
  initiateLaunch?: Scalars['Boolean']['input'];
  sourceVariant?: InputMaybe<Scalars['String']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpsertImplementingServiceAndTriggerCompositionArgs = {
  activePartialSchema: PartialSchemaInput;
  gitContext?: InputMaybe<GitContextInput>;
  graphVariant: Scalars['String']['input'];
  name: Scalars['String']['input'];
  revision: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpsertPagerDutyChannelArgs = {
  channel: PagerDutyChannelInput;
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpsertQueryTriggerArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  trigger: QueryTriggerInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpsertRegistrySubscriptionArgs = {
  channelID?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  options?: InputMaybe<SubscriptionOptionsInput>;
  variant?: InputMaybe<Scalars['String']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpsertScheduledSummaryArgs = {
  channelID?: InputMaybe<Scalars['ID']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  variant?: InputMaybe<Scalars['String']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpsertSlackChannelArgs = {
  channel: SlackChannelInput;
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationUpsertWebhookChannelArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  secretToken?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationValidateOperationsArgs = {
  gitContext?: InputMaybe<GitContextInput>;
  operations: Array<OperationDocumentInput>;
  tag?: InputMaybe<Scalars['String']['input']>;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationValidatePartialSchemaOfImplementingServiceAgainstGraphArgs = {
  graphVariant: Scalars['String']['input'];
  implementingServiceName: Scalars['String']['input'];
  partialSchema: PartialSchemaInput;
};


/** Provides access to mutation fields for managing Studio graphs and subgraphs. */
export type ServiceMutationVariantArgs = {
  name: Scalars['String']['input'];
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceOperationCheckStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceOperationCheckStatsFilter = {
  and?: InputMaybe<Array<ServiceOperationCheckStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ServiceOperationCheckStatsFilterIn>;
  not?: InputMaybe<ServiceOperationCheckStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<ServiceOperationCheckStatsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceOperationCheckStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceOperationCheckStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceOperationCheckStatsMetrics = {
  __typename?: 'ServiceOperationCheckStatsMetrics';
  cachedRequestsCount: Scalars['Long']['output'];
  uncachedRequestsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
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
  PERSISTED_QUERY_ID = 'PERSISTED_QUERY_ID',
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  fromEngineproxy?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  persistedQueryId?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  querySignature?: Maybe<Scalars['String']['output']>;
  querySignatureLength?: Maybe<Scalars['Int']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
};

/** Filter for data in ServiceQueryStats. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceQueryStatsFilter = {
  and?: InputMaybe<Array<ServiceQueryStatsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose fromEngineproxy dimension equals the given value if not null. To query for the null value, use {in: {fromEngineproxy: [null]}} instead. */
  fromEngineproxy?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ServiceQueryStatsFilterIn>;
  not?: InputMaybe<ServiceQueryStatsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<ServiceQueryStatsFilter>>;
  /** Selects rows whose persistedQueryId dimension equals the given value if not null. To query for the null value, use {in: {persistedQueryId: [null]}} instead. */
  persistedQueryId?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for data in ServiceQueryStats. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceQueryStatsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose fromEngineproxy dimension is in the given list. A null value in the list means a row with null for that dimension. */
  fromEngineproxy?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose persistedQueryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  persistedQueryId?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceQueryStatsMetrics = {
  __typename?: 'ServiceQueryStatsMetrics';
  cacheTtlHistogram: DurationHistogram;
  cachedHistogram: DurationHistogram;
  cachedRequestsCount: Scalars['Long']['output'];
  forbiddenOperationCount: Scalars['Long']['output'];
  registeredOperationCount: Scalars['Long']['output'];
  requestsWithErrorsCount: Scalars['Long']['output'];
  totalLatencyHistogram: DurationHistogram;
  totalRequestCount: Scalars['Long']['output'];
  uncachedHistogram: DurationHistogram;
  uncachedRequestsCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

/** Individual permissions for the current user when interacting with a particular Studio graph. */
export type ServiceRoles = {
  __typename?: 'ServiceRoles';
  /** Whether the currently authenticated user is permitted to perform schema checks (i.e., run `rover (sub)graph check`). */
  canCheckSchemas: Scalars['Boolean']['output'];
  canCreateProposal: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to create new graph variants. */
  canCreateVariants: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to delete the graph in question */
  canDelete: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to delete proposal variants. */
  canDeleteProposalVariants: Scalars['Boolean']['output'];
  /** Given the graph's setting regarding proposal permission levels, can the current user edit Proposals authored by other users */
  canEditProposal: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to manage user access to the graph in question. */
  canManageAccess: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to manage the build configuration (e.g., build pipeline version). */
  canManageBuildConfig: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to manage third-party integrations (e.g., Datadog forwarding). */
  canManageIntegrations: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to manage graph-level API keys. */
  canManageKeys: Scalars['Boolean']['output'];
  canManagePersistedQueryLists: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to manage proposal permission settings for this graph. */
  canManageProposalPermissions: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to manage proposal settings, like setting the implementation variant, on this graph. */
  canManageProposalSettings: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to perform basic administration of variants (e.g., make a variant public). */
  canManageVariants: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to view details about the build configuration (e.g. build pipeline version). */
  canQueryBuildConfig: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to view details of the check configuration for this graph. */
  canQueryCheckConfiguration: Scalars['Boolean']['output'];
  canQueryDeletedImplementingServices: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to view which subgraphs the graph is composed of. */
  canQueryImplementingServices: Scalars['Boolean']['output'];
  canQueryIntegrations: Scalars['Boolean']['output'];
  canQueryPersistedQueryLists: Scalars['Boolean']['output'];
  canQueryPrivateInfo: Scalars['Boolean']['output'];
  canQueryProposals: Scalars['Boolean']['output'];
  canQueryPublicInfo: Scalars['Boolean']['output'];
  canQueryReadmeAuthor: Scalars['Boolean']['output'];
  canQueryRoleOverrides: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to download schemas owned by this graph. */
  canQuerySchemas: Scalars['Boolean']['output'];
  canQueryStats: Scalars['Boolean']['output'];
  canQueryTokens: Scalars['Boolean']['output'];
  canQueryTraces: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to register operations (i.e. `apollo client:push`) for this graph. */
  canRegisterOperations: Scalars['Boolean']['output'];
  canStoreSchemasWithoutVariant: Scalars['Boolean']['output'];
  canUndelete: Scalars['Boolean']['output'];
  canUpdateAvatar: Scalars['Boolean']['output'];
  canUpdateDescription: Scalars['Boolean']['output'];
  canUpdateTitle: Scalars['Boolean']['output'];
  /** Whether the currently authenticated user is permitted to make updates to the check configuration for this graph. */
  canWriteCheckConfiguration: Scalars['Boolean']['output'];
  service: Service;
};

/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindow = {
  __typename?: 'ServiceStatsWindow';
  billingUsageStats: Array<ServiceBillingUsageStatsRecord>;
  cardinalityStats: Array<ServiceCardinalityStatsRecord>;
  coordinateUsage: Array<ServiceCoordinateUsageRecord>;
  edgeServerInfos: Array<ServiceEdgeServerInfosRecord>;
  errorStats: Array<ServiceErrorStatsRecord>;
  federatedErrorStats: Array<ServiceFederatedErrorStatsRecord>;
  fieldExecutions: Array<ServiceFieldExecutionsRecord>;
  fieldLatencies: Array<ServiceFieldLatenciesRecord>;
  fieldStats: Array<ServiceFieldLatenciesRecord>;
  fieldUsage: Array<ServiceFieldUsageRecord>;
  graphosCloudMetrics: Array<ServiceGraphosCloudMetricsRecord>;
  operationCheckStats: Array<ServiceOperationCheckStatsRecord>;
  queryStats: Array<ServiceQueryStatsRecord>;
  /** From field rounded down to the nearest resolution. */
  roundedDownFrom: Scalars['Timestamp']['output'];
  /** To field rounded up to the nearest resolution. */
  roundedUpTo: Scalars['Timestamp']['output'];
  tracePathErrorsRefs: Array<ServiceTracePathErrorsRefsRecord>;
  traceRefs: Array<ServiceTraceRefsRecord>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowBillingUsageStatsArgs = {
  filter?: InputMaybe<ServiceBillingUsageStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceBillingUsageStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowCardinalityStatsArgs = {
  filter?: InputMaybe<ServiceCardinalityStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceCardinalityStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowCoordinateUsageArgs = {
  filter?: InputMaybe<ServiceCoordinateUsageFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceCoordinateUsageOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowEdgeServerInfosArgs = {
  filter?: InputMaybe<ServiceEdgeServerInfosFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceEdgeServerInfosOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowErrorStatsArgs = {
  filter?: InputMaybe<ServiceErrorStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowFederatedErrorStatsArgs = {
  filter?: InputMaybe<ServiceFederatedErrorStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceFederatedErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowFieldExecutionsArgs = {
  filter?: InputMaybe<ServiceFieldExecutionsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceFieldExecutionsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowFieldLatenciesArgs = {
  filter?: InputMaybe<ServiceFieldLatenciesFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceFieldLatenciesOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowFieldStatsArgs = {
  filter?: InputMaybe<ServiceFieldLatenciesFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceFieldLatenciesOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowFieldUsageArgs = {
  filter?: InputMaybe<ServiceFieldUsageFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceFieldUsageOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowGraphosCloudMetricsArgs = {
  filter?: InputMaybe<ServiceGraphosCloudMetricsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceGraphosCloudMetricsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowOperationCheckStatsArgs = {
  filter?: InputMaybe<ServiceOperationCheckStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceOperationCheckStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowQueryStatsArgs = {
  filter?: InputMaybe<ServiceQueryStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceQueryStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowTracePathErrorsRefsArgs = {
  filter?: InputMaybe<ServiceTracePathErrorsRefsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceTracePathErrorsRefsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowTraceRefsArgs = {
  filter?: InputMaybe<ServiceTraceRefsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ServiceTraceRefsOrderBySpec>>;
};

/** Columns of ServiceTracePathErrorsRefs. */
export enum ServiceTracePathErrorsRefsColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  DURATION_BUCKET = 'DURATION_BUCKET',
  ERRORS_COUNT_IN_PATH = 'ERRORS_COUNT_IN_PATH',
  ERRORS_COUNT_IN_TRACE = 'ERRORS_COUNT_IN_TRACE',
  ERROR_CODE = 'ERROR_CODE',
  ERROR_MESSAGE = 'ERROR_MESSAGE',
  ERROR_SERVICE = 'ERROR_SERVICE',
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  durationBucket?: Maybe<Scalars['Int']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  errorService?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  traceHttpStatusCode?: Maybe<Scalars['Int']['output']>;
  traceId?: Maybe<Scalars['ID']['output']>;
  traceStartsAt?: Maybe<Scalars['Timestamp']['output']>;
};

/** Filter for data in ServiceTracePathErrorsRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceTracePathErrorsRefsFilter = {
  and?: InputMaybe<Array<ServiceTracePathErrorsRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']['input']>;
  /** Selects rows whose errorCode dimension equals the given value if not null. To query for the null value, use {in: {errorCode: [null]}} instead. */
  errorCode?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorMessage dimension equals the given value if not null. To query for the null value, use {in: {errorMessage: [null]}} instead. */
  errorMessage?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorService dimension equals the given value if not null. To query for the null value, use {in: {errorService: [null]}} instead. */
  errorService?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<ServiceTracePathErrorsRefsFilterIn>;
  not?: InputMaybe<ServiceTracePathErrorsRefsFilter>;
  or?: InputMaybe<Array<ServiceTracePathErrorsRefsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose traceHttpStatusCode dimension equals the given value if not null. To query for the null value, use {in: {traceHttpStatusCode: [null]}} instead. */
  traceHttpStatusCode?: InputMaybe<Scalars['Int']['input']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in ServiceTracePathErrorsRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceTracePathErrorsRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Selects rows whose errorCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorCode?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorMessage dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorMessage?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorService dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorService?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose traceHttpStatusCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceHttpStatusCode?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type ServiceTracePathErrorsRefsMetrics = {
  __typename?: 'ServiceTracePathErrorsRefsMetrics';
  errorsCountInPath: Scalars['Long']['output'];
  errorsCountInTrace: Scalars['Long']['output'];
  traceSizeBytes: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  durationBucket?: Maybe<Scalars['Int']['output']>;
  generatedTraceId?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  querySignature?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  traceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in ServiceTraceRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type ServiceTraceRefsFilter = {
  and?: InputMaybe<Array<ServiceTraceRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<ServiceTraceRefsFilterIn>;
  not?: InputMaybe<ServiceTraceRefsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<ServiceTraceRefsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in ServiceTraceRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type ServiceTraceRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type ServiceTraceRefsMetrics = {
  __typename?: 'ServiceTraceRefsMetrics';
  traceCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

export type SetCustomCheckConfigurationInput = {
  secretToken?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

/** Input to update a proposal description */
export type SetMergeBaseCompositionIdInput = {
  /** The composition id of the source variant this proposal is based on. */
  mergeBaseCompositionId: Scalars['ID']['input'];
};

export type SetMergeBaseCompositionIdResult = PermissionError | Proposal | ValidationError;

export type SetMinApproversResult = PermissionError | Service | ValidationError;

export type SetMinProposalApproversInput = {
  minApprovers?: InputMaybe<Scalars['Int']['input']>;
};

/** Represents the possible outcomes of a setNextVersion mutation */
export type SetNextVersionResult = InternalServerError | InvalidInputErrors | RouterVersion;

export type SetProposalDefaultReviewersInput = {
  reviewerUserIds: Array<Scalars['ID']['input']>;
};

export type SetProposalDefaultReviewersResult = PermissionError | Service | ValidationError;

export type SetProposalDescriptionTemplateInput = {
  descriptionTemplate?: InputMaybe<Scalars['String']['input']>;
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

export type SetProposalsMustBeReApprovedOnChangeResult = PermissionError | Service | ValidationError;

export type SetupIntentResult = NotFoundError | PermissionError | SetupIntentSuccess;

export type SetupIntentSuccess = {
  __typename?: 'SetupIntentSuccess';
  clientSecret: Scalars['String']['output'];
};

/**
 * Shard for Cloud Routers
 *
 * This represents a specific shard where a Cloud Router can run
 */
export type Shard = {
  __typename?: 'Shard';
  gcuCapacity?: Maybe<Scalars['Int']['output']>;
  gcuUsage: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  provider: CloudProvider;
  /** Details of this shard for a specific provider */
  providerDetails: ShardProvider;
  reason?: Maybe<Scalars['String']['output']>;
  region: RegionDescription;
  routerCapacity?: Maybe<Scalars['Int']['output']>;
  routerUsage: Scalars['Int']['output'];
  routers: Array<Router>;
  status: ShardStatus;
  tier: CloudTier;
};


/**
 * Shard for Cloud Routers
 *
 * This represents a specific shard where a Cloud Router can run
 */
export type ShardRoutersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
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
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  subscriptions: Array<ChannelSubscription>;
  url: Scalars['String']['output'];
};

/** Slack notification channel parameters */
export type SlackChannelInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type SlackNotificationField = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

/** Slack notification message */
export type SlackNotificationInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  fallback: Scalars['String']['input'];
  fields?: InputMaybe<Array<SlackNotificationField>>;
  iconUrl?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Timestamp']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  titleLink?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** A location in a source code file. */
export type SourceLocation = {
  __typename?: 'SourceLocation';
  /** Column number. */
  column: Scalars['Int']['output'];
  /** Line number. */
  line: Scalars['Int']['output'];
};

export type SsoConfig = {
  __typename?: 'SsoConfig';
  /** Returns all SSO connections for the account, including those disabled or incomplete */
  allConnections: Array<SsoConnection>;
  /** Returns the current enabled SSO connection for the account */
  currentConnection?: Maybe<SsoConnection>;
  defaultRole: UserPermission;
};

export type SsoConnection = {
  domains: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  idpId: Scalars['ID']['output'];
  scim?: Maybe<SsoScimProvisioningDetails>;
  /** @deprecated Use stateV2 instead */
  state: SsoConnectionState;
  stateV2: SsoConnectionStateV2;
};

export enum SsoConnectionState {
  DISABLED = 'DISABLED',
  ENABLED = 'ENABLED'
}

export enum SsoConnectionStateV2 {
  /** The connection has been archived and is no longer in use */
  ARCHIVED = 'ARCHIVED',
  /** The connection has been disabled by an admin */
  DISABLED = 'DISABLED',
  /** The connection has been finalized. a connection can only go from VALIDATED->ENABLED */
  ENABLED = 'ENABLED',
  /** The initial state for base connections - setup still in progress */
  INITIALIZED = 'INITIALIZED',
  /** The connection has been configured as either SAML/OIDC and can be used to login */
  STAGED = 'STAGED',
  /** The connection has had at least one successful login - connections automatically transition from STAGED->VALIDATED on first login */
  VALIDATED = 'VALIDATED'
}

export type SsoMutation = {
  __typename?: 'SsoMutation';
  deleteSsoConnection?: Maybe<SsoConnection>;
  disableSsoConnection?: Maybe<SsoConnection>;
  enableScimProvisioning?: Maybe<SsoScimProvisioningDetails>;
  enableSsoConnection?: Maybe<SsoConnection>;
};


export type SsoMutationDeleteSsoConnectionArgs = {
  id: Scalars['ID']['input'];
};


export type SsoMutationDisableSsoConnectionArgs = {
  id: Scalars['ID']['input'];
};


export type SsoMutationEnableScimProvisioningArgs = {
  connectionId: Scalars['ID']['input'];
};


export type SsoMutationEnableSsoConnectionArgs = {
  id: Scalars['ID']['input'];
};

export type SsoQuery = {
  __typename?: 'SsoQuery';
  /** Parses a SAML IDP metadata XML string and returns the parsed metadata */
  parseSamlIdpMetadata?: Maybe<ParsedSamlIdpMetadata>;
};


export type SsoQueryParseSamlIdpMetadataArgs = {
  metadata: Scalars['String']['input'];
};

export type SsoScimProvisioningDetails = {
  __typename?: 'SsoScimProvisioningDetails';
  scimEnabled: Scalars['Boolean']['output'];
  scimEndpoint?: Maybe<Scalars['String']['output']>;
};

export type StartUsageBasedPlanResult = Account | NotFoundError | PermissionError | StartUsageBasedPlanSuccess | ValidationError;

export type StartUsageBasedPlanSuccess = {
  __typename?: 'StartUsageBasedPlanSuccess';
  customerPlanId: Scalars['String']['output'];
};

/** A time window with a specified granularity. */
export type StatsWindow = {
  __typename?: 'StatsWindow';
  billingUsageStats: Array<BillingUsageStatsRecord>;
  cardinalityStats: Array<CardinalityStatsRecord>;
  coordinateUsage: Array<CoordinateUsageRecord>;
  edgeServerInfos: Array<EdgeServerInfosRecord>;
  errorStats: Array<ErrorStatsRecord>;
  federatedErrorStats: Array<FederatedErrorStatsRecord>;
  fieldExecutions: Array<FieldExecutionsRecord>;
  fieldLatencies: Array<FieldLatenciesRecord>;
  fieldUsage: Array<FieldUsageRecord>;
  graphosCloudMetrics: Array<GraphosCloudMetricsRecord>;
  operationCheckStats: Array<OperationCheckStatsRecord>;
  queryStats: Array<QueryStatsRecord>;
  /** From field rounded down to the nearest resolution. */
  roundedDownFrom: Scalars['Timestamp']['output'];
  /** To field rounded up to the nearest resolution. */
  roundedUpTo: Scalars['Timestamp']['output'];
  tracePathErrorsRefs: Array<TracePathErrorsRefsRecord>;
  traceRefs: Array<TraceRefsRecord>;
};


/** A time window with a specified granularity. */
export type StatsWindowBillingUsageStatsArgs = {
  filter?: InputMaybe<BillingUsageStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BillingUsageStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowCardinalityStatsArgs = {
  filter?: InputMaybe<CardinalityStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CardinalityStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowCoordinateUsageArgs = {
  filter?: InputMaybe<CoordinateUsageFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CoordinateUsageOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowEdgeServerInfosArgs = {
  filter?: InputMaybe<EdgeServerInfosFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EdgeServerInfosOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowErrorStatsArgs = {
  filter?: InputMaybe<ErrorStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowFederatedErrorStatsArgs = {
  filter?: InputMaybe<FederatedErrorStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<FederatedErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowFieldExecutionsArgs = {
  filter?: InputMaybe<FieldExecutionsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<FieldExecutionsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowFieldLatenciesArgs = {
  filter?: InputMaybe<FieldLatenciesFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<FieldLatenciesOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowFieldUsageArgs = {
  filter?: InputMaybe<FieldUsageFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<FieldUsageOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowGraphosCloudMetricsArgs = {
  filter?: InputMaybe<GraphosCloudMetricsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<GraphosCloudMetricsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowOperationCheckStatsArgs = {
  filter?: InputMaybe<OperationCheckStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OperationCheckStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowQueryStatsArgs = {
  filter?: InputMaybe<QueryStatsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<QueryStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowTracePathErrorsRefsArgs = {
  filter?: InputMaybe<TracePathErrorsRefsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<TracePathErrorsRefsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowTraceRefsArgs = {
  filter?: InputMaybe<TraceRefsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
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
  message: Scalars['String']['output'];
};

export enum StoreSchemaErrorCode {
  SCHEMA_IS_NOT_PARSABLE = 'SCHEMA_IS_NOT_PARSABLE',
  SCHEMA_IS_NOT_VALID = 'SCHEMA_IS_NOT_VALID'
}

export type StoreSchemaResponse = {
  __typename?: 'StoreSchemaResponse';
  sha256: Scalars['SHA256']['output'];
};

export type StoreSchemaResponseOrError = StoreSchemaError | StoreSchemaResponse;

export type StoredApprovedChange = {
  __typename?: 'StoredApprovedChange';
  argNode?: Maybe<NamedIntrospectionArgNoDescription>;
  childNode?: Maybe<NamedIntrospectionValueNoDescription>;
  code: ChangeCode;
  parentNode?: Maybe<NamedIntrospectionTypeNoDescription>;
};

/** A paginated connection of strings. */
export type StringConnection = {
  __typename?: 'StringConnection';
  /** A list of edges containing a cursor and a string node for pagination. */
  edges: Array<StringEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection, containing a string node and its cursor. */
export type StringEdge = {
  __typename?: 'StringEdge';
  /** A cursor for use in pagination, unique identifier for this edge's position. */
  cursor: Scalars['String']['output'];
  /** The string value at this position in the connection. */
  node: Scalars['String']['output'];
};

export type StringToString = {
  __typename?: 'StringToString';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type StringToStringInput = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

/** A subgraph in a federated Studio supergraph. */
export type Subgraph = {
  __typename?: 'Subgraph';
  /** The subgraph schema document's SHA256 hash, represented as a hexadecimal string. */
  hash: Scalars['String']['output'];
  /** The subgraph's registered name. */
  name: Scalars['String']['output'];
  /** The number of fields in this subgraph */
  numberOfFields?: Maybe<Scalars['Int']['output']>;
  /** The number of types in this subgraph */
  numberOfTypes?: Maybe<Scalars['Int']['output']>;
  /** The revision string of this publish if provided */
  revision?: Maybe<Scalars['String']['output']>;
  /** The subgraph's routing URL, provided to gateways that use managed federation. */
  routingURL: Scalars['String']['output'];
  /** The subgraph schema document. */
  sdl: Scalars['String']['output'];
  /** Timestamp of when the subgraph was published. */
  updatedAt?: Maybe<Scalars['Timestamp']['output']>;
};


/** A subgraph in a federated Studio supergraph. */
export type SubgraphSdlArgs = {
  graphId: Scalars['ID']['input'];
};

/** A change made to a subgraph as part of a launch. */
export type SubgraphChange = {
  __typename?: 'SubgraphChange';
  /** The subgraph's name. */
  name: Scalars['ID']['output'];
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
  graphRef?: InputMaybe<Scalars['ID']['input']>;
  /** The URL of the GraphQL endpoint that Apollo Sandbox introspected to obtain the proposed schema. Required if `isSandbox` is `true`. */
  introspectionEndpoint?: InputMaybe<Scalars['String']['input']>;
  /** If `true`, the check was initiated automatically by a Proposal update. */
  isProposal?: InputMaybe<Scalars['Boolean']['input']>;
  /** If `true`, the check was initiated by Apollo Sandbox. */
  isSandbox: Scalars['Boolean']['input'];
  /** The proposed subgraph schema to perform checks with. */
  proposedSchema: Scalars['GraphQLDocument']['input'];
  /** The source variant that this check should use the operations check configuration from */
  sourceVariant?: InputMaybe<Scalars['String']['input']>;
  /** The name of the subgraph to check schema changes for. */
  subgraphName: Scalars['String']['input'];
  /** The user that triggered this check. If null, defaults to authContext to determine user. */
  triggeredBy?: InputMaybe<ActorInput>;
};

/** A subgraph in a federated Studio supergraph. */
export type SubgraphCheckInput = {
  /** The subgraph schema document's SHA256 hash, represented as a hexadecimal string. */
  hash: Scalars['String']['input'];
  /** The subgraph's registered name. */
  name: Scalars['String']['input'];
};

export type SubgraphConfig = {
  __typename?: 'SubgraphConfig';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  schemaHash: Scalars['String']['output'];
  sdl: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type SubgraphHashInput = {
  /** SHA256 of the subgraph schema sdl. */
  hash: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type SubgraphInput = {
  /** We are either going to pass in a document or a schema reference */
  document?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  routingURL: Scalars['String']['input'];
  /**
   * Reference to a schema in studio.
   * If this is a mutable ref i.e. graphRef then it will link (tbd)
   * If it is a stable ref i.e. hash then it
   */
  schemaRef?: InputMaybe<Scalars['String']['input']>;
};

export type SubgraphKeyMap = {
  __typename?: 'SubgraphKeyMap';
  keys: Array<Scalars['String']['output']>;
  subgraphName: Scalars['String']['output'];
};

export type SubgraphSdlCheckInput = {
  name: Scalars['String']['input'];
  sdl: Scalars['GraphQLDocument']['input'];
};

export type SubgraphWithConflicts = {
  __typename?: 'SubgraphWithConflicts';
  conflicts: Array<MergeConflict>;
  partialMergeSdl: Scalars['String']['output'];
  subgraphName: Scalars['String']['output'];
};

export type SubscriptionCapability = {
  __typename?: 'SubscriptionCapability';
  label: Scalars['String']['output'];
  subscription: BillingSubscription;
  value: Scalars['Boolean']['output'];
};

export type SubscriptionLimit = {
  __typename?: 'SubscriptionLimit';
  label: Scalars['String']['output'];
  subscription: BillingSubscription;
  value?: Maybe<Scalars['Long']['output']>;
};

export type SubscriptionOptions = {
  __typename?: 'SubscriptionOptions';
  /** Enables notifications for schema updates */
  schemaUpdates: Scalars['Boolean']['output'];
};

export type SubscriptionOptionsInput = {
  /** Enables notifications for schema updates */
  schemaUpdates: Scalars['Boolean']['input'];
};

export enum SubscriptionState {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  FUTURE = 'FUTURE',
  PAST_DUE = 'PAST_DUE',
  PAUSED = 'PAUSED',
  PENDING = 'PENDING',
  SOFT_CANCELED = 'SOFT_CANCELED',
  UNKNOWN = 'UNKNOWN'
}

export type SupportTicket = {
  __typename?: 'SupportTicket';
  /** The org id this issue belongs to */
  apolloOrgId?: Maybe<Scalars['String']['output']>;
  /** The date the issue was created */
  created: Scalars['Timestamp']['output'];
  /** The description of the issue */
  description: Scalars['String']['output'];
  /** The graph this issue is related to */
  graph?: Maybe<Service>;
  /** The id of the issue */
  id: Scalars['Int']['output'];
  /** The key of the issue, ie TH-### */
  key: Scalars['String']['output'];
  /** The priority of the issue. Returns P3 if null in Jira */
  priority: TicketPriority;
  /** The status of the issue */
  status: TicketStatus;
  /** The summary of the issue */
  summary: Scalars['String']['output'];
  /** The apollo user who created this issue */
  user?: Maybe<User>;
};

export type SupportTicketInput = {
  apolloOrgId?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  displayName: Scalars['String']['input'];
  email: Scalars['String']['input'];
  emailUsers?: InputMaybe<Array<Scalars['String']['input']>>;
  graphId?: InputMaybe<Scalars['String']['input']>;
  graphType?: InputMaybe<GraphType>;
  priority: TicketPriority;
  summary: Scalars['String']['input'];
};

export type Survey = {
  __typename?: 'Survey';
  id: Scalars['String']['output'];
  isComplete: Scalars['Boolean']['output'];
  questionAnswers: Array<SurveyQuestionAnswer>;
  shouldShow: Scalars['Boolean']['output'];
};

export type SurveyQuestionAnswer = {
  __typename?: 'SurveyQuestionAnswer';
  answerDetails?: Maybe<Scalars['String']['output']>;
  answerValue?: Maybe<Scalars['String']['output']>;
  questionKey: Scalars['String']['output'];
};

export type SurveyQuestionInput = {
  answerDetails?: InputMaybe<Scalars['String']['input']>;
  answerKey: Scalars['String']['input'];
  answerKeyVersion?: InputMaybe<Scalars['Int']['input']>;
  answerValue?: InputMaybe<Scalars['String']['input']>;
  questionKey: Scalars['String']['input'];
  questionKeyVersion?: InputMaybe<Scalars['Int']['input']>;
  wasSkipped: Scalars['Boolean']['input'];
};

export type SyncBillingAccountResult = PermissionError | SyncBillingAccountSuccess;

export type SyncBillingAccountSuccess = {
  __typename?: 'SyncBillingAccountSuccess';
  message: Scalars['String']['output'];
};

/** User input for a resource share mutation */
export type SyncPrivateSubgraphsInput = {
  /** A unique identifier for the private subgraph */
  identifier: Scalars['String']['input'];
  /** The cloud provider where the private subgraph is hosted */
  provider: CloudProvider;
};

export type TaskError = {
  __typename?: 'TaskError';
  message: Scalars['String']['output'];
};

export type TemporaryUrl = {
  __typename?: 'TemporaryURL';
  url: Scalars['String']['output'];
};

export type TestRouter = {
  __typename?: 'TestRouter';
  id: Scalars['ID']['output'];
  router?: Maybe<Router>;
  status: TestRouterStatus;
};

/** The current state of a [`TestRouter`] */
export enum TestRouterStatus {
  /** The router has been destroyed */
  DELETED = 'DELETED',
  /** The router is spinning down */
  DELETING = 'DELETING',
  /** The router has entered an errored state as a result of the above */
  ERRORED = 'ERRORED',
  /** The router is spinning up */
  LAUNCHING = 'LAUNCHING',
  /** The router is running */
  RUNNING = 'RUNNING'
}

export enum ThemeName {
  DARK = 'DARK',
  LIGHT = 'LIGHT'
}

/** Throttle error */
export type ThrottleError = Error & {
  __typename?: 'ThrottleError';
  message: Scalars['String']['output'];
  retryAfter?: Maybe<Scalars['Int']['output']>;
};

export enum TicketPriority {
  /** Note that JSM does not have P0 */
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  /** Note that Zendesk does not have P4 */
  P4 = 'P4'
}

export enum TicketStatus {
  /** Canceled */
  CANCELLED = 'CANCELLED',
  /** Closed */
  CLOSED = 'CLOSED',
  /** Escalated */
  ESCALATED = 'ESCALATED',
  /** Zendesk status hold */
  HOLD = 'HOLD',
  /** In Progress */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Zendesk status new */
  NEW = 'NEW',
  /** Zendesk status open */
  OPEN = 'OPEN',
  /** Zendesk status pending */
  PENDING = 'PENDING',
  /** Reopened */
  REOPENED = 'REOPENED',
  /** Resolved */
  RESOLVED = 'RESOLVED',
  /** Zendesk status solved */
  SOLVED = 'SOLVED',
  /** Waiting for customer */
  WAITING_FOR_CUSTOMER = 'WAITING_FOR_CUSTOMER',
  /** Waiting for support */
  WAITING_FOR_SUPPORT = 'WAITING_FOR_SUPPORT'
}

/** Filter options to represent a timestamp range */
export type TimestampFilterInput = {
  /** The start of the range */
  from?: InputMaybe<Scalars['Timestamp']['input']>;
  /** The end of the range */
  to?: InputMaybe<Scalars['Timestamp']['input']>;
};

export type TimezoneOffset = {
  __typename?: 'TimezoneOffset';
  minutesOffsetFromUTC: Scalars['Int']['output'];
  zoneID: Scalars['String']['output'];
};

export type TopNOperationsByErrorPercentageRecord = TopNOperationsRecord & {
  __typename?: 'TopNOperationsByErrorPercentageRecord';
  /** A substring of the query signature for unnamed operations, otherwise the operation name. */
  displayName: Scalars['String']['output'];
  errorPercentage: Scalars['Float']['output'];
  /** The operation name or null if the operation is unnamed. */
  name?: Maybe<Scalars['String']['output']>;
  /** The unique id for this operation. */
  queryID: Scalars['String']['output'];
  type?: Maybe<OperationType>;
};

export type TopNOperationsByP95Record = TopNOperationsRecord & {
  __typename?: 'TopNOperationsByP95Record';
  /** A substring of the query signature for unnamed operations, otherwise the operation name. */
  displayName: Scalars['String']['output'];
  /** The operation name or null if the operation is unnamed. */
  name?: Maybe<Scalars['String']['output']>;
  /** The unique id for this operation. */
  queryID: Scalars['String']['output'];
  serviceTimeP95Ms: Scalars['Float']['output'];
  type?: Maybe<OperationType>;
};

export type TopNOperationsByRequestRateRecord = TopNOperationsRecord & {
  __typename?: 'TopNOperationsByRequestRateRecord';
  /** A substring of the query signature for unnamed operations, otherwise the operation name. */
  displayName: Scalars['String']['output'];
  /** The operation name or null if the operation is unnamed. */
  name?: Maybe<Scalars['String']['output']>;
  /** The unique id for this operation. */
  queryID: Scalars['String']['output'];
  requestCountPerMin: Scalars['Float']['output'];
  type?: Maybe<OperationType>;
};

export type TopNOperationsFilterInput = {
  clientName?: InputMaybe<Scalars['String']['input']>;
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<TopNOperationsFilterInput>;
  or?: InputMaybe<Array<TopNOperationsFilterInput>>;
};

export type TopNOperationsRecord = {
  /** A substring of the query signature for unnamed operations, otherwise the operation name. */
  displayName: Scalars['String']['output'];
  /** The operation name or null if the operation is unnamed. */
  name?: Maybe<Scalars['String']['output']>;
  /** The unique id for this operation. */
  queryID: Scalars['String']['output'];
  type?: Maybe<OperationType>;
};

export type TopNOperationsResult = {
  __typename?: 'TopNOperationsResult';
  /** Top N operations by error percentage (descending). */
  byErrorPercentage: Array<TopNOperationsByErrorPercentageRecord>;
  /** Top N operations by p95 latency (descending). */
  byP95: Array<TopNOperationsByP95Record>;
  /** Top N operations by request rate (descending). */
  byRequestRate: Array<TopNOperationsByRequestRateRecord>;
};

export type TopOperationRecord = {
  __typename?: 'TopOperationRecord';
  /** The graph this operation was reported from. */
  graphId: Scalars['String']['output'];
  /** The graph variant this operation was reported from. */
  graphVariant: Scalars['String']['output'];
  /** The operation name or null if the operation is unnamed. */
  name?: Maybe<Scalars['String']['output']>;
  /** The unique id for this operation. */
  operationId: Scalars['String']['output'];
  /** The total number of requests for this operation for the specified time range. */
  requestCount: Scalars['Long']['output'];
  /** The operation's signature body or null if the signature is unavailable due to parse errors. */
  signature?: Maybe<Scalars['String']['output']>;
  /** The operation type or null if the operation type could not be determined from the signature. */
  type?: Maybe<OperationType>;
};

export enum TopOperationsReportOrderByColumn {
  REQUEST_COUNT = 'REQUEST_COUNT'
}

export type TopOperationsReportOrderByInput = {
  /** The order column used for the operation results. Defaults to ordering by total request count. */
  column: TopOperationsReportOrderByColumn;
  /** The direction used to order operation results. Defaults to descending order. */
  direction: Ordering;
};

export type TopOperationsReportVariantFilterInInput = {
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type TopOperationsReportVariantFilterInput = {
  in: TopOperationsReportVariantFilterInInput;
};

/** Counts of changes. */
export type TotalChangeSummaryCounts = {
  __typename?: 'TotalChangeSummaryCounts';
  /**
   * Number of changes that are additions. This includes adding types, adding fields to object, input
   * object, and interface types, adding values to enums, adding members to interfaces and unions, and
   * adding arguments.
   */
  additions: Scalars['Int']['output'];
  /** Number of changes that are new usages of the @deprecated directive. */
  deprecations: Scalars['Int']['output'];
  /**
   * Number of changes that are edits. This includes types changing kind, fields and arguments
   * changing type, arguments changing default value, and any description changes. This also includes
   * edits to @deprecated reason strings.
   */
  edits: Scalars['Int']['output'];
  /**
   * Number of changes that are removals. This includes removing types, removing fields from object,
   * input object, and interface types, removing values from enums, removing members from interfaces
   * and unions, and removing arguments. This also includes removing @deprecated usages.
   */
  removals: Scalars['Int']['output'];
};

export type Trace = {
  __typename?: 'Trace';
  agentVersion?: Maybe<Scalars['String']['output']>;
  cacheMaxAgeMs?: Maybe<Scalars['Float']['output']>;
  cacheScope?: Maybe<CacheScope>;
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  durationMs: Scalars['Float']['output'];
  endTime: Scalars['Timestamp']['output'];
  http?: Maybe<TraceHttp>;
  id: Scalars['ID']['output'];
  /**
   * True if the report containing the trace was submitted as potentially incomplete, which can happen if the Router's
   * trace buffer fills up while constructing the trace. If this is true, the trace might be missing some nodes.
   */
  isIncomplete: Scalars['Boolean']['output'];
  operationName?: Maybe<Scalars['String']['output']>;
  protobuf: Protobuf;
  root: TraceNode;
  signature: Scalars['String']['output'];
  startTime: Scalars['Timestamp']['output'];
  unexecutedOperationBody?: Maybe<Scalars['String']['output']>;
  unexecutedOperationName?: Maybe<Scalars['String']['output']>;
  variablesJSON: Array<StringToString>;
};

export type TraceError = {
  __typename?: 'TraceError';
  errorCode?: Maybe<Scalars['String']['output']>;
  errorService?: Maybe<Scalars['String']['output']>;
  json: Scalars['String']['output'];
  locations: Array<TraceSourceLocation>;
  message: Scalars['String']['output'];
  timestamp?: Maybe<Scalars['Timestamp']['output']>;
};

export type TraceHttp = {
  __typename?: 'TraceHTTP';
  method: HttpMethod;
  requestHeaders: Array<StringToString>;
  responseHeaders: Array<StringToString>;
  statusCode: Scalars['Int']['output'];
};

export type TraceNode = {
  __typename?: 'TraceNode';
  /** Additional metadata for the node, presented in key-value pairs. */
  attributes: Array<StringToString>;
  cacheMaxAgeMs?: Maybe<Scalars['Float']['output']>;
  cacheScope?: Maybe<CacheScope>;
  /** The total number of children, including the ones that were truncated. */
  childCount: Scalars['Int']['output'];
  /** Whether the children of this node have been truncated because the number of children is over the max. */
  childrenAreTruncated: Scalars['Boolean']['output'];
  /**
   * All children, and the children of those children, and so on. Children that have been truncated
   * are not included.
   */
  descendants: Array<TraceNode>;
  /**
   * The end time of the node. If this is a fetch node (meaning isFetch is true), this will be the
   * time that the gateway/router received the response from the subgraph server in the
   * gateway/routers clock time.
   */
  endTime: Scalars['Timestamp']['output'];
  errors: Array<TraceError>;
  id: Scalars['ID']['output'];
  /**
   * Whether the fetch node in question is a descendent of a Deferred node in the trace's query plan. The nodes
   * in query plans can be complicated and nested, so this is a fairly simple representation of the structure.
   */
  isDeferredFetch: Scalars['Boolean']['output'];
  /**
   * Whether the node in question represents a fetch node within a query plan. If so, this will contain
   * children with timestamps that are calculated by the router/gateway rather than subgraph and the
   * fields subgraphStartTime and subgraphEndTime will be non-null.
   */
  isFetch: Scalars['Boolean']['output'];
  key?: Maybe<Scalars['StringOrInt']['output']>;
  /** A classification which helps to differentiate between types of nodes (intended for display / filtering purposes). */
  kind: TraceNodeKind;
  originalFieldName?: Maybe<Scalars['String']['output']>;
  parentId?: Maybe<Scalars['ID']['output']>;
  /**
   * If the node is a field resolver, the field's parent type; e.g. "User" for User.email
   * otherwise null.
   */
  parentType?: Maybe<Scalars['String']['output']>;
  /**
   * The start time of the node. If this is a fetch node (meaning isFetch is true), this will be the
   * time that the gateway/router sent the request to the subgraph server in the gateway/router's clock
   * time.
   */
  startTime: Scalars['Timestamp']['output'];
  /**
   * Only present when the node in question is a fetch node, this will indicate the timestamp at which
   * the subgraph server returned a response to the gateway/router. This timestamp is based on the
   * subgraph server's clock, so if there is a clock skew between the subgraph and the gateway/router,
   * this and endTime will not be in sync. If this is a fetch node but we don't receive subgraph traces
   * (e.g. if the subgraph doesn't support federated traces), this value will be null.
   */
  subgraphEndTime?: Maybe<Scalars['Timestamp']['output']>;
  /** If present, indicates the subgraph context a node is associated with. */
  subgraphName?: Maybe<Scalars['String']['output']>;
  /**
   * Only present when the node in question is a fetch node, this will indicate the timestamp at which
   * the fetch was received by the subgraph server. This timestamp is based on the subgraph server's
   * clock, so if there is a clock skew between the subgraph and the gateway/router, this and startTime
   * will not be in sync. If this is a fetch node but we don't receive subgraph traces (e.g. if the
   * subgraph doesn't support federated traces), this value will be null.
   */
  subgraphStartTime?: Maybe<Scalars['Timestamp']['output']>;
  /**
   * If the node is a field resolver, the field's return type; e.g. "String!" for User.email:String!
   * otherwise an empty string.
   */
  type?: Maybe<Scalars['String']['output']>;
};

export enum TraceNodeKind {
  ARRAY_INDEX_RESOLVER = 'ARRAY_INDEX_RESOLVER',
  FIELD_RESOLVER = 'FIELD_RESOLVER',
  REQUEST = 'REQUEST',
  ROUTER_INTERNAL = 'ROUTER_INTERNAL',
  SUBGRAPH_REQUEST = 'SUBGRAPH_REQUEST',
  USER_PLUGIN = 'USER_PLUGIN'
}

/** Columns of TracePathErrorsRefs. */
export enum TracePathErrorsRefsColumn {
  CLIENT_NAME = 'CLIENT_NAME',
  CLIENT_VERSION = 'CLIENT_VERSION',
  DURATION_BUCKET = 'DURATION_BUCKET',
  ERRORS_COUNT_IN_PATH = 'ERRORS_COUNT_IN_PATH',
  ERRORS_COUNT_IN_TRACE = 'ERRORS_COUNT_IN_TRACE',
  ERROR_CODE = 'ERROR_CODE',
  ERROR_MESSAGE = 'ERROR_MESSAGE',
  ERROR_SERVICE = 'ERROR_SERVICE',
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  durationBucket?: Maybe<Scalars['Int']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  errorService?: Maybe<Scalars['String']['output']>;
  /** If metrics were collected from a federated service, this field will be prefixed with `service:<SERVICE_NAME>.` */
  path?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
  traceHttpStatusCode?: Maybe<Scalars['Int']['output']>;
  traceId?: Maybe<Scalars['ID']['output']>;
  traceStartsAt?: Maybe<Scalars['Timestamp']['output']>;
};

/** Filter for data in TracePathErrorsRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type TracePathErrorsRefsFilter = {
  and?: InputMaybe<Array<TracePathErrorsRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']['input']>;
  /** Selects rows whose errorCode dimension equals the given value if not null. To query for the null value, use {in: {errorCode: [null]}} instead. */
  errorCode?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorMessage dimension equals the given value if not null. To query for the null value, use {in: {errorMessage: [null]}} instead. */
  errorMessage?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose errorService dimension equals the given value if not null. To query for the null value, use {in: {errorService: [null]}} instead. */
  errorService?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<TracePathErrorsRefsFilterIn>;
  not?: InputMaybe<TracePathErrorsRefsFilter>;
  or?: InputMaybe<Array<TracePathErrorsRefsFilter>>;
  /** Selects rows whose path dimension equals the given value if not null. To query for the null value, use {in: {path: [null]}} instead. */
  path?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose traceHttpStatusCode dimension equals the given value if not null. To query for the null value, use {in: {traceHttpStatusCode: [null]}} instead. */
  traceHttpStatusCode?: InputMaybe<Scalars['Int']['input']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in TracePathErrorsRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type TracePathErrorsRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Selects rows whose errorCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorCode?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorMessage dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorMessage?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose errorService dimension is in the given list. A null value in the list means a row with null for that dimension. */
  errorService?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose traceHttpStatusCode dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceHttpStatusCode?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type TracePathErrorsRefsMetrics = {
  __typename?: 'TracePathErrorsRefsMetrics';
  errorsCountInPath: Scalars['Long']['output'];
  errorsCountInTrace: Scalars['Long']['output'];
  traceSizeBytes: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
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
  clientName?: Maybe<Scalars['String']['output']>;
  clientVersion?: Maybe<Scalars['String']['output']>;
  durationBucket?: Maybe<Scalars['Int']['output']>;
  generatedTraceId?: Maybe<Scalars['String']['output']>;
  operationSubtype?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  queryId?: Maybe<Scalars['ID']['output']>;
  queryName?: Maybe<Scalars['String']['output']>;
  querySignature?: Maybe<Scalars['String']['output']>;
  schemaHash?: Maybe<Scalars['String']['output']>;
  schemaTag?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
  traceId?: Maybe<Scalars['ID']['output']>;
};

/** Filter for data in TraceRefs. Fields with dimension names represent equality checks. All fields are implicitly ANDed together. */
export type TraceRefsFilter = {
  and?: InputMaybe<Array<TraceRefsFilter>>;
  /** Selects rows whose clientName dimension equals the given value if not null. To query for the null value, use {in: {clientName: [null]}} instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose clientVersion dimension equals the given value if not null. To query for the null value, use {in: {clientVersion: [null]}} instead. */
  clientVersion?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose durationBucket dimension equals the given value if not null. To query for the null value, use {in: {durationBucket: [null]}} instead. */
  durationBucket?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<TraceRefsFilterIn>;
  not?: InputMaybe<TraceRefsFilter>;
  /** Selects rows whose operationSubtype dimension equals the given value if not null. To query for the null value, use {in: {operationSubtype: [null]}} instead. */
  operationSubtype?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose operationType dimension equals the given value if not null. To query for the null value, use {in: {operationType: [null]}} instead. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<TraceRefsFilter>>;
  /** Selects rows whose queryId dimension equals the given value if not null. To query for the null value, use {in: {queryId: [null]}} instead. */
  queryId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose queryName dimension equals the given value if not null. To query for the null value, use {in: {queryName: [null]}} instead. */
  queryName?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaHash dimension equals the given value if not null. To query for the null value, use {in: {schemaHash: [null]}} instead. */
  schemaHash?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose schemaTag dimension equals the given value if not null. To query for the null value, use {in: {schemaTag: [null]}} instead. */
  schemaTag?: InputMaybe<Scalars['String']['input']>;
  /** Selects rows whose serviceId dimension equals the given value if not null. To query for the null value, use {in: {serviceId: [null]}} instead. */
  serviceId?: InputMaybe<Scalars['ID']['input']>;
  /** Selects rows whose traceId dimension equals the given value if not null. To query for the null value, use {in: {traceId: [null]}} instead. */
  traceId?: InputMaybe<Scalars['ID']['input']>;
};

/** Filter for data in TraceRefs. Fields match if the corresponding dimension's value is in the given list. All fields are implicitly ANDed together. */
export type TraceRefsFilterIn = {
  /** Selects rows whose clientName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose clientVersion dimension is in the given list. A null value in the list means a row with null for that dimension. */
  clientVersion?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose durationBucket dimension is in the given list. A null value in the list means a row with null for that dimension. */
  durationBucket?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Selects rows whose operationSubtype dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationSubtype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose operationType dimension is in the given list. A null value in the list means a row with null for that dimension. */
  operationType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose queryId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose queryName dimension is in the given list. A null value in the list means a row with null for that dimension. */
  queryName?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaHash dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaHash?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose schemaTag dimension is in the given list. A null value in the list means a row with null for that dimension. */
  schemaTag?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Selects rows whose serviceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  serviceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** Selects rows whose traceId dimension is in the given list. A null value in the list means a row with null for that dimension. */
  traceId?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type TraceRefsMetrics = {
  __typename?: 'TraceRefsMetrics';
  traceCount: Scalars['Long']['output'];
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
  timestamp: Scalars['Timestamp']['output'];
};

export type TraceSourceLocation = {
  __typename?: 'TraceSourceLocation';
  column: Scalars['Int']['output'];
  line: Scalars['Int']['output'];
};

/** Counts of changes at the type level, including interfaces, unions, enums, scalars, input objects, etc. */
export type TypeChangeSummaryCounts = {
  __typename?: 'TypeChangeSummaryCounts';
  /** Number of changes that are additions of types. */
  additions: Scalars['Int']['output'];
  /**
   * Number of changes that are edits. This includes types changing kind and any type description
   * changes, but also includes adding/removing values from enums, adding/removing members from
   * interfaces and unions, and any enum value deprecation and description changes.
   */
  edits: Scalars['Int']['output'];
  /** Number of changes that are removals of types. */
  removals: Scalars['Int']['output'];
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
  includeAbstractTypes?: InputMaybe<Scalars['Boolean']['input']>;
  /** include built in scalars (i.e. Boolean, Int, etc) */
  includeBuiltInTypes?: InputMaybe<Scalars['Boolean']['input']>;
  /** include reserved introspection types (i.e. __Type) */
  includeIntrospectionTypes?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Uri = {
  __typename?: 'URI';
  /** A GCS URI */
  gcs: Scalars['String']['output'];
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

/** The result/error union returned by GraphVariantMutation.unlinkPersistedQueryList. */
export type UnlinkPersistedQueryListResultOrError = PermissionError | UnlinkPersistedQueryListResult | VariantAlreadyUnlinkedError;

/** Input to update an AWS shard */
export type UpdateAwsShardInput = {
  accountId?: InputMaybe<Scalars['String']['input']>;
  coldStartTargetGroupArns?: InputMaybe<Array<Scalars['String']['input']>>;
  ecsClusterArn?: InputMaybe<Scalars['String']['input']>;
  iamRoleArn?: InputMaybe<Scalars['String']['input']>;
  loadbalancerSecurityGroupId?: InputMaybe<Scalars['String']['input']>;
  loadbalancers?: InputMaybe<Array<AwsLoadBalancerInput>>;
  permissionsBoundaryArn?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  subnetIds?: InputMaybe<Array<Scalars['String']['input']>>;
  vpcId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBillingPlanDescriptorsInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  readableId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateBillingPlanInput = {
  billingModel: BillingModel;
  clientVersions?: InputMaybe<Scalars['Boolean']['input']>;
  clients?: InputMaybe<Scalars['Boolean']['input']>;
  contracts?: InputMaybe<Scalars['Boolean']['input']>;
  datadog?: InputMaybe<Scalars['Boolean']['input']>;
  errors: Scalars['Boolean']['input'];
  federation?: InputMaybe<Scalars['Boolean']['input']>;
  intervalLength: Scalars['Int']['input'];
  intervalUnit: Scalars['String']['input'];
  kind: BillingPlanKind;
  launches?: InputMaybe<Scalars['Boolean']['input']>;
  maxAuditInDays?: InputMaybe<Scalars['Int']['input']>;
  maxRangeInDays?: InputMaybe<Scalars['Int']['input']>;
  maxSelfHostedRequestsPerMonth?: InputMaybe<Scalars['Long']['input']>;
  metrics?: InputMaybe<Scalars['Boolean']['input']>;
  notifications?: InputMaybe<Scalars['Boolean']['input']>;
  operationRegistry?: InputMaybe<Scalars['Boolean']['input']>;
  persistedQueries?: InputMaybe<Scalars['Boolean']['input']>;
  proposals?: InputMaybe<Scalars['Boolean']['input']>;
  public: Scalars['Boolean']['input'];
  schemaValidation?: InputMaybe<Scalars['Boolean']['input']>;
  sso?: InputMaybe<Scalars['Boolean']['input']>;
  traces?: InputMaybe<Scalars['Boolean']['input']>;
  userRoles?: InputMaybe<Scalars['Boolean']['input']>;
  webhooks?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Input to update a proposal description */
export type UpdateDescriptionInput = {
  /** A proposal description */
  description: Scalars['String']['input'];
};

export type UpdateOperationCollectionEntryResult = OperationCollectionEntry | PermissionError | ValidationError;

export type UpdateOperationCollectionResult = OperationCollection | PermissionError | ValidationError;

export type UpdatePaymentMethodResult = Account | NotFoundError | PermissionError | UpdatePaymentMethodSuccess;

export type UpdatePaymentMethodSuccess = {
  __typename?: 'UpdatePaymentMethodSuccess';
  paymentMethodId: Scalars['String']['output'];
};

/** The result of a successful call to PersistedQueryListMutation.updateMetadata. */
export type UpdatePersistedQueryListMetadataResult = {
  __typename?: 'UpdatePersistedQueryListMetadataResult';
  persistedQueryList: PersistedQueryList;
};

/** The result/error union returned by PersistedQueryListMutation.updateMetadata. */
export type UpdatePersistedQueryListMetadataResultOrError = PermissionError | UpdatePersistedQueryListMetadataResult;

export type UpdateProposalLifecycleSubscriptionInput = {
  events: Array<ProposalLifecycleEvent>;
  id: Scalars['ID']['input'];
};

export type UpdateProposalLifecycleSubscriptionResult = NotFoundError | PermissionError | ProposalLifecycleSubscription | ValidationError;

export type UpdateProposalResult = PermissionError | Proposal | ValidationError;

export type UpdateRequestedReviewersInput = {
  reviewerUserIdsToAdd?: InputMaybe<Array<Scalars['ID']['input']>>;
  reviewerUserIdsToRemove?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type UpdateRequestedReviewersResult = PermissionError | Proposal | ValidationError;

/** Input for updating a  Cloud Router */
export type UpdateRouterInput = {
  /**
   * Number of GCUs allocated for the Cloud Router
   *
   * This is ignored for serverless Cloud Routers
   */
  gcus?: InputMaybe<Scalars['Int']['input']>;
  /** Graph composition ID, also known as launch ID */
  graphCompositionId?: InputMaybe<Scalars['String']['input']>;
  /** Unique identifier for ordering orders */
  orderingId: Scalars['String']['input'];
  /** Configuration for the Cloud Router */
  routerConfig?: InputMaybe<Scalars['String']['input']>;
  /** Router version for the Cloud Router */
  routerVersion?: InputMaybe<Scalars['String']['input']>;
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
export type UpdateRouterVersionResult = InternalServerError | InvalidInputErrors | RouterVersion;

export type UpdateRuleEnforcementInput = {
  /** A json string representing any parameters necessary for the policy's enforcement. Explicit null setting is allowed. */
  params?: InputMaybe<Array<StringToStringInput>>;
};

/** Input to update an existing Shard */
export type UpdateShardInput = {
  aws?: InputMaybe<UpdateAwsShardInput>;
  gcuCapacity?: InputMaybe<Scalars['Int']['input']>;
  gcuUsage?: InputMaybe<Scalars['Int']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  routerCapacity?: InputMaybe<Scalars['Int']['input']>;
  routerUsage?: InputMaybe<Scalars['Int']['input']>;
  shardId: Scalars['String']['input'];
  status?: InputMaybe<ShardStatus>;
};

/** Describes the result of publishing a schema to a graph variant. */
export type UploadSchemaMutationResponse = {
  __typename?: 'UploadSchemaMutationResponse';
  /** A machine-readable response code that indicates the type of result (e.g., `UPLOAD_SUCCESS` or `NO_CHANGES`) */
  code: Scalars['String']['output'];
  /** A Human-readable message describing the type of result. */
  message: Scalars['String']['output'];
  /** If the publish operation succeeded, this contains its details. Otherwise, this is null. */
  publication?: Maybe<SchemaTag>;
  /** Whether the schema publish operation succeeded (`true`) or encountered errors (`false`). */
  success: Scalars['Boolean']['output'];
  /** If successful, the corresponding publication. */
  tag?: Maybe<SchemaTag>;
};

export type UpsertReviewInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  decision: ReviewDecision;
  revisionId: Scalars['ID']['input'];
};

export type UpsertReviewResult = PermissionError | Proposal | ValidationError;

export type UpsertRouterResult = GraphVariant | RouterUpsertFailure;

/** A registered Apollo Studio user. */
export type User = Identity & {
  __typename?: 'User';
  acceptedPrivacyPolicyAt?: Maybe<Scalars['Timestamp']['output']>;
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
  avatarUrl?: Maybe<Scalars['String']['output']>;
  betaFeaturesOn: Scalars['Boolean']['output'];
  canUpdateAvatar: Scalars['Boolean']['output'];
  canUpdateEmail: Scalars['Boolean']['output'];
  canUpdateFullName: Scalars['Boolean']['output'];
  createdAt: Scalars['Timestamp']['output'];
  education?: Maybe<Education>;
  email?: Maybe<Scalars['String']['output']>;
  emailModifiedAt?: Maybe<Scalars['Timestamp']['output']>;
  emailVerified: Scalars['Boolean']['output'];
  featureIntros?: Maybe<FeatureIntros>;
  fullName: Scalars['String']['output'];
  /** The user's GitHub username, if they log in via GitHub. May be null even for GitHub users in some edge cases. */
  githubUsername?: Maybe<Scalars['String']['output']>;
  /** The user's unique ID. */
  id: Scalars['ID']['output'];
  /**
   * This role is reserved exclusively for internal Apollo employees, and it controls what access they may have to other
   * organizations. Only admins are allowed to see this field.
   */
  internalAdminRole?: Maybe<InternalMdgAdminRole>;
  /** Whether or not this user is and internal Apollo employee */
  isInternalUser: Scalars['Boolean']['output'];
  isSsoV2: Scalars['Boolean']['output'];
  /** Last time any API token from this user was used against AGM services */
  lastAuthenticatedAt?: Maybe<Scalars['Timestamp']['output']>;
  loginFlowSource?: Maybe<LoginFlowSource>;
  logoutAfterIdleMs?: Maybe<Scalars['Int']['output']>;
  /** A list of the user's memberships in Apollo Studio organizations. */
  memberships: Array<UserMembership>;
  /** The user's first and last name. */
  name: Scalars['String']['output'];
  odysseyAttempt?: Maybe<OdysseyAttempt>;
  odysseyAttempts?: Maybe<Array<OdysseyAttempt>>;
  odysseyCertification?: Maybe<OdysseyCertification>;
  odysseyCertifications: Array<OdysseyCertification>;
  odysseyCourse?: Maybe<OdysseyCourse>;
  odysseyCourses?: Maybe<Array<OdysseyCourse>>;
  /** @deprecated Unused. Remove from application usage */
  odysseyHasEarlyAccess: Scalars['Boolean']['output'];
  /** @deprecated Unused. Remove from application usage */
  odysseyHasRequestedEarlyAccess: Scalars['Boolean']['output'];
  odysseyTasks?: Maybe<Array<OdysseyTask>>;
  sandboxOperationCollections: Array<OperationCollection>;
  /** List of support tickets this user has submitted */
  supportTickets?: Maybe<Array<SupportTicket>>;
  synchronized: Scalars['Boolean']['output'];
  type: UserType;
};


/** A registered Apollo Studio user. */
export type UserApiKeysArgs = {
  includeCookies?: InputMaybe<Scalars['Boolean']['input']>;
};


/** A registered Apollo Studio user. */
export type UserAvatarUrlArgs = {
  size?: Scalars['Int']['input'];
};


/** A registered Apollo Studio user. */
export type UserOdysseyAttemptArgs = {
  id: Scalars['ID']['input'];
};


/** A registered Apollo Studio user. */
export type UserOdysseyCertificationArgs = {
  certificationId: Scalars['ID']['input'];
};


/** A registered Apollo Studio user. */
export type UserOdysseyCourseArgs = {
  courseId: Scalars['ID']['input'];
};


/** A registered Apollo Studio user. */
export type UserOdysseyTasksArgs = {
  in?: InputMaybe<Array<Scalars['ID']['input']>>;
};

/**
 * Represents a user API key, which has permissions identical to
 * its associated Apollo user.
 */
export type UserApiKey = ApiKey & {
  __typename?: 'UserApiKey';
  /** The API key's ID. */
  id: Scalars['ID']['output'];
  /** The API key's name, for distinguishing it from other keys. */
  keyName?: Maybe<Scalars['String']['output']>;
  /** The value of the API key. **This is a secret credential!** */
  token: Scalars['String']['output'];
};

/** A single user's membership in a single Apollo Studio organization. */
export type UserMembership = {
  __typename?: 'UserMembership';
  /** The organization that the user belongs to. */
  account: Account;
  /** The timestamp when the user was added to the organization. */
  createdAt: Scalars['Timestamp']['output'];
  /**
   * The user's permission level within the organization.
   * @deprecated Use role instead.
   */
  permission: UserPermission;
  /** The user's role within the organization'. */
  role: UserPermission;
  /** The user that belongs to the organization. */
  user: User;
};

export type UserMutation = {
  __typename?: 'UserMutation';
  acceptPrivacyPolicy?: Maybe<Scalars['Void']['output']>;
  /** Change the user's password */
  changePassword?: Maybe<Scalars['Void']['output']>;
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
  hardDelete?: Maybe<Scalars['Void']['output']>;
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
  removeKey?: Maybe<Scalars['Void']['output']>;
  /** Sets a new name for the user API key with the provided ID, if any. This does not invalidate the key or change its value. */
  renameKey?: Maybe<UserApiKey>;
  resendVerificationEmail?: Maybe<Scalars['Void']['output']>;
  setOdysseyCourse?: Maybe<OdysseyCourse>;
  setOdysseyCourseLanguage: OdysseyCourse;
  setOdysseyResponse?: Maybe<OdysseyResponse>;
  setOdysseyTask?: Maybe<OdysseyTask>;
  /** Submit a support ticket for this user */
  submitSupportTicket?: Maybe<SupportTicket>;
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


export type UserMutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  previousPassword: Scalars['String']['input'];
};


export type UserMutationCompleteOdysseyAttemptArgs = {
  id: Scalars['ID']['input'];
  pass: Scalars['Boolean']['input'];
  responses: Array<OdysseyResponseCorrectnessInput>;
};


export type UserMutationCreateOdysseyAttemptArgs = {
  testId: Scalars['String']['input'];
};


export type UserMutationCreateOdysseyCertificationArgs = {
  certificationId: Scalars['String']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
};


export type UserMutationCreateOdysseyCoursesArgs = {
  courses: Array<OdysseyCourseInput>;
};


export type UserMutationCreateOdysseyTasksArgs = {
  tasks: Array<OdysseyTaskInput>;
};


export type UserMutationDeleteOdysseyAttemptArgs = {
  id: Scalars['ID']['input'];
};


export type UserMutationDeleteOdysseyCertificationArgs = {
  id: Scalars['ID']['input'];
};


export type UserMutationDeleteOdysseyCourseArgs = {
  courseId: Scalars['String']['input'];
};


export type UserMutationDeleteOdysseyTasksArgs = {
  taskIds: Array<Scalars['String']['input']>;
};


export type UserMutationNewKeyArgs = {
  keyName: Scalars['String']['input'];
};


export type UserMutationProvisionKeyArgs = {
  keyName?: Scalars['String']['input'];
};


export type UserMutationRemoveKeyArgs = {
  id: Scalars['ID']['input'];
};


export type UserMutationRenameKeyArgs = {
  id: Scalars['ID']['input'];
  newKeyName?: InputMaybe<Scalars['String']['input']>;
};


export type UserMutationSetOdysseyCourseArgs = {
  course: OdysseyCourseInput;
};


export type UserMutationSetOdysseyCourseLanguageArgs = {
  courseId: Scalars['ID']['input'];
  language: Scalars['String']['input'];
};


export type UserMutationSetOdysseyResponseArgs = {
  response: OdysseyResponseInput;
};


export type UserMutationSetOdysseyTaskArgs = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  courseLanguage?: InputMaybe<Scalars['String']['input']>;
  task: OdysseyTaskInput;
};


export type UserMutationSubmitSupportTicketArgs = {
  ticket: SupportTicketInput;
};


export type UserMutationUpdateArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  referrer?: InputMaybe<Scalars['String']['input']>;
  trackingGoogleClientId?: InputMaybe<Scalars['String']['input']>;
  trackingMarketoClientId?: InputMaybe<Scalars['String']['input']>;
  userSegment?: InputMaybe<UserSegment>;
  utmCampaign?: InputMaybe<Scalars['String']['input']>;
  utmMedium?: InputMaybe<Scalars['String']['input']>;
  utmSource?: InputMaybe<Scalars['String']['input']>;
};


export type UserMutationUpdateBetaFeaturesOnArgs = {
  betaFeaturesOn: Scalars['Boolean']['input'];
};


export type UserMutationUpdateFeatureIntrosArgs = {
  newFeatureIntros?: InputMaybe<FeatureIntrosInput>;
};


export type UserMutationUpdateOdysseyAttemptArgs = {
  completedAt?: InputMaybe<Scalars['Timestamp']['input']>;
  id: Scalars['ID']['input'];
  pass?: InputMaybe<Scalars['Boolean']['input']>;
};


export type UserMutationUpdateRoleArgs = {
  newRole?: InputMaybe<InternalMdgAdminRole>;
};


export type UserMutationVerifyEmailArgs = {
  token: Scalars['String']['input'];
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
  appNavCollapsed: Scalars['Boolean']['output'];
  autoManageVariables: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  mockingResponses: Scalars['Boolean']['output'];
  preflightScriptEnabled: Scalars['Boolean']['output'];
  responseHints: ResponseHints;
  tableMode: Scalars['Boolean']['output'];
  themeName: ThemeName;
};

/** Explorer user settings input */
export type UserSettingsInput = {
  appNavCollapsed?: InputMaybe<Scalars['Boolean']['input']>;
  autoManageVariables?: InputMaybe<Scalars['Boolean']['input']>;
  mockingResponses?: InputMaybe<Scalars['Boolean']['input']>;
  preflightScriptEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  responseHints?: InputMaybe<ResponseHints>;
  tableMode?: InputMaybe<Scalars['Boolean']['input']>;
  themeName?: InputMaybe<ThemeName>;
};

export type UserTrackingInput = {
  referrer?: InputMaybe<Scalars['String']['input']>;
  referrerDetails?: InputMaybe<Scalars['String']['input']>;
  sessionReferrer?: InputMaybe<Scalars['String']['input']>;
  sessionReferrerCreatedAt?: InputMaybe<Scalars['Timestamp']['input']>;
  sessionReferrerDetail?: InputMaybe<Scalars['String']['input']>;
  trackingGoogleClientId?: InputMaybe<Scalars['String']['input']>;
  trackingMarketoClientId?: InputMaybe<Scalars['String']['input']>;
  userSegment?: InputMaybe<UserSegment>;
  utmCampaign?: InputMaybe<Scalars['String']['input']>;
  utmMedium?: InputMaybe<Scalars['String']['input']>;
  utmSource?: InputMaybe<Scalars['String']['input']>;
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
  message: Scalars['String']['output'];
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
  description: Scalars['String']['output'];
  /** The operation related to this validation result */
  operation: OperationDocument;
  /** The type of validation error thrown - warning, failure, or invalid. */
  type: ValidationErrorType;
};

/** The result of a failed call to GraphVariantMutation.linkPersistedQueryList when the specified list is already linked. */
export type VariantAlreadyLinkedError = Error & {
  __typename?: 'VariantAlreadyLinkedError';
  message: Scalars['String']['output'];
};

/** The result of a failed call to GraphVariantMutation.unlinkPersistedQueryList when the specified list isn't linked. */
export type VariantAlreadyUnlinkedError = Error & {
  __typename?: 'VariantAlreadyUnlinkedError';
  message: Scalars['String']['output'];
};

/** Variant-level configuration of checks. */
export type VariantCheckConfiguration = {
  __typename?: 'VariantCheckConfiguration';
  /** Time when the check configuration was created. */
  createdAt: Scalars['Timestamp']['output'];
  customChecksConfig: VariantCheckConfigurationCustomChecks;
  /** Operation checks configuration that allows associated checks to be downgraded from failure to passing. */
  downgradeChecksConfig: VariantCheckConfigurationDowngradeChecks;
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
  graphID: Scalars['String']['output'];
  /** Graph variant that this check configuration belongs to */
  graphVariant: Scalars['String']['output'];
  /** ID of the check configuration */
  id: Scalars['ID']['output'];
  /** Operation checks configuration for which variants' metrics data to include. */
  includedVariantsConfig: VariantCheckConfigurationIncludedVariants;
  /** Whether operations checks are enabled. */
  operationsChecksEnabled: Scalars['Boolean']['output'];
  /** How submitted build input diffs are handled when they match (or don't) a Proposal at the variant level */
  proposalChangeMismatchSeverityConfig: VariantCheckConfigurationProposalChangeMismatchSeverity;
  /** Operation checks configuration for time range and associated thresholds. */
  timeRangeConfig: VariantCheckConfigurationTimeRange;
  /** Time when the check configuration was updated. */
  updatedAt: Scalars['Timestamp']['output'];
  /** Identity of the last actor to update the check configuration, if available. */
  updatedBy?: Maybe<Identity>;
};

export type VariantCheckConfigurationCustomChecks = {
  __typename?: 'VariantCheckConfigurationCustomChecks';
  /** ID of the check configuration */
  checkConfigurationId: Scalars['ID']['output'];
  /** Whether custom checks is enabled for this variant. Non-null if useGraphSettings is false, otherwise null. */
  enableCustomChecks?: Maybe<Scalars['Boolean']['output']>;
  /** When true, indicates that graph-level configuration is used for this variant setting. The default at variant creation is true. */
  useGraphSettings: Scalars['Boolean']['output'];
};

export type VariantCheckConfigurationDowngradeChecks = {
  __typename?: 'VariantCheckConfigurationDowngradeChecks';
  /**
   *  During operation checks, if this option is enabled, the check will not fail or mark any operations as
   * broken/changed if the default value has changed, only if the default value is removed completely.
   */
  downgradeDefaultValueChange?: Maybe<Scalars['Boolean']['output']>;
  /**
   *  During operation checks, if this option is enabled, it evaluates a check run against zero operations
   * as a pass instead of a failure.
   */
  downgradeStaticChecks?: Maybe<Scalars['Boolean']['output']>;
  /**
   * When true, indicates that graph-level configuration is used for this variant setting. The default
   * at variant creation is true.
   */
  useGraphSettings: Scalars['Boolean']['output'];
};

export type VariantCheckConfigurationDownstreamVariants = {
  __typename?: 'VariantCheckConfigurationDownstreamVariants';
  /**
   * During downstream checks, this variant's check workflow will wait for all downstream check
   * workflows for <blockingDownstreamVariants> variants to complete, and if any of them fail, then
   * this variant's check workflow will fail.
   */
  blockingDownstreamVariants: Array<Scalars['String']['output']>;
};

export type VariantCheckConfigurationExcludedClients = {
  __typename?: 'VariantCheckConfigurationExcludedClients';
  /**
   * When true, indicates that graph-level configuration is appended to the variant-level
   * configuration. The default at variant creation is true.
   */
  appendGraphSettings: Scalars['Boolean']['output'];
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
  appendGraphSettings: Scalars['Boolean']['output'];
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
  includedVariants?: Maybe<Array<Scalars['String']['output']>>;
  /**
   * When true, indicates that graph-level configuration is used for this variant setting. The default
   * at variant creation is true.
   */
  useGraphSettings: Scalars['Boolean']['output'];
};

export type VariantCheckConfigurationProposalChangeMismatchSeverity = {
  __typename?: 'VariantCheckConfigurationProposalChangeMismatchSeverity';
  /** How submitted build input diffs are handled when they match (or don't) a Proposal. Non-null if useGraphSettings is false and is otherwise null. */
  proposalChangeMismatchSeverity?: Maybe<ProposalChangeMismatchSeverity>;
  /** When true, indicates that graph-level configuration is used for this variant setting. The default at variant creation is true. */
  useGraphSettings: Scalars['Boolean']['output'];
};

export type VariantCheckConfigurationTimeRange = {
  __typename?: 'VariantCheckConfigurationTimeRange';
  /**
   * During operation checks, ignore operations that executed less than <operationCountThreshold>
   * times in the time range. Non-null if useGraphSettings is false and is otherwise null.
   */
  operationCountThreshold?: Maybe<Scalars['Int']['output']>;
  /**
   * Duration operation checks, ignore operations that constituted less than
   * <operationCountThresholdPercentage>% of the operations in the time range. Expected values are
   * between 0% and 5%. Non-null if useGraphSettings is false and is otherwise null.
   */
  operationCountThresholdPercentage?: Maybe<Scalars['Float']['output']>;
  /**
   * During operation checks, fetch operations from the last <timeRangeSeconds> seconds. Non-null if
   * useGraphSettings is false and is otherwise null.
   */
  timeRangeSeconds?: Maybe<Scalars['Long']['output']>;
  /**
   * When true, indicates that graph-level configuration is used for this variant setting. The default
   * at variant creation is true.
   */
  useGraphSettings: Scalars['Boolean']['output'];
};

export type VariantCreationConfig = {
  buildConfigInput: BuildConfigInput;
  endpointSlug?: InputMaybe<Scalars['String']['input']>;
  variantName: Scalars['String']['input'];
};

export enum ViolationLevel {
  ERROR = 'ERROR',
  INFO = 'INFO',
  WARNING = 'WARNING'
}

/** Webhook notification channel */
export type WebhookChannel = Channel & {
  __typename?: 'WebhookChannel';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  /** List of the Schema Proposal Lifecycle Subscriptions this Channel is subscribed to. */
  proposalLifecycleSubscriptions: Array<ProposalLifecycleSubscription>;
  secretToken?: Maybe<Scalars['String']['output']>;
  /** List of the subscriptions this channel is subscribed to, except for ProposalLifecycleSubscriptions. */
  subscriptions: Array<ChannelSubscription>;
  url: Scalars['String']['output'];
};

/** PagerDuty notification channel parameters */
export type WebhookChannelInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  secretToken?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type SchemaReportMutationVariables = Exact<{
  report: SchemaReport;
  coreSchema?: InputMaybe<Scalars['String']['input']>;
}>;


export type SchemaReportMutation = { __typename?: 'Mutation', reportSchema?: { __typename: 'ReportSchemaError', message: string, code: ReportSchemaErrorCode } | { __typename: 'ReportSchemaResponse', inSeconds: number, withCoreSchema: boolean } | null };
