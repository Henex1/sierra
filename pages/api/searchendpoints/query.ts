import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import prisma, { SearchEndpoint } from "../../../lib/prisma";
import { notAuthorized } from "../../../lib/errors";
import { getUser } from "../../../lib/authServer";
import {
  userCanAccessSearchEndpoint,
  handleQuery,
} from "../../../lib/searchendpoints";

const querySchema = z.object({
  query: z.string(),
  searchEndpointId: z.number(),
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
  const { searchEndpointId, query } = input.data;
  const searchEndpoint = (await prisma.searchEndpoint.findFirst({
    where: userCanAccessSearchEndpoint(user, { id: searchEndpointId }),
  })) as SearchEndpoint | null;
  if (!searchEndpoint) {
    return notAuthorized(res);
  }
  const result = await handleQuery(searchEndpoint, query);
  return res.status(200).json(result);
}
