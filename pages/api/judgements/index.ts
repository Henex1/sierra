import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { getProject } from "../../../lib/projects";
import {
  formatJudgement,
  getJudgement,
  createJudgementSchema,
  createJudgement,
  updateJudgementSchema,
  updateJudgement,
  setVotesSchema,
  setVotes,
} from "../../../lib/judgements";
import {
  apiHandler,
  HttpError,
  requireMethod,
  requireUser,
  requireBody,
} from "../../../lib/apiServer";

export const handleCreateJudgement = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { projectId, ...input } = requireBody(
    req,
    createJudgementSchema.extend({
      projectId: z.number(),
    })
  );
  const project = await getProject(user, projectId);
  if (!project) {
    throw new HttpError(404, { error: "project not found" });
  }
  const judgement = await createJudgement(project, input);
  res.status(200).json({ judgement: formatJudgement(judgement) });
});

export const handleUpdateJudgement = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { id, ...input } = requireBody(
    req,
    updateJudgementSchema.extend({
      id: z.number(),
    })
  );
  const judgement = await getJudgement(user, id);
  if (!judgement) {
    throw new HttpError(404, { error: "judgement not found" });
  }
  const updated = await updateJudgement(judgement, input);
  res.status(200).json({ judgement: formatJudgement(updated) });
});

export const handleSetVotes = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { id, votes } = requireBody(
    req,
    z.object({
      id: z.number(),
      votes: setVotesSchema,
    })
  );
  const judgement = await getJudgement(user, id);
  if (!judgement) {
    throw new HttpError(404, { error: "judgement not found" });
  }
  const updated = await setVotes(judgement, votes);
  res.status(200).json({ success: true });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
