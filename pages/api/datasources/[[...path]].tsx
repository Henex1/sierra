import { NextApiRequest, NextApiResponse } from "next";

import prisma, { User, Datasource } from "../../../lib/prisma";
import { DatasourceSchema } from "../../../lib/schema";
import { getUser } from "../../../lib/authServer";
import {
  createDatasource,
  deleteDatasource,
  updateDatasource,
} from "../../../lib/datasources";
import { notAuthorized, HttpError } from "../../../lib/errors";

async function handleCreateDatasource(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { user, session } = await getUser(req);
  if (!user) {
    return notAuthorized(res);
  }
  const org = await prisma.org.findFirst({
    where: { users: { some: { userId: user.id } } },
  });
  if (!org) {
    return res.status(500).json({ error: "user has no attached org" });
  }
  const data = req.body;
  data.orgId = org.id;
  try {
    const ds = await createDatasource(user, data);
    res.status(200).json({ datasource: ds });
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json(err.data);
    } else {
      res.status(500).json({ error: "internal server error" });
    }
  }
}

async function handleDeleteDatasource(
  req: NextApiRequest,
  res: NextApiResponse,
  idStr: string
): Promise<void> {
  const { user } = await getUser(req);
  if (!user) {
    return notAuthorized(res);
  }
  try {
    const ds = await deleteDatasource(user, idStr);
    res.status(200).json({ success: true });
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json(err.data);
    } else {
      res.status(500).json({ error: "internal server error" });
    }
  }
}

async function handleUpdateDatasource(
  req: NextApiRequest,
  res: NextApiResponse,
  idStr: string
): Promise<void> {
  const { user } = await getUser(req);
  if (!user) {
    return notAuthorized(res);
  }
  try {
    const datasource = await updateDatasource(user, idStr, req.body);
    res.status(200).json({ datasource });
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json(err.data);
    } else {
      res.status(500).json({ error: "internal server error" });
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const method = req.method;
  const path = req.query.path || [];
  if (method === "POST" && path.length === 0) {
    return handleCreateDatasource(req, res);
  } else if (method === "DELETE" && path.length === 1) {
    return handleDeleteDatasource(req, res, path[0]);
  } else if (method === "PATCH" && path.length === 1) {
    return handleUpdateDatasource(req, res, path[0]);
  } else {
    return res.status(404).json({ error: "not found", method, path });
  }
}
