export type NonEmptyArray<T> = [T, ...T[]];

export const isNotEmpty = <T>(arr: T[]): arr is NonEmptyArray<T> =>
  arr.length > 0;

export const randItem = <T>(arr: NonEmptyArray<T>): T =>
  arr[Math.floor(Math.random() * (arr.length + 1))];
