import _ from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { MockSearchResult } from "../../../lib/lab";
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
  getExecutionProject,
} from "../../../lib/execution";
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
    const project = await getExecutionProject(execution);
    const se = await getSearchEndpoint(user, project.searchEndpointId);
    if (!se) {
      throw new HttpError(500, { error: "search endpoint is not available" });
    }
    const speResults = spe.results as SearchPhraseExecutionResults;

    const iface = getQueryInterface(se);
    const docs = await iface.handleQueryDEPRECATED(
      JSON.stringify({
        query: {
          terms: {
            _id: speResults.map((h) => h.id),
          },
        },
      })
    );

    const byId = _.keyBy(docs.hits.hits, "_id");
    const results = speResults.map((r, i) => ({
      id: r.id,
      title: byId[r.id]?._source?.name ?? "Unavailable",
      description: byId[r.id]?._source?.short_description ?? "Unavailable",
      score: (10 - i) * 10,
      url: "https://example.com/products/0",
      matches: mockExplanation(r.explanation),
    }));

    return res.status(200).json(results);
  }
);
