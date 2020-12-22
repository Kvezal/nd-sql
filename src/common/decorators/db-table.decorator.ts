import 'reflect-metadata';


export interface ITableMetadata {
  dependencies?: any[];
  init?: string;
  initSql?: string;
  drop?: string;
  dropSql?: string;
  initData?: string;
  initDataSql?: string;
}

export const DB_TABLE_METADATA = Symbol(`dbTableMetadata`);

export const DbTable = (metadata: ITableMetadata) => (target: Function) => {
  metadata.dependencies = metadata.dependencies || [];
  Reflect.defineMetadata(DB_TABLE_METADATA, metadata, target);
};
