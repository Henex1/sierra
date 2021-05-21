import _ from "lodash";
import * as z from "zod";

import prisma, {
  Prisma,
  Project,
  QueryTemplate as PrismaQueryTemplate,
  QueryTemplateTag as PrismaQueryTemplateTag,
  User,
} from "../prisma";
import { userCanAccessProject } from "../projects";

export interface QueryTemplate extends PrismaQueryTemplate {
  tags: PrismaQueryTemplateTag[];
}

const selectKeys = {
  id: true,
  projectId: true,
  parentId: true,
  description: true,
  knobs: true,
  query: true,
};

export type ExposedQueryTemplate = Pick<
  QueryTemplate,
  keyof typeof selectKeys
> & { tags: string[] };

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
  const formatted = (_.pick(
    val,
    _.keys(selectKeys)
  ) as unknown) as ExposedQueryTemplate;
  formatted.tags = val.tags.map((t) => t.name);
  return formatted;
}

export async function getQueryTemplate(
  user: User,
  id: string
): Promise<QueryTemplate | null> {
  const queryTemplate = await prisma.queryTemplate.findFirst({
    where: userCanAccessQueryTemplate(user, { id }),
    include: { tags: true },
  });
  return queryTemplate;
}

export async function listQueryTemplates(
  project: Project
): Promise<QueryTemplate[]> {
  const res = await prisma.queryTemplate.findMany({
    where: { projectId: project.id },
    include: { tags: true },
  });
  return res;
}

export async function listQueryTemplatesFromAllProjects(
  user: User
): Promise<QueryTemplate[]> {
  const ret = await prisma.queryTemplate.findMany({
    where: userCanAccessQueryTemplate(user),
    include: { tags: true },
  });
  return ret;
}

export const createQueryTemplateSchema = z.object({
  description: z.string(),
  query: z.string(),
  knobs: z.any(),
  tags: z.array(z.string()).optional(),
});

export type CreateQueryTemplate = z.infer<typeof createQueryTemplateSchema>;

export async function createQueryTemplate(
  project: Project,
  { tags, ...input }: CreateQueryTemplate
): Promise<QueryTemplate> {
  const queryTemplate = await prisma.queryTemplate.create({
    data: { ...input, knobs: input.knobs, projectId: project.id },
    include: { tags: true },
  });
  if (tags) {
    await prisma.$transaction(
      tags.map((tag) => upsertQueryTemplateTag(queryTemplate, tag))
    );
  }
  return queryTemplate;
}

export const updateQueryTemplateSchema = z.object({
  description: z.string(),
  query: z.string(),
  knobs: z.any(),
  // What tags to apply to the new QueryTemplate. These will be replace any
  // existing tags with the same names.
  tags: z.array(z.string()).optional(),
});

export type UpdateQueryTemplate = z.infer<typeof updateQueryTemplateSchema>;

export async function updateQueryTemplate(
  queryTemplate: QueryTemplate,
  { tags, ...input }: UpdateQueryTemplate
): Promise<QueryTemplate> {
  const updated = await prisma.queryTemplate.create({
    data: {
      ...input,
      knobs: input.knobs,
      parentId: queryTemplate.id,
      projectId: queryTemplate.projectId,
    },
    include: { tags: true },
  });
  if (tags) {
    const qtt = await prisma.$transaction(
      tags.map((tag) => upsertQueryTemplateTag(updated, tag))
    );
    updated.tags = qtt;
  }
  return updated;
}

// Tag a particular QueryTemplate. This will automatically replace an existing
// tag if it exists.
export async function tagQueryTemplate(
  queryTemplate: QueryTemplate,
  name: string
): Promise<void> {
  await upsertQueryTemplateTag(queryTemplate, name);
}

// Remove a specific tag from a QueryTemplate.
export async function untagQueryTemplate(
  queryTemplate: QueryTemplate,
  name: string
): Promise<void> {
  await prisma.queryTemplateTag.delete({
    where: { projectId_name: { projectId: queryTemplate.projectId, name } },
  });
}

// Private method which returns an incomplete prisma operation.
function upsertQueryTemplateTag(queryTemplate: QueryTemplate, name: string) {
  return prisma.queryTemplateTag.upsert({
    where: { projectId_name: { projectId: queryTemplate.projectId, name } },
    update: { queryTemplateId: queryTemplate.id },
    create: {
      projectId: queryTemplate.projectId,
      queryTemplateId: queryTemplate.id,
      name,
    },
  });
}
