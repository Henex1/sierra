import { HttpError } from "../errors";
import prisma, { Prisma, User, SearchEndpoint } from "../prisma";
import { SearchEndpointSchema } from "../schema";
import { UserSession } from "../authServer";
import { userCanAccessOrg } from "../org";
import { handleElasticsearchQuery } from "./elasticsearch";

// This is the list of keys which are included in user requests for SearchEndpoint
// by default.
const selectKeys = {
  id: true,
  orgId: true,
  name: true,
  type: true,
  info: true,
};

export type ExposedSearchEndpoint = Pick<SearchEndpoint, keyof typeof selectKeys>;

export function userCanAccessSearchEndpoint(
  user: User,
  rest?: Prisma.SearchEndpointWhereInput
): Prisma.SearchEndpointWhereInput {
  const result: Prisma.SearchEndpointWhereInput = { org: userCanAccessOrg(user) };
  if (rest) {
    result.AND = rest;
  }
  return result;
}

export async function getSearchEndpoint(
  user: User,
  idStr: string
): Promise<ExposedSearchEndpoint | null> {
  const id = parseInt(idStr, 10);
  const ds = await prisma.searchEndpoint.findFirst({
    where: userCanAccessSearchEndpoint(user, { id }),
    select: selectKeys,
  });
  return ds;
}

export async function listSearchEndpoints({
  user,
}: UserSession): Promise<ExposedSearchEndpoint[]> {
  if (!user) {
    return [];
  }
  const searchEndpoints = await prisma.searchEndpoint.findMany({
    where: userCanAccessSearchEndpoint(user),
    select: selectKeys,
  });
  return searchEndpoints;
}

export async function createSearchEndpoint(
  user: User,
  input: ExposedSearchEndpoint
): Promise<ExposedSearchEndpoint> {
  const result = SearchEndpointSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  }).safeParse(input);
  if (!result.success) {
    return Promise.reject(new HttpError(400, result.error));
  }

  const isValidOrg = await prisma.orgUser.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: result.data.orgId } },
  });
  if (!isValidOrg) {
    return Promise.reject(new HttpError(400, { error: "invalid org" }));
  }

  const ds = await prisma.searchEndpoint.create({
    data: result.data,
    select: selectKeys,
  });
  return ds;
}

export async function deleteSearchEndpoint(
  user: User,
  idStr: string
): Promise<void> {
  const ds = await getSearchEndpoint(user, idStr);
  if (!ds) {
    return Promise.reject(new HttpError(404, { error: "not found" }));
  }
  await prisma.searchEndpoint.delete({ where: { id: ds.id } });
}

export async function updateSearchEndpoint(
  user: User,
  idStr: string,
  input: ExposedSearchEndpoint
): Promise<ExposedSearchEndpoint> {
  const result = SearchEndpointSchema.omit({ id: true, type: true })
    .partial()
    .safeParse(input);
  if (!result.success) {
    return Promise.reject(new HttpError(400, result.error));
  }
  if ("orgId" in result.data) {
    const isValidOrg = await prisma.orgUser.findUnique({
      where: { userId_orgId: { userId: user.id, orgId: result.data.orgId! } },
    });
    if (!isValidOrg) {
      return Promise.reject(new HttpError(400, { error: "invalid org" }));
    }
  }

  let ds = await getSearchEndpoint(user, idStr);
  if (!ds) {
    return Promise.reject(new HttpError(404, { error: "not found" }));
  }

  ds = await prisma.searchEndpoint.update({
    where: { id: ds.id },
    data: result.data,
    select: selectKeys,
  });
  return ds;
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
