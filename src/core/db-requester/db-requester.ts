import {
  DbConnector,
  IQueryParams
} from '../db-connector';
import {
  IQueryAllParams,
  IQueryOneParams,
  SqlPreparer
} from '../sql-preparer';


export class DbRequester {
  private sqlPreparer = new SqlPreparer();

  constructor(private readonly _connector: DbConnector) {
  }

  public async createOne<Type>(config: IQueryOneParams<Type>): Promise<Type> {
    const queryConfig: IQueryParams = this.sqlPreparer.getQueryParamsForOne<Type>(
      config,
    );
    const result: Type[] = await this._connector.query<Type>(queryConfig);
    return result?.[0] || null;
  }

  public async createList<Type>(
    config: IQueryAllParams<Type>,
  ): Promise<Type[]> {
    const queryConfig: IQueryParams = this.sqlPreparer.getQueryParamsForList<Type>(
      config,
    );
    return this._connector.query<Type>(queryConfig);
  }

  public async updateOne<Type>(config: IQueryOneParams<Type>): Promise<Type> {
    const queryConfig: IQueryParams = this.sqlPreparer.getQueryParamsForOne<Type>(
      config,
    );
    const result: Type[] = await this._connector.query<Type>(queryConfig);
    return result?.[0] || null;
  }

  public async removeOne<Type>(config: IQueryOneParams<Type>): Promise<Type> {
    const queryConfig: IQueryParams = this.sqlPreparer.getQueryParamsForOne<Type>(
      config,
    );
    const result: Type[] = await this._connector.query<Type>(queryConfig);
    return result?.[0] || null;
  }

  public async findOne<Type>(config): Promise<Type> {
    const queryConfig: IQueryParams = this.sqlPreparer.getQueryParamsForOne(
      config,
    );
    console.log(queryConfig);
    const result = await this._connector
      .query<Type>(queryConfig)
      .catch(() => null);
    return result?.[0];
  }

  public async findList<Type>(config: IQueryOneParams): Promise<Type[]> {
    const queryConfig: IQueryParams = this.sqlPreparer.getQueryParamsForOne(
      config,
    );
    return this._connector.query<Type>(queryConfig).catch(() => []);
  }
}
