export interface PersistedQueryCache {
  set(key: string, data: string): Promise<any>;
  get(key: string): Promise<string | null>;
}
