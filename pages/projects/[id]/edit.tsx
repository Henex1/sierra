import * as React from "react";
import { useRouter } from "next/router";

import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

import Form from "../../../components/projects/Form";
import {
  authenticatedPage,
  requireNumberParam,
} from "../../../lib/pageHelpers";
import { apiRequest } from "../../../lib/api";
import {
  ExposedSearchEndpoint,
  listSearchEndpoints,
} from "../../../lib/searchendpoints";
import {
  userCanAccessProject,
  formatProject,
  getProject,
  ExposedProject,
} from "../../../lib/projects";

import Link from "../../../components/common/Link";
import BreadcrumbsButtons from "../../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const id = requireNumberParam(context, "id");
  const project = await getProject(context.user, id);
  const searchEndpoints = await listSearchEndpoints(context);

  if (!project) {
    return { notFound: true };
  }
  return {
    props: {
      project: formatProject(project),
      searchEndpoints,
    },
  };
});

type Props = {
  project: ExposedProject;
  searchEndpoints: ExposedSearchEndpoint[];
};

export default function EditProject({ project, searchEndpoints }: Props) {
  const router = useRouter();

  async function onSubmit(values: ExposedProject) {
    const { orgId, ...updateParams } = values;
    await apiRequest(`/api/projects/update`, {
      ...updateParams,
      id: project.id,
    });
    router.push("/projects");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  async function onDelete() {
    await apiRequest(`/api/projects/delete`, { id: project.id });
    router.push("/projects");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href={`/projects/${project.id}`}>{project.name}</Link>
        <Typography>Edit</Typography>
      </BreadcrumbsButtons>
      <Container maxWidth="sm">
        <Form
          endpoints={searchEndpoints}
          onSubmit={onSubmit}
          onDelete={onDelete}
          initialValues={project}
        />
      </Container>
    </div>
  );
}
