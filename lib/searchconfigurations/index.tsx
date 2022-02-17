import _ from "lodash";

import prisma, {
  Prisma,
  Execution,
  User,
  Project,
  SearchConfiguration as PrismaSearchConfiguration,
  SearchConfigurationTag as PrismaSearchConfigurationTag,
  QueryTemplate,
  RulesetVersion,
  Judgement,
  SearchEndpointType,
} from "../prisma";
import { ExposedExecution, formatExecution } from "../execution";
import { userCanAccessProject } from "../projects";

export interface SearchConfiguration extends PrismaSearchConfiguration {
  tags: PrismaSearchConfigurationTag[];
  rulesets?: RulesetVersion[];
  queryTemplate?: QueryTemplate;
}

const scSelect = {
  id: true,
  knobs: true,
  createdAt: true,
};

export type ExposedSearchConfiguration = Pick<
  SearchConfiguration,
  keyof typeof scSelect
> & {
  tags: string[];
  search_endpoint_type: SearchEndpointType;
  index: number;
  latestExecution?: ExposedExecution;
};

type CreateSearchConfigurationInput = {
  queryTemplateId: string;
  projectId: string;
  knobs: any;
  rulesets: RulesetVersion[];
  judgements: WeightedJudgement[];
  parentId?: string;
  id?: string;
  tags?: Array<string>;
};

export function userCanAccessSearchConfiguration(
  user: User,
  rest?: Prisma.SearchConfigurationWhereInput
): Prisma.SearchConfigurationWhereInput {
  const result: Prisma.SearchConfigurationWhereInput = {
    project: userCanAccessProject(user),
  };
  if (rest) {
    result.AND = rest;
  }
  return result;
}

export function formatSearchConfiguration(
  val: SearchConfiguration & { latestExecution?: ExposedExecution },
  type: SearchEndpointType
): ExposedSearchConfiguration {
  const formatted = (_.pick(
    {
      ...val,
      createdAt: val.createdAt.toString(),
    },
    _.keys({ ...scSelect, index: true })
  ) as unknown) as ExposedSearchConfiguration;
  formatted.tags = val.tags.map((t) => t.name);
  formatted.search_endpoint_type = type;
  if (val.latestExecution) {
    formatted.latestExecution = val.latestExecution;
  }
  return formatted;
}

export async function getSearchConfiguration(
  user: User,
  id: string
): Promise<SearchConfiguration | null> {
  const sc = await prisma.searchConfiguration.findFirst({
    where: userCanAccessSearchConfiguration(user, { id }),
    include: {
      tags: true,
      queryTemplate: true,
      rulesets: true,
    },
  });
  return sc;
}

export async function getActiveSearchConfiguration(
  project: Project
): Promise<SearchConfiguration | null> {
  const where: any = {
    projectId: project.id,
  };

  if (project.activeSearchConfigurationId) {
    where.id = project.activeSearchConfigurationId;
  }

  const sc = await prisma.searchConfiguration.findFirst({
    where,
    include: { tags: true },
  });
  return sc;
}

export async function getExecutionSearchConfiguration(
  execution: Execution
): Promise<SearchConfiguration> {
  const sc = await prisma.searchConfiguration.findFirst({
    where: { id: execution.searchConfigurationId },
    include: { tags: true },
  });
  return sc!;
}

