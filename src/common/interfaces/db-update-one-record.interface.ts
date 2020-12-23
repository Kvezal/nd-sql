import { IRowParams } from '../../core';


export interface IDbUpdateOneRecord {
  updateOne<Type = IRowParams>(value?: Partial<Type>): Promise<Type[]>;
  updateOne<Type = IRowParams>(value?: Partial<Type>, sql?: string): Promise<Type[]>;
}
