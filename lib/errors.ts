import { NextApiResponse, Redirect } from "next";

export function notAuthorized(res: NextApiResponse) {
  res.status(401).json({ error: "not authorized" });
}

export function notFound(res: NextApiResponse) {
  res.status(404).json({ error: "not found" });
}

export function redirectToLogin(): { redirect: Redirect } {
  return {
    redirect: {
      permanent: false,
      destination: `/api/auth/signin`,
    },
  };
}
