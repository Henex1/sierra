import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import {
  formatRuleset,
  formatRulesetVersion,
  getRuleset,
  createRulesetSchema,
  createRuleset,
  createRulesetVersionSchema,
  createRulesetVersion,
} from "../../../lib/rulesets";
import {
  formatProject,
  createProjectSchema,
  createProject,
  updateProjectSchema,
  updateProject,
} from "../../../lib/projects";
import { getSearchEndpoint } from "../../../lib/searchendpoints";
import {
  apiHandler,
  HttpError,
  requireMethod,
  requireUser,
  requireOnlyOrg,
  requireBody,
} from "../../../lib/apiServer";

export const handleCreateProject = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const org = await requireOnlyOrg(req);
  const input = requireBody(
    req,
    createProjectSchema.extend({
      searchEndpointId: z.number(),
    })
  );
  const searchEndpoint = await getSearchEndpoint(user, input.searchEndpointId);
  if (!searchEndpoint) {
    throw new HttpError(404, { error: "search endpoint not found" });
  }
  const project = await createProject(org, searchEndpoint, input);
  res.status(200).json({ project: formatProject(project) });
});

export const handleUpdateProject = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(
    req,
    updateProjectSchema.extend({
      searchEndpointId: z.number(),
    })
  );
  const searchEndpoint = await getSearchEndpoint(user, input.searchEndpointId);
  if (!searchEndpoint) {
    throw new HttpError(404, { error: "search endpoint not found" });
  }
  const project = await updateProject(user, searchEndpoint, input);
  return res.status(200).json({ project: formatProject(project) });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
