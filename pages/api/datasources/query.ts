import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import prisma, { Datasource } from "../../../lib/prisma";
import { notAuthorized } from "../../../lib/errors";
import { getUser } from "../../../lib/authServer";
import { userCanAccessDatasource, handleQuery } from "../../../lib/datasources";

const querySchema = z.object({
  query: z.string(),
  datasourceId: z.number(),
});

export default async function query(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "must use POST" });
  }
  const input = querySchema.safeParse(req.body);
  const { user } = await getUser(req);
  if (!user) {
    return notAuthorized(res);
  }
  if (!input.success) {
    return res.status(400).json(input.error);
  }
  const { datasourceId, query } = input.data;
  const datasource = (await prisma.datasource.findFirst({
    where: userCanAccessDatasource(user, { id: datasourceId }),
  })) as Datasource | null;
  if (!datasource) {
    return notAuthorized(res);
  }
  const result = await handleQuery(datasource, query);
  return res.status(200).json(result);
}
