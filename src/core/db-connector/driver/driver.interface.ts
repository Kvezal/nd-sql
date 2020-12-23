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
  query<Type>(config: IQueryParams<Type>): Promise<Type[]>;
}

export interface IDbDriverClass {
  new(config: IDbDriverConfig): IDbDriver;
}


export interface IQueryParams<Type> {
  text: string;
  values: Partial<Type>[];
}
