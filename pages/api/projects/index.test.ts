import prisma from "../../../lib/prisma";
import {
  handleCreateProject,
  handleUpdateProject,
  handleDeleteProject,
} from "./index";
import {
  getApiRoute,
  TEST_ORG_ID,
  TEST_SEARCHENDPOINT_ID,
} from "../../../lib/test";

describe("api/projects", () => {
  it("/create", async () => {
    const initialInfo = {
      name: "My Test Project",
      searchEndpointId: TEST_SEARCHENDPOINT_ID,
    };
    const { project } = await getApiRoute(handleCreateProject, initialInfo, {
      method: "POST",
    });
    expect(project).toHaveProperty("id");
    expect(project).toMatchObject(initialInfo);

    // Test actual underlying object
    const actual = await prisma.project.findUnique({
      where: { id: project.id },
    });
    expect(actual).toMatchObject(initialInfo);
  });

  it("/update name", async () => {
    const initialProject = await prisma.project.create({
      data: {
        orgId: TEST_ORG_ID,
        searchEndpointId: TEST_SEARCHENDPOINT_ID,
        name: "Initial Name",
      },
    });
    const newInfo = { id: initialProject.id, name: "Updated Name" };

    const { project } = await getApiRoute(handleUpdateProject, newInfo, {
      method: "POST",
    });
    expect(project.id).toBe(initialProject.id);
    expect(project).toMatchObject(newInfo);
  });

  it("/update searchEndpointId", async () => {
    const initialProject = await prisma.project.create({
      data: {
        orgId: TEST_ORG_ID,
        searchEndpointId: TEST_SEARCHENDPOINT_ID,
        name: "Initial Name",
      },
    });
    const newInfo = {
      id: initialProject.id,
      searchEndpointId: TEST_SEARCHENDPOINT_ID + 1,
    };

    const { project } = await getApiRoute(handleUpdateProject, newInfo, {
      method: "POST",
    });
    expect(project.id).toBe(initialProject.id);
    expect(project).toMatchObject(newInfo);
  });

  it("/delete", async () => {
    const initialProject = await prisma.project.create({
      data: {
        orgId: TEST_ORG_ID,
        searchEndpointId: TEST_SEARCHENDPOINT_ID,
        name: "Initial Name",
      },
    });

    const result = await getApiRoute(
      handleDeleteProject,
      { id: initialProject.id },
      { method: "POST" }
    );
    expect(result).toEqual({ success: true });
  });
});
