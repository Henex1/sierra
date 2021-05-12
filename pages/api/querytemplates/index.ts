import { NextApiRequest, NextApiResponse } from "next";

import { getProject } from "../../../lib/projects";
import {
  getQueryTemplate,
  createQueryTemplateSchema,
  createQueryTemplate,
  updateQueryTemplateSchema,
  updateQueryTemplate,
  formatQueryTemplate,
} from "../../../lib/querytemplates";
import {
  requireUser,
  requireBody,
  requireMethod,
  apiHandler,
  HttpError,
} from "../../../lib/apiServer";

export const handleCreateQueryTemplate = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(req, createQueryTemplateSchema);

  const project = getProject(user, input.projectId);
  if (!project) {
    throw new HttpError(404, { error: "project not found" });
  }
  const queryTemplate = await createQueryTemplate({
    tag: "",
    ...input,
  });
  return res
    .status(200)
    .json({ queryTemplate: formatQueryTemplate(queryTemplate) });
});

export const handleUpdateQueryTemplate = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(req, updateQueryTemplateSchema);

  const project = await getProject(user, input.projectId);
  if (!project) {
    throw new HttpError(404, { error: "project not found" });
  }
  const queryTemplate = await getQueryTemplate(user, input.parentId);
  if (!queryTemplate) {
    throw new HttpError(404, { error: "query template not found" });
  }

  const updated = await updateQueryTemplate(queryTemplate, input);
  return res.status(200).json({ queryTemplate: formatQueryTemplate(updated) });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
