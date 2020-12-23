import { path } from 'ramda';
import { IQueryParams } from '../db-connector';
import {
  IQueryAllParams,
  IQueryOneParams
} from './sql-preparer.interface';


export class SqlPreparer {
  public getQueryParamsForOne<Type>(
    config: IQueryOneParams<Type>,
  ): IQueryParams<Type> {
    const paramKeys = Object.keys(config.value);
    const sql = this._clearSql(config.sql);
    return paramKeys.reduce(
      (acc, paramName: string, index: number) => {
        const paramSignature = new RegExp(`:${paramName}`, `igm`);
        acc.text = acc.text.replace(paramSignature, `\$${index + 1}`);
        const value = path(paramName.split(`.`), config.value);
        acc.values.push(value);
        return acc;
      },
      {
        text: sql,
        values: [],
      },
    );
  }

  public getQueryParamsForList<Type>(
    config: IQueryAllParams<Type>,
  ): IQueryParams<Type> {
    const listValuesPart = config.sql.match(
      /\[\[[a-z.\s\[\],_:()0-9]*\]\]:list:/gi,
    )[0];
    const listValuesString = this._clearSql(listValuesPart);

    const paramKeys = Object.keys(config.list[0]);
    let index = 1;
    const params = config.list.reduce(
      (queryParams, row: Partial<Type>) => {
        let queryText: string = listValuesString;
        const rowValues = [];
        paramKeys.forEach((paramName: string) => {
          const paramSignature = new RegExp(`:${paramName}`, `igm`);
          queryText = queryText.replace(
            paramSignature,
            `\$${index}`,
          );
          rowValues.push(row[paramName]);
          index++;
        });
        queryParams.queryTexts.push(queryText);
        queryParams.values.push(...rowValues);
        return queryParams;
      },
      {
        queryTexts: [],
        values: [],
      },
    );
    const valuesString = params.queryTexts.join(`, `);
    const text = config.sql.replace(listValuesPart, valuesString);
    return {
      text,
      values: params.values,
    };
  }

  private _clearSql(sql): string {
    return sql.replace(/(\[\[)*(\]\]:list:)*/gi, ``);
  }
}
