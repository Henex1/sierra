import { mockModels } from "../../../lib/__mocks__/prisma";
import {
  handleCreateProject,
  handleUpdateProject,
  handleDeleteProject,
} from "./index";
import {
  getApiRoute,
  TEST_ORG,
  TEST_SEARCHENDPOINT,
  TEST_PROJECT,
} from "../../../lib/test";
import { defaultQueryTemplate } from "../../../lib/projects";

describe("api/projects", () => {
  it("/create", async () => {
    mockModels("org").action("findMany").with({}).resolvesTo([TEST_ORG]);
    mockModels("searchEndpoint")
      .action("findFirst")
      .with({ where: { AND: { id: TEST_SEARCHENDPOINT.id } } })
      .resolvesTo(TEST_SEARCHENDPOINT);
    const initialInfo = {
      name: "My Test Project",
      searchEndpointId: TEST_SEARCHENDPOINT.id,
    };
    mockModels("project")
      .action("create")
      .with({ data: initialInfo })
      .resolvesTo({ id: TEST_PROJECT.id, ...initialInfo });
    const defaultTemplate = {
      ...defaultQueryTemplate,
      projectId: TEST_PROJECT.id,
    };
    mockModels("queryTemplate")
      .action("create")
      .with({ data: defaultTemplate })
      .resolvesTo({ id: 43, ...defaultTemplate });
    const { project } = await getApiRoute(handleCreateProject, initialInfo, {
      method: "POST",
    });
    expect(project).toHaveProperty("id");
    expect(project).toMatchObject(initialInfo);
  });

  it("/update name", async () => {
    const initialProject = {
      id: TEST_PROJECT.id,
      orgId: TEST_ORG.id,
      searchEndpointId: TEST_SEARCHENDPOINT.id,
      name: "Initial Name",
    };
    mockModels("project")
      .action("findFirst")
      .with({ where: { AND: { id: TEST_PROJECT.id } } })
      .resolvesTo(initialProject);
    const newInfo = { id: initialProject.id, name: "Updated Name" };
    mockModels("project")
      .action("update")
      .with({ where: { id: TEST_PROJECT.id } })
      .resolvesTo({ ...initialProject, ...newInfo });

    const { project } = await getApiRoute(handleUpdateProject, newInfo, {
      method: "POST",
    });
    expect(project).toMatchObject(newInfo);
  });

  it("/update searchEndpointId", async () => {
    const initialProject = {
      id: TEST_PROJECT.id,
      orgId: TEST_ORG.id,
      searchEndpointId: TEST_SEARCHENDPOINT.id,
      name: "Initial Name",
    };
    mockModels("project")
      .action("findFirst")
      .with({ where: { AND: { id: TEST_PROJECT.id } } })
      .resolvesTo(initialProject);
    mockModels("searchEndpoint")
      .action("findFirst")
      .with({ where: { AND: { id: TEST_SEARCHENDPOINT.id + 1 } } })
      .resolvesTo(TEST_SEARCHENDPOINT);

    const newInfo = {
      id: initialProject.id,
      searchEndpointId: TEST_SEARCHENDPOINT.id + 1,
    };
    mockModels("project")
      .action("update")
      .with({ where: { id: TEST_PROJECT.id } })
      .resolvesTo({ ...initialProject, ...newInfo });

    const { project } = await getApiRoute(handleUpdateProject, newInfo, {
      method: "POST",
    });
    expect(project).toMatchObject(newInfo);
  });

  it("/delete", async () => {
    mockModels("project")
      .action("findFirst")
      .with({ where: { AND: { id: TEST_PROJECT.id } } })
      .resolvesTo({ id: TEST_PROJECT.id });
    mockModels("project")
      .action("delete")
      .with({ where: { id: TEST_PROJECT.id } })
      .resolvesTo({ id: TEST_PROJECT.id });

    const result = await getApiRoute(
      handleDeleteProject,
      { id: TEST_PROJECT.id },
      { method: "POST" }
    );
    expect(result).toEqual({ success: true });
  });
});
