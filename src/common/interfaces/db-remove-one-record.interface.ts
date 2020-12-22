export interface IDbRemoveOneRecord {
  removeOne<Type>(value?: Type[]): Promise<Type[]>;
  removeOne<Type>(value?: Type[], sql?: string): Promise<Type[]>;
}
