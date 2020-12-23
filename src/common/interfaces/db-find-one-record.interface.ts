export interface IDbFindOneRecord {
  findOne<Type>(value?: any): Promise<Type>;
  findOne<Type>(value?: any, sql?: string): Promise<Type>;
}
