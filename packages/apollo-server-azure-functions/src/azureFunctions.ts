import { ValueOrPromise } from 'apollo-server-env';

export type Context = {
  invocationId: string;
  bindingData: any;
  bindings: any;

  log: (text: any) => void;
  done: (err?: any, output?: object) => void;
};

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'TRACE'
  | 'CONNECT'
  | 'PATCH';

export type FunctionRequest = {
  originalUrl: string;
  method: HttpMethod;
  query: { [key: string]: string };
  headers: { [name: string]: string };
  body: any;
  rawbody: any;
};

export type FunctionResponse = {
  body?: any;
  status?: number;
  headers?: {
    'content-type'?: string;
    'content-length'?: HttpStatusCodes | number;
    'content-disposition'?: string;
    'content-encoding'?: string;
    'content-language'?: string;
    'content-range'?: string;
    'content-location'?: string;
    'content-md5'?: Buffer;
    expires?: Date;
    'last-modified'?: Date;
    [name: string]: any;
  };
};

export enum HttpStatusCodes {
  // 1XX Informational
  Continue = 100,
  SwitchingProtocols = 101,
  Processing = 102,
  Checkpoint = 103,

  // 2XX Success
  OK = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  MultiStatus = 207,
  AlreadyReported = 208,
  IMUsed = 226,

  // 3XX Redirection
  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  SwitchProxy = 306,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,

  // 4XX Client Error
  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionFailed = 412,
  PayloadTooLarge = 413,
  URITooLong = 414,
  UnsupportedMediaType = 415,
  RangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  MethodFailure = 420,
  EnhanceYourCalm = 420,
  MisdirectedRequest = 421,
  UnprocessableEntity = 422,
  Locked = 423,
  FailedDependency = 424,
  UpgradeRequired = 426,
  PreconditionRequired = 428,
  TooManyRequests = 429,
  RequestHeaderFieldsTooLarge = 431,
  LoginTimeout = 440,
  NoResponse = 444,
  RetryWith = 449,
  BlockedByWindowsParentalControls = 450,
  UnavailableForLegalReasons = 451,
  Redirect = 451,
  SSLCertificateError = 495,
  SSLCertificateRequired = 496,
  HttpRequestSentToHttpsPort = 497,
  ClientClosedRequest = 499,
  InvalidToken = 498,
  TokenRequired = 499,
  RequestWasForbiddenByAntivirus = 499,

  // 5XX Server Error
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HttpVersionNotSupported = 505,
  VariantAlsoNegotiates = 506,
  InsufficientStorage = 507,
  LoopDetected = 508,
  BandwidthLimitExceeded = 509,
  NotExtended = 510,
  NetworkAuthenticationRequired = 511,
  UnknownError = 520,
  WebServerIsDown = 521,
  ConnectionTimedOut = 522,
  OriginIsUnreachable = 523,
  ATimeoutOccurred = 524,
  SSLHandshakeFailed = 525,
  InvalidSSLCertificate = 526,
  SiteIsFrozen = 530,
}

export type HttpContext = Context & {
  res: FunctionResponse;
};

export interface FunctionHandler {
  (context: HttpContext, request: FunctionRequest): ValueOrPromise<void>;
}
