import * as z from "zod";
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
  const { projectId, ...input } = requireBody(
    req,
    createQueryTemplateSchema.merge(z.object({ projectId: z.string() }))
  );

  const project = await getProject(user, projectId);
  if (!project) {
    throw new HttpError(404, { error: "project not found" });
  }
  const queryTemplate = await createQueryTemplate(project, input);
  return res
    .status(200)
    .json({ queryTemplate: formatQueryTemplate(queryTemplate) });
});

export const handleUpdateQueryTemplate = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(
    req,
    updateQueryTemplateSchema.merge(z.object({ parentId: z.string() }))
  );

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