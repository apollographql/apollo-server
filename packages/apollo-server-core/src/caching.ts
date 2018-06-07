export interface ApolloCache {
  set(
    key: string,
    data: string,
    options?: {
      ttl?: number;
      tags?: string[];
    },
  ): Promise<void>;
  get(key: string): Promise<string>;
  invalidate(tags: string[]): Promise<void>;
}
