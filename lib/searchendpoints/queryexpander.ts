import fetch from "node-fetch";

import { SearchEndpoint, QueryTemplate, RulesetVersion } from "../prisma";
import { requireEnv } from "../env";
import { ErrorMessage } from "../errors/constants";
import { HttpError } from "../apiServer";

declare const queryWasExpanded: unique symbol;

// ExpandedQuery is an object, but we use TypeScript magic so that you can't
// accidentally pass any random object to the query methods without properly
// expanding it.
export type ExpandedQuery = { [queryWasExpanded]: true };
export type SolrExpandedQuery = ExpandedQuery & { queryStr: string };

const QUERY_EXPANDER_URL = requireEnv("QUERY_EXPANDER_URL");
// TODO const QUERY_EXPANDER_AUTH = optionalEnv("QUERY_EXPANDER_AUTH");

export async function expandQuery(
  endpoint: SearchEndpoint,
  tpl: QueryTemplate,
  rulesets: RulesetVersion[],
  ltrModelName: string | undefined,
  phrase: string
): Promise<ExpandedQuery> {
  if (endpoint.type === "SOLR") {
    const queryStr = tpl.query.split("#$query#").join(phrase);
    return Promise.resolve({ queryStr } as SolrExpandedQuery);
  }

  if (!["ELASTICSEARCH", "OPENSEARCH"].includes(endpoint.type)) {
    throw new HttpError(405, ErrorMessage.UnsupportedSearchEndpointType);
  }
  const body = JSON.stringify({
    query: phrase,
    search_configuration: {
      search_endpoint_type: endpoint.type,
      template: tpl.query,
      config: {
        ltr_model: ltrModelName,
      },
      rules: rulesets,
      knobs: tpl.knobs,
    },
  });

  const response = await fetch(`${QUERY_EXPANDER_URL}/query/expand`, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      // TODO add authorization header
    },
  });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} (${response.statusText}) - Failed to expand query. `
    );
  }

  return await response.json();
}
