import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import * as z from "zod";
import { Socket } from "socket.io";

import { User } from "./prisma";
import { getUser } from "./authServer";
import * as log from "../lib/logging";

export type SierraApiRequest = NextApiRequest & {
  session?: Session;
  user?: User;
  io: Socket;
};

export type SierraApiHandler = (
  req: SierraApiRequest,
  res: NextApiResponse
) => void | Promise<void>;

export class HttpError<T extends any> extends Error {
  constructor(public statusCode: number, public data: T) {
    super(`HTTP ${statusCode}`);
    this.name = "HttpError";
  }
}

interface Err {
  error: string;
}
export function apiHandler<T>(
  handler: SierraApiHandler
): NextApiHandler<T | Err> {
  return async (nextReq: NextApiRequest, res: NextApiResponse<T | Err>) => {
    const userSession = await getUser(nextReq);
    const req: SierraApiRequest = nextReq as SierraApiRequest;
    Object.assign(req, userSession);
    try {
      await handler(req, res);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        if (err instanceof HttpError) log.error(err.data, req, res);
        throw err;
      } else if (err instanceof HttpError) {
        res.status(err.statusCode).json(err.data);
      } else {
        log.error(err as any, req, res);
        res.status(500).json({ error: "internal server error" });
      }
    }
  };
}

// Require a particular HTTP method to proceed.
export function requireMethod(req: SierraApiRequest, method: string): void {
  if (req.method !== method) {
    throw new HttpError(405, { error: `request must be ${method}` });
  }
}

// Return the currently signed in user, or fail the request if the user is not
// signed in.
export function requireUser(req: SierraApiRequest): User {
  if (!req.user) {
    throw new HttpError(401, { error: "not authorized" });
  }
  return req.user;
}

export function requireBody<Schema extends z.ZodType<any, any>>(
  req: SierraApiRequest,
  schema: Schema
): z.infer<Schema> {
  const input = req.body;
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error);
  }
  return parsed.data;
}

export function requireQuery<Schema extends z.ZodType<any, any>>(
  req: SierraApiRequest,
  schema: Schema,
  transform?: (query: NextApiRequest["query"]) => any
): z.infer<Schema> {
  const input = transform ? transform(req.query) : req.query;
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error);
  }
  return parsed.data;
}
