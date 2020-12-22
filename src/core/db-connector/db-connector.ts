import { DbInitializer } from '../db-initializer';
import { IDbConnectorConfig } from './db-connector.inerface';
import {
  EDrivers,
  IDbDriver,
  IDbDriverClass,
  IQueryParams
} from './driver';
import { DbTableMap } from '../db-table-mapper';


const driverMap: Map<EDrivers, IDbDriverClass> = new Map();

export class DbConnector implements IDbDriver {
  private _driver: IDbDriver;

  static registerDriver(driverName: EDrivers, driver: IDbDriverClass): void {
    driverMap.set(driverName, driver);
  }

  static async init(config: IDbConnectorConfig): Promise<DbConnector> {
    await DbTableMap.create();
    const connector: DbConnector = new DbConnector(config);
    await DbInitializer.init({
      connector,
      force: config.force,
      entities: config.entities,
    });
    return connector;
  }

  constructor(private readonly _config: IDbConnectorConfig) {
    const Driver: IDbDriverClass = driverMap.get(this._config.driver);
    this._driver = new Driver({
      host: this._config.host,
      port: this._config.port,
      user: this._config.user,
      database: this._config.database,
      password: this._config.password,
    });
  }

  public async query<Type>(config: IQueryParams): Promise<Type[]> {
    return this._driver.query(config);
  }
}
