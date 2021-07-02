import {
  apiHandler,
  requireMethod,
  requireQuery,
  requireUser,
} from "../../../../lib/apiServer";
import { deleteApiKey } from "../../../../lib/users/apikey";
import * as z from "zod";

export default apiHandler(async (req, res) => {
  requireMethod(req, "DELETE");
  const user = requireUser(req);
  const { id } = requireQuery(req, z.object({ id: z.string() }));
  await deleteApiKey(user, id);
  res.status(200).json({ success: true });
});
