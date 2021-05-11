import _ from "lodash";
import * as z from "zod";

import { HttpError } from "../apiServer";
import prisma, { Prisma, User, SearchEndpoint } from "../prisma";
import { SearchEndpointSchema } from "../schema";
import { userCanAccessOrg } from "../org";
import { ElasticsearchInterface } from "./elasticsearch";
import { expandQuery, ExpandedQuery } from "./queryexpander";

export { expandQuery };

// This is the list of keys which are included in user requests for
// SearchEndpoint by default.
const selectKeys = {
  id: true,
  orgId: true,
  name: true,
  description: true,
  whitelist: true,
  resultId: true,
  displayFields: true,
  type: true,
  info: true,
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
  if (Number.isNaN(id)) {
    throw new Error(`Param ${id} is not a number`);
  }
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

const cleanSearchEndpointSchema = SearchEndpointSchema.pick({
  type: true,
  info: true,
}).nonstrict();
type CleanSearchEndpoint = z.infer<typeof cleanSearchEndpointSchema>;
function cleanSearchEndpoint(input: CleanSearchEndpoint) {
  switch (input.type) {
    case "ELASTICSEARCH":
    case "OPEN_SEARCH":
      if (!input.info.endpoint.endsWith("/")) {
        input.info.endpoint += "/";
      }
      break;
  }
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
  cleanSearchEndpoint(input);

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

  const se = await getSearchEndpoint(user, input.id);
  if (!se) {
    return Promise.reject(new HttpError(404, { error: "not found" }));
  }

  if ("info" in input || "type" in input) {
    input = { type: se.type, info: se.info, ...input } as UpdateSearchEndpoint;
    cleanSearchEndpoint(input as any);
  }

  const endpoint = await prisma.searchEndpoint.update({
    where: { id: se.id },
    data: input,
  });
  return endpoint;
}

export type FieldsCapabilitiesFilters = {
  aggregateable?: boolean;
  searchable?: boolean;
  type?: string;
};

// ElasticsearchResult is the format we expect all SearchEndpoints to return
// data in. In the future we may need to replace this interface with something
// better, particularly something that returns the selected fields in a
// structured way, as well as the explanation.
export type ElasticsearchResult = {
  _id: string;
  _source: Record<string, string>;
};

export type QueryResult = {
  tookMs: number;
  totalResults: number;
  results: Array<{
    id: string;
    explanation: object;
  }>;
};

export interface QueryInterface {
  getFields(filters?: FieldsCapabilitiesFilters): Promise<string[]>;
  getFieldValues(fieldName: string, prefix?: string): Promise<string[]>;
  getDocumentsByID(ids: string[]): Promise<ElasticsearchResult[]>;
  executeQuery(query: ExpandedQuery): Promise<QueryResult>;
  // Issue a raw query to the _search endpoint in elasticsearch. This method is
  // only used for the testbed, and should be removed.
  handleQueryDEPRECATED<ResultType = any>(query: string): Promise<ResultType>;
}

export function getQueryInterface(
  searchEndpoint: SearchEndpoint
): QueryInterface {
  if (
    searchEndpoint.type === "ELASTICSEARCH" ||
    searchEndpoint.type === "OPEN_SEARCH"
  ) {
    return new ElasticsearchInterface(searchEndpoint);
  } else {
    throw new Error(`unimplemented SearchEndpoint ${searchEndpoint.type}`);
  }
}
