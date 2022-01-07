import _ from "lodash";
import * as z from "zod";
import prisma, {
  Prisma,
  User,
  Org,
  SearchEndpoint,
  Project,
  SearchEndpointType,
  OffsetPagination,
} from "../prisma";
import { userCanAccessOrg } from "../org";
import {
  createQueryTemplate,
  defaultQueryTemplates,
  getLatestQueryTemplates,
} from "../querytemplates";
import {
  getActiveSearchConfiguration,
  SearchConfiguration,
} from "../searchconfigurations";
import { getLatestExecution } from "../execution";
import { getSearchEndpoint } from "../searchendpoints";
import {
  ExposedJudgement,
  formatJudgement,
  getLatestJudgements,
} from "../judgements";
import { ExposedRuleset, formatRuleset, getLatestRulesets } from "../rulesets";

// This is the list of keys which are included in user requests for Project
// by default.
const selectKeys = {
  id: true,
  orgId: true,
  searchEndpointId: true,
  name: true,
  activeSearchConfigurationId: true,
};

export type ExposedProject = Pick<Project, keyof typeof selectKeys>;

export type RecentProject = ExposedProject & {
  updatedAt: number;
  searchEndpointName: string;
  searchEndpointType: string;
  combinedScore: number | null;
  //Id to name of the projects recently updated judgements and rulesets
  latestJudgements: ExposedJudgement[];
  latestRulesets: ExposedRuleset[];
};

export function userCanAccessProject(
  user: User,
  rest?: Prisma.ProjectWhereInput
): Prisma.ProjectWhereInput {
  const result: Prisma.ProjectWhereInput = { org: userCanAccessOrg(user) };
  if (rest) {
    result.AND = rest;
  }
  return result;
}

export function formatProject(val: Project): ExposedProject {
  return _.pick(val, _.keys(selectKeys)) as ExposedProject;
}

export async function getProject(
  user: User,
  id: string
): Promise<Project | null> {
  const project = await prisma.project.findFirst({
    where: userCanAccessProject(user, { id }),
  });
  return project;
}

export async function listProjects(org: Org): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { orgId: org.id },
  });
  return projects;
}

export const createProjectSchema = z.object({
  name: z.string(),
});

export type CreateProject = z.infer<typeof createProjectSchema>;

export async function createProject(
  org: Org,
  searchEndpoint: SearchEndpoint,
  input: CreateProject
): Promise<Project> {
  const project = await prisma.project.create({
    data: {
      ...input,
      orgId: org.id,
      searchEndpointId: searchEndpoint.id,
      judgements: {
        create: {
          name: "Judgements by internal users",
        },
      },
    },
  });
  if (
    searchEndpoint.type == SearchEndpointType.ELASTICSEARCH ||
    searchEndpoint.type == SearchEndpointType.OPEN_SEARCH
  ) {
    await createQueryTemplate(project, defaultQueryTemplates.elasticsearch);
  } else if (searchEndpoint.type == SearchEndpointType.SOLR) {
    await createQueryTemplate(project, defaultQueryTemplates.solr);
  } else {
    throw new Error(`Project type ${searchEndpoint.type} has no default query`);
  }
  return project;
}

export const updateProjectSchema = z
  .object({
    name: z.string(),
    activeSearchConfigurationId: z.string(),
  })
  .partial();

export type UpdateProject = z.infer<typeof updateProjectSchema>;

export function updateProject(
  user: User,
  project: Project,
  searchEndpoint: SearchEndpoint | null,
  input: UpdateProject
) {
  return prisma.project.update({
    where: { id: project.id },
    data: {
      ...input,
      activeSearchConfigurationId:
        input.activeSearchConfigurationId || undefined,
      searchEndpointId: searchEndpoint?.id || undefined,
    },
  });
}

export async function deleteProject(project: Project): Promise<void> {
  await prisma.project.delete({
    where: { id: project.id },
  });
}

export async function getProjects(
  org: Org,
  { take = 5, skip = 0 }: OffsetPagination = {}
): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { orgId: org.id },
    take,
    skip,
  });
  return projects;
}

export async function countProjects(org: Org): Promise<number> {
  return await prisma.project.count({
    where: { orgId: org.id },
  });
}

export const getProjectActiveSearchConfiguration = async ({
  activeSearchConfigurationId,
}: Project): Promise<SearchConfiguration | null> => {
  const activeSearchConfiguration = await prisma.searchConfiguration.findFirst({
    where: { id: activeSearchConfigurationId || undefined },
    include: { tags: true },
  });
  return activeSearchConfiguration;
};

export async function getRecentProject(
  project: Project,
  user: User
): Promise<RecentProject> {
  const sc = await getActiveSearchConfiguration(project);
  const lastExecution = sc ? await getLatestExecution(sc) : null;
  const latestJudgements = await getLatestJudgements(user, project, 1);
  const latestRulesets = await getLatestRulesets(user, project, 1);
  const latestQueryTemplates = await getLatestQueryTemplates(user, project, 1);
  const searchEndpoint = await getSearchEndpoint(
    user,
    project.searchEndpointId
  );
  const searchEndpointName = searchEndpoint?.name || "";
  const searchEndpointType = searchEndpoint?.type || "";

  const combinedScore =
    typeof lastExecution?.combinedScore === "number"
      ? Math.round(lastExecution.combinedScore * 100)
      : null;

  const updatedAt = Math.max(
    project.updatedAt.valueOf(),
    new Date(latestJudgements[0]?.updatedAt).valueOf() || 0,
    new Date(latestRulesets[0]?.updatedAt).valueOf() || 0,
    new Date(latestQueryTemplates[0]?.updatedAt).valueOf() || 0
  );

  return {
    id: project.id,
    orgId: project.orgId,
    searchEndpointId: project.searchEndpointId,
    activeSearchConfigurationId: project.activeSearchConfigurationId,
    name: project.name,
    combinedScore,
    searchEndpointName,
    searchEndpointType,
    updatedAt,
    latestJudgements: latestJudgements
      ? latestJudgements.map((j) => formatJudgement(j))
      : [],
    latestRulesets: latestRulesets
      ? latestRulesets.map((r) => formatRuleset(r))
      : [],
  };
}

export async function getRecentProjects(
  org: Org,
  user: User,
  { take = 5, skip = 0 }: OffsetPagination = {}
): Promise<RecentProject[]> {
  const projects = await getProjects(org, { take, skip });
  const recentProjects: RecentProject[] = [];
  for (const project of projects) {
    const recentProject = await getRecentProject(project, user);
    recentProjects.push(recentProject);
  }
  return recentProjects;
}
