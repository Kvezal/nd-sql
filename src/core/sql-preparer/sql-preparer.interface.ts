import { IRowParams } from '../db-connector';


export interface IQueryOneParams<Type = IRowParams> {
  sql: string;
  value?: Type;
}

export interface IQueryAllParams<Type = IRowParams> {
  sql: string;
  list: Type[];
}
