import * as z from "zod";

import { getSearchEndpoint } from "../../../lib/searchendpoints";
import {
  requireUser,
  requireBody,
  requireMethod,
  apiHandler,
} from "../../../lib/apiServer";
import { expandQuery } from "../../../lib/searchendpoints/queryexpander";
import { notFound } from "../../../lib/errors";
import { ErrorMessage } from "../../../lib/errors/constants";
import { getSearchConfiguration } from "../../../lib/searchconfigurations";

export default apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { searchConfigurationId, searchEndpointId, phrase } = requireBody(
    req,
    z.object({
      searchConfigurationId: z.string(),
      searchEndpointId: z.string(),
      phrase: z.string(),
    })
  );

  const searchConfiguration = await getSearchConfiguration(
    user,
    searchConfigurationId
  );
  if (!searchConfiguration) {
    return notFound(res, ErrorMessage.SearchConfigurationNotFound);
  }

  const searchEndpoint = await getSearchEndpoint(user, searchEndpointId);
  if (!searchEndpoint) {
    return notFound(res, ErrorMessage.SearchEndpointNotFound);
  }

  const query = await expandQuery(
    searchEndpoint,
    searchConfiguration.queryTemplate!,
    searchConfiguration.knobs,
    searchConfiguration.rulesets!,
    undefined,
    phrase
  );

  return res.status(200).json({ query });
});
