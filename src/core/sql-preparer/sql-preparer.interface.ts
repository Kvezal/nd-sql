export interface IQueryOneParams<Type> {
  sql: string;
  value?: Partial<Type>;
}

export interface IQueryAllParams<Type> {
  sql: string;
  list: Partial<Type>[];
}
