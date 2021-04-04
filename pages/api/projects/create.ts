import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import prisma, { Datasource } from "../../../lib/prisma";
import { notAuthorized } from "../../../lib/errors";
import { getUser } from "../../../lib/auth";
import { userCanAccessOrg } from "../../../lib/org";
import { userCanAccessDatasource } from "../../../lib/datasources";

const createProjectSchema = z.object({
  name: z.string(),
  datasourceId: z.number(),
});

export default async function createProject(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "must use POST" });
  }
  const input = createProjectSchema.safeParse(req.body);
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
  const { datasourceId, ...projectData } = input.data;
  const datasource = (await prisma.datasource.findFirst({
    where: userCanAccessDatasource(user, { id: datasourceId }),
  })) as Datasource | null;
  if (!datasource) {
    return notAuthorized(res);
  }
  const project = await prisma.project.create({
    data: { ...projectData, orgId: org.id, datasourceId: datasource.id },
  });
  return res.status(200).json({ project });
}
