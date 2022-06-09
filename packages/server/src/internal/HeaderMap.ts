// TODO(AS4): keep rethinking whether Map is what we want or if we just
// do want to use (our own? somebody else's?) Headers class.
// TODO(AS4): probably should do something better if you pass upper-case
// to get/has/delete as well.
export class HeaderMap extends Map<string, string> {
  override set(key: string, value: string): this {
    if (key.toLowerCase() !== key) {
      throw Error(`Headers must be lower-case, unlike ${key}`);
    }
    return super.set(key, value);
  }
}
