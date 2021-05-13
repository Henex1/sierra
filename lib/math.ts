// Percentiles calculates the percentile scores of the provided array. You can
// provide an array of numbers, or an array of any object and a mapper
// function. The percentiles should be between 0 and 1.
export function percentiles(items: number[], percentiles: number[]): number[];
export function percentiles<T>(
  items: T[],
  percentiles: number[],
  getter: (v: T) => number
): number[];
export function percentiles<T>(
  items: T[],
  percentiles: number[],
  getter?: (v: T) => number
): number[] {
  const sorted = (getter
    ? items.map(getter)
    : ((items as unknown) as number[])
  ).sort((a, b) => a - b);
  return percentiles.map((p) => {
    const pos = (sorted.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (base < sorted.length - 1) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  });
}
