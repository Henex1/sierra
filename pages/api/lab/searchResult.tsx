import _ from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import {
  apiHandler,
  HttpError,
  requireUser,
  requireQuery,
} from "../../../lib/apiServer";
import {
  SearchPhraseExecutionResults,
  getExecution,
  getSearchPhraseExecution,
  getExecutionSearchConfiguration,
  getCombinedJudgementForPhrase,
} from "../../../lib/execution";
import { getSearchConfigurationProject } from "../../../lib/searchconfigurations";
import {
  getSearchEndpoint,
  getQueryInterface,
} from "../../../lib/searchendpoints";
import explanationSample from "./explanationSample.json";

function mockExplanation(explanation: any) {
  const queue = [explanation];
  const scores: { name: string; score: number }[] = [];
  while (queue.length > 0) {
    const row = queue.shift();
    scores.push({ name: row.description, score: row.value });
    if (row.details) {
      queue.splice(queue.length, 0, ...row.details);
    }
  }
  const totalScore = scores.reduce((result, item) => {
    return result + item.score;
  }, 0);

  return {
    scores,
    explanation: {
      summary:
        `${totalScore} Sum of the following:\n` +
        scores.map((item) => `\n${item.score} ${item.name}\n`).join(""),
      json: explanationSample,
    },
  };
}

export default apiHandler(
  async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const { id } = requireQuery(req, z.object({ id: z.number() }), (query) => ({
      id: parseInt(query.id as string),
    }));

    const user = requireUser(req);
    const spe = await getSearchPhraseExecution(user, id);
    if (!spe) {
      throw new HttpError(404, { error: "seaarch phrase execution not found" });
    }
    const execution = await getExecution(user, spe.executionId);
    if (!execution) {
      throw new HttpError(404, { error: "execution not found" });
    }
    const config = await getExecutionSearchConfiguration(execution);
    const project = await getSearchConfigurationProject(config);
    const se = await getSearchEndpoint(user, project.searchEndpointId);
    if (!se) {
      throw new HttpError(500, { error: "search endpoint is not available" });
    }
    const speResults = spe.results as SearchPhraseExecutionResults;
    const docIds = speResults.map((h) => h.id);
    const scores = await getCombinedJudgementForPhrase(
      config,
      spe.phrase,
      docIds
    );

    const iface = getQueryInterface(se);
    const docs = await iface.getDocumentsByID(docIds);
    const byId = _.keyBy(docs, "_id");
    const results = speResults.map((r) => ({
      id: r.id,
      title: byId[r.id]?._source?.name ?? "Unavailable",
      description: byId[r.id]?._source?.short_description ?? "Unavailable",
      score: scores.results.find((s) => s[0] === r.id)?.[1],
      url: "https://example.com/products/0",
      matches: mockExplanation(r.explanation),
    }));

    return res.status(200).json(results);
  }
);
