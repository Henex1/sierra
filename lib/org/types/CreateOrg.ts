import * as Zod from "zod";

export const CreateOrgSchema = Zod.object({
  name: Zod.string().nonempty(),
  image: Zod.string().nonempty().optional(),
  domain: Zod.string().url().optional(),
});

export type CreateOrg = Zod.infer<typeof CreateOrgSchema>;
