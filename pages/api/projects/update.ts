import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import prisma, { Datasource } from "../../../lib/prisma";
import { notAuthorized } from "../../../lib/errors";
import { getUser } from "../../../lib/auth";
import { userCanAccessProject } from "../../../lib/projects";

const updateProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export default async function updateProject(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "must use POST" });
  }
  const { user } = await getUser(req);
  if (!user) {
    return notAuthorized(res);
  }
  const input = updateProjectSchema.safeParse(req.body);
  if (!input.success) {
    return res.status(400).json(input.error);
  }
  let project = await prisma.project.findFirst({
    where: userCanAccessProject(user, { id: input.data.id }),
  });
  if (!project) {
    return res.status(404).json({ error: "not found" });
  }
  project = await prisma.project.update({
    where: { id: input.data.id },
    data: input.data,
  });
  return res.status(200).json({ project });
}
