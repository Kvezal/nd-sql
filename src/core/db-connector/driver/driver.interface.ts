export enum EDrivers {
  POSTGRE_SQL = `postgreSQL`,
}

export interface IDbDriverConfig {
  host: string;
  port: number;
  user: string;
  database: string;
  password: string;
}

export interface IDbDriver {
  query<Type>(config: IQueryParams): Promise<Type[]>;
}

export interface IDbDriverClass {
  new(config: IDbDriverConfig): IDbDriver;
}

export type TColumnParam = string | number | boolean | IRowParams;

export interface IRowParams {
  [key: string]: TColumnParam;
}

export interface IQueryParams<Type = IRowParams> {
  text: string;
  values: Type[];
}
