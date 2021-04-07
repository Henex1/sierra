import { isNumber } from 'lodash';

export function parseNonnegativeInt(value: string): Number | undefined {
  const onlyNums = value.replace(/[^\d]/g, "");
  const parsed = parseInt(onlyNums, 10);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return parsed;
}

export function parseNumber(value: String): Number | undefined{
  return parseInt(value as string, 10);
}
