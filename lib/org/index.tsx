import prisma, { Prisma, User, SearchEndpoint } from "../prisma";

export function userCanAccessOrg(
  user: User,
  rest?: Prisma.OrgWhereInput
): Prisma.OrgWhereInput {
  const result: Prisma.OrgWhereInput = { users: { some: { userId: user.id } } };
  if (rest) {
    result.AND = rest;
  }
  return result;
}
