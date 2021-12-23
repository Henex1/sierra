import * as Zod from "zod";

export const NewOrgUserSchema = Zod.object({
  email: Zod.string().nonempty(),
  role: Zod.string().nonempty(),
});

export type NewOrgUser = Zod.infer<typeof NewOrgUserSchema>;
