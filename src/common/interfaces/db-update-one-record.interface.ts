export interface IDbUpdateOneRecord {
  updateOne<Type>(value?: Partial<Type>): Promise<Type[]>;
  updateOne<Type>(value?: Partial<Type>, sql?: string): Promise<Type[]>;
}
