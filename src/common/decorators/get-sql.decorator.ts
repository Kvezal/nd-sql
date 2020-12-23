import { resolve } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';

import { DbTableMap } from '../../core';


const asyncReadFile = promisify(readFile);

export const GetSql = (sqlPath: string) => (
  target: Object,
  propertyKey: string,
  value,
) => ({
  value: async function (params) {
    const classDirectory = DbTableMap.get(target.constructor);
    const sqlFilePath = resolve(classDirectory, `../`, sqlPath);
    const buffer = await asyncReadFile(sqlFilePath);
    const sql = buffer.toString(`utf8`);
    return await value.value.call(this, params, sql);
  },
});
