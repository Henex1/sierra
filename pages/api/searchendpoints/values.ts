import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { notAuthorized } from "../../../lib/errors";
import {
  getSearchEndpoint,
  getQueryInterface,
} from "../../../lib/searchendpoints";
import { getProject } from "../../../lib/projects";
import {
  apiHandler,
  requireBody,
  requireMethod,
  requireUser,
} from "../../../lib/apiServer";

export default apiHandler(async function getValues(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { projectId, fieldName, prefix } = requireBody(
    req,
    z.object({
      projectId: z.string(),
      fieldName: z.string(),
      prefix: z.string().optional(),
    })
  );
  const project = await getProject(user, projectId);
  if (!project) {
    return notAuthorized(res);
  }
  const searchEndpoint = await getSearchEndpoint(
    user,
    project.searchEndpointId
  );
  if (!searchEndpoint) {
    return notAuthorized(res);
  }
  const iface = getQueryInterface(searchEndpoint);
  const result = await iface.getFieldValues(fieldName, prefix);
  return res.status(200).json(result);
});
