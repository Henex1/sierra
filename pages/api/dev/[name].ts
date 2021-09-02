import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import * as path from "path";

import { RulesetVersionValue } from "../../../lib/rulesets/rules";
import prisma from "../../../lib/prisma";
import { setVotes, parseVotesCsv } from "../../../lib/judgements";
import { createExecution } from "../../../lib/execution";
import { notAuthorized, notFound } from "../../../lib/errors";
import { getUser, ValidUserSession } from "../../../lib/authServer";
import { userCanAccessOrg } from "../../../lib/org";
import { createSearchEndpoint } from "../../../lib/searchendpoints";
import { createRuleset, createRulesetVersion } from "../../../lib/rulesets";
import {
  createQueryTemplate,
  updateQueryTemplate,
} from "../../../lib/querytemplates";

// prettier-ignore
const mockRuleset: RulesetVersionValue = {
  conditions: [],
  rules: [
    {
      expression: "notebook",
      expressionType: 'contained',
      isCaseSensitive: false,
      instructions: [
        { type: "synonym", directed: false, weight: 1, term: "laptop", enabled: true },
        { type: "synonym", directed: true, weight: 1, term: "netbook", enabled: true },
        { type: "updown", weight: 2, term: "asus", enabled: true },
        { type: "updown", weight: -3, term: "keyboard", enabled: false },
        { type: "updown", weight: -4, term: "mouse", enabled: true },
        { type: "updown", weight: -4, term: "Optical", enabled: true },
        { type: "updown", weight: -1, term: "Power Cord", enabled: true },
        { type: "updown", weight: -3, term: "spare part", enabled: true },
        { type: "filter", include: false, term: "title:accessory", enabled: true },
        { type: "filter", include: false, term: "title:notebook", enabled: true },
      ],
      enabled: true,
    },
    {
      expression: "cheap iphone",
      expressionType: 'contained',
      isCaseSensitive: false,
      instructions: [
        { type: "delete", term: "cheap", enabled: true },
      ],
      enabled: true,
    },
  ],
};

const mockQuery = JSON.stringify({
  query: {
    match: {
      title: "##$query##",
    },
  },
});

const seedJudgementFile = path.join(
  process.cwd(),
  "fixtures/Broad_Query_Set_rated.csv"
);

async function handleSeed(
  { user }: ValidUserSession,
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const org = await prisma.org.findFirst({ where: userCanAccessOrg(user) });
  if (!org) {
    return res.status(500).json({ error: "user has no attached org" });
  }

  const searchEndpoint = await createSearchEndpoint(user, {
    orgId: org.id,
    name: "Local Elasticsearch",
    description: "Elasticsearch instance on localhost.",
    whitelist: [],
    resultId: "_id",
    displayFields: ["title:title", "short_description", "image:img_thumb"],
    type: "ELASTICSEARCH",
    info: { endpoint: "http://localhost:9200/", index: "icecat" },
    credentials: null,
  });

  const project = await prisma.project.create({
    data: {
      orgId: org.id,
      searchEndpointId: searchEndpoint.id,
      name: "Dev Project",
    },
  });

  const judgement = await prisma.judgement.create({
    data: {
      projectId: project.id,
      name: "Crowdsourced Judgements",
    },
  });
  const votes = parseVotesCsv(fs.readFileSync(seedJudgementFile, "utf-8"));
  await setVotes(judgement, votes);

  const ruleset = await createRuleset(project, {
    name: "Dev Ruleset",
  });
  let rvBase = await createRulesetVersion(ruleset, {
    parentId: null,
    value: mockRuleset,
  });
  const rulesetVersionId = rvBase.id;
  // Fake a tree of rulesetVersions
  for (let i = 0; i < 2; i++) {
    rvBase = await createRulesetVersion(ruleset, {
      parentId: rvBase.id,
      value: mockRuleset,
    });
  }
  const rvChildren = [rvBase, rvBase];
  for (let i = 0; i < 2; i++) {
    await createRulesetVersion(ruleset, {
      parentId: rvChildren[i].id,
      value: mockRuleset,
    });
  }

  let qtBase = await createQueryTemplate(project, {
    description: "Initial query template",
    query: mockQuery,
    knobs: {},
  });
  // Fake a tree of revisions
  for (let i = 0; i < 2; i++) {
    qtBase = await updateQueryTemplate(qtBase, {
      description: `Update number ${i + 1}`,
      query: qtBase.query,
      knobs: qtBase.knobs,
    });
  }
  const qtChildren = [qtBase, qtBase];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < qtChildren.length; j++) {
      qtChildren[j] = await updateQueryTemplate(qtChildren[j], {
        description: `Fork ${j + 1}.${i + 1}`,
        query: qtChildren[j].query,
        knobs: qtChildren[j].knobs,
        tags: [`fork-${j + 1}`],
      });
    }
  }

  const sc = await prisma.searchConfiguration.create({
    data: {
      queryTemplate: {
        connect: {
          id: qtChildren[0].id,
        },
      },
      judgements: { create: [{ judgementId: judgement.id, weight: 1.0 }] },
      rulesets: {
        connect: {
          id: rulesetVersionId,
        },
      },
    },
  });

  await createExecution(sc, project.id);

  return res.status(200).json({ success: true });
}

type Mutator = (
  user: ValidUserSession,
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;
const routes: { [name: string]: Mutator } = {
  seed: handleSeed,
};

export default async function mutate(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "must use POST" });
  }
  const session = await getUser(req);
  if (!session.user) {
    return notAuthorized(res);
  }
  const { name } = req.query;
  const func = routes[name as string];
  if (func) {
    return func(session as ValidUserSession, req, res);
  } else {
    return notFound(res);
  }
}
