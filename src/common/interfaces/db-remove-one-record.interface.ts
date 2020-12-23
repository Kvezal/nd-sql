import { IRowParams } from '../../core';


export interface IDbRemoveOneRecord {
  removeOne<Type = IRowParams>(value?: Partial<Type>): Promise<Type[]>;
  removeOne<Type = IRowParams>(value?: Partial<Type>, sql?: string): Promise<Type[]>;
}
