import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import prisma, { SearchEndpoint } from "../../../lib/prisma";
import { notAuthorized } from "../../../lib/errors";
import { getUser } from "../../../lib/authServer";
import {
  userCanAccessSearchEndpoint,
  handleGetValues,
  getSearchEndpoint,
} from "../../../lib/searchendpoints";
import { getProject } from "../../../lib/projects";
import {
  apiHandler,
  requireBody,
  requireMethod,
  requireUser,
} from "../../../lib/apiServer";

const getValuesSchema = z.object({
  projectId: z.number(),
  fieldName: z.string(),
  prefix: z.string().optional(),
});

export default apiHandler(async function getValues(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { projectId, fieldName, prefix } = requireBody(req, getValuesSchema);
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
  const result = await handleGetValues(searchEndpoint, fieldName, prefix);
  return res.status(200).json(result);
});
