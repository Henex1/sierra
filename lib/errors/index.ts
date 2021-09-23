import { NextApiResponse, Redirect } from "next";
import { ErrorMessage } from "./constants";

export function notAuthorized(res: NextApiResponse) {
  res.status(401).json({ error: "not authorized" });
}

export function notFound(
  res: NextApiResponse,
  message = ErrorMessage.NotFound
) {
  res.status(404).json({ error: message });
}

export function redirectToLogin(): { redirect: Redirect } {
  return {
    redirect: {
      permanent: false,
      destination: `/api/auth/signin`,
    },
  };
}
