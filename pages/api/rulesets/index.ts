import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { getUser } from "../../../lib/authServer";
import {
  formatRuleset,
  formatRulesetVersion,
  getRuleset,
  createRulesetSchema,
  createRuleset,
  createRulesetVersionSchema,
  createRulesetVersion,
} from "../../../lib/rulesets";
import {
  apiHandler,
  requireMethod,
  requireUser,
  requireOnlyOrg,
  requireBody,
} from "../../../lib/apiServer";

export const handleCreateRuleset = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const org = await requireOnlyOrg(req);
  const input = requireBody(req, createRulesetSchema);
  const ruleset = await createRuleset(org, input);
  res.status(200).json({ ruleset: formatRuleset(ruleset) });
});

export const handleCreateRulesetVersion = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(
    req,
    createRulesetVersionSchema.extend({
      rulesetId: z.number(),
    })
  );
  const ruleset = await getRuleset(user, input.rulesetId);
  if (!ruleset) {
    return res.status(404).json({ error: "ruleset does not exist" });
  }
  const version = await createRulesetVersion(ruleset, input);
  res.status(200).json({
    ruleset: formatRuleset(ruleset),
    version: formatRulesetVersion(version),
  });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
