import { NextApiResponse } from "next";
import * as z from "zod";
import {
  apiHandler,
  requireBody,
  requireQuery,
  requireUser,
  SierraApiRequest,
} from "../../../../lib/apiServer";
import {
  getExecution,
  getJudgementsForPhrase,
  getSearchPhraseExecution,
} from "../../../../lib/execution";
import { getExecutionSearchConfiguration } from "../../../../lib/searchconfigurations";
import { notFound } from "../../../../lib/errors";
import { ErrorMessage } from "../../../../lib/errors/constants";

export default apiHandler(
  async (req: SierraApiRequest, res: NextApiResponse): Promise<void> => {
    const { id } = requireQuery(req, z.object({ id: z.number() }), (query) => ({
      id: parseInt(query.id as string),
    }));
    const { documentId } = requireBody(
      req,
      z.object({ documentId: z.string() })
    );

    const user = requireUser(req);
    const spe = await getSearchPhraseExecution(user, id);
    if (!spe) {
      return notFound(res, ErrorMessage.SearchPhraseExecutionNotFound);
    }
    const execution = await getExecution(user, spe.executionId);
    if (!execution) {
      return notFound(res, ErrorMessage.ExecutionNotFound);
    }
    const config = await getExecutionSearchConfiguration(execution);

    const votes = await getJudgementsForPhrase(config, spe.phrase, documentId);

    return res.status(200).json(votes);
  }
);
