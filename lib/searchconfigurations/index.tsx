import _ from "lodash";

import prisma, {
  Prisma,
  Execution,
  User,
  Project,
  SearchConfiguration as PrismaSearchConfiguration,
  SearchConfigurationTag as PrismaSearchConfigurationTag,
  QueryTemplate,
  RulesetVersion,
  Judgement,
} from "../prisma";
import { userCanAccessProject } from "../projects";

export interface SearchConfiguration extends PrismaSearchConfiguration {
  tags: PrismaSearchConfigurationTag[];
}

const scSelect = {
  id: true,
};

export type ExposedSearchConfiguration = Pick<
  SearchConfiguration,
  keyof typeof scSelect
> & { tags: string[] };

export function userCanAccessSearchConfiguration(
  user: User,
  rest?: Prisma.SearchConfigurationWhereInput
): Prisma.SearchConfigurationWhereInput {
  const result: Prisma.SearchConfigurationWhereInput = {
    queryTemplate: { project: userCanAccessProject(user) },
  };
  if (rest) {
    result.AND = rest;
  }
  return result;
}

export function formatSearchConfiguration(
  val: SearchConfiguration
): ExposedSearchConfiguration {
  const formatted = (_.pick(
    val,
    _.keys(scSelect)
  ) as unknown) as ExposedSearchConfiguration;
  formatted.tags = val.tags.map((t) => t.name);
  return formatted;
}

export async function getSearchConfiguration(
  user: User,
  id: string
): Promise<SearchConfiguration | null> {
  // SearchConfiguration isn't actually joined to Project, so we check access
  // on the associated QueryTemplate.
  const sc = await prisma.searchConfiguration.findFirst({
    where: userCanAccessSearchConfiguration(user, { id }),
    include: { tags: true },
  });
  return sc;
}

export async function getActiveSearchConfiguration(
  project: Project
): Promise<SearchConfiguration | null> {
  const sc = await prisma.searchConfiguration.findFirst({
    where: { queryTemplate: { projectId: project.id } },
    orderBy: [{ updatedAt: "desc" }],
    include: { tags: true },
  });
  return sc;
}

export async function getExecutionSearchConfiguration(
  execution: Execution
): Promise<SearchConfiguration> {
  const sc = await prisma.searchConfiguration.findFirst({
    where: { id: execution.searchConfigurationId },
    include: { tags: true },
  });
  return sc!;
}

// [Judgement, weight]
export type WeightedJudgement = [Judgement, number];

export async function createSearchConfiguration(
  queryTemplate: QueryTemplate,
  rulesets: RulesetVersion[],
  judgements: WeightedJudgement[],
  tags?: string[]
): Promise<SearchConfiguration> {
  const sc = await prisma.searchConfiguration.create({
    data: {
      queryTemplate: {
        connect: { id: queryTemplate.id },
      },
      judgements: {
        create: judgements.map(([judgement, weight]) => ({
          judgementId: judgement.id,
          weight,
        })),
      },
      rulesets: {
        connect: rulesets.map((rsv) => ({
          id: rsv.id,
        })),
      },
    },
    include: { tags: true },
  });
  if (tags) {
    await prisma.$transaction(
      tags.map((tag) =>
        upsertSearchConfigurationTag(queryTemplate.projectId, sc, tag)
      )
    );
  }
  return sc;
}

export async function getSearchConfigurationProject(
  config: SearchConfiguration
): Promise<Project> {
  const project = await prisma.project.findFirst({
    where: {
      queryTemplates: {
        some: {
          searchConfigurations: {
            some: { id: config.id },
          },
        },
      },
    },
  });
  return project!;
}

// Private method which returns an incomplete prisma operation.
function upsertSearchConfigurationTag(
  projectId: string,
  sc: SearchConfiguration,
  name: string
) {
  return prisma.searchConfigurationTag.upsert({
    where: { projectId_name: { projectId: projectId, name } },
    update: { searchConfigurationId: sc.id },
    create: {
      projectId: projectId,
      searchConfigurationId: sc.id,
      name,
    },
  });
}
