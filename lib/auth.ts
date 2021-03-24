import { ParsedUrlQuery } from "querystring";
import { IncomingMessage } from "http";
import {
  NextApiResponse,
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { Session, getSession } from "next-auth/client";

import prisma, { User } from "./prisma";
import { redirectToLogin } from "./errors";

export type ValidUserSession = {
  session: Session;
  user: User;
};

export type UserSession = Partial<ValidUserSession>;

export async function getUser(req: IncomingMessage): Promise<UserSession> {
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

// This is the main way to lock access to pages. It wraps a normal
// getServerSideProps function, but if the user isn't logged in they will
// automatically be redirected to the login page. The getServerSideProps
// function will additionally have access to context.session and context.user.
export function authenticatedPage<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery
>(
  callback?: (
    context: GetServerSidePropsContext<Q> & ValidUserSession
  ) => Promise<GetServerSidePropsResult<P>>
): GetServerSideProps<P, Q> {
  return async (context) => {
    const session = await getUser(context.req);
    if (!session.user) {
      return redirectToLogin(context.req);
    }
    return callback
      ? callback({ ...context, ...(session as any) })
      : { props: {} as any };
  };
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
