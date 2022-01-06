import { NextApiRequest, NextApiResponse } from "next";

import {
  apiHandler,
  requireBody,
  requireMethod,
  requireQuery,
} from "../../../lib/apiServer";
import { CreateOrg, CreateOrgSchema } from "../../../lib/org/types/CreateOrg";
import { create, createOrgUser, getOrgUsers, update } from "../../../lib/org";
import { UpdateOrg, UpdateOrgSchema } from "../../../lib/org/types/UpdateOrg";
import * as z from "zod";
import { notAuthorized } from "../../../lib/errors";
import { uploadFileToGCS } from "../../../lib/gsc";
import { uid } from "uid";
import { NewOrgUserSchema } from "lib/org/types/NewOrgUser";

const getType = (s: string): string =>
  s.match(/[^:/]\w+(?=;|,)/)?.[0] as string;

const orgImage = async (
  orgId: string,
  org: CreateOrg | UpdateOrg
): Promise<string | null | undefined> => {
  // TODO use orgId for image name (thus overriding existing image) instead of randomizing
  return (
    org.image &&
    (await uploadFileToGCS(
      `org-${orgId}.${getType(org.image)}`,
      org.image,
      "avatars/",
      true
    ))
  );
};

export const handleCreateOrganization = apiHandler(async (req, res) => {
  requireMethod(req, "POST");

  const newOrg = requireBody(req, CreateOrgSchema);
  const user = req.user;

  if (!user) {
    return res.status(403).send({ error: "Unauthorized" });
  }

  // TODO maybe create the org then update image with the right orgId
  const image = (await orgImage(uid(18), newOrg)) ?? undefined;
  const orgId = await create(user, { ...newOrg, image });

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

  const image = await orgImage(id, newOrg);
  const orgId = await update(user, id, { ...newOrg, image });

  res.status(200).send({ orgId });
});

export const handleAddOrganizationUser = apiHandler(async (req, res) => {
  requireMethod(req, "POST");

  const { id } = requireQuery(req, z.object({ id: z.string().nonempty() }));
  const orgUser = requireBody(req, NewOrgUserSchema);
  const user = req.user;

  if (!user) {
    return notAuthorized(res);
  }

  const orgId = await createOrgUser(user, id, orgUser);

  res.status(200).send({ orgId });
});

export const handleGetOrganizationUsers = apiHandler(async (req, res) => {
  requireMethod(req, "GET");

  const { id } = requireQuery(req, z.object({ id: z.string().nonempty() }));
  const user = req.user;

  if (!user) {
    return notAuthorized(res);
  }

  const users = await getOrgUsers(user, id);

  res.status(200).send(users);
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
