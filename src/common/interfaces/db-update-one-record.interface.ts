import { IRowParams } from '../../core';


export interface IDbUpdateOneRecord {
  updateOne<Type>(value?: IRowParams): Promise<Type[]>;
  updateOne<Type>(value?: IRowParams, sql?: string): Promise<Type[]>;
}
