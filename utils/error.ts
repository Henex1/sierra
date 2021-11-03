export const onErr = <E>(isErr: (t: unknown) => t is E) => <T>(t: T | E): T => {
  if (isErr(t)) {
    throw new Error("Value is not valid");
  }

  return t;
};

export const onUndefined = onErr<undefined>(
  (v): v is undefined => v === undefined
);

export const onNull = onErr<null>((v): v is null => v === null);
