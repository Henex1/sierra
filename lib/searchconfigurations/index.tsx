import _ from "lodash";
import * as z from "zod";

import prisma, { Prisma, User, Project, SearchConfiguration } from "../prisma";
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
  id: number
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

export const updateSearchConfigurationSchema = z.object({
  queryTemplateId: z.string(),
  rulesetIds: z.array(z.number()).optional(),
});

export type UpdateSearchConfiguration = Omit<
  z.infer<typeof updateSearchConfigurationSchema>,
  "rulesetIds"
> & {
  judgementIds?: number[];
  rulesetVersionIds?: number[];
};

export async function updateSearchConfiguration(
  input: UpdateSearchConfiguration
): Promise<SearchConfiguration> {
  const sc = await prisma.searchConfiguration.create({
    data: {
      queryTemplate: {
        connect: {
          id: input.queryTemplateId,
        },
      },
      judgements: input.judgementIds
        ? {
            create: input.judgementIds.map((id) => ({
              judgementId: id,
              weight: 1.0,
            })),
          }
        : undefined,
      rulesets: input.rulesetVersionIds
        ? {
            connect: input.rulesetVersionIds.map((id) => ({
              id,
            })),
          }
        : undefined,
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
