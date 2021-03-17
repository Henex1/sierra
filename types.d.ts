import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient;
}

declare module "*.module.css" {
  const content: { [className: string]: string };
  export default content;
}
