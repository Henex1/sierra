import {
  apiHandler,
  requireBody,
  requireMethod,
  requireUser,
} from "../../../../lib/apiServer";
import { createApiKey } from "../../../../lib/users/apikey";
import * as z from "zod";

export default apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const body = requireBody(
    req,
    z.object({
      alias: z.string(),
    })
  );
  await createApiKey(user, body.alias);
  res.status(200).json({ success: true });
});
