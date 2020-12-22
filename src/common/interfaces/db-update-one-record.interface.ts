export interface IDbUpdateOneRecord {
  updateOne<Type>(value?: Type[]): Promise<Type[]>;
  updateOne<Type>(value?: Type[], sql?: string): Promise<Type[]>;
}
