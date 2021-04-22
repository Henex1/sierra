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

export async function listProjects(org: Org): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { orgId: org.id },
  });
  return projects;
}

export interface SearchPhrase {
  phrase: string;
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

export const updateProjectSchema = z
  .object({
    name: z.string(),
  })
  .partial();

export type UpdateProject = z.infer<typeof updateProjectSchema>;

export async function updateProject(
  user: User,
  project: Project,
  searchEndpoint: SearchEndpoint | null,
  input: UpdateProject
): Promise<Project> {
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { ...input, searchEndpointId: searchEndpoint?.id || undefined },
  });
  return updated;
}

export async function deleteProject(project: Project): Promise<void> {
  await prisma.project.delete({
    where: { id: project.id },
  });
}
