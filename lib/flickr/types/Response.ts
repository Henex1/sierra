export interface Fail {
  code: number;
  message: string;
  stat: "fail";
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type Success<T extends {}> = {
  stat: "ok";
} & T;

// eslint-disable-next-line @typescript-eslint/ban-types
export type Response<T extends {}> = Fail | Success<T>;
