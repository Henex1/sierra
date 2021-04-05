import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import prisma, { SearchEndpoint } from "../../../lib/prisma";
import { notAuthorized } from "../../../lib/errors";
import { getUser } from "../../../lib/authServer";
import { userCanAccessOrg } from "../../../lib/org";
import { userCanAccessSearchEndpoint } from "../../../lib/searchendpoints";

const createRulesetSchema = z.object({
  name: z.string(),
});

export default async function createRuleset(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "must use POST" });
  }
  const input = createRulesetSchema.safeParse(req.body);
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
  const ruleset = await prisma.ruleset.create({
    data: { ...input.data, orgId: org.id },
  });
  return res.status(200).json({ ruleset });
}
