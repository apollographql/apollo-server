// TODO(AS3) Keep this function here, but remove it from other places:
//  - apollo-gateway
//  - apollo-server-core
//  - apollo-server-core runQuery.test.ts
export function approximateObjectSize<T>(obj: T): number {
  return Buffer.byteLength(JSON.stringify(obj), 'utf8');
}
