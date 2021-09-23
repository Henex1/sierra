import fetch, { RequestInit } from "node-fetch";

import { SearchEndpoint } from "../prisma";
import { ElasticsearchInfoSchema, SearchEndpointCredentials } from "../schema";
import { ExpandedQuery } from "./queryexpander";
import { getSearchEndpointCredentials, TestResult } from "./index";
import {
  FieldsCapabilitiesFilters,
  QueryInterface,
  ElasticsearchResult,
  QueryResult,
} from "./index";

type ElasticsearchHit = {
  _id: string;
  _index: string;
  _score: number;
  _source: Record<string, unknown>;
  _type: "_doc";
  _explanation: Record<string, unknown>;
};

type ElasticsearchQueryResponse =
  | { error: { type: string; reason: string } }
  | {
      took: number;
      timed_out: boolean;
      _shards: {
        total: number;
        successful: number;
        skipped: number;
        failed: number;
      };
      hits: {
        total: { value: number; relation: "eq" };
        max_score: number;
        hits: ElasticsearchHit[];
      };
    };

function getHeaders(
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

export class ElasticsearchInterface implements QueryInterface {
  constructor(public searchEndpoint: SearchEndpoint) {}

  private async rawQuery<ResultType = any>(
    api: string,
    body: string | undefined,
    extra: RequestInit = {}
  ): Promise<ResultType> {
    const { endpoint, index } = ElasticsearchInfoSchema.parse(
      this.searchEndpoint.info
    );
    const credentials = await getSearchEndpointCredentials(this.searchEndpoint);
    const response = await fetch(`${endpoint}${index}/${api}`, {
      method: "POST",
      body,
      headers: getHeaders(credentials),
      ...extra,
    });

    return await response.json();
  }

  async testConnection(): Promise<TestResult> {
    const result = <TestResult>{
      success: true,
    };

    try {
      const query = JSON.stringify({
        size: 0,
        query: {
          match_all: {},
        },
      });
      const queryResult = await this.rawQuery("/_search", query);
      if (queryResult.error) {
        result.success = false;
        result.message = queryResult.error.root_cause[0].reason;
      }
    } catch (e) {
      result.success = false;
      result.message = e.message;
    }
    return result;
  }

  async getFields(filters?: FieldsCapabilitiesFilters): Promise<string[]> {
    const result = await this.rawQuery("_field_caps?fields=*", undefined, {
      method: "GET",
    });
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

  async getFieldValues(fieldName: string, prefix?: string): Promise<string[]> {
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
    const response = await this.rawQuery("_search", query);
    let values = [];
    if (response?.aggregations?.values?.buckets?.length) {
      values = response.aggregations.values.buckets.map((b: any) => b.key);
    }
    return values;
  }

  async getDocumentsByID(ids: string[]): Promise<ElasticsearchResult[]> {
    const response = await this.rawQuery(
      "_search",
      JSON.stringify({
        query: { terms: { _id: ids } },
        size: ids.length,
      })
    );
    return response.hits.hits;
  }

  async executeQuery(query: ExpandedQuery): Promise<QueryResult> {
    const response = await this.rawQuery<ElasticsearchQueryResponse>(
      "_search?explain=true",
      JSON.stringify(query)
    );
    if ("error" in response) {
      throw new Error(
        `Elasticsearch error (${response.error.type}) ${response.error.reason}`
      );
    }
    const results = response.hits?.hits?.map((h) => ({
      id: h._id,
      explanation: h._explanation,
    }));
    return {
      tookMs: response.took,
      totalResults: response.hits?.total?.value ?? 0,
      results,
      error:
        response._shards.failed > 0
          ? `${response._shards.failed} shards failed`
          : undefined,
    };
  }

  handleQueryDEPRECATED<ResultType>(query: string): Promise<ResultType> {
    return this.rawQuery<ResultType>("_search", query);
  }
}
