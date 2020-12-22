import { resolve } from 'path';
import {
  readdir,
  stat
} from 'fs';
import { promisify } from 'util';


const asyncStat = promisify(stat);
const asyncReadDir = promisify(readdir);

export class DbTableMap {
  private readonly _dbConfigFIleName = `db-config.json`;
  private _config;
  public static tableMap: Map<any, string> = new Map([]);

  static async create(): Promise<DbTableMap> {
    const dbTableMapper = new DbTableMap();
    await dbTableMapper._initDbConfig();
    await dbTableMapper._initDbTableMap(process.cwd());
    return dbTableMapper;
  }

  static get(entity: any): string {
    return DbTableMap.tableMap.get(entity);
  }

  static set(entity: any, path): void {
    DbTableMap.tableMap.set(entity, path);
  }

  static has(entity: any): boolean {
    return DbTableMap.tableMap.has(entity);
  }

  private async _initDbConfig(): Promise<void> {
    const pathToDbConfig = resolve(
      process.cwd(),
      `./${this._dbConfigFIleName}`,
    );
    this._config = await import(pathToDbConfig);
  }

  private async _initDbTableMap(path: string): Promise<void> {
    const dirs = await asyncReadDir(path).catch(() => []);
    for (const name of dirs) {
      if (!this._canRead(name)) {
        continue;
      }
      const subPath = resolve(path, name);
      const stat = await asyncStat(subPath);
      if (stat.isDirectory()) {
        await this._initDbTableMap(subPath).catch(() => null);
      }
      const canContainTableClass =
        stat.isFile() && subPath.includes(this._config.match);
      if (!canContainTableClass) {
        continue;
      }
      const moduleContent = await import(subPath).catch(() => null);
      if (!moduleContent) {
        continue;
      }
      Object.values(moduleContent).forEach((value) => {
        if (!DbTableMap.has(value)) {
          DbTableMap.set(value, subPath);
        }
      });
    }
  }

  private _canRead(name): boolean {
    return !this._config.ignoreDirs.includes(name);
  }
}
