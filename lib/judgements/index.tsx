import _ from "lodash";
import * as z from "zod";

import prisma, {
  Prisma,
  PrismaPromise,
  User,
  Project,
  Judgement,
  JudgementPhrase,
  Vote,
} from "../prisma";
import { userCanAccessProject } from "../projects";

const jSelectKeys = {
  id: true,
  projectId: true,
  name: true,
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

export type ExposedJudgement = Pick<Judgement, keyof typeof jSelectKeys>;

export type ExposedJudgementExtendedMetadata = ExposedJudgement & {
  totalSearchPhrases: number,
  totalVotes: number
}

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
  return _.pick(val, _.keys(jSelectKeys)) as ExposedJudgement;
}

export async function getJudgement(
  user: User,
  id: number
): Promise<Judgement | null> {
  const judgement = await prisma.judgement.findFirst({
    where: userCanAccessJudgement(user, { id }),
  });
  return judgement;
}

export async function listJudgements(project: Project): Promise<Judgement[]> {
  const judgements = await prisma.judgement.findMany({
    where: { projectId: project.id },
  });
  return judgements;
}

export async function listJudgementsExtended(project: Project): Promise<ExposedJudgementExtendedMetadata> {
  return await prisma.$queryRaw`SELECT J.id, J.name, count(DISTINCT JP.id) as "totalSearchPhrases", count(DISTINCT V.id) as "totalVotes" FROM "Judgement" AS J left join "JudgementPhrase" JP on J.id = JP."judgementId" left join "Vote" V on JP.id = V."judgementPhraseId" WHERE J."projectId" = ${project.id} GROUP BY j.id, J.name;`;
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
          id: project.id
        }
      },
    },
  });
  return judgement;
}

export const updateJudgementSchema = createJudgementSchema.partial();

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
  const phrases: [string, null | object][] = Object.entries(input);
  const deleteInput = phrases
    .filter(([phrase, votes]) => votes === null)
    .map(([phrase, votes]) => phrase);
  const addInput = phrases.filter(([phrase, votes]) => votes !== null) as [
    string,
    object
  ][];

  const addVotes = addInput.flatMap(([phrase, votes]) =>
    Object.entries(votes)
      .filter(([docId, vote]) => vote !== null)
      .map(([docId, vote]): [string, string, number] => [phrase, docId, vote])
  );
  const deleteVotes = addInput.flatMap(([phrase, votes]) =>
    Object.entries(votes)
      .filter(([docId, vote]) => vote === null)
      .map(([docId, _]): [string, string] => [phrase, docId])
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
          ([phrase, votesInput]): Prisma.JudgementPhraseCreateManyInput => ({
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
      ON CONFLICT ("judgementPhraseId", "documentId")
      DO UPDATE SET "score" = EXCLUDED."score", "updatedAt" = NOW()
    `);
  }

  await prisma.$transaction(transactions);
}
