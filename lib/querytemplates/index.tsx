import prisma, { Prisma, QueryTemplate, User } from "../prisma";
import { userCanAccessProject } from "../projects";
import _ from "lodash";

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

const createKeys = {
  projectId: true,
  description: true,
  knobs: true,
  tag: true,
  query: true,
};

type CreateQueryTemplate = Pick<QueryTemplate, keyof typeof createKeys>;

export async function createQueryTemplate(
  input: CreateQueryTemplate
): Promise<QueryTemplate> {
  return await prisma.queryTemplate.create({
    data: { ...input },
  });
}
