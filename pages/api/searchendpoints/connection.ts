import {
  testSearchEndpointConnection,
  encryptCredentials,
  getSearchEndpoint,
} from "../../../lib/searchendpoints";
import {
  requireUser,
  requireMethod,
  apiHandler,
  requireOnlyOrg,
  HttpError,
} from "../../../lib/apiServer";
import {
  NewEndpointSchema,
  ExistingEndpointSchema,
} from "../../../lib/searchendpoints/types/TestSearchEndpoint";
import { SearchEndpointData } from "../../../lib/searchendpoints/elasticsearch";

export default apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const org = await requireOnlyOrg(req);
  req.body.orgId = org.id;
  delete req.body.testConnection;

  let testEndpoint: SearchEndpointData;

  try {
    const endpoint = NewEndpointSchema.parse(req.body);
    const credentials = encryptCredentials(endpoint.credentials);

    testEndpoint = { ...endpoint, credentials };
  } catch {
    const endpoint = ExistingEndpointSchema.parse(req.body);
    const credentials =
      encryptCredentials(endpoint.credentials) ??
      (await getSearchEndpoint(user, endpoint.id))?.credentials;

    if (!credentials) {
      throw new HttpError(400, "Invalid credentials");
    }

    testEndpoint = { ...endpoint, credentials };
  }

  const result = await testSearchEndpointConnection(user, testEndpoint);
  res.status(200).json(result);
});
