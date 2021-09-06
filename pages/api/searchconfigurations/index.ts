import * as z from "zod";

import {
  createExecution,
  formatExecution,
  updateExecution,
} from "../../../lib/execution";
import {
  getSearchConfiguration,
  formatSearchConfiguration,
  createSearchConfiguration,
  WeightedJudgement,
  listSearchConfigurations,
} from "../../../lib/searchconfigurations";
import {
  createQueryTemplate,
  getQueryTemplate,
} from "../../../lib/querytemplates";
import {
  apiHandler,
  HttpError,
  requireMethod,
  requireUser,
  requireBody,
  requireQuery,
} from "../../../lib/apiServer";
import { getRuleset, getLatestRulesetVersion } from "../../../lib/rulesets";
import { RulesetVersion } from "../../../lib/prisma";
import { addTask, removeTask } from "../../../lib/runningTasks";
import { getProject } from "../../../lib/projects";
import { getJudgementForSearchConfiguration } from "../../../lib/judgements";

export const handleGetSearchConfigurationById = apiHandler(async (req, res) => {
  requireMethod(req, "GET");
  const user = requireUser(req);
  const { id } = requireQuery(req, z.object({ id: z.string() }));

  const sc = await getSearchConfiguration(user, id);
  if (sc == null) {
    throw new HttpError(404, {
      error: `No search configuration found with this id: ${id}`,
    });
  }

  return res.status(200).json(formatSearchConfiguration(sc));
});

export const handleUpdateSearchConfiguration = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(
    req,
    z.object({
      id: z.string(),
      queryTemplateId: z.string(),
      executionId: z.string(),
      rulesetIds: z.array(z.string()).optional(),
    })
  );

  const currentSearchConfiguration = await getSearchConfiguration(
    user,
    input.id
  );
  if (!currentSearchConfiguration) {
    throw new Error("search configuration not found");
  }

  // Current query template
  const currentQueryTemplate = await getQueryTemplate(
    user,
    input.queryTemplateId
  );
  if (!currentQueryTemplate) {
    throw new Error("query template not found");
  }

  const { id, tags, description, ...queryTemplateInput } = currentQueryTemplate;

  // Populate rulesets
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

  // Current search configuration judgements
  const searchConfigurationJudgements = await getJudgementForSearchConfiguration(
    currentSearchConfiguration
  );
  const judgements = searchConfigurationJudgements
    ? [
        [
          searchConfigurationJudgements.judgement,
          searchConfigurationJudgements.weight,
        ],
      ]
    : [];

  const currentProject = await getProject(user, currentQueryTemplate.projectId);
  if (!currentProject) {
    throw new Error("project not found");
  }

  // Create new version of query template
  const createdQueryTemplate = await createQueryTemplate(currentProject, {
    ...queryTemplateInput,
    description: description as string,
    tags: tags as any,
  });

  // Create new search configuration with created query template and rulesets
  const createdSearchConfiguration = await createSearchConfiguration({
    queryTemplateId: createdQueryTemplate.id,
    projectId: currentQueryTemplate.projectId,
    rulesets,
    judgements: judgements as WeightedJudgement[],
  });

  // Update current execution with newly created search configuration
  const updatedExecution = await updateExecution(
    input.executionId,
    createdSearchConfiguration.id
  );

  return res.status(200).json({
    searchConfiguration: formatSearchConfiguration(createdSearchConfiguration),
    execution: updatedExecution,
  });
});

export const handleExecuteSearchConfiguration = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(req, z.object({ id: z.string() }));

  const taskName = "Search Configuration Execution";
  const socketIO = req.io;

  // Add task to running tasks list
  const tasks = await addTask(taskName);
  if (socketIO) {
    socketIO.emit("running_tasks", { tasks });
  }

  try {
    const currentSearchConfiguration = await getSearchConfiguration(
      user,
      input.id
    );
    if (!currentSearchConfiguration?.queryTemplate?.projectId) {
      throw new Error("search configuration not found");
    }

    const execution = await createExecution(
      currentSearchConfiguration,
      currentSearchConfiguration.queryTemplate.projectId
    );

    // Remove task from running tasks list
    await removeTask(taskName);

    res.status(200).json({ execution: formatExecution(execution) });
  } catch (error) {
    // Remove task from running tasks list
    const tasks = await removeTask(taskName);
    if (socketIO) {
      socketIO.emit("running_tasks", { tasks });
    }

    throw new HttpError(500, { error });
  }
});

export default apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { projectId } = requireBody(req, z.object({ projectId: z.string() }));

  const project = await getProject(user, projectId);
  if (!project) {
    throw new Error("project not found");
  }

  const searchConfigurations = await listSearchConfigurations(project);

  return res.status(200).json({ searchConfigurations });
});
