import { IRowParams } from '../../core';


export interface IDbFindAllRecords {
  findAll<Type = IRowParams>(value?: Partial<Type>): Promise<Type[]>;
  findAll<Type = IRowParams>(value?: Partial<Type>, sql?: string): Promise<Type[]>;
}
