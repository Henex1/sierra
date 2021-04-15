import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { getOrg } from "../../../lib/org";
import { setUserActiveOrg } from "../../../lib/users";
import {
  HttpError,
  apiHandler,
  requireMethod,
  requireUser,
  requireBody,
} from "../../../lib/apiServer";

export default apiHandler(async (req, res) => {
  requireMethod(req, "PATCH");
  const user = requireUser(req);
  const body = requireBody(
    req,
    z.object({
      activeOrgId: z.number(),
    })
  );
  const org = await getOrg(user, body.activeOrgId);
  if (!org) {
    throw new HttpError(404, { error: "org not found" });
  }
  await setUserActiveOrg(user, org);
  res.status(200).json({ success: true });
});
