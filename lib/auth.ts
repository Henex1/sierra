import { ParsedUrlQuery } from "querystring";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";

import { redirectToLogin } from "./errors";
import { getUser, ValidUserSession } from "./authServer";

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
