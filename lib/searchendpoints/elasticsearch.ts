import fetch, { RequestInit } from "node-fetch";

import { SearchEndpoint } from "../prisma";
import { ElasticsearchInfoSchema } from "../schema";
import { ExpandedQuery } from "./queryexpander";
import {
  getHeaders,
  getSearchEndpointCredentials,
  IgnoreSSL,
  TestResult,
} from "./index";
import {
  FieldsCapabilitiesFilters,
  QueryInterface,
  ElasticsearchResult,
  QueryResult,
} from "./index";
import { trimEnd } from "lodash";
import { Agent } from "https";

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

export type SearchEndpointData = Omit<
  SearchEndpoint,
  "id" | "createdAt" | "updatedAt"
>;

export class ElasticsearchInterface implements QueryInterface {
  constructor(public searchEndpoint: SearchEndpointData) {}

  private async rawQuery<ResultType = any>(
    api: string,
    body: string | undefined,
    extra: RequestInit = {}
  ): Promise<ResultType> {
    const { endpoint, index } = ElasticsearchInfoSchema.parse(
      this.searchEndpoint.info
    );
    const endpointUrl = trimEnd(endpoint, "/");
    const credentials = await getSearchEndpointCredentials(this.searchEndpoint);
    const response = await fetch(`${endpointUrl}/${index}/${api}`, {
      method: "POST",
      body,
      headers: getHeaders(credentials),
      agent: endpointUrl.startsWith("https")
        ? new Agent({
            rejectUnauthorized: !(this.searchEndpoint.info as IgnoreSSL)
              .ignoreSSL,
          })
        : undefined,
      ...extra,
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} (${response.statusText}) - ${
          resData.error?.reason ?? "ES query failed."
        }`
      );
    }

    return resData;
  }

  async testConnection(): Promise<TestResult> {
    const result = <TestResult>{
      success: true,
    };

    try {
      // TODO resolve search endpoint host / IP and verify it's not a private IP, throw if it is
      const query = JSON.stringify({
        size: 0,
        query: {
          match_all: {},
        },
      });
      const queryResult = await this.rawQuery("_search", query);
      if (queryResult.error) {
        result.success = false;
        result.message = queryResult.error.root_cause[0].reason;
      }
    } catch (e: any) {
      result.success = false;
      result.message = e.message;
      result.errno = e.errno;
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
