import { KeyValueCache } from 'apollo-server-caching';

export interface DataSourceConfig<TContext> {
  context: TContext;
  cache: KeyValueCache;
}

export abstract class DataSource<TContext = any> {
  context!: TContext;
  initialize?(config: DataSourceConfig<TContext>): void;
}
