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

const QUERY_EXPANDER_URL = requireEnv("QUERY_EXPANDER_URL");

export async function expandQuery(
  endpoint: SearchEndpoint,
  tpl: QueryTemplate,
  rulesets: RulesetVersion[],
  ltrModelName: string | undefined,
  phrase: string
): Promise<ExpandedQuery> {
  try {
    if (!["ELASTICSEARCH", "OPEN_SEARCH"].includes(endpoint.type)) {
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
      },
    });
    return await response.json();
  } catch (err) {
    throw new HttpError(500, ErrorMessage.FailedToExpandQuery);
  }
}
