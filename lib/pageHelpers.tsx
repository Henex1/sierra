import * as z from "zod";
import { ParsedUrlQuery } from "querystring";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";

import { redirectToLogin } from "./errors";
import { getUser, ValidUserSession } from "./authServer";
import { Org } from "./prisma";
import { getActiveOrg } from "./org";

export class RedirectError extends Error {
  constructor(public dest: string) {
    super(`Redirect to ${dest}`);
    this.name = "RedirectError";
  }
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
  return async (context): Promise<GetServerSidePropsResult<P>> => {
    const session = await getUser(context.req);
    if (!session.user) {
      return redirectToLogin(context.req);
    }
    try {
      return callback
        ? callback({ ...context, ...(session as any) })
        : { props: {} as any };
    } catch (err) {
      if (err instanceof RedirectError) {
        return { redirect: { destination: err.dest, permanent: false } };
      } else {
        throw err;
      }
    }
  };
}

export function requireNumberParam<P extends ParsedUrlQuery>(
  context: GetServerSidePropsContext<P>,
  name: keyof P
): number {
  const str = context.params?.[name];
  if (Array.isArray(str)) {
    throw new Error(`Param ${name} is an array; expected single item`);
  }
  const num = str ? parseInt(str as string, 10) : NaN;
  if (isNaN(num)) {
    throw new Error(`Param ${name} is not a number`);
  }
  return num;
}

// Returns the active Org for the current User, and fails if they don't have
// one.
export async function requireActiveOrg(
  context: ValidUserSession
): Promise<Org> {
  const activeOrgId = context.user.activeOrgId;
  const activeOrg = await getActiveOrg(context.user);
  if (!activeOrg) {
    throw new RedirectError("/me/active-org");
  }
  return activeOrg;
}
