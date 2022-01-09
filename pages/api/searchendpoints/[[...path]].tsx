import { NextApiRequest, NextApiResponse } from "next";

import {
  formatSearchEndpoint,
  createSearchEndpointSchema,
  createSearchEndpoint,
  deleteSearchEndpoint,
  updateSearchEndpointSchema,
  updateSearchEndpoint,
} from "../../../lib/searchendpoints";
import {
  apiHandler,
  requireMethod,
  requireUser,
  requireBody,
} from "../../../lib/apiServer";

const handleCreateSearchEndpoint = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const body = requireBody(req, createSearchEndpointSchema);
  const se = await createSearchEndpoint(user, body);
  res.status(200).json({ searchEndpoint: se });
});

const handleDeleteSearchEndpoint = apiHandler(async (req, res) => {
  requireMethod(req, "DELETE");
  const user = requireUser(req);
  try {
    await deleteSearchEndpoint(user, req.query.path[0]);
    res.status(200).json({ success: true });
  } catch (e: any) {
    res.status(e.statusCode).json(e.data);
  }
});

const handleUpdateSearchEndpoint = apiHandler(async (req, res) => {
  requireMethod(req, "PATCH");
  const user = requireUser(req);
  req.body.id = req.query.path[0];
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
