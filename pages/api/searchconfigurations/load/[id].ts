import { loadSearchConfiguration } from "lib/searchconfigurations";
import { NextApiResponse } from "next";
import * as z from "zod";
import {
  apiHandler,
  requireBody,
  requireQuery,
  requireUser,
  SierraApiRequest,
} from "../../../../lib/apiServer";

export default apiHandler(
  async (req: SierraApiRequest, res: NextApiResponse): Promise<void> => {
    const user = requireUser(req);
    const { id } = requireQuery(req, z.object({ id: z.string() }));
    const { index } = requireBody(req, z.object({ index: z.number() }));

    const searchConfiguration = await loadSearchConfiguration(user, id, index);

    return res.status(200).json(searchConfiguration);
  }
);
