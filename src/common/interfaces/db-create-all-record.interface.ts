export interface IDbCreateAllRecords {
  createAll<Type>(list: Type[]): Promise<Type[]>;
  createAll<Type>(list: Type[], sql: string): Promise<Type[]>;
}
