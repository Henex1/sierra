import { loadSearchConfigurations } from "lib/searchconfigurations";
import { NextApiResponse } from "next";
import * as z from "zod";
import {
  apiHandler,
  requireBody,
  SierraApiRequest,
} from "../../../../lib/apiServer";

export default apiHandler(
  async (req: SierraApiRequest, res: NextApiResponse): Promise<void> => {
    const { projectId, refSearchConfigId, direction } = requireBody(
      req,
      z.object({
        projectId: z.string(),
        refSearchConfigId: z.string().optional(),
        direction: z.union([z.literal("left"), z.literal("right")]).optional(),
      })
    );

    const { searchConfigurations } = await loadSearchConfigurations(
      projectId,
      refSearchConfigId,
      direction
    );

    return res.status(200).json(searchConfigurations);
  }
);
