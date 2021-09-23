import _ from "lodash";
import { NextApiResponse } from "next";
import * as z from "zod";

import {
  apiHandler,
  requireUser,
  requireQuery,
  SierraApiRequest,
} from "../../../lib/apiServer";
import {
  SearchPhraseExecutionResults,
  getExecution,
  getSearchPhraseExecution,
  getCombinedJudgementForPhrase,
} from "../../../lib/execution";
import {
  getSearchConfigurationProject,
  getExecutionSearchConfiguration,
} from "../../../lib/searchconfigurations";
import {
  getSearchEndpoint,
  getQueryInterface,
} from "../../../lib/searchendpoints";
import { notFound } from "../../../lib/errors";
import { ErrorMessage } from "../../../lib/errors/constants";
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
  async (req: SierraApiRequest, res: NextApiResponse): Promise<void> => {
    const { id } = requireQuery(req, z.object({ id: z.number() }), (query) => ({
      id: parseInt(query.id as string),
    }));

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
    const project = await getSearchConfigurationProject(config);
    const se = await getSearchEndpoint(user, project.searchEndpointId);
    if (!se) {
      return notFound(res, ErrorMessage.SearchEndpointNotFound);
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
    const byId = _.keyBy(docs, se.resultId);
    const results = speResults.map((r) => ({
      id: r.id,
      ...getValueByDisplayFields(byId[r.id]?._source, se.displayFields),
      score: scores.results.find((s) => s[0] === r.id)?.[1],
      matches: mockExplanation(r.explanation),
    }));

    return res.status(200).json(results);
  }
);

export type FieldObject = { [key: string]: string | number | boolean };

function getValueByDisplayFields(
  result: FieldObject,
  displayFields: string[]
): FieldObject {
  const fields: FieldObject = {};
  for (const field of displayFields) {
    const prefixField = field.split(":");
    if (prefixField.length > 1) {
      fields[prefixField[1]] = result[prefixField[1]];
    } else {
      fields[field] = result[field];
    }
  }
  return fields;
}
