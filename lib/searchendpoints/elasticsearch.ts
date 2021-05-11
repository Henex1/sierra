import * as z from "zod";
import fetch, { RequestInit } from "node-fetch";

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

  private async rawQuery<ResultType = any>(
    api: string,
    body: string | undefined,
    extra: RequestInit = {}
  ): Promise<ResultType> {
    const { endpoint, index, username, password } = this.searchEndpoint
      .info as ElasticsearchInfo;
    const credentials =
      username && password ? { username, password } : undefined;
    const response = await fetch(`${endpoint}${index}/${api}`, {
      method: "POST",
      body,
      headers: getHeaders(credentials),
      ...extra,
    });
    const result = await response.json();
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

  handleQueryDEPRECATED<ResultType>(query: string): Promise<ResultType> {
    return this.rawQuery<ResultType>("_search", query);
  }
}
