export async function apiRequest<Req extends object, Res extends object = any>(
  path: RequestInfo,
  body: Req,
  opts: RequestInit = {}
): Promise<Res> {
  const { headers, method = "POST", ...rest } = opts;
  const response = await fetch(path, {
    ...rest,
    method,
    body:
      method === "DELETE" || method === "GET" || method === "HEAD"
        ? undefined
        : JSON.stringify(body),
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  if (!response.ok) {
    // XXX - do something about this
    throw new Error(JSON.stringify(json));
  }
  return json as Res;
}
