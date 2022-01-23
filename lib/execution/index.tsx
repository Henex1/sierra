import _ from "lodash";

import * as log from "../logging";
import prisma, {
  Execution,
  OffsetPagination,
  Prisma,
  QueryTemplate,
  RulesetVersion,
  SearchConfiguration,
  SearchEndpoint,
  SearchPhraseExecution,
  User,
} from "../prisma";
import {
  getQueryInterface,
  expandQuery,
  QueryInterface,
  QueryResult,
} from "../searchendpoints";
import { userCanAccessSearchConfiguration } from "../searchconfigurations";
import { SortOptions, ShowOptions } from "../lab";
import { ExpandedQuery } from "../searchendpoints/queryexpander";
import * as recall_scorers from "../scorers/recall";
import * as cg_scorers from "../scorers/ndcg";
import * as rr_scorers from "../scorers/reciprocalRank";
import * as precision_scorers from "../scorers/precision";
import { percentiles } from "../math";
import { isNotEmpty } from "../../utils/array";

export type { Execution };

export type SearchPhraseExecutionResults = {
  id: string;
  explanation: Record<string, unknown>;
}[];

const executionSelect = {
  id: true,
  searchConfigurationId: true,
  meta: true,
  combinedScore: true,
  allScores: true,
  createdAt: true,
};

export type ExposedExecution = Omit<
  Pick<Execution, keyof typeof executionSelect>,
  "createdAt"
> & {
  createdAt: string;
};

const speSelect = {
  id: true,
  executionId: true,
  phrase: true,
  totalResults: true,
  results: true,
  combinedScore: true,
  allScores: true,
};

export type ExposedSearchPhraseExecution = Pick<
  SearchPhraseExecution,
  keyof typeof speSelect
>;

export type ExecutionUpdateInput = {
  searchConfigurationId?: string;
};

export function formatExecution(val: Execution): ExposedExecution {
  return _.pick(
    { ...val, createdAt: val.createdAt.toString() },
    _.keys(executionSelect)
  ) as ExposedExecution;
}

export function formatSearchPhraseExecution(
  val: SearchPhraseExecution
): ExposedSearchPhraseExecution {
  return _.pick(val, _.keys(speSelect)) as ExposedSearchPhraseExecution;
}

export async function getExecution(
  user: User,
  id: string
): Promise<Execution | null> {
  const execution = await prisma.execution.findFirst({
    where: { id, searchConfiguration: userCanAccessSearchConfiguration(user) },
  });
  return execution;
}

export async function getCurrentExecution(
  user: User,
  sc: SearchConfiguration | null,
  executionId?: string
): Promise<Execution | null> {
  // Current execution
  let currentExecution = null;
  if (executionId) {
    currentExecution = await getExecution(user, executionId as string);
  } else if (sc) {
    currentExecution = await getLatestExecution(sc);
  }

  return currentExecution;
}

export async function getLatestExecution(
  sc: SearchConfiguration
): Promise<Execution | null> {
  const execution = await prisma.execution.findFirst({
    where: { searchConfigurationId: sc.id },
    orderBy: [{ createdAt: "desc" }],
  });
  return execution;
}

export async function listExecutions(projectId: string): Promise<Execution[]> {
  const execution = await prisma.execution.findMany({
    where: { projectId },
    orderBy: [{ createdAt: "desc" }],
    take: 10,
  });
  return execution;
}

const sortMapping: Record<
  SortOptions,
  Prisma.SearchPhraseExecutionOrderByInput
> = {
  "search-phrase-asc": { phrase: "asc" },
  "search-phrase-desc": { phrase: "desc" },
  "score-asc": { combinedScore: "asc" },
  "score-desc": { combinedScore: "desc" },
  "errors-asc": { error: "asc" },
  "errors-desc": { error: "asc" },
  "search-results-asc": { totalResults: "asc" },
  "search-results-desc": { totalResults: "desc" },
};

const filterMapping: Record<
  ShowOptions,
  Prisma.SearchPhraseExecutionWhereInput
> = {
  all: {},
  "no-errors": { error: null },
  "errors-only": { error: { not: null } },
  "have-results": { totalResults: { gt: 0 } },
  "no-results": { totalResults: 0 },
};

type GetSearchPhraseOptions = OffsetPagination & {
  sort?: SortOptions;
  filter?: ShowOptions;
  search?: string;
};

export async function getSearchPhrases(
  execution: Execution,
  {
    take = 20,
    skip = 0,
    sort = "search-phrase-asc",
    filter = "all",
    search,
  }: GetSearchPhraseOptions = {}
): Promise<SearchPhraseExecution[]> {
  const phrases = await prisma.searchPhraseExecution.findMany({
    where: {
      executionId: execution.id,
      AND: filterMapping[filter] ?? {},
      ...(search ? { phrase: { contains: search } } : {}),
    },
    orderBy: [sortMapping[sort]].filter(_.identity).concat([{ phrase: "asc" }]),
    take,
    skip,
  });
  return phrases;
}

