import { createRequest, createResponse, RequestOptions } from "node-mocks-http";
import { getPage } from "next-page-tester";
import { NextApiHandler } from "next";

export * from "./constants";
export { getPage };

export async function getApiRoute<Req extends object, Res extends object = any>(
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
  // @ts-ignore
  await handler(req, res);
  const data = res._getJSONData();
  return data;
}
