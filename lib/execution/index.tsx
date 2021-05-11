import _ from "lodash";

import prisma, {
  Prisma,
  User,
  Project,
  SearchEndpoint,
  SearchConfiguration,
  Execution,
  SearchPhraseExecution,
  JudgementSearchConfiguration,
  QueryTemplate,
  OffsetPagination,
} from "../prisma";
import { getQueryInterface, expandQuery } from "../searchendpoints";
import { userCanAccessSearchConfiguration } from "../searchconfigurations";

export type { Execution };

export type SearchPhraseExecutionResults = {
  id: string;
  explanation: object;
}[];

const executionSelect = {
  id: true,
  searchConfigurationId: true,
  meta: true,
  combinedScore: true,
  allScores: true,
};

export type ExposedExecution = Pick<Execution, keyof typeof executionSelect>;

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

export function formatExecution(val: Execution): ExposedExecution {
  return _.pick(val, _.keys(executionSelect)) as ExposedExecution;
}

export function formatSearchPhraseExecution(
  val: SearchPhraseExecution
): ExposedSearchPhraseExecution {
  return _.pick(val, _.keys(speSelect)) as ExposedSearchPhraseExecution;
}

export async function getExecution(
  user: User,
  executionId: number
): Promise<Execution | null> {
  const execution = await prisma.execution.findFirst({
    where: { searchConfiguration: userCanAccessSearchConfiguration(user) },
  });
  return execution;
}

export async function getExecutionProject(
  execution: Execution
): Promise<Project> {
  const project = await prisma.project.findFirst({
    where: {
      queryTemplates: {
        some: {
          searchConfigurations: {
            some: { id: execution.searchConfigurationId },
          },
        },
      },
    },
  });
  return project!;
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

export async function getSearchPhrases(
  execution: Execution,
  { take = 20, skip = 0 }: OffsetPagination = {}
): Promise<SearchPhraseExecution[]> {
  const phrases = await prisma.searchPhraseExecution.findMany({
    where: { executionId: execution.id },
    orderBy: [{ phrase: "asc" }],
    take,
    skip,
  });
  return phrases;
}

export async function countSearchPhrases(
  execution: Execution
): Promise<number> {
  return await prisma.searchPhraseExecution.count({
    where: { executionId: execution.id },
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
    SELECT JP."phrase", V."documentId", SUM(JSP."weight" * V."score") / SUM(JSP."weight") AS "score"
    FROM "JudgementSearchConfiguration" AS JSP
    INNER JOIN "JudgementPhrase" AS JP
    ON JP."judgementId" = JSP."judgementId"
    INNER JOIN "Vote" AS V
    ON V."judgementPhraseId" = JP."id"
    WHERE JSP."searchConfigurationId" = ${config.id}
    GROUP BY JP."phrase", V."documentId"
    ORDER BY JP."phrase", V."documentId"
  `;
  return _.map(_.groupBy(results, "phrase"), (records, phrase) => ({
    phrase,
    results: records.map(({ documentId, score }) => [documentId, score]),
  }));
}

function mean(input: number[]): number {
  return input.reduce((a, b) => a + b) / input.length;
}

export async function createExecution(
  config: SearchConfiguration
): Promise<Execution> {
  const tpl = (await prisma.queryTemplate.findFirst({
    where: { searchConfigurations: { some: { id: config.id } } },
  }))!;
  const endpoint = (await prisma.searchEndpoint.findFirst({
    where: { projects: { some: { queryTemplates: { some: { id: tpl.id } } } } },
  }))!;
  const judgements = await getCombinedJudgements(config);
  const results: Prisma.SearchPhraseExecutionCreateWithoutExecutionInput[] = [];
  for (const j of judgements) {
    results.push(await newSearchPhraseExecution(endpoint, tpl, j));
  }
  const combinedScore = mean(results.map((r) => r.combinedScore));
  const scorers = results.length
    ? Object.keys(results[0].allScores as object)
    : [];
  const allScores = _.fromPairs(
    scorers.map((scorer) => [
      scorer,
      mean(results.map((r) => (r.allScores as any)[scorer])),
    ])
  );
  const execution = await prisma.execution.create({
    data: {
      searchConfigurationId: config.id,
      meta: {},
      combinedScore,
      allScores,
      phrases: { create: results },
    },
  });
  return execution;
}

async function newSearchPhraseExecution(
  endpoint: SearchEndpoint,
  tpl: QueryTemplate,
  jp: CombinedJudgementPhrase
): Promise<Prisma.SearchPhraseExecutionCreateWithoutExecutionInput> {
  const iface = getQueryInterface(endpoint);
  const query = await expandQuery(endpoint, tpl, [], undefined, jp.phrase);
  const queryResult = await iface.executeQuery(query);
  const allScores = {
    "ndcg@5": Math.random(),
    "ap@5": Math.random(),
    "p@5": Math.random(),
  };
  const combinedScore = Object.values(allScores).reduce((a, b) => a + b) / 3;
  return {
    phrase: jp.phrase,
    tookMs: queryResult.tookMs,
    totalResults: queryResult.totalResults,
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