export async function countSearchPhrases(
  execution: Execution,
  filter: ShowOptions,
  search: string | undefined
): Promise<number> {
  return await prisma.searchPhraseExecution.count({
    where: {
      executionId: execution.id,
      ...(search ? { phrase: { contains: search } } : {}),
      ...(filterMapping[filter] ?? {}),
    },
  });
}

export type CombinedJudgementPhrase = {
  phrase: string;
  // Ordered list of [document ID, score] for this phrase
  results: [string, number][];
};

// getCombinedJudgements returns the aggregated score for all judged documents
// enabled on the given SearchConfiguration. Handles weighting the judgements.
export async function getCombinedJudgements(
  config: SearchConfiguration
): Promise<CombinedJudgementPhrase[]> {
  const results = await prisma.$queryRaw`
    SELECT JP."phrase", V."documentId", SUM(JSC."weight" * V."score") / SUM(JSC."weight") AS "score"
    FROM "JudgementSearchConfiguration" AS JSC
    INNER JOIN "JudgementPhrase" AS JP
    ON JP."judgementId" = JSC."judgementId"
    LEFT JOIN "Vote" AS V
    ON V."judgementPhraseId" = JP."id"
    WHERE JSC."searchConfigurationId" = ${config.id}
    GROUP BY JP."phrase", V."documentId"
    ORDER BY JP."phrase", V."documentId"
  `;
  // If documentId is NULL< it means there are no judgements for this phrase,
  // but we still need to return it to get the unjudged results.
  return _.map(_.groupBy(results, "phrase"), (records, phrase) => ({
    phrase,
    results: records[0]?.documentId
      ? records.map(({ documentId, score }) => [documentId, score])
      : [],
  }));
}

export async function getCombinedJudgementForPhrase(
  config: SearchConfiguration,
  phrase: string,
  documentIds?: string[]
): Promise<CombinedJudgementPhrase> {
  const results: Array<{
    documentId: string;
    score: number;
  }> = await prisma.$queryRaw`
    SELECT V."documentId", SUM(JSC."weight" * V."score") / SUM(JSC."weight") AS "score"
    FROM "JudgementSearchConfiguration" AS JSC
    INNER JOIN "JudgementPhrase" AS JP
    ON JP."judgementId" = JSC."judgementId"
    INNER JOIN "Vote" AS V
    ON V."judgementPhraseId" = JP."id"
    WHERE JSC."searchConfigurationId" = ${config.id}
    AND JP."phrase" = ${phrase}
    ${
      documentIds?.length
        ? Prisma.sql`AND V."documentId" IN (${Prisma.join(documentIds)})`
        : Prisma.empty
    }
    GROUP BY V."documentId"
    ORDER BY V."documentId"
  `;
  if (results.length === 0) {
    return { phrase, results: [] };
  }
  return {
    phrase,
    results: results.map(({ documentId, score }) => [documentId, score]),
  };
}

function mean(input: [number, ...number[]]): number {
  return input.reduce((a, b) => a + b) / input.length;
}

export async function getJudgementsForPhrase(
  config: SearchConfiguration,
  phrase: string,
  documentId: string
): Promise<{
  phrase: string;
  votes: Array<{ name?: string; score?: number }>;
}> {
  const votes: Array<{
    id: number;
    name: string;
    score: number;
  }> = await prisma.$queryRaw`
    SELECT V."id" as "id", J."name", JSC."weight" * V."score" AS "score"
    FROM "JudgementSearchConfiguration" AS JSC
    INNER JOIN "JudgementPhrase" AS JP
    ON JP."judgementId" = JSC."judgementId"
    INNER JOIN "Vote" AS V
    ON V."judgementPhraseId" = JP."id"
    AND V."documentId" = ${documentId}
    INNER JOIN "Judgement" AS J
    ON J."id" = JSC."judgementId"
    WHERE JSC."searchConfigurationId" = ${config.id}
    AND JP."phrase" = ${phrase}
    ORDER BY V."documentId"
  `;

  return {
    phrase,
    votes,
  };
}

export async function updateExecution(id: string, data: ExecutionUpdateInput) {
  const updated = await prisma.execution.update({
    where: { id },
    data,
  });

  return updated;
}

