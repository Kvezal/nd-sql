import { IRowParams } from '../../core';


export interface IDbRemoveOneRecord {
  removeOne<Type>(value?: IRowParams): Promise<Type[]>;
  removeOne<Type>(value?: IRowParams, sql?: string): Promise<Type[]>;
}
