import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { createExecution, formatExecution } from "../../../lib/execution";
import { getSearchConfiguration } from "../../../lib/searchconfigurations";
import {
  apiHandler,
  HttpError,
  requireMethod,
  requireUser,
  requireOnlyOrg,
  requireBody,
} from "../../../lib/apiServer";

export const handleExecute = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const org = await requireOnlyOrg(req);
  const input = requireBody(req, z.object({ id: z.number() }));
  const sc = await getSearchConfiguration(user, input.id);
  if (!sc) {
    throw new HttpError(404, { error: "search configuration not found" });
  }
  const execution = await createExecution(sc);
  res.status(200).json({ execution: formatExecution(execution) });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
