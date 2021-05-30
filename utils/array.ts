export const isNotEmpty = <T>(arr: T[]): arr is [T, ...T[]] => arr.length > 0;
