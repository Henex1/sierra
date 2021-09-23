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
} from "../../../lib/apiServer";
import { notFound } from "../../../lib/errors";
import { ErrorMessage } from "../../../lib/errors/constants";

export const handleCreateQueryTemplate = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { projectId, ...input } = requireBody(
    req,
    createQueryTemplateSchema.merge(z.object({ projectId: z.string() }))
  );

  const project = await getProject(user, projectId);
  if (!project) {
    return notFound(res, ErrorMessage.ProjectNotFound);
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
    updateQueryTemplateSchema.merge(
      z.object({ parentId: z.string(), projectId: z.string() })
    )
  );

  const queryTemplate = await getQueryTemplate(user, input.parentId);
  if (!queryTemplate) {
    return notFound(res, ErrorMessage.QueryTemplateNotFound);
  }

  const updated = await updateQueryTemplate(queryTemplate, input);
  return res.status(200).json({ queryTemplate: formatQueryTemplate(updated) });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return notFound(res);
}
