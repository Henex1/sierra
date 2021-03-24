import { HttpError } from "../errors";
import prisma, { Prisma, User, Datasource } from "../prisma";
import { DatasourceSchema } from "../schema";
import { getUser, UserSession } from "../auth";
import { userCanAccessOrg } from "../org";
import { handleElasticsearchQuery } from "./elasticsearch";

// This is the list of keys which are included in user requests for Datasource
// by default.
const selectKeys = {
  id: true,
  orgId: true,
  name: true,
  type: true,
  info: true,
};

export type ExposedDatasource = Pick<Datasource, keyof typeof selectKeys>;

export function userCanAccessDatasource(
  user: User,
  rest?: Prisma.DatasourceWhereInput
): Prisma.DatasourceWhereInput {
  const result: Prisma.DatasourceWhereInput = { org: userCanAccessOrg(user) };
  if (rest) {
    result.AND = rest;
  }
  return result;
}

export async function getDatasource(
  user: User,
  idStr: string
): Promise<ExposedDatasource | null> {
  const id = parseInt(idStr, 10);
  const ds = await prisma.datasource.findFirst({
    where: userCanAccessDatasource(user, { id }),
    select: selectKeys,
  });
  return ds;
}

export async function listDatasources({
  user,
}: UserSession): Promise<ExposedDatasource[]> {
  if (!user) {
    return [];
  }
  const datasources = await prisma.datasource.findMany({
    where: userCanAccessDatasource(user),
    select: selectKeys,
  });
  return datasources;
}

export async function createDatasource(
  user: User,
  input: ExposedDatasource
): Promise<ExposedDatasource> {
  const result = DatasourceSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  }).safeParse(input);
  if (!result.success) {
    return Promise.reject(new HttpError(400, result.error));
  }

  const isValidOrg = await prisma.orgUser.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: result.data.orgId } },
  });
  if (!isValidOrg) {
    return Promise.reject(new HttpError(400, { error: "invalid org" }));
  }

  const ds = await prisma.datasource.create({
    data: result.data,
    select: selectKeys,
  });
  return ds;
}

export async function deleteDatasource(
  user: User,
  idStr: string
): Promise<void> {
  const ds = await getDatasource(user, idStr);
  if (!ds) {
    return Promise.reject(new HttpError(404, { error: "not found" }));
  }
  await prisma.datasource.delete({ where: { id: ds.id } });
}

export async function updateDatasource(
  user: User,
  idStr: string,
  input: ExposedDatasource
): Promise<ExposedDatasource> {
  const result = DatasourceSchema.omit({ id: true, type: true })
    .partial()
    .safeParse(input);
  if (!result.success) {
    return Promise.reject(new HttpError(400, result.error));
  }
  if ("orgId" in result.data) {
    const isValidOrg = await prisma.orgUser.findUnique({
      where: { userId_orgId: { userId: user.id, orgId: result.data.orgId! } },
    });
    if (!isValidOrg) {
      return Promise.reject(new HttpError(400, { error: "invalid org" }));
    }
  }

  let ds = await getDatasource(user, idStr);
  if (!ds) {
    return Promise.reject(new HttpError(404, { error: "not found" }));
  }

  ds = await prisma.datasource.update({
    where: { id: ds.id },
    data: result.data,
    select: selectKeys,
  });
  return ds;
}

export async function handleQuery(
  datasource: Datasource,
  query: string
): Promise<unknown> {
  if (datasource.type === "ELASTICSEARCH") {
    return handleElasticsearchQuery(datasource, query);
  }
  throw new Error(
    `unsupported datasource type ${JSON.stringify(datasource.type)}`
  );
}