export async function loadSearchConfigurations(
  projectId: string,
  refSearchConfigId?: string,
  direction?: "left" | "right"
): Promise<{
  searchConfigurations: (SearchConfiguration & { index: number })[];
  allSCsLength: number;
}> {
  const allSCsLength = await prisma.searchConfiguration.count({
    where: { projectId },
  });

  if (!refSearchConfigId) {
    const searchConfigurations = await prisma.searchConfiguration.findMany({
      where: { projectId },
      orderBy: [{ updatedAt: "desc" }],
      include: {
        tags: true,
        executions: {
          take: 1,
          orderBy: [{ createdAt: "desc" }],
        },
      },
    });

    return {
      searchConfigurations: searchConfigurations.map((searchConfig, index) => {
        const { executions, ...parsedSC } = searchConfig;

        return {
          ...parsedSC,
          index,
          latestExecution: executions[0] && formatExecution(executions[0]),
        };
      }),
      allSCsLength,
    };
  }

  let searchConfigurations: (PrismaSearchConfiguration & {
    tags: PrismaSearchConfigurationTag[];
    executions: Execution[];
  })[];
  if (direction === "left" || direction === "right") {
    searchConfigurations = await prisma.searchConfiguration.findMany({
      take: { left: -5, right: 5 }[direction],
      skip: 1,
      cursor: {
        id: refSearchConfigId,
      },
      where: { projectId },
      include: {
        tags: true,
        executions: {
          take: 1,
          orderBy: [{ createdAt: "desc" }],
        },
      },
    });
  } else {
    const leftSCs = await prisma.searchConfiguration.findMany({
      take: -2,
      skip: 1,
      cursor: {
        id: refSearchConfigId,
      },
      where: { projectId },
      include: {
        tags: true,
        executions: {
          take: 1,
          orderBy: [{ createdAt: "desc" }],
        },
      },
    });
    const rightSCsWithCursor = await prisma.searchConfiguration.findMany({
      take: 3,
      cursor: {
        id: refSearchConfigId,
      },
      where: { projectId },
      include: {
        tags: true,
        executions: {
          take: 1,
          orderBy: [{ createdAt: "desc" }],
        },
      },
    });
    searchConfigurations = [...leftSCs, ...rightSCsWithCursor];
  }
  const startIndex = await prisma.searchConfiguration.count({
    where: {
      projectId,
      createdAt: {
        lt: searchConfigurations[0].createdAt,
      },
    },
  });

  return {
    searchConfigurations: searchConfigurations.map((searchConfig, index) => {
      const { executions, ...parsedSC } = searchConfig;

      return {
        ...parsedSC,
        index: startIndex + index,
        latestExecution: executions[0] && formatExecution(executions[0]),
      };
    }),
    allSCsLength,
  };
}

export async function loadSearchConfiguration(
  user: User,
  id: string,
  index?: number
) {
  const searchConfiguration = await prisma.searchConfiguration.findFirst({
    where: userCanAccessSearchConfiguration(user, { id }),
    include: {
      tags: true,
      executions: {
        take: 1,
        orderBy: [{ createdAt: "desc" }],
      },
    },
  });

  if (!searchConfiguration) return null;

  const { executions, ...parsedSC } = searchConfiguration;

  return {
    ...parsedSC,
    index,
    latestExecution: executions[0] && formatExecution(executions[0]),
  };
}

// [Judgement, weight]
export type WeightedJudgement = [Judgement, number];

export function createSCOperation({
  queryTemplateId,
  projectId,
  knobs,
  parentId,
  rulesets,
  judgements,
  id,
}: Pick<
  CreateSearchConfigurationInput,
  | "queryTemplateId"
  | "projectId"
  | "knobs"
  | "rulesets"
  | "judgements"
  | "parentId"
  | "id"
>) {
  return prisma.searchConfiguration.create({
    data: {
      id,
      queryTemplate: {
        connect: { id: queryTemplateId },
      },
      project: {
        connect: { id: projectId },
      },
      judgements: {
        create: judgements.map(([judgement, weight]) => ({
          judgementId: judgement.id,
          weight,
        })),
      },
      rulesets: {
        connect: rulesets.map((rsv) => ({
          id: rsv.id,
        })),
      },
      knobs,
      parent: (Boolean(parentId) || undefined) && {
        connect: { id: parentId },
      },
    },
    include: { tags: true },
  });
}

export async function createSearchConfiguration({
  queryTemplateId,
  projectId,
  knobs,
  parentId,
  rulesets,
  judgements,
  id,
  tags,
}: CreateSearchConfigurationInput): Promise<SearchConfiguration> {
  const sc = await createSCOperation({
    queryTemplateId,
    projectId,
    knobs,
    parentId,
    rulesets,
    judgements,
    id,
  });
  if (tags) {
    await prisma.$transaction(
      tags.map((tag) => upsertSearchConfigurationTag(projectId, sc, tag))
    );
  }
  return sc;
}

export async function getSearchConfigurationProject(
  config: SearchConfiguration
): Promise<Project> {
  const project = await prisma.project.findFirst({
    where: {
      queryTemplates: {
        some: {
          searchConfigurations: {
            some: { id: config.id },
          },
        },
      },
    },
  });
  return project!;
}

// Private method which returns an incomplete prisma operation.
function upsertSearchConfigurationTag(
  projectId: string,
  sc: SearchConfiguration,
  name: string
) {
  return prisma.searchConfigurationTag.upsert({
    where: { projectId_name: { projectId: projectId, name } },
    update: { searchConfigurationId: sc.id },
    create: {
      projectId: projectId,
      searchConfigurationId: sc.id,
      name,
    },
  });
}
