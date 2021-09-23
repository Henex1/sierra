import { NextApiResponse } from "next";
import * as z from "zod";

import {
  apiHandler,
  requireUser,
  requireQuery,
  SierraApiRequest,
} from "../../../lib/apiServer";
import {
  getRuleset,
  getLatestRulesetVersion,
  formatRuleset,
  formatRulesetVersion,
} from "../../../lib/rulesets";
import { getProject } from "../../../lib/projects";
import {
  getSearchEndpoint,
  getQueryInterface,
} from "../../../lib/searchendpoints";
import { User } from "../../../lib/prisma";
import { notFound } from "../../../lib/errors";
import { ErrorMessage } from "../../../lib/errors/constants";

export async function getRulesetEditorProps(id: string, user: User) {
  const ruleset = await getRuleset(user, id);
  if (!ruleset) {
    return { notFound: true };
  }

  let version = await getLatestRulesetVersion(ruleset);
  if (!version) {
    // Create a fake initial version
    version = {
      id: null as any,
      rulesetId: ruleset.id,
      parentId: null,
      value: { rules: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  const project = await getProject(user, ruleset.projectId);
  if (!project) {
    return { notFound: true };
  }
  const searchEndpoint = await getSearchEndpoint(
    user,
    project.searchEndpointId
  );
  if (!searchEndpoint) {
    return { notFound: true };
  }
  const iface = getQueryInterface(searchEndpoint);

  return {
    ruleset: formatRuleset(ruleset),
    version: formatRulesetVersion(version),
    facetFilterFields: await iface.getFields({
      aggregateable: true,
      type: "keyword",
    }),
  };
}

export default apiHandler(
  async (req: SierraApiRequest, res: NextApiResponse): Promise<any> => {
    const user = requireUser(req);
    const { id } = requireQuery(req, z.object({ id: z.string() }));

    const props = await getRulesetEditorProps(id, user);
    if (props.notFound) {
      return notFound(res, ErrorMessage.RulesetNotFound);
    }
    res.status(200).json({ ...props });
  }
);
