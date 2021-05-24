import _ from "lodash";

import prisma, {
  Prisma,
  User,
  Project,
  SearchConfiguration,
  QueryTemplate,
  RulesetVersion,
  Judgement,
} from "../prisma";
import { userCanAccessProject } from "../projects";

const scSelect = {
  id: true,
};

export type ExposedSearchConfiguration = Pick<
  SearchConfiguration,
  keyof typeof scSelect
>;

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
  return _.pick(val, _.keys(scSelect)) as ExposedSearchConfiguration;
}

export async function getSearchConfiguration(
  user: User,
  id: string
): Promise<SearchConfiguration | null> {
  // SearchConfiguration isn't actually joined to Project, so we check access
  // on the associated QueryTemplate.
  const sc = await prisma.searchConfiguration.findFirst({
    where: userCanAccessSearchConfiguration(user, { id }),
  });
  return sc;
}

export async function getActiveSearchConfiguration(
  project: Project
): Promise<SearchConfiguration | null> {
  const sc = await prisma.searchConfiguration.findFirst({
    where: { queryTemplate: { projectId: project.id } },
    orderBy: [{ updatedAt: "desc" }],
  });
  return sc;
}

// [Judgement, weight]
export type WeightedJudgement = [Judgement, number];

export async function createSearchConfiguration(
  queryTemplate: QueryTemplate,
  rulesets: RulesetVersion[],
  judgements: WeightedJudgement[]
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
  });
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
