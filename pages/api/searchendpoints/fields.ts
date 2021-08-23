import { NextApiResponse } from "next";
import * as z from "zod";
import { notFound } from "../../../lib/errors";
import {
  getSearchEndpoint,
  getQueryInterface,
} from "../../../lib/searchendpoints";
import {
  apiHandler,
  requireBody,
  requireMethod,
  requireUser,
  SierraApiRequest,
} from "../../../lib/apiServer";

export default apiHandler(async function getFields(
  req: SierraApiRequest,
  res: NextApiResponse
): Promise<void> {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { searchEndpointId } = requireBody(
    req,
    z.object({
      searchEndpointId: z.string(),
    })
  );
  const searchEndpoint = await getSearchEndpoint(user, searchEndpointId);
  if (!searchEndpoint) {
    return notFound(res);
  }
  const iface = getQueryInterface(searchEndpoint);
  const result = await iface.getFields();
  return res.status(200).json(result);
});
