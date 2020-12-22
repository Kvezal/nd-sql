import { IRowParams } from '../../core';


export interface IDbFindAllRecords {
  findAll<Type>(value?: IRowParams): Promise<Type[]>;
  findAll<Type>(value?: IRowParams, sql?: string): Promise<Type[]>;
}
