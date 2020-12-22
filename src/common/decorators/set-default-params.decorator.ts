import { mergeDeepRight } from 'ramda';


export const SetDefaultParams = (defaultParams: any) => (
  target: Object,
  propertyKey: string,
  value,
) => ({
  value: async function (params: any, sql: string) {
    const newParams = addDefaultParams(params, defaultParams);
    return await value.value.call(this, newParams, sql);
  },
});

const addDefaultParams = (params, defaultParams: any): any => {
  if (Array.isArray(params)) {
    return params.map((item) => mergeDeepRight(defaultParams, item));
  }
  if (typeof params === `string` || typeof params === `number`) {
    defaultParams.id = params;
    return defaultParams;
  }
  if (typeof params === `object` && params !== null) {
    return mergeDeepRight(defaultParams, params);
  }
  return defaultParams;
};
