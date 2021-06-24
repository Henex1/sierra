export const fieldByPrefix = (
  prefix: string,
  s: string[]
): string | undefined => {
  for (let i = 0; i < s.length; i++) {
    const value = s[i].split(":");

    if (value.length > 1 && value[0] === prefix && value[1]) {
      return value[1];
    }
  }

  return undefined;
};

export const withoutPrefix = (s: string[]): string[] =>
  s.filter((s) => !["title", "url", "image"].includes(s.split(":")[0]));

export const getField = (
  field: string | undefined,
  data: Record<string, unknown>
): { field: string; value: string } | undefined => {
  const value = field ? data[field] : undefined;

  return field && typeof value === "string" ? { field, value } : undefined;
};

export function labelFromField(field: string): string {
  const text = field.substr(0, 1).toUpperCase() + field.slice(1);
  return text.split("_").join(" ");
}
