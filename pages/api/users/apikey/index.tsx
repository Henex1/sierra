import {
  apiHandler,
  requireMethod,
  requireUser,
} from "../../../../lib/apiServer";
import { createApiKey } from "../../../../lib/users/apikey";

export default apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);

  await createApiKey(user);
  res.status(200).json({ success: true });
});
