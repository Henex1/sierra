import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { createExecution, formatExecution } from "../../../lib/execution";
import {
  getSearchConfiguration,
  formatSearchConfiguration,
  createSearchConfiguration,
} from "../../../lib/searchconfigurations";
import { getQueryTemplate } from "../../../lib/querytemplates";
import {
  apiHandler,
  HttpError,
  requireMethod,
  requireUser,
  requireBody,
} from "../../../lib/apiServer";
import { getRuleset, getLatestRulesetVersion } from "../../../lib/rulesets";
import { RulesetVersion } from "../../../lib/prisma";
import { getJudgementForSearchConfiguration } from "../../../lib/judgements";

export const handleUpdateSearchConfiguration = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(
    req,
    z.object({
      id: z.string(),
      queryTemplateId: z.string(),
      rulesetIds: z.array(z.string()).optional(),
    })
  );

  const sc = await getSearchConfiguration(user, input.id);
  if (!sc) {
    throw new HttpError(404, { error: "search configuration not found" });
  }

  const queryTemplate = await getQueryTemplate(user, input.queryTemplateId);
  if (!queryTemplate) {
    throw new HttpError(404, { error: "query template not found" });
  }

  // TODO: this is just for testing lab's search configuration updates
  // it should be based on input
  const jsc = await getJudgementForSearchConfiguration(sc);

  let rulesetVersions: RulesetVersion[] = [];
  if (input.rulesetIds) {
    try {
      const rulesets = await Promise.all(
        input.rulesetIds.map((id) => getRuleset(user, id))
      );
      if (rulesets.includes(null)) {
        throw new HttpError(404, {
          error: "one or more rulesets not found",
        });
      }
      rulesetVersions = await Promise.all(
        rulesets.map(async (rs) => (await getLatestRulesetVersion(rs!))!)
      );
    } catch (err) {
      throw new HttpError(404, { error: "ruleset not found" });
    }
  }

  const created = await createSearchConfiguration(
    queryTemplate,
    rulesetVersions,
    jsc ? [[jsc.judgement, jsc.weight]] : []
  );

  return res
    .status(200)
    .json({ searchConfiguration: formatSearchConfiguration(created) });
});

export const handleExecute = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(req, z.object({ id: z.string() }));
  const sc = await getSearchConfiguration(user, input.id);
  if (!sc) {
    throw new HttpError(404, { error: "search configuration not found" });
  }
  const execution = await createExecution(sc);
  res.status(200).json({ execution: formatExecution(execution) });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
