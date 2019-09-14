export function approximateObjectSize<T>(obj: T): number {
  return Buffer.byteLength(JSON.stringify(obj), 'utf8');
}
