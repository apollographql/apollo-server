import { KeyValueCache } from 'apollo-server-caching';

export abstract class DataSource<TContext = any> {
  abstract initialize(context: TContext, cache: KeyValueCache): void;
}
