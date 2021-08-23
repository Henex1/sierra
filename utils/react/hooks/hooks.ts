import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "lodash";

const defaultEq = <T>(a: T, b: T): boolean => a === b;

export const useDebouncedChange = <T>(
  value: T,
  onChange: (t: T) => void,
  time: number,
  eq: (a: T, b: T) => boolean = defaultEq
): [T, (t: T) => void] => {
  const lasUpdateRef = useRef<T>(value);
  const [v, setV] = useState<T>(value);

  const debouncedChange = useCallback(
    debounce((v: T) => {
      lasUpdateRef.current = v;
      onChange(v);
    }, time),
    [setV, time, onChange]
  );

  const handleOnChange = useCallback(
    (newV: T) => {
      if (!eq(v, newV)) {
        setV(newV);
      }
    },
    [setV]
  );

  useEffect(() => {
    if (!eq(lasUpdateRef.current, v)) {
      debouncedChange(v);
    }
  }, [v]);

  useEffect(() => {
    if (!eq(value, lasUpdateRef.current)) {
      setV(value);
    }
  }, [value]);

  return [v, handleOnChange];
};
