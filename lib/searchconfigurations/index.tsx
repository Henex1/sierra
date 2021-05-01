import _ from "lodash";
import prisma, {
  User,
  Project,
  SearchConfiguration,
  JudgementSearchConfiguration,
} from "../prisma";
import { userCanAccessProject } from "../projects";
import { ExposedQueryTemplate } from "../querytemplates";

const scSelect = {
  id: true,
};

export type ExposedSearchConfiguration = Pick<
  SearchConfiguration,
  keyof typeof scSelect
>;

export function formatSearchConfiguration(
  val: SearchConfiguration
): ExposedSearchConfiguration {
  return _.pick(val, _.keys(scSelect)) as ExposedSearchConfiguration;
}

export async function getSearchConfiguration(
  user: User,
  id: number
): Promise<SearchConfiguration | null> {
  // SearchConfiguration isn't actually joined to Project, so we check access
  // on the associated QueryTemplate.
  const sc = await prisma.searchConfiguration.findFirst({
    where: { queryTemplate: { project: userCanAccessProject(user) }, id },
  });
  return sc;
}

export async function getActiveSearchConfiguration(
  project: Project
): Promise<SearchConfiguration | null> {
  const sc = await prisma.searchConfiguration.findFirst({
    where: { queryTemplate: { projectId: project.id } },
    orderBy: [{ updatedAt: "desc" }],
  });
  return sc;
}
