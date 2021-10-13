import { NextApiResponse } from "next";
import * as z from "zod";
import {
  apiHandler,
  requireBody,
  requireUser,
  SierraApiRequest,
} from "../../../lib/apiServer";
import { getCurrentExecution } from "../../../lib/execution";
import { getSearchConfiguration } from "../../../lib/searchconfigurations";
import { notFound } from "../../../lib/errors";
import { ErrorMessage } from "../../../lib/errors/constants";

export default apiHandler(
  async (req: SierraApiRequest, res: NextApiResponse): Promise<void> => {
    const { executionId, searchConfigurationId } = requireBody(
      req,
      z.object({ executionId: z.string(), searchConfigurationId: z.string() })
    );
    const user = requireUser(req);

    const sc = await getSearchConfiguration(user, searchConfigurationId);
    if (!sc) {
      return notFound(res, ErrorMessage.SearchConfigurationNotFound);
    }

    const currentExecution = await getCurrentExecution(user, sc, executionId);
    if (!currentExecution) {
      return notFound(res, ErrorMessage.ExecutionNotFound);
    }

    return res.status(200).json(currentExecution);
  }
);
