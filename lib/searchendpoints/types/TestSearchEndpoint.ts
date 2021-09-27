import * as Z from "zod";
import { SearchEndpointSchema } from "../../schema";

export const NewEndpointSchema = SearchEndpointSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NewEndpoint = Z.infer<typeof NewEndpointSchema>;

export const ExistingEndpointSchema = SearchEndpointSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type ExistingEndpoint = Z.infer<typeof ExistingEndpointSchema>;
