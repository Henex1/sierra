import * as Zod from "zod";

export const UpdateOrgSchema = Zod.object({
  name: Zod.string().nonempty().optional(),
  image: Zod.union([Zod.string().nonempty(), Zod.null()]).optional(),
  domain: Zod.union([Zod.string().url(), Zod.null()]).optional(),
});

export type UpdateOrg = Zod.infer<typeof UpdateOrgSchema>;
