import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../lib/prisma";
import { DatasourceSchema } from "../../../lib/schema";
import { getUser } from "../../../lib/auth";

async function getDatasource(user: User, idStr: string): Promise<Datasource> {
  const id = parseInt(idStr, 10);
  const ds = await prisma.datasource.findFirst({
    where: { id, org: { users: { some: { userId: user.id } } } },
  });
  return ds;
}

async function createDatasource(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { user, session } = await getUser(req);
  if (!user) {
    return res.status(401).json({ error: "not authorized" });
  }
  const result = DatasourceSchema.omit({ id: true }).safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }

  const isValidOrg = await prisma.orgUser.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: result.data.orgId } },
  });
  if (!isValidOrg) {
    return res.status(400).json({ error: "invalid org" });
  }

  const ds = await prisma.datasource.create({ data: result.data });

  res.status(200).json({ datasource: ds });
}

async function deleteDatasource(
  req: NextApiRequest,
  res: NextApiResponse,
  idStr: string
): Promise<void> {
  const { user, session } = await getUser(req);
  if (!user) {
    return res.status(401).json({ error: "not authorized" });
  }
  const ds = await getDatasource(user, idStr);
  if (!ds) {
    return res.status(404).json({ error: "not found" });
  }
  await prisma.datasource.delete({ where: { id } });
  res.status(200).json({ success: true });
}

async function updateDatasource(
  req: NextApiRequest,
  res: NextApiResponse,
  idStr: string
): Promise<void> {
  const { user, session } = await getUser(req);
  if (!user) {
    return res.status(401).json({ error: "not authorized" });
  }
  const result = DatasourceSchema.omit({ id: true, orgId: true, type: true })
    .partial()
    .safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }

  let ds = await getDatasource(user, idStr);
  if (!ds) {
    return res.status(404).json({ error: "not found" });
  }

  ds = await prisma.datasource.update({
    where: { id: ds.id },
    data: result.data,
  });

  res.status(200).json({ datasource: ds });
}

async function readDatasource(
  req: NextApiRequest,
  res: NextApiResponse,
  idStr: string
): Promise<void> {
  const { user, session } = await getUser(req);
  if (!user) {
    return res.status(401).json({ error: "not authorized" });
  }
  const ds = await getDatasource(user, idStr);
  if (!ds) {
    return res.status(404).json({ error: "not found" });
  }

  res.status(200).json({ datasource: ds });
}

async function readAllDatasources(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { user, session } = await getUser(req);
  if (!user) {
    return res.status(401).json({ error: "not authorized" });
  }

  const datasources = await prisma.datasource.findMany({
    where: { org: { users: { some: { userId: user.id } } } },
  });

  res.status(200).json({ datasources });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const method = req.method;
  const path = req.query.path || [];
  if (method === "GET" && path.length === 0) {
    return readAllDatasources(req, res);
  } else if (method === "POST" && path.length === 0) {
    return createDatasource(req, res);
  } else if (method === "GET" && path.length === 1) {
    return readDatasource(req, res, path[0]);
  } else if (method === "DELETE" && path.length === 1) {
    return deleteDatasource(req, res, path[0]);
  } else if (method === "PATCH" && path.length === 1) {
    return updateDatasource(req, res, path[0]);
  } else {
    return res.status(404).json({ error: "not found", method, path });
  }
}
