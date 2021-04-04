import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import prisma, { Datasource } from "../../../lib/prisma";
import { notAuthorized } from "../../../lib/errors";
import { getUser } from "../../../lib/auth";
import { userCanAccessOrg } from "../../../lib/org";
import { userCanAccessDatasource } from "../../../lib/datasources";
import {
  userCanAccessRuleset,
  rulesetVersionValueSchema,
} from "../../../lib/rulesets";

const newRulesetVersionSchema = z.object({
  rulesetId: z.number(),
  parentId: z.number().nullable(),
  value: rulesetVersionValueSchema,
});

export default async function newRulesetVersion(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "must use POST" });
  }
  const input = newRulesetVersionSchema.safeParse(req.body);
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
  const ruleset = await prisma.ruleset.findFirst({
    where: userCanAccessRuleset(user, { id: input.data.rulesetId }),
  });
  if (!ruleset) {
    return res.status(404).json({ error: "ruleset does not exist" });
  }
  const version = await prisma.rulesetVersion.create({
    data: {
      rulesetId: ruleset.id,
      parentId: input.data.parentId,
      value: input.data.value,
    },
  });
  return res.status(200).json({ ruleset, version });
}
