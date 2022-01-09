import { NextApiRequest, NextApiResponse } from "next";

export function info(
  message: string,
  req?: NextApiRequest,
  res?: NextApiResponse,
  tags?: any[]
) {
  log({
    message,
    req,
    res,
    level: "info",
    tags,
  });
}

export function warn(
  message: string,
  req?: NextApiRequest,
  res?: NextApiResponse,
  tags?: any[]
) {
  log({
    message,
    req,
    res,
    level: "warn",
    tags,
  });
}

export function error(
  message: string,
  req?: NextApiRequest,
  res?: NextApiResponse,
  tags?: any[]
) {
  log({
    message,
    req,
    res,
    level: "error",
    tags,
  });
}

export function exception(
  message: string,
  exception: Error,
  req?: NextApiRequest,
  res?: NextApiResponse,
  tags?: any[]
) {
  log({
    message,
    req,
    res,
    level: "error",
    tags,
  });
}

function log({
  message,
  req,
  res,
  level,
  tags,
}: {
  message: string;
  req?: NextApiRequest;
  res?: NextApiResponse;
  tags?: any[];
  level: "info" | "warn" | "error";
}) {
  console.log(
    JSON.stringify({
      "@timestamp": new Date().toISOString(),
      message,
      tags,
      log: {
        level,
      },
      ...ecsSource(req, res),
      ...ecsHttp(req, res),
      // TODO emit exception details as per ECS
    })
  );
}

function ecsSource(
  req?: NextApiRequest,
  res?: NextApiResponse
): Record<string, any> {
  if (!req || !res) return {};

  let ip = null;
  if (req.headers["x-forwarded-for"]) {
    ip =
      req.headers["x-forwarded-for"]
        .toString()
        .split(",")
        .map((s) => s.trim())[0] ?? "";
  }

  if (!ip || !ip.length) {
    ip =
      req.connection?.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any)?.socket?.remoteAddress ||
      null;
  }

  return { source: { ip } };
}

function ecsHttp(
  req?: NextApiRequest,
  res?: NextApiResponse
): Record<string, any> {
  if (!req || !res) return {};
  return {
    http: {
      request: {
        method: req.method?.toLowerCase(),
        user_agent: req.headers["user-agent"],
      } as Record<string, any>,
      response: {
        status_code: res.statusCode,
      },
    },
  };
}
