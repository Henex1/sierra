import {
  createSearchEndpointSchema,
  testSearchEndpointConnection,
  encryptCredentials,
} from "../../../lib/searchendpoints";
import {
  requireUser,
  requireBody,
  requireMethod,
  apiHandler,
  requireOnlyOrg,
} from "../../../lib/apiServer";

export default apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const org = await requireOnlyOrg(req);
  req.body.orgId = org.id;
  delete req.body.testConnection;
  const body = requireBody(req, createSearchEndpointSchema);

  (body as any).credentials = body.credentials
    ? encryptCredentials(body.credentials)
    : "";

  const result = await testSearchEndpointConnection(user, body);
  res.status(200).json(result);
});
