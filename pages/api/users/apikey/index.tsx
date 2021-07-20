import {
  apiHandler,
  requireBody,
  requireMethod,
  requireUser,
} from "../../../../lib/apiServer";
import { createApiKey, updateApiKey } from "../../../../lib/users/apikey";
import * as z from "zod";

const apiKeyCreate = z.object({
  alias: z.string(),
});

const apiKeyUpdate = z.object({
  id: z.string(),
  disabled: z.boolean(),
});

const handleCreateApiKey = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const body = requireBody(req, apiKeyCreate);
  await createApiKey(user, body.alias);
  res.status(200).json({ success: true });
});

const handleUpdateApiKey = apiHandler(async (req, res) => {
  requireMethod(req, "PATCH");
  const user = requireUser(req);
  const body = requireBody(req, apiKeyUpdate);
  await updateApiKey(user, body.id, body.disabled);
  res.status(200).json({ success: true });
});

export default apiHandler(async (req, res) => {
  const method = req.method;

  if (method === "POST") {
    return handleCreateApiKey(req, res);
  } else if (method === "PATCH") {
    return handleUpdateApiKey(req, res);
  }
});
