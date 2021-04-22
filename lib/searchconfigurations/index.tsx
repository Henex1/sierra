import prisma, { Project, SearchConfiguration } from "../prisma";

export async function getActiveSearchConfiguration(
  project: Project
): Promise<SearchConfiguration | null> {
  const configuration = await prisma.searchConfiguration.findFirst({
    where: { queryTemplate: { projectId: project.id } },
    orderBy: [{ updatedAt: "desc" }],
  });
  return configuration;
}
