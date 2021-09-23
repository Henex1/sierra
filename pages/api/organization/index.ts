import { NextApiRequest, NextApiResponse } from "next";

import { apiHandler, requireMethod } from "../../../lib/apiServer";

export const handleCreateOrganization = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  // Todo
  res.status(200).send({});
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
