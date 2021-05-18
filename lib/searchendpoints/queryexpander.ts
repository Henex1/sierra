import fetch from "node-fetch";

import { SearchEndpoint, QueryTemplate, RulesetVersion } from "../prisma";
import { requireEnv } from "../env";

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
    if (endpoint.type !== "ELASTICSEARCH" && endpoint.type !== "OPEN_SEARCH") {
      throw new Error(
        `Search endpoint type ${endpoint.type} cannot be expanded`
      );
    }
    const config: Record<string, unknown> = {};
    Object.entries(tpl.knobs as Record<string, unknown>).forEach(([k, v]) => {
      config[k] = v;
    });
    config.rules = rulesets.map((rv) => (rv.value as any).rules);
    config.ltr_model = ltrModelName;
    const body = JSON.stringify({
      template: JSON.parse(tpl.query),
      config,
    });
    const response = await fetch(
      `${QUERY_EXPANDER_URL}/query/expand?q=${encodeURI(phrase)}`,
      {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return await response.json();
  } catch (e) {
    throw new Error(`Failed to expand query ${e}`);
  }
}
