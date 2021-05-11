import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import {
  formatRuleset,
  formatRulesetVersion,
  getRuleset,
  createRulesetSchema,
  createRuleset,
  createRulesetVersionSchema,
  createRulesetVersion,
} from "../../../lib/rulesets";
import { getProject } from "../../../lib/projects";
import {
  apiHandler,
  requireMethod,
  requireUser,
  requireOnlyOrg,
  requireBody,
} from "../../../lib/apiServer";

export const handleCreateOrganization = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  // Todo
  console.log(req.body);
  res.status(200).send({});
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
