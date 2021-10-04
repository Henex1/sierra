import _ from "lodash";

import prisma, { Prisma, User, Org } from "../prisma";
import type { CreateOrg } from "./types/CreateOrg";
import type { UpdateOrg } from "./types/UpdateOrg";

const selectKeys = {
  id: true,
  name: true,
  image: true,
  domain: true,
};

export type ExposedOrg = Pick<Org, keyof typeof selectKeys>;

export function canCreateOrg(user: User): boolean {
  return user.email?.split("@")[1] === "bigdataboutique.com";
}

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

export async function getOrg(user: User, id: string): Promise<Org | null> {
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

export async function create(user: User, org: CreateOrg): Promise<string> {
  if (!canCreateOrg(user)) {
    throw new Error("User has not capabilities to create organizations");
  }

  return prisma.orgUser
    .create({
      data: {
        role: "ADMIN",
        user: {
          connect: {
            id: user.id,
          },
        },
        org: {
          create: org,
        },
      },
    })
    .then((t) => t.orgId);
}

export async function update(
  user: User,
  id: string,
  data: UpdateOrg
): Promise<string> {
  const org = await prisma.orgUser.findFirst({
    where: {
      userId: user.id,
      orgId: id,
      role: "ADMIN",
    },
  });

  if (!org) {
    throw new Error("Not organization found, associated with current user");
  }

  return prisma.org.update({ data, where: { id } }).then((t) => t.id);
}
