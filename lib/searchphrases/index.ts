import _ from "lodash";
import * as z from "zod";

import prisma, { Prisma, Project, SearchPhrase, User } from "../prisma";
import { userCanAccessProject } from "../projects";

// This is the list of keys which are included in user requests for Project
// by default.
const selectKeys = {
  id: true,
  projectId: true,
  phrase: true,
  judgement: true,
};

export type ExposedSearchPhrase = Pick<SearchPhrase, keyof typeof selectKeys>;

export function formatSearchPhrase(val: SearchPhrase): ExposedSearchPhrase {
  return _.pick(val, _.keys(selectKeys)) as ExposedSearchPhrase;
}

export async function getSearchPhrase(
  user: User,
  id: number
): Promise<SearchPhrase | null> {
  const phrase = await prisma.searchPhrase.findFirst({
    where: { project: userCanAccessProject(user), id: id },
  });
  return phrase;
}

export async function getSearchPhrases(
  project: Project
): Promise<SearchPhrase[]> {
  const result = await prisma.searchPhrase.findMany({
    where: { projectId: project.id },
  });
  return result;
}

export const createSearchPhraseSchema = z.object({
  phrase: z.string(),
});

export type CreateSearchPhrase = z.infer<typeof createSearchPhraseSchema>;

export async function createSearchPhrase(
  project: Project,
  input: CreateSearchPhrase
): Promise<SearchPhrase> {
  const phrase = await prisma.searchPhrase.create({
    data: {
      ...input,
      judgement: { judgements: [] },
      projectId: project.id,
    },
  });
  return phrase;
}

export async function deleteSearchPhrase(phrase: SearchPhrase): Promise<void> {
  await prisma.searchPhrase.delete({
    where: { id: phrase.id },
  });
}
