import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { createExecution, formatExecution } from "../../../lib/execution";
import {
  getSearchConfiguration,
  formatSearchConfiguration,
  updateSearchConfiguration,
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
import { addTask, removeTask } from "../../../lib/runningTasks";

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

  const queryTemplate = await getQueryTemplate(user, input.queryTemplateId);
  if (!queryTemplate) {
    throw new HttpError(404, { error: "query template not found" });
  }

  let rulesets: RulesetVersion[] = [];
  if (input.rulesetIds) {
    try {
      const rulesetVersions = await Promise.all(
        input.rulesetIds.map((id) => getRuleset(user, id))
      );
      if (rulesetVersions.includes(null)) {
        throw new HttpError(404, {
          error: "one or more rulesets not found",
        });
      }
      rulesets = await Promise.all(
        rulesetVersions.map(async (rs) => (await getLatestRulesetVersion(rs!))!)
      );
    } catch (err) {
      throw new HttpError(404, { error: "ruleset not found" });
    }
  }

  const updated = await updateSearchConfiguration({
    id: input.id,
    queryTemplate,
    rulesets,
  });

  return res
    .status(200)
    .json({ searchConfiguration: formatSearchConfiguration(updated) });
});

export const handleExecute = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(req, z.object({ id: z.string() }));

  const taskName = "Search Configuration Execution";
  const socketIO = req.io;

  // Add task to running tasks list
  const tasks = await addTask(taskName);
  socketIO.emit("running_tasks", { tasks });

  try {
    const sc = await getSearchConfiguration(user, input.id);
    if (!sc) {
      throw new Error("search configuration not found");
    }

    const execution = await createExecution(sc);

    // Remove task from running tasks list
    await removeTask(taskName);

    res.status(200).json({ execution: formatExecution(execution) });
  } catch (error) {
    // Remove task from running tasks list
    const tasks = await removeTask(taskName);
    socketIO.emit("running_tasks", { tasks });

    throw new HttpError(500, { error });
  }
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
