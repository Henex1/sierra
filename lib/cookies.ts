import { NextApiRequest } from "next";
import jsHttpCookie from "cookie";

export const getCookies = (req: NextApiRequest) => {
  const cookies = jsHttpCookie.parse(req?.headers?.cookie || "");
  return cookies;
};
