import { NextApiRequest, NextApiResponse } from "next";

import {
  apiHandler,
  requireBody,
  requireMethod,
  requireQuery,
} from "../../../lib/apiServer";
import { CreateOrgSchema } from "../../../lib/org/types/CreateOrg";
import { create, update } from "../../../lib/org";
import { UpdateOrgSchema } from "../../../lib/org/types/UpdateOrg";
import * as z from "zod";
import { notAuthorized } from "../../../lib/errors";

export const handleCreateOrganization = apiHandler(async (req, res) => {
  requireMethod(req, "POST");

  const newOrg = requireBody(req, CreateOrgSchema);
  const user = req.user;

  if (!user) {
    return res.status(403).send({ error: "Unauthorized" });
  }

  const orgId = await create(user, newOrg);

  res.status(200).send({ orgId });
});

export const handleUpdateOrganization = apiHandler(async (req, res) => {
  requireMethod(req, "POST");

  const { id } = requireQuery(req, z.object({ id: z.string().nonempty() }));
  const newOrg = requireBody(req, UpdateOrgSchema);
  const user = req.user;

  if (!user) {
    return notAuthorized(res);
  }

  const orgId = await update(user, id, newOrg);

  res.status(200).send({ orgId });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