export async function createExecution(
  config: SearchConfiguration,
  projectId: string
): Promise<Execution> {
  const tpl = (await prisma.queryTemplate.findFirst({
    where: { searchConfigurations: { some: { id: config.id } } },
  }))!;
  const endpoint = (await prisma.searchEndpoint.findFirst({
    where: { projects: { some: { queryTemplates: { some: { id: tpl.id } } } } },
  }))!;
  const rv = await prisma.rulesetVersion.findMany({
    where: { searchConfigurations: { some: { id: config.id } } },
  });
  const iface = getQueryInterface(endpoint);
  const testConnection = await iface.testConnection();
  if (!testConnection.success) {
    throw {
      message: testConnection.message,
      errno: testConnection.errno,
    };
  }
  try {
    const testPhraseExecution = await newSearchPhraseExecution(
      {},
      endpoint,
      tpl,
      rv,
      { phrase: "testing test", results: [] }
    );
    if (testPhraseExecution.error) {
      throw new Error(testPhraseExecution.error);
    }
  } catch (error: any) {
    throw new Error(error.message ?? error);
  }
  const judgements = await getCombinedJudgements(config);
  const results: Prisma.SearchPhraseExecutionCreateWithoutExecutionInput[] = [];
  const failedQueryExecutions: { [key: string]: number } = {};
  for (const j of judgements) {
    results.push(
      await newSearchPhraseExecution(
        failedQueryExecutions,
        endpoint,
        tpl,
        rv,
        j
      )
    );
  }

  const combinedNumbers = results
    .map((r) => r.combinedScore)
    .filter(_.isNumber);

  const combinedScore = isNotEmpty(combinedNumbers) ? mean(combinedNumbers) : 0;
  const scorers = Object.keys(results.find((x) => x)?.allScores ?? {}) ?? [];

  const allScores = _.fromPairs(
    scorers.map((scorer) => {
      const allScoresNumbers = results
        .map((r) => (r.allScores as Record<string, number> | null)?.[scorer])
        .filter(_.isNumber);
      return [
        scorer,
        isNotEmpty(allScoresNumbers) ? mean(allScoresNumbers) : 0,
      ];
    })
  );
  const [tookP50, tookP95, tookP99] = percentiles(
    results,
    [0.5, 0.95, 0.99],
    (r) => r.tookMs
  );
  return await prisma.execution.create({
    data: {
      searchConfigurationId: config.id,
      projectId,
      meta: { tookP50, tookP95, tookP99 },
      combinedScore,
      allScores,
      phrases: { create: results },
    },
  });
}

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function executeQuery(
  iface: QueryInterface,
  query: ExpandedQuery,
  failedExecutions: { [key: string]: number },
  phrase: string
) {
  let queryResult: QueryResult;
  try {
    queryResult = await iface.executeQuery(query);
    return queryResult;
  } catch (error: any) {
    failedExecutions[phrase] = (failedExecutions[phrase] ?? 0) + 1;
    if (failedExecutions[phrase] >= 4) {
      log.error(
        "Failed to create search phrase execution: " + (error.stack ?? error)
      );
      return {
        tookMs: 0,
        totalResults: 0,
        results: [],
        error: error.message ?? error,
      };
    }
    log.info(
      `Execution for "${phrase}" failed [${failedExecutions[phrase]}]. Retrying...`
    );
    await sleep(failedExecutions[phrase] * 1000);
    queryResult = await executeQuery(iface, query, failedExecutions, phrase);
    return queryResult;
  }
}

async function newSearchPhraseExecution(
  failedQueryExecutions: { [key: string]: number },
  endpoint: SearchEndpoint,
  tpl: QueryTemplate,
  rv: RulesetVersion[],
  jp: CombinedJudgementPhrase
): Promise<Prisma.SearchPhraseExecutionCreateWithoutExecutionInput> {
  const iface = getQueryInterface(endpoint);
  let queryResult;
  try {
    const query = await expandQuery(endpoint, tpl, rv, undefined, jp.phrase);
    queryResult = await executeQuery(
      iface,
      query,
      failedQueryExecutions,
      jp.phrase
    );
  } catch (error: any) {
    log.error(error.stack ?? error);

    queryResult = {
      tookMs: 0,
      totalResults: 0,
      results: [],
      error: error.message ?? error,
    };
  }
  const first10ResultIds = queryResult.results.slice(0, 10).map((r) => r.id);
  const allScores =
    jp.results.length > 0
      ? {
          "nDCG@10": cg_scorers.ndcgAt10(first10ResultIds, jp.results),
          "AP@10": precision_scorers.apAt10(first10ResultIds, jp.results),
          Recall: recall_scorers.recallAt10(first10ResultIds, jp.results, 3),
          "Reciprocal Rank": rr_scorers.reciprocalRank(
            first10ResultIds,
            jp.results,
            10,
            3
          ),
        }
      : null;

  const allScoresNumbers = allScores ? Object.values(allScores) : null;
  const combinedScore =
    allScoresNumbers && isNotEmpty(allScoresNumbers)
      ? mean(allScoresNumbers)
      : null;
  return {
    phrase: jp.phrase,
    tookMs: queryResult.tookMs,
    totalResults: queryResult.totalResults,
    error: queryResult.error,
    results: queryResult.results,
    combinedScore,
    allScores,
  };
}

export async function getSearchPhraseExecution(
  user: User,
  speId: number
): Promise<SearchPhraseExecution | null> {
  return await prisma.searchPhraseExecution.findFirst({
    where: {
      execution: {
        searchConfiguration: userCanAccessSearchConfiguration(user),
      },
      id: speId,
    },
  });
}
