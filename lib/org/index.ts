import _ from "lodash";

import * as log from "../logging";
import prisma, { Org, Prisma, User, UserOrgRole } from "../prisma";
import { sendGridClient } from "../sendgrid";
import { createInvitation, deleteInvitation } from "../invitation";
import type { CreateOrg } from "./types/CreateOrg";
import type { UpdateOrg } from "./types/UpdateOrg";
import type { NewOrgUser } from "./types/NewOrgUser";
import { OrgAggregates } from "./types/OrgAggregates";

const selectKeys = {
  id: true,
  name: true,
  image: true,
  domain: true,
  orgType: true,
  bgColor: true,
  textColor: true,
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

export async function createOrgUser(
  user: User,
  id: string,
  data: NewOrgUser,
  baseUrl: string
): Promise<{ orgUserId: number | null; message?: string }> {
  const org = await getOrg(user, id);

  if (org?.orgType === "USER_SPACE") {
    throw new Error("User-scoped organizations can only have a single user");
  }

  const orgUser = await prisma.orgUser.findFirst({
    where: {
      userId: user.id,
      orgId: id,
      role: "ADMIN",
    },
  });

  if (!orgUser) {
    throw new Error(
      "Current user needs to be an administrator an organization to invite more people."
    );
  }

  if (!sendGridClient) {
    throw new Error("Email sending issue");
  }

  const emailUser = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (!emailUser) {
    try {
      const invitation = await createInvitation({
        email: data.email,
        role: data.role as UserOrgRole,
        orgId: id,
      });
      const invitationUrl = `${baseUrl}/auth/${invitation.id}`;
      await sendGridClient.send({
        from: "info@bigdataboutique.com",
        to: data.email,
        subject: `${user.name} invited you to collaborate on Sierra`,
        html: `<html><body>
<p>Hi there,</p>
<p>
${
  user.name
} invited you to collaborate on search relevance engeineering projects on Sierra, in the <b>${
          org!.name
        }</b> organization.
</p>
<p>
To begin, sign up via <a href=${invitationUrl}>${invitationUrl}</a>.
</p>
</body></html>`,
      });
    } catch (err: any) {
      log.error(err.stack ?? err);

      const createdInvitation = await prisma.invitation.findFirst({
        where: {
          email: data.email,
          role: data.role as UserOrgRole,
          orgId: id,
        },
      });
      if (createdInvitation) await deleteInvitation(createdInvitation.id);
      throw err;
    }
    return {
      orgUserId: null,
      message: "Invitation sent",
    };
  }

  const emailOrgUser = await prisma.orgUser.findFirst({
    where: {
      userId: emailUser.id,
      orgId: id,
    },
  });

  if (emailOrgUser) {
    throw new Error("User already belongs to this organization");
  }

  const createdOrgUser = await prisma.orgUser.create({
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
  });

  try {
    await sendGridClient.send({
      from: "info@bigdataboutique.com",
      to: data.email,
      subject: `[Sierra] You were added to the ${org!.name} organization`,
      html: `<html><body>
<p>Hi there,</p>
<p>
${user.name} added you to the <b>${org!.name}</b> organization on Sierra.
</p>
<p>
Sign in via <a href=${baseUrl}>${baseUrl}</a>.
</p>
</body></html>`,
    });
  } catch (err: any) {
    log.error(err.stack ?? err);

    const createdInvitation = await prisma.invitation.findFirst({
      where: {
        email: data.email,
        role: data.role as UserOrgRole,
        orgId: id,
      },
    });
    if (createdInvitation) await deleteInvitation(createdInvitation.id);
    throw err;
  }

  return {
    orgUserId: createdOrgUser?.id,
    message: "User added",
  };
}

export async function getOrgUsers(user: User, id: string) {
  const orgUser = await prisma.orgUser.findFirst({
    where: {
      userId: user.id,
      orgId: id,
    },
  });

  if (!orgUser) {
    throw new Error("Current user doesn't belong to organization");
  }

  return await prisma.orgUser.findMany({
    where: {
      orgId: id,
    },
    include: {
      user: true,
    },
  });
}

export async function getOrgUserRole(
  user: User,
  id: string
): Promise<UserOrgRole | undefined> {
  return (
    await prisma.orgUser.findFirst({
      where: {
        orgId: id,
        userId: user.id,
      },
    })
  )?.role;
}

export function userCanAccessOrgAggregates(
  user: User,
  rest?: Prisma.ProjectWhereInput
): Prisma.ProjectWhereInput {
  const result: Prisma.ProjectWhereInput = {
    org: userCanAccessOrg(user),
  };
  if (rest) {
    result.AND = rest;
  }
  return result;
}

export async function getOrgAggregates(
  user: User,
  id: string
): Promise<OrgAggregates> {
  const usersCount = await prisma.orgUser.count({
    where: { orgId: id },
  });

  const projects = await prisma.project.findMany({
    where: userCanAccessOrgAggregates(user, { orgId: id }),
    include: {
      Execution: {
        take: 1,
        orderBy: [{ createdAt: "desc" }],
      },
    },
  });

  const executionDates = projects
    .filter((p) => p.Execution && p.Execution.length > 0)
    .map((p) => p.Execution[0])
    .map((e) => e.createdAt);
  let lastExecution = null;
  if (executionDates && executionDates.length > 0) {
    lastExecution = executionDates?.reduce((a, b) => (a > b ? a : b));
  }

  return {
    usersCount,
    projectsCount: projects.length,
    lastExecution: lastExecution?.toDateString()
      ? lastExecution?.toDateString()
      : null,
  };
}
