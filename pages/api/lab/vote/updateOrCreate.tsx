import { NextApiResponse } from "next";
import * as z from "zod";
import { notFound } from "../../../../lib/errors";
import { ErrorMessage } from "../../../../lib/errors/constants";
import {
  createVote,
  getVote,
  updateVote,
  getJudgement,
  updateJudgement,
  getJudgementForSearchConfiguration,
  getJudgementPhrase,
} from "../../../../lib/judgements";
import { getSearchConfiguration } from "../../../../lib/searchconfigurations";
import {
  apiHandler,
  requireBody,
  requireMethod,
  SierraApiRequest,
  requireUser,
} from "../../../../lib/apiServer";

export default apiHandler(
  async (req: SierraApiRequest, res: NextApiResponse) => {
    requireMethod(req, "POST");
    const user = requireUser(req);
    const {
      searchConfigurationId,
      phrase,
      documentId,
      score,
      voteId,
    } = requireBody(
      req,
      z.object({
        voteId: z.number().optional(),
        searchConfigurationId: z.string(),
        phrase: z.string(),
        documentId: z.string(),
        score: z.number(),
      })
    );

    const sc = await getSearchConfiguration(user, searchConfigurationId);
    if (!sc) {
      return notFound(res, ErrorMessage.SearchConfigurationNotFound);
    }

    const jsc = await getJudgementForSearchConfiguration(sc);
    if (!jsc) {
      return notFound(res, ErrorMessage.JudgementNotFound);
    }

    const j = await getJudgement(user, jsc.judgementId);
    if (!j) {
      return notFound(res, ErrorMessage.JudgementNotFound);
    }

    await updateJudgement(j, { updatedAt: new Date() });

    if (voteId) {
      const vote = await getVote(voteId);
      if (!vote) {
        return notFound(res, ErrorMessage.VoteNotFound);
      }

      const updatedVote = await updateVote(vote, score);
      return res.status(200).json(updatedVote);
    }

    const jp = await getJudgementPhrase(j, phrase);
    if (!jp) {
      return notFound(res, ErrorMessage.JudgementNotFound);
    }

    const createdVote = await createVote(jp.id, documentId, score);
    return res.status(200).json(createdVote);
  }
);
