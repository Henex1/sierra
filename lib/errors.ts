import { IncomingMessage } from "http";
import { NextApiRequest, NextApiResponse, Redirect } from "next";

export class HttpError extends Error {
  constructor(public statusCode: number, public data: object) {
    super(`HTTP ${statusCode}`);
    this.name = "HttpError";
  }
}

export function notAuthorized(res: NextApiResponse) {
  res.status(401).json({ error: "not authorized" });
}

export function redirectToLogin(req: IncomingMessage): { redirect: Redirect } {
  return {
    redirect: {
      permanent: false,
      destination: `/api/auth/signin`,
    },
  };
}
