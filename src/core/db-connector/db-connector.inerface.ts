import {
  EDrivers,
  IDbDriverConfig
} from './driver';


export interface IDbConnectorConfig extends IDbDriverConfig {
  force?: boolean;
  driver?: EDrivers;
  entities?: any;
}
