export interface IDbRemoveOneRecord {
  removeOne<Type>(value?: Partial<Type>): Promise<Type>;
  removeOne<Type>(value?: Partial<Type>, sql?: string): Promise<Type>;
}
