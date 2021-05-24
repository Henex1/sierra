import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  /* eslint-disable */
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }

  // @ts-ignore
  prisma = global.prisma;
  /* eslint-enable */
}

export default prisma;
export * from "@prisma/client";

export type OffsetPagination = {
  take?: number;
  skip?: number;
};
