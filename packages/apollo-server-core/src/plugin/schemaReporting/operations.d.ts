export type Maybe<T> = T | null;
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
  /** ISO 8601, extended format with nanoseconds, Zulu (or '[+-]seconds' for times relative to now) */
  Timestamp: any;
  /** Long type */
  Long: any;
  /** Arbitrary JSON object */
  Object: any;
  /** A blob (base64'ed in JSON & GraphQL) */
  Blob: any;
  StringOrInt: any;
  /** A GraphQL document */
  GraphQLDocument: any;
  /** Always null */
  Void: any;
  /** A lowercase hexadecimal SHA-256 */
  SHA256: any;
};


export type Account = {
  __typename?: 'Account';
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
  billingInfo?: Maybe<BillingInfo>;
  currentBillingMonth?: Maybe<BillingMonth>;
  currentPlan: BillingPlan;
  currentSubscription?: Maybe<BillingSubscription>;
  /** @deprecated Replaced with Account.inviteLink.role and Account.sso.defaultRole */
  defaultPermission?: Maybe<UserPermission>;
  expiredTrialSubscription?: Maybe<BillingSubscription>;
  graphIDAvailable: Scalars['Boolean'];
  hasBeenOnTrial: Scalars['Boolean'];
  id: Scalars['ID'];
  /**
   * Internal immutable identifier for the account. Only visible to Apollo admins (because it really
   * shouldn't be used in normal client apps).
   */
  internalID: Scalars['ID'];
  invitations?: Maybe<Array<AccountInvitation>>;
  /**
   * A reusable invitation link for the organization.
   * @deprecated Replaced by Account.staticInvitations since Accounts can now have multiple static invitations.
   */
  inviteLink?: Maybe<OrganizationInviteLink>;
  invoices?: Maybe<Array<Invoice>>;
  isOnExpiredTrial: Scalars['Boolean'];
  isOnTrial: Scalars['Boolean'];
  /**
   * Token allowing to join the account using mutation{join(accountId:,token:)}}
   * @deprecated Replaced with Account.inviteLink.joinToken
   */
  joinToken?: Maybe<Scalars['String']>;
  memberships?: Maybe<Array<AccountMembership>>;
  name: Scalars['String'];
  provisionedAt?: Maybe<Scalars['Timestamp']>;
  recurlyEmail?: Maybe<Scalars['String']>;
  requests?: Maybe<Scalars['Long']>;
  requestsInCurrentBillingPeriod?: Maybe<Scalars['Long']>;
  roles?: Maybe<AccountRoles>;
  /** How many seats would be included in your next bill, as best estimated today */
  seatCountForNextBill?: Maybe<Scalars['Int']>;
  seats?: Maybe<Seats>;
  secondaryIDs: Array<Scalars['ID']>;
  services: Array<Service>;
  /**
   * If non-null, this organization tracks its members through an upstream, eg PingOne;
   * invitations are not possible on SSO-synchronized account.
   */
  sso?: Maybe<OrganizationSso>;
  state?: Maybe<AccountState>;
  /** A list of reusable invitations for the organization. */
  staticInvitations?: Maybe<Array<OrganizationInviteLink>>;
  stats: AccountStatsWindow;
  subscriptions?: Maybe<Array<BillingSubscription>>;
  /** @deprecated Replaced with Account.sso */
  synchronized: Scalars['Boolean'];
  /** List of Zendesk tickets submitted for this org */
  tickets?: Maybe<Array<ZendeskTicket>>;
  /** @deprecated Replaced with Account.memberships.user */
  users: Array<User>;
  experimentalFeatures: AccountExperimentalFeatures;
};


export type AccountAvatarUrlArgs = {
  size?: Scalars['Int'];
};


export type AccountGraphIdAvailableArgs = {
  id: Scalars['ID'];
};


export type AccountInvitationsArgs = {
  includeAccepted?: Scalars['Boolean'];
};


export type AccountRequestsArgs = {
  from: Scalars['Timestamp'];
  to: Scalars['Timestamp'];
};


export type AccountServicesArgs = {
  includeDeleted?: Maybe<Scalars['Boolean']>;
};


export type AccountStatsArgs = {
  from: Scalars['Timestamp'];
  resolution?: Maybe<Resolution>;
  to?: Maybe<Scalars['Timestamp']>;
};

