import { DbConnector } from '../db-connector';


export interface ILeaf<Type> {
  value: Type;
  parents: ILeaf<Type>[];
  children: ILeaf<Type>[];
}

export interface IDbInitializerConfig<Type = any> {
  force: boolean;
  connector: DbConnector;
  entities: Type;
}
