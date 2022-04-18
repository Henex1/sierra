import * as Zod from "zod";

export const CreateOrgSchema = Zod.object({
  name: Zod.string().nonempty(),
  image: Zod.string().nonempty().optional(),
  domain: Zod.string()
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i
    )
    .optional(),
  bgColor: Zod.string().nonempty().optional(),
  textColor: Zod.string().nonempty().optional(),
});

export type CreateOrg = Zod.infer<typeof CreateOrgSchema>;
