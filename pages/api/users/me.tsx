import * as z from "zod";

import { getOrg } from "../../../lib/org";
import { setUserActiveOrg } from "../../../lib/users";
import {
  apiHandler,
  requireMethod,
  requireUser,
  requireBody,
} from "../../../lib/apiServer";
import { notFound } from "../../../lib/errors";
import { ErrorMessage } from "../../../lib/errors/constants";

export default apiHandler(async (req, res) => {
  requireMethod(req, "PATCH");
  const user = requireUser(req);
  const body = requireBody(
    req,
    z.object({
      activeOrgId: z.string(),
    })
  );
  const org = await getOrg(user, body.activeOrgId);
  if (!org) {
    return notFound(res, ErrorMessage.OrganisationNotFound);
  }
  await setUserActiveOrg(user, org);
  res.status(200).json({ success: true });
});
