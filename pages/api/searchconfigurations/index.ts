import * as z from "zod";
import cuid from "cuid";
import prisma from "../../../lib/prisma";
import * as log from "../../../lib/logging";

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
  createSCOperation,
} from "../../../lib/searchconfigurations";
import {
  createQueryTemplate,
  updateQueryTemplate,
  getLatestQueryTemplates,
  getQueryTemplate,
} from "../../../lib/querytemplates";
import {
  createJudgementPhrases,
  getJudgementPhrase,
  getLatestJudgements,
  updateJudgement,
} from "../../../lib/judgements";
import {
  apiHandler,
  requireMethod,
  requireUser,
  requireBody,
  requireQuery,
} from "../../../lib/apiServer";
import { getRuleset, getLatestRulesetVersion } from "../../../lib/rulesets";
import { RulesetVersion } from "../../../lib/prisma";
import { addTask, removeTask } from "../../../lib/runningTasks";
import { getProject, updateProject } from "../../../lib/projects";
import { getJudgementForSearchConfiguration } from "../../../lib/judgements";
import { getSearchEndpoint } from "../../../lib/searchendpoints";
import { ErrorMessage } from "../../../lib/errors/constants";
import { notFound } from "../../../lib/errors";

export const handleGetSearchConfigurationById = apiHandler(async (req, res) => {
  requireMethod(req, "GET");
  const user = requireUser(req);
  const { id } = requireQuery(req, z.object({ id: z.string() }));

  const sc = await getSearchConfiguration(user, id);
  if (!sc || !sc.queryTemplate) {
    return notFound(res, ErrorMessage.SearchConfigurationNotFound);
  }

  const project = await getProject(user, sc.queryTemplate.projectId);

  if (!project) {
    return notFound(res, ErrorMessage.ProjectNotFound);
  }

  const searchEndPoint = await getSearchEndpoint(
    user,
    project.searchEndpointId
  );

  if (!searchEndPoint) {
    return notFound(res, ErrorMessage.SearchEndpointNotFound);
  }

  return res
    .status(200)
    .json(formatSearchConfiguration(sc, searchEndPoint.type));
});

export const handleCreateSearchConfiguration = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(
    req,
    z.object({
      projectId: z.string(),
      queryTemplate: z.object({ query: z.string(), knobs: z.object({}) }),
      judgementName: z.string(),
      searchPhrases: z.array(z.string()),
    })
  );

  const project = await getProject(user, input.projectId);

  if (!project) {
    return notFound(res, ErrorMessage.ProjectNotFound);
  }

  const initialQueryTemplate = (
    await getLatestQueryTemplates(user, project, 1)
  )[0];

  let queryTemplate = { ...initialQueryTemplate };

  if (
    initialQueryTemplate.query !== input.queryTemplate.query ||
    Object.entries(input.queryTemplate.knobs).length
  ) {
    queryTemplate = await updateQueryTemplate(initialQueryTemplate, {
      ...input.queryTemplate,
      description: "Update number 1",
    });
  }

  let judgement = (await getLatestJudgements(user, project, 1))[0];

  if (judgement.name !== input.judgementName) {
    judgement = await updateJudgement(judgement, { name: input.judgementName });
  }

  const searchConfigurationId = cuid();

  const createJPOperations = createJudgementPhrases(
    judgement,
    input.searchPhrases.filter(async (phrase) => {
      const judgementPhrase = await getJudgementPhrase(judgement, phrase);
      return !judgementPhrase;
    })
  );

  const createSCOp = createSCOperation({
    id: searchConfigurationId,
    queryTemplateId: queryTemplate.id,
    rulesets: [],
    judgements: [[judgement, 1]],
  });

  const updateProjectOperation = updateProject(user, project, null, {
    activeSearchConfigurationId: searchConfigurationId,
  });

  await prisma.$transaction([
    ...createJPOperations,
    createSCOp,
    updateProjectOperation,
  ]);

  const searchConfiguration = await getSearchConfiguration(
    user,
    searchConfigurationId
  );

  return res.status(200).json(searchConfiguration);
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
    return notFound(res, ErrorMessage.SearchConfigurationNotFound);
  }

  // Current query template
  const currentQueryTemplate = await getQueryTemplate(
    user,
    input.queryTemplateId
  );
  if (!currentQueryTemplate) {
    return notFound(res, ErrorMessage.QueryTemplateNotFound);
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
        return notFound(res, ErrorMessage.RulesetsNotFound);
      }
      rulesets = await Promise.all(
        rulesetVersions.map(async (rs) => (await getLatestRulesetVersion(rs!))!)
      );
    } catch (err) {
      return notFound(res, ErrorMessage.RulesetNotFound);
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
    return notFound(res, ErrorMessage.ProjectNotFound);
  }

  const searchEndpoint = await getSearchEndpoint(
    user,
    currentProject.searchEndpointId
  );
  if (!searchEndpoint) {
    return notFound(res, ErrorMessage.SearchEndpointNotFound);
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
  const updatedExecution = await updateExecution(input.executionId, {
    searchConfigurationId: createdSearchConfiguration.id,
  });

  return res.status(200).json({
    searchConfiguration: formatSearchConfiguration(
      createdSearchConfiguration,
      searchEndpoint.type
    ),
    execution: updatedExecution,
  });
});

export const handleExecuteSearchConfiguration = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(req, z.object({ id: z.string() }));

  const taskName = `Search Configuration Execution - ${
    input.id
  } - ${Date.now()}`;
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
      return notFound(res, ErrorMessage.SearchConfigurationNotFound);
    }

    const execution = await createExecution(
      currentSearchConfiguration,
      currentSearchConfiguration.queryTemplate.projectId
    );

    // Remove task from running tasks list
    await removeTask(taskName);

    res.status(200).json({ execution: formatExecution(execution) });
  } catch (error: any) {
    // Remove task from running tasks list
    const tasks = await removeTask(taskName);
    if (socketIO) {
      socketIO.emit("running_tasks", { tasks });
    }

    log.error(error.stack ?? error, req, res);

    let message;
    switch (error.errno) {
      case "ECONNREFUSED":
        message =
          "Request to Search Endpoint failed, reason: connect ECONNREFUSED. Please check your cluster, or go to Search Endpoint and fix the connection details.";
        break;
      default:
        message = error.message;
    }

    res.status(500).json({ error: message ?? "Internal server error" });
  }
});

export default apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { projectId } = requireBody(req, z.object({ projectId: z.string() }));

  const project = await getProject(user, projectId);
  if (!project) {
    return notFound(res, ErrorMessage.ProjectNotFound);
  }

  const searchConfigurations = await listSearchConfigurations(project);

  return res.status(200).json({ searchConfigurations });
});
