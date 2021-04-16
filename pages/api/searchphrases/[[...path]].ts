import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { getProject } from "../../../lib/projects";
import {
  formatSearchPhrase,
  getSearchPhrase,
  createSearchPhraseSchema,
  createSearchPhrase,
  deleteSearchPhrase,
} from "../../../lib/searchphrases";
import {
  apiHandler,
  HttpError,
  requireMethod,
  requireUser,
  requireOnlyOrg,
  requireBody,
} from "../../../lib/apiServer";

const handleCreateSearchPhrase = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const input = requireBody(
    req,
    createSearchPhraseSchema.extend({
      projectId: z.number(),
    })
  );
  const project = await getProject(user, input.projectId);
  if (!project) {
    throw new HttpError(404, { error: "project not found" });
  }
  const phrase = await createSearchPhrase(project, input);
  res.status(200).json({ phrase: formatSearchPhrase(phrase) });
});

const handleDeleteSearchPhrase = apiHandler(async (req, res) => {
  requireMethod(req, "DELETE");
  const user = requireUser(req);
  const org = await requireOnlyOrg(req);
  const id = parseInt(req.query.path[0], 10);
  const phrase = await getSearchPhrase(user, id);
  if (!phrase) {
    throw new HttpError(404, { error: "search phrase not found" });
  }
  await deleteSearchPhrase(phrase);
  res.status(200).json({ success: true });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const method = req.method;
  const path = req.query.path || [];
  if (path.length === 0) {
    return handleCreateSearchPhrase(req, res);
  } else if (method === "DELETE" && path.length === 1) {
    return handleDeleteSearchPhrase(req, res);
  } else {
    return res.status(404).json({ error: "not found", method, path });
  }
}
