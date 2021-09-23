import * as z from "zod";

import {
  getSearchEndpoint,
  getQueryInterface,
} from "../../../lib/searchendpoints";
import {
  requireUser,
  requireBody,
  requireMethod,
  apiHandler,
} from "../../../lib/apiServer";
import { notFound } from "../../../lib/errors";
import { ErrorMessage } from "../../../lib/errors/constants";

export default apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { searchEndpointId, query } = requireBody(
    req,
    z.object({
      query: z.string(),
      searchEndpointId: z.string(),
    })
  );
  const searchEndpoint = await getSearchEndpoint(user, searchEndpointId);
  if (!searchEndpoint) {
    return notFound(res, ErrorMessage.SearchEndpointNotFound);
  }
  const iface = getQueryInterface(searchEndpoint);
  const result = await iface.handleQueryDEPRECATED(query);
  return res.status(200).json(result);
});
