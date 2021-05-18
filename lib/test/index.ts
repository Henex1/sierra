import { createRequest, createResponse, RequestOptions } from "node-mocks-http";
import { getPage } from "next-page-tester";
import { NextApiHandler } from "next";

export * from "./constants";
export { getPage };

export async function getApiRoute<Req = any, Res = any>(
  handler: NextApiHandler,
  body: Req,
  opts: RequestOptions = {}
): Promise<Res> {
  const { headers, method = "POST", ...rest } = opts;
  const req = createRequest({
    ...rest,
    method,
    body,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
  const res = createResponse();
  // @ts-expect-error - the mock types don't quite match up, but it's mocks
  await handler(req, res);
  const data = res._getJSONData();
  return data;
}
