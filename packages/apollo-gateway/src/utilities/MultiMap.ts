export class MultiMap<K, V> extends Map<K, V[]> {
  add(key: K, value: V): this {
    let values = this.get(key);
    if (values) {
      values.push(value);
    } else {
      this.set(key, (values = [value]));
    }
    return this;
  }
}
