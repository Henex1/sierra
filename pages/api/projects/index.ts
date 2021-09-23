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
  getProjectActiveSearchConfiguration,
} from "../../../lib/projects";
import { getSearchEndpoint } from "../../../lib/searchendpoints";
import {
  apiHandler,
  requireMethod,
  requireUser,
  requireOnlyOrg,
  requireBody,
  requireQuery,
} from "../../../lib/apiServer";
import { formatSearchConfiguration } from "../../../lib/searchconfigurations";
import { ErrorMessage } from "../../../lib/errors/constants";
import { notFound } from "../../../lib/errors";

export const handleCreateProject = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const org = await requireOnlyOrg(req);
  const input = requireBody(
    req,
    createProjectSchema.extend({
      searchEndpointId: z.string(),
    })
  );
  const searchEndpoint = await getSearchEndpoint(user, input.searchEndpointId);
  if (!searchEndpoint) {
    return notFound(res, ErrorMessage.SearchEndpointNotFound);
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
      id: z.string(),
      searchEndpointId: z.string().optional(),
      activeSearchConfigurationId: z.string().optional(),
    })
  );
  const project = await getProject(user, input.id);
  if (!project) {
    return notFound(res, ErrorMessage.ProjectNotFound);
  }
  const searchEndpoint = input.searchEndpointId
    ? await getSearchEndpoint(user, input.searchEndpointId)
    : null;
  if (input.searchEndpointId && !searchEndpoint) {
    return notFound(res, ErrorMessage.SearchEndpointNotFound);
  }
  const updated = await updateProject(user, project, searchEndpoint, input);
  return res.status(200).json({ project: formatProject(updated) });
});

export const handleDeleteProject = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(req, z.object({ id: z.string() }));
  const project = await getProject(user, input.id);
  if (!project) {
    return notFound(res, ErrorMessage.ProjectNotFound);
  }
  await deleteProject(project);
  return res.status(200).json({ success: true });
});

export const handleGetProjectActiveSearchConfiguration = apiHandler(
  async (req, res) => {
    requireMethod(req, "GET");
    const user = requireUser(req);
    const { projectId } = requireQuery(
      req,
      z.object({ projectId: z.string() })
    );

    const project = await getProject(user, projectId);
    if (!project) {
      return notFound(res, ErrorMessage.ProjectNotFound);
    }

    const searchEndpoint = await getSearchEndpoint(
      user,
      project.searchEndpointId
    );
    if (!searchEndpoint) {
      return notFound(res, ErrorMessage.SearchEndpointNotFound);
    }

    const activeSearchConfiguration = await getProjectActiveSearchConfiguration(
      project
    );

    return res.status(200).json({
      activeSearchConfiguration: activeSearchConfiguration
        ? formatSearchConfiguration(
            activeSearchConfiguration,
            searchEndpoint.type
          )
        : null,
    });
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
