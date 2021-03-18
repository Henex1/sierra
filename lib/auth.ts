import { NextApiRequest } from "next";
import { Session, getSession } from "next-auth/client";
import prisma, { User } from "./prisma";

type UserSession = {
  session?: Session;
  user?: User;
};

export async function getUser(req: NextApiRequest): Promise<UserSession> {
  const session = await getSession({ req });
  if (!session) {
    return {};
  }
  const userId = (session.user as any)?.id;
  if (!userId) {
    return { session };
  }
  const user =
    (await prisma.user.findUnique({
      where: { id: userId },
    })) ?? undefined;
  return { session, user };
}

export async function userCanModifyOrg(
  userId: number,
  orgId: number
): Promise<boolean> {
  const orgUser = await prisma.orgUser.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });
  if (!orgUser) return false;
  return true;
}
