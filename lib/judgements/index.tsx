import _ from "lodash";
import * as z from "zod";
import csvParser from "csv-parse/lib/sync";

import prisma, {
  Prisma,
  PrismaPromise,
  User,
  Project,
  Judgement,
  JudgementPhrase,
  JudgementSearchConfiguration as BaseJudgementSearchConfiguration,
  Vote,
  SearchConfiguration,
} from "../prisma";
import { userCanAccessProject } from "../projects";
import { ChangeTypeOfKeys } from "../pageHelpers";
import { HttpError } from "../../lib/apiServer";
import { ErrorMessage } from "../../lib/errors/constants";

// Votes range from 0 to VOTE_MAX.
export const VOTE_MAX = 3;

export type JudgementSearchConfiguration = BaseJudgementSearchConfiguration & {
  judgement: Judgement;
};

const jSelectKeys = {
  id: true,
  projectId: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

const jpSelectKeys = {
  id: true,
  judgementId: true,
  phrase: true,
};

const vSelectKeys = {
  id: true,
  judgementPhraseId: true,
  documentId: true,
  score: true,
};

export type ExposedJudgement = Pick<
  ChangeTypeOfKeys<Judgement, "createdAt" | "updatedAt", string>,
  keyof typeof jSelectKeys
>;

export type ExposedJudgementExtendedMetadata = ExposedJudgement & {
  totalSearchPhrases: number;
  totalVotes: number;
};

export type ExposedJudgementPhrase = Pick<
  JudgementPhrase,
  keyof typeof jpSelectKeys
>;
export type ExposedVote = Pick<Vote, keyof typeof vSelectKeys>;

export function userCanAccessJudgement(
  user: User,
  rest?: Prisma.JudgementWhereInput
): Prisma.JudgementWhereInput {
  const result: Prisma.JudgementWhereInput = {
    project: userCanAccessProject(user),
  };
  if (rest) {
    result.AND = rest;
  }
  return result;
}

export function formatJudgement(val: Judgement): ExposedJudgement {
  const judgement = {
    ...val,
    updatedAt: val.updatedAt.toString(),
    createdAt: val.createdAt.toString(),
  };
  return _.pick(judgement, _.keys(judgement)) as ExposedJudgement;
}

export async function getJudgement(
  user: User,
  id: string
): Promise<Judgement | null> {
  const judgement = await prisma.judgement.findFirst({
    where: userCanAccessJudgement(user, { id }),
  });
  return judgement;
}

export async function getJudgementForSearchConfiguration(
  sc: SearchConfiguration
): Promise<JudgementSearchConfiguration | null> {
  const judgementSearchConfiguration = await prisma.judgementSearchConfiguration.findFirst(
    {
      where: {
        searchConfigurationId: sc.id,
      },
      include: { judgement: true },
    }
  );
  return judgementSearchConfiguration;
}

export async function listJudgements(project: Project): Promise<Judgement[]> {
  const judgements = await prisma.judgement.findMany({
    where: { projectId: project.id },
  });
  return judgements;
}

export async function listJudgementsExtended(
  project: Project
): Promise<ExposedJudgementExtendedMetadata> {
  return await prisma.$queryRaw`
    SELECT J.id, J.name, COUNT(DISTINCT JP.id) AS "totalSearchPhrases", COUNT(DISTINCT V.id) AS "totalVotes"
    FROM "Judgement" AS J
    LEFT JOIN "JudgementPhrase" JP
    ON J.id = JP."judgementId"
    LEFT JOIN "Vote" V
    ON JP.id = V."judgementPhraseId"
    WHERE J."projectId" = ${project.id}
    GROUP BY j.id, J.name
  `;
}

export const createJudgementSchema = z.object({
  name: z.string(),
});

export type CreateJudgement = z.infer<typeof createJudgementSchema>;

export async function createJudgement(
  project: Project,
  input: CreateJudgement
): Promise<Judgement> {
  const judgement = await prisma.judgement.create({
    data: {
      ...input,
      project: {
        connect: {
          id: project.id,
        },
      },
    },
  });
  return judgement;
}

export const updateJudgementSchema = createJudgementSchema
  .partial()
  .extend({ updatedAt: z.date().optional() });

export type UpdateJudgement = z.infer<typeof updateJudgementSchema>;

export async function updateJudgement(
  judgement: Judgement,
  input: UpdateJudgement
): Promise<Judgement> {
  const updated = await prisma.judgement.update({
    where: { id: judgement.id },
    data: { ...input },
  });
  return updated;
}

export async function getJudgementPhrase(judgement: Judgement, phrase: string) {
  return await prisma.judgementPhrase.findFirst({
    where: {
      judgementId: judgement.id,
      phrase,
    },
  });
}

export function createJudgementPhrases(
  judgement: Judgement,
  phrases: string[]
) {
  const createOperations = [];

  for (const phrase of phrases) {
    if (!phrase.trim().length) continue;

    createOperations.push(
      prisma.judgementPhrase.create({
        data: {
          judgementId: judgement.id,
          phrase,
        },
      })
    );
  }
  return createOperations;
}

// This structure specifies a set of operations to apply to a Judgement. The
// following changes can be made using this interface:
//
// To create or update a Vote:
//   { "phrase": { "doc_123": 4 } }
//
// To delete a specific Vote:
//   { "phrase": { "doc_456": null } }
//
// To ensure a phrase exists, without adding a Vote:
//   { "phrase": {} }
//
// To delete a phrase and all of its Votes:
//   { "phrase": null }
export const setVotesSchema = z.record(
  z.record(z.number().nullable()).nullable()
);

export type SetVotes = z.infer<typeof setVotesSchema>;

export async function setVotes(
  judgement: Judgement,
  input: SetVotes
): Promise<void> {
  const phrases: [
    string,
    null | Record<string, number | null>
  ][] = Object.entries(input);
  const deleteInput = phrases
    .filter(([_phrase, votes]) => votes === null)
    .map(([phrase, _votes]) => phrase);
  const addInput = phrases.filter(([_phrase, votes]) => votes !== null) as [
    string,
    Record<string, number>
  ][];

  const addVotes = addInput.flatMap(([phrase, votes]) =>
    Object.entries(votes)
      .filter(([_docId, vote]) => vote !== null)
      .map(([docId, vote]): [string, string, number] => [phrase, docId, vote])
  );
  const deleteVotes = addInput.flatMap(([phrase, votes]) =>
    Object.entries(votes)
      .filter(([_docId, vote]) => vote === null)
      .map(([docId, _vote]): [string, string] => [phrase, docId])
  );

  const transactions: PrismaPromise<any>[] = [];

  if (deleteInput.length > 0) {
    const cond = { phrase: { in: deleteInput }, judgementId: judgement.id };
    transactions.push(prisma.vote.deleteMany({ where: { phrase: cond } }));
    transactions.push(prisma.judgementPhrase.deleteMany({ where: cond }));
  }

  if (deleteVotes.length > 0) {
    transactions.push(
      prisma.vote.deleteMany({
        where: {
          phrase: { judgementId: judgement.id },
          AND: deleteVotes.reduce<Prisma.VoteWhereInput | undefined>(
            (
              rest: Prisma.VoteWhereInput | undefined,
              [phrase, documentId]: [string, string]
            ) => ({
              phrase: { phrase },
              documentId,
              OR: rest,
            }),
            undefined
          ),
        },
      })
    );
  }

  if (addInput.length > 0) {
    transactions.push(
      prisma.judgementPhrase.createMany({
        data: addInput.map(
          ([phrase, _votesInput]): Prisma.JudgementPhraseCreateManyInput => ({
            judgementId: judgement.id,
            phrase,
          })
        ),
        skipDuplicates: true,
      })
    );
  }

  if (addVotes.length > 0) {
    transactions.push(prisma.$executeRaw`
      INSERT INTO "Vote" ("judgementPhraseId", "documentId", "score", "createdAt", "updatedAt")
        SELECT "JudgementPhrase"."id", "documentId", "score", NOW(), NOW()
        FROM (
          VALUES ${Prisma.join(
            addVotes.map(
              ([phr, doc, sco]) =>
                Prisma.sql`(${phr}, ${doc}, cast(${sco.toString()}::text as double precision))`
            )
          )}
        )
        AS "inputs" ("phrase", "documentId", "score")
        INNER JOIN "JudgementPhrase"
        ON "JudgementPhrase"."phrase" = "inputs"."phrase"
        AND "JudgementPhrase"."judgementId" = ${judgement.id}
      ON CONFLICT ("judgementPhraseId", "documentId")
      DO UPDATE SET "score" = EXCLUDED."score", "updatedAt" = NOW()
    `);
  }

  await prisma.$transaction(transactions);
}

export function parseVotesCsv(content: Buffer | string): SetVotes {
  const raw = csvParser(content, {
    columns: true,
    trim: true,
    skip_empty_lines: true,
  });
  if (raw.length == 0) return {};
  const firstRecord = raw[0];
  if ("Query Text" in firstRecord) {
    return parseQuepidCsv(raw);
  } else {
    return parseChorusCsv(raw);
  }
}

type ChorusRecord = {
  query: string;
  docid: string;
  rating: string;
};

function parseChorusCsv(records: ChorusRecord[]): SetVotes {
  const actions: SetVotes = {};
  // transform to vote actions
  records.forEach((item) => {
    if (!item.query || !item.query.length)
      throw new Error("Invalid CSV format");
    if (!actions[item.query]) {
      actions[item.query] = {};
    }
    if (item.docid?.length) {
      let rating = parseInt(item.rating, 10);
      rating = Number.isNaN(rating) ? 0 : rating;
      actions[item.query]![item.docid] = rating;
    }
  });
  return actions;
}

type QuepidRecord = {
  "Query Text": string;
  "Doc ID": string;
  Rating: string;
};

function parseQuepidCsv(records: QuepidRecord[]): SetVotes {
  const actions: SetVotes = {};
  // transform to vote actions
  records.forEach((item) => {
    const query = item["Query Text"];
    const docid = item["Doc ID"];
    const rawRating = item["Rating"];
    if (!query || !query.length) throw new Error("Invalid CSV format");
    if (!actions[query]) {
      actions[query] = {};
    }
    if (!rawRating || !rawRating.length) return;
    if (docid?.length) {
      actions[query]![docid] = (parseInt(rawRating, 10) / 10) * VOTE_MAX;
    }
  });
  return actions;
}

export async function getLatestJudgements(
  user: User,
  project: Project,
  size: number
): Promise<Judgement[]> {
  const judgements = await prisma.judgement.findMany({
    where: userCanAccessJudgement(user, { projectId: project.id }),
    orderBy: { updatedAt: "desc" },
    take: size,
  });
  return judgements;
}

export async function getVote(id: number): Promise<Vote | null> {
  const vote = await prisma.vote.findFirst({
    where: { id },
  });

  return vote;
}

export async function updateVote(vote: Vote, score: number): Promise<Vote> {
  const updatedVote = await prisma.vote.update({
    where: { id: vote.id },
    data: {
      score,
    },
  });

  return updatedVote;
}

export async function createVote(
  judgementPhraseId: string,
  documentId: string,
  score: number
): Promise<Vote> {
  try {
    return await prisma.vote.create({
      data: {
        judgementPhraseId,
        documentId,
        score,
      },
    });
  } catch (err) {
    throw new HttpError(500, ErrorMessage.FailedToCreateVote);
  }
}
