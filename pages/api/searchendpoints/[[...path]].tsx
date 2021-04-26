import { NextApiRequest, NextApiResponse } from "next";

import prisma, { User, SearchEndpoint } from "../../../lib/prisma";
import { SearchEndpointSchema } from "../../../lib/schema";
import {
  formatSearchEndpoint,
  createSearchEndpointSchema,
  createSearchEndpoint,
  deleteSearchEndpoint,
  updateSearchEndpointSchema,
  updateSearchEndpoint,
} from "../../../lib/searchendpoints";
import { notAuthorized } from "../../../lib/errors";
import {
  HttpError,
  apiHandler,
  requireMethod,
  requireUser,
  requireOnlyOrg,
  requireBody,
} from "../../../lib/apiServer";

const handleCreateSearchEndpoint = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const org = await requireOnlyOrg(req);
  req.body.orgId = org.id;
  const body = requireBody(req, createSearchEndpointSchema);
  const se = await createSearchEndpoint(user, body);
  res.status(200).json({ searchEndpoint: se });
});

const handleDeleteSearchEndpoint = apiHandler(async (req, res) => {
  requireMethod(req, "DELETE");
  const user = requireUser(req);
  const org = await requireOnlyOrg(req);
  const id = parseInt(req.query.path[0], 10);
  await deleteSearchEndpoint(user, id);
  res.status(200).json({ success: true });
});

const handleUpdateSearchEndpoint = apiHandler(async (req, res) => {
  requireMethod(req, "PATCH");
  const user = requireUser(req);
  req.body.id = parseInt(req.query.path[0], 10);
  const body = requireBody(req, updateSearchEndpointSchema);
  const se = await updateSearchEndpoint(user, body);
  res.status(200).json({ searchEndpoint: formatSearchEndpoint(se) });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const method = req.method;
  const path = req.query.path || [];
  if (path.length === 0) {
    return handleCreateSearchEndpoint(req, res);
  } else if (method === "DELETE" && path.length === 1) {
    return handleDeleteSearchEndpoint(req, res);
  } else if (method === "PATCH" && path.length === 1) {
    return handleUpdateSearchEndpoint(req, res);
  } else {
    return res.status(404).json({ error: "not found", method, path });
  }
}
