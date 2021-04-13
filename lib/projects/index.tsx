import * as z from "zod";

import prisma, { Prisma, User, Org, SearchEndpoint, Project } from "../prisma";
import { userCanAccessOrg } from "../org";

// This is the list of keys which are included in user requests for Project
// by default.
const selectKeys = {
  id: true,
  orgId: true,
  searchEndpointId: true,
  name: true,
};

export type ExposedProject = Pick<Project, keyof typeof selectKeys>;

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

export function formatProject(project: Project): ExposedProject {
  const { id, orgId, searchEndpointId, name } = project;
  return { id, orgId, searchEndpointId, name };
}

export async function getProject(
  user: User,
  id: number
): Promise<Project | null> {
  const project = await prisma.project.findFirst({
    where: userCanAccessProject(user, { id }),
  });
  return project;
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
    },
  });
  return project;
}

export const updateProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type UpdateProject = z.infer<typeof updateProjectSchema>;

export async function updateProject(
  user: User,
  searchEndpoint: SearchEndpoint,
  input: UpdateProject
): Promise<Project> {
  const originalProject = await getProject(user, input.id);
  if (!originalProject) throw new Error("invalid project");
  const project = await prisma.project.update({
    where: { id: input.id },
    data: { ...input, searchEndpointId: searchEndpoint.id },
  });
  return project;
}
