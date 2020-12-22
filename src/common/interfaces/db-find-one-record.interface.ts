import { IRowParams } from '../../core';


export interface IDbFindOneRecord {
  findOne<Type>(value?: IRowParams): Promise<Type>;
  findOne<Type>(value?: IRowParams, sql?: string): Promise<Type>;
}
