import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth/client";
import * as z from "zod";

import prisma, { User, Org } from "./prisma";
import { getUser } from "./authServer";

export type SierraApiRequest = NextApiRequest & {
  session?: Session;
  user?: User;
};

export type SierraApiHandler = (
  req: SierraApiRequest,
  res: NextApiResponse
) => void | Promise<void>;

export class HttpError extends Error {
  constructor(public statusCode: number, public data: object) {
    super(`HTTP ${statusCode}`);
    this.name = "HttpError";
  }
}

export function apiHandler(handler: SierraApiHandler): NextApiHandler {
  return async (nextReq: NextApiRequest, res: NextApiResponse) => {
    const userSession = await getUser(nextReq);
    const req: SierraApiRequest = nextReq as SierraApiRequest;
    Object.assign(req, userSession);
    try {
      await handler(req, res);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        if (err instanceof HttpError) console.error(err.data);
        throw err;
      } else if (err instanceof HttpError) {
        res.status(err.statusCode).json(err.data);
      } else {
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

// Return an the only Org that the currently signed in user is a member of.
// This method is a janky hack which will fail if the user is a member of
// multiple Orgs. It should not be used in production, instead the Org ID
// should be included in the request.
export async function requireOnlyOrg(req: SierraApiRequest): Promise<Org> {
  const user = requireUser(req);
  const org = await prisma.org.findMany({
    where: { users: { some: { userId: user.id } } },
    take: 2,
  });
  if (org.length === 0) {
    throw new Error("User has no attached Org");
  } else if (org.length > 1) {
    throw new Error("User is in multiple Orgs");
  }
  return org[0];
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
