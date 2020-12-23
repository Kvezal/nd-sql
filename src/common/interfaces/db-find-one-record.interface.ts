import { IRowParams } from '../../core';


export interface IDbFindOneRecord {
  findOne<Type = IRowParams>(value?: Partial<Type>): Promise<Type>;
  findOne<Type = IRowParams>(value?: Partial<Type>, sql?: string): Promise<Type>;
}
