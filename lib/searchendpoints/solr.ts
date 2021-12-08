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
import { SolrExpandedQuery } from "./queryexpander";
import _ from "lodash";
import * as queryString from "querystring";

export type SolrResponse = {
  responseHeader: {
    status: number;
    QTime: number;
    params: Record<string, string | number | null | undefined>;
  };
  response: {
    numFound: number;
    start: number;
    numFoundExact: boolean;
    docs: [{ id: string }];
  };
  debug: {
    explain: { [id: string]: string };
  };
  facet_counts: {
    facet_fields: { [field: string]: [any] };
  };
};

export class SolrQueryInterface implements QueryInterface {
  constructor(public searchEndpoint: SearchEndpointData) {}

  async testConnection(): Promise<TestResult> {
    try {
      await this.rawQuery(queryString.stringify({ q: "*:*", rows: 0 }));
      return {
        success: true,
      };
    } catch (e: any) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  async executeQuery(query: SolrExpandedQuery): Promise<QueryResult> {
    const r = await this.rawQuery(query.queryStr);
    const explainById = r.debug.explain;

    return {
      tookMs: r.responseHeader.QTime,
      totalResults: r.response.numFound,
      results: r.response.docs.map((doc: { id: string }) => ({
        id: doc.id,
        explanation: explainById[doc.id],
      })),
    };
  }

  async getDocumentsByID(ids: string[]): Promise<ElasticsearchResult[]> {
    const r = await this.rawQuery(
      queryString.stringify({ fq: `id:(${ids.join(",")})` })
    );

    // Not sure what `_sources` key should contain
    return r.response.docs.map(({ id }) => ({ _id: id, _source: {} }));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getFields(filters?: FieldsCapabilitiesFilters): Promise<string[]> {
    // you can search or facet on any field, so just returning all fields

    const { endpoint, index } = SolrInfoSchema.parse(this.searchEndpoint.info);
    const url =
      new URL(`solr/`, endpoint).href +
      `${index}/select?q=*:*&wt=csv&rows=0&facet`;
    const agent = endpoint.startsWith("https")
      ? new Agent({
          rejectUnauthorized: !(this.searchEndpoint.info as IgnoreSSL)
            .ignoreSSL,
        })
      : undefined;

    const credentials = await getSearchEndpointCredentials(this.searchEndpoint);
    const response = await fetch(url, {
      headers: getHeaders(credentials),
      agent,
    });

    const respText = await response.text();
    return Promise.resolve(respText.trim().split(","));
  }

  async getFieldValues(fieldName: string, prefix?: string): Promise<string[]> {
    const resp = await this.rawQuery(
      queryString.encode({
        q: "*:*",
        qt: "/select",
        facet: true,
        "facet.field": fieldName,
        "facet.prefix": prefix ? prefix : undefined,
      })
    );

    const valueCountArr = resp.facet_counts.facet_fields[fieldName];
    const valuesOnly = valueCountArr.filter((v: any, i: number) => i % 2 === 0);
    return Promise.resolve(valuesOnly.map((v) => `${v}`));
  }

  async handleQueryDEPRECATED<ResultType>(query: string): Promise<ResultType> {
    const r = await this.rawQuery(query);
    return (r.response.docs as unknown) as ResultType;
  }

  private async rawQuery(query: string): Promise<SolrResponse> {
    const parsed = queryString.parse(query);
    const qt = parsed.qt || "/select";
    parsed["debug"] = "results";
    const queryParams = queryString.encode(_.omit(parsed, "qt"));

    const { endpoint, index } = SolrInfoSchema.parse(this.searchEndpoint.info);
    const credentials = await getSearchEndpointCredentials(this.searchEndpoint);

    const url =
      new URL("solr/", endpoint).href + `${index}${qt}?${queryParams}`;
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
