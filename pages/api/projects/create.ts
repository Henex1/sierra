import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import prisma, { SearchEndpoint } from "../../../lib/prisma";
import { notAuthorized } from "../../../lib/errors";
import { getUser } from "../../../lib/authServer";
import { userCanAccessOrg } from "../../../lib/org";
import { userCanAccessSearchEndpoint } from "../../../lib/searchendpoints";

const createProjectSchema = z.object({
  name: z.string(),
  searchEndpointId: z.number(),
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
  const { searchEndpointId, ...projectData } = input.data;
  const searchEndpoint = (await prisma.searchEndpoint.findFirst({
    where: userCanAccessSearchEndpoint(user, { id: searchEndpointId }),
  })) as SearchEndpoint | null;
  if (!searchEndpoint) {
    return notAuthorized(res);
  }
  const project = await prisma.project.create({
    data: {
      ...projectData,
      orgId: org.id,
      searchEndpointId: searchEndpoint.id,
    },
  });
  return res.status(200).json({ project });
}
