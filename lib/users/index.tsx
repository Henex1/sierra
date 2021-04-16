import prisma, { User, Org } from "../prisma";

export async function setUserActiveOrg(
  user: User,
  activeOrg: Org | null
): Promise<void> {
  await prisma.user.update({
    where: { id: user.id },
    data: { activeOrgId: activeOrg?.id || null },
  });
}
