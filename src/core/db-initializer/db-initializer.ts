import { readFile } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

import {
  DB_TABLE_METADATA,
  ITableMetadata
} from '../../common/decorators';
import { IDbInitializerConfig } from './db-initializer.interface';
import { DbTableMap } from '../db-table-mapper';


const asyncReadFile = promisify(readFile);

export class DbInitializer<Type> {
  constructor(private readonly _config: IDbInitializerConfig) {
  }

  static async init(config: IDbInitializerConfig): Promise<void> {
    const initialized = new DbInitializer(config);
    await initialized.init();
  }

  public async init(): Promise<void> {
    const initializationQueueSet = await this.buildInitializationQueue(
      this._config.entities,
    );
    const initializationQueue = Array.from(initializationQueueSet);
    const dropQueue = [...initializationQueue].reverse();
    await this.dropTables(dropQueue);
    await this.initTables(initializationQueue);
  }

  public async initTables(queue: ITableMetadata[]): Promise<void> {
    for (const metadata of queue) {
      await this._config.connector.query({
        text: metadata.initSql,
        values: [],
      });
      if (this._config.force && metadata.initDataSql) {
        await this._config.connector.query({
          text: metadata.initDataSql,
          values: [],
        });
      }
    }
  }

  public async dropTables(queue: ITableMetadata[]): Promise<void> {
    if (!this._config.force) {
      return;
    }
    for (const metadata of queue) {
      await this._config.connector.query({
        text: metadata.dropSql,
        values: [],
      });
    }
  }

  public async buildInitializationQueue(
    entities: Type[],
    uniqueEntitySet: Set<Type> = new Set([]),
    metadataSet: Set<ITableMetadata> = new Set([]),
  ): Promise<Set<ITableMetadata>> {
    for (const Entity of entities) {
      if (uniqueEntitySet.has(Entity)) {
        continue;
      }
      uniqueEntitySet.add(Entity);
      const metadata: ITableMetadata = this.getMetadata(Entity);
      await this._initSqlFiles(Entity, metadata);
      await this.buildInitializationQueue(
        metadata.dependencies,
        uniqueEntitySet,
        metadataSet,
      );
      metadataSet.add(metadata);
    }
    return metadataSet;
  }

  public getMetadata(Entity: Type): ITableMetadata {
    return Reflect.getMetadata(DB_TABLE_METADATA, Entity) as ITableMetadata;
  }

  private async _initSqlFiles(Entity: Type, metadata: ITableMetadata) {
    const entityDirectoryPath = resolve(DbTableMap.get(Entity), `../`);
    if (metadata.init) {
      metadata.initSql = await this.getFileContent(
        entityDirectoryPath,
        metadata.init,
      );
    }
    if (metadata.drop) {
      metadata.dropSql = await this.getFileContent(
        entityDirectoryPath,
        metadata.drop,
      );
    }
    if (metadata.initData) {
      metadata.initDataSql = await this.getFileContent(
        entityDirectoryPath,
        metadata.initData,
      );
    }
  }

  private async getFileContent(
    dirPath: string,
    metaPath: string,
  ): Promise<string> {
    const initFilePath = resolve(dirPath, metaPath);
    const content = await asyncReadFile(initFilePath, `utf8`);
    return content;
  }
}
