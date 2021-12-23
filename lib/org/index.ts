import _ from "lodash";

import prisma, { Prisma, User, Org } from "../prisma";
import type { CreateOrg } from "./types/CreateOrg";
import type { UpdateOrg } from "./types/UpdateOrg";
import type { NewOrgUser } from "./types/NewOrgUser";
import { UserOrgRole } from ".prisma/client";

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

export async function getActiveOrg(
  user: User,
  id: string
): Promise<Org | null> {
  const query = { id };
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
  const orgUser = await prisma.orgUser.findFirst({
    where: {
      userId: user.id,
      orgId: id,
      role: "ADMIN",
    },
  });

  if (!orgUser) {
    throw new Error("Current user doesn't belong to organization");
  }

  return prisma.org.update({ data, where: { id } }).then((t) => t.id);
}

export async function createOrgUser(user: User, id: string, data: NewOrgUser) {
  const orgUser = await prisma.orgUser.findFirst({
    where: {
      userId: user.id,
      orgId: id,
      role: "ADMIN",
    },
  });

  if (!orgUser) {
    throw new Error("Current user doesn't belong to organization");
  }

  const emailUser = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (!emailUser) {
    // create signup invite link
    return;
  }

  const emailOrgUser = await prisma.orgUser.findFirst({
    where: {
      userId: emailUser.id,
    },
  });

  if (emailOrgUser) {
    return;
  }

  return prisma.orgUser
    .create({
      data: {
        role: data.role as UserOrgRole,
        user: {
          connect: {
            email: data.email,
          },
        },
        org: {
          connect: {
            id,
          },
        },
      },
    })
    .then((t) => t.orgId);
}

export async function getOrgUsers(user: User, id: string) {
  const orgUser = await prisma.orgUser.findFirst({
    where: {
      userId: user.id,
      orgId: id,
      role: "ADMIN",
    },
  });

  if (!orgUser) {
    throw new Error("Current user doesn't belong to organization");
  }

  const users = await prisma.orgUser.findMany({
    where: {
      orgId: id,
    },
    include: {
      user: true,
    },
  });

  return users;
}
