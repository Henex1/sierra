import * as z from "zod";

export const SearchEndpointType = z.union([
  z.literal("ELASTICSEARCH"),
  z.literal("OPEN_SEARCH"),
  z.literal("SOLR"),
  z.literal("VESPA"),
  z.literal("REDIS_SEARCH"),
]);

export const ElasticsearchInfoSchema = z.object({
  endpoint: z.string(),
  index: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const OpenSearchInfoSchema = z.object({
  endpoint: z.string(),
  index: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const SolrInfoSchema = z.object({
  endpoint: z.string(),
});

export const VespaInfoSchema = z.object({
  endpoint: z.string(),
});

export const RedisSearchInfoSchema = z.object({
  endpoint: z.string(),
});

export const SearchEndpointInfo = z.union([
  ElasticsearchInfoSchema,
  OpenSearchInfoSchema,
  SolrInfoSchema,
  VespaInfoSchema,
  RedisSearchInfoSchema,
]);

export const SearchEndpointSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  orgId: z.number(),
  name: z.string(),
  description: z.string(),
  whitelist: z.array(z.string()),
  resultId: z.string(),
  displayFields: z.array(z.string()),
  type: SearchEndpointType,
  info: SearchEndpointInfo,
});
