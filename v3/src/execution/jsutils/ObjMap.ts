/**
 * Portions of code within this module are leveraging code copied from the
 * `graphql-js` library and modified to suit the needs of Apollo Server. For
 * details regarding the terms of these modifications and any relevant
 * attributions for the existing code, see the LICENSE file, at the root of this
 * package.
 */

export type ObjMap<T> = { [key: string]: T } & { __proto__: null };
export type ObjMapLike<T> = ObjMap<T> | { [key: string]: T };

export type ReadOnlyObjMap<T> = { readonly [key: string]: T } & { __proto__: null };
export type ReadOnlyObjMapLike<T> =
  | ReadOnlyObjMap<T>
  | { readonly [key: string]: T };
