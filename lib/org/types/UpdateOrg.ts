import * as Zod from "zod";

export const UpdateOrgSchema = Zod.object({
  name: Zod.string().nonempty().optional(),
  image: Zod.union([Zod.string().nonempty(), Zod.null()]).optional(),
  domain: Zod.string()
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i
    )
    .optional(),
  bgColor: Zod.string().nonempty().optional(),
  textColor: Zod.string().nonempty().optional(),
});

export type UpdateOrg = Zod.infer<typeof UpdateOrgSchema>;
