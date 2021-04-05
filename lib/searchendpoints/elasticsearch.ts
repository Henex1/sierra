import * as z from "zod";
import fetch from "node-fetch";

import { SearchEndpoint } from "../prisma";
import { ElasticsearchInfoSchema } from "../schema";

type ElasticsearchInfo = z.infer<typeof ElasticsearchInfoSchema>;

export async function handleElasticsearchQuery(
  searchEndpoint: SearchEndpoint,
  query: string
): Promise<unknown> {
  const { endpoint } = searchEndpoint.info as ElasticsearchInfo;
  const response = await fetch(endpoint, {
    method: "POST",
    body: query,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  return result;
}
