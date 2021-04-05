import * as z from "zod";

// Replace with:
// z.union([z.literal("ELASTICSEARCH"), z.literal("SOMETHING_ELSE")]);
export const SearchEndpointType = z.literal("ELASTICSEARCH");

export const ElasticsearchInfoSchema = z.object({
  endpoint: z.string(),
});

/* Replace .merge(z.object()) with .merge(z.union(z.object(), ...)) */
export const SearchEndpointSchema = z
  .object({
    id: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
    orgId: z.number(),
    name: z.string(),
  })
  .merge(
    z.object({
      type: z.literal("ELASTICSEARCH"),
      info: ElasticsearchInfoSchema,
    })
  );

export const ProjectSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  searchEndpointType: SearchEndpointType,
  orgId: z.number(),
  name: z.string(),
});
