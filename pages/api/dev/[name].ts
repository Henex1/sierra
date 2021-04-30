import _ from "lodash";
import { NextApiRequest, NextApiResponse } from "next";

import { RulesetVersionValue } from "../../../lib/rulesets/rules";
import prisma, { Prisma } from "../../../lib/prisma";
import { notAuthorized, notFound } from "../../../lib/errors";
import { getUser, ValidUserSession } from "../../../lib/authServer";
import { userCanAccessOrg } from "../../../lib/org";

// prettier-ignore
const mockRuleset: RulesetVersionValue = {
  rules: [
    {
      expression: "notebook",
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

const mockPhrases = [
  "notebook",
  "fruits",
  "tote bags",
  "briefcase",
  "suitcase",
].map(
  (phrase: string): Prisma.SearchPhraseExecutionCreateWithoutExecutionInput => {
    const randomValue = phrase
      .split("")
      .map((c) => c.charCodeAt(0))
      .reduce((a, b) => a + b);
    const s = ((randomValue * 79) % 1000) / 10;
    const r = Math.floor((randomValue * 97) % 250);
    return {
      phrase,
      totalResults: r,
      results: _.times(20, (i) => [
        `doc_${(randomValue * i) % 1000000}`,
        ((randomValue + i * 97) % 1000) / 10,
      ]),
      explanation: {},
      combinedScore: s,
      allScores: {
        "ndc@5": s,
        "ap@5": s,
        "p@5": s,
      },
    };
  }
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

  const searchEndpoint = await prisma.searchEndpoint.create({
    data: {
      orgId: org.id,
      name: "Local Elasticsearch",
      description: "Elasticsearch instance on localhost.",
      whitelist: [],
      resultId: "_id",
      displayFields: [],
      type: "ELASTICSEARCH",
      info: { endpoint: "http://localhost:9200/icecat/_search" },
    },
  });

  const project = await prisma.project.create({
    data: {
      orgId: org.id,
      searchEndpointId: searchEndpoint.id,
      name: "Dev Project",
    },
  });

  await prisma.ruleset.create({
    data: {
      projectId: project.id,
      name: "Dev Ruleset",
      rulesetVersion: {
        create: {
          value: mockRuleset,
        },
      },
    },
  });

  const queryTemplate = await prisma.queryTemplate.create({
    data: {
      projectId: project.id,
      query: mockQuery,
      knobs: {},
    },
  });

  const sc = await prisma.searchConfiguration.create({
    data: {
      queryTemplateId: queryTemplate.id,
    },
  });

  const execution = await prisma.execution.create({
    data: {
      searchConfigurationId: sc.id,
      meta: { documents: 150000 },
      combinedScore: 85,
      allScores: {
        "ndc@5": 90,
        "ap@5": 10,
        "p@5": 45,
      },
      phrases: {
        create: mockPhrases,
      },
    },
  });

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
