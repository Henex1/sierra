import {
  ElasticsearchResult,
  FieldsCapabilitiesFilters,
  getHeaders,
  getSearchEndpointCredentials,
  IgnoreSSL,
  QueryInterface,
  QueryResult,
  TestResult,
} from "./index";
import { SolrInfoSchema } from "../schema";
import fetch from "node-fetch";
import { Agent } from "https";
import { SearchEndpointData } from "./elasticsearch";
import { ExpandedQuery } from "./queryexpander";
import * as queryString from "querystring";

export interface SolrResponse<T> {
  responseHeader: {
    status: number;
    QTime: number;
    params: Record<string, string | number | null | undefined>;
  };
  response: {
    numFound: number;
    start: number;
    numFoundExact: boolean;
    docs: T;
  };
}

export class SolrQueryInterface implements QueryInterface {
  constructor(public searchEndpoint: SearchEndpointData) {}

  async testConnection(): Promise<TestResult> {
    try {
      await this.rawQuery(queryString.stringify({ q: "*:*", rows: 0 }));
      return {
        success: true,
      };
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  async executeQuery(query: ExpandedQuery): Promise<QueryResult> {
    const queryStr = queryString.stringify(query);
    const r = await this.rawQuery<Array<{ id: string }>>(queryStr);

    return {
      tookMs: r.responseHeader.QTime,
      totalResults: r.response.numFound,

      // TODO: Not sure how I should take the explanation
      // Does the document schema has those fields?
      results: r.response.docs,
    };
  }

  async getDocumentsByID(ids: string[]): Promise<ElasticsearchResult[]> {
    const r = await this.rawQuery<Array<{ id: string }>>(
      queryString.stringify({ fq: `id:(${ids.join(",")})` })
    );

    // Not sure what `_sources` key should contain
    return r.response.docs.map(({ id }) => ({ _id: id, _source: {} }));
  }

  getFields(filters?: FieldsCapabilitiesFilters): Promise<string[]> {
    //TODO: Implement this
  }

  getFieldValues(fieldName: string, prefix?: string): Promise<string[]> {
    //TODO: Implement this
  }

  async handleQueryDEPRECATED<ResultType>(query: string): Promise<ResultType> {
    const r = await this.rawQuery<ResultType>(query);

    return r.response.docs;
  }

  private async rawQuery<ResultType>(
    query: string
  ): Promise<SolrResponse<ResultType>> {
    const { endpoint, index } = SolrInfoSchema.parse(this.searchEndpoint.info);
    const credentials = await getSearchEndpointCredentials(this.searchEndpoint);
    const url = `${endpoint}solr/${index}/select?${query}`;
    const agent = endpoint.startsWith("https")
      ? new Agent({
          rejectUnauthorized: !(this.searchEndpoint.info as IgnoreSSL)
            .ignoreSSL,
        })
      : undefined;

    const response = await fetch(url, {
      headers: getHeaders(credentials),
      agent,
    });

    return await response.json();
  }
}
