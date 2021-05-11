import * as z from "zod";
import fetch from "node-fetch";

import { SearchEndpoint } from "../prisma";
import { ElasticsearchInfoSchema } from "../schema";
import { FieldsCapabilitiesFilters, QueryInterface } from "./index";

type ElasticsearchInfo = z.infer<typeof ElasticsearchInfoSchema>;

type Credentials = {
  username: string;
  password: string;
};

function getHeaders(credentials?: Credentials): Record<string, string> {
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

export class ElasticsearchInterface implements QueryInterface {
  constructor(public searchEndpoint: SearchEndpoint) {}

  getFields(filters?: FieldsCapabilitiesFilters): Promise<string[]> {
    return handleElasticsearchGetFields(this.searchEndpoint, filters);
  }

  getFieldValues(fieldName: string, prefix?: string): Promise<string[]> {
    return handleElasticsearchGetValues(this.searchEndpoint, fieldName, prefix);
  }

  handleQueryDEPRECATED<ResultType>(query: string): Promise<ResultType> {
    return handleElasticsearchQuery<ResultType>(this.searchEndpoint, query);
  }
}

export async function handleElasticsearchQuery<ResultType = any>(
  searchEndpoint: SearchEndpoint,
  query: string
): Promise<ResultType> {
  const {
    endpoint,
    index,
    username,
    password,
  } = searchEndpoint.info as ElasticsearchInfo;
  const credentials = username && password ? { username, password } : undefined;
  const response = await fetch(buildApiPath(endpoint, index, "_search"), {
    method: "POST",
    body: query,
    headers: getHeaders(credentials),
  });
  const result = await response.json();
  return result;
}

export async function handleElasticsearchGetFields(
  searchEndpoint: SearchEndpoint,
  filters?: FieldsCapabilitiesFilters
): Promise<string[]> {
  const {
    endpoint,
    index,
    username,
    password,
  } = searchEndpoint.info as ElasticsearchInfo;
  const response = await fetch(
    buildApiPath(endpoint, index, "_field_caps?fields=*"),
    {
      method: "GET",
      headers: getHeaders(
        username && password ? { username, password } : undefined
      ),
    }
  );
  const result = await response.json();
  if (!result?.fields?.length) {
    return [];
  }
  const fields: string[] = [];
  Object.entries(result.fields).forEach(([fieldName, fieldValues]) => {
    const details = fieldValues as any;
    let canPush = true;
    if (!filters) {
      fields.push(fieldName);
      return;
    }
    const fieldCapabilities: any =
      (details && details[Object.keys(details)[0]]) || {};
    if (filters.aggregateable) {
      if (fieldCapabilities.aggregateable) {
        canPush = false;
      }
    }
    if (canPush && filters.searchable) {
      if (!fieldCapabilities || !(fieldCapabilities as any).searchable) {
        canPush = false;
      }
    }
    if (canPush && filters.type) {
      if (
        !fieldCapabilities ||
        (fieldCapabilities as any).type != filters.type
      ) {
        canPush = false;
      }
    }
    if (canPush) {
      fields.push(fieldName);
    }
  });
  return fields;
}

export async function handleElasticsearchGetValues(
  searchEndpoint: SearchEndpoint,
  fieldName: string,
  prefix?: string
): Promise<string[]> {
  const query = JSON.stringify({
    size: 0,
    aggs: {
      values: {
        terms: {
          field: fieldName,
          size: 10,
          include: prefix ? `${prefix}.+` : undefined,
        },
      },
    },
  });
  const response = (await handleElasticsearchQuery(
    searchEndpoint,
    query
  )) as any;
  let values = [];
  if (response?.aggregations?.values?.buckets?.length) {
    values = response.aggregations.values.buckets.map((b: any) => b.key);
  }
  return values;
}

function buildApiPath(
  endpoint: string,
  indexName: string,
  api: string
): string {
  return `${endpoint}${endpoint.endsWith("/") ? "" : "/"}${indexName}/${api}`;
}
