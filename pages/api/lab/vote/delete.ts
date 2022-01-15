import { NextApiResponse } from "next";
import * as z from "zod";
import { notFound } from "../../../../lib/errors";
import { ErrorMessage } from "../../../../lib/errors/constants";
import {
  getVote,
  getJudgement,
  updateJudgement,
  getJudgementForSearchConfiguration,
  setVotes,
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
    const { voteId, phrase, searchConfigurationId } = requireBody(
      req,
      z.object({
        voteId: z.number(),
        phrase: z.string(),
        searchConfigurationId: z.string(),
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

    const vote = await getVote(voteId);
    if (!vote) {
      return notFound(res, ErrorMessage.VoteNotFound);
    }

    await updateJudgement(j, { updatedAt: new Date() });

    await setVotes(j, {
      [phrase]: {
        [vote.documentId]: null,
      },
    });

    return res.status(200).json({});
  }
);
