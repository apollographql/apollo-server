export class HeaderMap extends Map<string, string> {
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
