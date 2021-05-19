import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { createExecution, formatExecution } from "../../../lib/execution";
import {
  getSearchConfiguration,
  updateSearchConfigurationSchema,
  updateSearchConfiguration,
  formatSearchConfiguration,
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
import { QueryTemplate, Ruleset, RulesetVersion } from "../../../lib/prisma";
import { getJudgementForSearchConfiguration } from "../../../lib/judgements";

export const handleUpdateSearchConfiguration = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(
    req,
    updateSearchConfigurationSchema.extend({
      id: z.string(),
    })
  );

  const sc = await getSearchConfiguration(user, input.id);
  if (!sc) {
    throw new HttpError(404, { error: "search configuration not found" });
  }

  let queryTemplate: QueryTemplate | null;
  if (input.queryTemplateId) {
    queryTemplate = await getQueryTemplate(user, input.queryTemplateId);
    if (!queryTemplate) {
      throw new HttpError(404, { error: "query template not found" });
    }
  }

  // TODO: this is just for testing lab's search configuration updates
  // it should be based on input
  const judgement = await getJudgementForSearchConfiguration(sc);

  let rulesetVersionIds: string[] | undefined = undefined;
  if (input.rulesetIds) {
    try {
      const rulesets = await Promise.all(
        input.rulesetIds.map((id) => getRuleset(user, id))
      );
      if (rulesets.includes(null)) {
        throw "ruleset";
      }
      const rulesetVersions = (await Promise.all(
        rulesets.map((ruleset) => getLatestRulesetVersion(ruleset as Ruleset))
      )) as RulesetVersion[];
      rulesetVersionIds = rulesetVersions.map((item) => item.id);
    } catch (err) {
      throw new HttpError(404, { error: "ruleset not found" });
    }
  }

  const created = await updateSearchConfiguration({
    queryTemplateId: input.queryTemplateId,
    rulesetVersionIds,
    judgementIds: judgement ? [judgement.judgementId] : undefined,
  });

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
