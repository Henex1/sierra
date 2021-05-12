import _ from "lodash";
import * as z from "zod";

import prisma, { Prisma, QueryTemplate, User, Project } from "../prisma";
import { userCanAccessProject } from "../projects";

const selectKeys = {
  id: true,
  projectId: true,
  parentId: true,
  description: true,
  knobs: true,
  tag: true,
  query: true,
};

export type ExposedQueryTemplate = Pick<QueryTemplate, keyof typeof selectKeys>;

export function userCanAccessQueryTemplate(
  user: User,
  rest?: Prisma.QueryTemplateWhereInput
): Prisma.QueryTemplateWhereInput {
  const result: Prisma.QueryTemplateWhereInput = {
    project: userCanAccessProject(user),
  };
  if (rest) {
    result.AND = rest;
  }
  return result;
}

export function formatQueryTemplate(val: QueryTemplate): ExposedQueryTemplate {
  return _.pick(val, _.keys(selectKeys)) as ExposedQueryTemplate;
}

export async function getQueryTemplate(
  user: User,
  id: number
): Promise<QueryTemplate | null> {
  const queryTemplate = await prisma.queryTemplate.findFirst({
    where: userCanAccessQueryTemplate(user, { id }),
  });
  return queryTemplate;
}

export const createQueryTemplateSchema = z.object({
  description: z.string(),
  query: z.string(),
  knobs: z.any(),
  tag: z.string().optional(),
  projectId: z.number(),
});

export type CreateQueryTemplate = z.infer<typeof createQueryTemplateSchema>;

export async function createQueryTemplate(
  input: CreateQueryTemplate
): Promise<QueryTemplate> {
  return await prisma.queryTemplate.create({
    data: { ...input, knobs: input.knobs },
  });
}

export const updateQueryTemplateSchema = z.object({
  parentId: z.number(),
  description: z.string(),
  query: z.string(),
  knobs: z.any(),
  tag: z.string().optional(),
  projectId: z.number(),
});

export type UpdateQueryTemplate = z.infer<typeof updateQueryTemplateSchema>;

export async function updateQueryTemplate(
  queryTemplate: QueryTemplate,
  input: UpdateQueryTemplate
): Promise<QueryTemplate> {
  const updated = await prisma.queryTemplate.create({
    data: { ...input, knobs: input.knobs, parentId: queryTemplate.id },
  });
  return updated;
}
