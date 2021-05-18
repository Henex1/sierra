export function parseNonnegativeInt(value: string): number | undefined {
  const onlyNums = value.replace(/[^\d]/g, "");
  const parsed = parseInt(onlyNums, 10);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return parsed;
}

export function parseNumber(value: string): number | undefined {
  return parseInt(value as string, 10);
}
