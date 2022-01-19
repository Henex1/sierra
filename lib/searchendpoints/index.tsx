import * as z from "zod";
import fernet from "fernet";

import { HttpError } from "../apiServer";
import prisma, {
  Prisma,
  User,
  SearchEndpoint,
  SearchEndpointType,
} from "../prisma";
import { SearchEndpointSchema, SearchEndpointCredentials } from "../schema";
import { userCanAccessOrg } from "../org";
import { requireEnv } from "../env";
import { ElasticsearchInterface, SearchEndpointData } from "./elasticsearch";
import { expandQuery, ExpandedQuery } from "./queryexpander";
import * as ExposedSearchEndpoint from "./types/ExposedSearchEndpoint";
import { SolrQueryInterface } from "./solr";

export { expandQuery };

const fernetSecret = (function () {
  const encryptionKey = requireEnv("CREDENTIALS_SECRET");
  return new fernet.Secret(encryptionKey);
})();

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

export const formatSearchEndpoint =
  ExposedSearchEndpoint.fromPrismaSearchEndpoint;

export async function getSearchEndpoint<T extends Prisma.SearchEndpointInclude>(
  user: User,
  id: string,
  include?: T
) {
  const ds = await prisma.searchEndpoint.findFirst<{
    include: T;
    where: Prisma.SearchEndpointWhereInput;
  }>({
    where: userCanAccessSearchEndpoint(user, { id }),
    include: include as T,
  });

  return ds;
}

export async function listSearchEndpoints({
  user,
}: {
  user: User;
}): Promise<ExposedSearchEndpoint.ExposedSearchEndpoint[]> {
  if (!user) {
    return [];
  }
  const searchEndpoints = await prisma.searchEndpoint.findMany({
    where: userCanAccessSearchEndpoint(user),
  });

  return searchEndpoints.map(ExposedSearchEndpoint.fromPrismaSearchEndpoint);
}

const cleanSearchEndpointSchema = SearchEndpointSchema.pick({
  type: true,
  info: true,
}).nonstrict();
type CleanSearchEndpoint = z.infer<typeof cleanSearchEndpointSchema>;
function cleanSearchEndpoint(input: CleanSearchEndpoint) {
  switch (input.type) {
    case "ELASTICSEARCH":
    case "OPENSEARCH":
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

export async function testSearchEndpointConnection(
  user: User,
  input: SearchEndpointData
): Promise<TestResult> {
  if ("orgId" in input) {
    const isValidOrg = await prisma.orgUser.findUnique({
      where: {
        userId_orgId: { userId: user.id, orgId: input.orgId! },
      },
    });
    if (!isValidOrg) {
      return Promise.reject(new HttpError(400, { error: "invalid org" }));
    }
  }

  const q = getQueryInterface(input);
  return q.testConnection();
}

export async function createSearchEndpoint(
  user: User,
  input: CreateSearchEndpoint
): Promise<ExposedSearchEndpoint.ExposedSearchEndpoint> {
  const isValidOrg = await prisma.orgUser.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: input.orgId } },
  });
  if (!isValidOrg) {
    return Promise.reject(new HttpError(400, { error: "invalid org" }));
  }
  cleanSearchEndpoint(input);
  const encodedCredentials = input.credentials
    ? encryptCredentials(input.credentials)
    : "";
  const ds = await prisma.searchEndpoint.create({
    data: {
      ...input,
      credentials: encodedCredentials,
    },
  });
  return ExposedSearchEndpoint.fromPrismaSearchEndpoint(ds);
}

export async function deleteSearchEndpoint(
  user: User,
  id: string
): Promise<void> {
  const ds = await getSearchEndpoint(user, id);
  if (!ds) {
    return Promise.reject(new HttpError(404, { error: "not found" }));
  }

  try {
    await prisma.searchEndpoint.delete({ where: { id: ds.id } });
  } catch (e: any) {
    switch (e.code) {
      case "P2014":
        return Promise.reject(
          new HttpError(500, {
            error:
              "Unable to remove search endpoint as it is linked to a project",
          })
        );
      default:
        return Promise.reject(
          new HttpError(500, { error: "Unable to remove search endpoint" })
        );
    }
  }
}

