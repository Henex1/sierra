export const memo = <I extends any[], R>(
  f: (...args: I) => Promise<R>,
  eq: (a: I, b: I) => boolean
): ((...args: I) => Promise<R>) => {
  let ls: Array<[I, Promise<R>]> = [];

  return (...args: I): Promise<R> => {
    const t = ls.find((i) => eq(i[0], args));

    if (t) {
      return t[1];
    } else {
      const promise = f(...args);
      ls = [...ls, [args, promise]];

      return promise.finally(() => {
        ls = ls.filter((i) => !eq(i[0], args));
      });
    }
  };
};
