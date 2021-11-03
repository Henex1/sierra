import { memo } from "./async";

describe("Testing 'memo' function", () => {
  const fn = memo(
    (a: number, b: number) => {
      return new Promise((res) => {
        expect(1).toBe(1);
        res([a, b]);
      });
    },
    (a, b) => a[0] === b[0] && a[1] === b[1]
  );

  test("callback should be called only once, as arguments are equal", () => {
    expect.assertions(1);

    return Promise.all([fn(1, 2), fn(1, 2)]);
  });

  test("callback should be called only once, as arguments are different", () => {
    expect.assertions(2);

    return Promise.all([fn(1, 2), fn(3, 2)]);
  });

  test("callback should be called twice", () => {
    expect.assertions(2);

    return fn(1, 2).then(() => fn(1, 2));
  });
});
