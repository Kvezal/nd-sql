import {
  Pool,
  PoolClient,
  QueryResult
} from 'pg';

import { DbConnector } from '../../db-connector';
import {
  EDrivers,
  IDbDriver,
  IDbDriverConfig,
  IQueryParams,
} from '../driver.interface';


class PostgresDriver implements IDbDriver {
  private _client: PoolClient;

  constructor(private readonly _config: IDbDriverConfig) {
  }

  public async _getClient(): Promise<PoolClient> {
    if (!this._client) {
      const pool = new Pool(this._config);
      this._client = await pool.connect();
    }
    return this._client;
  }

  async query<Type>(config: IQueryParams<Type>): Promise<Type[]> {
    const client = await this._getClient();
    const result: QueryResult<Type> = await client.query(config);
    return result.rows;
  }
}

DbConnector.registerDriver(EDrivers.POSTGRE_SQL, PostgresDriver);
