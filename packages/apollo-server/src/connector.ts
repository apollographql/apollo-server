export abstract class Connector<TData> {
  abstract getById(id: string): Promise<TData>;
  abstract getByIds(ids: [string]): Promise<Array<TData>>;
}
