export class HeaderMap extends Map<string, string> {
  // In order for TypeScript to prevent a standard `Map` from being compatible
  // with a `HeaderMap`, we need some additional property on the class.
  // @ts-ignore (this is just unused)
  private __identity = Symbol('HeaderMap');

  override set(key: string, value: string): this {
    return super.set(key.toLowerCase(), value);
  }

  override get(key: string) {
    return super.get(key.toLowerCase());
  }

  override delete(key: string) {
    return super.delete(key.toLowerCase());
  }

  override has(key: string) {
    return super.has(key.toLowerCase());
  }
}
