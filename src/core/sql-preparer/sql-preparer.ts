import { path } from 'ramda';
import {
  IQueryParams,
  IRowParams
} from '../db-connector';
import {
  IQueryAllParams,
  IQueryOneParams
} from './sql-preparer.interface';


export class SqlPreparer {
  public getQueryParamsForOne<Type = IRowParams>(
    config: IQueryOneParams<Type>,
  ): IQueryParams {
    const params = this._getSqlParams<Type>(config.value);
    const paramKeys = Object.keys(params);
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
  ): IQueryParams {
    const listValuesPart = config.sql.match(
      /\[\[[a-z.\s\[\],_:()0-9]*\]\]:list:/gi,
    )[0];
    const listValuesString = this._clearSql(listValuesPart);

    const values = config.list.map((value: Type) =>
      this._getSqlParams<Type>(value),
    );
    const paramKeys = Object.keys(values[0]);
    const params = values.reduce(
      (queryParams, row: IRowParams) => {
        let queryText: string = listValuesString;
        const rowValues = [];
        paramKeys.forEach((paramName: string) => {
          const paramSignature = new RegExp(`:${paramName}`, `igm`);
          queryText = queryText.replace(
            paramSignature,
            `\$${queryParams.index}`,
          );
          rowValues.push(row[paramName]);
          queryParams.index++;
        });
        queryParams.queryTexts.push(queryText);
        queryParams.values.push(...rowValues);
        return queryParams;
      },
      {
        index: 1,
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

  private _getSqlParams<Type>(
    params: Type,
    path = ``,
    result: IRowParams = {},
  ): IRowParams {
    Object.keys(params).forEach((key: string) => {
      const value: IRowParams = params[key];
      const propertyPath = path + key;
      result[propertyPath] = value;
    });
    return result;
  }
}
