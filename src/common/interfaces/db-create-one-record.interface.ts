export interface IDbCreateOneRecord {
  createOne<Type>(value: Type): Promise<Type>;
  createOne<Type>(value: Type, sql: string): Promise<Type>;
}