/** Columns of AccountEdgeServerInfos. */
export enum AccountEdgeServerInfosColumn {
  BootId = 'BOOT_ID',
  ExecutableSchemaId = 'EXECUTABLE_SCHEMA_ID',
  LibraryVersion = 'LIBRARY_VERSION',
  Platform = 'PLATFORM',
  RuntimeVersion = 'RUNTIME_VERSION',
  SchemaTag = 'SCHEMA_TAG',
  ServerId = 'SERVER_ID',
  ServiceId = 'SERVICE_ID',
  Timestamp = 'TIMESTAMP',
  UserVersion = 'USER_VERSION'
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

/**
 * Filter for data in AccountEdgeServerInfos. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type AccountEdgeServerInfosFilter = {
  and?: Maybe<Array<AccountEdgeServerInfosFilter>>;
  /**
   * Selects rows whose bootId dimension equals the given value if not null. To
   * query for the null value, use {in: {bootId: [null]}} instead.
   */
  bootId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose executableSchemaId dimension equals the given value if not
   * null. To query for the null value, use {in: {executableSchemaId: [null]}} instead.
   */
  executableSchemaId?: Maybe<Scalars['ID']>;
  in?: Maybe<AccountEdgeServerInfosFilterIn>;
  /**
   * Selects rows whose libraryVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {libraryVersion: [null]}} instead.
   */
  libraryVersion?: Maybe<Scalars['String']>;
  not?: Maybe<AccountEdgeServerInfosFilter>;
  or?: Maybe<Array<AccountEdgeServerInfosFilter>>;
  /**
   * Selects rows whose platform dimension equals the given value if not null. To
   * query for the null value, use {in: {platform: [null]}} instead.
   */
  platform?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose runtimeVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {runtimeVersion: [null]}} instead.
   */
  runtimeVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serverId dimension equals the given value if not null. To
   * query for the null value, use {in: {serverId: [null]}} instead.
   */
  serverId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose userVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {userVersion: [null]}} instead.
   */
  userVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in AccountEdgeServerInfos. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type AccountEdgeServerInfosFilterIn = {
  /**
   * Selects rows whose bootId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  bootId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose executableSchemaId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  executableSchemaId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose libraryVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  libraryVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose platform dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  platform?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose runtimeVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  runtimeVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serverId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serverId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose userVersion dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  userVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
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

/** Columns of AccountEnumStats. */
export enum AccountEnumStatsColumn {
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  EnumType = 'ENUM_TYPE',
  EnumValue = 'ENUM_VALUE',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestCount = 'REQUEST_COUNT',
  ResponseCount = 'RESPONSE_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type AccountEnumStatsDimensions = {
  __typename?: 'AccountEnumStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  enumType?: Maybe<Scalars['String']>;
  enumValue?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in AccountEnumStats. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type AccountEnumStatsFilter = {
  and?: Maybe<Array<AccountEnumStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose enumType dimension equals the given value if not null. To
   * query for the null value, use {in: {enumType: [null]}} instead.
   */
  enumType?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose enumValue dimension equals the given value if not null. To
   * query for the null value, use {in: {enumValue: [null]}} instead.
   */
  enumValue?: Maybe<Scalars['String']>;
  in?: Maybe<AccountEnumStatsFilterIn>;
  not?: Maybe<AccountEnumStatsFilter>;
  or?: Maybe<Array<AccountEnumStatsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in AccountEnumStats. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type AccountEnumStatsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose enumType dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  enumType?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose enumValue dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  enumValue?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type AccountEnumStatsMetrics = {
  __typename?: 'AccountEnumStatsMetrics';
  requestCount: Scalars['Long'];
  responseCount: Scalars['Long'];
};

export type AccountEnumStatsOrderBySpec = {
  column: AccountEnumStatsColumn;
  direction: Ordering;
};

export type AccountEnumStatsRecord = {
  __typename?: 'AccountEnumStatsRecord';
  /** Dimensions of AccountEnumStats that can be grouped by. */
  groupBy: AccountEnumStatsDimensions;
  /** Metrics of AccountEnumStats that can be aggregated over. */
  metrics: AccountEnumStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of AccountErrorStats. */
export enum AccountErrorStatsColumn {
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  ErrorsCount = 'ERRORS_COUNT',
  Path = 'PATH',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestsWithErrorsCount = 'REQUESTS_WITH_ERRORS_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type AccountErrorStatsDimensions = {
  __typename?: 'AccountErrorStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in AccountErrorStats. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type AccountErrorStatsFilter = {
  and?: Maybe<Array<AccountErrorStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  in?: Maybe<AccountErrorStatsFilterIn>;
  not?: Maybe<AccountErrorStatsFilter>;
  or?: Maybe<Array<AccountErrorStatsFilter>>;
  /**
   * Selects rows whose path dimension equals the given value if not null. To query
   * for the null value, use {in: {path: [null]}} instead.
   */
  path?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in AccountErrorStats. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type AccountErrorStatsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
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

export type AccountExperimentalFeatures = {
  __typename?: 'AccountExperimentalFeatures';
  preRequestPreview: Scalars['Boolean'];
  webhooksPreview: Scalars['Boolean'];
  compositionWebhooksPreview: Scalars['Boolean'];
  freeConsumerSeats: Scalars['Boolean'];
  publicVariants: Scalars['Boolean'];
};

/** Columns of AccountFieldStats. */
export enum AccountFieldStatsColumn {
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  ErrorsCount = 'ERRORS_COUNT',
  Field = 'FIELD',
  FieldHistogram = 'FIELD_HISTOGRAM',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestCount = 'REQUEST_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type AccountFieldStatsDimensions = {
  __typename?: 'AccountFieldStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  field?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in AccountFieldStats. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type AccountFieldStatsFilter = {
  and?: Maybe<Array<AccountFieldStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose field dimension equals the given value if not null. To
   * query for the null value, use {in: {field: [null]}} instead.
   */
  field?: Maybe<Scalars['String']>;
  in?: Maybe<AccountFieldStatsFilterIn>;
  not?: Maybe<AccountFieldStatsFilter>;
  or?: Maybe<Array<AccountFieldStatsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in AccountFieldStats. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type AccountFieldStatsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose field dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  field?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type AccountFieldStatsMetrics = {
  __typename?: 'AccountFieldStatsMetrics';
  errorsCount: Scalars['Long'];
  fieldHistogram: DurationHistogram;
  requestCount: Scalars['Long'];
};

export type AccountFieldStatsOrderBySpec = {
  column: AccountFieldStatsColumn;
  direction: Ordering;
};

export type AccountFieldStatsRecord = {
  __typename?: 'AccountFieldStatsRecord';
  /** Dimensions of AccountFieldStats that can be grouped by. */
  groupBy: AccountFieldStatsDimensions;
  /** Metrics of AccountFieldStats that can be aggregated over. */
  metrics: AccountFieldStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of AccountInputStats. */
export enum AccountInputStatsColumn {
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  FieldName = 'FIELD_NAME',
  FieldType = 'FIELD_TYPE',
  ParentType = 'PARENT_TYPE',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestCount = 'REQUEST_COUNT',
  RequestCountNull = 'REQUEST_COUNT_NULL',
  RequestCountUndefined = 'REQUEST_COUNT_UNDEFINED',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type AccountInputStatsDimensions = {
  __typename?: 'AccountInputStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  fieldName?: Maybe<Scalars['String']>;
  fieldType?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in AccountInputStats. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type AccountInputStatsFilter = {
  and?: Maybe<Array<AccountInputStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose fieldName dimension equals the given value if not null. To
   * query for the null value, use {in: {fieldName: [null]}} instead.
   */
  fieldName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose fieldType dimension equals the given value if not null. To
   * query for the null value, use {in: {fieldType: [null]}} instead.
   */
  fieldType?: Maybe<Scalars['String']>;
  in?: Maybe<AccountInputStatsFilterIn>;
  not?: Maybe<AccountInputStatsFilter>;
  or?: Maybe<Array<AccountInputStatsFilter>>;
  /**
   * Selects rows whose parentType dimension equals the given value if not null. To
   * query for the null value, use {in: {parentType: [null]}} instead.
   */
  parentType?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in AccountInputStats. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type AccountInputStatsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose fieldName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  fieldName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose fieldType dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  fieldType?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose parentType dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  parentType?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type AccountInputStatsMetrics = {
  __typename?: 'AccountInputStatsMetrics';
  requestCount: Scalars['Long'];
  requestCountNull: Scalars['Long'];
  requestCountUndefined: Scalars['Long'];
};

export type AccountInputStatsOrderBySpec = {
  column: AccountInputStatsColumn;
  direction: Ordering;
};

export type AccountInputStatsRecord = {
  __typename?: 'AccountInputStatsRecord';
  /** Dimensions of AccountInputStats that can be grouped by. */
  groupBy: AccountInputStatsDimensions;
  /** Metrics of AccountInputStats that can be aggregated over. */
  metrics: AccountInputStatsMetrics;
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
  /** Cancel account subscriptions, subscriptions will remain active until the end of the paid period */
  cancelSubscriptions?: Maybe<Account>;
  /**
   * Changes an annual team subscription to a monthly team subscription when the current period expires.
   * (For monthly->annual changes, just use startTeamSubscription and the annual subscription will start
   * immediately; annual->monthly is special because monthly subscriptions all renew at the start of the month.)
   */
  convertAnnualTeamSubscriptionToMonthlyAtNextPeriod?: Maybe<Account>;
  createStaticInvitation?: Maybe<OrganizationInviteLink>;
  /** Delete the account's avatar. Requires Account.canUpdateAvatar to be true. */
  deleteAvatar?: Maybe<AvatarDeleteError>;
  /** Acknowledge that a trial has expired and return to community */
  dismissExpiredTrial?: Maybe<Account>;
  /** Apollo admins only: extend an ongoing trial */
  extendTrial?: Maybe<Account>;
  /** Hard delete an account and all associated services */
  hardDelete?: Maybe<Scalars['Void']>;
  /** Send an invitation to join the account by E-mail */
  invite?: Maybe<AccountInvitation>;
  /** Reactivate a canceled current subscription */
  reactivateCurrentSubscription?: Maybe<Account>;
  /** Refresh billing information from third-party billing service */
  refreshBilling?: Maybe<Scalars['Void']>;
  /**
   * Set the account-wide invitation token to a new random value
   * @deprecated Accounts can now have multiple static invitations. Recreate individual static invitations instead.
   */
  regenerateJoinToken?: Maybe<Account>;
  /** Delete an invitation */
  removeInvitation?: Maybe<Scalars['Void']>;
  /** Remove a member of the account */
  removeMember?: Maybe<Account>;
  /** Send a new E-mail for an existing invitation */
  resendInvitation?: Maybe<AccountInvitation>;
  /**
   * Disable the account-wide join token
   * @deprecated Accounts can now have multiple static invitations. Revoke individual static invitations instead.
   */
  revokeJoinToken?: Maybe<Account>;
  revokeStaticInvitation?: Maybe<OrganizationInviteLink>;
  /** Apollo admins only: set the billing plan to an arbitrary plan */
  setPlan?: Maybe<Scalars['Void']>;
  /** Start a new team subscription with the given billing period */
  startTeamSubscription?: Maybe<Account>;
  /** Start a team trial */
  startTrial?: Maybe<Account>;
  /** This is called by the form shown to users after they cancel their team subscription. */
  submitTeamCancellationFeedback?: Maybe<Scalars['Void']>;
  /** Apollo admins only: terminate any ongoing subscriptions in the account, without refunds */
  terminateSubscriptions?: Maybe<Account>;
  /** Update the billing address for a Recurly token */
  updateBillingAddress?: Maybe<Account>;
  /** Update the billing information from a Recurly token */
  updateBillingInfo?: Maybe<Scalars['Void']>;
  /** Set the E-mail address of the account, used notably for billing */
  updateEmail?: Maybe<Scalars['Void']>;
  /** Update the account ID */
  updateID?: Maybe<Account>;
  /**
   * Updates the role used by the org's invite link and regenerates the join token.
   * @deprecated Accounts can now have multiple static invitations. Create a new static invitation instead.
   */
  updateInviteLinkRole?: Maybe<OrganizationInviteLink>;
  /** Update the company name */
  updateName?: Maybe<Scalars['Void']>;
  /** Apollo admins only: enable or disable an account for PingOne SSO login */
  updatePingOneSSOIDPID?: Maybe<Account>;
  /** Updates the role assigned to new SSO users. */
  updateSSODefaultRole?: Maybe<OrganizationSso>;
  /** A (currently) internal to Apollo mutation to update a user's role within an organization */
  updateUserPermission?: Maybe<User>;
};


export type AccountMutationCreateStaticInvitationArgs = {
  role: UserPermission;
};


export type AccountMutationExtendTrialArgs = {
  to: Scalars['Timestamp'];
};


export type AccountMutationInviteArgs = {
  email: Scalars['String'];
  role?: Maybe<UserPermission>;
};


export type AccountMutationRemoveInvitationArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type AccountMutationRemoveMemberArgs = {
  id: Scalars['ID'];
};


export type AccountMutationResendInvitationArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type AccountMutationRevokeStaticInvitationArgs = {
  token: Scalars['String'];
};


export type AccountMutationSetPlanArgs = {
  id: Scalars['ID'];
};


export type AccountMutationStartTeamSubscriptionArgs = {
  billingPeriod: BillingPeriod;
};


export type AccountMutationSubmitTeamCancellationFeedbackArgs = {
  feedback: Scalars['String'];
};


export type AccountMutationUpdateBillingAddressArgs = {
  billingAddress: BillingAddressInput;
};


export type AccountMutationUpdateBillingInfoArgs = {
  token: Scalars['String'];
};


export type AccountMutationUpdateEmailArgs = {
  email: Scalars['String'];
};


export type AccountMutationUpdateIdArgs = {
  id: Scalars['ID'];
};


export type AccountMutationUpdateInviteLinkRoleArgs = {
  role: UserPermission;
};


export type AccountMutationUpdateNameArgs = {
  name: Scalars['String'];
};


export type AccountMutationUpdatePingOneSsoidpidArgs = {
  idpid?: Maybe<Scalars['String']>;
};


export type AccountMutationUpdateSsoDefaultRoleArgs = {
  role: UserPermission;
};


export type AccountMutationUpdateUserPermissionArgs = {
  permission: UserPermission;
  userID: Scalars['ID'];
};

/** Columns of AccountQueryStats. */
export enum AccountQueryStatsColumn {
  CachedHistogram = 'CACHED_HISTOGRAM',
  CachedRequestsCount = 'CACHED_REQUESTS_COUNT',
  CacheTtlHistogram = 'CACHE_TTL_HISTOGRAM',
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  ForbiddenOperationCount = 'FORBIDDEN_OPERATION_COUNT',
  FromEngineproxy = 'FROM_ENGINEPROXY',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RegisteredOperationCount = 'REGISTERED_OPERATION_COUNT',
  RequestsWithErrorsCount = 'REQUESTS_WITH_ERRORS_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP',
  UncachedHistogram = 'UNCACHED_HISTOGRAM',
  UncachedRequestsCount = 'UNCACHED_REQUESTS_COUNT'
}

export type AccountQueryStatsDimensions = {
  __typename?: 'AccountQueryStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  fromEngineproxy?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in AccountQueryStats. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type AccountQueryStatsFilter = {
  and?: Maybe<Array<AccountQueryStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose fromEngineproxy dimension equals the given value if not
   * null. To query for the null value, use {in: {fromEngineproxy: [null]}} instead.
   */
  fromEngineproxy?: Maybe<Scalars['String']>;
  in?: Maybe<AccountQueryStatsFilterIn>;
  not?: Maybe<AccountQueryStatsFilter>;
  or?: Maybe<Array<AccountQueryStatsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in AccountQueryStats. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type AccountQueryStatsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose fromEngineproxy dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  fromEngineproxy?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  /** @deprecated Use canManageMembers instead */
  canAdminister: Scalars['Boolean'];
  canCreateDevGraph: Scalars['Boolean'];
  canCreateService: Scalars['Boolean'];
  canDelete: Scalars['Boolean'];
  /** @deprecated Use canQueryBillingInfo instead */
  canDownloadInvoice: Scalars['Boolean'];
  canManageMembers: Scalars['Boolean'];
  /** @deprecated Use canQuery instead */
  canModify: Scalars['Boolean'];
  canQuery: Scalars['Boolean'];
  canQueryBillingInfo: Scalars['Boolean'];
  /** @deprecated Use canQueryBillingInfo instead */
  canQueryInvoices: Scalars['Boolean'];
  /** @deprecated Use canManageMembers instead */
  canQueryJoinToken: Scalars['Boolean'];
  canQueryMembers: Scalars['Boolean'];
  /** @deprecated Use canQueryBillingInfo instead */
  canQueryRecurlyInfo: Scalars['Boolean'];
  canRemoveMembers: Scalars['Boolean'];
  canSetConstrainedPlan: Scalars['Boolean'];
  /** @deprecated Use canUpdateMetadata instead */
  canUpdateAvatar: Scalars['Boolean'];
  canUpdateBillingInfo: Scalars['Boolean'];
  /** @deprecated Use canUpdateMetadata instead */
  canUpdateID: Scalars['Boolean'];
  canUpdateMetadata: Scalars['Boolean'];
};

export enum AccountState {
  Active = 'ACTIVE',
  Closed = 'CLOSED',
  Unknown = 'UNKNOWN',
  Unprovisioned = 'UNPROVISIONED'
}

/** A time window with a specified granularity over a given account. */
export type AccountStatsWindow = {
  __typename?: 'AccountStatsWindow';
  edgeServerInfos: Array<AccountEdgeServerInfosRecord>;
  enumStats: Array<AccountEnumStatsRecord>;
  errorStats: Array<AccountErrorStatsRecord>;
  fieldStats: Array<AccountFieldStatsRecord>;
  inputStats: Array<AccountInputStatsRecord>;
  queryStats: Array<AccountQueryStatsRecord>;
  /** From field rounded down to the nearest resolution. */
  roundedDownFrom: Scalars['Timestamp'];
  /** To field rounded up to the nearest resolution. */
  roundedUpTo: Scalars['Timestamp'];
  tracePathErrorsRefs: Array<AccountTracePathErrorsRefsRecord>;
  traceRefs: Array<AccountTraceRefsRecord>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowEdgeServerInfosArgs = {
  filter?: Maybe<AccountEdgeServerInfosFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<AccountEdgeServerInfosOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowEnumStatsArgs = {
  filter?: Maybe<AccountEnumStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<AccountEnumStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowErrorStatsArgs = {
  filter?: Maybe<AccountErrorStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<AccountErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowFieldStatsArgs = {
  filter?: Maybe<AccountFieldStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<AccountFieldStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowInputStatsArgs = {
  filter?: Maybe<AccountInputStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<AccountInputStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowQueryStatsArgs = {
  filter?: Maybe<AccountQueryStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<AccountQueryStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowTracePathErrorsRefsArgs = {
  filter?: Maybe<AccountTracePathErrorsRefsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<AccountTracePathErrorsRefsOrderBySpec>>;
};


/** A time window with a specified granularity over a given account. */
export type AccountStatsWindowTraceRefsArgs = {
  filter?: Maybe<AccountTraceRefsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<AccountTraceRefsOrderBySpec>>;
};

/** Columns of AccountTracePathErrorsRefs. */
export enum AccountTracePathErrorsRefsColumn {
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  DurationBucket = 'DURATION_BUCKET',
  ErrorsCountInPath = 'ERRORS_COUNT_IN_PATH',
  ErrorsCountInTrace = 'ERRORS_COUNT_IN_TRACE',
  ErrorMessage = 'ERROR_MESSAGE',
  Path = 'PATH',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP',
  TraceHttpStatusCode = 'TRACE_HTTP_STATUS_CODE',
  TraceId = 'TRACE_ID',
  TraceSizeBytes = 'TRACE_SIZE_BYTES',
  TraceStartsAt = 'TRACE_STARTS_AT'
}

export type AccountTracePathErrorsRefsDimensions = {
  __typename?: 'AccountTracePathErrorsRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationBucket?: Maybe<Scalars['Int']>;
  errorMessage?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
  traceHttpStatusCode?: Maybe<Scalars['Int']>;
  traceId?: Maybe<Scalars['ID']>;
  traceStartsAt?: Maybe<Scalars['Timestamp']>;
};

/**
 * Filter for data in AccountTracePathErrorsRefs. Fields with dimension names
 * represent equality checks. All fields are implicitly ANDed together.
 */
export type AccountTracePathErrorsRefsFilter = {
  and?: Maybe<Array<AccountTracePathErrorsRefsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose durationBucket dimension equals the given value if not
   * null. To query for the null value, use {in: {durationBucket: [null]}} instead.
   */
  durationBucket?: Maybe<Scalars['Int']>;
  /**
   * Selects rows whose errorMessage dimension equals the given value if not null.
   * To query for the null value, use {in: {errorMessage: [null]}} instead.
   */
  errorMessage?: Maybe<Scalars['String']>;
  in?: Maybe<AccountTracePathErrorsRefsFilterIn>;
  not?: Maybe<AccountTracePathErrorsRefsFilter>;
  or?: Maybe<Array<AccountTracePathErrorsRefsFilter>>;
  /**
   * Selects rows whose path dimension equals the given value if not null. To query
   * for the null value, use {in: {path: [null]}} instead.
   */
  path?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose traceHttpStatusCode dimension equals the given value if not
   * null. To query for the null value, use {in: {traceHttpStatusCode: [null]}} instead.
   */
  traceHttpStatusCode?: Maybe<Scalars['Int']>;
  /**
   * Selects rows whose traceId dimension equals the given value if not null. To
   * query for the null value, use {in: {traceId: [null]}} instead.
   */
  traceId?: Maybe<Scalars['ID']>;
};

/**
 * Filter for data in AccountTracePathErrorsRefs. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type AccountTracePathErrorsRefsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose durationBucket dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  durationBucket?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /**
   * Selects rows whose errorMessage dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  errorMessage?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose traceHttpStatusCode dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  traceHttpStatusCode?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /**
   * Selects rows whose traceId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  traceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
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
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  DurationBucket = 'DURATION_BUCKET',
  DurationNs = 'DURATION_NS',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP',
  TraceId = 'TRACE_ID',
  TraceSizeBytes = 'TRACE_SIZE_BYTES'
}

export type AccountTraceRefsDimensions = {
  __typename?: 'AccountTraceRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationBucket?: Maybe<Scalars['Int']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
  traceId?: Maybe<Scalars['ID']>;
};

/**
 * Filter for data in AccountTraceRefs. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type AccountTraceRefsFilter = {
  and?: Maybe<Array<AccountTraceRefsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose durationBucket dimension equals the given value if not
   * null. To query for the null value, use {in: {durationBucket: [null]}} instead.
   */
  durationBucket?: Maybe<Scalars['Int']>;
  in?: Maybe<AccountTraceRefsFilterIn>;
  not?: Maybe<AccountTraceRefsFilter>;
  or?: Maybe<Array<AccountTraceRefsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose traceId dimension equals the given value if not null. To
   * query for the null value, use {in: {traceId: [null]}} instead.
   */
  traceId?: Maybe<Scalars['ID']>;
};

/**
 * Filter for data in AccountTraceRefs. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type AccountTraceRefsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose durationBucket dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  durationBucket?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose traceId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  traceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type AccountTraceRefsMetrics = {
  __typename?: 'AccountTraceRefsMetrics';
  durationNs: Scalars['Long'];
  traceSizeBytes: Scalars['Long'];
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

export type Actor = {
  __typename?: 'Actor';
  actorId: Scalars['ID'];
  type: ActorType;
};

export enum ActorType {
  AnonymousUser = 'ANONYMOUS_USER',
  Backfill = 'BACKFILL',
  Cron = 'CRON',
  Graph = 'GRAPH',
  InternalIdentity = 'INTERNAL_IDENTITY',
  Synchronization = 'SYNCHRONIZATION',
  User = 'USER'
}

export type AffectedClient = {
  __typename?: 'AffectedClient';
  /** ID, often the name, of the client set by the user and reported alongside metrics */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /** version of the client set by the user and reported alongside metrics */
  clientVersion?: Maybe<Scalars['String']>;
};

export type AffectedQuery = {
  __typename?: 'AffectedQuery';
  id: Scalars['ID'];
  /** First 128 characters of query signature for display */
  signature?: Maybe<Scalars['String']>;
  /** Name to display to the user for the operation */
  displayName?: Maybe<Scalars['String']>;
  /** Name provided for the operation, which can be empty string if it is an anonymous operation */
  name?: Maybe<Scalars['String']>;
  /** Determines if this query validates against the proposed schema */
  isValid?: Maybe<Scalars['Boolean']>;
  /** List of changes affecting this query. Returns null if queried from SchemaDiff.changes.affectedQueries.changes */
  changes?: Maybe<Array<ChangeOnOperation>>;
  /** Whether this operation was ignored and its severity was downgraded for that reason */
  markedAsIgnored?: Maybe<Scalars['Boolean']>;
  /** Whether the changes were marked as safe and its severity was downgraded for that reason */
  markedAsSafe?: Maybe<Scalars['Boolean']>;
  /**
   * If the operation would be approved if the check ran again. Returns null if
   * queried from SchemaDiff.changes.affectedQueries.alreadyApproved
   */
  alreadyApproved?: Maybe<Scalars['Boolean']>;
  /** If the operation would be ignored if the check ran again */
  alreadyIgnored?: Maybe<Scalars['Boolean']>;
};

export type ApiKey = {
  keyName?: Maybe<Scalars['String']>;
  token: Scalars['String'];
};

export type ApiKeyProvision = {
  __typename?: 'ApiKeyProvision';
  apiKey: ApiKey;
  created: Scalars['Boolean'];
};

export type AvatarDeleteError = {
  __typename?: 'AvatarDeleteError';
  clientMessage: Scalars['String'];
  code: AvatarDeleteErrorCode;
  serverMessage: Scalars['String'];
};

export enum AvatarDeleteErrorCode {
  SsoUsersCannotDeleteSelfAvatar = 'SSO_USERS_CANNOT_DELETE_SELF_AVATAR'
}

export type AvatarUploadError = {
  __typename?: 'AvatarUploadError';
  clientMessage: Scalars['String'];
  code: AvatarUploadErrorCode;
  serverMessage: Scalars['String'];
};

export enum AvatarUploadErrorCode {
  SsoUsersCannotUploadSelfAvatar = 'SSO_USERS_CANNOT_UPLOAD_SELF_AVATAR'
}

export type AvatarUploadResult = AvatarUploadError | MediaUploadInfo;

export type BillingAddress = {
  __typename?: 'BillingAddress';
  address1?: Maybe<Scalars['String']>;
  address2?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

/** Billing address inpnut */
export type BillingAddressInput = {
  address1: Scalars['String'];
  address2?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  country: Scalars['String'];
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type BillingInfo = {
  __typename?: 'BillingInfo';
  address: BillingAddress;
  cardType?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastFour?: Maybe<Scalars['Int']>;
  lastName?: Maybe<Scalars['String']>;
  month?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

export enum BillingModel {
  RequestBased = 'REQUEST_BASED',
  SeatBased = 'SEAT_BASED'
}

export type BillingMonth = {
  __typename?: 'BillingMonth';
  end: Scalars['Timestamp'];
  requests: Scalars['Long'];
  start: Scalars['Timestamp'];
};

export enum BillingPeriod {
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  SemiAnnually = 'SEMI_ANNUALLY',
  Yearly = 'YEARLY'
}

export type BillingPlan = {
  __typename?: 'BillingPlan';
  addons: Array<BillingPlanAddon>;
  billingModel: BillingModel;
  billingPeriod?: Maybe<BillingPeriod>;
  capabilities: BillingPlanCapabilities;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  isTrial: Scalars['Boolean'];
  kind: BillingPlanKind;
  name: Scalars['String'];
  /** The price of every seat */
  pricePerSeatInUsdCents?: Maybe<Scalars['Int']>;
  /** The price of subscribing to this plan with a quantity of 1 (currently always the case) */
  pricePerUnitInUsdCents: Scalars['Int'];
  /** Whether the plan is accessible by all users in QueryRoot.allPlans, QueryRoot.plan, or AccountMutation.setPlan */
  public: Scalars['Boolean'];
  tier: BillingPlanTier;
};

export type BillingPlanAddon = {
  __typename?: 'BillingPlanAddon';
  id: Scalars['ID'];
  pricePerUnitInUsdCents: Scalars['Int'];
};

export type BillingPlanCapabilities = {
  __typename?: 'BillingPlanCapabilities';
  clients: Scalars['Boolean'];
  datadog: Scalars['Boolean'];
  errors: Scalars['Boolean'];
  federation: Scalars['Boolean'];
  maxRangeInDays?: Maybe<Scalars['Int']>;
  maxRequestsPerMonth?: Maybe<Scalars['Long']>;
  metrics: Scalars['Boolean'];
  notifications: Scalars['Boolean'];
  operationRegistry: Scalars['Boolean'];
  ranges: Array<Scalars['String']>;
  schemaValidation: Scalars['Boolean'];
  traces: Scalars['Boolean'];
  userRoles: Scalars['Boolean'];
  webhooks: Scalars['Boolean'];
};

export enum BillingPlanKind {
  Community = 'COMMUNITY',
  EnterpriseInternal = 'ENTERPRISE_INTERNAL',
  EnterprisePaid = 'ENTERPRISE_PAID',
  EnterprisePilot = 'ENTERPRISE_PILOT',
  TeamPaid = 'TEAM_PAID',
  TeamTrial = 'TEAM_TRIAL'
}

export enum BillingPlanTier {
  Community = 'COMMUNITY',
  Enterprise = 'ENTERPRISE',
  Team = 'TEAM'
}

export type BillingSubscription = {
  __typename?: 'BillingSubscription';
  activatedAt: Scalars['Timestamp'];
  addons: Array<BillingSubscriptionAddon>;
  autoRenew: Scalars['Boolean'];
  /** The price of the subscription when ignoring add-ons (such as seats), ie quantity * pricePerUnitInUsdCents */
  basePriceInUsdCents: Scalars['Long'];
  canceledAt?: Maybe<Scalars['Timestamp']>;
  currentPeriodEndsAt: Scalars['Timestamp'];
  currentPeriodStartedAt: Scalars['Timestamp'];
  expiresAt?: Maybe<Scalars['Timestamp']>;
  plan: BillingPlan;
  /** The price of every seat */
  pricePerSeatInUsdCents?: Maybe<Scalars['Int']>;
  /** The price of every unit in the subscription (hence multiplied by quantity to get to the basePriceInUsdCents) */
  pricePerUnitInUsdCents: Scalars['Int'];
  quantity: Scalars['Int'];
  /** Total price of the subscription when it next renews, including add-ons (such as seats) */
  renewalTotalPriceInUsdCents: Scalars['Long'];
  state: SubscriptionState;
  /** Total price of the subscription, including add-ons (such as seats) */
  totalPriceInUsdCents: Scalars['Long'];
  /**
   * When this subscription's trial period expires (if it is a trial). Not the same as the
   * subscription's Recurly expiration).
   */
  trialExpiresAt?: Maybe<Scalars['Timestamp']>;
  uuid: Scalars['ID'];
};

export type BillingSubscriptionAddon = {
  __typename?: 'BillingSubscriptionAddon';
  id: Scalars['ID'];
  pricePerUnitInUsdCents: Scalars['Int'];
  quantity: Scalars['Int'];
};


export enum CacheScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Unknown = 'UNKNOWN',
  Unrecognized = 'UNRECOGNIZED'
}

export type Change = {
  __typename?: 'Change';
  /**
   * Indication of the success of the overall change, either failure, warning, or notice.
   * @deprecated use severity instead
   */
  type: ChangeType;
  /** Indication of the success of the overall change, either failure, warning, or notice. */
  severity: ChangeSeverity;
  /** Indication of the kind of target and action of the change, e.g. 'TYPE_REMOVED'. */
  code: Scalars['String'];
  /** Indication of the category of the change (e.g. addition, removal, edit). */
  category: ChangeCategory;
  /** Explanation of both the target of the change and how it was changed. */
  description: Scalars['String'];
  affectedQueries?: Maybe<Array<AffectedQuery>>;
  /** Top level node affected by the change */
  parentNode?: Maybe<NamedIntrospectionType>;
  /**
   * Node related to the top level node that was changed, such as a field in an object,
   * a value in an enum or the object of an interface
   */
  childNode?: Maybe<NamedIntrospectionValue>;
  /** Target arg of change made. */
  argNode?: Maybe<NamedIntrospectionArg>;
};

/**
 * Defines a set of categories that a schema change
 * can be grouped by.
 */
export enum ChangeCategory {
  Addition = 'ADDITION',
  Edit = 'EDIT',
  Removal = 'REMOVAL',
  Deprecation = 'DEPRECATION'
}

/**
 * These schema change codes represent all of the possible changes that can
 * occur during the schema diff algorithm.
 */
export enum ChangeCode {
  /** Field was removed from the type. */
  FieldRemoved = 'FIELD_REMOVED',
  /** Type (object or scalar) was removed from the schema. */
  TypeRemoved = 'TYPE_REMOVED',
  /** Argument to a field was removed. */
  ArgRemoved = 'ARG_REMOVED',
  /** Type is no longer included in the union. */
  TypeRemovedFromUnion = 'TYPE_REMOVED_FROM_UNION',
  /** Field was removed from the input object. */
  FieldRemovedFromInputObject = 'FIELD_REMOVED_FROM_INPUT_OBJECT',
  /** Value was removed from the enum. */
  ValueRemovedFromEnum = 'VALUE_REMOVED_FROM_ENUM',
  /** Type no longer implements the interface. */
  TypeRemovedFromInterface = 'TYPE_REMOVED_FROM_INTERFACE',
  /** Non-nullable argument was added to the field. */
  RequiredArgAdded = 'REQUIRED_ARG_ADDED',
  /** Non-nullable field was added to the input object. */
  NonNullableFieldAddedToInputObject = 'NON_NULLABLE_FIELD_ADDED_TO_INPUT_OBJECT',
  /** Return type for the field was changed. */
  FieldChangedType = 'FIELD_CHANGED_TYPE',
  /** Type of the field in the input object was changed. */
  FieldOnInputObjectChangedType = 'FIELD_ON_INPUT_OBJECT_CHANGED_TYPE',
  /**
   * Type was changed from one kind to another.
   * Ex: scalar to object or enum to union.
   */
  TypeChangedKind = 'TYPE_CHANGED_KIND',
  /** Type of the argument was changed. */
  ArgChangedType = 'ARG_CHANGED_TYPE',
  /** Argument was changed from nullable to non-nullable. */
  ArgChangedTypeOptionalToRequired = 'ARG_CHANGED_TYPE_OPTIONAL_TO_REQUIRED',
  /** A new value was added to the enum. */
  ValueAddedToEnum = 'VALUE_ADDED_TO_ENUM',
  /** A new value was added to the enum. */
  TypeAddedToUnion = 'TYPE_ADDED_TO_UNION',
  /** Type now implements the interface. */
  TypeAddedToInterface = 'TYPE_ADDED_TO_INTERFACE',
  /** Default value added or changed for the argument. */
  ArgDefaultValueChange = 'ARG_DEFAULT_VALUE_CHANGE',
  /** Nullable argument was added to the field. */
  OptionalArgAdded = 'OPTIONAL_ARG_ADDED',
  /** Nullable field was added to the input type. */
  NullableFieldAddedToInputObject = 'NULLABLE_FIELD_ADDED_TO_INPUT_OBJECT',
  /** Field was added to the type. */
  FieldAdded = 'FIELD_ADDED',
  /** Type was added to the schema. */
  TypeAdded = 'TYPE_ADDED',
  /** Enum was deprecated. */
  EnumDeprecated = 'ENUM_DEPRECATED',
  /** Enum deprecation was removed. */
  EnumDeprecationRemoved = 'ENUM_DEPRECATION_REMOVED',
  /** Reason for enum deprecation changed. */
  EnumDeprecatedReasonChange = 'ENUM_DEPRECATED_REASON_CHANGE',
  /** Field was deprecated. */
  FieldDeprecated = 'FIELD_DEPRECATED',
  /** Field deprecation removed. */
  FieldDeprecationRemoved = 'FIELD_DEPRECATION_REMOVED',
  /** Reason for field deprecation changed. */
  FieldDeprecatedReasonChange = 'FIELD_DEPRECATED_REASON_CHANGE',
  /** Description was added, removed, or updated for type. */
  TypeDescriptionChange = 'TYPE_DESCRIPTION_CHANGE',
  /** Description was added, removed, or updated for field. */
  FieldDescriptionChange = 'FIELD_DESCRIPTION_CHANGE',
  /** Description was added, removed, or updated for enum value. */
  EnumValueDescriptionChange = 'ENUM_VALUE_DESCRIPTION_CHANGE',
  /** Description was added, removed, or updated for argument. */
  ArgDescriptionChange = 'ARG_DESCRIPTION_CHANGE',
  /** Directive was removed. */
  DirectiveRemoved = 'DIRECTIVE_REMOVED',
  /** Argument to the directive was removed. */
  DirectiveArgRemoved = 'DIRECTIVE_ARG_REMOVED',
  /** Location of the directive was removed. */
  DirectiveLocationRemoved = 'DIRECTIVE_LOCATION_REMOVED',
  /** Repeatable flag was removed for directive. */
  DirectiveRepeatableRemoved = 'DIRECTIVE_REPEATABLE_REMOVED',
  /** Non-nullable argument added to directive. */
  RequiredDirectiveArgAdded = 'REQUIRED_DIRECTIVE_ARG_ADDED'
}

/**
 * Represents the tuple of static information
 * about a particular kind of schema change.
 */
export type ChangeDefinition = {
  __typename?: 'ChangeDefinition';
  code: ChangeCode;
  defaultSeverity: ChangeSeverity;
  category: ChangeCategory;
};

/** Info about a change in the context of an operation it affects */
export type ChangeOnOperation = {
  __typename?: 'ChangeOnOperation';
  /** The semantic info about this change, i.e. info about the change that doesn't depend on the operation */
  semanticChange: SemanticChange;
  /** Human-readable explanation of the impact of this change on the operation */
  impact?: Maybe<Scalars['String']>;
};

export enum ChangeSeverity {
  Failure = 'FAILURE',
  Notice = 'NOTICE'
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
  /**
   * Counts for changes to non-field aspects of objects, input objects, and interfaces,
   * and all aspects of enums, unions, and scalars.
   */
  type: TypeChangeSummaryCounts;
  /** Counts for changes to fields of objects, input objects, and interfaces. */
  field: FieldChangeSummaryCounts;
  /** Counts for all changes. */
  total: TotalChangeSummaryCounts;
};

export enum ChangeType {
  Failure = 'FAILURE',
  Notice = 'NOTICE'
}

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

export type CheckConfiguration = {
  __typename?: 'CheckConfiguration';
  /** ID of the check configuration */
  id: Scalars['ID'];
  /** Graph that this check configuration belongs to */
  graphID: Scalars['ID'];
  /** Operations to ignore during validation */
  excludedOperations: Array<ExcludedOperation>;
  /** Clients to ignore during validation */
  excludedClients: Array<ClientFilter>;
  /** Variant overrides for validation */
  includedVariants: Array<Scalars['String']>;
  /** Time when check configuration was created */
  createdAt: Scalars['Timestamp'];
  /** Time when check configuration was last updated */
  updatedAt: Scalars['Timestamp'];
  /** Identity of the last user to update the check configuration */
  updatedBy?: Maybe<Identity>;
  /**
   * Only check operations from the last <timeRangeSeconds> seconds.
   * The default is 7 days (604,800 seconds).
   */
  timeRangeSeconds: Scalars['Long'];
  /** Minimum number of requests within the window for an operation to be considered. */
  operationCountThreshold: Scalars['Int'];
  /**
   * Number of requests within the window for an operation to be considered, relative to
   * total request count. Expected values are between 0 and 0.05 (minimum 5% of
   * total request volume)
   */
  operationCountThresholdPercentage: Scalars['Float'];
  /** Default configuration to include operations on the base variant. */
  includeBaseVariant: Scalars['Boolean'];
};

/** Filter options available when listing checks. */
export type CheckFilterInput = {
  authors?: Maybe<Array<Scalars['String']>>;
  branches?: Maybe<Array<Scalars['String']>>;
  subgraphs?: Maybe<Array<Scalars['String']>>;
  status?: Maybe<CheckFilterInputStatusOption>;
};

/** Options for filtering CheckWorkflows by status */
export enum CheckFilterInputStatusOption {
  Failed = 'FAILED',
  Pending = 'PENDING',
  Passed = 'PASSED'
}

export type CheckPartialSchemaResult = {
  __typename?: 'CheckPartialSchemaResult';
  /** Result of composition validation run before the schema check. */
  compositionValidationResult: CompositionValidationResult;
  /** Result of traffic validation. This will be null if composition validation was unsuccessful. */
  checkSchemaResult?: Maybe<CheckSchemaResult>;
  /** Workflow associated with the composition validation. */
  workflow?: Maybe<CheckWorkflow>;
};

export type CheckSchemaResult = {
  __typename?: 'CheckSchemaResult';
  /** ID of the operations check that was created */
  operationsCheckID: Scalars['ID'];
  /** Schema diff and affected operations generated by the schema check */
  diffToPrevious: SchemaDiff;
  /** Generated url to view schema diff in Engine */
  targetUrl?: Maybe<Scalars['String']>;
  /** Workflow associated with this check result */
  workflow?: Maybe<CheckWorkflow>;
};

export type CheckWorkflow = {
  __typename?: 'CheckWorkflow';
  id: Scalars['ID'];
  /**
   * The variant provided as a base to check against.  Only the differences from the
   * base schema will be tested in operations checks.
   */
  baseVariant?: Maybe<GraphVariant>;
  /** Contextual parameters supplied by the runtime environment where the check was run. */
  gitContext?: Maybe<GitContext>;
  /** The name of the implementing service that was responsible for triggering the validation. */
  implementingServiceName?: Maybe<Scalars['String']>;
  /** Configuration of validation at the time the check was run. */
  validationConfig?: Maybe<SchemaDiffValidationConfig>;
  /** The set of check tasks associated with this workflow, e.g. OperationsCheck, GraphComposition, etc. */
  tasks: Array<CheckWorkflowTask>;
  /** Overall status of the workflow, based on the underlying task statuses. */
  status: CheckWorkflowStatus;
  /** If this check was created by rerunning, the original check that was rerun. */
  rerunOf?: Maybe<CheckWorkflow>;
  /** Checks created by re-running this check, most recent first. */
  reruns?: Maybe<Array<CheckWorkflow>>;
  createdAt: Scalars['Timestamp'];
  startedAt?: Maybe<Scalars['Timestamp']>;
  completedAt?: Maybe<Scalars['Timestamp']>;
};


export type CheckWorkflowRerunsArgs = {
  limit?: Scalars['Int'];
};

export type CheckWorkflowMutation = {
  __typename?: 'CheckWorkflowMutation';
  /** Re-run a check workflow using the current configuration. A new workflow is created and returned. */
  rerun?: Maybe<CheckWorkflowRerunResult>;
};

export type CheckWorkflowRerunResult = {
  __typename?: 'CheckWorkflowRerunResult';
  /** Check workflow that was rerun. */
  source?: Maybe<CheckWorkflow>;
  /** Check workflow created by re-running. */
  result?: Maybe<CheckWorkflow>;
};

export enum CheckWorkflowStatus {
  Pending = 'PENDING',
  Passed = 'PASSED',
  Failed = 'FAILED'
}

export type CheckWorkflowTask = {
  id: Scalars['ID'];
  /** The workflow that this task belongs to. */
  workflow: CheckWorkflow;
  status: CheckWorkflowTaskStatus;
  createdAt: Scalars['Timestamp'];
  completedAt?: Maybe<Scalars['Timestamp']>;
};

export enum CheckWorkflowTaskStatus {
  Pending = 'PENDING',
  Passed = 'PASSED',
  Failed = 'FAILED',
  Blocked = 'BLOCKED'
}

/** Client filter configuration for a graph. */
export type ClientFilter = {
  __typename?: 'ClientFilter';
  /** ID, often the name, of the client set by the user and reported alongside metrics */
  referenceID?: Maybe<Scalars['ID']>;
  /** version of the client set by the user and reported alongside metrics */
  version?: Maybe<Scalars['String']>;
  /** name of the client set by the user and reported alongside metrics */
  name?: Maybe<Scalars['String']>;
};

/**
 * Options to filter by client reference ID, client name, and client version.
 * If passing client version, make sure to either provide a client reference ID or client name.
 */
export type ClientFilterInput = {
  /** ID, often the name, of the client set by the user and reported alongside metrics */
  referenceID?: Maybe<Scalars['ID']>;
  /** version of the client set by the user and reported alongside metrics */
  version?: Maybe<Scalars['String']>;
  /** name of the client set by the user and reported alongside metrics */
  name?: Maybe<Scalars['String']>;
};

/** Filter options to exclude by client reference ID, client name, and client version. */
export type ClientInfoFilter = {
  referenceID?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
};

/** Filter options to exclude clients. Used as an output type for SchemaDiffValidationConfig. */
export type ClientInfoFilterOutput = {
  __typename?: 'ClientInfoFilterOutput';
  referenceID?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
};

export enum ComparisonOperator {
  Equals = 'EQUALS',
  GreaterThan = 'GREATER_THAN',
  GreaterThanOrEqualTo = 'GREATER_THAN_OR_EQUAL_TO',
  LessThan = 'LESS_THAN',
  LessThanOrEqualTo = 'LESS_THAN_OR_EQUAL_TO',
  NotEquals = 'NOT_EQUALS',
  Unrecognized = 'UNRECOGNIZED'
}

/** Metadata about the result of composition run in the cloud, combined with removing an implementing service */
export type CompositionAndRemoveResult = {
  __typename?: 'CompositionAndRemoveResult';
  /** The produced composition config. Will be null if there are any errors */
  compositionConfig?: Maybe<CompositionConfig>;
  /**
   * List of errors during composition. Errors mean that Apollo was unable to compose the
   * graph's implementing services into a GraphQL schema. This partial schema should not be
   * published to the implementing service if there were any errors encountered.
   */
  errors: Array<Maybe<SchemaCompositionError>>;
  /** Whether the gateway link was updated, or would have been for dry runs. */
  updatedGateway: Scalars['Boolean'];
  /** Whether the removed implementing service existed. */
  didExist: Scalars['Boolean'];
  /** ID that points to the results of composition. */
  graphCompositionID: Scalars['String'];
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
};

/** Metadata about the result of composition run in the cloud, combined with implementing service upsert */
export type CompositionAndUpsertResult = {
  __typename?: 'CompositionAndUpsertResult';
  /** The produced composition config. Will be null if there are any errors */
  compositionConfig?: Maybe<CompositionConfig>;
  /**
   * List of errors during composition. Errors mean that Apollo was unable to compose the
   * graph's implementing services into a GraphQL schema. This partial schema should not be
   * published to the implementing service if there were any errors encountered
   */
  errors: Array<Maybe<SchemaCompositionError>>;
  /** Whether the gateway link was updated. */
  updatedGateway: Scalars['Boolean'];
  /** Whether an implementingService was created as part of this mutation */
  wasCreated: Scalars['Boolean'];
  /** ID that points to the results of composition. */
  graphCompositionID: Scalars['String'];
  /** Whether an implementingService was updated as part of this mutation */
  wasUpdated: Scalars['Boolean'];
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
};

export type CompositionCheckTask = CheckWorkflowTask & {
  __typename?: 'CompositionCheckTask';
  id: Scalars['ID'];
  workflow: CheckWorkflow;
  status: CheckWorkflowTaskStatus;
  /** The result of the composition. */
  result?: Maybe<CompositionResult>;
  createdAt: Scalars['Timestamp'];
  completedAt?: Maybe<Scalars['Timestamp']>;
};

/** The composition config exposed to the gateway */
export type CompositionConfig = {
  __typename?: 'CompositionConfig';
  /**
   * List of GCS links for implementing services that comprise a composed graph
   * @deprecated Soon we will stop writing to GCS locations
   */
  implementingServiceLocations: Array<ImplementingServiceLocation>;
  /** Hash of the composed schema */
  schemaHash: Scalars['String'];
};

/** Metadata about the result of composition run in the cloud */
export type CompositionPublishResult = CompositionResult & {
  __typename?: 'CompositionPublishResult';
  /** ID that points to the results of this composition. */
  graphCompositionID: Scalars['ID'];
  /** The produced composition config. Will be null if there are any errors */
  compositionConfig?: Maybe<CompositionConfig>;
  /**
   * List of errors during composition. Errors mean that Apollo was unable to compose the
   * graph's implementing services into a GraphQL schema. This partial schema should not be
   * published to the implementing service if there were any errors encountered
   */
  errors: Array<SchemaCompositionError>;
  /** Whether the gateway link was updated. */
  updatedGateway: Scalars['Boolean'];
  /**
   * Supergraph SDL generated by composition (this is not the CSDL, that is a deprecated format).
   * @deprecated Use supergraphSdl instead
   */
  csdl?: Maybe<Scalars['GraphQLDocument']>;
  /** Supergraph SDL generated by composition. */
  supergraphSdl?: Maybe<Scalars['GraphQLDocument']>;
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  webhookNotificationBody?: Maybe<Scalars['String']>;
};

/** Result of a composition, either as the result of a composition validation or a publish. */
export type CompositionResult = {
  /** ID that points to the results of this composition. */
  graphCompositionID: Scalars['ID'];
  /**
   * List of errors during composition. Errors mean that Apollo was unable to compose the
   * graph's implementing services into a GraphQL schema. This partial schema should not be
   * published to the implementing service if there were any errors encountered
   */
  errors: Array<SchemaCompositionError>;
  /**
   * Supergraph SDL generated by composition (this is not the CSDL, that is a deprecated format).
   * @deprecated Use supergraphSdl instead
   */
  csdl?: Maybe<Scalars['GraphQLDocument']>;
  /** Supergraph SDL generated by composition. */
  supergraphSdl?: Maybe<Scalars['GraphQLDocument']>;
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
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
  /** List of implementing service partial schemas that comprised the graph composed during validation */
  implementingServices: Array<FederatedImplementingServicePartialSchema>;
  /** Hash of the composed schema */
  schemaHash?: Maybe<Scalars['String']>;
};

/** Metadata about the result of compositions validation run in the cloud */
export type CompositionValidationResult = CompositionResult & {
  __typename?: 'CompositionValidationResult';
  /** ID that points to the results of this composition. */
  graphCompositionID: Scalars['ID'];
  /**
   * List of errors during composition. Errors mean that Apollo was unable to compose the
   * graph's implementing services into a GraphQL schema. This partial schema should not be
   * published to the implementing service if there were any errors encountered
   */
  errors: Array<SchemaCompositionError>;
  /**
   * Akin to a composition config, represents the partial schemas and implementing services that were used
   * in running composition. Will be null if any errors are encountered. Also may contain a schema hash if
   * one could be computed, which can be used for schema validation.
   */
  compositionValidationDetails?: Maybe<CompositionValidationDetails>;
  /** The implementing service that was responsible for triggering the validation */
  proposedImplementingService: FederatedImplementingServicePartialSchema;
  /** Describes whether composition succeeded. */
  compositionSuccess: Scalars['Boolean'];
  /**
   * Supergraph SDL generated by composition (this is not the CSDL, that is a deprecated format).
   * @deprecated Use supergraphSdl instead
   */
  csdl?: Maybe<Scalars['GraphQLDocument']>;
  /** Supergraph SDL generated by composition. */
  supergraphSdl?: Maybe<Scalars['GraphQLDocument']>;
  /** List of subgraphs that are included in this composition. */
  subgraphConfigs: Array<SubgraphConfig>;
  /** If created as part of a check workflow, the associated workflow task. */
  workflowTask?: Maybe<CompositionCheckTask>;
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


export type CronJobRecentExecutionsArgs = {
  n?: Maybe<Scalars['Int']>;
};

export enum DatadogApiRegion {
  Eu = 'EU',
  Us = 'US'
}

export type DatadogMetricsConfig = {
  __typename?: 'DatadogMetricsConfig';
  apiKey: Scalars['String'];
  apiRegion: DatadogApiRegion;
  enabled: Scalars['Boolean'];
  legacyMetricNames: Scalars['Boolean'];
};

export type DeleteSchemaTagResult = {
  __typename?: 'DeleteSchemaTagResult';
  deleted: Scalars['Boolean'];
  deletedSubscriptionIDs: Array<Scalars['ID']>;
};

export enum DeletionTargetType {
  Account = 'ACCOUNT',
  User = 'USER'
}

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


export type DurationHistogramDurationMsArgs = {
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
  /**
   * The version of the edge server reporting agent, e.g. apollo-server-2.8,
   * graphql-java-3.1, etc. length must be <= 256 characters.
   */
  libraryVersion?: Maybe<Scalars['String']>;
  /**
   * The infra environment in which this edge server is running, e.g. localhost,
   * Kubernetes, AWS Lambda, Google CloudRun, AWS ECS, etc. length must be <= 256 characters.
   */
  platform?: Maybe<Scalars['String']>;
  /**
   * The runtime in which the edge server is running, e.g. node 12.03,
   * zulu8.46.0.19-ca-jdk8.0.252-macosx_x64, etc. length must be <= 256 characters.
   */
  runtimeVersion?: Maybe<Scalars['String']>;
  /**
   * If available, an identifier for the edge server instance, such that when
   * restarting this instance it will have the same serverId, with a different
   * bootId. For example, in Kubernetes this might be the pod name. Length must be
   * <= 256 characters.
   */
  serverId?: Maybe<Scalars['String']>;
  /**
   * An identifier used to distinguish the version (from the user's perspective) of
   * the edge server's code itself. For instance, the git sha of the server's
   * repository or the docker sha of the associated image this server runs with.
   * Length must be <= 256 characters.
   */
  userVersion?: Maybe<Scalars['String']>;
};

/** Columns of EdgeServerInfos. */
export enum EdgeServerInfosColumn {
  BootId = 'BOOT_ID',
  ExecutableSchemaId = 'EXECUTABLE_SCHEMA_ID',
  LibraryVersion = 'LIBRARY_VERSION',
  Platform = 'PLATFORM',
  RuntimeVersion = 'RUNTIME_VERSION',
  SchemaTag = 'SCHEMA_TAG',
  ServerId = 'SERVER_ID',
  ServiceId = 'SERVICE_ID',
  Timestamp = 'TIMESTAMP',
  UserVersion = 'USER_VERSION'
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

/**
 * Filter for data in EdgeServerInfos. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type EdgeServerInfosFilter = {
  and?: Maybe<Array<EdgeServerInfosFilter>>;
  /**
   * Selects rows whose bootId dimension equals the given value if not null. To
   * query for the null value, use {in: {bootId: [null]}} instead.
   */
  bootId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose executableSchemaId dimension equals the given value if not
   * null. To query for the null value, use {in: {executableSchemaId: [null]}} instead.
   */
  executableSchemaId?: Maybe<Scalars['ID']>;
  in?: Maybe<EdgeServerInfosFilterIn>;
  /**
   * Selects rows whose libraryVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {libraryVersion: [null]}} instead.
   */
  libraryVersion?: Maybe<Scalars['String']>;
  not?: Maybe<EdgeServerInfosFilter>;
  or?: Maybe<Array<EdgeServerInfosFilter>>;
  /**
   * Selects rows whose platform dimension equals the given value if not null. To
   * query for the null value, use {in: {platform: [null]}} instead.
   */
  platform?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose runtimeVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {runtimeVersion: [null]}} instead.
   */
  runtimeVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serverId dimension equals the given value if not null. To
   * query for the null value, use {in: {serverId: [null]}} instead.
   */
  serverId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose userVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {userVersion: [null]}} instead.
   */
  userVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in EdgeServerInfos. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type EdgeServerInfosFilterIn = {
  /**
   * Selects rows whose bootId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  bootId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose executableSchemaId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  executableSchemaId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose libraryVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  libraryVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose platform dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  platform?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose runtimeVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  runtimeVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serverId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serverId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose userVersion dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  userVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
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

export enum EmailCategory {
  Educational = 'EDUCATIONAL'
}

export type EmailPreferences = {
  __typename?: 'EmailPreferences';
  email: Scalars['String'];
  subscriptions: Array<EmailCategory>;
  unsubscribedFromAll: Scalars['Boolean'];
};

/** Columns of EnumStats. */
export enum EnumStatsColumn {
  AccountId = 'ACCOUNT_ID',
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  EnumType = 'ENUM_TYPE',
  EnumValue = 'ENUM_VALUE',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestCount = 'REQUEST_COUNT',
  ResponseCount = 'RESPONSE_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type EnumStatsDimensions = {
  __typename?: 'EnumStatsDimensions';
  accountId?: Maybe<Scalars['ID']>;
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  enumType?: Maybe<Scalars['String']>;
  enumValue?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in EnumStats. Fields with dimension names represent equality
 * checks. All fields are implicitly ANDed together.
 */
export type EnumStatsFilter = {
  /**
   * Selects rows whose accountId dimension equals the given value if not null. To
   * query for the null value, use {in: {accountId: [null]}} instead.
   */
  accountId?: Maybe<Scalars['ID']>;
  and?: Maybe<Array<EnumStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose enumType dimension equals the given value if not null. To
   * query for the null value, use {in: {enumType: [null]}} instead.
   */
  enumType?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose enumValue dimension equals the given value if not null. To
   * query for the null value, use {in: {enumValue: [null]}} instead.
   */
  enumValue?: Maybe<Scalars['String']>;
  in?: Maybe<EnumStatsFilterIn>;
  not?: Maybe<EnumStatsFilter>;
  or?: Maybe<Array<EnumStatsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in EnumStats. Fields match if the corresponding dimension's
 * value is in the given list. All fields are implicitly ANDed together.
 */
export type EnumStatsFilterIn = {
  /**
   * Selects rows whose accountId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  accountId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose enumType dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  enumType?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose enumValue dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  enumValue?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type EnumStatsMetrics = {
  __typename?: 'EnumStatsMetrics';
  requestCount: Scalars['Long'];
  responseCount: Scalars['Long'];
};

export type EnumStatsOrderBySpec = {
  column: EnumStatsColumn;
  direction: Ordering;
};

export type EnumStatsRecord = {
  __typename?: 'EnumStatsRecord';
  /** Dimensions of EnumStats that can be grouped by. */
  groupBy: EnumStatsDimensions;
  /** Metrics of EnumStats that can be aggregated over. */
  metrics: EnumStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type Error = {
  message: Scalars['String'];
};

/** Columns of ErrorStats. */
export enum ErrorStatsColumn {
  AccountId = 'ACCOUNT_ID',
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  ErrorsCount = 'ERRORS_COUNT',
  Path = 'PATH',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestsWithErrorsCount = 'REQUESTS_WITH_ERRORS_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type ErrorStatsDimensions = {
  __typename?: 'ErrorStatsDimensions';
  accountId?: Maybe<Scalars['ID']>;
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ErrorStats. Fields with dimension names represent equality
 * checks. All fields are implicitly ANDed together.
 */
export type ErrorStatsFilter = {
  /**
   * Selects rows whose accountId dimension equals the given value if not null. To
   * query for the null value, use {in: {accountId: [null]}} instead.
   */
  accountId?: Maybe<Scalars['ID']>;
  and?: Maybe<Array<ErrorStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  in?: Maybe<ErrorStatsFilterIn>;
  not?: Maybe<ErrorStatsFilter>;
  or?: Maybe<Array<ErrorStatsFilter>>;
  /**
   * Selects rows whose path dimension equals the given value if not null. To query
   * for the null value, use {in: {path: [null]}} instead.
   */
  path?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ErrorStats. Fields match if the corresponding dimension's
 * value is in the given list. All fields are implicitly ANDed together.
 */
export type ErrorStatsFilterIn = {
  /**
   * Selects rows whose accountId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  accountId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  ClickCheckList = 'CLICK_CHECK_LIST',
  ClickGoToGraphSettings = 'CLICK_GO_TO_GRAPH_SETTINGS',
  RunExplorerOperation = 'RUN_EXPLORER_OPERATION'
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
  devGraph: Scalars['Boolean'];
  federatedGraph: Scalars['Boolean'];
  freeConsumerSeats: Scalars['Boolean'];
};

/** Feature Intros Input Type */
export type FeatureIntrosInput = {
  devGraph?: Maybe<Scalars['Boolean']>;
  federatedGraph?: Maybe<Scalars['Boolean']>;
  freeConsumerSeats?: Maybe<Scalars['Boolean']>;
};

export type FederatedImplementingService = {
  __typename?: 'FederatedImplementingService';
  /** Name of the implementing service */
  name: Scalars['String'];
  /** URL of the graphql endpoint of the implementing service */
  url?: Maybe<Scalars['String']>;
  /**
   * A way to capture some customer-specific way of tracking which version / edition
   * of the ImplementingService this is. Typically a Git SHA or docker image ID.
   */
  revision: Scalars['String'];
  /**
   * Identifies which graph this implementing service belongs to.
   * Formerly known as "service_id"
   */
  graphID: Scalars['String'];
  /**
   * Specifies which variant of a graph this implementing service belongs to".
   * Formerly known as "tag"
   */
  graphVariant: Scalars['String'];
  /**
   * An implementing service could have multiple inactive partial schemas that were previously uploaded
   * activePartialSchema returns the one that is designated to be used for composition for a given graph-variant
   */
  activePartialSchema: PartialSchema;
  /** Timestamp of when this implementing service was created */
  createdAt: Scalars['Timestamp'];
  /** Timestamp for when this implementing service was updated */
  updatedAt: Scalars['Timestamp'];
};

/** A minimal representation of a federated implementing service, using only a name and partial schema SDL */
export type FederatedImplementingServicePartialSchema = {
  __typename?: 'FederatedImplementingServicePartialSchema';
  /** The name of the implementing service */
  name: Scalars['String'];
  /** The partial schema of the implementing service */
  sdl: Scalars['String'];
};

/** List of federated implementing services that compose a graph */
export type FederatedImplementingServices = {
  __typename?: 'FederatedImplementingServices';
  services: Array<FederatedImplementingService>;
};

export type FieldChangeSummaryCounts = {
  __typename?: 'FieldChangeSummaryCounts';
  /** Number of changes that are additions of fields to object and interface types. */
  additions: Scalars['Int'];
  /** Number of changes that are removals of fields from object and interface types. */
  removals: Scalars['Int'];
  /**
   * Number of changes that are field edits. This includes fields changing type and any field
   * deprecation and description changes, but also includes any argument changes and any input object
   * field changes.
   */
  edits: Scalars['Int'];
};

/** Columns of FieldStats. */
export enum FieldStatsColumn {
  AccountId = 'ACCOUNT_ID',
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  ErrorsCount = 'ERRORS_COUNT',
  Field = 'FIELD',
  FieldHistogram = 'FIELD_HISTOGRAM',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestCount = 'REQUEST_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type FieldStatsDimensions = {
  __typename?: 'FieldStatsDimensions';
  accountId?: Maybe<Scalars['ID']>;
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  field?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in FieldStats. Fields with dimension names represent equality
 * checks. All fields are implicitly ANDed together.
 */
export type FieldStatsFilter = {
  /**
   * Selects rows whose accountId dimension equals the given value if not null. To
   * query for the null value, use {in: {accountId: [null]}} instead.
   */
  accountId?: Maybe<Scalars['ID']>;
  and?: Maybe<Array<FieldStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose field dimension equals the given value if not null. To
   * query for the null value, use {in: {field: [null]}} instead.
   */
  field?: Maybe<Scalars['String']>;
  in?: Maybe<FieldStatsFilterIn>;
  not?: Maybe<FieldStatsFilter>;
  or?: Maybe<Array<FieldStatsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in FieldStats. Fields match if the corresponding dimension's
 * value is in the given list. All fields are implicitly ANDed together.
 */
export type FieldStatsFilterIn = {
  /**
   * Selects rows whose accountId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  accountId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose field dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  field?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type FieldStatsMetrics = {
  __typename?: 'FieldStatsMetrics';
  errorsCount: Scalars['Long'];
  fieldHistogram: DurationHistogram;
  requestCount: Scalars['Long'];
};

export type FieldStatsOrderBySpec = {
  column: FieldStatsColumn;
  direction: Ordering;
};

export type FieldStatsRecord = {
  __typename?: 'FieldStatsRecord';
  /** Dimensions of FieldStats that can be grouped by. */
  groupBy: FieldStatsDimensions;
  /** Metrics of FieldStats that can be aggregated over. */
  metrics: FieldStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type GitContext = {
  __typename?: 'GitContext';
  remoteUrl?: Maybe<Scalars['String']>;
  remoteHost?: Maybe<GitRemoteHost>;
  commit?: Maybe<Scalars['ID']>;
  commitUrl?: Maybe<Scalars['String']>;
  committer?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
  branch?: Maybe<Scalars['String']>;
};

/** This is stored with a schema when it is uploaded */
export type GitContextInput = {
  remoteUrl?: Maybe<Scalars['String']>;
  commit?: Maybe<Scalars['ID']>;
  committer?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
  branch?: Maybe<Scalars['String']>;
};

export enum GitRemoteHost {
  Github = 'GITHUB',
  Gitlab = 'GITLAB',
  Bitbucket = 'BITBUCKET'
}

export type GraphApiKey = ApiKey & {
  __typename?: 'GraphApiKey';
  createdAt: Scalars['Timestamp'];
  createdBy?: Maybe<Identity>;
  id: Scalars['ID'];
  keyName?: Maybe<Scalars['String']>;
  role: UserPermission;
  token: Scalars['String'];
};

/** A union of all combinations that can comprise the implementingServices for a Service */
export type GraphImplementors = NonFederatedImplementingService | FederatedImplementingServices;


/** A variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariant = {
  __typename?: 'GraphVariant';
  /** Global identifier for the graph variant, in the form `graph@variant`. */
  id: Scalars['ID'];
  /** Graph ID of the variant. Prefer using graph { id } when feasible. */
  graphId: Scalars['String'];
  /** Graph the variant belongs to */
  graph: Service;
  /** Name of the variant, like `variant`. */
  name: Scalars['String'];
  /** URL where the graph can be queried. */
  url?: Maybe<Scalars['String']>;
  /** If the graphql endpoint is set up to accept cookies */
  sendCookies: Scalars['Boolean'];
  /** URL where the graph subscription can be queried. */
  subscriptionUrl?: Maybe<Scalars['String']>;
  /** Explorer setting for preflight script to run before the actual GraphQL operations is run. */
  preflightScript?: Maybe<Scalars['String']>;
  /** Explorer setting for default headers for a graph */
  defaultHeaders?: Maybe<Scalars['String']>;
  /** As new schema tags keep getting published, activeSchemaPublish refers to the latest. */
  activeSchemaPublish?: Maybe<SchemaTag>;
  /** Get most recent checks on a variant. If a branch filter is provided then all checks will come from that branch */
  checks: Array<SchemaCheck>;
  /** Get the most recent checks per branch. If branch is not set, then then those checks will not be grouped */
  checksPerBranch: Array<SchemaCheck>;
  /** Get a single schema check by its id */
  check?: Maybe<SchemaCheck>;
  /** If the variant is protected */
  isProtected: Scalars['Boolean'];
  /** Is this variant one of the current user's favorite variants? */
  isFavoriteOfCurrentUser: Scalars['Boolean'];
  isPublic: Scalars['Boolean'];
  /** Which permissions the current user has for interacting with this variant */
  permissions: GraphVariantPermissions;
  /** The total number of requests for this variant in the last 24 hours */
  requestsInLastDay?: Maybe<Scalars['Long']>;
  /** The last instant that usage information (e.g. operation stat, client stats) was reported for this variant */
  usageLastReportedAt?: Maybe<Scalars['Timestamp']>;
};


/** A variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantChecksArgs = {
  limit?: Scalars['Int'];
  branch?: Maybe<Scalars['String']>;
};


/** A variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantChecksPerBranchArgs = {
  limit?: Scalars['Int'];
};


/** A variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantCheckArgs = {
  id: Scalars['ID'];
};

export type GraphVariantLookup = GraphVariant | InvalidRefFormat;

/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutation = {
  __typename?: 'GraphVariantMutation';
  /** Global identifier for the graph variant, in the form `graph@variant`. */
  id: Scalars['ID'];
  /** Graph ID of the variant */
  graphId: Scalars['String'];
  /** Name of the variant, like `variant`. */
  name: Scalars['String'];
  updateURL?: Maybe<GraphVariant>;
  updateSubscriptionURL?: Maybe<GraphVariant>;
  updateSendCookies?: Maybe<GraphVariant>;
  updateIsProtected?: Maybe<GraphVariant>;
  updatePreflightScript?: Maybe<GraphVariant>;
  updateDefaultHeaders?: Maybe<GraphVariant>;
  setIsFavoriteOfCurrentUser: GraphVariant;
  updateVariantIsPublic?: Maybe<GraphVariant>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateUrlArgs = {
  url?: Maybe<Scalars['String']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateSubscriptionUrlArgs = {
  subscriptionUrl?: Maybe<Scalars['String']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateSendCookiesArgs = {
  sendCookies: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateIsProtectedArgs = {
  isProtected: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdatePreflightScriptArgs = {
  preflightScript?: Maybe<Scalars['String']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateDefaultHeadersArgs = {
  defaultHeaders?: Maybe<Scalars['String']>;
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationSetIsFavoriteOfCurrentUserArgs = {
  favorite: Scalars['Boolean'];
};


/** Modifies a variant of a graph, also called a schema tag in parts of our product. */
export type GraphVariantMutationUpdateVariantIsPublicArgs = {
  isPublic: Scalars['Boolean'];
};

/** A map from permission String to boolean that the current user is allowed for the root graph variant */
export type GraphVariantPermissions = {
  __typename?: 'GraphVariantPermissions';
  canManageExplorerSettings: Scalars['Boolean'];
  canPushSchemas: Scalars['Boolean'];
};

export type HistoricQueryParameters = {
  from?: Maybe<Scalars['Timestamp']>;
  to?: Maybe<Scalars['Timestamp']>;
  /** Minimum number of requests within the window for a query to be considered. */
  queryCountThreshold?: Maybe<Scalars['Int']>;
  /**
   * Number of requests within the window for a query to be considered, relative to
   * total request count. Expected values are between 0 and 0.05 (minimum 5% of total
   * request volume)
   */
  queryCountThresholdPercentage?: Maybe<Scalars['Float']>;
  /** A list of operation IDs to filter out during validation. */
  ignoredOperations?: Maybe<Array<Scalars['ID']>>;
  /** A list of clients to filter out during validation. */
  excludedClients?: Maybe<Array<ClientInfoFilter>>;
  /**
   * A list of variants to include in the validation. If no variants are provided
   * then this defaults to the "current" variant along with the base variant. The
   * base variant indicates the schema that generates diff and marks the metrics that
   * are checked for broken queries. We union this base variant with the untagged values('',
   * same as null inside of `in`, and 'current') in this metrics fetch. This strategy
   * supports users who have not tagged their metrics or schema.
   */
  includedVariants?: Maybe<Array<Scalars['String']>>;
};

export enum HttpMethod {
  Connect = 'CONNECT',
  Delete = 'DELETE',
  Get = 'GET',
  Head = 'HEAD',
  Options = 'OPTIONS',
  Patch = 'PATCH',
  Post = 'POST',
  Put = 'PUT',
  Trace = 'TRACE',
  Unknown = 'UNKNOWN',
  Unrecognized = 'UNRECOGNIZED'
}

export type Identity = {
  asActor: Actor;
  id: Scalars['ID'];
  name: Scalars['String'];
};

/** An actor's identity and info about the client they used to perform the action */
export type IdentityAndClientInfo = {
  __typename?: 'IdentityAndClientInfo';
  /** Identity info about the actor */
  identity?: Maybe<Identity>;
  /** The clientName given to Apollo Cloud when the actor performed the action */
  clientName?: Maybe<Scalars['String']>;
  /** The clientVersion given to Apollo Cloud when the actor performed the action */
  clientVersion?: Maybe<Scalars['String']>;
};

export type IdentityMutation = ServiceMutation | UserMutation;

export type IgnoreOperationsInChecksResult = {
  __typename?: 'IgnoreOperationsInChecksResult';
  graph: Service;
};

/** The location of the implementing service config file in storage */
export type ImplementingServiceLocation = {
  __typename?: 'ImplementingServiceLocation';
  /** The name of the implementing service */
  name: Scalars['String'];
  /** The path in storage to access the implementing service config file */
  path: Scalars['String'];
};

/** Columns of InputStats. */
export enum InputStatsColumn {
  AccountId = 'ACCOUNT_ID',
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  FieldName = 'FIELD_NAME',
  FieldType = 'FIELD_TYPE',
  ParentType = 'PARENT_TYPE',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestCount = 'REQUEST_COUNT',
  RequestCountNull = 'REQUEST_COUNT_NULL',
  RequestCountUndefined = 'REQUEST_COUNT_UNDEFINED',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type InputStatsDimensions = {
  __typename?: 'InputStatsDimensions';
  accountId?: Maybe<Scalars['ID']>;
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  fieldName?: Maybe<Scalars['String']>;
  fieldType?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in InputStats. Fields with dimension names represent equality
 * checks. All fields are implicitly ANDed together.
 */
export type InputStatsFilter = {
  /**
   * Selects rows whose accountId dimension equals the given value if not null. To
   * query for the null value, use {in: {accountId: [null]}} instead.
   */
  accountId?: Maybe<Scalars['ID']>;
  and?: Maybe<Array<InputStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose fieldName dimension equals the given value if not null. To
   * query for the null value, use {in: {fieldName: [null]}} instead.
   */
  fieldName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose fieldType dimension equals the given value if not null. To
   * query for the null value, use {in: {fieldType: [null]}} instead.
   */
  fieldType?: Maybe<Scalars['String']>;
  in?: Maybe<InputStatsFilterIn>;
  not?: Maybe<InputStatsFilter>;
  or?: Maybe<Array<InputStatsFilter>>;
  /**
   * Selects rows whose parentType dimension equals the given value if not null. To
   * query for the null value, use {in: {parentType: [null]}} instead.
   */
  parentType?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in InputStats. Fields match if the corresponding dimension's
 * value is in the given list. All fields are implicitly ANDed together.
 */
export type InputStatsFilterIn = {
  /**
   * Selects rows whose accountId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  accountId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose fieldName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  fieldName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose fieldType dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  fieldType?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose parentType dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  parentType?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type InputStatsMetrics = {
  __typename?: 'InputStatsMetrics';
  requestCount: Scalars['Long'];
  requestCountNull: Scalars['Long'];
  requestCountUndefined: Scalars['Long'];
};

export type InputStatsOrderBySpec = {
  column: InputStatsColumn;
  direction: Ordering;
};

export type InputStatsRecord = {
  __typename?: 'InputStatsRecord';
  /** Dimensions of InputStats that can be grouped by. */
  groupBy: InputStatsDimensions;
  /** Metrics of InputStats that can be aggregated over. */
  metrics: InputStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
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
  InternalMdgReadOnly = 'INTERNAL_MDG_READ_ONLY',
  InternalMdgSales = 'INTERNAL_MDG_SALES',
  InternalMdgSuperAdmin = 'INTERNAL_MDG_SUPER_ADMIN',
  InternalMdgSupport = 'INTERNAL_MDG_SUPPORT'
}

export type IntrospectionDirective = {
  __typename?: 'IntrospectionDirective';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  locations: Array<IntrospectionDirectiveLocation>;
  args: Array<IntrospectionInputValue>;
};

export type IntrospectionDirectiveInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  locations: Array<IntrospectionDirectiveLocation>;
  args: Array<IntrospectionInputValueInput>;
  isRepeatable?: Maybe<Scalars['Boolean']>;
};

/** __DirectiveLocation introspection type */
export enum IntrospectionDirectiveLocation {
  /** Location adjacent to a query operation. */
  Query = 'QUERY',
  /** Location adjacent to a mutation operation. */
  Mutation = 'MUTATION',
  /** Location adjacent to a subscription operation. */
  Subscription = 'SUBSCRIPTION',
  /** Location adjacent to a field. */
  Field = 'FIELD',
  /** Location adjacent to a fragment definition. */
  FragmentDefinition = 'FRAGMENT_DEFINITION',
  /** Location adjacent to a fragment spread. */
  FragmentSpread = 'FRAGMENT_SPREAD',
  /** Location adjacent to an inline fragment. */
  InlineFragment = 'INLINE_FRAGMENT',
  /** Location adjacent to a variable definition. */
  VariableDefinition = 'VARIABLE_DEFINITION',
  /** Location adjacent to a schema definition. */
  Schema = 'SCHEMA',
  /** Location adjacent to a scalar definition. */
  Scalar = 'SCALAR',
  /** Location adjacent to an object type definition. */
  Object = 'OBJECT',
  /** Location adjacent to a field definition. */
  FieldDefinition = 'FIELD_DEFINITION',
  /** Location adjacent to an argument definition. */
  ArgumentDefinition = 'ARGUMENT_DEFINITION',
  /** Location adjacent to an interface definition. */
  Interface = 'INTERFACE',
  /** Location adjacent to a union definition. */
  Union = 'UNION',
  /** Location adjacent to an enum definition. */
  Enum = 'ENUM',
  /** Location adjacent to an enum value definition. */
  EnumValue = 'ENUM_VALUE',
  /** Location adjacent to an input object type definition. */
  InputObject = 'INPUT_OBJECT',
  /** Location adjacent to an input object field definition. */
  InputFieldDefinition = 'INPUT_FIELD_DEFINITION'
}

/** Values associated with introspection result for an enum value */
export type IntrospectionEnumValue = {
  __typename?: 'IntrospectionEnumValue';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  isDeprecated: Scalars['Boolean'];
  /** @deprecated Use deprecationReason instead */
  depreactionReason?: Maybe<Scalars['String']>;
  deprecationReason?: Maybe<Scalars['String']>;
};

/** __EnumValue introspection type */
export type IntrospectionEnumValueInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  isDeprecated: Scalars['Boolean'];
  deprecationReason?: Maybe<Scalars['String']>;
};

/** Values associated with introspection result for field */
export type IntrospectionField = {
  __typename?: 'IntrospectionField';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  args: Array<IntrospectionInputValue>;
  type: IntrospectionType;
  isDeprecated: Scalars['Boolean'];
  deprecationReason?: Maybe<Scalars['String']>;
};

/** __Field introspection type */
export type IntrospectionFieldInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  args: Array<IntrospectionInputValueInput>;
  type: IntrospectionTypeInput;
  isDeprecated: Scalars['Boolean'];
  deprecationReason?: Maybe<Scalars['String']>;
};

/** Values associated with introspection result for an input field */
export type IntrospectionInputValue = {
  __typename?: 'IntrospectionInputValue';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  type: IntrospectionType;
  defaultValue?: Maybe<Scalars['String']>;
};

/** __Value introspection type */
export type IntrospectionInputValueInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  type: IntrospectionTypeInput;
  defaultValue?: Maybe<Scalars['String']>;
  isDeprecated?: Maybe<Scalars['Boolean']>;
  deprecationReason?: Maybe<Scalars['String']>;
};

export type IntrospectionSchema = {
  __typename?: 'IntrospectionSchema';
  types: Array<IntrospectionType>;
  queryType: IntrospectionType;
  mutationType?: Maybe<IntrospectionType>;
  subscriptionType?: Maybe<IntrospectionType>;
  directives: Array<IntrospectionDirective>;
};


export type IntrospectionSchemaTypesArgs = {
  filter?: Maybe<TypeFilterConfig>;
};

/** __Schema introspection type */
export type IntrospectionSchemaInput = {
  types?: Maybe<Array<IntrospectionTypeInput>>;
  queryType: IntrospectionTypeRefInput;
  mutationType?: Maybe<IntrospectionTypeRefInput>;
  subscriptionType?: Maybe<IntrospectionTypeRefInput>;
  directives: Array<IntrospectionDirectiveInput>;
  description?: Maybe<Scalars['String']>;
};

/** Object containing all possible values for an introspectionType */
export type IntrospectionType = {
  __typename?: 'IntrospectionType';
  kind?: Maybe<IntrospectionTypeKind>;
  name?: Maybe<Scalars['String']>;
  /** printed representation of type, including nested nullability and list ofTypes */
  printed: Scalars['String'];
  /** the base kind of the type this references, ignoring lists and nullability */
  baseKind?: Maybe<IntrospectionTypeKind>;
  description?: Maybe<Scalars['String']>;
  fields?: Maybe<Array<IntrospectionField>>;
  interfaces?: Maybe<Array<IntrospectionType>>;
  possibleTypes?: Maybe<Array<IntrospectionType>>;
  enumValues?: Maybe<Array<IntrospectionEnumValue>>;
  inputFields?: Maybe<Array<IntrospectionInputValue>>;
  ofType?: Maybe<IntrospectionType>;
};


/** Object containing all possible values for an introspectionType */
export type IntrospectionTypeEnumValuesArgs = {
  includeDeprecated?: Maybe<Scalars['Boolean']>;
};

/** __Type introspection type */
export type IntrospectionTypeInput = {
  kind: IntrospectionTypeKind;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  specifiedByUrl?: Maybe<Scalars['String']>;
  fields?: Maybe<Array<IntrospectionFieldInput>>;
  interfaces?: Maybe<Array<IntrospectionTypeInput>>;
  possibleTypes?: Maybe<Array<IntrospectionTypeInput>>;
  enumValues?: Maybe<Array<IntrospectionEnumValueInput>>;
  inputFields?: Maybe<Array<IntrospectionInputValueInput>>;
  ofType?: Maybe<IntrospectionTypeInput>;
};

export enum IntrospectionTypeKind {
  /** Indicates this type is a scalar. */
  Scalar = 'SCALAR',
  /** Indicates this type is an object. 'fields' and 'interfaces' are valid fields. */
  Object = 'OBJECT',
  /**
   * Indicates this type is an interface. 'fields' and 'possibleTypes' are valid
   * fields
   */
  Interface = 'INTERFACE',
  /** Indicates this type is a union. 'possibleTypes' is a valid field. */
  Union = 'UNION',
  /** Indicates this type is an enum. 'enumValues' is a valid field. */
  Enum = 'ENUM',
  /** Indicates this type is an input object. 'inputFields' is a valid field. */
  InputObject = 'INPUT_OBJECT',
  /** Indicates this type is a list. 'ofType' is a valid field. */
  List = 'LIST',
  /** Indicates this type is a non-null. 'ofType' is a valid field. */
  NonNull = 'NON_NULL'
}

/** Shallow __Type introspection type */
export type IntrospectionTypeRefInput = {
  name: Scalars['String'];
  kind?: Maybe<Scalars['String']>;
};

export type InvalidOperation = {
  __typename?: 'InvalidOperation';
  signature: Scalars['ID'];
  errors?: Maybe<Array<OperationValidationError>>;
};

export type InvalidRefFormat = Error & {
  __typename?: 'InvalidRefFormat';
  message: Scalars['String'];
};

export type Invoice = {
  __typename?: 'Invoice';
  closedAt?: Maybe<Scalars['Timestamp']>;
  collectionMethod?: Maybe<Scalars['String']>;
  createdAt: Scalars['Timestamp'];
  invoiceNumber: Scalars['Int'];
  state: InvoiceState;
  totalInCents: Scalars['Int'];
  updatedAt: Scalars['Timestamp'];
  uuid: Scalars['ID'];
};

export enum InvoiceState {
  Collected = 'COLLECTED',
  Failed = 'FAILED',
  Open = 'OPEN',
  PastDue = 'PAST_DUE',
  Unknown = 'UNKNOWN'
}


export type MarkChangesForOperationAsSafeResult = {
  __typename?: 'MarkChangesForOperationAsSafeResult';
  success: Scalars['Boolean'];
  message: Scalars['String'];
  /**
   * Nice to have for the frontend since the Apollo cache is already watching for AffectedQuery to update.
   * This might return null if no behavior changes were found for the affected operation ID.
   * This is a weird situation that should never happen.
   */
  affectedOperation?: Maybe<AffectedQuery>;
};

export type MediaUploadInfo = {
  __typename?: 'MediaUploadInfo';
  csrfToken: Scalars['String'];
  maxContentLength: Scalars['Int'];
  url: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  account?: Maybe<AccountMutation>;
  /**
   * Finalize a password reset with a token included in the E-mail link,
   * returns the corresponding login email when successful
   */
  finalizePasswordReset?: Maybe<Scalars['String']>;
  /** Join an account with a token */
  joinAccount?: Maybe<Account>;
  me?: Maybe<IdentityMutation>;
  newAccount?: Maybe<Account>;
  newService?: Maybe<Service>;
  /** Refresh all plans from third-party billing service */
  plansRefreshBilling?: Maybe<Scalars['Void']>;
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
  /** This is called by the form shown to users after they delete their user or organization account. */
  submitPostDeletionFeedback?: Maybe<Scalars['Void']>;
  /** Mutation for basic engagement tracking in studio */
  track?: Maybe<Scalars['Void']>;
  /** Unsubscribe a given email from all emails */
  unsubscribeFromAll?: Maybe<EmailPreferences>;
  user?: Maybe<UserMutation>;
};


export type MutationAccountArgs = {
  id: Scalars['ID'];
};


export type MutationFinalizePasswordResetArgs = {
  newPassword: Scalars['String'];
  resetToken: Scalars['String'];
};


export type MutationJoinAccountArgs = {
  accountId: Scalars['ID'];
  joinToken: Scalars['String'];
};


export type MutationNewAccountArgs = {
  id: Scalars['ID'];
};


export type MutationNewServiceArgs = {
  accountId: Scalars['ID'];
  description?: Maybe<Scalars['String']>;
  hiddenFromUninvitedNonAdminAccountMembers?: Scalars['Boolean'];
  id: Scalars['ID'];
  isDev?: Scalars['Boolean'];
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};


export type MutationReportSchemaArgs = {
  coreSchema?: Maybe<Scalars['String']>;
  report: SchemaReport;
};


export type MutationResetPasswordArgs = {
  email: Scalars['String'];
};


export type MutationResolveAllInternalCronExecutionsArgs = {
  group?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};


export type MutationResolveInternalCronExecutionArgs = {
  id: Scalars['ID'];
};


export type MutationServiceArgs = {
  id: Scalars['ID'];
};


export type MutationSetSubscriptionsArgs = {
  email: Scalars['String'];
  subscriptions: Array<EmailCategory>;
  token: Scalars['String'];
};


export type MutationSetUserSettingsArgs = {
  newSettings?: Maybe<UserSettingsInput>;
};


export type MutationSignUpArgs = {
  email: Scalars['String'];
  fullName: Scalars['String'];
  password: Scalars['String'];
  referrer?: Maybe<Scalars['String']>;
  userSegment?: Maybe<UserSegment>;
  utmCampaign?: Maybe<Scalars['String']>;
  utmMedium?: Maybe<Scalars['String']>;
  utmSource?: Maybe<Scalars['String']>;
};


export type MutationSubmitPostDeletionFeedbackArgs = {
  feedback: Scalars['String'];
  targetIdentifier: Scalars['ID'];
  targetType: DeletionTargetType;
};


export type MutationTrackArgs = {
  event: EventEnum;
  graphID: Scalars['String'];
  graphVariant?: Scalars['String'];
};


export type MutationUnsubscribeFromAllArgs = {
  email: Scalars['String'];
  token: Scalars['String'];
};


export type MutationUserArgs = {
  id: Scalars['ID'];
};

export type NamedIntrospectionArg = {
  __typename?: 'NamedIntrospectionArg';
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
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
  kind?: Maybe<IntrospectionTypeKind>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
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
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  printedType?: Maybe<Scalars['String']>;
};

export type NamedIntrospectionValueNoDescription = {
  __typename?: 'NamedIntrospectionValueNoDescription';
  name?: Maybe<Scalars['String']>;
  printedType?: Maybe<Scalars['String']>;
};

/** A non-federated service for a monolithic graph */
export type NonFederatedImplementingService = {
  __typename?: 'NonFederatedImplementingService';
  /** Timestamp of when this implementing service was created */
  createdAt: Scalars['Timestamp'];
  /**
   * Identifies which graph this non-implementing service belongs to.
   * Formerly known as "service_id"
   */
  graphID: Scalars['String'];
  /**
   * Specifies which variant of a graph this implementing service belongs to".
   * Formerly known as "tag"
   */
  graphVariant: Scalars['String'];
};


export type OdysseyCourse = {
  __typename?: 'OdysseyCourse';
  id: Scalars['ID'];
  enrolledAt?: Maybe<Scalars['Timestamp']>;
  completedAt?: Maybe<Scalars['Timestamp']>;
};

export type OdysseyCourseInput = {
  courseId: Scalars['String'];
  completedAt?: Maybe<Scalars['Timestamp']>;
};

export type OdysseyTask = {
  __typename?: 'OdysseyTask';
  id: Scalars['ID'];
  value?: Maybe<Scalars['String']>;
  completedAt?: Maybe<Scalars['Timestamp']>;
};

export type OdysseyTaskInput = {
  taskId: Scalars['String'];
  value?: Maybe<Scalars['String']>;
  completedAt?: Maybe<Scalars['Timestamp']>;
};

export type Operation = {
  __typename?: 'Operation';
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  signature?: Maybe<Scalars['String']>;
  truncated: Scalars['Boolean'];
};

export type OperationAcceptedChange = {
  __typename?: 'OperationAcceptedChange';
  id: Scalars['ID'];
  graphID: Scalars['ID'];
  checkID: Scalars['ID'];
  operationID: Scalars['String'];
  change: StoredApprovedChange;
  acceptedAt: Scalars['Timestamp'];
  acceptedBy: Identity;
};

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
  name?: Maybe<Scalars['String']>;
};

export type OperationsCheckResult = {
  __typename?: 'OperationsCheckResult';
  id: Scalars['ID'];
  /** The variant that was used as a base to check against */
  checkedVariant: GraphVariant;
  /** Indication of the success of the change, either failure, warning, or notice. */
  checkSeverity: ChangeSeverity;
  /** Number of operations that were validated during schema diff */
  numberOfCheckedOperations: Scalars['Int'];
  /** List of schema changes with associated affected clients and operations */
  changes: Array<Change>;
  /** Summary/counts for all changes in diff */
  changeSummary: ChangeSummary;
  /** Operations affected by all changes in diff */
  affectedQueries?: Maybe<Array<AffectedQuery>>;
  workflowTask: OperationsCheckTask;
  createdAt: Scalars['Timestamp'];
};

export type OperationsCheckTask = CheckWorkflowTask & {
  __typename?: 'OperationsCheckTask';
  id: Scalars['ID'];
  workflow: CheckWorkflow;
  status: CheckWorkflowTaskStatus;
  /** The result of the check. */
  result?: Maybe<OperationsCheckResult>;
  createdAt: Scalars['Timestamp'];
  completedAt?: Maybe<Scalars['Timestamp']>;
};

export type OperationValidationError = {
  __typename?: 'OperationValidationError';
  message: Scalars['String'];
};

export enum Ordering {
  Ascending = 'ASCENDING',
  Descending = 'DESCENDING'
}

/** A reusable invite link for an organization. */
export type OrganizationInviteLink = {
  __typename?: 'OrganizationInviteLink';
  createdAt: Scalars['Timestamp'];
  /** A joinToken that can be passed to Mutation.joinAccount to join the organization. */
  joinToken: Scalars['String'];
  /** The role that the user will receive if they join the organization with this link. */
  role: UserPermission;
};

export type OrganizationSso = {
  __typename?: 'OrganizationSSO';
  defaultRole: UserPermission;
  idpid: Scalars['ID'];
  provider: OrganizationSsoProvider;
};

export enum OrganizationSsoProvider {
  Pingone = 'PINGONE'
}

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
  name?: Maybe<Scalars['String']>;
  routingKey: Scalars['String'];
};

/** Schema for an implementing service with associated metadata */
export type PartialSchema = {
  __typename?: 'PartialSchema';
  /** The enriched sdl of a partial schema */
  sdl: Scalars['String'];
  /** The path of deep storage to find the raw enriched partial schema file */
  sdlPath: Scalars['String'];
  /** Timestamp for when the partial schema was created */
  createdAt: Scalars['Timestamp'];
  /** If this sdl is currently actively composed in the gateway, this is true */
  isLive: Scalars['Boolean'];
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
   * Contents of the partial schema in SDL syntax, but may reference types
   * that aren't defined in this document
   */
  sdl?: Maybe<Scalars['String']>;
  /**
   * Hash of the partial schema to associate; error is thrown if only the hash is
   * specified and the hash has not been seen before
   */
  hash?: Maybe<Scalars['String']>;
};

export type PromoteSchemaError = {
  __typename?: 'PromoteSchemaError';
  code: PromoteSchemaErrorCode;
  message: Scalars['String'];
};

export enum PromoteSchemaErrorCode {
  CannotPromoteSchemaForFederatedGraph = 'CANNOT_PROMOTE_SCHEMA_FOR_FEDERATED_GRAPH'
}

export type PromoteSchemaResponse = {
  __typename?: 'PromoteSchemaResponse';
  code: PromoteSchemaResponseCode;
  tag: SchemaTag;
};

export enum PromoteSchemaResponseCode {
  PromotionSuccess = 'PROMOTION_SUCCESS',
  NoChangesDetected = 'NO_CHANGES_DETECTED'
}

export type PromoteSchemaResponseOrError = PromoteSchemaResponse | PromoteSchemaError;

export type Protobuf = {
  __typename?: 'Protobuf';
  json?: Maybe<Scalars['String']>;
  object?: Maybe<Scalars['Object']>;
  raw: Scalars['Blob'];
  text: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  _odysseyFakeField?: Maybe<Scalars['Boolean']>;
  _fakeField?: Maybe<Scalars['Boolean']>;
  /** Account by ID */
  account?: Maybe<Account>;
  /** Whether an account ID is available for mutation{newAccount(id:)} */
  accountIDAvailable: Scalars['Boolean'];
  /** All accounts */
  allAccounts?: Maybe<Array<Account>>;
  /** All available plans */
  allPlans: Array<BillingPlan>;
  /** All services */
  allServices?: Maybe<Array<Service>>;
  /** All timezones with their offsets from UTC */
  allTimezoneOffsets: Array<TimezoneOffset>;
  /** All users */
  allUsers?: Maybe<Array<User>>;
  /** If this is true, the user is an Apollo administrator who can ignore restrictions based purely on billing plan. */
  canBypassPlanRestrictions: Scalars['Boolean'];
  /** Get the unsubscribe settings for a given email. */
  emailPreferences?: Maybe<EmailPreferences>;
  frontendUrlRoot: Scalars['String'];
  internalActiveCronJobs: Array<CronJob>;
  internalAdminUsers?: Maybe<Array<InternalAdminUser>>;
  internalUnresolvedCronExecutionFailures: Array<CronExecution>;
  /** Current identity, null if not authenticated */
  me?: Maybe<Identity>;
  /** Look up a plan by ID */
  plan?: Maybe<BillingPlan>;
  /** Service by ID */
  service?: Maybe<Service>;
  /**
   * Query statistics across all services. For admins only; normal users must go
   * through AccountsStatsWindow or ServiceStatsWindow.
   */
  stats: StatsWindow;
  /** Get the studio settings for the current user */
  studioSettings?: Maybe<UserSettings>;
  /** The plan started by AccountMutation.startTeamSubscription */
  teamPlan: BillingPlan;
  /** The plan started by AccountMutation.startTrial */
  trialPlan: BillingPlan;
  /** User by ID */
  user?: Maybe<User>;
  /**
   * Access a variant by reference of the form `graphID@variantName`, or `graphID` for the default `current` variant.
   * Returns null when the graph or variant do not exist, or when the graph cannot be accessed.
   * Note that we can return more types implementing Error in the future.
   */
  variant?: Maybe<GraphVariantLookup>;
};


export type QueryAccountArgs = {
  id: Scalars['ID'];
};


export type QueryAccountIdAvailableArgs = {
  id: Scalars['ID'];
};


export type QueryAllAccountsArgs = {
  search?: Maybe<Scalars['String']>;
  tier?: Maybe<BillingPlanTier>;
};


export type QueryAllServicesArgs = {
  search?: Maybe<Scalars['String']>;
};


export type QueryAllUsersArgs = {
  search?: Maybe<Scalars['String']>;
};


export type QueryEmailPreferencesArgs = {
  email: Scalars['String'];
  token: Scalars['String'];
};


export type QueryPlanArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryServiceArgs = {
  id: Scalars['ID'];
};


export type QueryStatsArgs = {
  from: Scalars['Timestamp'];
  resolution?: Maybe<Resolution>;
  to?: Maybe<Scalars['Timestamp']>;
};


export type QueryTeamPlanArgs = {
  billingPeriod: BillingPeriod;
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QueryVariantArgs = {
  ref: Scalars['ID'];
};

/** query documents to validate against */
export type QueryDocumentInput = {
  document?: Maybe<Scalars['String']>;
};

/** Columns of QueryStats. */
export enum QueryStatsColumn {
  AccountId = 'ACCOUNT_ID',
  CachedHistogram = 'CACHED_HISTOGRAM',
  CachedRequestsCount = 'CACHED_REQUESTS_COUNT',
  CacheTtlHistogram = 'CACHE_TTL_HISTOGRAM',
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  ForbiddenOperationCount = 'FORBIDDEN_OPERATION_COUNT',
  FromEngineproxy = 'FROM_ENGINEPROXY',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RegisteredOperationCount = 'REGISTERED_OPERATION_COUNT',
  RequestsWithErrorsCount = 'REQUESTS_WITH_ERRORS_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP',
  UncachedHistogram = 'UNCACHED_HISTOGRAM',
  UncachedRequestsCount = 'UNCACHED_REQUESTS_COUNT'
}

export type QueryStatsDimensions = {
  __typename?: 'QueryStatsDimensions';
  accountId?: Maybe<Scalars['ID']>;
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  fromEngineproxy?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in QueryStats. Fields with dimension names represent equality
 * checks. All fields are implicitly ANDed together.
 */
export type QueryStatsFilter = {
  /**
   * Selects rows whose accountId dimension equals the given value if not null. To
   * query for the null value, use {in: {accountId: [null]}} instead.
   */
  accountId?: Maybe<Scalars['ID']>;
  and?: Maybe<Array<QueryStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose fromEngineproxy dimension equals the given value if not
   * null. To query for the null value, use {in: {fromEngineproxy: [null]}} instead.
   */
  fromEngineproxy?: Maybe<Scalars['String']>;
  in?: Maybe<QueryStatsFilterIn>;
  not?: Maybe<QueryStatsFilter>;
  or?: Maybe<Array<QueryStatsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in QueryStats. Fields match if the corresponding dimension's
 * value is in the given list. All fields are implicitly ANDed together.
 */
export type QueryStatsFilterIn = {
  /**
   * Selects rows whose accountId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  accountId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose fromEngineproxy dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  fromEngineproxy?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  channelIds?: Maybe<Array<Scalars['String']>>;
  comparisonOperator: ComparisonOperator;
  enabled?: Maybe<Scalars['Boolean']>;
  excludedOperationNames?: Maybe<Array<Scalars['String']>>;
  metric: QueryTriggerMetric;
  operationNames?: Maybe<Array<Scalars['String']>>;
  percentile?: Maybe<Scalars['Float']>;
  scope?: Maybe<QueryTriggerScope>;
  threshold: Scalars['Float'];
  variant?: Maybe<Scalars['String']>;
  window: QueryTriggerWindow;
};

export enum QueryTriggerMetric {
  /** Number of requests within the window that resulted in an error. Ignores `percentile`. */
  ErrorCount = 'ERROR_COUNT',
  /** Number of error requests divided by total number of requests. Ignores `percentile`. */
  ErrorPercentage = 'ERROR_PERCENTAGE',
  /** Number of requests within the window. Ignores `percentile`. */
  RequestCount = 'REQUEST_COUNT',
  /** Request latency in ms. Requires `percentile`. */
  RequestServiceTime = 'REQUEST_SERVICE_TIME'
}

export enum QueryTriggerScope {
  All = 'ALL',
  Any = 'ANY',
  Unrecognized = 'UNRECOGNIZED'
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
  FifteenMinutes = 'FIFTEEN_MINUTES',
  FiveMinutes = 'FIVE_MINUTES',
  OneMinute = 'ONE_MINUTE',
  Unrecognized = 'UNRECOGNIZED'
}

export type RegisteredClientIdentityInput = {
  identifier: Scalars['String'];
  name: Scalars['String'];
  version?: Maybe<Scalars['String']>;
};

export type RegisteredOperation = {
  __typename?: 'RegisteredOperation';
  signature: Scalars['ID'];
};

export type RegisteredOperationInput = {
  signature: Scalars['ID'];
  document?: Maybe<Scalars['String']>;
  metadata?: Maybe<RegisteredOperationMetadataInput>;
};

export type RegisteredOperationMetadataInput = {
  /** This will be used to link existing records in Engine to a new ID. */
  engineSignature?: Maybe<Scalars['String']>;
};

export type RegisterOperationsMutationResponse = {
  __typename?: 'RegisterOperationsMutationResponse';
  registrationSuccess: Scalars['Boolean'];
  newOperations?: Maybe<Array<RegisteredOperation>>;
  invalidOperations?: Maybe<Array<InvalidOperation>>;
};

export type RegistryApiKey = {
  __typename?: 'RegistryApiKey';
  keyName?: Maybe<Scalars['String']>;
  token: Scalars['String'];
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

export type ReportSchemaError = ReportSchemaResult & {
  __typename?: 'ReportSchemaError';
  code: ReportSchemaErrorCode;
  inSeconds: Scalars['Int'];
  message: Scalars['String'];
  withCoreSchema: Scalars['Boolean'];
};

export enum ReportSchemaErrorCode {
  BootIdIsNotValidUuid = 'BOOT_ID_IS_NOT_VALID_UUID',
  BootIdIsRequired = 'BOOT_ID_IS_REQUIRED',
  CoreSchemaHashIsNotSchemaSha256 = 'CORE_SCHEMA_HASH_IS_NOT_SCHEMA_SHA256',
  CoreSchemaHashIsRequired = 'CORE_SCHEMA_HASH_IS_REQUIRED',
  CoreSchemaHashIsTooLong = 'CORE_SCHEMA_HASH_IS_TOO_LONG',
  ExecutableSchemaIdIsNotSchemaSha256 = 'EXECUTABLE_SCHEMA_ID_IS_NOT_SCHEMA_SHA256',
  ExecutableSchemaIdIsRequired = 'EXECUTABLE_SCHEMA_ID_IS_REQUIRED',
  ExecutableSchemaIdIsTooLong = 'EXECUTABLE_SCHEMA_ID_IS_TOO_LONG',
  GraphRefInvalidFormat = 'GRAPH_REF_INVALID_FORMAT',
  GraphRefIsRequired = 'GRAPH_REF_IS_REQUIRED',
  GraphVariantDoesNotMatchRegex = 'GRAPH_VARIANT_DOES_NOT_MATCH_REGEX',
  GraphVariantIsRequired = 'GRAPH_VARIANT_IS_REQUIRED',
  LibraryVersionIsTooLong = 'LIBRARY_VERSION_IS_TOO_LONG',
  PlatformIsTooLong = 'PLATFORM_IS_TOO_LONG',
  RuntimeVersionIsTooLong = 'RUNTIME_VERSION_IS_TOO_LONG',
  SchemaIsNotParsable = 'SCHEMA_IS_NOT_PARSABLE',
  SchemaIsNotValid = 'SCHEMA_IS_NOT_VALID',
  ServerIdIsTooLong = 'SERVER_ID_IS_TOO_LONG',
  UserVersionIsTooLong = 'USER_VERSION_IS_TOO_LONG'
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

export enum Resolution {
  R15M = 'R15M',
  R1D = 'R1D',
  R1H = 'R1H',
  R1M = 'R1M',
  R5M = 'R5M',
  R6H = 'R6H'
}

export enum ResponseHints {
  None = 'NONE',
  SampleResponses = 'SAMPLE_RESPONSES',
  Subgraphs = 'SUBGRAPHS',
  Timings = 'TIMINGS',
  TraceTimings = 'TRACE_TIMINGS'
}

export type RoleOverride = {
  __typename?: 'RoleOverride';
  graph: Service;
  lastUpdatedAt: Scalars['Timestamp'];
  role: UserPermission;
  user: User;
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

export type Schema = {
  __typename?: 'Schema';
  hash: Scalars['ID'];
  createdAt: Scalars['Timestamp'];
  introspection: IntrospectionSchema;
  gitContext?: Maybe<GitContext>;
  /** The number of fields; this includes user defined fields only, excluding built-in types and fields */
  fieldCount: Scalars['Int'];
  /** The number of types; this includes user defined types only, excluding built-in types */
  typeCount: Scalars['Int'];
  document: Scalars['GraphQLDocument'];
  createTemporaryURL?: Maybe<TemporaryUrl>;
};


export type SchemaCreateTemporaryUrlArgs = {
  expiresInSeconds?: Scalars['Int'];
};

export type SchemaCheck = {
  __typename?: 'SchemaCheck';
  id: Scalars['ID'];
  checkedSchema: Schema;
  diff: SchemaDiff;
  gitContext?: Maybe<GitContext>;
  checkedAt: Scalars['Timestamp'];
  compositionResult?: Maybe<CompositionResult>;
  /** Checks created by re-running this check, most recent first. */
  reruns?: Maybe<Array<SchemaCheck>>;
  /** If this check was created by re-running, which check re-ran. */
  rerunOf?: Maybe<SchemaCheck>;
  /** Other checks that have run against the same branch / implementing service, most recent first. */
  relatedChecks?: Maybe<Array<SchemaCheck>>;
};


export type SchemaCheckRerunsArgs = {
  limit?: Scalars['Int'];
};


export type SchemaCheckRelatedChecksArgs = {
  limit?: Scalars['Int'];
};

export type SchemaCheckMutation = {
  __typename?: 'SchemaCheckMutation';
  /** Re-run a check using the current configuration. A new check is created and returned. */
  rerun?: Maybe<SchemaCheckRerunResult>;
};

export type SchemaCheckRerunResult = {
  __typename?: 'SchemaCheckRerunResult';
  /** Schema check that was rerun. */
  source?: Maybe<SchemaCheck>;
  /** Schema check created by re-running. */
  result?: Maybe<SchemaCheck>;
};

/** Represents an error from running schema composition on a list of service definitions. */
export type SchemaCompositionError = {
  __typename?: 'SchemaCompositionError';
  message: Scalars['String'];
  locations: Array<Maybe<SourceLocation>>;
  code?: Maybe<Scalars['String']>;
};

export type SchemaDiff = {
  __typename?: 'SchemaDiff';
  /** @deprecated use severity instead */
  type: ChangeType;
  /** Indication of the success of the change, either failure, warning, or notice. */
  severity: ChangeSeverity;
  /** List of schema changes with associated affected clients and operations */
  changes: Array<Change>;
  /** Summary/counts for all changes in diff */
  changeSummary: ChangeSummary;
  /** Operations affected by all changes in diff */
  affectedQueries?: Maybe<Array<AffectedQuery>>;
  /**
   * Clients affected by all changes in diff
   * @deprecated Unsupported.
   */
  affectedClients?: Maybe<Array<AffectedClient>>;
  /** Number of operations that were validated during schema diff */
  numberOfCheckedOperations?: Maybe<Scalars['Int']>;
  /** Configuration of validation */
  validationConfig?: Maybe<SchemaDiffValidationConfig>;
  /** The tag against which this diff was created */
  tag?: Maybe<Scalars['String']>;
};

export type SchemaDiffValidationConfig = {
  __typename?: 'SchemaDiffValidationConfig';
  /**
   * delta in seconds from current time that determines the start of the window
   * for reported metrics included in a schema diff. A day window from the present
   * day would have a `from` value of -86400. In rare cases, this could be an ISO
   * timestamp if the user passed one in on diff creation
   */
  from?: Maybe<Scalars['Timestamp']>;
  /**
   * delta in seconds from current time that determines the end of the
   * window for reported metrics included in a schema diff. A day window
   * from the present day would have a `to` value of -0. In rare
   * cases, this could be an ISO timestamp if the user passed one in on diff
   * creation
   */
  to?: Maybe<Scalars['Timestamp']>;
  /** Minimum number of requests within the window for a query to be considered. */
  queryCountThreshold?: Maybe<Scalars['Int']>;
  /**
   * Number of requests within the window for a query to be considered, relative to
   * total request count. Expected values are between 0 and 0.05 (minimum 5% of
   * total request volume)
   */
  queryCountThresholdPercentage?: Maybe<Scalars['Float']>;
  /** Clients to ignore during validation. */
  excludedClients?: Maybe<Array<ClientInfoFilterOutput>>;
  /** Operation IDs to ignore during validation. */
  ignoredOperations?: Maybe<Array<Scalars['ID']>>;
  /** Variants to include during validation. */
  includedVariants?: Maybe<Array<Scalars['String']>>;
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
  /**
   * The hex SHA256 hash of the schema being reported. Note that for a GraphQL
   * server with a core schema, this should be the core schema, not the API schema.
   */
  coreSchemaHash: Scalars['String'];
  /** The graph ref (eg, 'id@variant') */
  graphRef: Scalars['String'];
  /**
   * The version of the edge server reporting agent, e.g. apollo-server-2.8,
   * graphql-java-3.1, etc. length must be <= 256 characters.
   */
  libraryVersion?: Maybe<Scalars['String']>;
  /**
   * The infra environment in which this edge server is running, e.g. localhost,
   * Kubernetes, AWS Lambda, Google CloudRun, AWS ECS, etc. length must be <= 256 characters.
   */
  platform?: Maybe<Scalars['String']>;
  /**
   * The runtime in which the edge server is running, e.g. node 12.03,
   * zulu8.46.0.19-ca-jdk8.0.252-macosx_x64, etc. length must be <= 256 characters.
   */
  runtimeVersion?: Maybe<Scalars['String']>;
  /**
   * If available, an identifier for the edge server instance, such that when
   * restarting this instance it will have the same serverId, with a different
   * bootId. For example, in Kubernetes this might be the pod name. Length must be
   * <= 256 characters.
   */
  serverId?: Maybe<Scalars['String']>;
  /**
   * An identifier used to distinguish the version (from the user's perspective) of
   * the edge server's code itself. For instance, the git sha of the server's
   * repository or the docker sha of the associated image this server runs with.
   * Length must be <= 256 characters.
   */
  userVersion?: Maybe<Scalars['String']>;
};

export type SchemaTag = {
  __typename?: 'SchemaTag';
  /**
   * The identifier for this particular schema tag, which may be either a particular
   * run of a check or a specific publish. This ID can be used alongside `schemaTagByID`
   * in order to look up a particular entry.
   */
  id: Scalars['ID'];
  /** The graph variant this schema tag belongs to. */
  variant: GraphVariant;
  /** @deprecated Please use variant { name } instead */
  tag: Scalars['String'];
  schema: Schema;
  /** The composition result that corresponds to this schema repo tag, if it exists. */
  compositionResult?: Maybe<CompositionResult>;
  /**
   * Indicates the schemaTag of the schema's original upload, null if this is the
   * first upload of the schema.
   */
  reversionFrom?: Maybe<SchemaTag>;
  createdAt: Scalars['Timestamp'];
  /**
   * Indicates this schema is "published" meaning that our users correspond this schema
   * with a long-running or permanent initiative. Published schemas appear in the UI
   * when exploring a service's schemas, and typically refer to either active environments
   * with metrics (e.g. "staging") or git branches that are constantly used as a base
   * (e.g. "main"). If this field is not found, the schema is "private" to Engine
   * and is uploaded but not promoted to published yet. The other benefit is this makes
   * for nice UX around publishing events
   */
  publishedAt: Scalars['Timestamp'];
  /**
   * The Identity that published this schema and their client info, or null if this isn't
   * a publish. Sub-fields may be null if they weren't recorded.
   */
  publishedBy?: Maybe<IdentityAndClientInfo>;
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
  diffToPrevious?: Maybe<SchemaDiff>;
  gitContext?: Maybe<GitContext>;
  slackNotificationBody?: Maybe<Scalars['String']>;
  webhookNotificationBody: Scalars['String'];
};


export type SchemaTagHistoryArgs = {
  limit?: Scalars['Int'];
  offset?: Maybe<Scalars['Int']>;
};


export type SchemaTagSlackNotificationBodyArgs = {
  graphDisplayName: Scalars['String'];
};

/** How many seats of the given types does an organization have (regardless of plan type)? */
export type Seats = {
  __typename?: 'Seats';
  /** How many members that are free in this organization. */
  free: Scalars['Int'];
  /** How many members that are not free in this organization. */
  fullPrice: Scalars['Int'];
};

export type SemanticChange = {
  __typename?: 'SemanticChange';
  /** Semantic metadata about the type of change */
  definition: ChangeDefinition;
  /** Top level node affected by the change */
  parentNode?: Maybe<NamedIntrospectionType>;
  /**
   * Node related to the top level node that was changed, such as a field in an object,
   * a value in an enum or the object of an interface
   */
  childNode?: Maybe<NamedIntrospectionValue>;
  /** Target arg of change made. */
  argNode?: Maybe<NamedIntrospectionArg>;
};

export type Service = Identity & {
  __typename?: 'Service';
  account?: Maybe<Account>;
  accountId?: Maybe<Scalars['ID']>;
  apiKeys?: Maybe<Array<GraphApiKey>>;
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
  createdAt: Scalars['Timestamp'];
  createdBy?: Maybe<Identity>;
  datadogMetricsConfig?: Maybe<DatadogMetricsConfig>;
  deletedAt?: Maybe<Scalars['Timestamp']>;
  description?: Maybe<Scalars['String']>;
  devGraphOwner?: Maybe<User>;
  firstReportedAt?: Maybe<Scalars['Timestamp']>;
  /**
   * When this is true, this graph will be hidden from non-admin members of the org who haven't been explicitly assigned a
   * role on this graph.
   */
  hiddenFromUninvitedNonAdminAccountMembers: Scalars['Boolean'];
  id: Scalars['ID'];
  lastReportedAt?: Maybe<Scalars['Timestamp']>;
  /** Current identity, null if not authenticated. */
  me?: Maybe<Identity>;
  /** @deprecated Use Service.title */
  name: Scalars['String'];
  /** Get query triggers for a given variant. If variant is null all the triggers for this service will be gotten. */
  queryTriggers?: Maybe<Array<QueryTrigger>>;
  /**
   * Whether registry subscriptions (with any options) are enabled. If variant is
   * not passed, returns true if configuration is present for any variant
   * @deprecated This field will be removed
   */
  registrySubscriptionsEnabled: Scalars['Boolean'];
  reportingEnabled: Scalars['Boolean'];
  /** The list of members that can access this graph, accounting for graph role overrides */
  roleOverrides?: Maybe<Array<RoleOverride>>;
  /** Which permissions the current user has for interacting with this service */
  roles?: Maybe<ServiceRoles>;
  scheduledSummaries: Array<ScheduledSummary>;
  /** @deprecated use Service.statsWindow instead */
  stats: ServiceStatsWindow;
  statsWindow?: Maybe<ServiceStatsWindow>;
  subgraphFeaturesEnabled: Scalars['Boolean'];
  title: Scalars['String'];
  trace?: Maybe<Trace>;
  traceStorageEnabled: Scalars['Boolean'];
  /**
   * A particular variant (sometimes called "tag") of the graph, often representing
   * a live traffic environment (such as "prod"). Each variant can represent a
   * specific URL or destination to query at, analytics, and its own schema history.
   */
  variant?: Maybe<GraphVariant>;
  /** The list of variants that exist for this graph */
  variants: Array<GraphVariant>;
  operation?: Maybe<Operation>;
  /** Get a schema by hash OR current tag */
  schema?: Maybe<Schema>;
  /**
   * Get schema tags, with optional filtering to a set of tags. Always sorted by creation
   * date in reverse chronological order.
   */
  schemaTags?: Maybe<Array<SchemaTag>>;
  /** Get the schema tag */
  schemaTag?: Maybe<SchemaTag>;
  schemaTagById?: Maybe<SchemaTag>;
  /**
   * List of implementing services that comprise a graph. A non-federated graph should have a single implementing service.
   * Set includeDeleted to see deleted implementing services.
   */
  implementingServices?: Maybe<GraphImplementors>;
  /**
   * This returns the composition result that was most recently published to the graph.
   * Only identities that canQuerySchemas and canQueryImplementingServices have access
   * to this field
   */
  mostRecentCompositionPublish?: Maybe<CompositionPublishResult>;
  /** Given a graphCompositionID, return the results of composition. This can represent either a validation or a publish. */
  compositionResultById?: Maybe<CompositionResult>;
  /** Get check configuration for this graph. */
  checkConfiguration?: Maybe<CheckConfiguration>;
  /** Gets the operations and their approved changes for this graph, checkID, and operationID. */
  operationsAcceptedChanges: Array<OperationAcceptedChange>;
  /** Get a single schema check by its ID */
  check?: Maybe<SchemaCheck>;
  /** Get a check workflow for this graph by its ID */
  checkWorkflow?: Maybe<CheckWorkflow>;
  /** Get check workflows for this graph ordered by creation time, most recent first. */
  checkWorkflows: Array<CheckWorkflow>;
  /** Get an operations check result for a specific check ID */
  operationsCheck?: Maybe<OperationsCheckResult>;
  /** Generate a test schema publish notification body */
  testSchemaPublishBody: Scalars['String'];
  /**
   * List of options available for filtering checks for this graph by author.
   * If a filter is passed, constrains results to match the filter.
   */
  checksAuthorOptions: Array<Scalars['String']>;
  /**
   * List of options available for filtering checks for this graph by branch.
   * If a filter is passed, constrains results to match the filter.
   */
  checksBranchOptions: Array<Scalars['String']>;
  /**
   * List of options available for filtering checks for this graph by subgraph name.
   * If a filter is passed, constrains results to match the filter.
   */
  checksSubgraphOptions: Array<Scalars['String']>;
};


export type ServiceAvatarUrlArgs = {
  size?: Scalars['Int'];
};


export type ServiceChannelsArgs = {
  channelIds?: Maybe<Array<Scalars['ID']>>;
};


export type ServiceLastReportedAtArgs = {
  graphVariant?: Maybe<Scalars['String']>;
};


export type ServiceQueryTriggersArgs = {
  graphVariant?: Maybe<Scalars['String']>;
  operationNames?: Maybe<Array<Scalars['String']>>;
};


export type ServiceRegistrySubscriptionsEnabledArgs = {
  graphVariant?: Maybe<Scalars['String']>;
};


export type ServiceStatsArgs = {
  from: Scalars['Timestamp'];
  resolution?: Maybe<Resolution>;
  to?: Maybe<Scalars['Timestamp']>;
};


export type ServiceStatsWindowArgs = {
  from: Scalars['Timestamp'];
  resolution?: Maybe<Resolution>;
  to?: Maybe<Scalars['Timestamp']>;
};


export type ServiceTraceArgs = {
  id: Scalars['ID'];
};


export type ServiceVariantArgs = {
  name: Scalars['String'];
};


export type ServiceOperationArgs = {
  id: Scalars['ID'];
};


export type ServiceSchemaArgs = {
  hash?: Maybe<Scalars['ID']>;
  tag?: Maybe<Scalars['String']>;
};


export type ServiceSchemaTagsArgs = {
  tags?: Maybe<Array<Scalars['String']>>;
};


export type ServiceSchemaTagArgs = {
  tag: Scalars['String'];
};


export type ServiceSchemaTagByIdArgs = {
  id: Scalars['ID'];
};


export type ServiceImplementingServicesArgs = {
  graphVariant: Scalars['String'];
  includeDeleted?: Maybe<Scalars['Boolean']>;
};


export type ServiceMostRecentCompositionPublishArgs = {
  graphVariant: Scalars['String'];
};


export type ServiceCompositionResultByIdArgs = {
  id: Scalars['ID'];
};


export type ServiceOperationsAcceptedChangesArgs = {
  checkID: Scalars['ID'];
  operationID: Scalars['String'];
};


export type ServiceCheckArgs = {
  id: Scalars['ID'];
};


export type ServiceCheckWorkflowArgs = {
  id: Scalars['ID'];
};


export type ServiceCheckWorkflowsArgs = {
  limit?: Scalars['Int'];
  filter?: Maybe<CheckFilterInput>;
};


export type ServiceOperationsCheckArgs = {
  checkID: Scalars['ID'];
};


export type ServiceTestSchemaPublishBodyArgs = {
  variant: Scalars['String'];
};


export type ServiceChecksAuthorOptionsArgs = {
  filter?: Maybe<CheckFilterInput>;
};


export type ServiceChecksBranchOptionsArgs = {
  filter?: Maybe<CheckFilterInput>;
};


export type ServiceChecksSubgraphOptionsArgs = {
  filter?: Maybe<CheckFilterInput>;
};

/** Columns of ServiceEdgeServerInfos. */
export enum ServiceEdgeServerInfosColumn {
  BootId = 'BOOT_ID',
  ExecutableSchemaId = 'EXECUTABLE_SCHEMA_ID',
  LibraryVersion = 'LIBRARY_VERSION',
  Platform = 'PLATFORM',
  RuntimeVersion = 'RUNTIME_VERSION',
  SchemaTag = 'SCHEMA_TAG',
  ServerId = 'SERVER_ID',
  Timestamp = 'TIMESTAMP',
  UserVersion = 'USER_VERSION'
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

/**
 * Filter for data in ServiceEdgeServerInfos. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type ServiceEdgeServerInfosFilter = {
  and?: Maybe<Array<ServiceEdgeServerInfosFilter>>;
  /**
   * Selects rows whose bootId dimension equals the given value if not null. To
   * query for the null value, use {in: {bootId: [null]}} instead.
   */
  bootId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose executableSchemaId dimension equals the given value if not
   * null. To query for the null value, use {in: {executableSchemaId: [null]}} instead.
   */
  executableSchemaId?: Maybe<Scalars['ID']>;
  in?: Maybe<ServiceEdgeServerInfosFilterIn>;
  /**
   * Selects rows whose libraryVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {libraryVersion: [null]}} instead.
   */
  libraryVersion?: Maybe<Scalars['String']>;
  not?: Maybe<ServiceEdgeServerInfosFilter>;
  or?: Maybe<Array<ServiceEdgeServerInfosFilter>>;
  /**
   * Selects rows whose platform dimension equals the given value if not null. To
   * query for the null value, use {in: {platform: [null]}} instead.
   */
  platform?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose runtimeVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {runtimeVersion: [null]}} instead.
   */
  runtimeVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serverId dimension equals the given value if not null. To
   * query for the null value, use {in: {serverId: [null]}} instead.
   */
  serverId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose userVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {userVersion: [null]}} instead.
   */
  userVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ServiceEdgeServerInfos. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type ServiceEdgeServerInfosFilterIn = {
  /**
   * Selects rows whose bootId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  bootId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose executableSchemaId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  executableSchemaId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose libraryVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  libraryVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose platform dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  platform?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose runtimeVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  runtimeVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serverId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serverId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose userVersion dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  userVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
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

/** Columns of ServiceEnumStats. */
export enum ServiceEnumStatsColumn {
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  EnumType = 'ENUM_TYPE',
  EnumValue = 'ENUM_VALUE',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestCount = 'REQUEST_COUNT',
  ResponseCount = 'RESPONSE_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type ServiceEnumStatsDimensions = {
  __typename?: 'ServiceEnumStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  enumType?: Maybe<Scalars['String']>;
  enumValue?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ServiceEnumStats. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type ServiceEnumStatsFilter = {
  and?: Maybe<Array<ServiceEnumStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose enumType dimension equals the given value if not null. To
   * query for the null value, use {in: {enumType: [null]}} instead.
   */
  enumType?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose enumValue dimension equals the given value if not null. To
   * query for the null value, use {in: {enumValue: [null]}} instead.
   */
  enumValue?: Maybe<Scalars['String']>;
  in?: Maybe<ServiceEnumStatsFilterIn>;
  not?: Maybe<ServiceEnumStatsFilter>;
  or?: Maybe<Array<ServiceEnumStatsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ServiceEnumStats. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type ServiceEnumStatsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose enumType dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  enumType?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose enumValue dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  enumValue?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ServiceEnumStatsMetrics = {
  __typename?: 'ServiceEnumStatsMetrics';
  requestCount: Scalars['Long'];
  responseCount: Scalars['Long'];
};

export type ServiceEnumStatsOrderBySpec = {
  column: ServiceEnumStatsColumn;
  direction: Ordering;
};

export type ServiceEnumStatsRecord = {
  __typename?: 'ServiceEnumStatsRecord';
  /** Dimensions of ServiceEnumStats that can be grouped by. */
  groupBy: ServiceEnumStatsDimensions;
  /** Metrics of ServiceEnumStats that can be aggregated over. */
  metrics: ServiceEnumStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of ServiceErrorStats. */
export enum ServiceErrorStatsColumn {
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  ErrorsCount = 'ERRORS_COUNT',
  Path = 'PATH',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestsWithErrorsCount = 'REQUESTS_WITH_ERRORS_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type ServiceErrorStatsDimensions = {
  __typename?: 'ServiceErrorStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ServiceErrorStats. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type ServiceErrorStatsFilter = {
  and?: Maybe<Array<ServiceErrorStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  in?: Maybe<ServiceErrorStatsFilterIn>;
  not?: Maybe<ServiceErrorStatsFilter>;
  or?: Maybe<Array<ServiceErrorStatsFilter>>;
  /**
   * Selects rows whose path dimension equals the given value if not null. To query
   * for the null value, use {in: {path: [null]}} instead.
   */
  path?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ServiceErrorStats. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type ServiceErrorStatsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
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

/** Columns of ServiceFieldStats. */
export enum ServiceFieldStatsColumn {
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  ErrorsCount = 'ERRORS_COUNT',
  Field = 'FIELD',
  FieldHistogram = 'FIELD_HISTOGRAM',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestCount = 'REQUEST_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type ServiceFieldStatsDimensions = {
  __typename?: 'ServiceFieldStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  field?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ServiceFieldStats. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type ServiceFieldStatsFilter = {
  and?: Maybe<Array<ServiceFieldStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose field dimension equals the given value if not null. To
   * query for the null value, use {in: {field: [null]}} instead.
   */
  field?: Maybe<Scalars['String']>;
  in?: Maybe<ServiceFieldStatsFilterIn>;
  not?: Maybe<ServiceFieldStatsFilter>;
  or?: Maybe<Array<ServiceFieldStatsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ServiceFieldStats. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type ServiceFieldStatsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose field dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  field?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ServiceFieldStatsMetrics = {
  __typename?: 'ServiceFieldStatsMetrics';
  errorsCount: Scalars['Long'];
  fieldHistogram: DurationHistogram;
  requestCount: Scalars['Long'];
};

export type ServiceFieldStatsOrderBySpec = {
  column: ServiceFieldStatsColumn;
  direction: Ordering;
};

export type ServiceFieldStatsRecord = {
  __typename?: 'ServiceFieldStatsRecord';
  /** Dimensions of ServiceFieldStats that can be grouped by. */
  groupBy: ServiceFieldStatsDimensions;
  /** Metrics of ServiceFieldStats that can be aggregated over. */
  metrics: ServiceFieldStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

/** Columns of ServiceInputStats. */
export enum ServiceInputStatsColumn {
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  FieldName = 'FIELD_NAME',
  FieldType = 'FIELD_TYPE',
  ParentType = 'PARENT_TYPE',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RequestCount = 'REQUEST_COUNT',
  RequestCountNull = 'REQUEST_COUNT_NULL',
  RequestCountUndefined = 'REQUEST_COUNT_UNDEFINED',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP'
}

export type ServiceInputStatsDimensions = {
  __typename?: 'ServiceInputStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  fieldName?: Maybe<Scalars['String']>;
  fieldType?: Maybe<Scalars['String']>;
  parentType?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ServiceInputStats. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type ServiceInputStatsFilter = {
  and?: Maybe<Array<ServiceInputStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose fieldName dimension equals the given value if not null. To
   * query for the null value, use {in: {fieldName: [null]}} instead.
   */
  fieldName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose fieldType dimension equals the given value if not null. To
   * query for the null value, use {in: {fieldType: [null]}} instead.
   */
  fieldType?: Maybe<Scalars['String']>;
  in?: Maybe<ServiceInputStatsFilterIn>;
  not?: Maybe<ServiceInputStatsFilter>;
  or?: Maybe<Array<ServiceInputStatsFilter>>;
  /**
   * Selects rows whose parentType dimension equals the given value if not null. To
   * query for the null value, use {in: {parentType: [null]}} instead.
   */
  parentType?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ServiceInputStats. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type ServiceInputStatsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose fieldName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  fieldName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose fieldType dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  fieldType?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose parentType dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  parentType?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ServiceInputStatsMetrics = {
  __typename?: 'ServiceInputStatsMetrics';
  requestCount: Scalars['Long'];
  requestCountNull: Scalars['Long'];
  requestCountUndefined: Scalars['Long'];
};

export type ServiceInputStatsOrderBySpec = {
  column: ServiceInputStatsColumn;
  direction: Ordering;
};

export type ServiceInputStatsRecord = {
  __typename?: 'ServiceInputStatsRecord';
  /** Dimensions of ServiceInputStats that can be grouped by. */
  groupBy: ServiceInputStatsDimensions;
  /** Metrics of ServiceInputStats that can be aggregated over. */
  metrics: ServiceInputStatsMetrics;
  /** Starting segment timestamp. */
  timestamp: Scalars['Timestamp'];
};

export type ServiceMutation = {
  __typename?: 'ServiceMutation';
  createCompositionStatusSubscription: SchemaPublishSubscription;
  createSchemaPublishSubscription: SchemaPublishSubscription;
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
  /**
   * Given a UTC timestamp, delete all traces associated with this Service, on that
   * corresponding day. If a timestamp to is provided, deletes all days inclusive.
   */
  deleteTraces?: Maybe<Scalars['Void']>;
  disableDatadogForwardingLegacyMetricNames?: Maybe<Service>;
  /** Hard delete a graph and all data associated with it. Its ID cannot be reused. */
  hardDelete?: Maybe<Scalars['Void']>;
  /** @deprecated Use service.id */
  id: Scalars['ID'];
  newKey: GraphApiKey;
  /** Adds an override to the given users permission for this graph */
  overrideUserPermission?: Maybe<Service>;
  removeKey?: Maybe<Scalars['Void']>;
  renameKey?: Maybe<GraphApiKey>;
  /** @deprecated use Mutation.reportSchema instead */
  reportServerInfo?: Maybe<ReportServerInfoResult>;
  service: Service;
  /** Test Slack notification channel */
  testSlackChannel?: Maybe<Scalars['Void']>;
  testSubscriptionForChannel: Scalars['String'];
  transfer?: Maybe<Service>;
  undelete?: Maybe<Service>;
  updateDatadogMetricsConfig?: Maybe<DatadogMetricsConfig>;
  updateDescription?: Maybe<Service>;
  /** Update hiddenFromUninvitedNonAdminAccountMembers */
  updateHiddenFromUninvitedNonAdminAccountMembers?: Maybe<Service>;
  updateSubgraphFeaturesEnabled?: Maybe<Service>;
  updateTitle?: Maybe<Service>;
  upsertChannel?: Maybe<Channel>;
  /** Create/update PagerDuty notification channel */
  upsertPagerDutyChannel?: Maybe<PagerDutyChannel>;
  upsertQueryTrigger?: Maybe<QueryTrigger>;
  /** Create or update a subscription for a service. */
  upsertRegistrySubscription: RegistrySubscription;
  upsertScheduledSummary?: Maybe<ScheduledSummary>;
  /** Create/update Slack notification channel */
  upsertSlackChannel?: Maybe<SlackChannel>;
  upsertWebhookChannel?: Maybe<WebhookChannel>;
  /**
   * Create a new API key and also write the storage secret for that API key.
   * The storage secret allows users to fetch files from GCS like operation manifests and composition artifacts for federation.
   * Storage secrets need to be accessible via a service's API key, so we need to
   * couple the creation of these files with API key creation
   * @deprecated use newKey instead
   */
  createApiKeyAndWriteStorageSecret?: Maybe<RegistryApiKey>;
  /** Make changes to a graph variant. */
  variant?: Maybe<GraphVariantMutation>;
  validateOperations: ValidateOperationsResult;
  registerOperationsWithResponse?: Maybe<RegisterOperationsMutationResponse>;
  uploadSchema?: Maybe<UploadSchemaMutationResponse>;
  /**
   * Store a given schema document. This schema will be attached to the graph but
   * not be associated with any variant. On success, returns the schema hash.
   */
  storeSchemaDocument: StoreSchemaResponseOrError;
  /** Promote the schema with the given SHA-256 hash to active for the given variant/tag. */
  promoteSchema: PromoteSchemaResponseOrError;
  /**
   * Checks a proposed schema against the schema that has been published to
   * a particular tag, using metrics that have been published to the base tag.
   * Callers can set the historicParameters directly, which will be used if
   * provided. If useMaximumRetention is provided, but historicParameters is not,
   * then validation will use the maximum retention the graph has access to.
   * If neither historicParameters nor useMaximumRetention is provided, the
   * default time range of one week (7 days) will be used.
   */
  checkSchema: CheckSchemaResult;
  /** Make changes to a schema check. */
  check?: Maybe<SchemaCheckMutation>;
  /** Make changes to a check workflow. */
  checkWorkflow?: Maybe<CheckWorkflowMutation>;
  deleteSchemaTag: DeleteSchemaTagResult;
  upsertImplementingServiceAndTriggerComposition: CompositionAndUpsertResult;
  /**
   * This mutation will not result in any changes to the implementing service
   * Run composition with the Implementing Service's partial schema replaced with the one provided
   * in the mutation's input. Store the composed schema, return the hash of the composed schema,
   * and any warnings and errors pertaining to composition.
   * This mutation will not run validation against operations.
   */
  validatePartialSchemaOfImplementingServiceAgainstGraph: CompositionValidationResult;
  removeImplementingServiceAndTriggerComposition: CompositionAndRemoveResult;
  /**
   * Compose an implementing service's partial schema, diff the composed schema, validate traffic against that schema,
   * and store the result so the details can be viewed by users in the UI.
   * This mutation will not mark the schema as "published".
   */
  checkPartialSchema: CheckPartialSchemaResult;
  /** Update schema check configuration for a graph. */
  updateCheckConfiguration: CheckConfiguration;
  /**
   * Mark the changeset that affects an operation in a given check instance as safe.
   * Note that only operations marked as behavior changes are allowed to be marked as safe.
   */
  markChangesForOperationAsSafe: MarkChangesForOperationAsSafeResult;
  /** Unmark changes for an operation as safe. */
  unmarkChangesForOperationAsSafe: MarkChangesForOperationAsSafeResult;
  /**
   * Ignore an operation in future checks;
   * changes affecting it will be tracked,
   * but won't affect the outcome of the check.
   * Returns true if the operation is newly ignored,
   * false if it already was.
   */
  ignoreOperationsInChecks?: Maybe<IgnoreOperationsInChecksResult>;
  /**
   * Revert the effects of ignoreOperation.
   * Returns true if the operation is no longer ignored,
   * false if it wasn't.
   */
  unignoreOperationsInChecks?: Maybe<UnignoreOperationsInChecksResult>;
};


export type ServiceMutationCreateCompositionStatusSubscriptionArgs = {
  channelID: Scalars['ID'];
  variant: Scalars['String'];
};


export type ServiceMutationCreateSchemaPublishSubscriptionArgs = {
  channelID: Scalars['ID'];
  variant: Scalars['String'];
};


export type ServiceMutationDeleteChannelArgs = {
  id: Scalars['ID'];
};


export type ServiceMutationDeleteQueryTriggerArgs = {
  id: Scalars['ID'];
};


export type ServiceMutationDeleteRegistrySubscriptionArgs = {
  id: Scalars['ID'];
};


export type ServiceMutationDeleteRegistrySubscriptionsArgs = {
  variant: Scalars['String'];
};


export type ServiceMutationDeleteScheduledSummaryArgs = {
  id: Scalars['ID'];
};


export type ServiceMutationDeleteTracesArgs = {
  from: Scalars['Timestamp'];
  to?: Maybe<Scalars['Timestamp']>;
};


export type ServiceMutationNewKeyArgs = {
  keyName?: Maybe<Scalars['String']>;
  role?: UserPermission;
};


export type ServiceMutationOverrideUserPermissionArgs = {
  permission?: Maybe<UserPermission>;
  userID: Scalars['ID'];
};


export type ServiceMutationRemoveKeyArgs = {
  key?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};


export type ServiceMutationRenameKeyArgs = {
  key?: Maybe<Scalars['String']>;
  newKeyName?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};


export type ServiceMutationReportServerInfoArgs = {
  executableSchema?: Maybe<Scalars['String']>;
  info: EdgeServerInfo;
};


export type ServiceMutationTestSlackChannelArgs = {
  id: Scalars['ID'];
  notification: SlackNotificationInput;
};


export type ServiceMutationTestSubscriptionForChannelArgs = {
  channelID: Scalars['ID'];
  subscriptionID: Scalars['ID'];
};


export type ServiceMutationTransferArgs = {
  to: Scalars['String'];
};


export type ServiceMutationUpdateDatadogMetricsConfigArgs = {
  apiKey?: Maybe<Scalars['String']>;
  apiRegion?: Maybe<DatadogApiRegion>;
  enabled?: Maybe<Scalars['Boolean']>;
};


export type ServiceMutationUpdateDescriptionArgs = {
  description: Scalars['String'];
};


export type ServiceMutationUpdateHiddenFromUninvitedNonAdminAccountMembersArgs = {
  hiddenFromUninvitedNonAdminAccountMembers: Scalars['Boolean'];
};


export type ServiceMutationUpdateSubgraphFeaturesEnabledArgs = {
  subgraphFeaturesEnabled: Scalars['Boolean'];
};


export type ServiceMutationUpdateTitleArgs = {
  title: Scalars['String'];
};


export type ServiceMutationUpsertChannelArgs = {
  id?: Maybe<Scalars['ID']>;
  pagerDutyChannel?: Maybe<PagerDutyChannelInput>;
  slackChannel?: Maybe<SlackChannelInput>;
  webhookChannel?: Maybe<WebhookChannelInput>;
};


export type ServiceMutationUpsertPagerDutyChannelArgs = {
  channel: PagerDutyChannelInput;
  id?: Maybe<Scalars['ID']>;
};


export type ServiceMutationUpsertQueryTriggerArgs = {
  id?: Maybe<Scalars['ID']>;
  trigger: QueryTriggerInput;
};


export type ServiceMutationUpsertRegistrySubscriptionArgs = {
  channelID?: Maybe<Scalars['ID']>;
  id?: Maybe<Scalars['ID']>;
  options?: Maybe<SubscriptionOptionsInput>;
  variant?: Maybe<Scalars['String']>;
};


export type ServiceMutationUpsertScheduledSummaryArgs = {
  channelID?: Maybe<Scalars['ID']>;
  enabled?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['ID']>;
  tag?: Maybe<Scalars['String']>;
  timezone?: Maybe<Scalars['String']>;
  variant?: Maybe<Scalars['String']>;
};


export type ServiceMutationUpsertSlackChannelArgs = {
  channel: SlackChannelInput;
  id?: Maybe<Scalars['ID']>;
};


export type ServiceMutationUpsertWebhookChannelArgs = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  secretToken?: Maybe<Scalars['String']>;
  url: Scalars['String'];
};


export type ServiceMutationCreateApiKeyAndWriteStorageSecretArgs = {
  keyName?: Maybe<Scalars['String']>;
};


export type ServiceMutationVariantArgs = {
  name: Scalars['String'];
};


export type ServiceMutationValidateOperationsArgs = {
  operations: Array<OperationDocumentInput>;
  tag?: Maybe<Scalars['String']>;
  gitContext?: Maybe<GitContextInput>;
};


export type ServiceMutationRegisterOperationsWithResponseArgs = {
  clientIdentity?: Maybe<RegisteredClientIdentityInput>;
  gitContext?: Maybe<GitContextInput>;
  operations: Array<RegisteredOperationInput>;
  manifestVersion?: Maybe<Scalars['Int']>;
  graphVariant?: Scalars['String'];
};


export type ServiceMutationUploadSchemaArgs = {
  schema?: Maybe<IntrospectionSchemaInput>;
  tag: Scalars['String'];
  gitContext?: Maybe<GitContextInput>;
  historicParameters?: Maybe<HistoricQueryParameters>;
  overrideComposedSchema?: Scalars['Boolean'];
  schemaDocument?: Maybe<Scalars['String']>;
  errorOnBadRequest?: Scalars['Boolean'];
};


export type ServiceMutationStoreSchemaDocumentArgs = {
  schemaDocument: Scalars['String'];
};


export type ServiceMutationPromoteSchemaArgs = {
  sha256: Scalars['SHA256'];
  graphVariant: Scalars['String'];
  historicParameters?: Maybe<HistoricQueryParameters>;
  overrideComposedSchema?: Scalars['Boolean'];
};


export type ServiceMutationCheckSchemaArgs = {
  proposedSchema?: Maybe<IntrospectionSchemaInput>;
  proposedSchemaDocument?: Maybe<Scalars['String']>;
  proposedSchemaHash?: Maybe<Scalars['String']>;
  baseSchemaTag?: Maybe<Scalars['String']>;
  gitContext?: Maybe<GitContextInput>;
  historicParameters?: Maybe<HistoricQueryParameters>;
  useMaximumRetention?: Maybe<Scalars['Boolean']>;
  frontend?: Maybe<Scalars['String']>;
};


export type ServiceMutationCheckArgs = {
  id: Scalars['ID'];
};


export type ServiceMutationCheckWorkflowArgs = {
  id: Scalars['ID'];
};


export type ServiceMutationDeleteSchemaTagArgs = {
  tag: Scalars['String'];
};


export type ServiceMutationUpsertImplementingServiceAndTriggerCompositionArgs = {
  graphVariant: Scalars['String'];
  name: Scalars['String'];
  url?: Maybe<Scalars['String']>;
  revision: Scalars['String'];
  activePartialSchema: PartialSchemaInput;
  gitContext?: Maybe<GitContextInput>;
};


export type ServiceMutationValidatePartialSchemaOfImplementingServiceAgainstGraphArgs = {
  graphVariant: Scalars['String'];
  implementingServiceName: Scalars['String'];
  partialSchema: PartialSchemaInput;
};


export type ServiceMutationRemoveImplementingServiceAndTriggerCompositionArgs = {
  graphVariant: Scalars['String'];
  name: Scalars['String'];
  dryRun?: Scalars['Boolean'];
};


export type ServiceMutationCheckPartialSchemaArgs = {
  graphVariant: Scalars['String'];
  implementingServiceName: Scalars['String'];
  partialSchema: PartialSchemaInput;
  gitContext?: Maybe<GitContextInput>;
  historicParameters?: Maybe<HistoricQueryParameters>;
  frontend?: Maybe<Scalars['String']>;
  useMaximumRetention?: Maybe<Scalars['Boolean']>;
};


export type ServiceMutationUpdateCheckConfigurationArgs = {
  excludedOperations?: Maybe<Array<ExcludedOperationInput>>;
  excludedClients?: Maybe<Array<ClientFilterInput>>;
  includedVariants?: Maybe<Array<Scalars['String']>>;
  timeRangeSeconds?: Maybe<Scalars['Long']>;
  operationCountThreshold?: Maybe<Scalars['Int']>;
  operationCountThresholdPercentage?: Maybe<Scalars['Float']>;
  includeBaseVariant?: Maybe<Scalars['Boolean']>;
};


export type ServiceMutationMarkChangesForOperationAsSafeArgs = {
  checkID: Scalars['ID'];
  operationID: Scalars['ID'];
};


export type ServiceMutationUnmarkChangesForOperationAsSafeArgs = {
  checkID: Scalars['ID'];
  operationID: Scalars['ID'];
};


export type ServiceMutationIgnoreOperationsInChecksArgs = {
  ids: Array<Scalars['ID']>;
};


export type ServiceMutationUnignoreOperationsInChecksArgs = {
  ids: Array<Scalars['ID']>;
};

/** Columns of ServiceQueryStats. */
export enum ServiceQueryStatsColumn {
  CachedHistogram = 'CACHED_HISTOGRAM',
  CachedRequestsCount = 'CACHED_REQUESTS_COUNT',
  CacheTtlHistogram = 'CACHE_TTL_HISTOGRAM',
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  ForbiddenOperationCount = 'FORBIDDEN_OPERATION_COUNT',
  FromEngineproxy = 'FROM_ENGINEPROXY',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  RegisteredOperationCount = 'REGISTERED_OPERATION_COUNT',
  RequestsWithErrorsCount = 'REQUESTS_WITH_ERRORS_COUNT',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP',
  UncachedHistogram = 'UNCACHED_HISTOGRAM',
  UncachedRequestsCount = 'UNCACHED_REQUESTS_COUNT'
}

export type ServiceQueryStatsDimensions = {
  __typename?: 'ServiceQueryStatsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  fromEngineproxy?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ServiceQueryStats. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type ServiceQueryStatsFilter = {
  and?: Maybe<Array<ServiceQueryStatsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose fromEngineproxy dimension equals the given value if not
   * null. To query for the null value, use {in: {fromEngineproxy: [null]}} instead.
   */
  fromEngineproxy?: Maybe<Scalars['String']>;
  in?: Maybe<ServiceQueryStatsFilterIn>;
  not?: Maybe<ServiceQueryStatsFilter>;
  or?: Maybe<Array<ServiceQueryStatsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
};

/**
 * Filter for data in ServiceQueryStats. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type ServiceQueryStatsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose fromEngineproxy dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  fromEngineproxy?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
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

/** A map from role (permission) String to boolean that the current user is allowed for the root service */
export type ServiceRoles = {
  __typename?: 'ServiceRoles';
  canCheckSchemas: Scalars['Boolean'];
  canCreateVariants: Scalars['Boolean'];
  canDelete: Scalars['Boolean'];
  canManageAccess: Scalars['Boolean'];
  canManageIntegrations: Scalars['Boolean'];
  canManageKeys: Scalars['Boolean'];
  canManageVariants: Scalars['Boolean'];
  canQueryCheckConfiguration: Scalars['Boolean'];
  canQueryDeletedImplementingServices: Scalars['Boolean'];
  canQueryImplementingServices: Scalars['Boolean'];
  canQueryIntegrations: Scalars['Boolean'];
  canQueryPrivateInfo: Scalars['Boolean'];
  canQueryPublicInfo: Scalars['Boolean'];
  canQueryRoleOverrides: Scalars['Boolean'];
  canQuerySchemas: Scalars['Boolean'];
  canQueryStats: Scalars['Boolean'];
  canQueryTokens: Scalars['Boolean'];
  canQueryTraces: Scalars['Boolean'];
  canRegisterOperations: Scalars['Boolean'];
  canStoreSchemasWithoutVariant: Scalars['Boolean'];
  canUndelete: Scalars['Boolean'];
  canUpdateAvatar: Scalars['Boolean'];
  canUpdateDescription: Scalars['Boolean'];
  canUpdateTitle: Scalars['Boolean'];
  /** @deprecated Replaced with canQueryTraces and canQueryStats */
  canVisualizeStats: Scalars['Boolean'];
  canWriteCheckConfiguration: Scalars['Boolean'];
  /** @deprecated Never worked, not replaced */
  canWriteTraces: Scalars['Boolean'];
};

/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindow = {
  __typename?: 'ServiceStatsWindow';
  edgeServerInfos: Array<ServiceEdgeServerInfosRecord>;
  enumStats: Array<ServiceEnumStatsRecord>;
  errorStats: Array<ServiceErrorStatsRecord>;
  fieldStats: Array<ServiceFieldStatsRecord>;
  inputStats: Array<ServiceInputStatsRecord>;
  queryStats: Array<ServiceQueryStatsRecord>;
  /** From field rounded down to the nearest resolution. */
  roundedDownFrom: Scalars['Timestamp'];
  /** To field rounded up to the nearest resolution. */
  roundedUpTo: Scalars['Timestamp'];
  tracePathErrorsRefs: Array<ServiceTracePathErrorsRefsRecord>;
  traceRefs: Array<ServiceTraceRefsRecord>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowEdgeServerInfosArgs = {
  filter?: Maybe<ServiceEdgeServerInfosFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<ServiceEdgeServerInfosOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowEnumStatsArgs = {
  filter?: Maybe<ServiceEnumStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<ServiceEnumStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowErrorStatsArgs = {
  filter?: Maybe<ServiceErrorStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<ServiceErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowFieldStatsArgs = {
  filter?: Maybe<ServiceFieldStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<ServiceFieldStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowInputStatsArgs = {
  filter?: Maybe<ServiceInputStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<ServiceInputStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowQueryStatsArgs = {
  filter?: Maybe<ServiceQueryStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<ServiceQueryStatsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowTracePathErrorsRefsArgs = {
  filter?: Maybe<ServiceTracePathErrorsRefsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<ServiceTracePathErrorsRefsOrderBySpec>>;
};


/** A time window with a specified granularity over a given service. */
export type ServiceStatsWindowTraceRefsArgs = {
  filter?: Maybe<ServiceTraceRefsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<ServiceTraceRefsOrderBySpec>>;
};

/** Columns of ServiceTracePathErrorsRefs. */
export enum ServiceTracePathErrorsRefsColumn {
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  DurationBucket = 'DURATION_BUCKET',
  ErrorsCountInPath = 'ERRORS_COUNT_IN_PATH',
  ErrorsCountInTrace = 'ERRORS_COUNT_IN_TRACE',
  ErrorMessage = 'ERROR_MESSAGE',
  Path = 'PATH',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP',
  TraceHttpStatusCode = 'TRACE_HTTP_STATUS_CODE',
  TraceId = 'TRACE_ID',
  TraceSizeBytes = 'TRACE_SIZE_BYTES',
  TraceStartsAt = 'TRACE_STARTS_AT'
}

export type ServiceTracePathErrorsRefsDimensions = {
  __typename?: 'ServiceTracePathErrorsRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationBucket?: Maybe<Scalars['Int']>;
  errorMessage?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceVersion?: Maybe<Scalars['String']>;
  traceHttpStatusCode?: Maybe<Scalars['Int']>;
  traceId?: Maybe<Scalars['ID']>;
  traceStartsAt?: Maybe<Scalars['Timestamp']>;
};

/**
 * Filter for data in ServiceTracePathErrorsRefs. Fields with dimension names
 * represent equality checks. All fields are implicitly ANDed together.
 */
export type ServiceTracePathErrorsRefsFilter = {
  and?: Maybe<Array<ServiceTracePathErrorsRefsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose durationBucket dimension equals the given value if not
   * null. To query for the null value, use {in: {durationBucket: [null]}} instead.
   */
  durationBucket?: Maybe<Scalars['Int']>;
  /**
   * Selects rows whose errorMessage dimension equals the given value if not null.
   * To query for the null value, use {in: {errorMessage: [null]}} instead.
   */
  errorMessage?: Maybe<Scalars['String']>;
  in?: Maybe<ServiceTracePathErrorsRefsFilterIn>;
  not?: Maybe<ServiceTracePathErrorsRefsFilter>;
  or?: Maybe<Array<ServiceTracePathErrorsRefsFilter>>;
  /**
   * Selects rows whose path dimension equals the given value if not null. To query
   * for the null value, use {in: {path: [null]}} instead.
   */
  path?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose traceHttpStatusCode dimension equals the given value if not
   * null. To query for the null value, use {in: {traceHttpStatusCode: [null]}} instead.
   */
  traceHttpStatusCode?: Maybe<Scalars['Int']>;
  /**
   * Selects rows whose traceId dimension equals the given value if not null. To
   * query for the null value, use {in: {traceId: [null]}} instead.
   */
  traceId?: Maybe<Scalars['ID']>;
};

/**
 * Filter for data in ServiceTracePathErrorsRefs. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type ServiceTracePathErrorsRefsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose durationBucket dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  durationBucket?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /**
   * Selects rows whose errorMessage dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  errorMessage?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose traceHttpStatusCode dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  traceHttpStatusCode?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /**
   * Selects rows whose traceId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  traceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
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
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  DurationBucket = 'DURATION_BUCKET',
  DurationNs = 'DURATION_NS',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP',
  TraceId = 'TRACE_ID',
  TraceSizeBytes = 'TRACE_SIZE_BYTES'
}

export type ServiceTraceRefsDimensions = {
  __typename?: 'ServiceTraceRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationBucket?: Maybe<Scalars['Int']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceVersion?: Maybe<Scalars['String']>;
  traceId?: Maybe<Scalars['ID']>;
};

/**
 * Filter for data in ServiceTraceRefs. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type ServiceTraceRefsFilter = {
  and?: Maybe<Array<ServiceTraceRefsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose durationBucket dimension equals the given value if not
   * null. To query for the null value, use {in: {durationBucket: [null]}} instead.
   */
  durationBucket?: Maybe<Scalars['Int']>;
  in?: Maybe<ServiceTraceRefsFilterIn>;
  not?: Maybe<ServiceTraceRefsFilter>;
  or?: Maybe<Array<ServiceTraceRefsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose traceId dimension equals the given value if not null. To
   * query for the null value, use {in: {traceId: [null]}} instead.
   */
  traceId?: Maybe<Scalars['ID']>;
};

/**
 * Filter for data in ServiceTraceRefs. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type ServiceTraceRefsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose durationBucket dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  durationBucket?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose traceId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  traceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type ServiceTraceRefsMetrics = {
  __typename?: 'ServiceTraceRefsMetrics';
  durationNs: Scalars['Long'];
  traceSizeBytes: Scalars['Long'];
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
  name?: Maybe<Scalars['String']>;
  url: Scalars['String'];
};

export type SlackNotificationField = {
  key: Scalars['String'];
  value: Scalars['String'];
};

/** Slack notification message */
export type SlackNotificationInput = {
  color?: Maybe<Scalars['String']>;
  fallback: Scalars['String'];
  fields?: Maybe<Array<SlackNotificationField>>;
  iconUrl?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['Timestamp']>;
  title?: Maybe<Scalars['String']>;
  titleLink?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
};

export type SourceLocation = {
  __typename?: 'SourceLocation';
  line: Scalars['Int'];
  column: Scalars['Int'];
};

/** A time window with a specified granularity. */
export type StatsWindow = {
  __typename?: 'StatsWindow';
  edgeServerInfos: Array<EdgeServerInfosRecord>;
  enumStats: Array<EnumStatsRecord>;
  errorStats: Array<ErrorStatsRecord>;
  fieldStats: Array<FieldStatsRecord>;
  inputStats: Array<InputStatsRecord>;
  queryStats: Array<QueryStatsRecord>;
  /** From field rounded down to the nearest resolution. */
  roundedDownFrom: Scalars['Timestamp'];
  /** To field rounded up to the nearest resolution. */
  roundedUpTo: Scalars['Timestamp'];
  tracePathErrorsRefs: Array<TracePathErrorsRefsRecord>;
  traceRefs: Array<TraceRefsRecord>;
};


/** A time window with a specified granularity. */
export type StatsWindowEdgeServerInfosArgs = {
  filter?: Maybe<EdgeServerInfosFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<EdgeServerInfosOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowEnumStatsArgs = {
  filter?: Maybe<EnumStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<EnumStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowErrorStatsArgs = {
  filter?: Maybe<ErrorStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<ErrorStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowFieldStatsArgs = {
  filter?: Maybe<FieldStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<FieldStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowInputStatsArgs = {
  filter?: Maybe<InputStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<InputStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowQueryStatsArgs = {
  filter?: Maybe<QueryStatsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<QueryStatsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowTracePathErrorsRefsArgs = {
  filter?: Maybe<TracePathErrorsRefsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<TracePathErrorsRefsOrderBySpec>>;
};


/** A time window with a specified granularity. */
export type StatsWindowTraceRefsArgs = {
  filter?: Maybe<TraceRefsFilter>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Array<TraceRefsOrderBySpec>>;
};

export type StoredApprovedChange = {
  __typename?: 'StoredApprovedChange';
  code: ChangeCode;
  parentNode?: Maybe<NamedIntrospectionTypeNoDescription>;
  childNode?: Maybe<NamedIntrospectionValueNoDescription>;
  argNode?: Maybe<NamedIntrospectionArgNoDescription>;
};

export type StoreSchemaError = {
  __typename?: 'StoreSchemaError';
  code: StoreSchemaErrorCode;
  message: Scalars['String'];
};

export enum StoreSchemaErrorCode {
  SchemaIsNotParsable = 'SCHEMA_IS_NOT_PARSABLE',
  SchemaIsNotValid = 'SCHEMA_IS_NOT_VALID'
}

export type StoreSchemaResponse = {
  __typename?: 'StoreSchemaResponse';
  sha256: Scalars['SHA256'];
};

export type StoreSchemaResponseOrError = StoreSchemaResponse | StoreSchemaError;


export type StringToString = {
  __typename?: 'StringToString';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type StringToStringInput = {
  key: Scalars['String'];
  value: Scalars['String'];
};

export type SubgraphConfig = {
  __typename?: 'SubgraphConfig';
  schemaHash: Scalars['String'];
  sdl: Scalars['String'];
  name: Scalars['String'];
  id: Scalars['ID'];
  url: Scalars['String'];
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
  Active = 'ACTIVE',
  Canceled = 'CANCELED',
  Expired = 'EXPIRED',
  Future = 'FUTURE',
  PastDue = 'PAST_DUE',
  Paused = 'PAUSED',
  Pending = 'PENDING',
  Unknown = 'UNKNOWN'
}

export type TemporaryUrl = {
  __typename?: 'TemporaryURL';
  url: Scalars['String'];
};

export enum ThemeName {
  Dark = 'DARK',
  Light = 'LIGHT'
}

export enum TicketPriority {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3'
}

export enum TicketStatus {
  Closed = 'CLOSED',
  Hold = 'HOLD',
  New = 'NEW',
  Open = 'OPEN',
  Pending = 'PENDING',
  Solved = 'SOLVED'
}


export type TimezoneOffset = {
  __typename?: 'TimezoneOffset';
  minutesOffsetFromUTC: Scalars['Int'];
  zoneID: Scalars['String'];
};

export type TotalChangeSummaryCounts = {
  __typename?: 'TotalChangeSummaryCounts';
  /**
   * Number of changes that are additions. This includes adding types, adding fields to object, input
   * object, and interface types, adding values to enums, adding members to interfaces and unions, and
   * adding arguments.
   */
  additions: Scalars['Int'];
  /**
   * Number of changes that are removals. This includes removing types, removing fields from object,
   * input object, and interface types, removing values from enums, removing members from interfaces
   * and unions, and removing arguments. This also includes removing @deprecated usages.
   */
  removals: Scalars['Int'];
  /**
   * Number of changes that are edits. This includes types changing kind, fields and arguments
   * changing type, arguments changing default value, and any description changes. This also includes
   * edits to @deprecated reason strings.
   */
  edits: Scalars['Int'];
  /** Number of changes that are new usages of the @deprecated directive. */
  deprecations: Scalars['Int'];
};

export type Trace = {
  __typename?: 'Trace';
  cacheMaxAgeMs?: Maybe<Scalars['Float']>;
  cacheScope?: Maybe<CacheScope>;
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationMs: Scalars['Float'];
  endTime: Scalars['Timestamp'];
  http?: Maybe<TraceHttp>;
  id: Scalars['ID'];
  operationName?: Maybe<Scalars['String']>;
  protobuf: Protobuf;
  root: TraceNode;
  signature: Scalars['String'];
  signatureId: Scalars['ID'];
  startTime: Scalars['Timestamp'];
  variablesJSON: Array<StringToString>;
};

export type TraceError = {
  __typename?: 'TraceError';
  json: Scalars['String'];
  locations: Array<TraceSourceLocation>;
  message: Scalars['String'];
  timestamp?: Maybe<Scalars['Timestamp']>;
};

export type TraceHttp = {
  __typename?: 'TraceHTTP';
  host?: Maybe<Scalars['String']>;
  method: HttpMethod;
  path?: Maybe<Scalars['String']>;
  protocol?: Maybe<Scalars['String']>;
  requestHeaders: Array<StringToString>;
  responseHeaders: Array<StringToString>;
  secure: Scalars['Boolean'];
  statusCode: Scalars['Int'];
};

export type TraceNode = {
  __typename?: 'TraceNode';
  cacheMaxAgeMs?: Maybe<Scalars['Float']>;
  cacheScope?: Maybe<CacheScope>;
  children: Array<TraceNode>;
  childrenIds: Array<Scalars['ID']>;
  descendants: Array<TraceNode>;
  descendantsIds: Array<Scalars['ID']>;
  endTime: Scalars['Timestamp'];
  errors: Array<TraceError>;
  id: Scalars['ID'];
  key?: Maybe<Scalars['StringOrInt']>;
  originalFieldName?: Maybe<Scalars['String']>;
  parent: Scalars['ID'];
  parentId?: Maybe<Scalars['ID']>;
  path: Array<Scalars['String']>;
  startTime: Scalars['Timestamp'];
  type?: Maybe<Scalars['String']>;
};

/** Columns of TracePathErrorsRefs. */
export enum TracePathErrorsRefsColumn {
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  DurationBucket = 'DURATION_BUCKET',
  ErrorsCountInPath = 'ERRORS_COUNT_IN_PATH',
  ErrorsCountInTrace = 'ERRORS_COUNT_IN_TRACE',
  ErrorMessage = 'ERROR_MESSAGE',
  Path = 'PATH',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP',
  TraceHttpStatusCode = 'TRACE_HTTP_STATUS_CODE',
  TraceId = 'TRACE_ID',
  TraceSizeBytes = 'TRACE_SIZE_BYTES',
  TraceStartsAt = 'TRACE_STARTS_AT'
}

export type TracePathErrorsRefsDimensions = {
  __typename?: 'TracePathErrorsRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
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
  serviceVersion?: Maybe<Scalars['String']>;
  traceHttpStatusCode?: Maybe<Scalars['Int']>;
  traceId?: Maybe<Scalars['ID']>;
  traceStartsAt?: Maybe<Scalars['Timestamp']>;
};

/**
 * Filter for data in TracePathErrorsRefs. Fields with dimension names represent
 * equality checks. All fields are implicitly ANDed together.
 */
export type TracePathErrorsRefsFilter = {
  and?: Maybe<Array<TracePathErrorsRefsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose durationBucket dimension equals the given value if not
   * null. To query for the null value, use {in: {durationBucket: [null]}} instead.
   */
  durationBucket?: Maybe<Scalars['Int']>;
  /**
   * Selects rows whose errorMessage dimension equals the given value if not null.
   * To query for the null value, use {in: {errorMessage: [null]}} instead.
   */
  errorMessage?: Maybe<Scalars['String']>;
  in?: Maybe<TracePathErrorsRefsFilterIn>;
  not?: Maybe<TracePathErrorsRefsFilter>;
  or?: Maybe<Array<TracePathErrorsRefsFilter>>;
  /**
   * Selects rows whose path dimension equals the given value if not null. To query
   * for the null value, use {in: {path: [null]}} instead.
   */
  path?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose traceHttpStatusCode dimension equals the given value if not
   * null. To query for the null value, use {in: {traceHttpStatusCode: [null]}} instead.
   */
  traceHttpStatusCode?: Maybe<Scalars['Int']>;
  /**
   * Selects rows whose traceId dimension equals the given value if not null. To
   * query for the null value, use {in: {traceId: [null]}} instead.
   */
  traceId?: Maybe<Scalars['ID']>;
};

/**
 * Filter for data in TracePathErrorsRefs. Fields match if the corresponding
 * dimension's value is in the given list. All fields are implicitly ANDed together.
 */
export type TracePathErrorsRefsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose durationBucket dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  durationBucket?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /**
   * Selects rows whose errorMessage dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  errorMessage?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Selects rows whose path dimension is in the given list. A null value in the list means a row with null for that dimension. */
  path?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose traceHttpStatusCode dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  traceHttpStatusCode?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /**
   * Selects rows whose traceId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  traceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
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
  ClientName = 'CLIENT_NAME',
  ClientReferenceId = 'CLIENT_REFERENCE_ID',
  ClientVersion = 'CLIENT_VERSION',
  DurationBucket = 'DURATION_BUCKET',
  DurationNs = 'DURATION_NS',
  QueryId = 'QUERY_ID',
  QueryName = 'QUERY_NAME',
  SchemaHash = 'SCHEMA_HASH',
  SchemaTag = 'SCHEMA_TAG',
  ServiceId = 'SERVICE_ID',
  ServiceVersion = 'SERVICE_VERSION',
  Timestamp = 'TIMESTAMP',
  TraceId = 'TRACE_ID',
  TraceSizeBytes = 'TRACE_SIZE_BYTES'
}

export type TraceRefsDimensions = {
  __typename?: 'TraceRefsDimensions';
  clientName?: Maybe<Scalars['String']>;
  clientReferenceId?: Maybe<Scalars['ID']>;
  clientVersion?: Maybe<Scalars['String']>;
  durationBucket?: Maybe<Scalars['Int']>;
  queryId?: Maybe<Scalars['ID']>;
  queryName?: Maybe<Scalars['String']>;
  querySignature?: Maybe<Scalars['String']>;
  schemaHash?: Maybe<Scalars['String']>;
  schemaTag?: Maybe<Scalars['String']>;
  serviceId?: Maybe<Scalars['ID']>;
  serviceVersion?: Maybe<Scalars['String']>;
  traceId?: Maybe<Scalars['ID']>;
};

/**
 * Filter for data in TraceRefs. Fields with dimension names represent equality
 * checks. All fields are implicitly ANDed together.
 */
export type TraceRefsFilter = {
  and?: Maybe<Array<TraceRefsFilter>>;
  /**
   * Selects rows whose clientName dimension equals the given value if not null. To
   * query for the null value, use {in: {clientName: [null]}} instead.
   */
  clientName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose clientReferenceId dimension equals the given value if not
   * null. To query for the null value, use {in: {clientReferenceId: [null]}} instead.
   */
  clientReferenceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose clientVersion dimension equals the given value if not null.
   * To query for the null value, use {in: {clientVersion: [null]}} instead.
   */
  clientVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose durationBucket dimension equals the given value if not
   * null. To query for the null value, use {in: {durationBucket: [null]}} instead.
   */
  durationBucket?: Maybe<Scalars['Int']>;
  in?: Maybe<TraceRefsFilterIn>;
  not?: Maybe<TraceRefsFilter>;
  or?: Maybe<Array<TraceRefsFilter>>;
  /**
   * Selects rows whose queryId dimension equals the given value if not null. To
   * query for the null value, use {in: {queryId: [null]}} instead.
   */
  queryId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose queryName dimension equals the given value if not null. To
   * query for the null value, use {in: {queryName: [null]}} instead.
   */
  queryName?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaHash dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaHash: [null]}} instead.
   */
  schemaHash?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose schemaTag dimension equals the given value if not null. To
   * query for the null value, use {in: {schemaTag: [null]}} instead.
   */
  schemaTag?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose serviceId dimension equals the given value if not null. To
   * query for the null value, use {in: {serviceId: [null]}} instead.
   */
  serviceId?: Maybe<Scalars['ID']>;
  /**
   * Selects rows whose serviceVersion dimension equals the given value if not
   * null. To query for the null value, use {in: {serviceVersion: [null]}} instead.
   */
  serviceVersion?: Maybe<Scalars['String']>;
  /**
   * Selects rows whose traceId dimension equals the given value if not null. To
   * query for the null value, use {in: {traceId: [null]}} instead.
   */
  traceId?: Maybe<Scalars['ID']>;
};

/**
 * Filter for data in TraceRefs. Fields match if the corresponding dimension's
 * value is in the given list. All fields are implicitly ANDed together.
 */
export type TraceRefsFilterIn = {
  /**
   * Selects rows whose clientName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  clientName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose clientReferenceId dimension is in the given list. A null
   * value in the list means a row with null for that dimension.
   */
  clientReferenceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose clientVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  clientVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose durationBucket dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  durationBucket?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /**
   * Selects rows whose queryId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  queryId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose queryName dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  queryName?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaHash dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaHash?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose schemaTag dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  schemaTag?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose serviceId dimension is in the given list. A null value in
   * the list means a row with null for that dimension.
   */
  serviceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**
   * Selects rows whose serviceVersion dimension is in the given list. A null value
   * in the list means a row with null for that dimension.
   */
  serviceVersion?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * Selects rows whose traceId dimension is in the given list. A null value in the
   * list means a row with null for that dimension.
   */
  traceId?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type TraceRefsMetrics = {
  __typename?: 'TraceRefsMetrics';
  durationNs: Scalars['Long'];
  traceSizeBytes: Scalars['Long'];
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

export type TypeChangeSummaryCounts = {
  __typename?: 'TypeChangeSummaryCounts';
  /** Number of changes that are additions of types. */
  additions: Scalars['Int'];
  /** Number of changes that are removals of types. */
  removals: Scalars['Int'];
  /**
   * Number of changes that are edits. This includes types changing kind and any type description
   * changes, but also includes adding/removing values from enums, adding/removing members from
   * interfaces and unions, and any enum value deprecation and description changes.
   */
  edits: Scalars['Int'];
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
  includeAbstractTypes?: Maybe<Scalars['Boolean']>;
  /** include built in scalars (i.e. Boolean, Int, etc) */
  includeBuiltInTypes?: Maybe<Scalars['Boolean']>;
  /** include reserved introspection types (i.e. __Type) */
  includeIntrospectionTypes?: Maybe<Scalars['Boolean']>;
};

export type UnignoreOperationsInChecksResult = {
  __typename?: 'UnignoreOperationsInChecksResult';
  graph: Service;
};

export type UploadSchemaMutationResponse = {
  __typename?: 'UploadSchemaMutationResponse';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
  tag?: Maybe<SchemaTag>;
};

export type Uri = {
  __typename?: 'URI';
  /** A GCS URI */
  gcs: Scalars['String'];
};

export type User = Identity & {
  __typename?: 'User';
  acceptedPrivacyPolicyAt?: Maybe<Scalars['Timestamp']>;
  /** @deprecated Replaced with User.memberships.account */
  accounts: Array<Account>;
  apiKeys: Array<UserApiKey>;
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
  id: Scalars['ID'];
  /**
   * This role is reserved exclusively for internal MDG employees, and it controls what access they may have to other
   * organizations. Only admins are allowed to see this field.
   */
  internalAdminRole?: Maybe<InternalMdgAdminRole>;
  /** Last time any API token from this user was used against AGM services */
  lastAuthenticatedAt?: Maybe<Scalars['Timestamp']>;
  logoutAfterIdleMs?: Maybe<Scalars['Int']>;
  memberships: Array<UserMembership>;
  name: Scalars['String'];
  synchronized: Scalars['Boolean'];
  /** List of Zendesk tickets this user has submitted */
  tickets?: Maybe<Array<ZendeskTicket>>;
  type: UserType;
  odysseyTasks: Array<OdysseyTask>;
  odysseyCourses: Array<OdysseyCourse>;
  experimentalFeatures: UserExperimentalFeatures;
};


export type UserApiKeysArgs = {
  includeCookies?: Maybe<Scalars['Boolean']>;
};


export type UserAvatarUrlArgs = {
  size?: Scalars['Int'];
};

export type UserApiKey = ApiKey & {
  __typename?: 'UserApiKey';
  keyName?: Maybe<Scalars['String']>;
  token: Scalars['String'];
};

export type UserExperimentalFeatures = {
  __typename?: 'UserExperimentalFeatures';
  exampleFeature: Scalars['Boolean'];
};

export type UserMembership = {
  __typename?: 'UserMembership';
  account: Account;
  createdAt: Scalars['Timestamp'];
  permission: UserPermission;
  user: User;
};

export type UserMutation = {
  __typename?: 'UserMutation';
  acceptPrivacyPolicy?: Maybe<Scalars['Void']>;
  /** Change the user's password */
  changePassword?: Maybe<Scalars['Void']>;
  /** Delete the user's avatar. Requires User.canUpdateAvatar to be true. */
  deleteAvatar?: Maybe<AvatarDeleteError>;
  /** Hard deletes the associated user. Throws an error otherwise with reason included. */
  hardDelete?: Maybe<Scalars['Void']>;
  /** Create a new API key for this user. Must take in a name for this key. */
  newKey: UserApiKey;
  /**
   * Create a new API key for this user if there are no current API keys.
   * If an API key already exists, this will return one at random and not create a new one.
   */
  provisionKey?: Maybe<ApiKeyProvision>;
  /** Refresh information about the user from its upstream service (eg list of organizations from GitHub) */
  refresh?: Maybe<User>;
  /** Removes the given key from this user. Can be used to remove either a web cookie or a user API key. */
  removeKey?: Maybe<Scalars['Void']>;
  /** Renames the given key to the new key name. */
  renameKey: UserApiKey;
  resendVerificationEmail?: Maybe<Scalars['Void']>;
  /** Submit a zendesk ticket for this user */
  submitZendeskTicket?: Maybe<ZendeskTicket>;
  /** Update information about a user; all arguments are optional */
  update?: Maybe<User>;
  /** Updates this users' preference concerning opting into beta features. */
  updateBetaFeaturesOn?: Maybe<User>;
  /** Update the status of a feature for this. For example, if you want to hide an introductory popup. */
  updateFeatureIntros?: Maybe<User>;
  /**
   * Update user to have the given internal mdg admin role.
   * It is necessary to be an MDG_INTERNAL_SUPER_ADMIN to perform update.
   * Additionally, upserting a null value explicitly revokes this user's
   * admin status.
   */
  updateRole?: Maybe<User>;
  user: User;
  verifyEmail?: Maybe<User>;
  setOdysseyTask?: Maybe<OdysseyTask>;
  createOdysseyTasks?: Maybe<Array<OdysseyTask>>;
  setOdysseyCourse?: Maybe<OdysseyCourse>;
  createOdysseyCourses?: Maybe<Array<OdysseyCourse>>;
};


export type UserMutationChangePasswordArgs = {
  newPassword: Scalars['String'];
  previousPassword: Scalars['String'];
};


export type UserMutationNewKeyArgs = {
  keyName: Scalars['String'];
};


export type UserMutationProvisionKeyArgs = {
  keyName?: Scalars['String'];
};


export type UserMutationRemoveKeyArgs = {
  key: Scalars['String'];
};


export type UserMutationRenameKeyArgs = {
  key: Scalars['String'];
  newKeyName: Scalars['String'];
};


export type UserMutationSubmitZendeskTicketArgs = {
  collaborators?: Maybe<Array<Scalars['String']>>;
  email: Scalars['String'];
  ticket: ZendeskTicketInput;
};


export type UserMutationUpdateArgs = {
  email?: Maybe<Scalars['String']>;
  fullName?: Maybe<Scalars['String']>;
  referrer?: Maybe<Scalars['String']>;
  userSegment?: Maybe<UserSegment>;
  utmCampaign?: Maybe<Scalars['String']>;
  utmMedium?: Maybe<Scalars['String']>;
  utmSource?: Maybe<Scalars['String']>;
};


export type UserMutationUpdateBetaFeaturesOnArgs = {
  betaFeaturesOn: Scalars['Boolean'];
};


export type UserMutationUpdateFeatureIntrosArgs = {
  newFeatureIntros?: Maybe<FeatureIntrosInput>;
};


export type UserMutationUpdateRoleArgs = {
  newRole?: Maybe<InternalMdgAdminRole>;
};


export type UserMutationVerifyEmailArgs = {
  token: Scalars['String'];
};


export type UserMutationSetOdysseyTaskArgs = {
  task: OdysseyTaskInput;
};


export type UserMutationCreateOdysseyTasksArgs = {
  tasks: Array<OdysseyTaskInput>;
};


export type UserMutationSetOdysseyCourseArgs = {
  course: OdysseyCourseInput;
};


export type UserMutationCreateOdysseyCoursesArgs = {
  courses: Array<OdysseyCourseInput>;
};

export enum UserPermission {
  BillingManager = 'BILLING_MANAGER',
  Consumer = 'CONSUMER',
  Contributor = 'CONTRIBUTOR',
  GraphAdmin = 'GRAPH_ADMIN',
  LegacyGraphKey = 'LEGACY_GRAPH_KEY',
  Observer = 'OBSERVER',
  OrgAdmin = 'ORG_ADMIN'
}

export enum UserSegment {
  JoinMyTeam = 'JOIN_MY_TEAM',
  LocalDevelopment = 'LOCAL_DEVELOPMENT',
  NotSpecified = 'NOT_SPECIFIED',
  ProductionGraphs = 'PRODUCTION_GRAPHS',
  TryTeam = 'TRY_TEAM'
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
  appNavCollapsed?: Maybe<Scalars['Boolean']>;
  autoManageVariables?: Maybe<Scalars['Boolean']>;
  mockingResponses?: Maybe<Scalars['Boolean']>;
  preflightScriptEnabled?: Maybe<Scalars['Boolean']>;
  responseHints?: Maybe<ResponseHints>;
  tableMode?: Maybe<Scalars['Boolean']>;
  themeName?: Maybe<ThemeName>;
};

export enum UserType {
  Apollo = 'APOLLO',
  Github = 'GITHUB',
  Sso = 'SSO'
}

export type ValidateOperationsResult = {
  __typename?: 'ValidateOperationsResult';
  validationResults: Array<ValidationResult>;
};

export enum ValidationErrorCode {
  NonParseableDocument = 'NON_PARSEABLE_DOCUMENT',
  InvalidOperation = 'INVALID_OPERATION',
  DeprecatedField = 'DEPRECATED_FIELD'
}

export enum ValidationErrorType {
  Failure = 'FAILURE',
  Warning = 'WARNING',
  Invalid = 'INVALID'
}

/**
 * Represents a single validation error, with information relating to the error
 * and its respective operation
 */
export type ValidationResult = {
  __typename?: 'ValidationResult';
  /** The type of validation error thrown - warning, failure, or invalid. */
  type: ValidationErrorType;
  /** The validation result's error code */
  code: ValidationErrorCode;
  /** Description of the validation error */
  description: Scalars['String'];
  /** The operation related to this validation result */
  operation: OperationDocument;
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
  name?: Maybe<Scalars['String']>;
  secretToken?: Maybe<Scalars['String']>;
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
  graphId?: Maybe<Scalars['String']>;
  organizationId?: Maybe<Scalars['String']>;
  priority: TicketPriority;
  subject: Scalars['String'];
};

export type SchemaReportMutationVariables = Exact<{
  report: SchemaReport;
  coreSchema?: Maybe<Scalars['String']>;
}>;


export type SchemaReportMutation = (
  { __typename?: 'Mutation' }
  & { reportSchema?: Maybe<(
    { __typename: 'ReportSchemaError' }
    & Pick<ReportSchemaError, 'message' | 'code'>
  ) | (
    { __typename: 'ReportSchemaResponse' }
    & Pick<ReportSchemaResponse, 'inSeconds' | 'withCoreSchema'>
  )> }
);
