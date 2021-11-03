import * as Zod from "zod";

export const SizeSchema = Zod.object({
  src: Zod.string().url("src should be an URL"),
  width: Zod.number(),
  height: Zod.number(),
});

export type Size = Zod.infer<typeof SizeSchema>;

export const ImageSchema = Zod.object({
  id: Zod.string().nonempty("Id cannot be empty string"),
  sizes: Zod.array(SizeSchema),
});

export type Image = Zod.infer<typeof ImageSchema>;
