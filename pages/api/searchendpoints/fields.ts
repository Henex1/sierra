import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";
import { notFound } from "../../../lib/errors";
import {
  getSearchEndpoint,
  handleGetFields,
} from "../../../lib/searchendpoints";
import {
  apiHandler,
  requireBody,
  requireMethod,
  requireUser,
} from "../../../lib/apiServer";

const getFieldsSchema = z.object({
  searchEndpointId: z.number(),
});

export default apiHandler(async function getFields(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { searchEndpointId } = requireBody(req, getFieldsSchema);
  const searchEndpoint = await getSearchEndpoint(user, searchEndpointId);
  if (!searchEndpoint) {
    return notFound(res);
  }
  const result = await handleGetFields(searchEndpoint);
  return res.status(200).json(result);
});