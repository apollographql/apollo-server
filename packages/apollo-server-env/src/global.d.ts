declare function fetch(
  input?: RequestInfo,
  init?: RequestInit,
): Promise<Response>;

declare interface GlobalFetch {
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

type RequestInfo = import('./fetch').RequestInfo;
type Headers = import('./fetch').Headers;
type HeadersInit = import('./fetch').HeadersInit;
type Body = import('./fetch').Body;
type Request = import('./fetch').Request;
type RequestAgent = import('./fetch').RequestAgent;
type RequestInit = import('./fetch').RequestInit;
type RequestMode = import('./fetch').RequestMode;
type RequestCredentials = import('./fetch').RequestCredentials;
type RequestCache = import('./fetch').RequestCache;
type RequestRedirect = import('./fetch').RequestRedirect;
type ReferrerPolicy = import('./fetch').ReferrerPolicy;
type Response = import('./fetch').Response;
type ResponseInit = import('./fetch').ResponseInit;
type BodyInit = import('./fetch').BodyInit;
type URLSearchParams = import('./url').URLSearchParams;
type URLSearchParamsInit = import('./url').URLSearchParamsInit;
