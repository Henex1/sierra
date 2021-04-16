import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import {
  formatProject,
  getProject,
  createProjectSchema,
  createProject,
  updateProjectSchema,
  updateProject,
  deleteProject,
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
      id: z.number(),
      searchEndpointId: z.number().optional(),
    })
  );
  const project = await getProject(user, input.id);
  if (!project) {
    throw new HttpError(404, { error: "project not found" });
  }
  const searchEndpoint = input.searchEndpointId
    ? await getSearchEndpoint(user, input.searchEndpointId)
    : null;
  if (input.searchEndpointId && !searchEndpoint) {
    throw new HttpError(404, { error: "search endpoint not found" });
  }
  const updated = await updateProject(user, project, searchEndpoint, input);
  return res.status(200).json({ project: formatProject(updated) });
});

export const handleDeleteProject = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(req, z.object({ id: z.number() }));
  const project = await getProject(user, input.id);
  if (!project) {
    throw new HttpError(404, { error: "project not found" });
  }
  await deleteProject(project);
  return res.status(200).json({ success: true });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
