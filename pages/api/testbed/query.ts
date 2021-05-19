import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import prisma from "../../../lib/prisma";
import { notAuthorized } from "../../../lib/errors";
import { getUser } from "../../../lib/authServer";
import { userCanAccessOrg } from "../../../lib/org";
import { userCanAccessProject } from "../../../lib/projects";
import {
  getQueryInterface,
  expandQuery,
  userCanAccessSearchEndpoint,
} from "../../../lib/searchendpoints";
import { userCanAccessQueryTemplate } from "../../../lib/querytemplates";

const ontologyRequestSchema = z.object({
  query: z.string(),
  projectId: z.string(),
  rulesetIds: z.array(z.number()),
  ltrModelName: z.union([z.string(), z.undefined()]),
});

export default async function executeQuery(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "must use POST" });
  }
  const input = ontologyRequestSchema.safeParse(req.body);
  const { user } = await getUser(req);
  if (!user) {
    return notAuthorized(res);
  }
  const org = await prisma.org.findFirst({ where: userCanAccessOrg(user) });
  if (!org) {
    return res.status(500).json({ error: "user has no attached org" });
  }
  if (!input.success) {
    return res.status(400).json(input.error);
  }
  const project = await prisma.project.findFirst({
    where: userCanAccessProject(user, { id: input.data.projectId }),
  });
  if (!project) {
    return res
      .status(500)
      .json({ error: "Query template must be attached to a project" });
  }

  const rules: any[] = [];
  if (input.data.rulesetIds.length) {
    const rulesetVersions: any[] = await Promise.all(
      input.data.rulesetIds.map(async (id) => {
        return await prisma.rulesetVersion.findFirst({
          where: { ruleset: { id: id } },
          orderBy: [{ updatedAt: "desc" }],
        });
      })
    );
    rulesetVersions.forEach((r) => rules.push(...r?.value?.rules));
  }

  const queryTemplate = await prisma.queryTemplate.findFirst({
    where: userCanAccessQueryTemplate(user, { projectId: project.id }),
    orderBy: [{ updatedAt: "desc" }],
  });
  if (!queryTemplate) {
    return res.status(500).json({ error: "Can't find query template" });
  }

  const searchEndpoint = await prisma.searchEndpoint.findFirst({
    where: userCanAccessSearchEndpoint(user, { id: project.searchEndpointId }),
  });
  if (!searchEndpoint) {
    return res.status(500).json({ error: "Can't find search endpoint" });
  }

  const query = await expandQuery(
    searchEndpoint,
    queryTemplate,
    rules,
    input.data.ltrModelName,
    input.data.query
  );
  const iface = getQueryInterface(searchEndpoint);
  const result = await iface.handleQueryDEPRECATED(JSON.stringify(query));
  return res.status(200).json({ result });
}
