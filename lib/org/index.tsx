import _ from "lodash";

import prisma, { Prisma, User, Org } from "../prisma";

const selectKeys = {
  id: true,
  name: true,
  image: true,
};

export type ExposedOrg = Pick<Org, keyof typeof selectKeys>;

export function userCanAccessOrg(
  user: User,
  rest?: Prisma.OrgWhereInput
): Prisma.OrgWhereInput {
  const result: Prisma.OrgWhereInput = { users: { some: { userId: user.id } } };
  if (rest) {
    result.AND = rest;
  }
  return result;
}

export function formatOrg(val: Org): ExposedOrg {
  return _.pick(val, _.keys(selectKeys)) as ExposedOrg;
}

export async function getOrg(user: User, id: number): Promise<Org | null> {
  const org = await prisma.org.findMany({
    where: userCanAccessOrg(user, { id }),
  });
  return org[0];
}

export async function getActiveOrg(user: User): Promise<Org | null> {
  const query = user.activeOrgId ? { id: user.activeOrgId } : {};
  const org = await prisma.org.findFirst({
    where: userCanAccessOrg(user, query),
  });
  return org;
}

export async function listOrgs(user: User): Promise<Org[]> {
  const orgs = await prisma.org.findMany({
    where: userCanAccessOrg(user),
  });
  return orgs;
}
