import { Prisma, User, Project } from "../prisma";
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
