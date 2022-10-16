import MIMEType from 'whatwg-mimetype';
import { BadRequestError } from './internalErrorClasses.js';
import type { HeaderMap } from './utils/HeaderMap.js';

// Our recommended set of CSRF prevention headers. Operations that do not
// provide a content-type such as `application/json` (in practice, this
// means GET operations) must include at least one of these headers.
// Apollo Client Web's default behavior is to always sends a
// `content-type` even for `GET`, and Apollo iOS and Apollo Kotlin always
// send `x-apollo-operation-name`. So if you set
// `csrfPreventionRequestHeaders: true` then any `GET` operation from these
// three client projects and any `POST` operation at all should work
// successfully; if you need `GET`s from another kind of client to work,
// just add `apollo-require-preflight: true` to their requests.
export const recommendedCsrfPreventionRequestHeaders = [
  'x-apollo-operation-name',
  'apollo-require-preflight',
];

// See https://fetch.spec.whatwg.org/#cors-safelisted-request-header
const NON_PREFLIGHTED_CONTENT_TYPES = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
];

// We don't want random websites to be able to execute actual GraphQL operations
// from a user's browser unless our CORS policy supports it. It's not good
// enough just to ensure that the browser can't read the response from the
// operation; we also want to prevent CSRF, where the attacker can cause side
// effects with an operation or can measure the timing of a read operation. Our
// goal is to ensure that we don't run the context function or execute the
// GraphQL operation until the browser has evaluated the CORS policy, which
// means we want all operations to be pre-flighted. We can do that by only
// processing operations that have at least one header set that appears to be
// manually set by the JS code rather than by the browser automatically.
//
// POST requests generally have a content-type `application/json`, which is
// sufficient to trigger preflighting. So we take extra care with requests that
// specify no content-type or that specify one of the three non-preflighted
// content types. For those operations, we require (if this feature is enabled)
// one of a set of specific headers to be set. By ensuring that every operation
// either has a custom content-type or sets one of these headers, we know we
// won't execute operations at the request of origins who our CORS policy will
// block.
export function preventCsrf(
  headers: HeaderMap,
  csrfPreventionRequestHeaders: string[],
) {
  const contentType = headers.get('content-type');

  // We have to worry about CSRF if it looks like this may have been a
  // non-preflighted request. If we see a content-type header that is not one of
  // the three CORS-safelisted MIME types (see
  // https://fetch.spec.whatwg.org/#cors-safelisted-request-header) then we know
  // it was preflighted and we don't have to worry.
  if (contentType !== undefined) {
    const contentTypeParsed = MIMEType.parse(contentType);
    if (contentTypeParsed === null) {
      // If we got null, then parsing the content-type failed... which is
      // actually *ok* because that would lead to a preflight. (For example, the
      // header is empty, or doesn't have a slash, or has bad characters.) The
      // scary CSRF case is only if there's *not* an error. So it is actually
      // fine for us to just `return` here. (That said, it would also be
      // reasonable to reject such requests with provided yet unparsable
      // Content-Type here.)
      return;
    }
    if (!NON_PREFLIGHTED_CONTENT_TYPES.includes(contentTypeParsed.essence)) {
      // We managed to parse a MIME type that was not one of the
      // CORS-safelisted ones. (Probably application/json!) That means that if
      // the client is a browser, the browser must have applied CORS
      // preflighting and we don't have to worry about CSRF.
      return;
    }
  }

  // Either there was no content-type, or the content-type parsed properly as
  // one of the three CORS-safelisted values. Let's look for another header that
  // (if this was a browser) must have been set by the user's code and would
  // have caused a preflight.
  if (
    csrfPreventionRequestHeaders.some((header) => {
      const value = headers.get(header);
      return value !== undefined && value.length > 0;
    })
  ) {
    return;
  }

  throw new BadRequestError(
    `This operation has been blocked as a potential Cross-Site Request Forgery ` +
      `(CSRF). Please either specify a 'content-type' header (with a type that ` +
      `is not one of ${NON_PREFLIGHTED_CONTENT_TYPES.join(', ')}) or provide ` +
      `a non-empty value for one of the following headers: ${csrfPreventionRequestHeaders.join(
        ', ',
      )}\n`,
  );
}
