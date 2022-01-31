import { NextApiResponse } from "next";
import * as z from "zod";
import {
  apiHandler,
  requireBody,
  SierraApiRequest,
} from "../../../lib/apiServer";
import { loadExecutions } from "../../../lib/execution";

export default apiHandler(
  async (req: SierraApiRequest, res: NextApiResponse): Promise<void> => {
    const { projectId, refExecutionId, direction } = requireBody(
      req,
      z.object({
        projectId: z.string(),
        refExecutionId: z.string().optional(),
        direction: z.union([z.literal("left"), z.literal("right")]).optional(),
      })
    );

    const { executions } = await loadExecutions(
      projectId,
      refExecutionId,
      direction
    );

    return res.status(200).json(executions);
  }
);
