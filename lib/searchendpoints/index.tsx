import _ from "lodash";
import * as z from "zod";

import { HttpError } from "../apiServer";
import prisma, { Prisma, User, SearchEndpoint } from "../prisma";
import { SearchEndpointSchema } from "../schema";
import { userCanAccessOrg } from "../org";
import { handleElasticsearchQuery } from "./elasticsearch";

// This is the list of keys which are included in user requests for SearchEndpoint
// by default.
const selectKeys = {
  id: true,
  orgId: true,
  name: true,
  description: true,
  whitelist: true,
  resultId: true,
  displayFields: true,
  type: true,
  info: true
};

export type ExposedSearchEndpoint = Pick<
  SearchEndpoint,
  keyof typeof selectKeys
>;

export function userCanAccessSearchEndpoint(
  user: User,
  rest?: Prisma.SearchEndpointWhereInput
): Prisma.SearchEndpointWhereInput {
  const result: Prisma.SearchEndpointWhereInput = {
    org: userCanAccessOrg(user),
  };
  if (rest) {
    result.AND = rest;
  }
  return result;
}

export function formatSearchEndpoint(
  val: SearchEndpoint
): ExposedSearchEndpoint {
  return _.pick(val, _.keys(selectKeys)) as ExposedSearchEndpoint;
}

export async function getSearchEndpoint(
  user: User,
  idStr: string | number
): Promise<SearchEndpoint | null> {
  const id = typeof idStr === "number" ? idStr : parseInt(idStr, 10);
  const ds = await prisma.searchEndpoint.findFirst({
    where: userCanAccessSearchEndpoint(user, { id }),
  });
  return ds;
}

export async function listSearchEndpoints({
  user,
}: {
  user: User;
}): Promise<ExposedSearchEndpoint[]> {
  if (!user) {
    return [];
  }
  const searchEndpoints = await prisma.searchEndpoint.findMany({
    where: userCanAccessSearchEndpoint(user),
    select: selectKeys,
  });
  return searchEndpoints;
}

export const createSearchEndpointSchema = SearchEndpointSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateSearchEndpoint = z.infer<typeof createSearchEndpointSchema>;

export async function createSearchEndpoint(
  user: User,
  input: CreateSearchEndpoint
): Promise<ExposedSearchEndpoint> {
  const isValidOrg = await prisma.orgUser.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: input.orgId } },
  });
  if (!isValidOrg) {
    return Promise.reject(new HttpError(400, { error: "invalid org" }));
  }

  const ds = await prisma.searchEndpoint.create({
    data: input,
    select: selectKeys,
  });
  return ds;
}

export async function deleteSearchEndpoint(
  user: User,
  id: number
): Promise<void> {
  const ds = await getSearchEndpoint(user, id);
  if (!ds) {
    return Promise.reject(new HttpError(404, { error: "not found" }));
  }
  await prisma.searchEndpoint.delete({ where: { id: ds.id } });
}

export const updateSearchEndpointSchema = SearchEndpointSchema.omit({
  type: true,
})
  .partial()
  .merge(z.object({ id: z.number() }));

export type UpdateSearchEndpoint = z.infer<typeof updateSearchEndpointSchema>;

export async function updateSearchEndpoint(
  user: User,
  input: UpdateSearchEndpoint
): Promise<SearchEndpoint> {
  if ("orgId" in input) {
    const isValidOrg = await prisma.orgUser.findUnique({
      where: { userId_orgId: { userId: user.id, orgId: input.orgId! } },
    });
    if (!isValidOrg) {
      return Promise.reject(new HttpError(400, { error: "invalid org" }));
    }
  }

  const ds = await getSearchEndpoint(user, input.id);
  if (!ds) {
    return Promise.reject(new HttpError(404, { error: "not found" }));
  }

  const endpoint = await prisma.searchEndpoint.update({
    where: { id: ds.id },
    data: input,
  });
  return endpoint;
}

export async function handleQuery(
  searchEndpoint: SearchEndpoint,
  query: string
): Promise<unknown> {
  if (searchEndpoint.type === "ELASTICSEARCH") {
    return handleElasticsearchQuery(searchEndpoint, query);
  }
  throw new Error(
    `unsupported searchEndpoint type ${JSON.stringify(searchEndpoint.type)}`
  );
}
