import prisma, { Prisma, UserOrgRole, Invitation } from "../prisma";
import { ChangeTypeOfKeys } from "../pageHelpers";

export type ExposedInvitation = ChangeTypeOfKeys<
  Invitation,
  "createdAt" | "updatedAt" | "expiresAt",
  string
>;

export function formatInvitation(val: Invitation): ExposedInvitation {
  return {
    ...val,
    createdAt: val.createdAt.toString(),
    updatedAt: val.updatedAt.toString(),
    expiresAt: val.expiresAt.toString(),
  };
}

export async function getInvitation(
  id: string,
  input: Prisma.InvitationWhereInput = {}
): Promise<Invitation | null> {
  const invitation = await prisma.invitation.findFirst({
    where: { id, ...input },
  });
  return invitation;
}

type CreateInvitationInput = {
  email: string;
  role?: UserOrgRole;
  expiresAt?: Date | string;
  orgId?: string;
};

export async function createInvitation({
  email,
  role,
  expiresAt,
  orgId,
}: CreateInvitationInput) {
  if (!expiresAt) {
    expiresAt = new Date(Date.now());
    expiresAt.setDate(expiresAt.getDate() + 14);
  }
  return await prisma.invitation.create({
    data: {
      expiresAt,
      email,
      role,
      orgId,
    },
  });
}

export async function deleteInvitation(id: string): Promise<void> {
  await prisma.invitation.delete({
    where: { id },
  });
}