export const updateSearchEndpointSchema = SearchEndpointSchema.omit({
  id: true,
  type: true,
})
  .partial()
  .merge(z.object({ id: z.string() }));

export type UpdateSearchEndpoint = z.infer<typeof updateSearchEndpointSchema>;

export async function updateSearchEndpoint(
  user: User,
  rawInput: UpdateSearchEndpoint
): Promise<SearchEndpoint> {
  let formattedInput: any = rawInput;
  if ("orgId" in formattedInput) {
    const isValidOrg = await prisma.orgUser.findUnique({
      where: {
        userId_orgId: { userId: user.id, orgId: formattedInput.orgId! },
      },
    });
    if (!isValidOrg) {
      return Promise.reject(new HttpError(400, { error: "invalid org" }));
    }
  }

  const se = await getSearchEndpoint(user, formattedInput.id);
  if (!se) {
    return Promise.reject(new HttpError(404, { error: "not found" }));
  }

  if ("info" in formattedInput || "type" in formattedInput) {
    formattedInput = {
      type: se.type,
      info: se.info,
      ...formattedInput,
    } as UpdateSearchEndpoint;
    cleanSearchEndpoint(formattedInput as any);
  }
  if (formattedInput.credentials !== undefined) {
    formattedInput = {
      ...formattedInput,
      credentials: encryptCredentials(formattedInput.credentials),
    } as Prisma.SearchEndpointUpdateInput;
  }

  const endpoint = await prisma.searchEndpoint.update({
    where: { id: se.id },
    data: formattedInput,
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
    explanation: any;
  }>;
  // User-visible explanation of why the results of this query are incomplete.
  error?: string;
};

export type TestResult = {
  success: boolean;
  message?: string;
  errno?: string;
};

export interface QueryInterface {
  getFields(filters?: FieldsCapabilitiesFilters): Promise<string[]>;
  getFieldValues(fieldName: string, prefix?: string): Promise<string[]>;
  getDocumentsByID(ids: string[]): Promise<ElasticsearchResult[]>;
  executeQuery(query: ExpandedQuery): Promise<QueryResult>;
  testConnection(): Promise<TestResult>;
  // Issue a raw query to the _search endpoint in elasticsearch. This method is
  // only used for the testbed, and should be removed.
  handleQueryDEPRECATED<ResultType = any>(query: string): Promise<ResultType>;
}

export function getQueryInterface(
  searchEndpoint: SearchEndpointData
): QueryInterface {
  switch (searchEndpoint.type as SearchEndpointType) {
    case "ELASTICSEARCH":
    case "OPENSEARCH":
      return new ElasticsearchInterface(searchEndpoint);
    case "SOLR":
      return new SolrQueryInterface(searchEndpoint);
    case "REDIS_SEARCH":
    case "VESPA":
      throw new Error(`unimplemented SearchEndpoint ${searchEndpoint.type}`);
  }
}

export function encryptCredentials(
  creds: SearchEndpointCredentials | null | undefined
): string | null {
  if (!creds) return null;
  const token = new fernet.Token({
    secret: fernetSecret,
  });
  return token.encode(JSON.stringify(creds));
}

function decryptCredentials(
  creds: string | null
): SearchEndpointCredentials | null {
  if (!creds) return null;
  const token = new fernet.Token({
    secret: fernetSecret,
    token: creds,
    ttl: -1,
  });
  const decrypted = token.decode();
  return JSON.parse(decrypted) as SearchEndpointCredentials;
}

export async function getSearchEndpointCredentials<
  T extends { credentials: string | null }
>(se: T): Promise<SearchEndpointCredentials | null> {
  return decryptCredentials(se.credentials);
}

export function getHeaders(
  credentials: SearchEndpointCredentials | null
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (credentials) {
    const { username, password } = credentials;
    headers["Authorization"] = `Basic ${Buffer.from(
      `${username}:${password}`
    ).toString("base64")}`;
  }
  return headers;
}

export interface IgnoreSSL {
  ignoreSSL?: boolean;
}
