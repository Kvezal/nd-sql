export interface IDbFindAllRecords {
  findAll<Type>(value?: Partial<Type>): Promise<Type[]>;
  findAll<Type>(value?: Partial<Type>, sql?: string): Promise<Type[]>;
}
