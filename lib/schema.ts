import * as z from "zod";

export const DatasourceSchema = z.object({
  id: z.number(),
  orgId: z.number(),
  name: z.string(),
  //type: z.union([z.literal("ELASTICSEARCH")]),
  type: z.literal("ELASTICSEARCH"),
  info: z.object({}).nonstrict(),
});
